-- Habilitar realtime para as tabelas necessárias

-- Configurar REPLICA IDENTITY FULL para capturar mudanças completas
ALTER TABLE public.viaturas REPLICA IDENTITY FULL;
ALTER TABLE public.observacoes_viatura REPLICA IDENTITY FULL;
ALTER TABLE public.estacoes REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.viaturas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.observacoes_viatura;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estacoes;