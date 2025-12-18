'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Trophy, Users, Calendar, Clock, MapPin, Target, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useTournaments, useProfile } from '@/lib/hooks/api-hooks';

// Game modes configuration
const gameModesConfig: Record<string, { name: string; icon: any; color: string }> = {
  BR_SOLO: { name: 'BR Solo', icon: Target, color: 'text-green-400' },
  BR_DUO: { name: 'BR Duo', icon: Users, color: 'text-blue-400' },
  BR_SQUAD: { name: 'BR Squad', icon: Users, color: 'text-purple-400' },
  CLASH_SQUAD: { name: 'Clash Squad', icon: Trophy, color: 'text-orange-400' },
  LONE_WOLF: { name: 'Lone Wolf', icon: Target, color: 'text-red-400' },
  ROOM_HS: { name: 'Room HS', icon: Target, color: 'text-pink-400' },
};

interface Tournament {
  id: string;
  title: string;
  mode: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  status: string;
  is_private: boolean;
  description: string;
}

const entryFeeRanges = [
  { label: 'Gratuit', value: 'free', min: 0, max: 0 },
  { label: '0 - 500 XOF', value: '0-500', min: 0, max: 500 },
  { label: '500 - 1500 XOF', value: '500-1500', min: 500, max: 1500 },
  { label: '1500 - 5000 XOF', value: '1500-5000', min: 1500, max: 5000 },
  { label: '5000+ XOF', value: '5000+', min: 5000, max: Infinity },
];

export default function TournamentsPage() {
  const { data: tournamentsData, isLoading, error } = useTournaments();
  const { data: userData } = useProfile();
  
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedFeeRange, setSelectedFeeRange] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  // Transform API data
  const tournaments: Tournament[] = tournamentsData?.map((t: any) => ({
    id: t.id?.toString() || t.tournament_id?.toString(),
    title: t.title || t.name,
    mode: t.mode || t.game_mode || 'BR_SQUAD',
    max_participants: t.max_participants || t.max_teams || 100,
    current_participants: t.current_participants || t.registered_count || 0,
    entry_fee: t.entry_fee || t.entry_fee_amount || 0,
    prize_pool: t.prize_pool || t.total_prize || 0,
    start_date: t.start_date || t.scheduled_at,
    status: t.status || 'open',
    is_private: t.is_private || t.visibility === 'private',
    description: t.description || '',
  })) || [];

  // Filter tournaments based on search and filters
  useEffect(() => {
    if (!tournaments.length) return;
    
    let filtered = [...tournaments];

    // Search by title
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by game mode
    if (selectedMode) {
      filtered = filtered.filter(tournament => tournament.mode === selectedMode);
    }

    // Filter by entry fee range
    if (selectedFeeRange) {
      const range = entryFeeRanges.find(r => r.value === selectedFeeRange);
      if (range) {
        filtered = filtered.filter(tournament =>
          tournament.entry_fee >= range.min && tournament.entry_fee <= range.max
        );
      }
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }

    setFilteredTournaments(filtered);
  }, [tournaments, searchTerm, selectedMode, selectedFeeRange, statusFilter]);

  const user = userData || null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatXOF = (amount: number) => {
    return amount === 0 ? 'Gratuit' : `${amount.toLocaleString()} XOF`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-400 bg-green-400/10';
      case 'full':
        return 'text-orange-400 bg-orange-400/10';
      case 'closed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'full':
        return 'Complet';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Chargement des tournois...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
            <p className="text-neutral-400 mb-4">Impossible de charger les tournois.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Tournois FreeFire
                </h1>
                <p className="mt-2 text-neutral-400">
                  Rejoignez les tournois et montrez vos compétences
                </p>
              </div>
              
              <Button asChild>
                <Link href="/tournaments/create">
                  <Trophy className="w-4 h-4 mr-2" />
                  Créer un Tournoi
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Rechercher un tournoi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Game Mode Filter */}
              <div className="lg:w-48">
                <Select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                >
                  <option value="">Tous les modes</option>
                  {Object.entries(gameModesConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Entry Fee Filter */}
              <div className="lg:w-48">
                <Select
                  value={selectedFeeRange}
                  onChange={(e) => setSelectedFeeRange(e.target.value)}
                >
                  <option value="">Tous les prix</option>
                  {entryFeeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Status Filter */}
              <div className="lg:w-32">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="open">Ouvert</option>
                  <option value="full">Complet</option>
                  <option value="closed">Fermé</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-neutral-400">
              {filteredTournaments.length} tournoi{filteredTournaments.length > 1 ? 's' : ''} trouvé{filteredTournaments.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Tournaments Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament) => {
              const modeConfig = gameModesConfig[tournament.mode as keyof typeof gameModesConfig];
              const ModeIcon = modeConfig.icon;
              const participationRate = (tournament.current_participants / tournament.max_participants) * 100;

              return (
                <div
                  key={tournament.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10 hover:border-primary/20"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </span>
                  </div>

                  {/* Tournament Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ModeIcon className={`w-5 h-5 ${modeConfig.color}`} />
                      <span className={`text-sm font-medium ${modeConfig.color}`}>
                        {modeConfig.name}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {tournament.title}
                    </h3>
                    
                    <p className="text-sm text-neutral-400 line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>

                  {/* Tournament Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Frais d'inscription</span>
                      <span className="text-primary font-medium">
                        {formatXOF(tournament.entry_fee)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Prix total</span>
                      <span className="text-yellow-400 font-medium">
                        {formatXOF(tournament.prize_pool)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Users className="w-4 h-4" />
                        Participants
                      </span>
                      <span className="text-white">
                        {tournament.current_participants}/{tournament.max_participants}
                      </span>
                    </div>

                    {/* Participation Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Inscriptions</span>
                        <span>{Math.round(participationRate)}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${participationRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(tournament.start_date)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button asChild className="w-full">
                    <Link href={`/tournaments/${tournament.id}`}>
                      Voir les détails
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTournaments.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Aucun tournoi trouvé
              </h3>
              <p className="text-neutral-400 mb-6">
                Aucun tournoi ne correspond à vos critères de recherche.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMode('');
                  setSelectedFeeRange('');
                  setStatusFilter('open');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
