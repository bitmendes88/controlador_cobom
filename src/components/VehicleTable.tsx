
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Truck, Download, Calendar, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Viatura = Tables<'viaturas'>;

interface VehicleTableProps {
  vehicles: (Viatura & {
    modalidade: {
      nome: string;
      icone_url: string;
    };
  })[];
  onVehicleClick: (vehicle: Viatura) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  onVehicleAction: (vehicleId: string, action: 'baixar' | 'RESERVA' | 'levantar') => void;
}

const statusColors: Record<string, string> = {
  'DISPONÍVEL': 'bg-green-500',
  'QTI': 'bg-blue-500',
  'LOCAL': 'bg-yellow-500',
  'QTI PS': 'bg-purple-500',
  'REGRESSO': 'bg-orange-500',
  'BAIXADO': 'bg-red-500',
  'RESERVA': 'bg-gray-500',
};

const statusOptions = [
  'DISPONÍVEL',
  'QTI',
  'LOCAL',
  'QTI PS',
  'REGRESSO'
];

export const VehicleTable = ({ vehicles, onVehicleClick, onStatusUpdate, onVehicleAction }: VehicleTableProps) => {
  const [vehicleObservations, setVehicleObservations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadObservations();
  }, [vehicles]);

  const loadObservations = async () => {
    try {
      const vehicleIds = vehicles.map(v => v.id);
      if (vehicleIds.length === 0) return;

      const { data, error } = await supabase
        .from('observacoes_viatura')
        .select('viatura_id, observacao')
        .in('viatura_id', vehicleIds)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const obsMap: Record<string, string> = {};
      data?.forEach(obs => {
        if (!obsMap[obs.viatura_id]) {
          obsMap[obs.viatura_id] = obs.observacao;
        }
      });
      setVehicleObservations(obsMap);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
    }
  };

  const getDisplayStatus = (vehicle: Viatura & { modalidade: { nome: string; icone_url: string; } }) => {
    return vehicle.status || 'DISPONÍVEL';
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-900">Unidade</th>
              <th className="text-left p-4 font-semibold text-gray-900">Tipo</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Controles de Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const displayStatus = getDisplayStatus(vehicle);
              return (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onVehicleClick(vehicle)}
                            className="p-2 hover:bg-red-100"
                          >
                            <Truck className="w-5 h-5 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{vehicleObservations[vehicle.id] || 'Nenhuma observação disponível'}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="font-bold text-lg text-red-800">{vehicle.prefixo}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{vehicle.modalidade.nome}</td>
                  <td className="p-4">
                    <Badge className={`${statusColors[displayStatus]} text-white`}>
                      {displayStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {statusOptions.map((status) => (
                        <Button
                          key={status}
                          variant={displayStatus === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => onStatusUpdate(vehicle.id, status)}
                          className={`text-xs ${
                            displayStatus === status 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {status === 'QTI PS' ? 'Para Hospital' : status}
                        </Button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onVehicleAction(vehicle.id, 'baixar')}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        disabled={displayStatus === 'BAIXADO'}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onVehicleAction(vehicle.id, 'RESERVA')}
                        className="border-gray-500 text-gray-600 hover:bg-gray-50"
                        disabled={displayStatus === 'RESERVA'}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        RESERVA
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onVehicleAction(vehicle.id, 'levantar')}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        disabled={displayStatus === 'DISPONÍVEL'}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Levantar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};
