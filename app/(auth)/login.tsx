import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { SunsetHero } from '@/components/SunsetHero';
import { useAuth } from '@/context/AuthContext';
import { isDemo } from '@/lib/config';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { colors } from '@/theme';
import { friendlyError } from '@/utils/errors';
export default function LoginScreen() {
  const { signIn, enterDemo } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [openingDemo, setOpeningDemo] = useState(false);
  const { control, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      setFormError(friendlyError(error));
    }
  });
  async function explore() {
    setOpeningDemo(true);
    try {
      await enterDemo();
    } catch (error) {
      setFormError(friendlyError(error));
    } finally {
      setOpeningDemo(false);
    }
  }
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <SunsetHero
            title={'A cidade é grande.\nA conexão é sua.'}
            subtitle="Entre na conversa. Encontre sua turma. Sinta a vibe."
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Bom ter você por aqui.</Text>
            <Text style={styles.subtitle}>Seu próximo encontro começa com um oi.</Text>
            <FormInput
              control={control}
              name="email"
              label="E-mail"
              placeholder="seu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <FormInput
              control={control}
              name="password"
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry
              autoComplete="password"
            />
            {formError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {formError}
              </Text>
            )}
            <Button
              title="Entrar na conversa  →"
              onPress={submit}
              loading={formState.isSubmitting}
            />
            <Link href="/register" style={styles.link}>
              Novo por aqui? <Text style={styles.strong}>Crie sua conta</Text>
            </Link>
            {isDemo && (
              <View style={styles.demo}>
                <Text style={styles.demoTitle}>Dê uma volta pela cidade</Text>
                <Text style={styles.demoText}>
                  Experimente com dados locais de exemplo.
                </Text>
                <Button
                  title="Explorar demonstração"
                  variant="secondary"
                  onPress={explore}
                  loading={openingDemo}
                />
                <Text style={styles.demoFoot}>
                  Sem conta · sem conexão com o Supabase
                </Text>
              </View>
            )}
            <Text style={styles.footer}>SUNSET VIBES. REAL CONNECTIONS.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.purple },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 27,
  },
  handle: {
    width: 33,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#E5DAE8',
    alignSelf: 'center',
    marginTop: -12,
    marginBottom: 24,
  },
  title: { fontSize: 25, fontWeight: '800', letterSpacing: -0.8, color: colors.text },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 7, marginBottom: 27 },
  error: { color: colors.danger, marginBottom: 15, fontSize: 13 },
  link: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 22 },
  strong: { color: colors.primary, fontWeight: '700' },
  demo: { marginTop: 28, paddingTop: 21, borderTopWidth: 1, borderColor: colors.border },
  demoTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  demoText: { color: colors.muted, fontSize: 11, marginTop: 5, marginBottom: 14 },
  demoFoot: { color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: 10 },
  footer: {
    fontSize: 8,
    letterSpacing: 2,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 8,
  },
});
