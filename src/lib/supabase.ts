import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey, isDemo } from './config';
export const supabase = createClient(
  supabaseUrl || 'https://demo.invalid',
  supabaseKey || 'demo-public-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: !isDemo,
      persistSession: !isDemo,
      detectSessionInUrl: false,
    },
  },
);
