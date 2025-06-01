
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationVehiclesRow } from '@/components/StationVehiclesRow';
import { VehicleDetailModal } from '@/components/VehicleDetailModal';
import { EditVehicleForm } from '@/components/EditVehicleForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type FireSubStation = Tables<'fire_sub_stations'>;

const dbToCategoryMap: Record<string, string> = {
  'Engine': 'Autobomba',
  'Ladder': 'Escada',
  'Rescue': 'Resgate', 
  'Ambulance': 'Ambulância',
  'Chief': 'Comando',
  'Utility': 'Utilitário'
};

interface FleetDashboardProps {
  selectedStation: string;
  selectedController?: string;
}

export const FleetDashboard = ({ selectedStation, selectedController }: FleetDashboardProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [subStations, setSubStations] = useState<FireSubStation[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleObservations, setVehicleObservations] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (selectedStation) {
      loadSubStations();
      loadVehicles();
    }
  }, [selectedStation]);

  useEffect(() => {
    loadObservations();
  }, [vehicles]);

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
      console.error('Erro ao carregar viaturas:', error);
    } finally {
      setIsLoading(false);
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

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleStatusUpdate = async (vehicleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          status: newStatus as any,
          status_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) throw error;
      
      const statusMap: Record<string, string> = {
        'Available': 'Disponível',
        'En Route': 'A Caminho',
        'On Scene': 'No Local',
        'En Route to Hospital': 'A Caminho do Hospital',
        'Returning to Base': 'Retornando à Base',
        'Down': 'Baixada',
        'Reserve': 'Reserva'
      };
      
      const vehicle = vehicles.find(v => v.id === vehicleId);
      await logActivity('Status alterado', `Viatura ${vehicle?.prefix} - ${statusMap[newStatus] || newStatus}`);
      
      toast({
        title: "Status Atualizado",
        description: `Status da viatura alterado para ${statusMap[newStatus] || newStatus}`,
      });
      
      loadVehicles();
    } catch (error) {
      console.error('Erro ao atualizar status da viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status da viatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVehicleAction = async (vehicleId: string, action: 'baixar' | 'reserva' | 'levantar') => {
    try {
      let updateData: any = {
        status_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      switch (action) {
        case 'baixar':
          updateData.status = 'Down';
          break;
        case 'reserva':
          updateData.status = 'Reserve';
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
        'baixar': 'Viatura baixada com sucesso',
        'reserva': 'Viatura colocada em reserva',
        'levantar': 'Viatura levantada e disponibilizada'
      };

      const vehicle = vehicles.find(v => v.id === vehicleId);
      await logActivity(actionMessages[action], `Viatura ${vehicle?.prefix}`);

      toast({
        title: "Ação Realizada",
        description: actionMessages[action],
      });
      
      setSelectedVehicle(null);
      loadVehicles();
    } catch (error) {
      console.error('Erro ao atualizar viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar ação na viatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVehicleDelete = async (vehicleId: string) => {
    loadVehicles();
  };

  // Group vehicles by category and then by sub-station, with Down/Reserve at the end
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

  const orderedCategories = Object.keys(groupedData).sort((a, b) => {
    if (a === 'Viaturas Baixadas') return 1;
    if (b === 'Viaturas Baixadas') return -1;
    return a.localeCompare(b);
  });

  const sortVehiclesByStatus = (vehicles: Vehicle[]) => {
    return vehicles.sort((a, b) => {
      const statusOrder = { 'Down': 2, 'Reserve': 1 };
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 0;
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 0;
      return aOrder - bOrder;
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando dados da frota...</div>;
  }

  if (!selectedStation) {
    return <div className="text-center py-4">Selecione um grupamento para visualizar as viaturas</div>;
  }

  return (
    <div className="space-y-3">
      {orderedCategories.map((category) => (
        <Card key={category} className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-200 py-2">
            <CardTitle className="text-red-800 text-sm">{category}</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-1">
              {Object.entries(groupedData[category]).map(([subStationId, vehicles], index) => {
                const subStation = subStations.find(s => s.id === subStationId);
                const stationName = subStation ? subStation.name : 'Estação Não Atribuída';
                const sortedVehicles = sortVehiclesByStatus(vehicles);
                
                return (
                  <div key={subStationId}>
                    <StationVehiclesRow
                      station={{ id: subStationId, name: stationName } as FireSubStation}
                      vehicles={sortedVehicles}
                      onVehicleClick={handleVehicleClick}
                      onStatusUpdate={handleStatusUpdate}
                      vehicleObservations={vehicleObservations}
                    />
                    {index < Object.keys(groupedData[category]).length - 1 && (
                      <hr className="border-gray-200 my-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onVehicleAction={handleVehicleAction}
          onVehicleDelete={handleVehicleDelete}
          onEditVehicle={handleEditVehicle}
        />
      )}

      {editingVehicle && (
        <EditVehicleForm
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onVehicleUpdated={loadVehicles}
        />
      )}
    </div>
  );
};
