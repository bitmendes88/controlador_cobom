
import { useState, useEffect } from 'react';
import { PainelFrota } from '@/components/PainelFrota';
import { AnotacoesServicoDaily } from '@/components/AnotacoesServicoDaily';
import { FormularioAdicionarViatura } from '@/components/FormularioAdicionarViatura';
import { SeletorControlador } from '@/components/SeletorControlador';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, Search, Car } from 'lucide-react';
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
      {/* Cabeçalho Principal - Uma linha só */}
      <div className="bg-red-700 text-white shadow-lg relative group">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Esquerda */}
            <div className="bg-white rounded-full p-1.5 shadow-lg">
              <Shield className="w-6 h-6 text-red-700" />
            </div>
            
            {/* Título Central */}
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold tracking-wide leading-tight"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}>
                COMANDO DE BOMBEIROS DO INTERIOR 1
              </h1>
            </div>
            
            {/* Indicador de Prontidão - aumentado */}
            <div className={`px-10 py-5 rounded-lg font-bold text-2xl shadow-lg border-2 border-white ${obterEstiloProntidao()}`}
                 style={{
                   textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                   filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                 }}>
              PRONTIDÃO: {corProntidao.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Barra de Controles - Aparece no hover do grupo */}
        <div className="bg-white border-b border-gray-200 shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out absolute top-full left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4 justify-between">
              {/* Controles principais em linha única */}
              <div className="flex items-center gap-3">
                {/* Seletor de Grupamento com estilo aprimorado */}
                {grupamentos.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 shadow-md border border-blue-200">
                    <Select value={grupamentoSelecionado} onValueChange={setGrupamentoSelecionado}>
                      <SelectTrigger className="w-60 text-gray-900 h-8 bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm font-medium">
                        <SelectValue placeholder="Selecione um grupamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-blue-300 shadow-xl rounded-lg z-50">
                        {grupamentos.map((grupamento) => (
                          <SelectItem 
                            key={grupamento.id} 
                            value={grupamento.id}
                            className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer font-medium"
                          >
                            {grupamento.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Seletor de Controlador com estilo aprimorado */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2 shadow-md border border-green-200">
                  <SeletorControlador
                    grupamentoSelecionado={grupamentoSelecionado}
                    controladorSelecionado={controladorSelecionado}
                    aoMudarControlador={setControladorSelecionado}
                  />
                </div>
                
                {/* Botão Adicionar Viatura */}
                <Button 
                  onClick={() => setMostrarAdicionarViatura(true)}
                  className="bg-green-600 text-white hover:bg-green-700 font-semibold h-8 px-3 shadow-md"
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
                    className="pl-10 w-64 h-8 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                  />
                </div>
              </div>
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
