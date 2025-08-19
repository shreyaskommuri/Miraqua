// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxaivdbehtkedbhqtvvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4YWl2ZGJlaHRrZWRiaHF0dnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjkyNjcsImV4cCI6MjA2NDIwNTI2N30.UKDRx68t00SWSwFhON3qgjvrxqzmM5eNFt-ENAhbh2E';

export const supabase = createClient(supabaseUrl, supabaseKey); 