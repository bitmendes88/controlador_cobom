
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Controller = Tables<'controllers'>;

interface ControllerSelectorProps {
  selectedStation: string;
  selectedController: string;
  onControllerChange: (controllerId: string) => void;
  onActivityLogsClick: () => void;
}

export const ControllerSelector = ({ 
  selectedStation, 
  selectedController, 
  onControllerChange,
  onActivityLogsClick 
}: ControllerSelectorProps) => {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [showAddController, setShowAddController] = useState(false);
  const [newControllerName, setNewControllerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedStation) {
      loadControllers();
    }
  }, [selectedStation]);

  const loadControllers = async () => {
    try {
      const { data, error } = await supabase
        .from('controllers')
        .select('*')
        .eq('station_id', selectedStation)
        .order('name');

      if (error) throw error;
      setControllers(data || []);
    } catch (error) {
      console.error('Erro ao carregar controladores:', error);
    }
  };

  const handleAddController = async () => {
    if (!newControllerName.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('controllers')
        .insert({
          name: newControllerName.trim(),
          station_id: selectedStation
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Controlador Adicionado",
        description: `Controlador ${newControllerName} foi adicionado com sucesso.`,
      });

      setNewControllerName('');
      setShowAddController(false);
      loadControllers();
    } catch (error) {
      console.error('Erro ao adicionar controlador:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar controlador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedController} onValueChange={onControllerChange}>
        <SelectTrigger className="w-48 h-8 text-sm">
          <SelectValue placeholder="Selecionar controlador" />
        </SelectTrigger>
        <SelectContent>
          {controllers.map((controller) => (
            <SelectItem key={controller.id} value={controller.id}>
              {controller.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showAddController} onOpenChange={setShowAddController}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 px-2">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Controlador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="controllerName">Nome do Controlador</Label>
              <Input
                id="controllerName"
                value={newControllerName}
                onChange={(e) => setNewControllerName(e.target.value)}
                placeholder="Digite o nome do controlador"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddController(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddController} disabled={isLoading || !newControllerName.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        size="sm" 
        variant="outline" 
        onClick={onActivityLogsClick}
        className="h-8 px-2"
      >
        <Users className="w-4 h-4" />
      </Button>
    </div>
  );
};
