import { Alert, Platform } from 'react-native';
export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}
export function confirmAction(
  title: string,
  message: string,
  actionLabel: string,
  action: () => void,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) action();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: actionLabel, style: 'destructive', onPress: action },
  ]);
}
