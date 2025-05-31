
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StationVehiclesRow } from '@/components/StationVehiclesRow';
import { VehicleDetailModal } from '@/components/VehicleDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type FireStation = Tables<'fire_stations'>;
type FireSubStation = Tables<'fire_sub_stations'>;

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
  const [subStations, setSubStations] = useState<FireSubStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleObservations, setVehicleObservations] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      loadSubStations();
      loadVehicles();
    }
  }, [selectedStation]);

  useEffect(() => {
    loadObservations();
  }, [vehicles]);

  const loadData = async () => {
    try {
      // Load stations (now called Grupamentos)
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

  const loadSubStations = async () => {
    if (!selectedStation) return;

    try {
      const { data, error } = await supabase
        .from('fire_sub_stations')
        .select('*')
        .eq('station_id', selectedStation)
        .order('name');

      if (error) throw error;
      setSubStations(data || []);
    } catch (error) {
      console.error('Erro ao carregar sub-estações:', error);
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

  const loadObservations = async () => {
    try {
      const vehicleIds = vehicles.map(v => v.id);
      if (vehicleIds.length === 0) return;

      const { data, error } = await supabase
        .from('vehicle_observations')
        .select('vehicle_id, observation')
        .in('vehicle_id', vehicleIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const obsMap: Record<string, string> = {};
      data?.forEach(obs => {
        if (!obsMap[obs.vehicle_id]) {
          obsMap[obs.vehicle_id] = obs.observation;
        }
      });
      setVehicleObservations(obsMap);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
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
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (action) {
        case 'baixar':
        case 'reserva':
          updateData.status = 'Available';
          break;
        case 'levantar':
          updateData.status = 'Available';
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
      
      // Close modal and refresh vehicles
      setSelectedVehicle(null);
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

  // Group vehicles by category (subgrupamentos) and then by sub-station
  const groupedData = vehicles.reduce((acc, vehicle) => {
    const category = dbToCategoryMap[vehicle.category] || vehicle.category;
    if (!acc[category]) {
      acc[category] = {};
    }

    const subStationId = vehicle.sub_station_id || 'unassigned';
    if (!acc[category][subStationId]) {
      acc[category][subStationId] = [];
    }

    acc[category][subStationId].push(vehicle);
    return acc;
  }, {} as Record<string, Record<string, Vehicle[]>>);

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados da frota...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Station Selector */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="text-red-800">Grupamento de Bombeiros</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {stations.length > 0 && (
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um grupamento" />
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

      {/* Categories (Subgrupamentos) with Stations and Vehicles */}
      {Object.entries(groupedData).map(([category, stationGroups]) => (
        <Card key={category} className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-800">{category}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(stationGroups).map(([subStationId, vehicles]) => {
                const subStation = subStations.find(s => s.id === subStationId);
                const stationName = subStation ? subStation.name : 'Estação Não Atribuída';
                
                return (
                  <StationVehiclesRow
                    key={subStationId}
                    station={{ id: subStationId, name: stationName } as FireSubStation}
                    vehicles={vehicles}
                    onVehicleClick={handleVehicleClick}
                    onStatusUpdate={handleStatusUpdate}
                    vehicleObservations={vehicleObservations}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onVehicleAction={handleVehicleAction}
        />
      )}
    </div>
  );
};
