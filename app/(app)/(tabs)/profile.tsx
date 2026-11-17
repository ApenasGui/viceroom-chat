import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SunsetHero } from '@/components/SunsetHero';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useMyProfile, useUpdateUsername } from '@/hooks/useMyProfile';
import { isDemo } from '@/lib/config';
import { colors } from '@/theme';
import { friendlyError } from '@/utils/errors';
import { confirmAction, showAlert } from '@/utils/dialogs';
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const profile = useMyProfile();
  const updateUsername = useUpdateUsername();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  function save() {
    if (name.trim().length < 2 || name.trim().length > 40) {
      showAlert('Confira seu nome', 'Use entre 2 e 40 caracteres.');
      return;
    }
    updateUsername.mutate(name.trim(), {
      onSuccess: () => setEditing(false),
      onError: (e) => showAlert('Não foi possível salvar', friendlyError(e)),
    });
  }
  function leave() {
    confirmAction('Sair da conta', 'Deseja encerrar sua sessão?', 'Sair', () => {
      signOut().catch((e) => showAlert('Erro', friendlyError(e)));
    });
  }
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <SunsetHero
          compact
          title="Sua frequência."
          subtitle="Uma identidade. Muitas conexões."
        />
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>MEU PERFIL</Text>
          {profile.isLoading ? (
            <LoadingView />
          ) : profile.isError ? (
            <ErrorState
              message={friendlyError(profile.error)}
              onRetry={profile.refetch}
            />
          ) : (
            <View style={styles.card}>
              {profile.data && (
                <Avatar
                  username={profile.data.username}
                  color={profile.data.avatarColor}
                  size={88}
                />
              )}
              {editing ? (
                <View style={{ alignSelf: 'stretch', marginTop: 20 }}>
                  <Input
                    label="Nome exibido no chat"
                    value={name}
                    onChangeText={setName}
                    maxLength={40}
                    autoFocus
                  />
                  <View style={styles.row}>
                    <Button
                      title="Cancelar"
                      variant="ghost"
                      onPress={() => setEditing(false)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Salvar"
                      onPress={save}
                      loading={updateUsername.isPending}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.name}>{profile.data?.username}</Text>
                  <Text style={styles.email}>
                    {isDemo ? 'Explorando a cidade' : user?.email}
                  </Text>
                  <Button
                    title="Editar meu nome"
                    variant="secondary"
                    onPress={() => {
                      setName(profile.data?.username || '');
                      setEditing(true);
                    }}
                    style={{ alignSelf: 'stretch', marginTop: 24 }}
                  />
                </>
              )}
            </View>
          )}
          <View style={styles.note}>
            <Text style={styles.noteTitle}>
              {isDemo ? 'Você está na demonstração' : 'Sua presença faz a diferença'}
            </Text>
            <Text style={styles.noteText}>
              {isDemo
                ? 'Salas, mensagens e perfil ficam apenas neste aparelho. Configure o Supabase para conversar com outras pessoas.'
                : 'Seu nome e avatar aparecem nas salas em que você participa. Entre, converse e faça parte.'}
            </Text>
          </View>
          <Button title="Sair da conta" variant="ghost" onPress={leave} />
          <Text style={styles.footer}>CHATROOM · VICE EDITION</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.purple },
  sheet: {
    backgroundColor: colors.background,
    marginTop: -25,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 25,
    minHeight: 520,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: 27,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginTop: 18,
    letterSpacing: -0.6,
  },
  email: { color: colors.muted, fontSize: 12, marginTop: 7 },
  row: { flexDirection: 'row', gap: 10 },
  note: {
    padding: 20,
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },
  noteTitle: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  noteText: { color: colors.muted, fontSize: 12, lineHeight: 20, marginTop: 7 },
  footer: {
    color: colors.muted,
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 26,
    marginBottom: 20,
  },
});
