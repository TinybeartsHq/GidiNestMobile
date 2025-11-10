import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text as RNText, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';

type RegistryLink = {
  id: string;
  title: string;
  type: 'everyday' | 'special';
  expiresOn?: string;
};

export default function GiftRegistryScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [category, setCategory] = useState<'everyday' | 'special'>('everyday');
  const [occasion, setOccasion] = useState<'baby_dedication' | 'baby_shower' | 'random'>('random');
  const [links, setLinks] = useState<RegistryLink[]>([
    { id: 'link-1', title: 'Ada Dedication Gifts', type: 'special', expiresOn: '2025-08-10' },
    { id: 'link-2', title: 'General Support', type: 'everyday' },
  ]);

  const cardBackground = isDark ? 'rgba(17,24,39,0.72)' : palette.card;
  const featureTint = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.08)';
  const separator = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(148,163,184,0.18)';

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Missing info', 'Please give your gift registry a title.');
      return;
    }
    const id = `link-${Date.now()}`;
    setLinks((prev) => [{ id, title, type: category, expiresOn: expiresOn || undefined }, ...prev]);
    setTitle('');
    setExpiresOn('');
    setOccasion('random');
    setCategory('everyday');
    Alert.alert('Created', 'Your gift registry link has been created.');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ gap: theme.spacing.xs / 2 }}>
              <RNText style={[styles.heading, { color: palette.text }]}>Gift registry</RNText>
              <View style={[styles.headingAccent, { backgroundColor: palette.primary }]} />
            </View>
            <View style={[styles.headerIcon, { backgroundColor: featureTint }]}>
              <MaterialCommunityIcons name="gift-outline" size={18} color={palette.primary} />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: separator }]}>
            <RNText style={[styles.cardTitle, { color: palette.text }]}>What is a gift registry?</RNText>
            <RNText style={[styles.cardCopy, { color: palette.textSecondary }]}>
              Create a simple link friends and family can use to send gifts to your wallet. Use it for
              everyday support or special occasions like a baby dedication or shower.
            </RNText>
          </View>

          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: separator }]}>
            <RNText style={[styles.cardTitle, { color: palette.text }]}>Create a registry link</RNText>

            <TextInput
              mode="outlined"
              label="Registry title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <RNText style={[styles.label, { color: palette.textSecondary }]}>Occasion</RNText>
            <View style={styles.row}>
              {[
                { key: 'random', label: 'Just because' },
                { key: 'baby_dedication', label: 'Baby dedication' },
                { key: 'baby_shower', label: 'Baby shower' },
              ].map((opt) => (
                <Chip
                  key={opt.key}
                  selected={occasion === (opt.key as any)}
                  onPress={() => setOccasion(opt.key as any)}
                  style={[styles.chip, { backgroundColor: occasion === opt.key ? palette.primary + '22' : featureTint }]}
                  selectedColor={palette.primary}
                >
                  {opt.label}
                </Chip>
              ))}
            </View>

            <RNText style={[styles.label, { color: palette.textSecondary }]}>Category</RNText>
            <View style={styles.row}>
              {[
                { key: 'everyday', label: 'Everyday' },
                { key: 'special', label: 'Special' },
              ].map((opt) => (
                <Chip
                  key={opt.key}
                  selected={category === (opt.key as any)}
                  onPress={() => setCategory(opt.key as any)}
                  style={[styles.chip, { backgroundColor: category === opt.key ? palette.primary + '22' : featureTint }]}
                  selectedColor={palette.primary}
                >
                  {opt.label}
                </Chip>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Expiration date (optional, YYYY-MM-DD)"
              value={expiresOn}
              onChangeText={setExpiresOn}
              style={styles.input}
            />

            <Button mode="contained" onPress={handleCreate} buttonColor={palette.primary} textColor="#FFFFFF">
              Create link
            </Button>
          </View>

          <RNText style={[styles.sectionTitle, { color: palette.text }]}>Your links</RNText>

          <View style={styles.linksStack}>
            {links.map((link) => (
              <Pressable
                key={link.id}
                style={[styles.linkCard, { backgroundColor: cardBackground, borderColor: separator }]}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('GiftLink', { linkId: link.id });
                }}
              >
                <View style={[styles.linkIcon, { backgroundColor: palette.primary + '1A' }]}>
                  <MaterialCommunityIcons name="link-variant" size={18} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <RNText style={[styles.linkTitle, { color: palette.text }]}>{link.title}</RNText>
                  <RNText style={[styles.linkMeta, { color: palette.textSecondary }]}>
                    {link.type === 'special' ? 'Special occasion' : 'Everyday'} {link.expiresOn ? `• Expires ${link.expiresOn}` : ''}
                  </RNText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { fontFamily: 'NeuzeitGro-ExtraBold', fontSize: 24, letterSpacing: -0.4 },
  headingAccent: { height: 2, width: 36, borderRadius: 1, marginTop: theme.spacing.xs / 2 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  cardTitle: { fontFamily: 'NeuzeitGro-SemiBold', fontSize: 16 },
  cardCopy: { fontFamily: 'NeuzeitGro-Regular', fontSize: 13, lineHeight: 19 },
  input: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
  label: { fontFamily: 'NeuzeitGro-Medium', fontSize: 12, marginTop: theme.spacing.sm },
  row: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap', marginBottom: theme.spacing.sm },
  chip: { borderRadius: theme.borderRadius.lg },
  sectionTitle: { fontFamily: 'NeuzeitGro-SemiBold', fontSize: 16 },
  linksStack: { gap: theme.spacing.sm },
  linkCard: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  linkIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  linkTitle: { fontFamily: 'NeuzeitGro-SemiBold', fontSize: 14 },
  linkMeta: { fontFamily: 'NeuzeitGro-Regular', fontSize: 12 },
});


