// taste-swap-extension/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umrfzopuyulmafumemjy.supabase.co';
const supabaseAnonKey = 'xxxxxxxxxxxx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
