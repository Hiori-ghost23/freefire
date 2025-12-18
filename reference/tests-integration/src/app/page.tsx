'use client';

import React from 'react';
import { Trophy, Users, GamepadIcon, ShoppingBag, ArrowRight, Calendar, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-neutral-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/20 flex items-center justify-center text-sm font-semibold tracking-tight text-indigo-300 select-none">
                  FF
                </div>
                <div className="text-lg font-semibold">FreeFire MVP</div>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => router.push('/tournaments')}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Tournois
                </button>
                <button
                  onClick={() => router.push('/catalog')}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Catalogue
                </button>
                <button
                  onClick={() => router.push('/cart')}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Panier
                </button>
                <Button onClick={() => router.push('/login')} variant="outline" size="sm">
                  Connexion
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                L'univers FreeFire
                <span className="block text-indigo-400">à portée de main</span>
              </h1>
              <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
                Participez aux meilleurs tournois, achetez vos produits FreeFire favoris et rejoignez la communauté gaming la plus dynamique d'Afrique.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/tournaments')}
                  className="group"
                >
                  <Trophy size={20} className="mr-2" />
                  Explorer les tournois
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => router.push('/catalog')}
                >
                  <ShoppingBag size={20} className="mr-2" />
                  Découvrir le catalogue
                </Button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Pourquoi choisir FreeFire MVP ?</h2>
                <p className="text-neutral-400 text-lg">Une plateforme complète pour les joueurs FreeFire passionnés</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Tournaments */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                    <Trophy className="text-indigo-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">Tournois Organisés</h3>
                  <p className="text-neutral-400 mb-4">
                    Créez et participez à des tournois FreeFire avec des prix attractifs. Système de matchmaking équitable et transparent.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/tournaments')}
                    className="group-hover:text-indigo-300"
                  >
                    Voir les tournois
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>

                {/* E-commerce */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <ShoppingBag className="text-emerald-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">Boutique FreeFire</h3>
                  <p className="text-neutral-400 mb-4">
                    Achetez diamants, pass elite, skins et accessoires. Recharge instantanée et paiements sécurisés.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/catalog')}
                    className="group-hover:text-emerald-300"
                  >
                    Explorer le catalogue
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>

                {/* Community */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Users className="text-amber-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">Communauté Active</h3>
                  <p className="text-neutral-400 mb-4">
                    Rejoignez des milliers de joueurs FreeFire. Échangez, apprenez et progressez ensemble.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group-hover:text-amber-300"
                  >
                    Rejoindre la communauté
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Une plateforme qui grandit</h2>
                <p className="text-neutral-400 text-lg">Des chiffres qui témoignent de notre succès</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-400 mb-2">1,200+</div>
                  <div className="text-neutral-400">Joueurs actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">150+</div>
                  <div className="text-neutral-400">Tournois organisés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400 mb-2">50M+</div>
                  <div className="text-neutral-400">CFA distribués</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">5K+</div>
                  <div className="text-neutral-400">Produits vendus</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Prêt à commencer l'aventure ?</h2>
              <p className="text-neutral-400 text-lg mb-8">
                Créez votre compte et accédez à tous nos services FreeFire en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push('/register')}>
                  Créer un compte
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/login')}>
                  Se connecter
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-md bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/20 flex items-center justify-center text-sm font-semibold tracking-tight text-indigo-300 select-none">
                    FF
                  </div>
                  <div className="text-lg font-semibold">FreeFire MVP</div>
                </div>
                <p className="text-neutral-400 mb-4">
                  La plateforme de référence pour les tournois et achats FreeFire en Afrique de l'Ouest.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Services</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/tournaments')}
                    className="block text-neutral-400 hover:text-white transition-colors"
                  >
                    Tournois
                  </button>
                  <button 
                    onClick={() => router.push('/catalog')}
                    className="block text-neutral-400 hover:text-white transition-colors"
                  >
                    Catalogue
                  </button>
                  <button className="block text-neutral-400 hover:text-white transition-colors">
                    Support
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Légal</h3>
                <div className="space-y-2">
                  <button className="block text-neutral-400 hover:text-white transition-colors">
                    Conditions d'utilisation
                  </button>
                  <button className="block text-neutral-400 hover:text-white transition-colors">
                    Politique de confidentialité
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-8 pt-8 text-center text-neutral-400">
              <p>© 2024 Arthur project. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
