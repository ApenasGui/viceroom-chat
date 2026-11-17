import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { queryClient } from '@/lib/queryClient';
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: '#EDE7F2' }}>
          <View
            style={{
              flex: 1,
              width: '100%',
              maxWidth: 560,
              alignSelf: 'center',
              overflow: 'hidden',
            }}
          >
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </AuthProvider>
    </QueryClientProvider>
  );
}
