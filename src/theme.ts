import {
  darkTheme,
  Provider as RNMaterialProvider,
  type ProviderProps,
  type Theme,
} from '@react-native-material/core';
import type { FC, ReactNode } from 'react';
import type { TextStyle } from 'react-native';

export const fontFamily = {
  display: 'Outfit_300Light',
  displayMedium: 'Outfit_500Medium',
  displaySemiBold: 'Outfit_600SemiBold',
  body: 'NotoSansJP_400Regular',
  bodyMedium: 'NotoSansJP_500Medium',
  bodyBold: 'NotoSansJP_700Bold',
} as const;

export const colors = {
  background: '#111111',
  surface: '#1C1C1C',
  text: '#F5F5F5',
  muted: '#8A8A8A',
  ink: '#111111',
} as const;

const radius = (size: number) => ({
  borderTopStartRadius: size,
  borderTopEndRadius: size,
  borderBottomStartRadius: size,
  borderBottomEndRadius: size,
});

const type = (font: string, fontSize: number, extras: TextStyle = {}): TextStyle => ({
  fontFamily: font,
  fontSize,
  ...extras,
});

export const appTheme: Theme = {
  ...darkTheme,
  palette: {
    ...darkTheme.palette,
    primary: { main: colors.text, on: colors.ink },
    secondary: { main: colors.muted, on: colors.text },
    background: { main: colors.background, on: colors.text },
    surface: { main: colors.surface, on: colors.text },
    error: { main: '#C45C5C', on: colors.text },
  },
  shapes: {
    small: radius(12),
    medium: radius(12),
    large: radius(16),
  },
  typography: {
    h1: type(fontFamily.display, 96, { letterSpacing: -1.5 }),
    h2: type(fontFamily.display, 60, { letterSpacing: -0.5 }),
    h3: type(fontFamily.display, 36, { letterSpacing: -0.6, lineHeight: 44 }),
    h4: type(fontFamily.bodyMedium, 28, { letterSpacing: -0.2, lineHeight: 36 }),
    h5: type(fontFamily.bodyMedium, 22, { lineHeight: 30 }),
    h6: type(fontFamily.bodyMedium, 18, { letterSpacing: 0.1 }),
    subtitle1: type(fontFamily.bodyMedium, 16, { letterSpacing: 0.1 }),
    subtitle2: type(fontFamily.bodyMedium, 14, { letterSpacing: 0.1 }),
    body1: type(fontFamily.body, 16, { letterSpacing: 0.1, lineHeight: 24 }),
    body2: type(fontFamily.body, 14, { letterSpacing: 0.1, lineHeight: 20 }),
    button: type(fontFamily.bodyMedium, 15, { letterSpacing: 0.4 }),
    caption: type(fontFamily.body, 12, { letterSpacing: 0.2 }),
    overline: type(fontFamily.bodyMedium, 12, { letterSpacing: 1.2 }),
  },
};

export const Provider = RNMaterialProvider as FC<ProviderProps & { children?: ReactNode }>;
