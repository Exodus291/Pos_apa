'use client';

import { createContext, useState } from 'react';

// Berikan nilai default
export const ThemeContext = createContext({
  isDark: false,
  setIsDark: () => {}
});

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}