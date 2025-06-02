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
        .order('prefixo'); // Ordem fixa por prefixo

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

  // Subgrupamentos em ordem crescente
  const subgrupamentosOrdenados = Object.keys(dadosAgrupados).sort((a, b) => {
    return dadosAgrupados[a].nome.localeCompare(dadosAgrupados[b].nome);
  });

  // Função para ordenar estações por nome (ordem fixa)
  const ordenarEstacoesPorNome = (estacoes: Record<string, { dados: any; viaturas: Viatura[] }>) => {
    return Object.entries(estacoes).sort(([, a], [, b]) => {
      return a.dados.nome.localeCompare(b.dados.nome);
    });
  };

  // Função para manter ordem fixa das viaturas por prefixo
  const ordenarViaturasPorPrefixo = (viaturas: Viatura[]) => {
    return [...viaturas].sort((a, b) => a.prefixo.localeCompare(b.prefixo));
  };

  if (estaCarregando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando dados da frota...</p>
        </div>
      </div>
    );
  }

  if (!grupamentoSelecionado) {
    return (
      <div className="text-center py-8 text-gray-600">
        Selecione um grupamento para visualizar as viaturas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subgrupamentosOrdenados.map((subgrupamentoId) => {
        const estacoesOrdenadas = ordenarEstacoesPorNome(dadosAgrupados[subgrupamentoId].estacoes);
        
        return (
          <Card key={subgrupamentoId} className="border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 4px 15px rgba(0,0,0,0.1)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
            <CardHeader className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-b-2 border-red-200 py-4"
                        style={{
                          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.1)'
                        }}>
              <CardTitle 
                className="text-red-800 text-xl font-bold tracking-wide"
                style={{
                  textShadow: '2px 2px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(255,255,255,0.8)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              >
                {dadosAgrupados[subgrupamentoId].nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6"
                          style={{
                            background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
                          }}>
              <div className="space-y-4">
                {estacoesOrdenadas.map(([estacaoId, { dados, viaturas }], index) => {
                  const viaturasOrdenadas = ordenarViaturasPorPrefixo(viaturas);
                  
                  return (
                    <div key={estacaoId}>
                      <LinhaViaturaEstacao
                        estacao={{ id: estacaoId, nome: dados.nome } as Estacao}
                        viaturas={viaturasOrdenadas}
                        aoClicarViatura={aoClicarViatura}
                        aoAtualizarStatus={aoAtualizarStatus}
                        observacoesViaturas={observacoesViaturas}
                      />
                      {index < estacoesOrdenadas.length - 1 && (
                        <hr className="border-gray-300 my-4 shadow-sm" 
                            style={{ 
                              borderTop: '1px solid #e5e7eb',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                            }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

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
