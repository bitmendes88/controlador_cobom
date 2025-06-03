
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Users, Phone, GraduationCap, Smartphone } from 'lucide-react';
import { DIcon } from '@/components/DIcon';

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

const coresQuadroStatus: Record<string, string> = {
  'DISPONÍVEL': 'from-green-50 to-green-100 border-green-200',
  'QTI': 'from-blue-50 to-blue-100 border-blue-200',
  'LOCAL': 'from-yellow-50 to-yellow-100 border-yellow-200',
  'QTI PS': 'from-purple-50 to-purple-100 border-purple-200',
  'REGRESSO': 'from-orange-50 to-orange-100 border-orange-200',
  'BAIXADO': 'from-red-100 to-red-200 border-red-300',
  'RESERVA': 'from-gray-100 to-gray-200 border-gray-300',
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
  const [isDEJEM, setIsDEJEM] = useState(false);
  const [qsaRadio, setQsaRadio] = useState<number | null>(null);
  const [qsaZello, setQsaZello] = useState<number | null>(null);

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

  useEffect(() => {
    setIsDEJEM(vehicleObservation?.includes('DEJEM') || false);
    
    // Simular dados QSA - em uma implementação real, viriam do banco de dados
    const hasQsaData = Math.random() > 0.7;
    if (hasQsaData) {
      setQsaRadio(Math.floor(Math.random() * 5) + 1);
      setQsaZello(Math.floor(Math.random() * 5) + 1);
    }
  }, [vehicleObservation]);

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
    return coresQuadroStatus[vehicle.status] || 'from-white to-gray-50 border-gray-300';
  };

  const statusClicavel = vehicle.status !== 'BAIXADO' && vehicle.status !== 'RESERVA';

  const temInformacoes = vehicleObservation || integrantesEquipe.length > 0;

  return (
    <TooltipProvider>
      <div className={`
        relative flex flex-col p-1 border-2 rounded-xl transition-all duration-300 
        bg-gradient-to-br ${obterCorFundo()}
        shadow-[0_4px_8px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.05)] 
        hover:shadow-[0_6px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] 
        transform hover:-translate-y-0.5
        min-w-[160px] w-[160px] min-h-[55px]
      `}>
        
        {/* Indicador de informações no topo direito */}
        {temInformacoes && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-md border border-white">
            <AlertTriangle className="w-2.5 h-2.5 text-white" />
          </div>
        )}

        {/* Área da viatura - Imagem e prefixo */}
        <div className="relative flex-1 flex flex-col justify-start">
          <div className="relative w-full h-6 flex items-center justify-center mb-0.5">
            {vehicle.modalidade?.icone_url ? (
              <img 
                src={vehicle.modalidade.icone_url} 
                alt={`Viatura ${vehicle.prefixo}`}
                className="w-5 h-5 object-contain opacity-60 z-0"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(0.9)',
                }}
              />
            ) : (
              <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center opacity-60">
                <span className="text-gray-300 text-xs">IMG</span>
              </div>
            )}
            
            {/* Prefixo com tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  onClick={() => onVehicleClick(vehicle)}
                >
                  <div 
                    className="text-red-800 font-black text-base whitespace-nowrap pointer-events-none tracking-wider"
                    style={{
                      textShadow: '2px 2px 4px rgba(255,255,255,0.95), -2px -2px 4px rgba(255,255,255,0.95), 2px -2px 4px rgba(255,255,255,0.95), -2px 2px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                    }}
                  >
                    {vehicle.prefixo}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-3" side="top">
                <div className="space-y-3">
                  {vehicleObservation && (
                    <div>
                      <p className="font-semibold text-blue-600 flex items-center gap-1 text-sm mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Observação:
                      </p>
                      <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                        {vehicleObservation}
                      </p>
                    </div>
                  )}
                  
                  {integrantesEquipe.length > 0 && (
                    <div>
                      <p className="font-semibold text-green-600 flex items-center gap-1 text-sm mb-2">
                        <Users className="w-3 h-3" />
                        Equipe:
                      </p>
                      <div className="space-y-2">
                        {integrantesEquipe.map((integrante, index) => (
                          <div key={index} className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-300">
                            <p className="font-medium text-gray-800 mb-1">{integrante.nome}</p>
                            <p className="flex items-center gap-1 text-gray-600 mb-1">
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
                    </div>
                  )}
                  
                  {!vehicleObservation && integrantesEquipe.length === 0 && (
                    <p className="text-sm text-gray-600">Clique para ver detalhes da viatura</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status e indicadores - parte inferior */}
        <div className="flex flex-col items-center space-y-0.5">
          <div className="flex items-center gap-1 mb-1">
            {/* QSA Rádio */}
            {qsaRadio && (
              <div className="flex items-center gap-0.5 text-xs bg-blue-100 px-1 py-0.5 rounded">
                <div className="w-3 h-3 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                  R
                </div>
                <span className="text-blue-700 font-semibold">{qsaRadio}</span>
              </div>
            )}
            
            {/* QSA Zello */}
            {qsaZello && (
              <div className="flex items-center gap-0.5 text-xs bg-green-100 px-1 py-0.5 rounded">
                <Smartphone className="w-3 h-3 text-green-700" />
                <span className="text-green-700 font-semibold">{qsaZello}</span>
              </div>
            )}
            
            {/* DEJEM */}
            {isDEJEM && (
              <DIcon className="w-3 h-3" />
            )}
          </div>
          
          <div className="flex items-center gap-1">
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
          </div>
          
          <div className={`text-xs font-bold ${obterCorTempo()}`}
               style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            {tempoNoStatus}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
