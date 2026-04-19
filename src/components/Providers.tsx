'use client';

import React from 'react';
import { PostProvider } from '../contexts/PostContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from './Common/NotificationContext';
import { UIProvider } from '../contexts/UIContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <UIProvider>
          <PostProvider>
            {children}
          </PostProvider>
        </UIProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
