
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Users, Phone, GraduationCap } from 'lucide-react';

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

interface Integrante {
  nome: string;
  telefone: string;
  cursos: string[];
}

interface ItemViaturaProps {
  vehicle: Viatura;
  onVehicleClick: (vehicle: Viatura) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  vehicleObservation?: string;
  integrantesEquipe?: Integrante[];
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

export const ItemViatura = ({ 
  vehicle, 
  onVehicleClick, 
  onStatusUpdate, 
  vehicleObservation,
  integrantesEquipe = []
}: ItemViaturaProps) => {
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
    if (vehicle.status === 'BAIXADO') return 'bg-red-50 border-red-300';
    if (vehicle.status === 'RESERVA') return 'bg-gray-50 border-gray-300';
    return 'bg-white border-gray-300';
  };

  const statusClicavel = vehicle.status !== 'BAIXADO' && vehicle.status !== 'RESERVA';

  return (
    <TooltipProvider>
      <div className={`
        relative flex flex-col p-2 border-2 rounded-xl transition-all duration-300 
        ${obterCorFundo()} 
        shadow-[0_8px_16px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.7)] 
        hover:shadow-[0_12px_24px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.7)] 
        transform hover:-translate-y-1
        bg-gradient-to-br from-white to-gray-50
        min-w-[140px] w-[140px] min-h-[100px]
      `}>
        
        {/* Indicadores no topo */}
        <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
          {vehicleObservation && (
            <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-md border border-white">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          
          {integrantesEquipe.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-md border border-white cursor-help">
                  <Users className="w-2.5 h-2.5 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3" side="top">
                <div className="space-y-2">
                  <p className="font-semibold text-blue-600 flex items-center gap-1 text-sm">
                    <Users className="w-3 h-3" />
                    Equipe:
                  </p>
                  {integrantesEquipe.map((integrante, index) => (
                    <div key={index} className="text-xs border-l-2 border-blue-300 pl-2 ml-1 space-y-1">
                      <p className="font-medium text-gray-800">{integrante.nome}</p>
                      <p className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-2.5 h-2.5" />
                        {integrante.telefone}
                      </p>
                      <p className="flex items-center gap-1 text-gray-600">
                        <GraduationCap className="w-2.5 h-2.5" />
                        {integrante.cursos.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Área da viatura clicável - Imagem e prefixo alinhados no topo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-pointer flex-1 flex flex-col justify-start mt-2" onClick={() => onVehicleClick(vehicle)}>
              <div className="relative w-full h-12 flex items-center justify-center mb-1">
                {vehicle.modalidade?.icone_url ? (
                  <img 
                    src={vehicle.modalidade.icone_url} 
                    alt={`Viatura ${vehicle.prefixo}`}
                    className="w-10 h-10 object-contain opacity-30"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center opacity-30">
                    <span className="text-gray-400 text-xs">IMG</span>
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="text-red-800 font-black text-xl whitespace-nowrap pointer-events-none tracking-wider"
                    style={{
                      textShadow: '2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9), 2px -2px 4px rgba(255,255,255,0.9), -2px 2px 4px rgba(255,255,255,0.9)',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                    }}
                  >
                    {vehicle.prefixo}
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              {vehicleObservation && (
                <div>
                  <p className="font-semibold text-amber-600">Observação:</p>
                  <p className="text-sm">{vehicleObservation}</p>
                </div>
              )}
              {!vehicleObservation && (
                <p>Clique para ver detalhes da viatura</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Status e tempo - compactados na parte inferior */}
        <div className="flex flex-col items-center space-y-1 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                className={`${coresStatus[vehicle.status]} text-white text-xs px-2 py-0.5 cursor-pointer transition-all duration-200 font-semibold ${
                  statusClicavel ? 'hover:scale-105 transform shadow-md' : 'cursor-default opacity-80'
                }`}
                onClick={statusClicavel ? handleClickStatus : undefined}
                style={{
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {vehicle.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusClicavel ? 'Clique para alterar status' : 'Status não alterável'}</p>
            </TooltipContent>
          </Tooltip>
          
          <div className={`text-xs font-bold ${obterCorTempo()}`}
               style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            {tempoNoStatus}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
