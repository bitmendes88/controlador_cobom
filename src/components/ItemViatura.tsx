
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DIcon } from '@/components/DIcon';
import { Radio, Smartphone } from 'lucide-react';

interface Viatura {
  id: string;
  prefixo: string;
  status: string;
  qsa_radio?: number;
  qsa_zello?: number;
  dejem?: boolean;
  modalidade: {
    nome: string;
    icone_url: string;
  };
}

interface ItemViaturaProps {
  vehicle: Viatura;
  onVehicleClick: (viatura: Viatura) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  vehicleObservation?: string;
  integrantesEquipe?: Array<{
    nome: string;
    telefone: string;
    cursos: string[];
  }>;
}

export const ItemViatura = ({ 
  vehicle, 
  onVehicleClick, 
  onStatusUpdate,
  vehicleObservation,
  integrantesEquipe = []
}: ItemViaturaProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONÍVEL': return 'bg-green-500';
      case 'QTI': return 'bg-yellow-500';
      case 'LOCAL': return 'bg-blue-500';
      case 'QTI PS': return 'bg-orange-500';
      case 'REGRESSO': return 'bg-purple-500';
      case 'BAIXADO': return 'bg-red-500';
      case 'RESERVA': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'DISPONÍVEL': return 'bg-green-50 border-green-200';
      case 'QTI': return 'bg-yellow-50 border-yellow-200';
      case 'LOCAL': return 'bg-blue-50 border-blue-200';
      case 'QTI PS': return 'bg-orange-50 border-orange-200';
      case 'REGRESSO': return 'bg-purple-50 border-purple-200';
      case 'BAIXADO': return 'bg-red-50 border-red-200';
      case 'RESERVA': return 'bg-gray-50 border-gray-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getQsaColor = (qsa?: number) => {
    if (!qsa && qsa !== 0) return 'bg-gray-100 text-gray-600';
    switch (qsa) {
      case 0: return 'bg-red-500 text-white';
      case 1: return 'bg-red-400 text-white';
      case 2: return 'bg-orange-400 text-white';
      case 3: return 'bg-yellow-400 text-white';
      case 4: return 'bg-lime-400 text-white';
      case 5: return 'bg-green-500 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const statusSequence = [
    'DISPONÍVEL',
    'QTI',
    'LOCAL', 
    'QTI PS',
    'REGRESSO'
  ];

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusSequence.indexOf(currentStatus);
    if (currentIndex === -1) return statusSequence[0];
    return statusSequence[(currentIndex + 1) % statusSequence.length];
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = getNextStatus(vehicle.status);
    onStatusUpdate(vehicle.id, nextStatus);
  };

  // Calcular largura baseada no comprimento do prefixo
  const getCardWidth = (prefixo: string) => {
    const baseWidth = 120;
    const extraWidth = Math.max(0, (prefixo.length - 4) * 8);
    return Math.min(baseWidth + extraWidth, 180);
  };

  const cardWidth = getCardWidth(vehicle.prefixo);

  return (
    <TooltipProvider>
      <Card 
        className={`relative group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 hover:animate-none hover:scale-105 transform-gpu ${getStatusBackgroundColor(vehicle.status)}`}
        style={{
          minWidth: `${cardWidth}px`,
          maxWidth: `${cardWidth}px`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)'
        }}
        onClick={() => onVehicleClick(vehicle)}
      >
        <div className="p-2 space-y-2 relative">
          {/* Ícone da modalidade como marca d'água mais visível */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img 
              src={vehicle.modalidade.icone_url} 
              alt={vehicle.modalidade.nome}
              className="w-12 h-12 object-contain opacity-40 filter brightness-110 contrast-125"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
            />
          </div>

          {/* Prefixo com tooltip para informações da equipe - sem quebra de linha */}
          <div className="text-center relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="text-2xl font-black text-red-800 tracking-wide cursor-pointer whitespace-nowrap overflow-hidden"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.8)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    fontSize: '1.75rem',
                    lineHeight: '1.2'
                  }}
                >
                  {vehicle.prefixo}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold text-sm">Equipe</div>
                  {integrantesEquipe.length > 0 ? (
                    integrantesEquipe.map((integrante, index) => (
                      <div key={index} className="text-xs space-y-1">
                        <div className="font-medium">{integrante.nome}</div>
                        <div className="text-gray-600">{integrante.telefone}</div>
                        <div className="text-gray-500">{integrante.cursos.join(', ')}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">Nenhum integrante atribuído</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status e indicadores */}
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {vehicle.dejem && (
                  <DIcon className="w-4 h-4" />
                )}
                <Button
                  className={`h-6 text-xs font-medium text-white border-0 ${getStatusColor(vehicle.status)} hover:opacity-90`}
                  style={{ minWidth: '70px', fontSize: '10px' }}
                  onClick={handleStatusClick}
                >
                  {vehicle.status}
                </Button>
              </div>
            </div>

            {/* QSA Indicators com cores */}
            <div className="flex items-center justify-center gap-2">
              {(vehicle.qsa_radio || vehicle.qsa_radio === 0) && (
                <div className={`flex items-center gap-1 text-xs px-1 py-0.5 rounded ${getQsaColor(vehicle.qsa_radio)}`}>
                  <Radio className="w-3 h-3" />
                  <span className="font-medium">{vehicle.qsa_radio}</span>
                </div>
              )}
              {(vehicle.qsa_zello || vehicle.qsa_zello === 0) && (
                <div className={`flex items-center gap-1 text-xs px-1 py-0.5 rounded ${getQsaColor(vehicle.qsa_zello)}`}>
                  <Smartphone className="w-3 h-3" />
                  <span className="font-medium">{vehicle.qsa_zello}</span>
                </div>
              )}
            </div>
          </div>

          {/* Observação */}
          {vehicleObservation && (
            <div className="text-xs text-gray-600 bg-yellow-50 p-1 rounded border-l-2 border-yellow-400 truncate relative z-10">
              {vehicleObservation}
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};
