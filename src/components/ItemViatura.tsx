
import { Button } from '@/components/ui/button';
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
    imagem_disponivel?: string;
    imagem_qti?: string;
    imagem_local?: string;
    imagem_qti_ps?: string;
    imagem_regresso?: string;
    imagem_baixado?: string;
    imagem_reserva?: string;
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

  const getBackgroundImage = (status: string, modalidade: Viatura['modalidade']) => {
    let imageUrl = '';
    switch (status) {
      case 'DISPONÍVEL': imageUrl = modalidade.imagem_disponivel || ''; break;
      case 'QTI': imageUrl = modalidade.imagem_qti || ''; break;
      case 'LOCAL': imageUrl = modalidade.imagem_local || ''; break;
      case 'QTI PS': imageUrl = modalidade.imagem_qti_ps || ''; break;
      case 'REGRESSO': imageUrl = modalidade.imagem_regresso || ''; break;
      case 'BAIXADO': imageUrl = modalidade.imagem_baixado || ''; break;
      case 'RESERVA': imageUrl = modalidade.imagem_reserva || ''; break;
      default: imageUrl = ''; break;
    }
    
    if (imageUrl) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      };
    }
    return {};
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
      <div 
        className="relative group hover:scale-105 transition-transform duration-300 cursor-pointer"
        style={{
          minWidth: `${cardWidth}px`,
          maxWidth: `${cardWidth}px`,
          margin: '0 8px'
        }}
        onClick={() => onVehicleClick(vehicle)}
      >
        {/* Imagem de fundo baseada na modalidade e status */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            ...getBackgroundImage(vehicle.status, vehicle.modalidade),
            opacity: '0.8'
          }}
        />

        <div className="p-2 space-y-0.5 relative z-10 pt-2">
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
      </div>
    </TooltipProvider>
  );
};
