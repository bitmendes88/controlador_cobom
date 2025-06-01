
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';

interface Viatura {
  id: string;
  prefixo: string;
  status: string;
  status_alterado_em?: string;
  modalidade: {
    nome: string;
    icone_url: string;
  };
}

interface ItemViaturaProps {
  vehicle: Viatura;
  onVehicleClick: (vehicle: Viatura) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  vehicleObservation?: string;
}

const coresStatus: Record<string, string> = {
  'Disponível': 'bg-green-600',
  'A Caminho': 'bg-blue-600',
  'No Local': 'bg-yellow-600',
  'A Caminho do Hospital': 'bg-purple-600',
  'Retornando à Base': 'bg-orange-600',
  'Baixada': 'bg-red-600',
  'Reserva': 'bg-gray-600',
};

const sequenciaStatus = [
  'Disponível',
  'A Caminho',
  'No Local',
  'A Caminho do Hospital',
  'Retornando à Base'
];

export const ItemViatura = ({ vehicle, onVehicleClick, onStatusUpdate, vehicleObservation }: ItemViaturaProps) => {
  const [tempoNoStatus, setTempoNoStatus] = useState('');

  useEffect(() => {
    const atualizarTimer = () => {
      if (vehicle.status_alterado_em) {
        const agora = new Date();
        const tempoStatus = new Date(vehicle.status_alterado_em);
        const diffEmMinutos = Math.floor((agora.getTime() - tempoStatus.getTime()) / 60000);
        
        if (diffEmMinutos < 60) {
          setTempoNoStatus(`${diffEmMinutos}min`);
        } else {
          const horas = Math.floor(diffEmMinutos / 60);
          const minutos = diffEmMinutos % 60;
          setTempoNoStatus(`${horas}h ${minutos}min`);
        }
      } else {
        setTempoNoStatus('--');
      }
    };

    atualizarTimer();
    const interval = setInterval(atualizarTimer, 60000);

    return () => clearInterval(interval);
  }, [vehicle.status_alterado_em]);

  const handleClickStatus = () => {
    if (vehicle.status === 'Baixada' || vehicle.status === 'Reserva') return;
    
    const indiceAtual = sequenciaStatus.indexOf(vehicle.status);
    const proximoIndice = (indiceAtual + 1) % sequenciaStatus.length;
    const proximoStatus = sequenciaStatus[proximoIndice];
    
    onStatusUpdate(vehicle.id, proximoStatus);
  };

  const obterCorTempo = () => {
    if (vehicle.status_alterado_em) {
      const agora = new Date();
      const tempoStatus = new Date(vehicle.status_alterado_em);
      const diffEmMinutos = Math.floor((agora.getTime() - tempoStatus.getTime()) / 60000);
      
      if (diffEmMinutos <= 15) return 'text-green-600';
      if (diffEmMinutos <= 30) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-500';
  };

  const obterCorFundo = () => {
    if (vehicle.status === 'Baixada') return 'bg-red-100';
    if (vehicle.status === 'Reserva') return 'bg-gray-100';
    return 'bg-white';
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col items-center space-y-1 p-2 border rounded-lg shadow-sm ${obterCorFundo()}`}>
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
          <Badge className={`${coresStatus[vehicle.status]} text-white text-xs px-1 py-0`}>
            {vehicle.status}
          </Badge>
          <div className={`text-xs font-semibold ${obterCorTempo()}`}>{tempoNoStatus}</div>
        </div>

        {vehicle.status !== 'Baixada' && vehicle.status !== 'Reserva' && (
          <Button
            onClick={handleClickStatus}
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
