
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormularioAdicionarControlador } from '@/components/FormularioAdicionarControlador';
import { supabase } from '@/integrations/supabase/client';
import { Plus, UserPlus } from 'lucide-react';

interface Controlador {
  id: string;
  nome: string;
}

interface SeletorControladorProps {
  grupamentoSelecionado: string;
  controladorSelecionado: string;
  aoMudarControlador: (controladorId: string) => void;
}

export const SeletorControlador = ({ 
  grupamentoSelecionado, 
  controladorSelecionado, 
  aoMudarControlador 
}: SeletorControladorProps) => {
  const [controladores, setControladores] = useState<Controlador[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    if (grupamentoSelecionado) {
      carregarControladores();
    }
  }, [grupamentoSelecionado]);

  const carregarControladores = async () => {
    try {
      const { data, error } = await supabase
        .from('controladores')
        .select('*')
        .eq('grupamento_id', grupamentoSelecionado)
        .order('nome');

      if (error) throw error;
      setControladores(data || []);
    } catch (error) {
      console.error('Erro ao carregar controladores:', error);
    }
  };

  if (!grupamentoSelecionado) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="bg-white rounded-lg p-2">
          <Select value={controladorSelecionado} onValueChange={aoMudarControlador}>
            <SelectTrigger className="w-48 text-gray-900 h-8">
              <SelectValue placeholder="Selecione um controlador" />
            </SelectTrigger>
            <SelectContent>
              {controladores.map((controlador) => (
                <SelectItem key={controlador.id} value={controlador.id}>
                  {controlador.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 text-white hover:bg-blue-700 font-semibold h-8 px-3"
          size="sm"
        >
          <UserPlus className="w-4 h-4" />
          <Plus className="w-3 h-3 -ml-1" />
        </Button>
      </div>

      {mostrarFormulario && (
        <FormularioAdicionarControlador
          aoFechar={() => setMostrarFormulario(false)}
          grupamentoSelecionado={grupamentoSelecionado}
          aoControladorAdicionado={carregarControladores}
        />
      )}
    </>
  );
};
