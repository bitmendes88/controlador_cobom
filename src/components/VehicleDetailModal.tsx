
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Radio, Smartphone } from 'lucide-react';
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
  integrantesEquipe?: Array<{
    nome: string;
    telefone: string;
    cursos: string[];
  }>;
}

export const VehicleDetailModal = ({ 
  vehicle, 
  onClose, 
  onVehicleAction, 
  onVehicleDelete,
  onEditVehicle,
  integrantesEquipe = []
}: VehicleDetailModalProps) => {
  const [observacao, setObservacao] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [qsaRadio, setQsaRadio] = useState<number | null>(null);
  const [qsaZello, setQsaZello] = useState<number | null>(null);
  const [isDejem, setIsDejem] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarObservacao();
    carregarDadosViatura();
  }, [vehicle.id]);

  const carregarDadosViatura = async () => {
    try {
      const { data, error } = await supabase
        .from('viaturas')
        .select('qsa_radio, qsa_zello, dejem')
        .eq('id', vehicle.id)
        .single();

      if (error) throw error;
      
      setQsaRadio(data.qsa_radio);
      setQsaZello(data.qsa_zello);
      setIsDejem(data.dejem || false);
    } catch (error) {
      console.error('Erro ao carregar dados da viatura:', error);
    }
  };

  const carregarObservacao = async () => {
    try {
      const { data, error } = await supabase
        .from('observacoes_viatura')
        .select('*')
        .eq('viatura_id', vehicle.id)
        .order('criado_em', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setObservacao(data?.observacao || '');
    } catch (error) {
      console.error('Erro ao carregar observação:', error);
      setObservacao('');
    }
  };

  const salvarObservacao = async (novaObservacao: string) => {
    if (!novaObservacao.trim()) {
      // Se observação está vazia, deletar a observação existente
      try {
        await supabase
          .from('observacoes_viatura')
          .delete()
          .eq('viatura_id', vehicle.id);
      } catch (error) {
        console.error('Erro ao deletar observação:', error);
      }
      return;
    }

    try {
      // Verificar se já existe uma observação
      const { data: existing } = await supabase
        .from('observacoes_viatura')
        .select('id')
        .eq('viatura_id', vehicle.id)
        .single();

      if (existing) {
        // Atualizar observação existente
        const { error } = await supabase
          .from('observacoes_viatura')
          .update({ 
            observacao: novaObservacao,
            criado_em: new Date().toISOString()
          })
          .eq('viatura_id', vehicle.id);

        if (error) throw error;
      } else {
        // Criar nova observação
        const { error } = await supabase
          .from('observacoes_viatura')
          .insert({
            viatura_id: vehicle.id,
            observacao: novaObservacao,
            criado_por: 'Sistema'
          });

        if (error) throw error;
      }

      toast({
        title: "Observação Salva",
        description: "Observação atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar observação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Debounce para salvamento automático
  useEffect(() => {
    const timer = setTimeout(() => {
      if (observacao !== undefined) {
        salvarObservacao(observacao);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [observacao]);

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

  const getQsaButtonColor = (value: number, currentValue: number | null) => {
    if (currentValue === value) {
      switch (value) {
        case 0: return 'bg-red-500 text-white border-red-600';
        case 1: return 'bg-red-400 text-white border-red-500';
        case 2: return 'bg-orange-400 text-white border-orange-500';
        case 3: return 'bg-yellow-400 text-white border-yellow-500';
        case 4: return 'bg-lime-400 text-white border-lime-500';
        case 5: return 'bg-green-500 text-white border-green-600';
        default: return 'bg-gray-200 text-gray-700 border-gray-300';
      }
    }
    return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
  };

  const salvarQsaRadio = async (nota: number) => {
    setEstaCarregando(true);
    try {
      const { error } = await supabase
        .from('viaturas')
        .update({ qsa_radio: nota })
        .eq('id', vehicle.id);

      if (error) throw error;
      
      setQsaRadio(nota);
      
      toast({
        title: "QSA Rádio Atualizado",
        description: `QSA Rádio definido como ${nota}`,
      });
    } catch (error) {
      console.error('Erro ao salvar QSA Rádio:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar QSA Rádio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEstaCarregando(false);
    }
  };

  const salvarQsaZello = async (nota: number) => {
    setEstaCarregando(true);
    try {
      const { error } = await supabase
        .from('viaturas')
        .update({ qsa_zello: nota })
        .eq('id', vehicle.id);

      if (error) throw error;
      
      setQsaZello(nota);
      
      toast({
        title: "QSA Zello Atualizado",
        description: `QSA Zello definido como ${nota}`,
      });
    } catch (error) {
      console.error('Erro ao salvar QSA Zello:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar QSA Zello. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEstaCarregando(false);
    }
  };

  const toggleDejem = async (novoStatus: boolean) => {
    setEstaCarregando(true);
    try {
      const { error } = await supabase
        .from('viaturas')
        .update({ dejem: novoStatus })
        .eq('id', vehicle.id);

      if (error) throw error;
      
      setIsDejem(novoStatus);
      
      toast({
        title: novoStatus ? "DEJEM Ativado" : "DEJEM Desativado",
        description: novoStatus ? "Viatura marcada como DEJEM" : "Viatura desmarcada como DEJEM",
      });
    } catch (error) {
      console.error('Erro ao alterar DEJEM:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status DEJEM. Tente novamente.",
        variant: "destructive",
      });
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

          {/* Informações da Equipe */}
          {integrantesEquipe.length > 0 && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium">Integrantes da Equipe</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {integrantesEquipe.map((integrante, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm">{integrante.nome}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>📞 {integrante.telefone}</div>
                        {integrante.cursos.length > 0 && (
                          <div className="mt-1">
                            <span className="font-medium">Cursos: </span>
                            <span className="text-gray-500">{integrante.cursos.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {integrantesEquipe.length === 0 && (
            <>
              <div className="space-y-2">
                <h4 className="font-medium">Integrantes da Equipe</h4>
                <p className="text-sm text-gray-500 text-center py-2">
                  Nenhum integrante atribuído a esta viatura
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* DEJEM Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="dejem-switch" className="font-medium">DEJEM</Label>
            <Switch
              id="dejem-switch"
              checked={isDejem}
              onCheckedChange={toggleDejem}
              disabled={estaCarregando}
            />
          </div>

          <Separator />

          {/* QSA Controls */}
          <div className="space-y-3">
            <h4 className="font-medium">Qualidade do Sinal de Áudio (QSA)</h4>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Radio className="w-4 h-4" />
                  QSA Rádio
                </label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`w-8 h-8 p-0 ${qsaRadio === null ? 'bg-gray-300 text-gray-700 border-gray-400' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                    onClick={() => setQsaRadio(null)}
                  >
                    -
                  </Button>
                  {[0, 1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`w-8 h-8 p-0 ${getQsaButtonColor(value, qsaRadio)}`}
                      onClick={() => salvarQsaRadio(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  QSA Zello
                </label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`w-8 h-8 p-0 ${qsaZello === null ? 'bg-gray-300 text-gray-700 border-gray-400' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                    onClick={() => setQsaZello(null)}
                  >
                    -
                  </Button>
                  {[0, 1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`w-8 h-8 p-0 ${getQsaButtonColor(value, qsaZello)}`}
                      onClick={() => salvarQsaZello(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
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

          <div className="space-y-2">
            <h4 className="font-medium">Observação</h4>
            <Textarea
              placeholder="Digite uma observação... (salvamento automático)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-gray-500">
              A observação é salva automaticamente após 1,5 segundos
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
