
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnotacoesServicoProps {
  grupamentoSelecionado: string;
  controladorSelecionado?: string;
}

export const AnotacoesServicoDaily = ({ grupamentoSelecionado, controladorSelecionado }: AnotacoesServicoProps) => {
  const [anotacoes, setAnotacoes] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [registroId, setRegistroId] = useState<string | null>(null);
  const { toast } = useToast();

  const dataHoje = new Date().toLocaleDateString('pt-BR');

  // Função debounced para salvamento automático
  const salvarAnotacoes = useCallback(
    async (novasAnotacoes: string) => {
      if (!grupamentoSelecionado) return;

      try {
        const dadosAnotacao = {
          grupamento_id: grupamentoSelecionado,
          controlador_id: controladorSelecionado || null,
          anotacoes: novasAnotacoes,
          data: new Date().toISOString().split('T')[0],
          criado_por: controladorSelecionado ? 'Sistema' : 'Anônimo',
          atualizado_em: new Date().toISOString()
        };

        if (registroId) {
          // Atualizar registro existente
          const { error } = await supabase
            .from('anotacoes_servico')
            .update(dadosAnotacao)
            .eq('id', registroId);

          if (error) throw error;
        } else {
          // Criar novo registro
          const { data, error } = await supabase
            .from('anotacoes_servico')
            .insert(dadosAnotacao)
            .select()
            .single();

          if (error) throw error;
          setRegistroId(data.id);
        }

        // Não mostrar toast a cada salvamento automático
        console.log('Anotações salvas automaticamente');
      } catch (error) {
        console.error('Erro ao salvar anotações:', error);
        toast({
          title: "Erro",
          description: "Falha ao salvar anotações automaticamente.",
          variant: "destructive",
        });
      }
    },
    [grupamentoSelecionado, controladorSelecionado, registroId, toast]
  );

  // Debounce para salvamento automático após 2 segundos de inatividade
  useEffect(() => {
    if (!anotacoes.trim()) return;

    const timeoutId = setTimeout(() => {
      salvarAnotacoes(anotacoes);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [anotacoes, salvarAnotacoes]);

  useEffect(() => {
    if (grupamentoSelecionado) {
      carregarAnotacoes();
    }
  }, [grupamentoSelecionado]);

  const carregarAnotacoes = async () => {
    if (!grupamentoSelecionado) return;

    try {
      const dataHoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('anotacoes_servico')
        .select('*')
        .eq('grupamento_id', grupamentoSelecionado)
        .eq('data', dataHoje)
        .order('atualizado_em', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setAnotacoes(data[0].anotacoes);
        setRegistroId(data[0].id);
      } else {
        setAnotacoes('');
        setRegistroId(null);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar anotações do dia.",
        variant: "destructive",
      });
    } finally {
      setEstaCarregando(false);
    }
  };

  if (!grupamentoSelecionado) {
    return (
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-200 py-2">
          <CardTitle className="text-red-800 text-sm">Anotações do Serviço - {dataHoje}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            Selecione um grupamento para visualizar as anotações
          </div>
        </CardContent>
      </Card>
    );
  }

  if (estaCarregando) {
    return (
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-200 py-2">
          <CardTitle className="text-red-800 text-sm">Anotações do Serviço - {dataHoje}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center">Carregando anotações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 shadow-lg">
      <CardHeader className="bg-red-50 border-b border-red-200 py-2">
        <CardTitle className="text-red-800 text-sm">
          Anotações do Serviço - {dataHoje}
          <span className="text-xs text-gray-600 ml-2 font-normal">
            (Salvamento automático ativado)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Textarea
          value={anotacoes}
          onChange={(e) => setAnotacoes(e.target.value)}
          placeholder="Digite as anotações do serviço do dia..."
          className="min-h-32 resize-none border-red-200 focus:border-red-500"
        />
      </CardContent>
    </Card>
  );
};
