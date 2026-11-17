import { isDemo } from '@/lib/config';
import { demoState, saveDemo, demoId, DEMO_USER_ID } from './demo';
import { supabase } from '@/lib/supabase';
import type { Room } from '@/types';
interface RoomRow {
  id: string;
  name: string;
  description: string;
  emoji: string;
  created_by: string;
  created_at: string;
  member_count: number;
}
function toRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    emoji: row.emoji,
    createdBy: row.created_by,
    createdAt: row.created_at,
    memberCount: row.member_count ?? 0,
  };
}
// Todas as salas, com a contagem de membros (uma consulta só, sem N+1).
export async function listRooms(): Promise<Room[]> {
  if (isDemo) {
    const d = await demoState();
    return d.rooms.map((r) => ({
      ...r,
      memberCount: (r.memberCount || 0) + Number(d.memberships.includes(r.id)),
    }));
  }
  const { data, error } = await supabase
    .from('rooms')
    .select('*, member_count:room_member_count')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RoomRow[]).map(toRoom);
}
// Os ids das salas em que o usuário logado já está — para marcar "Minhas salas".
export async function listMyRoomIds(): Promise<Set<string>> {
  if (isDemo) return new Set((await demoState()).memberships);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error('Faça login novamente.');
  const { data, error } = await supabase
    .from('room_members')
    .select('room_id')
    .eq('user_id', auth.user.id);
  if (error) throw error;
  return new Set((data as { room_id: string }[]).map((r) => r.room_id));
}
export async function getRoom(id: string): Promise<Room> {
  if (isDemo) {
    const r = (await listRooms()).find((r) => r.id === id);
    if (!r) throw new Error('Sala não encontrada.');
    return r;
  }
  const { data, error } = await supabase
    .from('rooms')
    .select('*, member_count:room_member_count')
    .eq('id', id)
    .single();
  if (error) throw error;
  return toRoom(data as RoomRow);
}
export async function createRoom(
  name: string,
  description: string,
  emoji: string,
  userId: string,
): Promise<string> {
  if (isDemo) {
    const d = await demoState();
    const id = demoId();
    d.rooms.unshift({
      id,
      name,
      description,
      emoji,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      memberCount: 0,
    });
    d.memberships.push(id);
    await saveDemo();
    return id;
  }
  const { data, error } = await supabase.rpc('create_room', {
    p_name: name,
    p_description: description,
    p_emoji: emoji,
  });
  if (error) throw error;
  return data as string;
}
export async function joinRoom(roomId: string, userId: string): Promise<void> {
  if (isDemo) {
    const d = await demoState();
    if (!d.memberships.includes(roomId)) d.memberships.push(roomId);
    await saveDemo();
    return;
  }
  const { error } = await supabase
    .from('room_members')
    .insert({ room_id: roomId, user_id: userId });
  if (error) throw error;
}
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  if (isDemo) {
    const d = await demoState();
    d.memberships = d.memberships.filter((id) => id !== roomId);
    await saveDemo();
    return;
  }
  const { error } = await supabase
    .from('room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
  if (error) throw error;
}
interface MemberRow {
  user_id: string;
  profiles: { username: string; avatar_color: string } | null;
}
export interface RoomMember {
  userId: string;
  username: string;
  avatarColor: string;
}
export async function listRoomMembers(roomId: string): Promise<RoomMember[]> {
  if (isDemo) {
    const d = await demoState();
    return d.memberships.includes(roomId)
      ? [
          {
            userId: DEMO_USER_ID,
            username: d.profile.username,
            avatarColor: d.profile.avatarColor,
          },
        ]
      : [];
  }
  const { data, error } = await supabase
    .from('room_members')
    .select('user_id, profiles(username, avatar_color)')
    .eq('room_id', roomId);
  if (error) throw error;
  return (data as unknown as MemberRow[]).map((r) => ({
    userId: r.user_id,
    username: r.profiles?.username ?? 'Alguém',
    avatarColor: r.profiles?.avatar_color ?? '#7752B9',
  }));
}
