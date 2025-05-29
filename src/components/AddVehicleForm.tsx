
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

  const categories = ['Engine', 'Ladder', 'Rescue', 'Ambulance', 'Chief', 'Utility'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prefix || !formData.category || !formData.vehicle_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
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
        title: "Vehicle Added",
        description: `${formData.prefix} has been added to the fleet successfully.`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800">
            <Plus className="w-5 h-5" />
            Add New Vehicle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="prefix">Unit Prefix *</Label>
            <Input
              id="prefix"
              placeholder="e.g., E-2, L-3, R-1"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              className="border-red-300 focus:border-red-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="border-red-300 focus:border-red-500">
                <SelectValue placeholder="Select vehicle category" />
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
            <Label htmlFor="vehicle_type">Vehicle Type *</Label>
            <Input
              id="vehicle_type"
              placeholder="e.g., Fire Engine, Ladder Truck, Heavy Rescue"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="border-red-300 focus:border-red-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              placeholder="https://example.com/vehicle-image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="border-red-300 focus:border-red-500"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
