'use client';

import { Trophy, Diamond, Users, Zap, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Trophy,
    title: 'Tournois Compétitifs',
    description: 'Participez aux tournois et montrez vos compétences',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
  },
  {
    icon: Diamond,
    title: 'Boutique Premium',
    description: 'Achetez des diamants, des pass et des items exclusifs',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    icon: Users,
    title: 'Communauté Active',
    description: 'Rejoignez des milliers de joueurs passionnés',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  {
    icon: Zap,
    title: 'Paiements Rapides',
    description: 'Transactions sécurisées avec Mobile Money',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
];

const stats = [
  { label: 'Joueurs Actifs', value: '10K+' },
  { label: 'Tournois Organisés', value: '500+' },
  { label: 'Diamants Vendus', value: '1M+' },
  { label: 'Pays Supportés', value: '10' },
];

export default function HomePage() {
  const { state: authState } = useAuth();
  
  // Get user from auth context
  const user = authState.user ? {
    id: String(authState.user.id),
    email: authState.user.email,
    display_name: authState.user.display_name || authState.user.email?.split('@')[0] || 'Utilisateur',
    role: authState.user.role as 'user' | 'admin' | 'organizer',
  } : null;
  
  return (
    <AppLayout user={user}>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          {/* Background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.1),transparent_50%)]" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block text-white">GOKU</span>
                <span className="block bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  E-SHOP
                </span>
              </h1>
              
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-neutral-300">
                La plateforme ultime pour les passionnés de gaming. 
                Participez aux tournois, achetez des items premium et rejoignez la communauté.
              </p>
              
              {/* CTA buttons */}
              <div className="mt-10 flex items-center justify-center gap-6">
                <Button size="lg" asChild>
                  <Link href="/register">
                    <Play className="w-5 h-5 mr-2" />
                    Commencer
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild>
                  <Link href="/tournaments">
                    <Trophy className="w-5 h-5 mr-2" />
                    Voir les Tournois
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-2 text-sm text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pourquoi choisir GOKU E-SHOP ?
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                Tout ce dont vous avez besoin pour dominer dans vos jeux
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="relative group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/20">
              <div className="px-6 py-16 sm:px-16 sm:py-24">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Prêt à devenir un champion ?
                  </h2>
                  <p className="mt-4 text-lg text-neutral-300">
                    Rejoignez la communauté et commencez votre aventure gaming dès maintenant.
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Button size="lg" asChild>
                      <Link href="/register">
                        S'inscrire Gratuitement
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-neutral-400">
                © 2024 Arthur project. Tous droits réservés.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6">
                <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                  Conditions d'utilisation
                </Link>
                <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                  Politique de confidentialité
                </Link>
                <Link href="#" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
