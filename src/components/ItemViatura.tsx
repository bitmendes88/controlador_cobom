
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const statusSequence = [
    'DISPONÍVEL',
    'QTI',
    'LOCAL', 
    'QTI PS',
    'REGRESSO',
    'BAIXADO',
    'RESERVA'
  ];

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusSequence.indexOf(currentStatus);
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
        className="relative group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 bg-white"
        style={{
          minWidth: `${cardWidth}px`,
          maxWidth: `${cardWidth}px`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
        onClick={() => onVehicleClick(vehicle)}
      >
        <div className="p-2 space-y-2 relative">
          {/* Ícone da modalidade como marca d'água */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img 
              src={vehicle.modalidade.icone_url} 
              alt={vehicle.modalidade.nome}
              className="w-16 h-16 object-contain opacity-10 filter grayscale"
            />
          </div>

          {/* Prefixo com tooltip para informações da equipe */}
          <div className="text-center relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="text-2xl font-black text-red-800 tracking-wide cursor-pointer"
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

            {/* QSA Indicators */}
            <div className="flex items-center justify-center gap-2">
              {vehicle.qsa_radio && (
                <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                  <Radio className="w-3 h-3" />
                  <span className="font-medium">{vehicle.qsa_radio}</span>
                </div>
              )}
              {vehicle.qsa_zello && (
                <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
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

          {/* Indicador de equipe */}
          {integrantesEquipe.length > 0 && (
            <div className="text-xs text-center relative z-10">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {integrantesEquipe.length} integrante{integrantesEquipe.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};
