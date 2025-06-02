
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, User, Phone, GraduationCap } from 'lucide-react';

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

  const formatarEquipe = () => {
    if (integrantesEquipe.length === 0) return 'Sem tripulação definida';
    
    return integrantesEquipe.map(integrante => (
      `${integrante.nome} - ${integrante.telefone}\nCursos: ${integrante.cursos.join(', ')}`
    )).join('\n\n');
  };

  return (
    <TooltipProvider>
      <div className={`
        relative flex flex-col items-center p-3 border-2 rounded-xl transition-all duration-300 
        ${obterCorFundo()} 
        shadow-lg hover:shadow-xl transform hover:-translate-y-1
        bg-gradient-to-br from-white to-gray-50
        min-w-[120px] w-[120px]
      `} 
      style={{
        boxShadow: '0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      }}>
        
        {/* Indicador de observação */}
        {vehicleObservation && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center z-10 shadow-md border-2 border-white">
            <Info className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Indicador de equipe */}
        {integrantesEquipe.length > 0 && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10 shadow-md border-2 border-white">
            <User className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Área da viatura clicável */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-pointer" onClick={() => onVehicleClick(vehicle)}>
              <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                {vehicle.modalidade?.icone_url ? (
                  <img 
                    src={vehicle.modalidade.icone_url} 
                    alt={`Viatura ${vehicle.prefixo}`}
                    className="w-12 h-12 object-contain opacity-40"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center opacity-40">
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
              {integrantesEquipe.length > 0 && (
                <div>
                  <p className="font-semibold text-blue-600 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Tripulação:
                  </p>
                  {integrantesEquipe.map((integrante, index) => (
                    <div key={index} className="text-sm border-l-2 border-blue-300 pl-2 ml-2 mt-1">
                      <p className="font-medium">{integrante.nome}</p>
                      <p className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-3 h-3" />
                        {integrante.telefone}
                      </p>
                      <p className="flex items-center gap-1 text-gray-600">
                        <GraduationCap className="w-3 h-3" />
                        {integrante.cursos.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!vehicleObservation && integrantesEquipe.length === 0 && (
                <p>Clique para ver detalhes da viatura</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Status clicável */}
        <div className="flex flex-col items-center space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                className={`${coresStatus[vehicle.status]} text-white text-xs px-3 py-1 cursor-pointer transition-all duration-200 font-semibold ${
                  statusClicavel ? 'hover:scale-105 transform shadow-md' : 'cursor-default opacity-80'
                }`}
                onClick={statusClicavel ? handleClickStatus : undefined}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
