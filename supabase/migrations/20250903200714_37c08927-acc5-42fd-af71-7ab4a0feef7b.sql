-- Atualizar modalidades com imagens PNG para cada status
-- Imagens para modalidade "Incêndio"
UPDATE modalidades_viatura 
SET 
  imagem_disponivel = 'https://i.imgur.com/fire_engine_available.png',
  imagem_qti = 'https://i.imgur.com/fire_engine_responding.png', 
  imagem_local = 'https://i.imgur.com/fire_engine_on_scene.png',
  imagem_qti_ps = 'https://i.imgur.com/fire_engine_qti_ps.png',
  imagem_regresso = 'https://i.imgur.com/fire_engine_returning.png',
  imagem_baixado = 'https://i.imgur.com/fire_engine_out_of_service.png',
  imagem_reserva = 'https://i.imgur.com/fire_engine_reserve.png'
WHERE nome = 'Incêndio';

-- Imagens para modalidade "Comando de Área" 
UPDATE modalidades_viatura 
SET 
  imagem_disponivel = 'https://i.imgur.com/command_vehicle_available.png',
  imagem_qti = 'https://i.imgur.com/command_vehicle_responding.png',
  imagem_local = 'https://i.imgur.com/command_vehicle_on_scene.png', 
  imagem_qti_ps = 'https://i.imgur.com/command_vehicle_qti_ps.png',
  imagem_regresso = 'https://i.imgur.com/command_vehicle_returning.png',
  imagem_baixado = 'https://i.imgur.com/command_vehicle_out_of_service.png',
  imagem_reserva = 'https://i.imgur.com/command_vehicle_reserve.png'
WHERE nome = 'Comando de Área';

-- Adicionar imagens padrão para outras modalidades caso existam
UPDATE modalidades_viatura 
SET 
  imagem_disponivel = 'https://i.imgur.com/generic_vehicle_available.png',
  imagem_qti = 'https://i.imgur.com/generic_vehicle_responding.png',
  imagem_local = 'https://i.imgur.com/generic_vehicle_on_scene.png',
  imagem_qti_ps = 'https://i.imgur.com/generic_vehicle_qti_ps.png', 
  imagem_regresso = 'https://i.imgur.com/generic_vehicle_returning.png',
  imagem_baixado = 'https://i.imgur.com/generic_vehicle_out_of_service.png',
  imagem_reserva = 'https://i.imgur.com/generic_vehicle_reserve.png'
WHERE imagem_disponivel IS NULL;