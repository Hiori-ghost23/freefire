'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Trophy, 
  ShoppingCart, 
  Home,
  Plus,
  List,
  Bell,
  Crown,
  Diamond,
  UserCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface User {
  id: string;
  email: string;
  display_name?: string;
  role: 'user' | 'organizer' | 'admin';
}

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Tournois', href: '/tournaments', icon: Trophy },
  { name: 'Catalogue', href: '/catalog', icon: Diamond },
];

const userNavigation = [
  { name: 'Mon Profil', href: '/profile', icon: UserCircle },
  { name: 'Mon Panier', href: '/cart', icon: ShoppingCart },
  { name: 'Mes Tournois', href: '/tournaments/my', icon: Trophy },
  { name: 'Créer un Tournoi', href: '/tournaments/create', icon: Plus },
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
];

export default function Header({ user, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Mock logout
      addToast({
        type: 'info',
        title: 'Déconnexion',
        message: 'Vous avez été déconnecté avec succès.',
      });
      router.push('/login');
    }
    setIsUserMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', icon: Crown, color: 'text-yellow-400' };
      case 'organizer':
        return { text: 'Organisateur', icon: Trophy, color: 'text-purple-400' };
      default:
        return { text: 'Joueur', icon: User, color: 'text-blue-400' };
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 ring-1 ring-primary/30 grid place-items-center">
                <span className="text-sm font-bold text-primary tracking-tight">FF</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold tracking-tight">GOKU E-SHOP</h1>
                <p className="text-xs text-neutral-400">Tournois & E-commerce</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-neutral-300 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Auth Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                {/* User Avatar Button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 ring-2 ring-primary/30 grid place-items-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">
                        {user.display_name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {getRoleDisplay(user.role).text}
                      </p>
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-neutral-900/95 border border-white/10 backdrop-blur-sm shadow-xl ring-1 ring-black/5 focus:outline-none">
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 ring-2 ring-primary/30 grid place-items-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {user.display_name || user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-neutral-400">{user.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {(() => {
                                const roleInfo = getRoleDisplay(user.role);
                                const RoleIcon = roleInfo.icon;
                                return (
                                  <>
                                    <RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />
                                    <span className={`text-xs ${roleInfo.color}`}>
                                      {roleInfo.text}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User Navigation */}
                      {userNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.href);
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                              isActive
                                ? 'text-primary bg-primary/10'
                                : 'text-neutral-300 hover:text-primary hover:bg-primary/5'
                            }`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}

                      {/* Divider */}
                      <div className="border-t border-white/10 my-2" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Se connecter
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/register')}
                >
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-neutral-900/50 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-neutral-300 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* User actions on mobile */}
              {user && (
                <>
                  <div className="border-t border-white/10 mt-3 pt-3">
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActivePath(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            isActive
                              ? 'text-primary bg-primary/10'
                              : 'text-neutral-300 hover:text-primary hover:bg-primary/5'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
