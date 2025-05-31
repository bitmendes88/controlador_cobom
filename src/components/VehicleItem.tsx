
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Truck, AlertCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;

interface VehicleItemProps {
  vehicle: Vehicle;
  onVehicleClick: (vehicle: Vehicle) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  vehicleObservation?: string;
}

// Map English database values to Portuguese display
const dbToStatusMap: Record<string, string> = {
  'Available': 'Disponível',
  'En Route': 'A Caminho',
  'On Scene': 'No Local',
  'En Route to Hospital': 'A Caminho do Hospital',
  'Returning to Base': 'Retornando à Base'
};

// Map Portuguese status to English database values
const statusToDbMap: Record<string, string> = {
  'Disponível': 'Available',
  'A Caminho': 'En Route',
  'No Local': 'On Scene',
  'A Caminho do Hospital': 'En Route to Hospital',
  'Retornando à Base': 'Returning to Base'
};

const statusColors: Record<string, string> = {
  'Disponível': 'bg-green-600',
  'A Caminho': 'bg-blue-600',
  'No Local': 'bg-yellow-600',
  'A Caminho do Hospital': 'bg-purple-600',
  'Retornando à Base': 'bg-orange-600',
};

const statusSequence = [
  'Disponível',
  'A Caminho',
  'No Local',
  'A Caminho do Hospital',
  'Retornando à Base'
];

export const VehicleItem = ({ vehicle, onVehicleClick, onStatusUpdate, vehicleObservation }: VehicleItemProps) => {
  const [timeInStatus, setTimeInStatus] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      if (vehicle.status_changed_at) {
        const now = new Date();
        const statusTime = new Date(vehicle.status_changed_at);
        const diffInMinutes = Math.floor((now.getTime() - statusTime.getTime()) / 60000);
        
        if (diffInMinutes < 60) {
          setTimeInStatus(`${diffInMinutes}min`);
        } else {
          const hours = Math.floor(diffInMinutes / 60);
          const minutes = diffInMinutes % 60;
          setTimeInStatus(`${hours}h ${minutes}min`);
        }
      } else {
        setTimeInStatus('--');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [vehicle.status_changed_at]);

  const currentStatus = dbToStatusMap[vehicle.status as string] || vehicle.status || 'Disponível';

  const handleStatusClick = () => {
    const currentIndex = statusSequence.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusSequence.length;
    const nextStatus = statusSequence[nextIndex];
    const nextDbStatus = statusToDbMap[nextStatus];
    
    onStatusUpdate(vehicle.id, nextDbStatus);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center space-y-2 p-3 border rounded-lg bg-white shadow-sm">
        {/* Vehicle Icon with prefix and observation indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-pointer" onClick={() => onVehicleClick(vehicle)}>
              <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold text-red-800 whitespace-nowrap">
                {vehicle.prefix}
              </div>
              {vehicleObservation && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{vehicleObservation || 'Nenhuma observação disponível'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Status and Time */}
        <div className="text-center space-y-1">
          <Badge className={`${statusColors[currentStatus]} text-white text-xs`}>
            {currentStatus}
          </Badge>
          <div className="text-xs text-gray-500">{timeInStatus}</div>
        </div>

        {/* Status Change Button */}
        <Button
          onClick={handleStatusClick}
          size="sm"
          className="text-xs bg-red-700 hover:bg-red-800 text-white"
        >
          Status
        </Button>
      </div>
    </TooltipProvider>
  );
};
