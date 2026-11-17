import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoomCard } from '@/components/RoomCard';
import { SunsetHero } from '@/components/SunsetHero';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { useRooms, useMyRoomIds } from '@/hooks/useRooms';
import { isDemo } from '@/lib/config';
import { colors } from '@/theme';
import { friendlyError } from '@/utils/errors';
export default function RoomsScreen() {
  const router = useRouter();
  const rooms = useRooms();
  const { data: memberIds } = useMyRoomIds();
  const [search, setSearch] = useState('');
  const [mine, setMine] = useState(false);
  const filtered = (rooms.data || []).filter(
    (room) =>
      (!mine || memberIds?.has(room.id)) &&
      `${room.name} ${room.description}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={rooms.isRefetching}
            onRefresh={() => {
              void rooms.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <SunsetHero
          title={'Sua vibe.\nSua turma.'}
          subtitle="Encontre sua sala e deixe a conversa levar."
        />
        <View style={styles.sheet}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={19} color={colors.muted} />
            <TextInput
              accessibilityLabel="Buscar salas"
              placeholder="Encontre sua próxima conversa"
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            <Ionicons name="options-outline" size={19} color={colors.primary} />
          </View>
          {isDemo && (
            <Text style={styles.demo}>MODO DEMONSTRAÇÃO · dados locais de exemplo</Text>
          )}
          <View style={styles.heading}>
            <View>
              <Text style={styles.title}>Encontre sua sala</Text>
              <Text style={styles.subtitle}>Tem sempre um lugar para você.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Criar sala"
              onPress={() => router.push('/room/new')}
              style={styles.add}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          </View>
          <View style={styles.filters}>
            {['Explorar', 'Minhas salas'].map((label, i) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: mine === Boolean(i) }}
                key={label}
                onPress={() => setMine(Boolean(i))}
                style={[styles.filter, mine === Boolean(i) && styles.activeFilter]}
              >
                <Text
                  style={[styles.filterText, mine === Boolean(i) && styles.activeText]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {rooms.isLoading ? (
            <LoadingView />
          ) : rooms.isError ? (
            <ErrorState message={friendlyError(rooms.error)} onRetry={rooms.refetch} />
          ) : (
            <View style={styles.grid}>
              {filtered.map((room, index) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  index={index}
                  isMember={memberIds?.has(room.id) ?? false}
                  onPress={() => router.push(`/room/${room.id}`)}
                />
              ))}
            </View>
          )}
          {!rooms.isLoading && !rooms.isError && filtered.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={35} color={colors.primary} />
              <Text style={styles.emptyTitle}>
                {search
                  ? 'Nenhuma sala encontrada'
                  : mine
                    ? 'Sua turma está por aí'
                    : 'A primeira conversa é sua'}
              </Text>
              <Text style={styles.subtitle}>
                {mine
                  ? 'Explore as salas e entre para participar.'
                  : 'Crie uma sala ou tente outra busca.'}
              </Text>
            </View>
          )}
          <Text style={styles.bottom}>FEITO PARA CONECTAR. NO SEU RITMO. 🌴</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.purple },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -25,
    padding: 23,
    minHeight: 520,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: { flex: 1, fontSize: 12, color: colors.text, height: '100%' },
  demo: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 1.1,
    textAlign: 'center',
    marginTop: 12,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  title: { fontSize: 23, fontWeight: '800', letterSpacing: -0.8, color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 5, lineHeight: 20 },
  add: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 19 },
  filter: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 20 },
  activeFilter: { backgroundColor: colors.primary },
  filterText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  activeText: { color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, color: colors.text, fontWeight: '700', marginTop: 12 },
  bottom: {
    textAlign: 'center',
    fontSize: 8,
    letterSpacing: 1.7,
    color: colors.muted,
    marginTop: 14,
    marginBottom: 15,
  },
});
