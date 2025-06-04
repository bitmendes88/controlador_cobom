
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Estacao {
  id: string;
  nome: string;
  endereco?: string;
  telegrafista?: string;
  qsa_radio?: number;
  qsa_zello?: number;
  telefone?: string;
}

interface EstacaoDetailModalProps {
  estacao: Estacao;
  onClose: () => void;
  onEstacaoUpdated: () => void;
}

export const EstacaoDetailModal = ({ 
  estacao, 
  onClose, 
  onEstacaoUpdated 
}: EstacaoDetailModalProps) => {
  const [nome, setNome] = useState(estacao.nome);
  const [endereco, setEndereco] = useState(estacao.endereco || '');
  const [telegrafista, setTelegrafista] = useState(estacao.telegrafista || '');
  const [qsaRadio, setQsaRadio] = useState<number | null>(estacao.qsa_radio || null);
  const [qsaZello, setQsaZello] = useState<number | null>(estacao.qsa_zello || null);
  const [telefone, setTelefone] = useState(estacao.telefone || '');
  const [estaCarregando, setEstaCarregando] = useState(false);
  const { toast } = useToast();

  const salvarAlteracoes = async () => {
    setEstaCarregando(true);
    try {
      const { error } = await supabase
        .from('estacoes')
        .update({
          nome,
          endereco: endereco || null,
          telegrafista: telegrafista || null,
          qsa_radio: qsaRadio,
          qsa_zello: qsaZello,
          telefone: telefone || null
        })
        .eq('id', estacao.id);

      if (error) throw error;

      toast({
        title: "Estação Atualizada",
        description: "Informações da estação foram salvas com sucesso.",
      });
      
      onEstacaoUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar estação:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar informações da estação. Tente novamente.",
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
          <DialogTitle>Informações da Estação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Estação</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da estação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Endereço da estação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegrafista">Telegrafista</Label>
            <Input
              id="telegrafista"
              value={telegrafista}
              onChange={(e) => setTelegrafista(e.target.value)}
              placeholder="Nome do telegrafista"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Telefone da estação"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>QSA Rádio</Label>
              <Select value={qsaRadio?.toString() || "none"} onValueChange={(value) => setQsaRadio(value === "none" ? null : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Nota 1-5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informado</SelectItem>
                  {[1, 2, 3, 4, 5].map((nota) => (
                    <SelectItem key={nota} value={nota.toString()}>
                      {nota}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>QSA Zello</Label>
              <Select value={qsaZello?.toString() || "none"} onValueChange={(value) => setQsaZello(value === "none" ? null : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Nota 1-5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informado</SelectItem>
                  {[1, 2, 3, 4, 5].map((nota) => (
                    <SelectItem key={nota} value={nota.toString()}>
                      {nota}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={salvarAlteracoes}
              disabled={estaCarregando || !nome.trim()}
            >
              {estaCarregando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
