
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ControllerSelector } from './ControllerSelector';
import { ActivityLogsModal } from './ActivityLogsModal';

interface DailyServiceNotesProps {
  selectedStation: string;
}

export const DailyServiceNotes = ({ selectedStation }: DailyServiceNotesProps) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedController, setSelectedController] = useState('');
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const { toast } = useToast();
  const today = new Date().toLocaleDateString('pt-BR');

  useEffect(() => {
    if (selectedStation) {
      loadTodaysNotes();
      setSelectedController(''); // Reset controller when station changes
    }
  }, [selectedStation]);

  // Auto-save when notes change
  useEffect(() => {
    if (notes.trim() === '' || !selectedStation) return;
    
    const saveTimeout = setTimeout(() => {
      saveNotes();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [notes, selectedStation]);

  const loadTodaysNotes = async () => {
    if (!selectedStation) return;

    try {
      const { data, error } = await supabase
        .from('daily_service_notes')
        .select('notes')
        .eq('date', new Date().toISOString().split('T')[0])
        .eq('station_id', selectedStation)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setNotes(data.notes);
      } else {
        setNotes('');
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const saveNotes = async () => {
    if (isLoading || !selectedStation) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('daily_service_notes')
        .upsert({
          notes,
          date: new Date().toISOString().split('T')[0],
          station_id: selectedStation,
          controller_id: selectedController || null,
          created_by: 'Sistema',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Log activity if controller is selected
      if (selectedController) {
        await logActivity('Anotação atualizada', 'Anotações de serviço diário foram modificadas');
      }
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar anotações automaticamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = async (action: string, details?: string) => {
    if (!selectedController || !selectedStation) return;

    try {
      await supabase
        .from('activity_logs')
        .insert({
          controller_id: selectedController,
          station_id: selectedStation,
          action,
          details
        });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  return (
    <>
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-200 py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
              <Calendar className="w-5 h-5" />
              Anotações de Serviço Diário - {today}
              {isLoading && <span className="text-xs text-gray-500">(Salvando...)</span>}
            </CardTitle>
            <ControllerSelector
              selectedStation={selectedStation}
              selectedController={selectedController}
              onControllerChange={setSelectedController}
              onActivityLogsClick={() => setShowActivityLogs(true)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Digite as anotações de serviço diário, eventos importantes, mudanças de turno, status de equipamentos, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] resize-none border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
            <div className="text-xs text-gray-500">
              As anotações são salvas automaticamente e vinculadas ao grupamento selecionado
            </div>
          </div>
        </CardContent>
      </Card>

      <ActivityLogsModal
        isOpen={showActivityLogs}
        onClose={() => setShowActivityLogs(false)}
        selectedStation={selectedStation}
      />
    </>
  );
};
