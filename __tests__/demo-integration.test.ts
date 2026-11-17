import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  listMyRoomIds,
  listRoomMembers,
} from '@/services/rooms';
import { listMessages, sendMessage, deleteMessage } from '@/services/messages';
import { getProfile, updateUsername } from '@/services/profile';
import { DEMO_USER_ID } from '@/services/demo';
jest.mock('@/lib/config', () => ({ isDemo: true }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
it('cria sala, persiste perfil e mensagem, apaga e revoga acesso ao sair', async () => {
  const roomId = await createRoom(
    'Praia de teste',
    'Integração local',
    '🌴',
    DEMO_USER_ID,
  );
  expect((await listMyRoomIds()).has(roomId)).toBe(true);
  expect((await getRoom(roomId)).memberCount).toBe(1);
  await updateUsername(DEMO_USER_ID, 'Visitante da praia');
  expect((await getProfile(DEMO_USER_ID)).username).toBe('Visitante da praia');
  const message = await sendMessage(roomId, DEMO_USER_ID, 'Olá, cidade!');
  expect((await listMessages(roomId))[0]).toMatchObject({
    id: message.id,
    username: 'Visitante da praia',
  });
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    'chatroom-vice:demo:v1',
    expect.stringContaining('Olá, cidade!'),
  );
  await deleteMessage(message.id);
  expect(await listMessages(roomId)).toEqual([]);
  await leaveRoom(roomId, DEMO_USER_ID);
  expect((await listMyRoomIds()).has(roomId)).toBe(false);
  await expect(listMessages(roomId)).rejects.toThrow('Entre na sala');
  await expect(sendMessage(roomId, DEMO_USER_ID, 'Sem acesso')).rejects.toThrow(
    'Entre na sala',
  );
  await joinRoom(roomId, DEMO_USER_ID);
  await joinRoom(roomId, DEMO_USER_ID);
  expect(await listRoomMembers(roomId)).toHaveLength(1);
});
