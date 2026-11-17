import { isDemo } from '@/lib/config';
import { showAlert, confirmAction } from '@/utils/dialogs';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MessageBubble } from '@/components/MessageBubble';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useAuth } from '@/context/AuthContext';
import { useDeleteMessage, useMessages, useSendMessage } from '@/hooks/useMessages';
import { useRoomPresence } from '@/hooks/usePresence';
import {
  useJoinRoom,
  useLeaveRoom,
  useMyRoomIds,
  useRoom,
  useRoomMembers,
} from '@/hooks/useRooms';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { colors, radius, spacing } from '@/theme';
import { friendlyError } from '@/utils/errors';
import { formatDaySeparator, shouldGroupWithPrevious } from '@/utils/messages';
export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const room = useRoom(id);
  const {
    data: myRoomIds,
    isLoading: membershipLoading,
    isError: membershipError,
    error: membershipFailure,
    refetch: retryMembership,
  } = useMyRoomIds();
  const isMember = myRoomIds?.has(id) ?? false;
  const messages = useMessages(isMember ? id : undefined);
  const sendMessage = useSendMessage(id);
  const deleteMessage = useDeleteMessage(id);
  const joinRoom = useJoinRoom();
  const leaveRoom = useLeaveRoom();
  const online = useRoomPresence(isMember ? id : undefined);
  const { typingUsernames, notifyTyping } = useTypingIndicator(isMember ? id : undefined);
  const { data: members } = useRoomMembers(id);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    if (messages.data?.length)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.data?.length]);
  if (room.isLoading || membershipLoading) return <LoadingView />;
  if (membershipError)
    return (
      <ErrorState message={friendlyError(membershipFailure)} onRetry={retryMembership} />
    );
  if (room.isError || !room.data)
    return <ErrorState message={friendlyError(room.error)} onRetry={room.refetch} />;
  function handleSend() {
    const body = text.trim();
    if (!body) return;
    setText('');
    sendMessage.mutate(body, {
      onError: (e) => {
        setText(body);
        showAlert('Não foi possível enviar', friendlyError(e));
      },
    });
  }
  function confirmDelete(messageId: string) {
    confirmAction('Apagar mensagem', 'Esta ação não pode ser desfeita.', 'Apagar', () =>
      deleteMessage.mutate(messageId, {
        onError: (e) => showAlert('Não foi possível apagar', friendlyError(e)),
      }),
    );
  }
  function confirmLeave() {
    confirmAction('Sair da sala', `Deseja sair de ${room.data!.name}?`, 'Sair', () =>
      leaveRoom.mutate(id, {
        onSuccess: () => router.replace('/'),
        onError: (e) => showAlert('Não foi possível sair', friendlyError(e)),
      }),
    );
  }

  if (!isMember) {
    return (
      <View style={styles.joinScreen}>
        <Stack.Screen options={{ title: room.data.name }} />
        <Text style={styles.joinEmoji}>{room.data.emoji}</Text>
        <Text style={styles.joinTitle}>{room.data.name}</Text>
        {room.data.description ? (
          <Text style={styles.joinDescription}>{room.data.description}</Text>
        ) : null}
        <Text style={styles.joinCount}>
          {room.data.memberCount ?? 0}{' '}
          {room.data.memberCount === 1 ? 'participante' : 'participantes'}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={joinRoom.isPending}
          onPress={() =>
            joinRoom.mutate(id, {
              onError: (e) => showAlert('Não foi possível entrar', friendlyError(e)),
            })
          }
          style={styles.joinButton}
        >
          <Text style={styles.joinButtonText}>
            {joinRoom.isPending ? 'Entrando...' : 'Entrar na sala'}
          </Text>
        </Pressable>
      </View>
    );
  }
  const onlineCount = online.length;
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: room.data.name,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da sala"
              onPress={confirmLeave}
              style={{ padding: 10 }}
            >
              <Ionicons name="exit-outline" size={22} color={colors.danger} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.onlineBar}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineText}>
          {isDemo ? 'Demonstração local' : `${onlineCount} online`}
          {members?.length ? ` · ${members.length} na sala` : ''}
        </Text>
      </View>
      {messages.isError ? (
        <ErrorState message={friendlyError(messages.error)} onRetry={messages.refetch} />
      ) : messages.isLoading ? (
        <LoadingView />
      ) : (
        <FlatList
          ref={listRef}
          data={messages.data ?? []}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.muted, padding: 30 }}>
              A conversa começa com você. Diga um oi! 🌴
            </Text>
          }
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View>
              {(index === 0 ||
                formatDaySeparator(item.createdAt) !==
                  formatDaySeparator(messages.data![index - 1].createdAt)) && (
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.muted,
                    fontSize: 10,
                    marginVertical: 20,
                  }}
                >
                  {formatDaySeparator(item.createdAt)}
                </Text>
              )}
              <MessageBubble
                message={item}
                mine={item.userId === user?.id}
                showSender={!shouldGroupWithPrevious(item, messages.data?.[index - 1])}
                pending={item.id.startsWith('temp-')}
                onLongPress={() => confirmDelete(item.id)}
              />
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}
      <TypingIndicator usernames={typingUsernames} />
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            if (t.length > 0) notifyTyping();
          }}
          placeholder="Escreva uma mensagem"
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
          maxLength={2000}
          accessibilityLabel="Mensagem"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          onPress={handleSend}
          disabled={!text.trim()}
          style={[styles.sendButton, !text.trim() && styles.sendDisabled]}
        >
          <Ionicons name="send" size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  onlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.online },
  onlineText: { fontSize: 12, color: colors.muted },
  list: { padding: spacing.md, gap: 2 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  joinScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  joinEmoji: { fontSize: 56 },
  joinTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  joinDescription: { fontSize: 15, color: colors.muted, textAlign: 'center' },
  joinCount: { fontSize: 13, color: colors.muted, marginBottom: spacing.md },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
  },
  joinButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
});
