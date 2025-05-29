import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Truck, Users, Phone, Clock, GraduationCap, FileText, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type CrewMember = Tables<'crew_members'>;
type VehicleCrewAssignment = Tables<'vehicle_crew_assignments'>;
type TrainingCourse = Tables<'training_courses'>;
type VehicleObservation = Tables<'vehicle_observations'>;

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const VehicleDetailModal = ({ vehicle, onClose }: VehicleDetailModalProps) => {
  const [crewAssignments, setCrewAssignments] = useState<any[]>([]);
  const [observations, setObservations] = useState<VehicleObservation[]>([]);
  const [newObservation, setNewObservation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicle.id]);

  const loadVehicleDetails = async () => {
    try {
      // Load crew assignments with crew member details
      const { data: crewData, error: crewError } = await supabase
        .from('vehicle_crew_assignments')
        .select(`
          *,
          crew_members (
            id,
            name,
            phone,
            position
          )
        `)
        .eq('vehicle_id', vehicle.id);

      if (crewError) throw crewError;
      setCrewAssignments(crewData || []);

      // Load observations
      const { data: obsData, error: obsError } = await supabase
        .from('vehicle_observations')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('created_at', { ascending: false });

      if (obsError) throw obsError;
      setObservations(obsData || []);

    } catch (error) {
      console.error('Error loading vehicle details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addObservation = async () => {
    if (!newObservation.trim()) return;

    try {
      const { error } = await supabase
        .from('vehicle_observations')
        .insert({
          vehicle_id: vehicle.id,
          observation: newObservation,
          created_by: 'Current User'
        });

      if (error) throw error;

      setNewObservation('');
      loadVehicleDetails();
      
      toast({
        title: "Observation Added",
        description: "Vehicle observation has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error adding observation:', error);
      toast({
        title: "Error",
        description: "Failed to add observation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusColors: Record<string, string> = {
    'Available': 'bg-green-500',
    'En Route': 'bg-blue-500',
    'On Scene': 'bg-yellow-500',
    'En Route to Hospital': 'bg-purple-500',
    'Returning to Base': 'bg-orange-500',
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-red-800">
            <Truck className="w-6 h-6" />
            {vehicle.prefix} - {vehicle.vehicle_type}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Info */}
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Unit:</span>
                <span className="font-bold text-red-800">{vehicle.prefix}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Category:</span>
                <span>{vehicle.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Type:</span>
                <span>{vehicle.vehicle_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status:</span>
                <Badge className={`${statusColors[vehicle.status || 'Available']} text-white`}>
                  {vehicle.status}
                </Badge>
              </div>
              {vehicle.image_url && (
                <div className="mt-4">
                  <img 
                    src={vehicle.image_url} 
                    alt={`${vehicle.prefix} vehicle`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-red-200"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crew Information */}
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Users className="w-5 h-5" />
                Current Crew
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <p>Loading crew information...</p>
              ) : crewAssignments.length > 0 ? (
                <div className="space-y-3">
                  {crewAssignments.map((assignment) => (
                    <div key={assignment.id} className="border-l-4 border-red-500 pl-3">
                      <div className="font-semibold">{assignment.crew_members.name}</div>
                      <div className="text-sm text-gray-600">{assignment.crew_members.position}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        {assignment.crew_members.phone}
                      </div>
                      {assignment.duty_start && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {new Date(assignment.duty_start).toLocaleString()} - 
                          {assignment.duty_end ? new Date(assignment.duty_end).toLocaleString() : 'On Duty'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No crew currently assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Observations */}
          <Card className="border-red-200 md:col-span-2">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <FileText className="w-5 h-5" />
                Vehicle Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Add new observation */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a new observation about this vehicle..."
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  className="border-red-300 focus:border-red-500"
                />
                <Button 
                  onClick={addObservation}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Observation
                </Button>
              </div>

              {/* Existing observations */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {observations.length > 0 ? (
                  observations.map((obs) => (
                    <div key={obs.id} className="bg-gray-50 p-3 rounded border-l-4 border-red-500">
                      <p className="text-sm">{obs.observation}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        By {obs.created_by} on {new Date(obs.created_at || '').toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No observations recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
