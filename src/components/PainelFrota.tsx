import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinhaViaturaEstacao } from '@/components/LinhaViaturaEstacao';
import { VehicleDetailModal } from '@/components/VehicleDetailModal';
import { FormularioEditarViatura } from '@/components/FormularioEditarViatura';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Viatura {
  id: string;
  prefixo: string;
  status: string;
  status_alterado_em?: string;
  modalidade: {
    id: string;
    nome: string;
    icone_url: string;
  };
  estacao: {
    id: string;
    nome: string;
    subgrupamento: {
      id: string;
      nome: string;
      grupamento_id: string;
    };
  } | null;
}

interface Estacao {
  id: string;
  nome: string;
  subgrupamento: {
    id: string;
    nome: string;
  };
}

interface PainelFrotaProps {
  grupamentoSelecionado: string;
  controladorSelecionado?: string;
}

export const PainelFrota = ({ grupamentoSelecionado, controladorSelecionado }: PainelFrotaProps) => {
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [viaturaSelecionada, setViaturaSelecionada] = useState<Viatura | null>(null);
  const [viaturaEditando, setViaturaEditando] = useState<Viatura | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [observacoesViaturas, setObservacoesViaturas] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (grupamentoSelecionado) {
      carregarViaturas();
    }
  }, [grupamentoSelecionado]);

  useEffect(() => {
    carregarObservacoes();
  }, [viaturas]);

  const carregarViaturas = async () => {
    if (!grupamentoSelecionado) return;

    try {
      const { data, error } = await supabase
        .from('viaturas')
        .select(`
          *,
          modalidade:modalidades_viatura(id, nome, icone_url),
          estacao:estacoes(
            id, nome,
            subgrupamento:subgrupamentos(
              id, nome, grupamento_id
            )
          )
        `)
        .eq('estacao.subgrupamento.grupamento_id', grupamentoSelecionado)
        .order('status')
        .order('prefixo');

      if (error) throw error;
      setViaturas(data || []);
    } catch (error) {
      console.error('Erro ao carregar viaturas:', error);
    } finally {
      setEstaCarregando(false);
    }
  };

  const carregarObservacoes = async () => {
    try {
      const viaturaIds = viaturas.map(v => v.id);
      if (viaturaIds.length === 0) return;

      const { data, error } = await supabase
        .from('observacoes_viatura')
        .select('viatura_id, observacao')
        .in('viatura_id', viaturaIds)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const mapObservacoes: Record<string, string> = {};
      data?.forEach(obs => {
        if (!mapObservacoes[obs.viatura_id]) {
          mapObservacoes[obs.viatura_id] = obs.observacao;
        }
      });
      setObservacoesViaturas(mapObservacoes);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
    }
  };

  const registrarLog = async (acao: string, detalhes?: string) => {
    if (!controladorSelecionado || !grupamentoSelecionado) return;

    try {
      await supabase
        .from('logs_atividade')
        .insert({
          controlador_id: controladorSelecionado,
          grupamento_id: grupamentoSelecionado,
          acao,
          detalhes
        });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  const aoClicarViatura = (viatura: Viatura) => {
    setViaturaSelecionada(viatura);
  };

  const aoEditarViatura = (viatura: Viatura) => {
    setViaturaEditando(viatura);
  };

  const aoAtualizarStatus = async (viaturaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('viaturas')
        .update({ 
          status: novoStatus,
          status_alterado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', viaturaId);

      if (error) throw error;
      
      const viatura = viaturas.find(v => v.id === viaturaId);
      await registrarLog('Status alterado', `Viatura ${viatura?.prefixo} - ${novoStatus}`);
      
      toast({
        title: "Status Atualizado",
        description: `Status da viatura alterado para ${novoStatus}`,
      });
      
      carregarViaturas();
    } catch (error) {
      console.error('Erro ao atualizar status da viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status da viatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const aoAcaoViatura = async (viaturaId: string, acao: 'baixar' | 'reserva' | 'levantar') => {
    try {
      let dadosAtualizacao: any = {
        status_alterado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };

      switch (acao) {
        case 'baixar':
          dadosAtualizacao.status = 'BAIXADO';
          break;
        case 'reserva':
          dadosAtualizacao.status = 'RESERVA';
          break;
        case 'levantar':
          dadosAtualizacao.status = 'DISPONÍVEL';
          break;
      }

      const { error } = await supabase
        .from('viaturas')
        .update(dadosAtualizacao)
        .eq('id', viaturaId);

      if (error) throw error;
      
      const mensagensAcao = {
        'baixar': 'Viatura baixada com sucesso',
        'reserva': 'Viatura colocada em reserva',
        'levantar': 'Viatura levantada e disponibilizada'
      };

      const viatura = viaturas.find(v => v.id === viaturaId);
      await registrarLog(mensagensAcao[acao], `Viatura ${viatura?.prefixo}`);

      toast({
        title: "Ação Realizada",
        description: mensagensAcao[acao],
      });
      
      setViaturaSelecionada(null);
      carregarViaturas();
    } catch (error) {
      console.error('Erro ao atualizar viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar ação na viatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const aoExcluirViatura = async (viaturaId: string) => {
    carregarViaturas();
  };

  // Filter vehicles that have valid station and subgrupamento data
  const viaturasValidas = viaturas.filter(viatura => 
    viatura.estacao && 
    viatura.estacao.subgrupamento && 
    viatura.estacao.subgrupamento.id &&
    viatura.estacao.id
  );

  // Agrupar viaturas por subgrupamento e depois por estação
  const dadosAgrupados = viaturasValidas.reduce((acc, viatura) => {
    // Add safety checks since we've already filtered above, but keeping for extra safety
    if (!viatura.estacao || !viatura.estacao.subgrupamento) {
      return acc;
    }

    const subgrupamentoId = viatura.estacao.subgrupamento.id;
    const subgrupamentoNome = viatura.estacao.subgrupamento.nome;
    
    if (!acc[subgrupamentoId]) {
      acc[subgrupamentoId] = {
        nome: subgrupamentoNome,
        estacoes: {}
      };
    }

    const estacaoId = viatura.estacao.id;
    if (!acc[subgrupamentoId].estacoes[estacaoId]) {
      acc[subgrupamentoId].estacoes[estacaoId] = {
        dados: viatura.estacao,
        viaturas: []
      };
    }

    acc[subgrupamentoId].estacoes[estacaoId].viaturas.push(viatura);
    return acc;
  }, {} as Record<string, { nome: string; estacoes: Record<string, { dados: any; viaturas: Viatura[] }> }>);

  const subgrupamentosOrdenados = Object.keys(dadosAgrupados).sort((a, b) => {
    return dadosAgrupados[a].nome.localeCompare(dadosAgrupados[b].nome);
  });

  const ordenarViaturasPorStatus = (viaturas: Viatura[]) => {
    return viaturas.sort((a, b) => {
      const ordemStatus = { 'BAIXADO': 2, 'RESERVA': 1 };
      const ordemA = ordemStatus[a.status as keyof typeof ordemStatus] || 0;
      const ordemB = ordemStatus[b.status as keyof typeof ordemStatus] || 0;
      return ordemA - ordemB;
    });
  };

  if (estaCarregando) {
    return <div className="text-center py-4">Carregando dados da frota...</div>;
  }

  if (!grupamentoSelecionado) {
    return <div className="text-center py-4">Selecione um grupamento para visualizar as viaturas</div>;
  }

  return (
    <div className="space-y-3">
      {subgrupamentosOrdenados.map((subgrupamentoId) => (
        <Card key={subgrupamentoId} className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-200 py-2">
            <CardTitle className="text-red-800 text-sm">{dadosAgrupados[subgrupamentoId].nome}</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-1">
              {Object.entries(dadosAgrupados[subgrupamentoId].estacoes).map(([estacaoId, { dados, viaturas }], index) => {
                const viatturasOrdenadas = ordenarViaturasPorStatus(viaturas);
                
                return (
                  <div key={estacaoId}>
                    <LinhaViaturaEstacao
                      estacao={{ id: estacaoId, nome: dados.nome } as Estacao}
                      viaturas={viatturasOrdenadas}
                      aoClicarViatura={aoClicarViatura}
                      aoAtualizarStatus={aoAtualizarStatus}
                      observacoesViaturas={observacoesViaturas}
                    />
                    {index < Object.keys(dadosAgrupados[subgrupamentoId].estacoes).length - 1 && (
                      <hr className="border-gray-200 my-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {viaturaSelecionada && viaturaSelecionada.estacao && (
        <VehicleDetailModal
          vehicle={{
            id: viaturaSelecionada.id,
            prefix: viaturaSelecionada.prefixo,
            status: viaturaSelecionada.status,
            category: 'Engine',
            station_id: viaturaSelecionada.estacao.id,
            sub_station_id: viaturaSelecionada.estacao.subgrupamento?.id || '',
            vehicle_type: viaturaSelecionada.modalidade.nome,
            image_url: viaturaSelecionada.modalidade.icone_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status_changed_at: viaturaSelecionada.status_alterado_em || new Date().toISOString()
          }}
          onClose={() => setViaturaSelecionada(null)}
          onVehicleAction={(vehicleId: string, action: 'RESERVA' | 'BAIXAR' | 'LEVANTAR') => {
            // Convert English actions to Portuguese
            const actionMap = {
              'RESERVA': 'reserva',
              'BAIXAR': 'baixar', 
              'LEVANTAR': 'levantar'
            };
            aoAcaoViatura(vehicleId, actionMap[action] as 'baixar' | 'reserva' | 'levantar');
          }}
          onVehicleDelete={aoExcluirViatura}
          onEditVehicle={aoEditarViatura}
        />
      )}

      {viaturaEditando && (
        <FormularioEditarViatura
          vehicle={viaturaEditando}
          onClose={() => setViaturaEditando(null)}
          onVehicleUpdated={carregarViaturas}
        />
      )}
    </div>
  );
};
