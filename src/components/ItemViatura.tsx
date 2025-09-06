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

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'DISPONÍVEL': return 'rgba(16, 185, 129, 0.2)';
      case 'QTI': return 'rgba(245, 158, 11, 0.25)';
      case 'LOCAL': return 'rgba(37, 99, 235, 0.2)';
      case 'QTI PS': return 'rgba(234, 88, 12, 0.25)';
      case 'REGRESSO': return 'rgba(147, 51, 234, 0.2)';
      case 'BAIXADO': return 'rgba(220, 38, 38, 0.25)';
      case 'RESERVA': return 'rgba(100, 116, 139, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
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

  // Destaque baseado no status para tema de bombeiros
  const getStatusHighlight = (status: string) => {
    switch (status) {
      case 'QTI': 
      case 'LOCAL':
      case 'QTI PS': 
        return {
          borderClass: 'border-red-500 border-4',
          shadowClass: 'shadow-lg shadow-red-500/40',
          glowClass: 'ring-2 ring-red-400/60',
          bgOverlay: 'bg-red-50/20'
        };
      case 'REGRESSO': 
        return {
          borderClass: 'border-purple-500 border-4',
          shadowClass: 'shadow-lg shadow-purple-500/40',
          glowClass: 'ring-2 ring-purple-400/60',
          bgOverlay: 'bg-purple-50/20'
        };
      case 'BAIXADO': 
        return {
          borderClass: 'border-red-700 border-4',
          shadowClass: 'shadow-xl shadow-red-700/50',
          glowClass: 'ring-3 ring-red-600/70',
          bgOverlay: 'bg-red-100/30'
        };
      case 'RESERVA': 
        return {
          borderClass: 'border-gray-500 border-4',
          shadowClass: 'shadow-md shadow-gray-500/30',
          glowClass: 'ring-1 ring-gray-400/40',
          bgOverlay: 'bg-gray-50/20'
        };
      default: // DISPONÍVEL
        return {
          borderClass: 'border-green-500 border-4',
          shadowClass: 'shadow-md shadow-green-500/30',
          glowClass: 'ring-1 ring-green-400/40',
          bgOverlay: 'bg-green-50/20'
        };
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

  const statusHighlight = getStatusHighlight(vehicle.status);

  return (
    <TooltipProvider>
      <div 
        className={`
          relative group hover:scale-105 transition-all duration-300 cursor-pointer 
          ${statusHighlight.borderClass} ${statusHighlight.shadowClass} ${statusHighlight.glowClass}
          rounded-lg hover:shadow-xl
          w-auto min-w-fit max-w-none
          flex-shrink-0
        `}
        style={{
          boxShadow: '0 6px 12px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
          background: `linear-gradient(145deg, ${getStatusBackgroundColor(vehicle.status)}, rgba(255,255,255,0.8))`,
          ...getBackgroundImage(vehicle.status, vehicle.modalidade),
          padding: '1px'
        }}
        onClick={() => onVehicleClick(vehicle)}
      >
        {/* Overlay para melhor legibilidade com tema de bombeiros */}
        <div 
          className={`absolute inset-0 rounded-md ${statusHighlight.bgOverlay} backdrop-blur-[0.5px]`}
          style={{ zIndex: 1 }}
        />

        <div className="relative z-10 flex h-full min-h-[60px]" style={{ padding: '1px' }}>
          {/* QSA Indicators à esquerda em coluna */}
          <div className="flex flex-col justify-center gap-1 pr-1">
            {(vehicle.qsa_radio || vehicle.qsa_radio === 0) && (
              <div className={`flex items-center gap-0.5 text-xs px-1 py-0.5 rounded shadow-sm ${getQsaColor(vehicle.qsa_radio)}`}>
                <Radio className="w-2 h-2" />
                <span className="font-bold text-xs">{vehicle.qsa_radio}</span>
              </div>
            )}
            {(vehicle.qsa_zello || vehicle.qsa_zello === 0) && (
              <div className={`flex items-center gap-0.5 text-xs px-1 py-0.5 rounded shadow-sm ${getQsaColor(vehicle.qsa_zello)}`}>
                <Smartphone className="w-2 h-2" />
                <span className="font-bold text-xs">{vehicle.qsa_zello}</span>
              </div>
            )}
          </div>

          {/* Conteúdo central */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-1">
            {/* Prefixo com DEJEM na mesma linha */}
            <div className="flex items-center justify-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="text-lg font-black text-red-800 tracking-wide cursor-pointer whitespace-nowrap leading-none"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.4), 0 1px 3px rgba(255,255,255,0.9)',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
                    }}
                  >
                    {vehicle.prefixo}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="font-semibold text-sm text-red-800">🚒 Equipe de Bombeiros</div>
                    {integrantesEquipe.length > 0 ? (
                      integrantesEquipe.map((integrante, index) => (
                        <div key={index} className="text-xs space-y-1">
                          <div className="font-medium">{integrante.nome}</div>
                          <div className="text-gray-600">{integrante.telefone}</div>
                          <div className="text-gray-500">{integrante.cursos.join(', ')}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">Aguardando atribuição de equipe</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              {vehicle.dejem && (
                <DIcon className="w-4 h-4 text-red-700" />
              )}
            </div>

            {/* Botão de status redesenhado */}
            <div className="w-full max-w-[80px]">
              <Button
                className={`w-full h-6 text-xs font-bold text-white border-0 ${getStatusColor(vehicle.status)} hover:opacity-90 shadow-md rounded-md`}
                style={{ 
                  fontSize: 'clamp(8px, 1.5vw, 10px)',
                  whiteSpace: 'nowrap'
                }}
                onClick={handleStatusClick}
              >
                {vehicle.status}
              </Button>
            </div>
          </div>
        </div>

        {/* Indicador de observação no rodapé */}
        {vehicleObservation && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-400/90 text-yellow-900 text-sm px-2 py-1 rounded-b-lg relative z-20 overflow-hidden whitespace-nowrap" 
               title={`⚠️ ${vehicleObservation}`}
               style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>
            <span className="font-bold">⚠️ {vehicleObservation.length > 18 ? `${vehicleObservation.substring(0, 18)}...` : vehicleObservation}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};