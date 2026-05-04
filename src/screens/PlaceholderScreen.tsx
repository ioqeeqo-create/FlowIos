import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';

type Params = { title?: string; subtitle?: string };

export function PlaceholderScreen() {
  const insets = useSafeAreaInsets();
  const { fontId } = useFlowSettings();
  const route = useRoute();
  const p = (route.params || {}) as Params;
  const title = p.title ?? 'Flow';
  const subtitle = p.subtitle ?? '';
  const titleFont = fontFamilyForId(fontId);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={[styles.title, titleFont ? { fontFamily: titleFont } : null]}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07070d',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f4f4f8',
  },
  sub: {
    marginTop: 8,
    fontSize: 15,
    color: '#9ca3af',
  },
});
