
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type ActivityLog = Tables<'activity_logs'> & {
  controllers?: { name: string } | null;
};

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStation: string;
}

export const ActivityLogsModal = ({ isOpen, onClose, selectedStation }: ActivityLogsModalProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedStation) {
      loadLogs();
    }
  }, [isOpen, selectedStation]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          controllers:controller_id (name)
        `)
        .eq('station_id', selectedStation)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log de Atividades (Últimas 24h)</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96 w-full">
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Nenhuma atividade registrada</div>
          ) : (
            <div className="space-y-2 pr-4">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      {log.details && <div className="text-gray-600">{log.details}</div>}
                      <div className="text-xs text-gray-500">
                        {log.controllers?.name || 'Usuário desconhecido'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(log.created_at || ''), { 
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
