import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

// O dashboard atual usa apenas o tema claro. Este provider existe para manter
// a mesma API do App.tsx original e facilitar suporte a tema escuro no futuro.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
