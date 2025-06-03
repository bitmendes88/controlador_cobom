
import { useState, useEffect } from 'react';
import { PainelFrota } from '@/components/PainelFrota';
import { AnotacoesServicoDaily } from '@/components/AnotacoesServicoDaily';
import { FormularioAdicionarViatura } from '@/components/FormularioAdicionarViatura';
import { SeletorControlador } from '@/components/SeletorControlador';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, Search, UserPlus, Car } from 'lucide-react';
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
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');
  const [corProntidao, setCorProntidao] = useState<'verde' | 'amarela' | 'azul'>('verde');

  useEffect(() => {
    carregarGrupamentos();
    calcularCorProntidao();
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

  const calcularCorProntidao = () => {
    const dataReferencia = new Date('2025-06-02T07:30:00-03:00');
    const agora = new Date();
    
    const agoraGMT3 = new Date(agora.getTime() - (3 * 60 * 60 * 1000));
    
    const diffHoras = Math.floor((agoraGMT3.getTime() - dataReferencia.getTime()) / (1000 * 60 * 60));
    
    const ciclos = Math.floor(diffHoras / 24);
    
    const indiceCor = ciclos % 3;
    const cores: ('verde' | 'amarela' | 'azul')[] = ['verde', 'amarela', 'azul'];
    
    setCorProntidao(cores[indiceCor]);
  };

  const obterEstiloProntidao = () => {
    const estilos = {
      verde: 'bg-green-500 text-white',
      amarela: 'bg-yellow-500 text-white',
      azul: 'bg-blue-500 text-white'
    };
    return estilos[corProntidao];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho Principal */}
      <div className="bg-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo Esquerda */}
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Shield className="w-8 h-8 text-red-700" />
            </div>
            
            {/* Título Central */}
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold tracking-wide"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}>
                COMANDO DE BOMBEIROS DO INTERIOR 1
              </h1>
              <p className="text-red-100 mt-1 text-lg font-medium">Controlador COBOM | Gestão de Unidades de Serviços</p>
            </div>
            
            {/* Logo Direita */}
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Shield className="w-8 h-8 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Controles */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 justify-between">
            {/* Controles principais em linha única */}
            <div className="flex items-center gap-3">
              {/* Seletor de Grupamento */}
              {grupamentos.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <Select value={grupamentoSelecionado} onValueChange={setGrupamentoSelecionado}>
                    <SelectTrigger className="w-60 text-gray-900 h-8">
                      <SelectValue placeholder="Selecione um grupamento" />
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
              )}

              {/* Seletor de Controlador */}
              <SeletorControlador
                grupamentoSelecionado={grupamentoSelecionado}
                controladorSelecionado={controladorSelecionado}
                aoMudarControlador={setControladorSelecionado}
              />
              
              {/* Botão Adicionar Viatura */}
              <Button 
                onClick={() => setMostrarAdicionarViatura(true)}
                className="bg-green-600 text-white hover:bg-green-700 font-semibold h-8 px-3"
                size="sm"
              >
                <Car className="w-4 h-4" />
                <Plus className="w-3 h-3 -ml-1" />
              </Button>

              {/* Caixa de Pesquisa */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Pesquisar viaturas..."
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                  className="pl-10 w-64 h-8"
                />
              </div>
            </div>

            {/* Indicador de Prontidão */}
            <div className={`px-3 py-1 rounded-lg font-semibold text-sm ${obterEstiloProntidao()}`}>
              Prontidão: {corProntidao.toUpperCase()}
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
          termoPesquisa={termoPesquisa}
        />
      </div>

      {mostrarAdicionarViatura && (
        <FormularioAdicionarViatura aoFechar={() => setMostrarAdicionarViatura(false)} />
      )}
    </div>
  );
};

export default Index;
