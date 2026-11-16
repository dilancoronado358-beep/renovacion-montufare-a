-- ==========================================================================
-- TABLA DE VOLUNTARIOS Y ADHESIÓN CIUDADANA - RENOVACIÓN MONTUFAREÑA
-- CANDIDATURA FABIÁN ROBLES | ALCALDÍA DE MONTÚFAR
-- ==========================================================================

-- 1. Crear tabla de voluntarios
CREATE TABLE IF NOT EXISTS public.voluntarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    parroquia TEXT NOT NULL,
    rol TEXT DEFAULT 'Voluntariado General',
    origen TEXT DEFAULT 'web'
);

-- 2. Habilitar Seguridad por Fila (Row Level Security - RLS)
ALTER TABLE public.voluntarios ENABLE ROW LEVEL SECURITY;

-- 3. Política: Permitir inserciones públicas desde el formulario web
DROP POLICY IF EXISTS "Permitir insercion publica de voluntarios" ON public.voluntarios;
CREATE POLICY "Permitir insercion publica de voluntarios"
ON public.voluntarios
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Política: Solo lectura para usuarios autenticados (Panel / Dashboard de Supabase)
-- Protege los datos personales y teléfonos de los ciudadanos para que no sean visibles públicamente
DROP POLICY IF EXISTS "Permitir lectura solo a administradores" ON public.voluntarios;
CREATE POLICY "Permitir lectura solo a administradores"
ON public.voluntarios
FOR SELECT
TO authenticated
USING (true);
