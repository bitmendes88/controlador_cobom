
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  icone_url: string;
}

interface FormularioAdicionarViaturaProps {
  aoFechar: () => void;
}

export const FormularioAdicionarViatura = ({ aoFechar }: FormularioAdicionarViaturaProps) => {
  const [dadosFormulario, setDadosFormulario] = useState({
    prefixo: '',
    grupamentoId: '',
    subgrupamentoId: '',
    estacaoId: '',
    modalidadeId: ''
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
      setDadosFormulario(prev => ({ ...prev, subgrupamentoId: '', estacaoId: '' }));
    } else {
      setSubgrupamentosFiltrados([]);
      setDadosFormulario(prev => ({ ...prev, subgrupamentoId: '', estacaoId: '' }));
    }
  }, [dadosFormulario.grupamentoId, subgrupamentos]);

  useEffect(() => {
    if (dadosFormulario.subgrupamentoId) {
      const filtradas = estacoes.filter(est => est.subgrupamento_id === dadosFormulario.subgrupamentoId);
      setEstacoesFiltradas(filtradas);
      setDadosFormulario(prev => ({ ...prev, estacaoId: '' }));
    } else {
      setEstacoesFiltradas([]);
      setDadosFormulario(prev => ({ ...prev, estacaoId: '' }));
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
        .insert({
          prefixo: dadosFormulario.prefixo,
          modalidade_id: dadosFormulario.modalidadeId,
          estacao_id: dadosFormulario.estacaoId,
          status: 'Disponível'
        });

      if (error) throw error;

      toast({
        title: "Viatura Adicionada",
        description: `Viatura ${dadosFormulario.prefixo} foi adicionada com sucesso.`,
      });
      
      aoFechar();
    } catch (error) {
      console.error('Erro ao adicionar viatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar viatura. Verifique se o prefixo não está duplicado.",
        variant: "destructive",
      });
    } finally {
      setEstaCarregando(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Viatura</DialogTitle>
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
            <Button type="button" variant="outline" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={estaCarregando}>
              {estaCarregando ? 'Adicionando...' : 'Adicionar Viatura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
