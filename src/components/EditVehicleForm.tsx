
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type FireStation = Tables<'fire_stations'>;
type FireSubStation = Tables<'fire_sub_stations'>;

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onClose: () => void;
  onVehicleUpdated: () => void;
}

export const EditVehicleForm = ({ vehicle, onClose, onVehicleUpdated }: EditVehicleFormProps) => {
  const [formData, setFormData] = useState({
    prefix: vehicle.prefix || '',
    category: vehicle.category || '',
    vehicle_type: vehicle.vehicle_type || '',
    station_id: vehicle.station_id || '',
    sub_station_id: vehicle.sub_station_id || '',
    image_url: vehicle.image_url || ''
  });
  const [stations, setStations] = useState<FireStation[]>([]);
  const [subStations, setSubStations] = useState<FireSubStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = ['Autobomba', 'Escada', 'Resgate', 'Ambulância', 'Comando', 'Utilitário'];

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (formData.station_id) {
      loadSubStations(formData.station_id);
    }
  }, [formData.station_id]);

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('fire_stations')
        .select('*')
        .order('name');

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupamentos:', error);
    }
  };

  const loadSubStations = async (stationId: string) => {
    try {
      const { data, error } = await supabase
        .from('fire_sub_stations')
        .select('*')
        .eq('station_id', stationId)
        .order('name');

      if (error) throw error;
      setSubStations(data || []);
    } catch (error) {
      console.error('Erro ao carregar estações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prefix || !formData.category || !formData.vehicle_type || !formData.station_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          prefix: formData.prefix,
          category: formData.category as any,
          vehicle_type: formData.vehicle_type,
          station_id: formData.station_id,
          sub_station_id: formData.sub_station_id || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicle.id);

      if (error) throw error;

      toast({
        title: "Viatura Atualizada",
        description: `${formData.prefix} foi atualizada com sucesso.`,
      });
      
      onVehicleUpdated();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar viatura:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar viatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800">
            <Edit className="w-5 h-5" />
            Editar Viatura {vehicle.prefix}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prefix">Prefixo da Unidade *</Label>
              <Input
                id="prefix"
                placeholder="ex: AB-2, AE-3, UR-1"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="border-red-300 focus:border-red-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Subgrupamento *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="border-red-300 focus:border-red-500">
                  <SelectValue placeholder="Selecione o subgrupamento" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="vehicle_type">Tipo de Viatura *</Label>
            <Input
              id="vehicle_type"
              placeholder="ex: Autobomba, Escada Mecânica, Resgate Pesado"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="border-red-300 focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="station_id">Grupamento *</Label>
              <Select 
                value={formData.station_id} 
                onValueChange={(value) => setFormData({ ...formData, station_id: value, sub_station_id: '' })}
              >
                <SelectTrigger className="border-red-300 focus:border-red-500">
                  <SelectValue placeholder="Selecione o grupamento" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sub_station_id">Estação</Label>
              <Select 
                value={formData.sub_station_id} 
                onValueChange={(value) => setFormData({ ...formData, sub_station_id: value })}
                disabled={!formData.station_id}
              >
                <SelectTrigger className="border-red-300 focus:border-red-500">
                  <SelectValue placeholder="Selecione a estação" />
                </SelectTrigger>
                <SelectContent>
                  {subStations.map((subStation) => (
                    <SelectItem key={subStation.id} value={subStation.id}>
                      {subStation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">Ícone da Viatura (URL da Imagem PNG)</Label>
            <Input
              id="image_url"
              placeholder="https://exemplo.com/icone-viatura.png"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="border-red-300 focus:border-red-500"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-red-800 hover:bg-red-900 text-white"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
