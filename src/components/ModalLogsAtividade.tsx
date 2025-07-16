
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogAtividade {
  id: string;
  acao: string;
  detalhes: string | null;
  criado_em: string | null;
  controladores?: { nome: string } | null;
}

interface ModalLogsAtividadeProps {
  estaAberto: boolean;
  aoFechar: () => void;
  grupamentoSelecionado: string;
}

export const ModalLogsAtividade = ({ estaAberto, aoFechar, grupamentoSelecionado }: ModalLogsAtividadeProps) => {
  console.log('ModalLogsAtividade component rendering...', { estaAberto, grupamentoSelecionado });
  const [logs, setLogs] = useState<LogAtividade[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);

  useEffect(() => {
    if (estaAberto && grupamentoSelecionado) {
      carregarLogs();
    }
  }, [estaAberto, grupamentoSelecionado]);

  const carregarLogs = async () => {
    setEstaCarregando(true);
    try {
      const { data, error } = await supabase
        .from('logs_atividade')
        .select(`
          *,
          controladores:controlador_id (nome)
        `)
        .eq('grupamento_id', grupamentoSelecionado)
        .gte('criado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setEstaCarregando(false);
    }
  };

  return (
    <Dialog open={estaAberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log de Atividades (Últimas 24h)</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96 w-full">
          {estaCarregando ? (
            <div className="text-center py-4">Carregando...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Nenhuma atividade registrada</div>
          ) : (
            <div className="space-y-2 pr-4">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <div className="font-medium">{log.acao}</div>
                      {log.detalhes && <div className="text-gray-600">{log.detalhes}</div>}
                      <div className="text-xs text-gray-500">
                        {log.controladores?.nome || 'Usuário desconhecido'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(log.criado_em || ''), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
