
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Save, History } from 'lucide-react';
import { ModalLogsAtividade } from './ModalLogsAtividade';

interface AnotacoesServicoProps {
  grupamentoSelecionado: string;
  controladorSelecionado?: string;
}

export const AnotacoesServicoDaily = ({ grupamentoSelecionado, controladorSelecionado }: AnotacoesServicoProps) => {
  const [anotacoes, setAnotacoes] = useState('');
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [mostrarLogs, setMostrarLogs] = useState(false);
  const { toast } = useToast();

  const hoje = new Date().toLocaleDateString('pt-BR');

  useEffect(() => {
    if (grupamentoSelecionado) {
      carregarAnotacoes();
    }
  }, [grupamentoSelecionado]);

  const carregarAnotacoes = async () => {
    if (!grupamentoSelecionado) return;

    try {
      const { data, error } = await supabase
        .from('anotacoes_servico')
        .select('anotacoes')
        .eq('grupamento_id', grupamentoSelecionado)
        .eq('data', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAnotacoes(data?.anotacoes || '');
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const salvarAnotacoes = async () => {
    if (!grupamentoSelecionado || !anotacoes.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma anotação antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setEstaSalvando(true);
    try {
      const dataHoje = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('anotacoes_servico')
        .upsert({
          grupamento_id: grupamentoSelecionado,
          controlador_id: controladorSelecionado || null,
          anotacoes: anotacoes.trim(),
          data: dataHoje,
          atualizado_em: new Date().toISOString()
        }, {
          onConflict: 'grupamento_id,data'
        });

      if (error) throw error;

      if (controladorSelecionado) {
        await supabase
          .from('logs_atividade')
          .insert({
            controlador_id: controladorSelecionado,
            grupamento_id: grupamentoSelecionado,
            acao: 'Anotação de serviço atualizada',
            detalhes: `Data: ${hoje}`
          });
      }

      toast({
        title: "Sucesso",
        description: "Anotações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar anotações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEstaSalvando(false);
    }
  };

  if (!grupamentoSelecionado) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            Selecione um grupamento para visualizar as anotações
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-200 py-3">
          <CardTitle className="text-red-800 text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Anotações do Serviço - {hoje}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarLogs(true)}
              className="ml-auto text-red-700 border-red-300 hover:bg-red-50"
            >
              <History className="w-4 h-4 mr-1" />
              Ver Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Textarea
              value={anotacoes}
              onChange={(e) => setAnotacoes(e.target.value)}
              placeholder="Digite as observações, ocorrências e informações importantes do serviço de hoje..."
              className="min-h-24 border-red-300 focus:border-red-500 resize-none"
              rows={4}
            />
            <div className="flex justify-end">
              <Button 
                onClick={salvarAnotacoes}
                disabled={estaSalvando || !anotacoes.trim()}
                className="bg-red-800 hover:bg-red-900 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                {estaSalvando ? 'Salvando...' : 'Salvar Anotações'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModalLogsAtividade
        estaAberto={mostrarLogs}
        aoFechar={() => setMostrarLogs(false)}
        grupamentoSelecionado={grupamentoSelecionado}
      />
    </>
  );
};
