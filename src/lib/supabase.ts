import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwpgbynmxteretbjssfh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cGdieW5teHRlcmV0Ympzc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTM0ODMsImV4cCI6MjA3NzYyOTQ4M30._PpWP_4ktmA-3h3GbO5kHeAuZRxpyxnt-wnIa1VSaOc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
