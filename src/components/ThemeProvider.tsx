'use client';

import { ReactNode, createContext, useContext } from 'react';

type ThemeContextType = {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
  };
};

const ThemeContext = createContext<ThemeContextType>({
  colors: {
    primary: 'hsl(210 40% 48%)',
    secondary: 'hsl(214.3 20% 85%)',
    success: 'hsl(142 60% 45%)',
    warning: 'hsl(38 92% 50%)',
    danger: 'hsl(0 72% 51%)'
  }
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{
      colors: {
        primary: 'hsl(210 40% 48%)',
        secondary: 'hsl(214.3 20% 85%)',
        success: 'hsl(142 60% 45%)',
        warning: 'hsl(38 92% 50%)',
        danger: 'hsl(0 72% 51%)'
      }
    }}>
      {children}
    </ThemeContext.Provider>
  );
}