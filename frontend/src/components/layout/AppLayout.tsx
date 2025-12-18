'use client';

import { ReactNode } from 'react';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  role: 'user' | 'organizer' | 'admin';
}

export interface AppLayoutProps {
  children: ReactNode;
  user?: User | null;
  onLogout?: () => void;
}

export default function AppLayout({ children, user, onLogout }: AppLayoutProps) {
  const { logout } = useAuth();
  
  // Use provided onLogout or default to auth context logout
  const handleLogout = onLogout || logout;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <Header user={user} onLogout={handleLogout} />
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
