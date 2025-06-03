
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const statusOptions = [
    'DISPONÍVEL',
    'QTI',
    'LOCAL', 
    'QTI PS',
    'REGRESSO',
    'BAIXADO',
    'RESERVA'
  ];

  return (
    <Card 
      className="relative group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 bg-white"
      style={{
        minWidth: '140px',
        maxWidth: '140px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}
      onClick={() => onVehicleClick(vehicle)}
    >
      <div className="p-2 space-y-2">
        {/* Ícone da modalidade mais sutil */}
        <div className="relative flex justify-center">
          <img 
            src={vehicle.modalidade.icone_url} 
            alt={vehicle.modalidade.nome}
            className="w-8 h-8 object-contain opacity-60 filter grayscale-[20%]"
          />
        </div>

        {/* Prefixo com destaque aumentado */}
        <div className="text-center">
          <div 
            className="text-2xl font-black text-red-800 tracking-wide"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.8)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              fontSize: '1.75rem',
              lineHeight: '1.2'
            }}
          >
            {vehicle.prefixo}
          </div>
        </div>

        {/* Status e indicadores */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {vehicle.dejem && (
                <DIcon className="w-4 h-4" />
              )}
              <Select 
                value={vehicle.status} 
                onValueChange={(value) => onStatusUpdate(vehicle.id, value)}
              >
                <SelectTrigger 
                  className={`h-6 text-xs font-medium text-white border-0 ${getStatusColor(vehicle.status)} hover:opacity-90`}
                  style={{ minWidth: '70px', fontSize: '10px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <div className="text-xs text-gray-600 bg-yellow-50 p-1 rounded border-l-2 border-yellow-400 truncate">
            {vehicleObservation}
          </div>
        )}

        {/* Indicador de equipe */}
        {integrantesEquipe.length > 0 && (
          <div className="text-xs text-center">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              {integrantesEquipe.length} integrante{integrantesEquipe.length > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
