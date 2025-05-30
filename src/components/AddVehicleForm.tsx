
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddVehicleFormProps {
  onClose: () => void;
}

export const AddVehicleForm = ({ onClose }: AddVehicleFormProps) => {
  const [formData, setFormData] = useState({
    prefix: '',
    category: '',
    vehicle_type: '',
    station_id: '',
    image_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = ['Autobomba', 'Escada', 'Resgate', 'Ambulância', 'Comando', 'Utilitário'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prefix || !formData.category || !formData.vehicle_type) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get first station as default if none selected
      let stationId = formData.station_id;
      if (!stationId) {
        const { data: stations } = await supabase
          .from('fire_stations')
          .select('id')
          .limit(1);
        
        if (stations && stations.length > 0) {
          stationId = stations[0].id;
        }
      }

      const { error } = await supabase
        .from('vehicles')
        .insert({
          prefix: formData.prefix,
          category: formData.category as any,
          vehicle_type: formData.vehicle_type,
          station_id: stationId,
          image_url: formData.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Veículo Adicionado",
        description: `${formData.prefix} foi adicionado à frota com sucesso.`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao adicionar veículo:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar veículo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800">
            <Plus className="w-5 h-5" />
            Adicionar Novo Veículo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="border-red-300 focus:border-red-500">
                <SelectValue placeholder="Selecione a categoria do veículo" />
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

          <div>
            <Label htmlFor="vehicle_type">Tipo de Veículo *</Label>
            <Input
              id="vehicle_type"
              placeholder="ex: Autobomba, Escada Mecânica, Resgate Pesado"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="border-red-300 focus:border-red-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="image_url">URL da Imagem (Opcional)</Label>
            <Input
              id="image_url"
              placeholder="https://exemplo.com/imagem-veiculo.jpg"
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Veículo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
