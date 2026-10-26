CREATE TABLE public.ai_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  gemini_api_key text NOT NULL DEFAULT '',
  gemini_model text NOT NULL DEFAULT 'gemini-2.5-flash-lite',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.ai_settings (id) VALUES (true);