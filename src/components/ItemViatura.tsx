
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
      case 'DISPONÍVEL': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'QTI': return 'bg-amber-500 hover:bg-amber-600';
      case 'LOCAL': return 'bg-blue-600 hover:bg-blue-700';
      case 'QTI PS': return 'bg-orange-600 hover:bg-orange-700';
      case 'REGRESSO': return 'bg-purple-600 hover:bg-purple-700';
      case 'BAIXADO': return 'bg-red-600 hover:bg-red-700';
      case 'RESERVA': return 'bg-slate-600 hover:bg-slate-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'DISPONÍVEL': return 'bg-emerald-50 border-emerald-300 shadow-emerald-100';
      case 'QTI': return 'bg-amber-50 border-amber-300 shadow-amber-100';
      case 'LOCAL': return 'bg-blue-50 border-blue-300 shadow-blue-100';
      case 'QTI PS': return 'bg-orange-50 border-orange-300 shadow-orange-100';
      case 'REGRESSO': return 'bg-purple-50 border-purple-300 shadow-purple-100';
      case 'BAIXADO': return 'bg-red-50 border-red-300 shadow-red-100';
      case 'RESERVA': return 'bg-slate-50 border-slate-300 shadow-slate-100';
      default: return 'bg-white border-gray-300 shadow-gray-100';
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
        className={`relative group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 hover:scale-105 transform-gpu overflow-visible ${getStatusBackgroundColor(vehicle.status)}`}
        style={{
          minWidth: `${cardWidth}px`,
          maxWidth: `${cardWidth}px`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)'
        }}
        onClick={() => onVehicleClick(vehicle)}
      >
        {/* Ícone da modalidade com efeito 3D - metade para fora - maior e mais largo */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-12 h-10 bg-white rounded-lg shadow-lg border-2 border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <img 
              src={vehicle.modalidade.icone_url} 
              alt={vehicle.modalidade.nome}
              className="w-7 h-7 object-contain"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
            />
          </div>
        </div>

        <div className="p-2 space-y-0.5 relative pt-6">
          {/* Prefixo com tooltip para informações da equipe - fonte reduzida */}
          <div className="text-center relative z-10 mt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="text-lg font-black text-red-800 tracking-wide cursor-pointer whitespace-nowrap overflow-hidden leading-none"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.8)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    fontSize: '1.25rem'
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

          {/* Status e indicadores em linha única */}
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {vehicle.dejem && (
                  <DIcon className="w-4 h-4" />
                )}
                <Button
                  className={`h-6 text-xs font-bold text-white border-0 ${getStatusColor(vehicle.status)} hover:opacity-90 shadow-lg`}
                  style={{ minWidth: '60px', fontSize: '9px' }}
                  onClick={handleStatusClick}
                >
                  {vehicle.status}
                </Button>
              </div>
              
              {/* QSA Indicators ao lado direito do status */}
              <div className="flex items-center gap-1">
                {(vehicle.qsa_radio || vehicle.qsa_radio === 0) && (
                  <div className={`flex items-center gap-0.5 text-xs px-1 py-0.5 rounded shadow-sm ${getQsaColor(vehicle.qsa_radio)}`}>
                    <Radio className="w-2.5 h-2.5" />
                    <span className="font-bold text-xs">{vehicle.qsa_radio}</span>
                  </div>
                )}
                {(vehicle.qsa_zello || vehicle.qsa_zello === 0) && (
                  <div className={`flex items-center gap-0.5 text-xs px-1 py-0.5 rounded shadow-sm ${getQsaColor(vehicle.qsa_zello)}`}>
                    <Smartphone className="w-2.5 h-2.5" />
                    <span className="font-bold text-xs">{vehicle.qsa_zello}</span>
                  </div>
                )}
              </div>
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
