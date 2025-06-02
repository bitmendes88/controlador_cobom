
import { useState, useEffect } from 'react';
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
  'DISPONÍVEL': 'bg-green-600 hover:bg-green-700',
  'QTI': 'bg-blue-600 hover:bg-blue-700',
  'LOCAL': 'bg-yellow-600 hover:bg-yellow-700',
  'QTI PS': 'bg-purple-600 hover:bg-purple-700',
  'REGRESSO': 'bg-orange-600 hover:bg-orange-700',
  'BAIXADO': 'bg-red-600',
  'RESERVA': 'bg-gray-600',
};

const sequenciaStatus = [
  'DISPONÍVEL',
  'QTI',
  'LOCAL',
  'QTI PS',
  'REGRESSO'
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

  const handleClickStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vehicle.status === 'BAIXADO' || vehicle.status === 'RESERVA') return;
    
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
    if (vehicle.status === 'BAIXADO') return 'bg-red-50 border-red-200';
    if (vehicle.status === 'RESERVA') return 'bg-gray-50 border-gray-200';
    return 'bg-white border-gray-200 hover:bg-gray-50';
  };

  const statusClicavel = vehicle.status !== 'BAIXADO' && vehicle.status !== 'RESERVA';

  return (
    <TooltipProvider>
      <div className={`relative flex flex-col items-center p-2 border rounded-lg shadow-sm transition-all duration-200 ${obterCorFundo()}`}>
        {/* Indicador de observação */}
        {vehicleObservation && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center z-10">
            <AlertCircle className="w-2 h-2 text-white" />
          </div>
        )}

        {/* Área da viatura clicável */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-pointer" onClick={() => onVehicleClick(vehicle)}>
              <div className="relative w-12 h-12 flex items-center justify-center">
                {vehicle.modalidade?.icone_url ? (
                  <img 
                    src={vehicle.modalidade.icone_url} 
                    alt={`Viatura ${vehicle.prefixo}`}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">IMG</span>
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="text-red-800 font-bold text-sm whitespace-nowrap pointer-events-none"
                    style={{
                      textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9)'
                    }}
                  >
                    {vehicle.prefixo}
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{vehicleObservation || 'Clique para ver detalhes da viatura'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Status clicável */}
        <div className="flex flex-col items-center space-y-1 mt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                className={`${coresStatus[vehicle.status]} text-white text-xs px-2 py-0.5 cursor-pointer transition-colors duration-200 ${
                  statusClicavel ? 'hover:scale-105 transform' : 'cursor-default'
                }`}
                onClick={statusClicavel ? handleClickStatus : undefined}
              >
                {vehicle.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusClicavel ? 'Clique para alterar status' : 'Status não alterável'}</p>
            </TooltipContent>
          </Tooltip>
          
          <div className={`text-xs font-medium ${obterCorTempo()}`}>
            {tempoNoStatus}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
