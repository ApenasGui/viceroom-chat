export function friendlyError(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail antes de entrar.';
  if (/fetch|network|offline/i.test(message))
    return 'Sem conexão com a internet. Tente novamente.';
  if (/already registered/i.test(message)) return 'Este e-mail já tem uma conta.';
  return message || 'Algo deu errado. Tente novamente.';
}
