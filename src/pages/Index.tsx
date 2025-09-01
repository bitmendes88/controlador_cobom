
import { useState, useEffect } from 'react';
import { PainelFrota } from '@/components/PainelFrota';
import { AnotacoesServicoDaily } from '@/components/AnotacoesServicoDaily';
import { FormularioAdicionarViatura } from '@/components/FormularioAdicionarViatura';
import { ModalLogsAtividade } from '@/components/ModalLogsAtividade';
import { SeletorControlador } from '@/components/SeletorControlador';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, Search, Car, RefreshCw, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Grupamento {
  id: string;
  nome: string;
  endereco: string | null;
}

const Index = () => {
  console.log('Index component rendering...');
  const [mostrarAdicionarViatura, setMostrarAdicionarViatura] = useState(false);
  const [mostrarLogsAtividade, setMostrarLogsAtividade] = useState(false);
  const [grupamentos, setGrupamentos] = useState<Grupamento[]>([]);
  const [grupamentoSelecionado, setGrupamentoSelecionado] = useState<string>('');
  const [controladorSelecionado, setControladorSelecionado] = useState<string>('');
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');
  const [corProntidao, setCorProntidao] = useState<'verde' | 'amarela' | 'azul'>('verde');
  const [refreshKey, setRefreshKey] = useState(0);

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

  const recarregarDados = () => {
    setRefreshKey(prev => prev + 1);
  };

  const obterNomeGrupamentoCompleto = (nomeGrupamento: string) => {
    const numeroGB = nomeGrupamento.match(/(\d+)º GB/)?.[1];
    if (numeroGB) {
      return `${numeroGB}º GRUPAMENTO DE BOMBEIROS`;
    }
    return nomeGrupamento;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Painel Retrátil no Topo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Área invisível para detectar hover no topo da tela */}
        <div className="h-2 w-full absolute top-0 group">
          {/* Painel de Controles - oculto por padrão, aparece no hover */}
          <div className="bg-red-700 text-white shadow-lg transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
            <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
              {/* Layout Mobile - Stack vertical */}
              <div className="flex flex-col gap-3 lg:hidden">
                {/* Primeira linha: Logo e Título */}
                <div className="flex items-center justify-between">
                  <div className="bg-white rounded-full p-1.5 shadow-lg flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
                  </div>
                  <div className="text-center flex-1 px-2">
                    <h1 className="text-sm sm:text-lg font-bold tracking-wide leading-tight"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                        }}>
                      CBI-1 COBOM | Painel do Controlador
                    </h1>
                  </div>
                </div>
                
                {/* Segunda linha: Seletores */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {grupamentos.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-1.5 shadow-md border border-blue-200 flex-1">
                      <Select value={grupamentoSelecionado} onValueChange={setGrupamentoSelecionado}>
                        <SelectTrigger className="w-full text-gray-900 h-8 bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm font-medium text-xs sm:text-sm">
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

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-1.5 shadow-md border border-green-200 flex-1">
                    <SeletorControlador
                      grupamentoSelecionado={grupamentoSelecionado}
                      controladorSelecionado={controladorSelecionado}
                      aoMudarControlador={setControladorSelecionado}
                    />
                  </div>
                </div>
                
                {/* Terceira linha: Botões e pesquisa */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Pesquisar viaturas..."
                      value={termoPesquisa}
                      onChange={(e) => setTermoPesquisa(e.target.value)}
                      className="pl-10 w-full h-8 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => setMostrarAdicionarViatura(true)}
                      disabled={!controladorSelecionado}
                      className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold h-8 px-2 sm:px-3 shadow-md text-xs sm:text-sm flex-1 sm:flex-none"
                      size="sm"
                    >
                      <Car className="w-3 h-3 sm:w-4 sm:h-4" />
                      <Plus className="w-2 h-2 sm:w-3 sm:h-3 -ml-0.5 sm:-ml-1" />
                    </Button>

                    <Button 
                      onClick={() => setMostrarLogsAtividade(true)}
                      className="bg-blue-600 text-white hover:bg-blue-700 font-semibold h-8 px-2 sm:px-3 shadow-md text-xs sm:text-sm flex-1 sm:flex-none"
                      size="sm"
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>

                    <Button 
                      onClick={recarregarDados}
                      className="bg-orange-600 text-white hover:bg-orange-700 font-semibold h-8 px-2 sm:px-3 shadow-md text-xs sm:text-sm flex-1 sm:flex-none"
                      size="sm"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Layout Desktop - Uma linha horizontal */}
              <div className="hidden lg:flex items-center justify-between gap-4">
                {/* Logo Esquerda */}
                <div className="bg-white rounded-full p-1.5 shadow-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-red-700" />
                </div>
                
                {/* Título Central */}
                <div className="text-center flex-shrink-0">
                  <h1 className="text-xl font-bold tracking-wide leading-tight"
                      style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}>
                    CBI-1 COBOM | Painel do Controlador
                  </h1>
                </div>

                {/* Controles Centrais */}
                <div className="flex items-center gap-3 flex-1 justify-center">
                  {/* Seletor de Grupamento */}
                  {grupamentos.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-1.5 shadow-md border border-blue-200">
                      <Select value={grupamentoSelecionado} onValueChange={setGrupamentoSelecionado}>
                        <SelectTrigger className="w-48 xl:w-56 text-gray-900 h-8 bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm font-medium text-sm">
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

                  {/* Seletor de Controlador */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-1.5 shadow-md border border-green-200">
                    <SeletorControlador
                      grupamentoSelecionado={grupamentoSelecionado}
                      controladorSelecionado={controladorSelecionado}
                      aoMudarControlador={setControladorSelecionado}
                    />
                  </div>
                  
                  {/* Botão Adicionar Viatura */}
                  <Button 
                    onClick={() => setMostrarAdicionarViatura(true)}
                    disabled={!controladorSelecionado}
                    className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold h-8 px-3 shadow-md"
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
                      className="pl-10 w-48 xl:w-56 h-8 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                    />
                  </div>

                  {/* Botão Logs de Atividade */}
                  <Button 
                    onClick={() => setMostrarLogsAtividade(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700 font-semibold h-8 px-3 shadow-md"
                    size="sm"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>

                  {/* Botão Recarregar */}
                  <Button 
                    onClick={recarregarDados}
                    className="bg-orange-600 text-white hover:bg-orange-700 font-semibold h-8 px-3 shadow-md"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Espaço reservado para manter layout balanceado */}
                <div className="flex-shrink-0 w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Título do Grupamento - sempre visível abaixo do painel */}
      {grupamentoSelecionado && grupamentos.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-40 pt-2">
          <div className="bg-red-800 text-white text-center py-4 shadow-lg mt-2">
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide">
              {obterNomeGrupamentoCompleto(
                grupamentos.find(g => g.id === grupamentoSelecionado)?.nome || ''
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-2 space-y-2 pt-28 sm:pt-30 lg:pt-32">
        <AnotacoesServicoDaily 
          grupamentoSelecionado={grupamentoSelecionado} 
          controladorSelecionado={controladorSelecionado}
          corProntidao={corProntidao}
          key={`anotacoes-${refreshKey}`}
        />
        <PainelFrota 
          grupamentoSelecionado={grupamentoSelecionado} 
          controladorSelecionado={controladorSelecionado}
          termoPesquisa={termoPesquisa}
          key={`frota-${refreshKey}`}
          bloqueado={!controladorSelecionado}
        />
      </div>

      {mostrarAdicionarViatura && (
        <FormularioAdicionarViatura aoFechar={() => setMostrarAdicionarViatura(false)} />
      )}

      {mostrarLogsAtividade && (
        <ModalLogsAtividade 
          estaAberto={mostrarLogsAtividade}
          aoFechar={() => setMostrarLogsAtividade(false)}
          grupamentoSelecionado={grupamentoSelecionado}
        />
      )}
    </div>
  );
};

export default Index;
