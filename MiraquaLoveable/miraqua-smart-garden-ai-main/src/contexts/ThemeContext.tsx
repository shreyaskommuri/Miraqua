
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('miraqua-theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let actualTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        actualTheme = theme;
      }
      
      setResolvedTheme(actualTheme);
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      // Add new theme class
      root.classList.add(actualTheme);
      
      // Modern refined color tokens
      if (actualTheme === 'dark') {
        // Dark theme - modern, sophisticated colors
        root.style.setProperty('--background', '222 47% 5%');
        root.style.setProperty('--foreground', '210 40% 98%');
        root.style.setProperty('--card', '222 47% 6%');
        root.style.setProperty('--card-foreground', '210 40% 98%');
        root.style.setProperty('--popover', '222 47% 6%');
        root.style.setProperty('--popover-foreground', '210 40% 98%');
        root.style.setProperty('--primary', '160 84% 39%');
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        root.style.setProperty('--secondary', '217 32% 17%');
        root.style.setProperty('--secondary-foreground', '210 40% 98%');
        root.style.setProperty('--muted', '215 28% 17%');
        root.style.setProperty('--muted-foreground', '217 10% 65%');
        root.style.setProperty('--accent', '160 84% 39%');
        root.style.setProperty('--accent-foreground', '0 0% 100%');
        root.style.setProperty('--destructive', '0 63% 31%');
        root.style.setProperty('--destructive-foreground', '210 40% 98%');
        root.style.setProperty('--border', '215 28% 17%');
        root.style.setProperty('--input', '215 28% 17%');
        root.style.setProperty('--ring', '160 84% 39%');
      } else {
        // Light theme - clean, modern colors
        root.style.setProperty('--background', '0 0% 100%');
        root.style.setProperty('--foreground', '222 47% 11%');
        root.style.setProperty('--card', '0 0% 100%');
        root.style.setProperty('--card-foreground', '222 47% 11%');
        root.style.setProperty('--popover', '0 0% 100%');
        root.style.setProperty('--popover-foreground', '222 47% 11%');
        root.style.setProperty('--primary', '160 84% 39%');
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        root.style.setProperty('--secondary', '210 40% 98%');
        root.style.setProperty('--secondary-foreground', '222 47% 11%');
        root.style.setProperty('--muted', '210 40% 96%');
        root.style.setProperty('--muted-foreground', '215 16% 47%');
        root.style.setProperty('--accent', '210 40% 96%');
        root.style.setProperty('--accent-foreground', '222 47% 11%');
        root.style.setProperty('--destructive', '0 84% 60%');
        root.style.setProperty('--destructive-foreground', '210 40% 98%');
        root.style.setProperty('--border', '214 32% 91%');
        root.style.setProperty('--input', '214 32% 91%');
        root.style.setProperty('--ring', '160 84% 39%');
      }
      
      localStorage.setItem('miraqua-theme', theme);
    };

    updateTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
