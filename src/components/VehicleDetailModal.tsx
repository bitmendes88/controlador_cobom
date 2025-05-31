
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Truck, Users, Phone, Clock, FileText, Save, Download, Calendar, Play, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type VehicleObservation = Tables<'vehicle_observations'>;

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onVehicleAction?: (vehicleId: string, action: 'baixar' | 'reserva' | 'levantar') => void;
  onVehicleDelete?: (vehicleId: string) => void;
}

// Map English database values to Portuguese display
const dbToStatusMap: Record<string, string> = {
  'Available': 'Disponível',
  'En Route': 'A Caminho',
  'On Scene': 'No Local',
  'En Route to Hospital': 'A Caminho do Hospital',
  'Returning to Base': 'Retornando à Base'
};

export const VehicleDetailModal = ({ vehicle, onClose, onVehicleAction, onVehicleDelete }: VehicleDetailModalProps) => {
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
      console.error('Erro ao carregar detalhes da viatura:', error);
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
          created_by: 'Usuário Atual'
        });

      if (error) throw error;

      setNewObservation('');
      loadVehicleDetails();
      
      toast({
        title: "Observação Adicionada",
        description: "A observação da viatura foi registrada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar observação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deleteObservation = async (observationId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_observations')
        .delete()
        .eq('id', observationId);

      if (error) throw error;

      loadVehicleDetails();
      
      toast({
        title: "Observação Excluída",
        description: "A observação foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir observação:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir observação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta viatura? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);

        if (error) throw error;

        toast({
          title: "Viatura Excluída",
          description: "A viatura foi removida do sistema.",
        });

        if (onVehicleDelete) {
          onVehicleDelete(vehicle.id);
        }
        onClose();
      } catch (error) {
        console.error('Erro ao excluir viatura:', error);
        toast({
          title: "Erro",
          description: "Falha ao excluir viatura. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const statusColors: Record<string, string> = {
    'Disponível': 'bg-green-600',
    'A Caminho': 'bg-blue-600',
    'No Local': 'bg-yellow-600',
    'A Caminho do Hospital': 'bg-purple-600',
    'Retornando à Base': 'bg-orange-600',
  };

  const currentStatus = dbToStatusMap[vehicle.status as string] || vehicle.status || 'Disponível';

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
              <CardTitle className="text-red-800">Detalhes da Viatura</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Unidade:</span>
                <span className="font-bold text-red-800">{vehicle.prefix}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Categoria:</span>
                <span>{vehicle.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Tipo:</span>
                <span>{vehicle.vehicle_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status:</span>
                <Badge className={`${statusColors[currentStatus]} text-white`}>
                  {currentStatus}
                </Badge>
              </div>
              {vehicle.image_url && (
                <div className="mt-4">
                  <img 
                    src={vehicle.image_url} 
                    alt={`Viatura ${vehicle.prefix}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-red-200"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {onVehicleAction && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-red-800">Ações</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onVehicleAction(vehicle.id, 'baixar')}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onVehicleAction(vehicle.id, 'reserva')}
                      className="border-gray-500 text-gray-600 hover:bg-gray-50"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Reserva
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onVehicleAction(vehicle.id, 'levantar')}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Levantar
                    </Button>
                  </div>
                </div>
              )}

              {/* Delete Vehicle Button */}
              <div className="mt-6 pt-4 border-t border-red-200">
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteVehicle}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir Viatura
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Crew Information */}
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Users className="w-5 h-5" />
                Guarnição Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <p>Carregando informações da guarnição...</p>
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
                          {new Date(assignment.duty_start).toLocaleString('pt-BR')} - 
                          {assignment.duty_end ? new Date(assignment.duty_end).toLocaleString('pt-BR') : 'Em Serviço'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma guarnição atribuída no momento</p>
              )}
            </CardContent>
          </Card>

          {/* Observations */}
          <Card className="border-red-200 md:col-span-2">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <FileText className="w-5 h-5" />
                Observações da Viatura
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Add new observation */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Adicione uma nova observação sobre esta viatura..."
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  className="border-red-300 focus:border-red-500"
                />
                <Button 
                  onClick={addObservation}
                  className="bg-red-700 hover:bg-red-800 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Adicionar Observação
                </Button>
              </div>

              {/* Existing observations */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {observations.length > 0 ? (
                  observations.map((obs) => (
                    <div key={obs.id} className="bg-gray-50 p-3 rounded border-l-4 border-red-500 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteObservation(obs.id)}
                        className="absolute top-2 right-2 p-1 h-6 w-6 text-red-600 hover:bg-red-100"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <p className="text-sm pr-8">{obs.observation}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        Por {obs.created_by} em {new Date(obs.created_at || '').toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma observação registrada ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
