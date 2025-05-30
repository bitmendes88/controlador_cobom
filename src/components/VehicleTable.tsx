
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Download, Calendar, Play } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;

interface VehicleTableProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  onVehicleAction: (vehicleId: string, action: 'baixar' | 'reserva' | 'levantar') => void;
}

const statusColors: Record<string, string> = {
  'Available': 'bg-green-500',
  'En Route': 'bg-blue-500',
  'On Scene': 'bg-yellow-500',
  'En Route to Hospital': 'bg-purple-500',
  'Returning to Base': 'bg-orange-500',
  'Indisponível': 'bg-red-500',
  'Reserva': 'bg-gray-500',
};

const statusOptions = [
  'Available',
  'En Route',
  'On Scene',
  'En Route to Hospital',
  'Returning to Base'
];

export const VehicleTable = ({ vehicles, onVehicleClick, onStatusUpdate, onVehicleAction }: VehicleTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-4 font-semibold text-gray-900">Unit</th>
            <th className="text-left p-4 font-semibold text-gray-900">Type</th>
            <th className="text-left p-4 font-semibold text-gray-900">Status</th>
            <th className="text-left p-4 font-semibold text-gray-900">Status Controls</th>
            <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVehicleClick(vehicle)}
                    className="p-2 hover:bg-red-100"
                  >
                    <Truck className="w-5 h-5 text-red-600" />
                  </Button>
                  <span className="font-bold text-lg text-red-800">{vehicle.prefix}</span>
                </div>
              </td>
              <td className="p-4 text-gray-700">{vehicle.vehicle_type}</td>
              <td className="p-4">
                <Badge className={`${statusColors[vehicle.status || 'Available']} text-white`}>
                  {vehicle.status}
                </Badge>
              </td>
              <td className="p-4">
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      variant={vehicle.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => onStatusUpdate(vehicle.id, status)}
                      className={`text-xs ${
                        vehicle.status === status 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'border-red-300 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {status === 'En Route to Hospital' ? 'To Hospital' : status}
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
                    disabled={vehicle.status === 'Indisponível'}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onVehicleAction(vehicle.id, 'reserva')}
                    className="border-gray-500 text-gray-600 hover:bg-gray-50"
                    disabled={vehicle.status === 'Reserva'}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Reserva
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onVehicleAction(vehicle.id, 'levantar')}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    disabled={vehicle.status === 'Available'}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Levantar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
