
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 CRÍTICO: SUPABASE_URL ou SUPABASE_SERVICE_KEY ausentes!");
}

// Exportação compatível com ESM
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseKey || ""
);
