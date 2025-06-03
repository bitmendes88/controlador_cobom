
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface FormularioAdicionarControladorProps {
  aoFechar: () => void;
  grupamentoSelecionado: string;
  aoControladorAdicionado: () => void;
}

export const FormularioAdicionarControlador = ({ 
  aoFechar, 
  grupamentoSelecionado, 
  aoControladorAdicionado 
}: FormularioAdicionarControladorProps) => {
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do controlador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true);
    
    try {
      const { error } = await supabase
        .from('controladores')
        .insert({
          nome: nome.trim(),
          grupamento_id: grupamentoSelecionado
        });

      if (error) throw error;

      // Registrar log da ação
      await supabase
        .from('logs_atividade')
        .insert({
          grupamento_id: grupamentoSelecionado,
          acao: 'Controlador cadastrado',
          detalhes: `Novo controlador: ${nome.trim()}`
        });

      toast({
        title: "Sucesso",
        description: "Controlador adicionado com sucesso",
      });

      aoControladorAdicionado();
      aoFechar();
    } catch (error) {
      console.error('Erro ao adicionar controlador:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar controlador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Adicionar Novo Controlador</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={aoFechar}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Controlador</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do controlador"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
