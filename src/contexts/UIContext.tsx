'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isWhatsAppVisible: boolean;
  setIsWhatsAppVisible: (visible: boolean) => void;
  isNavbarSearchEnabled: boolean;
  setIsNavbarSearchEnabled: (enabled: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWhatsAppVisible, setIsWhatsAppVisible] = useState(true);
  const [isNavbarSearchEnabled, setIsNavbarSearchEnabled] = useState(true);

  return (
    <UIContext.Provider value={{
      searchQuery,
      setSearchQuery,
      isWhatsAppVisible,
      setIsWhatsAppVisible,
      isNavbarSearchEnabled,
      setIsNavbarSearchEnabled
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
