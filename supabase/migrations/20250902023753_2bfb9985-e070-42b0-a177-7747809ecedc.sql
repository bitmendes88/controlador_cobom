-- Corrigir search_path das funções para aumentar a segurança

-- Recriar função atualizar_timestamp_status com search_path seguro
CREATE OR REPLACE FUNCTION public.atualizar_timestamp_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_alterado_em = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Recriar função clean_old_activity_logs com search_path seguro
CREATE OR REPLACE FUNCTION public.clean_old_activity_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM activity_logs 
  WHERE created_at < now() - interval '24 hours';
END;
$function$;

-- Recriar função limpar_logs_antigos com search_path seguro
CREATE OR REPLACE FUNCTION public.limpar_logs_antigos()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM logs_atividade 
  WHERE criado_em < now() - interval '24 hours';
END;
$function$;

-- Recriar função update_status_timestamp com search_path seguro
CREATE OR REPLACE FUNCTION public.update_status_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = now();
  END IF;
  RETURN NEW;
END;
$function$;