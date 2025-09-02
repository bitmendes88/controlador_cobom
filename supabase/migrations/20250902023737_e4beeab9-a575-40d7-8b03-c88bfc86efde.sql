-- Habilitar RLS em todas as tabelas públicas e criar políticas básicas

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.anotacoes_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controladores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalidades_viatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observacoes_viatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgrupamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viaturas ENABLE ROW LEVEL SECURITY;

-- Políticas para anotacoes_servico (permitir tudo por enquanto - aplicação interna)
CREATE POLICY "Allow all operations on anotacoes_servico" ON public.anotacoes_servico
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para controladores
CREATE POLICY "Allow all operations on controladores" ON public.controladores
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para estacoes
CREATE POLICY "Allow all operations on estacoes" ON public.estacoes
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para grupamentos
CREATE POLICY "Allow all operations on grupamentos" ON public.grupamentos
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para logs_atividade
CREATE POLICY "Allow all operations on logs_atividade" ON public.logs_atividade
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para modalidades_viatura
CREATE POLICY "Allow all operations on modalidades_viatura" ON public.modalidades_viatura
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para observacoes_viatura
CREATE POLICY "Allow all operations on observacoes_viatura" ON public.observacoes_viatura
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para subgrupamentos
CREATE POLICY "Allow all operations on subgrupamentos" ON public.subgrupamentos
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para viaturas
CREATE POLICY "Allow all operations on viaturas" ON public.viaturas
    FOR ALL USING (true) WITH CHECK (true);