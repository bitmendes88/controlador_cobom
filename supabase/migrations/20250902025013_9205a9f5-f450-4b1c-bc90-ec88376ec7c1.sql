-- Adicionar campos para imagens de fundo baseadas em status na tabela modalidades_viatura
ALTER TABLE public.modalidades_viatura 
ADD COLUMN imagem_disponivel TEXT,
ADD COLUMN imagem_qti TEXT,
ADD COLUMN imagem_local TEXT,
ADD COLUMN imagem_qti_ps TEXT,
ADD COLUMN imagem_regresso TEXT,
ADD COLUMN imagem_baixado TEXT,
ADD COLUMN imagem_reserva TEXT;

-- Comentário para explicar os novos campos
COMMENT ON COLUMN public.modalidades_viatura.imagem_disponivel IS 'URL da imagem da viatura no status DISPONÍVEL';
COMMENT ON COLUMN public.modalidades_viatura.imagem_qti IS 'URL da imagem da viatura no status QTI';
COMMENT ON COLUMN public.modalidades_viatura.imagem_local IS 'URL da imagem da viatura no status LOCAL';
COMMENT ON COLUMN public.modalidades_viatura.imagem_qti_ps IS 'URL da imagem da viatura no status QTI PS';
COMMENT ON COLUMN public.modalidades_viatura.imagem_regresso IS 'URL da imagem da viatura no status REGRESSO';
COMMENT ON COLUMN public.modalidades_viatura.imagem_baixado IS 'URL da imagem da viatura no status BAIXADO';
COMMENT ON COLUMN public.modalidades_viatura.imagem_reserva IS 'URL da imagem da viatura no status RESERVA';