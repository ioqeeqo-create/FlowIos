import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const ACCENT = '#c084fc';

type IconProps = {
  color: string;
  focused: boolean;
  size?: number;
};

/** Пути как в `flow_fixed/index.html` (nav-icon flow-ref-nav / sidebar). */
export function TabIconHome({ color, focused, size = 22 }: IconProps) {
  const stroke = color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.2L12 4l8 6.2V19.25a1.25 1.25 0 01-1.25 1.25h-13.5A1.25 1.25 0 014 19.25V10.2z"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Path
        d="M12 17.2v-2.9"
        stroke={ACCENT}
        strokeLinecap="round"
        strokeWidth={2}
        opacity={focused ? 1 : 0.55}
      />
    </Svg>
  );
}

export function TabIconSearch({ color, focused, size = 22 }: IconProps) {
  const stroke = color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={stroke} strokeWidth={1.75} />
      <Path d="M20 20l-4.55-4.55" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" />
      <Path
        d="M18.95 17.98L21 20.1"
        stroke={ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={focused ? 1 : 0.55}
      />
    </Svg>
  );
}

export function TabIconLibrary({ color, focused, size = 22 }: IconProps) {
  const stroke = color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5.5} y={5.5} width={13} height={13} rx={3.5} stroke={stroke} strokeWidth={1.75} />
      <Path
        d="M9 16.85h6"
        stroke={ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={focused ? 1 : 0.55}
      />
    </Svg>
  );
}

/** «Друзья» + плюс — как в десктопе (social). */
export function TabIconSocial({ color, focused: _focused, size = 22 }: IconProps) {
  const stroke = color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke={stroke}
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={8.5} cy={7} r={4} stroke={stroke} strokeWidth={1.85} />
      <Path d="M20 8v6" stroke={stroke} strokeWidth={1.85} strokeLinecap="round" />
      <Path d="M23 11h-6" stroke={stroke} strokeWidth={1.85} strokeLinecap="round" />
    </Svg>
  );
}

export function TabIconSettings({ color, size = 22 }: IconProps) {
  const stroke = color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={stroke} strokeWidth={1.85} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={stroke}
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
