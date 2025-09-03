-- Atualizar modalidades com URLs de imagens PNG para cada status  
-- Imagens temporárias de placeholder para teste - em produção usaria URLs reais

-- Para modalidade "Incêndio"
UPDATE modalidades_viatura 
SET 
  imagem_disponivel = 'https://via.placeholder.com/120x60/22c55e/ffffff?text=DISPONÍVEL',
  imagem_qti = 'https://via.placeholder.com/120x60/f59e0b/ffffff?text=QTI', 
  imagem_local = 'https://via.placeholder.com/120x60/3b82f6/ffffff?text=LOCAL',
  imagem_qti_ps = 'https://via.placeholder.com/120x60/ea580c/ffffff?text=QTI+PS',
  imagem_regresso = 'https://via.placeholder.com/120x60/8b5cf6/ffffff?text=REGRESSO',
  imagem_baixado = 'https://via.placeholder.com/120x60/ef4444/ffffff?text=BAIXADO',
  imagem_reserva = 'https://via.placeholder.com/120x60/6b7280/ffffff?text=RESERVA'
WHERE nome = 'Incêndio';

-- Para modalidade "Comando de Área" 
UPDATE modalidades_viatura 
SET 
  imagem_disponivel = 'https://via.placeholder.com/120x60/22c55e/000000?text=CMD+DISP',
  imagem_qti = 'https://via.placeholder.com/120x60/f59e0b/000000?text=CMD+QTI',
  imagem_local = 'https://via.placeholder.com/120x60/3b82f6/000000?text=CMD+LOCAL', 
  imagem_qti_ps = 'https://via.placeholder.com/120x60/ea580c/000000?text=CMD+QTI+PS',
  imagem_regresso = 'https://via.placeholder.com/120x60/8b5cf6/000000?text=CMD+REG',
  imagem_baixado = 'https://via.placeholder.com/120x60/ef4444/000000?text=CMD+BAIXADO',
  imagem_reserva = 'https://via.placeholder.com/120x60/6b7280/000000?text=CMD+RESERVA'
WHERE nome = 'Comando de Área';

-- Adicionar imagens padrão para outras modalidades caso existam
UPDATE modalidades_viatura 
SET 
  imagem_disponivel = 'https://via.placeholder.com/120x60/22c55e/ffffff?text=DISPONÍVEL',
  imagem_qti = 'https://via.placeholder.com/120x60/f59e0b/ffffff?text=QTI',
  imagem_local = 'https://via.placeholder.com/120x60/3b82f6/ffffff?text=LOCAL',
  imagem_qti_ps = 'https://via.placeholder.com/120x60/ea580c/ffffff?text=QTI+PS', 
  imagem_regresso = 'https://via.placeholder.com/120x60/8b5cf6/ffffff?text=REGRESSO',
  imagem_baixado = 'https://via.placeholder.com/120x60/ef4444/ffffff?text=BAIXADO',
  imagem_reserva = 'https://via.placeholder.com/120x60/6b7280/ffffff?text=RESERVA'
WHERE imagem_disponivel IS NULL;