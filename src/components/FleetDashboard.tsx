
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleTable } from '@/components/VehicleTable';
import { VehicleDetailModal } from '@/components/VehicleDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type FireStation = Tables<'fire_stations'>;

// Map Portuguese categories to English database values
const categoryToDbMap: Record<string, string> = {
  'Autobomba': 'Engine',
  'Escada': 'Ladder', 
  'Resgate': 'Rescue',
  'Ambulância': 'Ambulance',
  'Comando': 'Chief',
  'Utilitário': 'Utility',
  'Veículos Baixados': 'Utility' // We'll use a different approach for this
};

// Map English database values to Portuguese display
const dbToCategoryMap: Record<string, string> = {
  'Engine': 'Autobomba',
  'Ladder': 'Escada',
  'Rescue': 'Resgate', 
  'Ambulance': 'Ambulância',
  'Chief': 'Comando',
  'Utility': 'Utilitário'
};

export const FleetDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<FireStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalCategories, setOriginalCategories] = useState<Record<string, string>>({});
  const [baixadoVehicles, setBaixadoVehicles] = useState<Set<string>>(new Set());
  const [reservaVehicles, setReservaVehicles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      loadVehicles();
    }
  }, [selectedStation]);

  const loadData = async () => {
    try {
      // Load stations
      const { data: stationsData, error: stationsError } = await supabase
        .from('fire_stations')
        .select('*')
        .order('name');

      if (stationsError) throw stationsError;
      setStations(stationsData || []);

      // Set first station as default
      if (stationsData && stationsData.length > 0) {
        setSelectedStation(stationsData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async () => {
    if (!selectedStation) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('station_id', selectedStation)
        .order('category')
        .order('prefix');

      if (error) throw error;
      
      const vehicleData = data || [];
      setVehicles(vehicleData);

      // Store original categories for vehicles not in "Veículos Baixados"
      const originals: Record<string, string> = {};
      vehicleData.forEach(vehicle => {
        const displayCategory = getDisplayCategory(vehicle);
        if (displayCategory !== 'Veículos Baixados') {
          originals[vehicle.id] = vehicle.category;
        }
      });
      setOriginalCategories(prev => ({ ...prev, ...originals }));
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const getDisplayCategory = (vehicle: Vehicle): string => {
    // Check if vehicle is "baixado"
    if (baixadoVehicles.has(vehicle.id)) {
      return 'Veículos Baixados';
    }
    return dbToCategoryMap[vehicle.category] || vehicle.category;
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleStatusUpdate = async (vehicleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          status: newStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) throw error;
      
      // Map back to Portuguese for display
      const statusMap: Record<string, string> = {
        'Available': 'Disponível',
        'En Route': 'A Caminho',
        'On Scene': 'No Local',
        'En Route to Hospital': 'A Caminho do Hospital',
        'Returning to Base': 'Retornando à Base'
      };
      
      toast({
        title: "Status Atualizado",
        description: `Status do veículo alterado para ${statusMap[newStatus] || newStatus}`,
      });
      
      // Refresh vehicles
      loadVehicles();
    } catch (error) {
      console.error('Erro ao atualizar status do veículo:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do veículo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVehicleAction = async (vehicleId: string, action: 'baixar' | 'reserva' | 'levantar') => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (action) {
        case 'baixar':
          // Store original category before marking as baixado
          if (!baixadoVehicles.has(vehicleId)) {
            setOriginalCategories(prev => ({
              ...prev,
              [vehicleId]: vehicle.category
            }));
            setBaixadoVehicles(prev => new Set([...prev, vehicleId]));
          }
          updateData.status = 'Available'; // Keep database status as Available
          break;
        
        case 'reserva':
          setReservaVehicles(prev => new Set([...prev, vehicleId]));
          updateData.status = 'Available'; // Keep database status as Available
          break;
        
        case 'levantar':
          updateData.status = 'Available';
          // Remove from special status sets
          setBaixadoVehicles(prev => {
            const newSet = new Set(prev);
            newSet.delete(vehicleId);
            return newSet;
          });
          setReservaVehicles(prev => {
            const newSet = new Set(prev);
            newSet.delete(vehicleId);
            return newSet;
          });
          break;
      }

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', vehicleId);

      if (error) throw error;
      
      const actionMessages = {
        'baixar': 'Veículo baixado com sucesso',
        'reserva': 'Veículo colocado em reserva',
        'levantar': 'Veículo levantado e disponibilizado'
      };

      toast({
        title: "Ação Realizada",
        description: actionMessages[action],
      });
      
      // Refresh vehicles
      loadVehicles();
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar ação no veículo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const groupedVehicles = vehicles.reduce((acc, vehicle) => {
    const displayCategory = getDisplayCategory(vehicle);
    if (!acc[displayCategory]) {
      acc[displayCategory] = [];
    }
    acc[displayCategory].push(vehicle);
    return acc;
  }, {} as Record<string, Vehicle[]>);

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados da frota...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Station Selector */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="text-red-800">Quartel de Bombeiros</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {stations.length > 0 && (
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um quartel" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name} - {station.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Tables by Category */}
      {Object.entries(groupedVehicles).map(([category, categoryVehicles]) => (
        <Card key={category} className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-800">{category}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <VehicleTable
              vehicles={categoryVehicles}
              onVehicleClick={handleVehicleClick}
              onStatusUpdate={handleStatusUpdate}
              onVehicleAction={handleVehicleAction}
            />
          </CardContent>
        </Card>
      ))}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
  );
};
