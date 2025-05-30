
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Truck, Download, Calendar, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;

interface VehicleTableProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  onVehicleAction: (vehicleId: string, action: 'baixar' | 'reserva' | 'levantar') => void;
}

// Map Portuguese status to English database values
const statusToDbMap: Record<string, string> = {
  'Disponível': 'Available',
  'A Caminho': 'En Route',
  'No Local': 'On Scene',
  'A Caminho do Hospital': 'En Route to Hospital',
  'Retornando à Base': 'Returning to Base',
  'Indisponível': 'Available', // We'll handle this differently
  'Reserva': 'Available' // We'll handle this differently
};

// Map English database values to Portuguese display
const dbToStatusMap: Record<string, string> = {
  'Available': 'Disponível',
  'En Route': 'A Caminho',
  'On Scene': 'No Local',
  'En Route to Hospital': 'A Caminho do Hospital',
  'Returning to Base': 'Retornando à Base'
};

const statusColors: Record<string, string> = {
  'Disponível': 'bg-green-500',
  'A Caminho': 'bg-blue-500',
  'No Local': 'bg-yellow-500',
  'A Caminho do Hospital': 'bg-purple-500',
  'Retornando à Base': 'bg-orange-500',
  'Indisponível': 'bg-red-500',
  'Reserva': 'bg-gray-500',
};

const statusOptions = [
  'Disponível',
  'A Caminho',
  'No Local',
  'A Caminho do Hospital',
  'Retornando à Base'
];

export const VehicleTable = ({ vehicles, onVehicleClick, onStatusUpdate, onVehicleAction }: VehicleTableProps) => {
  const [vehicleObservations, setVehicleObservations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadObservations();
  }, [vehicles]);

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

  const getDisplayStatus = (vehicle: Vehicle) => {
    // Check for special statuses first
    if (vehicle.category === 'Utility' && vehicle.status === 'Available') {
      // This could be a "baixado" vehicle, check if it's in "Veículos Baixados" category
      return 'Indisponível';
    }
    
    // For vehicles marked as reserve (we'll need a custom field for this)
    // For now, we'll use the database status
    return dbToStatusMap[vehicle.status as string] || vehicle.status;
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-900">Unidade</th>
              <th className="text-left p-4 font-semibold text-gray-900">Tipo</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Controles de Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const displayStatus = getDisplayStatus(vehicle);
              return (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onVehicleClick(vehicle)}
                            className="p-2 hover:bg-red-100"
                          >
                            <Truck className="w-5 h-5 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{vehicleObservations[vehicle.id] || 'Nenhuma observação disponível'}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="font-bold text-lg text-red-800">{vehicle.prefix}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{vehicle.vehicle_type}</td>
                  <td className="p-4">
                    <Badge className={`${statusColors[displayStatus]} text-white`}>
                      {displayStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {statusOptions.map((status) => (
                        <Button
                          key={status}
                          variant={displayStatus === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => onStatusUpdate(vehicle.id, statusToDbMap[status])}
                          className={`text-xs ${
                            displayStatus === status 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {status === 'A Caminho do Hospital' ? 'Para Hospital' : status}
                        </Button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onVehicleAction(vehicle.id, 'baixar')}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        disabled={displayStatus === 'Indisponível'}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onVehicleAction(vehicle.id, 'reserva')}
                        className="border-gray-500 text-gray-600 hover:bg-gray-50"
                        disabled={displayStatus === 'Reserva'}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Reserva
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onVehicleAction(vehicle.id, 'levantar')}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        disabled={displayStatus === 'Disponível'}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Levantar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};
