'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

// Create Theme Context (simplified, always dark)
const ThemeContext = createContext({
  theme: 'dark',
});

// Custom hook to use theme
export function useTheme() {
  return useContext(ThemeContext);
}

// Simplified Theme Provider Component
export function ThemeProvider({ children }) {
  // Always use dark theme
  const [mounted, setMounted] = useState(false);
  
  // Initialize theme
  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('dark');
  }, []);
  
  // Provide context only after mounting to prevent hydration mismatch
  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function SessionProviderWrapper({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
} 