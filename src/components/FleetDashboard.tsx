
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleTable } from '@/components/VehicleTable';
import { VehicleDetailModal } from '@/components/VehicleDetailModal';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type FireStation = Tables<'fire_stations'>;

export const FleetDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<FireStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setVehicles(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
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
      
      // Refresh vehicles
      loadVehicles();
    } catch (error) {
      console.error('Erro ao atualizar status do veículo:', error);
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
          updateData.status = 'Indisponível';
          updateData.category = 'Veículos Baixados';
          break;
        
        case 'reserva':
          updateData.status = 'Reserva';
          break;
        
        case 'levantar':
          updateData.status = 'Disponível';
          // Restore original category if it was 'Veículos Baixados'
          if (vehicle.category === 'Veículos Baixados') {
            updateData.category = 'Engine'; // Default fallback
          }
          break;
      }

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', vehicleId);

      if (error) throw error;
      
      // Refresh vehicles
      loadVehicles();
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
    }
  };

  const groupedVehicles = vehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.category]) {
      acc[vehicle.category] = [];
    }
    acc[vehicle.category].push(vehicle);
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
