export const LIGHT_COLORS = {
  background: '#ffffff',
  foreground: '#0f172a',
  border: '#e2e8f0',
  input: '#f8fafc',
  primary: '#1E3A8A',
  primaryForeground: '#ffffff',
  secondary: '#14B8A6',
  secondaryForeground: '#ffffff',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#14B8A6',
  accentForeground: '#ffffff',
  error: '#EF4444',
  errorForeground: '#ffffff',
  card: '#f8fafc',
  cardForeground: '#0f172a',
  surface: '#f1f5f9',
  transparent: 'transparent',
} as const;

export const DARK_COLORS = {
  background: '#0f172a', 
  foreground: '#f8fafc', 
  border: '#334155', 
  input: '#1e293b', 
  primary: '#3b82f6', 
  primaryForeground: '#ffffff',
  secondary: '#14B8A6', 
  secondaryForeground: '#ffffff',
  muted: '#1e293b', 
  mutedForeground: '#94a3b8', 
  accent: '#14B8A6',
  accentForeground: '#ffffff',
  error: '#f87171', 
  errorForeground: '#ffffff',
  card: '#1e293b', 
  cardForeground: '#f8fafc',
  surface: '#1e293b',
  transparent: 'transparent',
} as const;

export interface ThemeColors {
  background: string;
  foreground: string;
  border: string;
  input: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  error: string;
  errorForeground: string;
  card: string;
  cardForeground: string;
  surface: string;
  transparent: string;
}

export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 32,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
