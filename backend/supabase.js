
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inicializa o cliente Supabase para operações no backend
export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
