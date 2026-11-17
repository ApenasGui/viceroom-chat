import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useDeleteMessage, useSendMessage } from '@/hooks/useMessages';
import { sendMessage, deleteMessage } from '@/services/messages';
import type { Message } from '@/types';
jest.mock('@/lib/config', () => ({ isDemo: false }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'alice' } }),
}));
jest.mock('@/hooks/useMyProfile', () => ({
  useMyProfile: () => ({ data: { username: 'Alice', avatarColor: '#7250B8' } }),
}));
jest.mock('@/services/messages', () => ({
  sendMessage: jest.fn(),
  deleteMessage: jest.fn(),
}));
const message: Message = {
  id: 'confirmed',
  roomId: 'ocean',
  userId: 'alice',
  body: 'Oi',
  username: 'Alice',
  avatarColor: '#7250B8',
  createdAt: '2026-11-17T12:00:00Z',
};
function mountHook<T>(hook: () => T, client: QueryClient) {
  let result: T;
  function Harness() {
    result = hook();
    return null;
  }
  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(
      createElement(QueryClientProvider, { client }, createElement(Harness)),
    );
  });
  return {
    get result() {
      return result!;
    },
    unmount() {
      act(() => renderer.unmount());
      client.clear();
    },
  };
}
describe('envio e exclusão otimistas', () => {
  it('não duplica quando Realtime confirma antes da resposta do envio', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: Infinity } },
    });
    let resolveSend!: (m: Message) => void;
    (sendMessage as jest.Mock).mockReturnValue(
      new Promise<Message>((resolve) => {
        resolveSend = resolve;
      }),
    );
    const hook = mountHook(() => useSendMessage('ocean'), client);
    let sending!: Promise<Message>;
    await act(async () => {
      sending = hook.result.mutateAsync('Oi');
      await Promise.resolve();
    });
    const optimistic = client.getQueryData<Message[]>(['messages', 'ocean'])!;
    expect(optimistic).toHaveLength(1);
    client.setQueryData(['messages', 'ocean'], [...optimistic, message]);
    await act(async () => {
      resolveSend(message);
      await sending;
    });
    expect(client.getQueryData(['messages', 'ocean'])).toEqual([message]);
    hook.unmount();
  });
  it('restaura a mensagem se a exclusão falhar', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { gcTime: Infinity } },
    });
    client.setQueryData(['messages', 'ocean'], [message]);
    (deleteMessage as jest.Mock).mockRejectedValue(new Error('Sem conexão'));
    const hook = mountHook(() => useDeleteMessage('ocean'), client);
    await act(async () => {
      await expect(hook.result.mutateAsync(message.id)).rejects.toThrow('Sem conexão');
    });
    expect(client.getQueryData(['messages', 'ocean'])).toEqual([message]);
    hook.unmount();
  });
});
