import { useColorScheme } from 'react-native';
export const colors = {
  light: {
    background: '#F7F3EB',
    text: '#292923',
    surface: '#FFFCF6',
    muted: '#67665E',
    border: '#DED8CC',
    accent: '#93442C',
    accentSoft: '#F4DFD0',
    imageFallback: '#E7DED0',
    danger: '#973A35',
  },
  dark: {
    background: '#1E211E',
    text: '#FAF3E7',
    surface: '#2A2E28',
    muted: '#C1C2B5',
    border: '#474C42',
    accent: '#F3B496',
    accentSoft: '#4C382E',
    imageFallback: '#394237',
    danger: '#FFB2A8',
  },
} as const;
export const space = { xs: 6, sm: 12, md: 20, lg: 28, xl: 40 } as const;
export const radius = { control: 16, card: 24 } as const;
export function useTheme() {
  return colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
