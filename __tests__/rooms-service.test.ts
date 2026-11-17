import { listMyRoomIds } from '@/services/rooms';
import { supabase } from '@/lib/supabase';
jest.mock('@/lib/config', () => ({ isDemo: false }));
jest.mock('@/services/demo', () => ({}));
const mockEq = jest.fn();
const mockSelect = jest.fn(() => ({ eq: mockEq }));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(() => ({ select: mockSelect })),
  },
}));
describe('participação do usuário atual', () => {
  it('filtra pelo usuário mesmo quando RLS permite ver colegas', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'alice' } },
    });
    mockEq.mockResolvedValue({ data: [{ room_id: 'ocean' }], error: null });
    expect(await listMyRoomIds()).toEqual(new Set(['ocean']));
    expect(mockEq).toHaveBeenCalledWith('user_id', 'alice');
  });
  it('recusa uma sessão sem usuário', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    await expect(listMyRoomIds()).rejects.toThrow('Faça login novamente.');
  });
});
