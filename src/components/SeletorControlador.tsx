
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

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

  if (!grupamentoSelecionado || controladores.length === 0) {
    return null;
  }

  return (
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
  );
};
