
import { VehicleItem } from './VehicleItem';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type FireSubStation = Tables<'fire_sub_stations'>;

interface StationVehiclesRowProps {
  station: FireSubStation;
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  onStatusUpdate: (vehicleId: string, status: string) => void;
  vehicleObservations: Record<string, string>;
}

export const StationVehiclesRow = ({ 
  station, 
  vehicles, 
  onVehicleClick, 
  onStatusUpdate, 
  vehicleObservations 
}: StationVehiclesRowProps) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-start space-x-6">
        {/* Station Name */}
        <div className="min-w-[200px] pt-3">
          <h3 className="font-semibold text-red-800 text-lg">{station.name}</h3>
        </div>

        {/* Vehicles Row */}
        <div className="flex-1">
          {vehicles.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {vehicles.map((vehicle) => (
                <VehicleItem
                  key={vehicle.id}
                  vehicle={vehicle}
                  onVehicleClick={onVehicleClick}
                  onStatusUpdate={onStatusUpdate}
                  vehicleObservation={vehicleObservations[vehicle.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic pt-6">Nenhuma viatura atribuída</div>
          )}
        </div>
      </div>
    </div>
  );
};
