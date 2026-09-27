import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dploczrvxzpluknxzoik.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbG9jenJ2eHpwbHVrbnh6b2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTg4MzEsImV4cCI6MjEwNjA3NDgzMX0.v892bZ65915_xah5Ey6CXclLAl2f7xtQghaCAtZSjHg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
