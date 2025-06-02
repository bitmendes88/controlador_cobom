
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Viatura {
  id: string;
  prefixo: string;
  modalidade: {
    id: string;
    nome: string;
  };
  estacao: {
    id: string;
    nome: string;
    subgrupamento: {
      id: string;
      nome: string;
      grupamento_id: string;
    };
  };
}

interface Grupamento {
  id: string;
  nome: string;
}

interface Subgrupamento {
  id: string;
  nome: string;
  grupamento_id: string;
}

interface Estacao {
  id: string;
  nome: string;
  subgrupamento_id: string;
}

interface Modalidade {
  id: string;
  nome: string;
}

interface FormularioEditarViaturaProps {
  vehicle: Viatura;
  onClose: () => void;
  onVehicleUpdated: () => void;
}

export const FormularioEditarViatura = ({ vehicle, onClose, onVehicleUpdated }: FormularioEditarViaturaProps) => {
  // Add safety checks for nested properties
  const [dadosFormulario, setDadosFormulario] = useState({
    prefixo: vehicle?.prefixo || '',
    grupamentoId: vehicle?.estacao?.subgrupamento?.grupamento_id || '',
    subgrupamentoId: vehicle?.estacao?.subgrupamento?.id || '',
    estacaoId: vehicle?.estacao?.id || '',
    modalidadeId: vehicle?.modalidade?.id || ''
  });
  
  const [grupamentos, setGrupamentos] = useState<Grupamento[]>([]);
  const [subgrupamentos, setSubgrupamentos] = useState<Subgrupamento[]>([]);
  const [estacoes, setEstacoes] = useState<Estacao[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [subgrupamentosFiltrados, setSubgrupamentosFiltrados] = useState<Subgrupamento[]>([]);
  const [estacoesFiltradas, setEstacoesFiltradas] = useState<Estacao[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (dadosFormulario.grupamentoId) {
      const filtrados = subgrupamentos.filter(sub => sub.grupamento_id === dadosFormulario.grupamentoId);
      setSubgrupamentosFiltrados(filtrados);
    } else {
      setSubgrupamentosFiltrados([]);
    }
  }, [dadosFormulario.grupamentoId, subgrupamentos]);

  useEffect(() => {
    if (dadosFormulario.subgrupamentoId) {
      const filtradas = estacoes.filter(est => est.subgrupamento_id === dadosFormulario.subgrupamentoId);
      setEstacoesFiltradas(filtradas);
    } else {
      setEstacoesFiltradas([]);
    }
  }, [dadosFormulario.subgrupamentoId, estacoes]);

  const carregarDados = async () => {
    try {
      const [grupamentosRes, subgrupamentosRes, estacoesRes, modalidadesRes] = await Promise.all([
        supabase.from('grupamentos').select('*').order('nome'),
        supabase.from('subgrupamentos').select('*').order('nome'),
        supabase.from('estacoes').select('*').order('nome'),
        supabase.from('modalidades_viatura').select('*').order('nome')
      ]);

      if (grupamentosRes.error) throw grupamentosRes.error;
      if (subgrupamentosRes.error) throw subgrupamentosRes.error;
      if (estacoesRes.error) throw estacoesRes.error;
      if (modalidadesRes.error) throw modalidadesRes.error;

      setGrupamentos(grupamentosRes.data || []);
      setSubgrupamentos(subgrupamentosRes.data || []);
      setEstacoes(estacoesRes.data || []);
      setModalidades(modalidadesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dadosFormulario.prefixo || !dadosFormulario.estacaoId || !dadosFormulario.modalidadeId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setEstaCarregando(true);
    try {
      const { error } = await supabase
        .from('viaturas')
        .update({
          prefixo: dadosFormulario.prefixo,
          modalidade_id: dadosFormulario.modalidadeId,
          estacao_id: dadosFormulario.estacaoId,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', vehicle.id);

      if (error) throw error;

      toast({
        title: "Viatura Atualizada",
        description: `Viatura ${dadosFormulario.prefixo} foi atualizada com sucesso.`,
      });
      
      onVehicleUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar viatura. Verifique se o prefixo não está duplicado.",
        variant: "destructive",
      });
    } finally {
      setEstaCarregando(false);
    }
  };

  // Add safety check before rendering
  if (!vehicle || !vehicle.estacao || !vehicle.estacao.subgrupamento || !vehicle.modalidade) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p>Dados da viatura incompletos. Não é possível editar.</p>
            <Button onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Viatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={aoSubmeter} className="space-y-3">
          <div>
            <Label htmlFor="prefixo">Prefixo *</Label>
            <Input
              id="prefixo"
              value={dadosFormulario.prefixo}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, prefixo: e.target.value }))}
              placeholder="Ex: AB-01"
              required
            />
          </div>

          <div>
            <Label htmlFor="grupamentoId">Grupamento *</Label>
            <Select value={dadosFormulario.grupamentoId} onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, grupamentoId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupamento" />
              </SelectTrigger>
              <SelectContent>
                {grupamentos.map((grupamento) => (
                  <SelectItem key={grupamento.id} value={grupamento.id}>
                    {grupamento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subgrupamentoId">Subgrupamento *</Label>
            <Select 
              value={dadosFormulario.subgrupamentoId} 
              onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, subgrupamentoId: value }))}
              disabled={!dadosFormulario.grupamentoId}
            >
              <SelectTrigger>
                <SelectValue placeholder={dadosFormulario.grupamentoId ? "Selecione o subgrupamento" : "Selecione primeiro o grupamento"} />
              </SelectTrigger>
              <SelectContent>
                {subgrupamentosFiltrados.map((subgrupamento) => (
                  <SelectItem key={subgrupamento.id} value={subgrupamento.id}>
                    {subgrupamento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estacaoId">Estação *</Label>
            <Select 
              value={dadosFormulario.estacaoId} 
              onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, estacaoId: value }))}
              disabled={!dadosFormulario.subgrupamentoId}
            >
              <SelectTrigger>
                <SelectValue placeholder={dadosFormulario.subgrupamentoId ? "Selecione a estação" : "Selecione primeiro o subgrupamento"} />
              </SelectTrigger>
              <SelectContent>
                {estacoesFiltradas.map((estacao) => (
                  <SelectItem key={estacao.id} value={estacao.id}>
                    {estacao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modalidadeId">Modalidade *</Label>
            <Select value={dadosFormulario.modalidadeId} onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, modalidadeId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalidades.map((modalidade) => (
                  <SelectItem key={modalidade.id} value={modalidade.id}>
                    {modalidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={estaCarregando}>
              {estaCarregando ? 'Atualizando...' : 'Atualizar Viatura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
