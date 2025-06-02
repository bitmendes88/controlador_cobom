
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Viatura = Tables<'viaturas'>;

interface VehicleItemProps {
  vehicle: Viatura & {
    modalidade: {
      nome: string;
      icone_url: string;
    };
  };
  onVehicleClick: (vehicle: Viatura) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  vehicleObservation?: string;
}

const statusColors: Record<string, string> = {
  'DISPONÍVEL': 'bg-green-600',
  'QTI': 'bg-blue-600',
  'LOCAL': 'bg-yellow-600',
  'QTI PS': 'bg-purple-600',
  'REGRESSO': 'bg-orange-600',
  'BAIXADO': 'bg-red-600',
  'RESERVA': 'bg-gray-600',
};

const statusSequence = [
  'DISPONÍVEL',
  'QTI',
  'LOCAL',
  'QTI PS',
  'REGRESSO'
];

export const VehicleItem = ({ vehicle, onVehicleClick, onStatusUpdate, vehicleObservation }: VehicleItemProps) => {
  const [timeInStatus, setTimeInStatus] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      if (vehicle.status_alterado_em) {
        const now = new Date();
        const statusTime = new Date(vehicle.status_alterado_em);
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
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [vehicle.status_alterado_em]);

  const currentStatus = vehicle.status || 'DISPONÍVEL';

  const handleStatusClick = () => {
    if (currentStatus === 'BAIXADO' || currentStatus === 'RESERVA') return;
    
    const currentIndex = statusSequence.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusSequence.length;
    const nextStatus = statusSequence[nextIndex];
    
    onStatusUpdate(vehicle.id, nextStatus);
  };

  const getTimeColor = () => {
    if (vehicle.status_alterado_em) {
      const now = new Date();
      const statusTime = new Date(vehicle.status_alterado_em);
      const diffInMinutes = Math.floor((now.getTime() - statusTime.getTime()) / 60000);
      
      if (diffInMinutes <= 15) return 'text-green-600';
      if (diffInMinutes <= 30) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-500';
  };

  const getBackgroundColor = () => {
    if (currentStatus === 'BAIXADO') return 'bg-red-100';
    if (currentStatus === 'RESERVA') return 'bg-gray-100';
    return 'bg-white';
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col items-center space-y-1 p-2 border rounded-lg shadow-sm ${getBackgroundColor()}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-pointer" onClick={() => onVehicleClick(vehicle)}>
              <div className="relative w-14 h-14 flex items-center justify-center">
                {vehicle.modalidade?.icone_url ? (
                  <img 
                    src={vehicle.modalidade.icone_url} 
                    alt={`Viatura ${vehicle.prefixo}`}
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">IMG</span>
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="text-red-800 font-bold text-lg whitespace-nowrap pointer-events-none"
                    style={{
                      textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9)'
                    }}
                  >
                    {vehicle.prefixo}
                  </div>
                </div>
              </div>
              
              {vehicleObservation && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{vehicleObservation || 'Nenhuma observação disponível'}</p>
          </TooltipContent>
        </Tooltip>

        <div className="text-center space-y-1">
          <Badge className={`${statusColors[currentStatus]} text-white text-xs px-1 py-0`}>
            {currentStatus}
          </Badge>
          <div className={`text-xs font-semibold ${getTimeColor()}`}>{timeInStatus}</div>
        </div>

        {currentStatus !== 'BAIXADO' && currentStatus !== 'RESERVA' && (
          <Button
            onClick={handleStatusClick}
            size="sm"
            className="text-xs bg-red-800 hover:bg-red-900 text-white h-5 px-2 py-0"
          >
            Status
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
