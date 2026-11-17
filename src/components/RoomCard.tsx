import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import type { Room } from '@/types';
export function RoomCard({
  room,
  isMember,
  onPress,
  index = 0,
}: {
  room: Room;
  isMember: boolean;
  onPress: () => void;
  index?: number;
}) {
  const palettes = [
    ['#F5D7E5', '#EDDBF7'],
    ['#DFD9F5', '#EEE5F8'],
    ['#FBE2CF', '#F5D9DF'],
    ['#E5D9F3', '#F5D8EB'],
  ] as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir sala ${room.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
    >
      <LinearGradient colors={palettes[index % palettes.length]} style={styles.art}>
        <View style={styles.orbit} />
        <Text style={styles.emoji}>{room.emoji || '🌴'}</Text>
        {isMember && (
          <View style={styles.joined}>
            <Ionicons name="checkmark" size={12} color={colors.primary} />
          </View>
        )}
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {room.description || 'Uma nova conversa espera por você.'}
        </Text>
        <View style={styles.footer}>
          <Ionicons name="people-outline" size={14} color={colors.primary} />
          <Text style={styles.count}>
            {room.memberCount ?? 0} {room.memberCount === 1 ? 'membro' : 'membros'}
          </Text>
          <Ionicons name="arrow-up-right-box-outline" size={17} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  art: { height: 91, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orbit: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#FFFFFF70',
    transform: [{ rotate: '-25deg' }, { scaleY: 0.65 }],
  },
  emoji: { fontSize: 42 },
  body: { padding: 15 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  description: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    height: 36,
    marginTop: 5,
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 13 },
  count: { fontSize: 10, color: colors.muted, flex: 1 },
  joined: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 12,
    padding: 4,
  },
});
