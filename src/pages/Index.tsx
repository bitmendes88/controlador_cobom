
import { useState, useEffect } from 'react';
import { FleetDashboard } from '@/components/FleetDashboard';
import { DailyServiceNotes } from '@/components/DailyServiceNotes';
import { AddVehicleForm } from '@/components/AddVehicleForm';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type FireStation = Tables<'fire_stations'>;

const Index = () => {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [stations, setStations] = useState<FireStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedController, setSelectedController] = useState<string>('');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const { data: stationsData, error: stationsError } = await supabase
        .from('fire_stations')
        .select('*')
        .order('name');

      if (stationsError) throw stationsError;
      setStations(stationsData || []);

      if (stationsData && stationsData.length > 0) {
        setSelectedStation(stationsData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar estações:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sistema de Gestão da Frota - Corpo de Bombeiros</h1>
              <p className="text-red-100 mt-1 text-sm">Sistema de Controle e Status de Viaturas de Emergência</p>
            </div>
            <div className="flex items-center gap-3">
              {stations.length > 0 && (
                <div className="bg-white rounded-lg p-2">
                  <Select value={selectedStation} onValueChange={setSelectedStation}>
                    <SelectTrigger className="w-60 text-gray-900 h-8">
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
                </div>
              )}
              
              <Button 
                onClick={() => setShowAddVehicle(true)}
                className="bg-white text-red-700 hover:bg-gray-100 font-semibold h-8 px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Viatura
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
        <DailyServiceNotes selectedStation={selectedStation} />
        <FleetDashboard selectedStation={selectedStation} selectedController={selectedController} />
      </div>

      {showAddVehicle && (
        <AddVehicleForm onClose={() => setShowAddVehicle(false)} />
      )}
    </div>
  );
};

export default Index;
