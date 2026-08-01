import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side Supabase client
// Uses service role key (bypass RLS) if available, otherwise falls back to anon key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
