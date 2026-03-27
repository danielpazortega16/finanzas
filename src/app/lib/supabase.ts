import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si falta alguna, lanzamos un error claro nosotros mismos
if (!supabaseUrl || !supabaseKey) {
  throw new Error("⚠️ ¡Faltan las llaves de Supabase en el archivo .env!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);