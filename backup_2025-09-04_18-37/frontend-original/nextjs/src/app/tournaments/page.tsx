'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, Users, Trophy, CreditCard, Eye, EyeOff, ArrowRight, Plus, GamepadIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Tournament {
  id: string;
  title: string;
  organizer: string;
  gameMode: string;
  visibility: 'public' | 'private';
  status: 'open' | 'closed' | 'full';
  isPaid: boolean;
  entryFee?: number;
  currency?: string;
  datetime: string;
  currentParticipants: number;
  maxParticipants: number;
  rewards: string;
  banner?: string;
}

// Mock tournaments data
const mockTournaments: Tournament[] = [
  {
    id: '1',
    title: 'Battle Royale Squad Championship',
    organizer: 'ArenaPro Gaming',
    gameMode: 'BR Squad',
    visibility: 'public',
    status: 'open',
    isPaid: true,
    entryFee: 2000,
    currency: 'CFA',
    datetime: '2025-01-15T18:00:00',
    currentParticipants: 18,
    maxParticipants: 25,
    rewards: '150 000 CFA en prizes',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Clash Squad Weekly',
    organizer: 'FreeFire Pro League',
    gameMode: 'Clash Squad',
    visibility: 'public',
    status: 'open',
    isPaid: false,
    datetime: '2025-01-20T20:00:00',
    currentParticipants: 12,
    maxParticipants: 16,
    rewards: 'Diamants et skins exclusifs'
  },
  {
    id: '3',
    title: 'Solo Masters Tournament',
    organizer: 'Elite Gaming',
    gameMode: 'BR Solo',
    visibility: 'public',
    status: 'full',
    isPaid: true,
    entryFee: 1500,
    currency: 'CFA',
    datetime: '2025-01-18T16:00:00',
    currentParticipants: 100,
    maxParticipants: 100,
    rewards: '50 000 CFA + Pass Elite'
  },
  {
    id: '4',
    title: 'Private Squad Battle',
    organizer: 'Team Phoenix',
    gameMode: 'BR Squad',
    visibility: 'private',
    status: 'open',
    isPaid: true,
    entryFee: 3000,
    currency: 'CFA',
    datetime: '2025-01-25T19:00:00',
    currentParticipants: 8,
    maxParticipants: 20,
    rewards: '200 000 CFA total'
  }
];

export default function TournamentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTournaments = mockTournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'all' || tournament.gameMode === filterMode;
    const matchesType = filterType === 'all' || 
                       (filterType === 'free' && !tournament.isPaid) ||
                       (filterType === 'paid' && tournament.isPaid) ||
                       (filterType === 'public' && tournament.visibility === 'public') ||
                       (filterType === 'private' && tournament.visibility === 'private');
    
    return matchesSearch && matchesMode && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30 px-2 py-0.5 text-xs font-medium">
            Ouvert
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30 px-2 py-0.5 text-xs font-medium">
            Fermé
          </span>
        );
      case 'full':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30 px-2 py-0.5 text-xs font-medium">
            Complet
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-neutral-950/60 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/20 flex items-center justify-center text-sm font-semibold tracking-tight text-indigo-300 select-none">
                  FF
                </div>
                <div className="text-sm text-neutral-400">FreeFire Tournaments</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push('/tournaments/my-tournaments')}
                  variant="outline"
                  size="sm"
                >
                  Mes tournois
                </Button>
                <Button
                  onClick={() => router.push('/tournaments/create')}
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  <Plus size={16} className="mr-2" />
                  Créer un tournoi
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Tournois FreeFire</h1>
            <p className="mt-2 text-neutral-400">Découvrez et participez aux tournois de la communauté</p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un tournoi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-white placeholder-neutral-400"
              />
            </div>

            {/* Mode Filter */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white"
            >
              <option value="all">Tous les modes</option>
              <option value="BR Solo">BR Solo</option>
              <option value="BR Duo">BR Duo</option>
              <option value="BR Squad">BR Squad</option>
              <option value="Clash Squad">Clash Squad</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white"
            >
              <option value="all">Tous types</option>
              <option value="free">Gratuit</option>
              <option value="paid">Payant</option>
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </div>

          {/* Tournaments Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
              >
                {/* Banner */}
                {tournament.banner ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={tournament.banner}
                      alt={tournament.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <GamepadIcon size={48} className="text-white/50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">
                        {tournament.title}
                      </h3>
                      <p className="text-sm text-neutral-400">par {tournament.organizer}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(tournament.status)}
                      {tournament.visibility === 'private' && (
                        <EyeOff size={16} className="text-amber-300" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <Calendar size={16} className="text-neutral-400" />
                      {formatDate(tournament.datetime)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <GamepadIcon size={16} className="text-neutral-400" />
                      {tournament.gameMode}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <Users size={16} className="text-neutral-400" />
                      {tournament.currentParticipants}/{tournament.maxParticipants} participants
                    </div>

                    {tournament.isPaid && (
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <CreditCard size={16} className="text-neutral-400" />
                        {tournament.entryFee?.toLocaleString()} {tournament.currency}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <Trophy size={16} className="text-amber-400" />
                      {tournament.rewards}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(tournament.currentParticipants / tournament.maxParticipants) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400 mt-1">
                      <span>{tournament.currentParticipants} inscrits</span>
                      <span>{tournament.maxParticipants - tournament.currentParticipants} places restantes</span>
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tournaments/${tournament.id}`);
                    }}
                    className="w-full group-hover:bg-indigo-500 transition-colors"
                    disabled={tournament.status === 'full' || tournament.status === 'closed'}
                  >
                    {tournament.status === 'open' && 'Voir les détails'}
                    {tournament.status === 'full' && 'Complet'}
                    {tournament.status === 'closed' && 'Fermé'}
                    {tournament.status === 'open' && <ArrowRight size={16} className="ml-2" />}
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredTournaments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <GamepadIcon size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun tournoi trouvé</h3>
              <p className="text-neutral-400 mb-6">
                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Modifiez vos filtres pour voir plus de tournois'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterMode('all');
                    setFilterType('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
                <Button onClick={() => router.push('/tournaments/create')}>
                  <Plus size={16} className="mr-2" />
                  Créer un tournoi
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-indigo-400">
                {mockTournaments.filter(t => t.status === 'open').length}
              </div>
              <div className="text-sm text-neutral-400">Tournois ouverts</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {mockTournaments.reduce((sum, t) => sum + t.currentParticipants, 0)}
              </div>
              <div className="text-sm text-neutral-400">Joueurs inscrits</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {mockTournaments.filter(t => t.isPaid).reduce((sum, t) => sum + (t.entryFee || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-neutral-400">CFA en prizes</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
