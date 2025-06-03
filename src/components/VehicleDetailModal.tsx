import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, AlertTriangle, Smartphone, Radio } from 'lucide-react';
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
  const [qsaRadio, setQsaRadio] = useState<number | null>(null);
  const [qsaZello, setQsaZello] = useState<number | null>(null);
  const [isDejem, setIsDejem] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarObservacoes();
    // Verificar se já tem QSA definido (simular dados do banco)
    setQsaRadio(Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : null);
    setQsaZello(Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : null);
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

  const salvarQsaRadio = async (nota: number) => {
    setEstaCarregando(true);
    try {
      // Em uma implementação real, salvaria no banco
      setQsaRadio(nota);
      
      toast({
        title: "QSA Rádio Atualizado",
        description: `QSA Rádio definido como ${nota}`,
      });
    } catch (error) {
      console.error('Erro ao salvar QSA Rádio:', error);
    } finally {
      setEstaCarregando(false);
    }
  };

  const salvarQsaZello = async (nota: number) => {
    setEstaCarregando(true);
    try {
      // Em uma implementação real, salvaria no banco
      setQsaZello(nota);
      
      toast({
        title: "QSA Zello Atualizado",
        description: `QSA Zello definido como ${nota}`,
      });
    } catch (error) {
      console.error('Erro ao salvar QSA Zello:', error);
    } finally {
      setEstaCarregando(false);
    }
  };

  const toggleDejem = async () => {
    setEstaCarregando(true);
    try {
      const novoStatus = !isDejem;
      
      if (novoStatus) {
        const { error } = await supabase
          .from('observacoes_viatura')
          .insert({
            viatura_id: vehicle.id,
            observacao: 'DEJEM',
            criado_por: 'Sistema'
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('observacoes_viatura')
          .delete()
          .eq('viatura_id', vehicle.id)
          .eq('observacao', 'DEJEM');
        if (error) throw error;
      }

      setIsDejem(novoStatus);
      
      toast({
        title: novoStatus ? "DEJEM Ativado" : "DEJEM Desativado",
        description: novoStatus ? "Viatura marcada como DEJEM" : "Viatura desmarcada como DEJEM",
      });
      
      carregarObservacoes();
    } catch (error) {
      console.error('Erro ao alterar DEJEM:', error);
    } finally {
      setEstaCarregando(false);
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

          {/* QSA Controls */}
          <div className="space-y-3">
            <h4 className="font-medium">Qualidade do Sinal de Áudio (QSA)</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Radio className="w-4 h-4" />
                  QSA Rádio
                </label>
                <Select value={qsaRadio?.toString() || ""} onValueChange={(value) => salvarQsaRadio(parseInt(value))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Nota 1-5" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <SelectItem key={nota} value={nota.toString()}>
                        {nota}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  QSA Zello
                </label>
                <Select value={qsaZello?.toString() || ""} onValueChange={(value) => salvarQsaZello(parseInt(value))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Nota 1-5" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <SelectItem key={nota} value={nota.toString()}>
                        {nota}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Ações Rápidas</h4>
            <div className="grid grid-cols-2 gap-2">
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
              <Button
                size="sm"
                variant={isDejem ? "default" : "outline"}
                onClick={toggleDejem}
                disabled={estaCarregando}
                className={`text-xs ${isDejem ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
              >
                {isDejem ? 'Remover DEJEM' : 'Marcar DEJEM'}
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
