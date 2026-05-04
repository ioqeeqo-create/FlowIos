/**
 * Глобальный пиксельный шрифт (имя из TTF name table: «Minecraft Rus»).
 * Дублируем в index до App, т.к. Fabric может игнорировать defaultProps только в App.tsx.
 */
import { Text, TextInput } from 'react-native';
import { MINECRAFT_FONT } from '../constants/theme';

let typographyApplied = false;

function mergeStyle(existing: unknown): Array<Record<string, unknown> | undefined> {
  const base = { fontFamily: MINECRAFT_FONT };
  if (existing == null) return [base];
  if (Array.isArray(existing)) return [base, ...existing];
  return [base, existing as Record<string, unknown>];
}

export function applyGlobalTypography() {
  if (typographyApplied) return;
  typographyApplied = true;
  const T = Text as typeof Text & { defaultProps?: { style?: unknown } };
  const TI = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
  T.defaultProps = { ...(T.defaultProps || {}), style: mergeStyle(T.defaultProps?.style) };
  TI.defaultProps = { ...(TI.defaultProps || {}), style: mergeStyle(TI.defaultProps?.style) };
}
