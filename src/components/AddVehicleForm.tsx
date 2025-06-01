
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type FireStation = Tables<'fire_stations'>;
type FireSubStation = Tables<'fire_sub_stations'>;

interface AddVehicleFormProps {
  onClose: () => void;
}

const categoryOptions = [
  { value: 'Engine', label: 'Autobomba' },
  { value: 'Ladder', label: 'Escada' },
  { value: 'Rescue', label: 'Resgate' },
  { value: 'Ambulance', label: 'Ambulância' },
  { value: 'Chief', label: 'Comando' },
  { value: 'Utility', label: 'Utilitário' }
];

export const AddVehicleForm = ({ onClose }: AddVehicleFormProps) => {
  const [formData, setFormData] = useState({
    prefix: '',
    vehicleType: '',
    category: '',
    stationId: '',
    subStationId: '',
    imageUrl: ''
  });
  const [stations, setStations] = useState<FireStation[]>([]);
  const [subStations, setSubStations] = useState<FireSubStation[]>([]);
  const [filteredSubStations, setFilteredSubStations] = useState<FireSubStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStations();
    loadSubStations();
  }, []);

  useEffect(() => {
    if (formData.stationId) {
      const filtered = subStations.filter(sub => sub.station_id === formData.stationId);
      setFilteredSubStations(filtered);
      // Reset sub-station selection when station changes
      if (formData.subStationId && !filtered.find(sub => sub.id === formData.subStationId)) {
        setFormData(prev => ({ ...prev, subStationId: '' }));
      }
    } else {
      setFilteredSubStations([]);
      setFormData(prev => ({ ...prev, subStationId: '' }));
    }
  }, [formData.stationId, subStations]);

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

  const loadSubStations = async () => {
    try {
      const { data, error } = await supabase
        .from('fire_sub_stations')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubStations(data || []);
    } catch (error) {
      console.error('Erro ao carregar subgrupamentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prefix || !formData.vehicleType || !formData.category || !formData.stationId) {
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
        .insert({
          prefix: formData.prefix,
          vehicle_type: formData.vehicleType,
          category: formData.category as any,
          station_id: formData.stationId,
          sub_station_id: formData.subStationId || null,
          image_url: formData.imageUrl || null,
          status: 'Available'
        });

      if (error) throw error;

      toast({
        title: "Viatura Adicionada",
        description: `Viatura ${formData.prefix} foi adicionada com sucesso.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar viatura. Verifique se o prefixo não está duplicado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Viatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prefix">Prefixo *</Label>
              <Input
                id="prefix"
                value={formData.prefix}
                onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                placeholder="Ex: AB-01"
                required
              />
            </div>
            <div>
              <Label htmlFor="vehicleType">Modalidade de Viatura *</Label>
              <Input
                id="vehicleType"
                value={formData.vehicleType}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                placeholder="Ex: Scania, Mercedes"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Subgrupamento *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o subgrupamento" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stationId">Grupamento *</Label>
            <Select value={formData.stationId} onValueChange={(value) => setFormData(prev => ({ ...prev, stationId: value }))}>
              <SelectTrigger>
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
            <Label htmlFor="subStationId">Estação</Label>
            <Select 
              value={formData.subStationId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, subStationId: value }))}
              disabled={!formData.stationId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.stationId ? "Selecione a estação" : "Selecione primeiro o grupamento"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubStations.map((subStation) => (
                  <SelectItem key={subStation.id} value={subStation.id}>
                    {subStation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="imageUrl">URL do Ícone</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://exemplo.com/icone.png"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar Viatura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
