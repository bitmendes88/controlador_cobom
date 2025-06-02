
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Edit, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  prefix: string;
  status: string;
  category: string;
  station_id: string;
  sub_station_id: string;
  vehicle_type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  status_changed_at: string;
}

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onVehicleAction: (vehicleId: string, action: 'RESERVA' | 'BAIXAR' | 'LEVANTAR') => void;
  onVehicleDelete: (vehicleId: string) => void;
  onEditVehicle: (vehicle: any) => void;
}

export const VehicleDetailModal = ({ 
  vehicle, 
  onClose, 
  onVehicleAction, 
  onVehicleDelete,
  onEditVehicle 
}: VehicleDetailModalProps) => {
  const [observacoes, setObservacoes] = useState<any[]>([]);
  const [novaObservacao, setNovaObservacao] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarObservacoes();
  }, [vehicle.id]);

  const carregarObservacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('observacoes_viatura')
        .select('*')
        .eq('viatura_id', vehicle.id)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setObservacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
    }
  };

  const adicionarObservacao = async () => {
    if (!novaObservacao.trim()) return;

    setEstaCarregando(true);
    try {
      const { error } = await supabase
        .from('observacoes_viatura')
        .insert({
          viatura_id: vehicle.id,
          observacao: novaObservacao,
          criado_por: 'Sistema'
        });

      if (error) throw error;

      toast({
        title: "Observação Adicionada",
        description: "Nova observação foi salva com sucesso.",
      });
      
      setNovaObservacao('');
      carregarObservacoes();
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar observação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEstaCarregando(false);
    }
  };

  const excluirObservacao = async (observacaoId: string) => {
    try {
      const { error } = await supabase
        .from('observacoes_viatura')
        .delete()
        .eq('id', observacaoId);

      if (error) throw error;

      toast({
        title: "Observação Removida",
        description: "Observação foi excluída com sucesso.",
      });
      
      carregarObservacoes();
    } catch (error) {
      console.error('Erro ao excluir observação:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir observação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const excluirViatura = async () => {
    if (!confirm('Tem certeza que deseja excluir esta viatura? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('viaturas')
        .delete()
        .eq('id', vehicle.id);

      if (error) throw error;

      toast({
        title: "Viatura Excluída",
        description: `Viatura ${vehicle.prefix} foi excluída com sucesso.`,
      });
      
      onVehicleDelete(vehicle.id);
      onClose();
    } catch (error) {
      console.error('Erro ao excluir viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir viatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONÍVEL': return 'bg-green-500';
      case 'QTI': return 'bg-yellow-500';
      case 'LOCAL': return 'bg-blue-500';
      case 'QTI PS': return 'bg-orange-500';
      case 'REGRESSO': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Viatura {vehicle.prefix}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditVehicle(vehicle)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={excluirViatura}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge className={`${getStatusColor(vehicle.status)} text-white`}>
              {vehicle.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Modalidade:</span>
            <span>{vehicle.vehicle_type}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Ações Rápidas</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVehicleAction(vehicle.id, 'RESERVA')}
                className="text-xs"
              >
                Reserva
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVehicleAction(vehicle.id, 'BAIXAR')}
                className="text-xs"
              >
                Baixar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVehicleAction(vehicle.id, 'LEVANTAR')}
                className="text-xs"
              >
                Levantar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Observações</h4>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Digite uma observação..."
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                onClick={adicionarObservacao}
                disabled={estaCarregando || !novaObservacao.trim()}
                size="sm"
                className="w-full"
              >
                {estaCarregando ? 'Salvando...' : 'Adicionar Observação'}
              </Button>
            </div>

            {observacoes.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {observacoes.map((obs) => (
                  <div key={obs.id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex justify-between items-start">
                      <p className="flex-1">{obs.observacao}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirObservacao(obs.id)}
                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(obs.criado_em).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {observacoes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma observação registrada
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
