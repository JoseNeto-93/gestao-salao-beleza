
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inicializa o cliente Supabase para operações no backend
// Inicializa o cliente Supabase para operações no backend
// Se as chaves não estiverem presentes, retorna um objeto mock para evitar crash no desenvolvimento
const hasKeys = supabaseUrl && supabaseKey;

if (!hasKeys) {
    console.warn("⚠️  Aviso: SUPABASE_URL ou SUPABASE_KEY ausentes. O backend rodará em modo de desenvolvimento limitado (sem banco de dados real).");
}

export const supabase = hasKeys
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => ({
            select: () => ({ single: async () => ({ data: null, error: null }), eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
            insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'mock-id' }, error: null }) }) })
        })
    };
