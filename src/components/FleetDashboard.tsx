
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
      console.error('Error loading data:', error);
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
      console.error('Error loading vehicles:', error);
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
      console.error('Error updating vehicle status:', error);
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
    return <div className="text-center py-8">Loading fleet data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Station Selector */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="text-red-800">Fire Station</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {stations.length > 0 && (
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a fire station" />
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
            <CardTitle className="text-red-800">{category} Units</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <VehicleTable
              vehicles={categoryVehicles}
              onVehicleClick={handleVehicleClick}
              onStatusUpdate={handleStatusUpdate}
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
