// Demonstração local: não autentica contas nem simula pessoas online.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Message, Profile, Room } from '@/types';
export const DEMO_USER_ID = 'demo-visitor';
interface DemoState {
  profile: Profile;
  rooms: Room[];
  memberships: string[];
  messages: Message[];
}
const key = 'chatroom-vice:demo:v1';
const now = new Date().toISOString();
const initial: DemoState = {
  profile: { id: DEMO_USER_ID, username: 'Visitante', avatarColor: '#7752C7' },
  rooms: [
    {
      id: 'ocean-drive',
      name: 'Ocean Drive',
      emoji: '🌴',
      description: 'Sol, boas conversas e nenhuma pressa.',
      createdBy: 'lucia',
      createdAt: now,
      memberCount: 3,
    },
    {
      id: 'night-riders',
      name: 'Night Riders',
      emoji: '🏎️',
      description: 'O ponto de encontro de quem vive na pista.',
      createdBy: 'jason',
      createdAt: now,
      memberCount: 2,
    },
    {
      id: 'sunset-radio',
      name: 'Sunset Radio',
      emoji: '📻',
      description: 'A trilha sonora do seu fim de tarde.',
      createdBy: 'lucia',
      createdAt: now,
      memberCount: 2,
    },
    {
      id: 'neon-club',
      name: 'Neon Club',
      emoji: '🪩',
      description: 'A noite começa com uma boa conversa.',
      createdBy: 'jason',
      createdAt: now,
      memberCount: 2,
    },
  ],
  memberships: [],
  messages: [
    {
      id: 'welcome-1',
      roomId: 'ocean-drive',
      userId: 'lucia',
      username: 'Lucia',
      avatarColor: '#C25786',
      body: 'Bem-vindo a Ocean Drive! 🌴',
      createdAt: now,
    },
    {
      id: 'welcome-2',
      roomId: 'ocean-drive',
      userId: 'jason',
      username: 'Jason',
      avatarColor: '#7461BD',
      body: 'O pôr do sol por aqui nunca decepciona.',
      createdAt: now,
    },
    {
      id: 'welcome-3',
      roomId: 'ocean-drive',
      userId: 'lucia',
      username: 'Lucia',
      avatarColor: '#C25786',
      body: 'Chega mais. Qual é a boa de hoje?',
      createdAt: now,
    },
  ],
};
let state: DemoState | undefined;
let loading: Promise<DemoState> | undefined;
export async function demoState(): Promise<DemoState> {
  if (state) return state;
  if (!loading)
    loading = AsyncStorage.getItem(key).then((value) => {
      state = value
        ? (JSON.parse(value) as DemoState)
        : (JSON.parse(JSON.stringify(initial)) as DemoState);
      return state;
    });
  return loading;
}
export async function saveDemo() {
  await AsyncStorage.setItem(key, JSON.stringify(await demoState()));
}
export function demoId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
export async function requireDemoMember(roomId: string) {
  const data = await demoState();
  if (!data.memberships.includes(roomId))
    throw new Error('Entre na sala para ler e enviar mensagens.');
  return data;
}
