
import { useState, useEffect } from 'react';
import { PainelFrota } from '@/components/PainelFrota';
import { AnotacoesServicoDaily } from '@/components/AnotacoesServicoDaily';
import { FormularioAdicionarViatura } from '@/components/FormularioAdicionarViatura';
import { SeletorControlador } from '@/components/SeletorControlador';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Grupamento {
  id: string;
  nome: string;
  endereco: string | null;
}

const Index = () => {
  const [mostrarAdicionarViatura, setMostrarAdicionarViatura] = useState(false);
  const [grupamentos, setGrupamentos] = useState<Grupamento[]>([]);
  const [grupamentoSelecionado, setGrupamentoSelecionado] = useState<string>('');
  const [controladorSelecionado, setControladorSelecionado] = useState<string>('');

  useEffect(() => {
    carregarGrupamentos();
  }, []);

  const carregarGrupamentos = async () => {
    try {
      const { data: dadosGrupamentos, error: erroGrupamentos } = await supabase
        .from('grupamentos')
        .select('*')
        .order('nome');

      if (erroGrupamentos) throw erroGrupamentos;
      setGrupamentos(dadosGrupamentos || []);

      if (dadosGrupamentos && dadosGrupamentos.length > 0) {
        setGrupamentoSelecionado(dadosGrupamentos[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar grupamentos:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <Shield className="w-8 h-8 text-red-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wide"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}>
                  COMANDO DE BOMBEIROS DO INTERIOR 1
                </h1>
                <p className="text-red-100 mt-1 text-base font-medium">Controlador COBOM | Gestão de Unidades de Serviços</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {grupamentos.length > 0 && (
                <div className="bg-white rounded-lg p-2">
                  <Select value={grupamentoSelecionado} onValueChange={setGrupamentoSelecionado}>
                    <SelectTrigger className="w-60 text-gray-900 h-8">
                      <SelectValue placeholder="Selecione um grupamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupamentos.map((grupamento) => (
                        <SelectItem key={grupamento.id} value={grupamento.id}>
                          {grupamento.nome} - {grupamento.endereco}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <SeletorControlador
                grupamentoSelecionado={grupamentoSelecionado}
                controladorSelecionado={controladorSelecionado}
                aoMudarControlador={setControladorSelecionado}
              />
              
              <Button 
                onClick={() => setMostrarAdicionarViatura(true)}
                className="bg-white text-red-700 hover:bg-gray-100 font-semibold h-8 px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Viatura
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
        <AnotacoesServicoDaily 
          grupamentoSelecionado={grupamentoSelecionado} 
          controladorSelecionado={controladorSelecionado}
        />
        <PainelFrota 
          grupamentoSelecionado={grupamentoSelecionado} 
          controladorSelecionado={controladorSelecionado} 
        />
      </div>

      {mostrarAdicionarViatura && (
        <FormularioAdicionarViatura aoFechar={() => setMostrarAdicionarViatura(false)} />
      )}

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Index;
