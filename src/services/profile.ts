import { isDemo } from '@/lib/config';
import { demoState, saveDemo } from './demo';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
interface ProfileRow {
  id: string;
  username: string;
  avatar_color: string;
}
const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  username: row.username,
  avatarColor: row.avatar_color,
});
export async function getProfile(userId: string): Promise<Profile> {
  if (isDemo) return { ...(await demoState()).profile };
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_color')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow);
}
export async function updateUsername(userId: string, username: string): Promise<void> {
  if (isDemo) {
    (await demoState()).profile.username = username;
    await saveDemo();
    return;
  }
  const { error } = await supabase.from('profiles').update({ username }).eq('id', userId);
  if (error) throw error;
}
