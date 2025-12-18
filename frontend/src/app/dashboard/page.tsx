'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Diamond,
  User,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMyOrders, useMyTournaments } from '@/lib/hooks/api-hooks';

export default function DashboardPage() {
  const { state: authState, logout } = useAuth();
  const { data: ordersData, isLoading: ordersLoading } = useMyOrders();
  const { data: tournamentsData, isLoading: tournamentsLoading } = useMyTournaments();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/login');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);

  // Loading state
  if (authState.isLoading || !authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const user = authState.user;
  const appUser = {
    id: String(user.id),
    email: user.email,
    display_name: user.display_name || user.email?.split('@')[0] || 'Utilisateur',
    role: user.role as 'user' | 'admin' | 'organizer',
  };

  // Calculate stats
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const tournaments = Array.isArray(tournamentsData) ? tournamentsData : [];
  
  const totalSpent = orders.reduce((sum: number, o: { total_amount?: number }) => sum + (o.total_amount || 0), 0);
  const tournamentsWon = tournaments.filter((t: { position?: number }) => t.position === 1).length;

  const stats = [
    {
      label: 'Commandes',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Total dépensé',
      value: `${totalSpent.toLocaleString()} XOF`,
      icon: CreditCard,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      label: 'Tournois joués',
      value: tournaments.length,
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      label: 'Victoires',
      value: tournamentsWon,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ];

  const quickActions = [
    {
      title: 'Acheter des Diamants',
      description: 'Parcourez notre catalogue de produits FreeFire',
      icon: Diamond,
      href: '/catalog',
      color: 'text-blue-400',
    },
    {
      title: 'Rejoindre un Tournoi',
      description: 'Participez aux compétitions et gagnez des prix',
      icon: Trophy,
      href: '/tournaments',
      color: 'text-yellow-400',
    },
    {
      title: 'Mon Profil',
      description: 'Gérez vos informations et préférences',
      icon: User,
      href: '/profile',
      color: 'text-purple-400',
    },
  ];

  return (
    <AppLayout user={appUser}>
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bienvenue, {appUser.display_name} ! 👋
            </h1>
            <p className="mt-2 text-neutral-400">
              Voici un aperçu de votre activité sur FreeFire MVP
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">{stat.label}</p>
                      <p className="text-xl font-bold text-white">
                        {ordersLoading || tournamentsLoading ? (
                          <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse" />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="card group hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-white/5 ${action.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-neutral-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Commandes récentes
                </h3>
                <Link href="/profile?tab=history" className="text-sm text-primary hover:text-primary/80">
                  Voir tout
                </Link>
              </div>
              
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: { id?: string; code?: string; created_at?: string; item_name?: string; total_amount?: number; status?: string }) => (
                    <div
                      key={order.id || order.code}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="font-medium text-white">{order.item_name || 'Commande'}</p>
                        <p className="text-xs text-neutral-400">
                          {order.created_at?.split('T')[0] || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {(order.total_amount || 0).toLocaleString()} XOF
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">
                          {order.status || 'completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune commande</p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/catalog">Voir le catalogue</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Upcoming Tournaments */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  Mes tournois
                </h3>
                <Link href="/tournaments" className="text-sm text-primary hover:text-primary/80">
                  Voir tout
                </Link>
              </div>
              
              {tournamentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : tournaments.length > 0 ? (
                <div className="space-y-3">
                  {tournaments.slice(0, 3).map((tournament: { id?: string | number; title?: string; tournament?: { title?: string }; start_date?: string; position?: number }) => (
                    <div
                      key={tournament.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {tournament.title || tournament.tournament?.title || 'Tournoi'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {tournament.start_date?.split('T')[0] || 'N/A'}
                        </p>
                      </div>
                      {tournament.position && (
                        <span className={`text-sm font-bold ${
                          tournament.position === 1 ? 'text-yellow-400' : 
                          tournament.position <= 3 ? 'text-primary' : 'text-neutral-400'
                        }`}>
                          #{tournament.position}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400">
                  <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun tournoi</p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/tournaments">Voir les tournois</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
