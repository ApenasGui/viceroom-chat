import { isDemo } from '@/lib/config';
import { demoState, saveDemo, demoId, requireDemoMember, DEMO_USER_ID } from './demo';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/types';
interface MessageRow {
  id: string;
  room_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: { username: string; avatar_color: string } | null;
}
function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
    username: row.profiles?.username ?? 'Alguém',
    avatarColor: row.profiles?.avatar_color ?? '#7752B9',
  };
}
const SELECT = 'id, room_id, user_id, body, created_at, profiles(username, avatar_color)';
// As últimas mensagens da sala, da mais antiga para a mais nova (pronto para
// a lista). «limit» evita carregar um histórico gigante de uma vez.
export async function listMessages(roomId: string, limit = 100): Promise<Message[]> {
  if (isDemo)
    return (await requireDemoMember(roomId)).messages
      .filter((m) => m.roomId === roomId)
      .slice(-limit);
  const { data, error } = await supabase
    .from('messages')
    .select(SELECT)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as MessageRow[]).map(toMessage).reverse();
}
export async function sendMessage(
  roomId: string,
  userId: string,
  body: string,
): Promise<Message> {
  if (isDemo) {
    const d = await requireDemoMember(roomId);
    const message: Message = {
      id: demoId(),
      roomId,
      userId,
      body,
      createdAt: new Date().toISOString(),
      username: d.profile.username,
      avatarColor: d.profile.avatarColor,
    };
    d.messages.push(message);
    await saveDemo();
    return message;
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({ room_id: roomId, user_id: userId, body })
    .select(SELECT)
    .single();
  if (error) throw error;
  return toMessage(data as unknown as MessageRow);
}
export async function deleteMessage(id: string): Promise<void> {
  if (isDemo) {
    const d = await demoState();
    const message = d.messages.find((m) => m.id === id);
    if (message && message.userId !== DEMO_USER_ID)
      throw new Error('Você só pode apagar suas mensagens.');
    d.messages = d.messages.filter((m) => m.id !== id);
    await saveDemo();
    return;
  }
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}
// Busca uma mensagem específica pelo id (usada quando o Realtime avisa de um
// INSERT: o evento vem "cru", sem o join do perfil, então buscamos completa).
export async function getMessage(id: string): Promise<Message> {
  if (isDemo) {
    const d = await demoState();
    const m = d.messages.find((m) => m.id === id);
    if (!m) throw new Error('Mensagem não encontrada.');
    await requireDemoMember(m.roomId);
    return m;
  }
  const { data, error } = await supabase
    .from('messages')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return toMessage(data as unknown as MessageRow);
}
