import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
export function SunsetHero({
  title,
  subtitle,
  children,
  compact = false,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <View style={[styles.hero, compact && { minHeight: 210 }]}>
      <Image
        source={require('../../assets/vice-sunset.png')}
        resizeMode="cover"
        style={styles.image}
      />
      <LinearGradient
        colors={['rgba(45,28,83,0.48)', 'rgba(61,36,105,0.55)', 'rgba(113,61,139,0.90)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.brand}>
        <Ionicons name="chatbubbles" size={23} color="#FFD4BA" />
        <Text style={styles.wordmark}>
          chatroom<Text style={styles.dot}>.</Text>
        </Text>
        <View style={styles.edition}>
          <Text style={styles.editionText}>VICE EDITION</Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>BOAS CONVERSAS. NOVAS CONEXÕES.</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  hero: {
    minHeight: 292,
    padding: 26,
    paddingTop: 24,
    paddingBottom: 42,
    overflow: 'hidden',
    backgroundColor: '#654499',
  },
  image: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: { fontSize: 27, fontWeight: '800', color: '#FFF8F1', letterSpacing: -1 },
  dot: { color: '#FFBCA8' },
  edition: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#FFFFFF55',
    borderRadius: 7,
    padding: 6,
  },
  editionText: { color: '#FFE1D0', fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  copy: { marginTop: 42 },
  eyebrow: { color: '#FFD0C1', fontSize: 9, fontWeight: '700', letterSpacing: 1.8 },
  title: {
    color: '#FFF9F2',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -1.4,
    marginTop: 10,
  },
  subtitle: {
    color: '#EBDDF0',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 280,
  },
});
