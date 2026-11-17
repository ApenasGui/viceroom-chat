export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
export const isDemo = !supabaseUrl || !supabaseKey;
