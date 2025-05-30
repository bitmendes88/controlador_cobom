
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DailyServiceNotes = () => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const today = new Date().toLocaleDateString('pt-BR');

  useEffect(() => {
    loadTodaysNotes();
  }, []);

  const loadTodaysNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_service_notes')
        .select('notes')
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const saveNotes = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('daily_service_notes')
        .upsert({
          notes,
          date: new Date().toISOString().split('T')[0],
          created_by: 'Usuário Atual',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Anotações Salvas",
        description: "As anotações de serviço diário foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar anotações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-red-200 shadow-lg">
      <CardHeader className="bg-red-50 border-b border-red-200">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Calendar className="w-5 h-5" />
          Anotações de Serviço Diário - {today}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Digite as anotações de serviço diário, eventos importantes, mudanças de turno, status de equipamentos, etc..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] resize-none border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
          <div className="flex justify-end">
            <Button 
              onClick={saveNotes}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Anotações'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
