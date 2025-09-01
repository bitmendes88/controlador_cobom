import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinhaViaturaEstacao } from '@/components/LinhaViaturaEstacao';
import { VehicleDetailModal } from '@/components/VehicleDetailModal';
import { FormularioEditarViatura } from '@/components/FormularioEditarViatura';
import { EstacaoDetailModal } from '@/components/EstacaoDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Viatura {
  id: string;
  prefixo: string;
  status: string;
  status_alterado_em?: string;
  qsa_radio?: number;
  qsa_zello?: number;
  dejem?: boolean;
  modalidade: {
    id: string;
    nome: string;
    icone_url: string;
  };
  estacao: {
    id: string;
    nome: string;
    endereco?: string;
    telegrafista?: string;
    qsa_radio?: number;
    qsa_zello?: number;
    telefone?: string;
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
  endereco?: string;
  telegrafista?: string;
  qsa_radio?: number;
  qsa_zello?: number;
  telefone?: string;
  subgrupamento: {
    id: string;
    nome: string;
  };
}

interface PainelFrotaProps {
  grupamentoSelecionado: string;
  controladorSelecionado?: string;
  termoPesquisa?: string;
  bloqueado?: boolean;
}

export const PainelFrota = ({ grupamentoSelecionado, controladorSelecionado, termoPesquisa = '', bloqueado = false }: PainelFrotaProps) => {
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [viaturaSelecionada, setViaturaSelecionada] = useState<Viatura | null>(null);
  const [viaturaEditando, setViaturaEditando] = useState<Viatura | null>(null);
  const [estacaoEditando, setEstacaoEditando] = useState<Estacao | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [observacoesViaturas, setObservacoesViaturas] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (grupamentoSelecionado) {
      carregarViaturas();
      
      // Configurar real-time updates
      const channel = supabase
        .channel('viaturas-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'viaturas'
          },
          (payload) => {
            console.log('Mudança nas viaturas:', payload);
            carregarViaturas();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'observacoes_viatura'
          },
          (payload) => {
            console.log('Mudança nas observações:', payload);
            carregarObservacoes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
            id, nome, endereco, telegrafista, qsa_radio, qsa_zello, telefone,
            subgrupamento:subgrupamentos(
              id, nome, grupamento_id
            )
          )
        `)
        .eq('estacao.subgrupamento.grupamento_id', grupamentoSelecionado)
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

  const aoClicarEstacao = (estacao: Estacao) => {
    setEstacaoEditando(estacao);
  };

  const aoAtualizarStatus = async (viaturaId: string, novoStatus: string) => {
    if (bloqueado) {
      toast({
        title: "Acesso Negado",
        description: "Selecione um controlador para realizar alterações nas viaturas.",
        variant: "destructive",
      });
      return;
    }

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
    if (bloqueado) {
      toast({
        title: "Acesso Negado",
        description: "Selecione um controlador para realizar alterações nas viaturas.",
        variant: "destructive",
      });
      return;
    }

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

  const filtrarViaturas = (viaturas: Viatura[]) => {
    if (!termoPesquisa.trim()) return viaturas;
    
    const termo = termoPesquisa.toLowerCase();
    return viaturas.filter(viatura => 
      viatura.prefixo.toLowerCase().includes(termo) ||
      viatura.modalidade?.nome.toLowerCase().includes(termo) ||
      viatura.status.toLowerCase().includes(termo) ||
      viatura.estacao?.nome.toLowerCase().includes(termo) ||
      observacoesViaturas[viatura.id]?.toLowerCase().includes(termo)
    );
  };

  const coresSubgrupamento = [
    'from-red-50 via-red-100 to-red-50 border-red-200',
    'from-blue-50 via-blue-100 to-blue-50 border-blue-200',
    'from-green-50 via-green-100 to-green-50 border-green-200',
    'from-purple-50 via-purple-100 to-purple-50 border-purple-200',
    'from-orange-50 via-orange-100 to-orange-50 border-orange-200',
    'from-indigo-50 via-indigo-100 to-indigo-50 border-indigo-200',
    'from-teal-50 via-teal-100 to-teal-50 border-teal-200',
    'from-pink-50 via-pink-100 to-pink-50 border-pink-200',
  ];

  const coresTituloSubgrupamento = [
    'text-red-800',
    'text-blue-800',
    'text-green-800',
    'text-purple-800',
    'text-orange-800',
    'text-indigo-800',
    'text-teal-800',
    'text-pink-800',
  ];

  const viaturasValidas = viaturas.filter(viatura => 
    viatura.estacao && 
    viatura.estacao.subgrupamento && 
    viatura.estacao.subgrupamento.id &&
    viatura.estacao.id
  );

  const viaturasFiltradasPorPesquisa = filtrarViaturas(viaturasValidas);

  const dadosAgrupados = viaturasFiltradasPorPesquisa.reduce((acc, viatura) => {
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

  const ordenarEstacoesPorNome = (estacoes: Record<string, { dados: any; viaturas: Viatura[] }>) => {
    return Object.entries(estacoes).sort(([, a], [, b]) => {
      return a.dados.nome.localeCompare(b.dados.nome);
    });
  };

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

  if (bloqueado) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-800 font-semibold mb-2">Controlador Necessário</div>
          <div className="text-yellow-700">
            Selecione um controlador para visualizar e gerenciar as viaturas
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subgrupamentosOrdenados.map((subgrupamentoId, index) => {
        const estacoesOrdenadas = ordenarEstacoesPorNome(dadosAgrupados[subgrupamentoId].estacoes);
        const corIndex = index % coresSubgrupamento.length;
        
        return (
          <Card key={subgrupamentoId} className={`border-2 ${coresSubgrupamento[corIndex].split(' ')[2]} shadow-xl hover:shadow-2xl transition-all duration-300`}
                style={{
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
            <CardHeader className={`bg-gradient-to-r ${coresSubgrupamento[corIndex]} border-b-2 py-2`}
                        style={{
                          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.1)'
                        }}>
              <CardTitle 
                className={`${coresTituloSubgrupamento[corIndex]} text-2xl font-bold tracking-wide`}
                style={{
                  textShadow: '3px 3px 8px rgba(0,0,0,0.15), 0 2px 6px rgba(255,255,255,0.8)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              >
                {dadosAgrupados[subgrupamentoId].nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3"
                          style={{
                            background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
                          }}>
              <div className="space-y-1">
                {estacoesOrdenadas.map(([estacaoId, { dados, viaturas }], index) => {
                  const viaturasOrdenadas = ordenarViaturasPorPrefixo(viaturas);
                  
                  return (
                    <div key={estacaoId}>
                      <LinhaViaturaEstacao
                        estacao={dados as Estacao}
                        viaturas={viaturasOrdenadas}
                        aoClicarViatura={aoClicarViatura}
                        aoClicarEstacao={aoClicarEstacao}
                        aoAtualizarStatus={aoAtualizarStatus}
                        observacoesViaturas={observacoesViaturas}
                      />
                      {index < estacoesOrdenadas.length - 1 && (
                        <hr className="border-gray-300 my-2 shadow-sm" 
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

      {estacaoEditando && (
        <EstacaoDetailModal
          estacao={estacaoEditando}
          onClose={() => setEstacaoEditando(null)}
          onEstacaoUpdated={carregarViaturas}
        />
      )}
    </div>
  );
};
