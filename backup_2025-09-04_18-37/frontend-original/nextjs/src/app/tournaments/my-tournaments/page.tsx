'use client';

import React, { useState } from 'react';
import { Plus, Bell, Users, SquarePen, Trophy, Calendar, MapPin, Shield, Eye, Share2, CreditCard, Settings2, Share, Edit2, Trash2, Rocket, History, FileText, Ticket, Link, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

interface TournamentCard {
  id: string;
  title: string;
  date: string;
  location: string;
  visibility: 'public' | 'private';
  status: 'pending' | 'confirmed' | 'completed' | 'draft' | 'published';
  gameMode?: string;
  participants?: { current: number; max: number };
  registrationId?: string;
  teamName?: string;
  organizerCode?: string;
  winner?: string;
}

// Mock data
const myRegistrations: TournamentCard[] = [
  {
    id: '1',
    title: 'BR Squad Championship',
    date: '12 fév. 2025',
    location: 'En ligne',
    visibility: 'private',
    status: 'pending',
    registrationId: '#A4F29',
    teamName: 'Night Owls'
  },
  {
    id: '2',
    title: 'Clash Squad Tournament',
    date: '21 mars 2025',
    location: 'En ligne',
    visibility: 'public',
    status: 'confirmed',
    registrationId: '#C7421',
    teamName: 'Phoenix Squad'
  }
];

const myCreatedTournaments: TournamentCard[] = [
  {
    id: '3',
    title: 'League Night — Printemps',
    date: '03 avr. 2025',
    location: 'En ligne',
    visibility: 'public',
    status: 'published',
    gameMode: 'BR Squad',
    participants: { current: 18, max: 32 },
    organizerCode: 'ORG-77X'
  },
  {
    id: '4',
    title: 'Cup Été — Duo',
    date: '16 juil. 2025',
    location: 'En ligne',
    visibility: 'public',
    status: 'draft',
    gameMode: 'BR Duo',
    participants: { current: 0, max: 64 }
  }
];

const myResults: TournamentCard[] = [
  {
    id: '5',
    title: 'Masters — Automne',
    date: 'Terminé le 02 nov. 2024',
    location: 'En ligne',
    visibility: 'public',
    status: 'completed',
    gameMode: 'BR Squad',
    participants: { current: 64, max: 64 },
    winner: 'Team Phoenix'
  }
];

type TabType = 'registered' | 'created' | 'results';

export default function MyTournamentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('registered');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<TournamentCard | null>(null);

  const handlePayment = (tournament: TournamentCard) => {
    setSelectedTournament(tournament);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    setShowPaymentModal(false);
    toast({
      title: 'Paiement confirmé !',
      variant: 'success'
    });
    
    // Update tournament status to confirmed (in real app, this would be handled by state management)
    if (selectedTournament) {
      const tournament = myRegistrations.find(t => t.id === selectedTournament.id);
      if (tournament) {
        tournament.status = 'confirmed';
      }
    }
  };

  const handleShare = async (tournament: TournamentCard, type: 'ticket' | 'tournament') => {
    const url = type === 'ticket' 
      ? `https://freefire-tournaments.app/ticket/${tournament.registrationId?.replace('#', '')}`
      : `https://freefire-tournaments.app/tournament/${tournament.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `FreeFire Tournaments - ${tournament.title}`,
          url
        });
        toast({
          title: 'Lien partagé !',
          variant: 'success'
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Lien copié dans le presse-papiers',
          variant: 'success'
        });
      }
    } catch (e) {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Lien copié dans le presse-papiers',
        variant: 'success'
      });
    }
  };

  const handleAction = (action: string, tournament: TournamentCard) => {
    switch (action) {
      case 'view':
        router.push(`/tournaments/${tournament.id}`);
        break;
      case 'manage':
        router.push(`/tournaments/${tournament.id}/manage`);
        break;
      case 'edit':
        router.push(`/tournaments/${tournament.id}/edit`);
        break;
      case 'delete':
        if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) {
          toast({
            title: 'Tournoi supprimé',
            variant: 'success'
          });
        }
        break;
      case 'publish':
        toast({
          title: 'Tournoi publié !',
          variant: 'success'
        });
        break;
      case 'results':
        router.push(`/tournaments/${tournament.id}/results`);
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30 px-2 py-0.5 text-[11px] font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
            </span>
            En attente de paiement
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30 px-2 py-0.5 text-[11px] font-medium">
            <Check className="h-3.5 w-3.5" />
            Confirmé
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/30 px-2 py-0.5 text-[11px] font-medium">
            <Bell className="h-3.5 w-3.5" />
            Inscriptions ouvertes
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/10 text-neutral-300 ring-1 ring-inset ring-neutral-600/40 px-2 py-0.5 text-[11px] font-medium">
            <Edit2 className="h-3.5 w-3.5" />
            Brouillon
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/10 text-neutral-300 ring-1 ring-inset ring-neutral-600/40 px-2 py-0.5 text-[11px] font-medium">
            <History className="h-3.5 w-3.5" />
            Terminé
          </span>
        );
      default:
        return null;
    }
  };

  const renderTournamentCard = (tournament: TournamentCard, type: TabType) => (
    <article key={tournament.id} className="group rounded-lg bg-neutral-900/60 ring-1 ring-inset ring-neutral-800 hover:ring-neutral-700 transition-all">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md bg-neutral-800 ring-1 ring-inset ring-neutral-700">
              {type === 'registered' && <Calendar className="h-5 w-5 text-neutral-300" />}
              {type === 'created' && <SquarePen className="h-5 w-5 text-neutral-300" />}
              {type === 'results' && <Trophy className="h-5 w-5 text-yellow-300" />}
            </div>
            <div>
              <h3 className="text-[17px] font-medium tracking-tight text-white">{tournament.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {tournament.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tournament.location}
                </span>
                {tournament.visibility && (
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    {tournament.visibility === 'public' ? 'Public' : 'Privé'}
                  </span>
                )}
                {tournament.participants && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {tournament.participants.current}/{tournament.participants.max} équipes
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(tournament.status)}
            <div className="hidden sm:block h-6 w-px bg-neutral-800"></div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAction('view', tournament)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-700/70 ring-1 ring-inset ring-neutral-700/80 transition-colors"
                title="Voir les détails"
              >
                <Eye className="h-4 w-4" />
                Détails
              </button>
              
              {type === 'registered' && (
                <>
                  {tournament.visibility === 'private' && (
                    <button
                      onClick={() => handleShare(tournament, 'ticket')}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-200 bg-emerald-700/20 hover:bg-emerald-700/30 ring-1 ring-inset ring-emerald-700/50 transition-colors"
                      title="Partager votre ticket"
                    >
                      <Share2 className="h-4 w-4" />
                      Partager
                    </button>
                  )}
                  {tournament.status === 'pending' && (
                    <button
                      onClick={() => handlePayment(tournament)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-200 bg-amber-700/20 hover:bg-amber-700/30 ring-1 ring-inset ring-amber-700/50 transition-colors"
                      title="Payer les frais d'inscription"
                    >
                      <CreditCard className="h-4 w-4" />
                      Payer
                    </button>
                  )}
                </>
              )}
              
              {type === 'created' && (
                <>
                  {tournament.status === 'published' && (
                    <>
                      <button
                        onClick={() => handleAction('manage', tournament)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-700/70 ring-1 ring-inset ring-neutral-700/80 transition-colors"
                        title="Gérer le tournoi"
                      >
                        <Settings2 className="h-4 w-4" />
                        Gérer
                      </button>
                      <button
                        onClick={() => handleShare(tournament, 'tournament')}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-sky-200 bg-sky-700/20 hover:bg-sky-700/30 ring-1 ring-inset ring-sky-700/50 transition-colors"
                        title="Partager l'événement"
                      >
                        <Share className="h-4 w-4" />
                        Partager
                      </button>
                    </>
                  )}
                  {tournament.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleAction('edit', tournament)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-700/70 ring-1 ring-inset ring-neutral-700/80 transition-colors"
                        title="Éditer"
                      >
                        <Edit2 className="h-4 w-4" />
                        Éditer
                      </button>
                      <button
                        onClick={() => handleAction('delete', tournament)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-200 bg-red-700/20 hover:bg-red-700/30 ring-1 ring-inset ring-red-700/50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </button>
                      <button
                        onClick={() => handleAction('publish', tournament)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-200 bg-emerald-700/20 hover:bg-emerald-700/30 ring-1 ring-inset ring-emerald-700/50 transition-colors"
                        title="Publier"
                      >
                        <Rocket className="h-4 w-4" />
                        Publier
                      </button>
                    </>
                  )}
                </>
              )}
              
              {type === 'results' && (
                <button
                  onClick={() => handleAction('results', tournament)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-200 bg-amber-700/20 hover:bg-amber-700/30 ring-1 ring-inset ring-amber-700/50 transition-colors"
                  title="Consulter les résultats"
                >
                  <Trophy className="h-4 w-4" />
                  Résultats
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-neutral-800/80 px-4 py-2">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>
            {type === 'registered' && `ID inscription: ${tournament.registrationId} · Équipe: ${tournament.teamName}`}
            {type === 'created' && tournament.organizerCode && `Code organisateur: ${tournament.organizerCode}`}
            {type === 'results' && `Vainqueur: ${tournament.winner}`}
          </span>
          <button
            onClick={() => {
              if (type === 'registered') handleShare(tournament, 'ticket');
              else if (type === 'created') handleShare(tournament, 'tournament');
              else handleAction('results', tournament);
            }}
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {type === 'registered' && <><Ticket className="h-3.5 w-3.5" /> Voir billet</>}
            {type === 'created' && <><Link className="h-3.5 w-3.5" /> Copier le lien</>}
            {type === 'results' && <><FileText className="h-3.5 w-3.5" /> Bracket</>}
          </button>
        </div>
      </div>
    </article>
  );

  const renderEmptyState = (type: TabType) => {
    const emptyStates = {
      registered: {
        icon: <Users className="h-5 w-5 text-neutral-400" />,
        title: "Aucune inscription pour le moment",
        description: "Inscrivez-vous à un tournoi FreeFire ou explorez les événements à venir.",
        actionText: "Explorer les tournois",
        action: () => router.push('/tournaments')
      },
      created: {
        icon: <SquarePen className="h-5 w-5 text-neutral-400" />,
        title: "Vous n'avez pas encore créé de tournoi",
        description: "Lancez votre premier tournoi FreeFire en quelques minutes.",
        actionText: "Créer un tournoi",
        action: () => router.push('/tournaments/create')
      },
      results: {
        icon: <Trophy className="h-5 w-5 text-neutral-400" />,
        title: "Aucun résultat à afficher",
        description: "Les résultats de vos tournois FreeFire terminés apparaîtront ici.",
        actionText: null,
        action: null
      }
    };

    const state = emptyStates[type];

    return (
      <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900/40 p-10 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 ring-1 ring-inset ring-neutral-700">
          {state.icon}
        </div>
        <h4 className="text-lg font-medium tracking-tight text-white">{state.title}</h4>
        <p className="mt-1 text-sm text-neutral-400">{state.description}</p>
        {state.actionText && (
          <div className="mt-4">
            <button
              onClick={state.action || undefined}
              className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-700/70 ring-1 ring-inset ring-neutral-700/80 transition-colors"
            >
              {type === 'registered' ? <Eye className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {state.actionText}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-[Inter] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 bg-neutral-950/80 border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-md bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/20 flex items-center justify-center text-sm font-semibold tracking-tight text-indigo-300 select-none">
                FF
              </div>
              <div className="text-sm text-neutral-400">Mes Tournois FreeFire</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/tournaments/create')}
                className="hidden md:inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium text-neutral-200 bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Créer un tournoi
              </button>
              <button className="inline-flex items-center justify-center rounded-md p-2 text-neutral-300 hover:text-white hover:bg-neutral-800/70 ring-1 ring-inset ring-neutral-700/80 transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center justify-center rounded-full h-8 w-8 overflow-hidden ring-1 ring-inset ring-neutral-700/80">
                <img
                  alt="Avatar"
                  src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=164&h=164&fit=crop&auto=format&dpr=2"
                  className="h-full w-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4">
        {/* Title Section */}
        <section className="pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Mes tournois FreeFire</h1>
              <p className="mt-1 text-sm text-neutral-400">Gérez vos inscriptions, créations et consultez les résultats.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-md ring-1 ring-inset ring-neutral-800 p-1 bg-neutral-900/60">
                <button
                  onClick={() => setActiveTab('registered')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'registered'
                      ? 'bg-neutral-800/80 text-white ring-1 ring-inset ring-neutral-700/80'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Inscrits
                </button>
                <button
                  onClick={() => setActiveTab('created')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'created'
                      ? 'bg-neutral-800/80 text-white ring-1 ring-inset ring-neutral-700/80'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                  }`}
                >
                  <SquarePen className="h-4 w-4" />
                  Créés
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'results'
                      ? 'bg-neutral-800/80 text-white ring-1 ring-inset ring-neutral-700/80'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Résultats
                </button>
              </div>
              
              {/* Mobile Dropdown */}
              <div className="sm:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabType)}
                  className="w-44 appearance-none rounded-md bg-neutral-900/60 ring-1 ring-inset ring-neutral-800/80 text-sm text-neutral-200 px-3 py-2 pr-8 focus:outline-none focus:ring-neutral-600"
                >
                  <option value="registered">Inscrits</option>
                  <option value="created">Créés</option>
                  <option value="results">Résultats</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="pb-20">
          <div className="space-y-3">
            {activeTab === 'registered' && (
              <>
                {myRegistrations.length > 0
                  ? myRegistrations.map(tournament => renderTournamentCard(tournament, 'registered'))
                  : renderEmptyState('registered')
                }
              </>
            )}
            
            {activeTab === 'created' && (
              <>
                {myCreatedTournaments.length > 0
                  ? myCreatedTournaments.map(tournament => renderTournamentCard(tournament, 'created'))
                  : renderEmptyState('created')
                }
              </>
            )}
            
            {activeTab === 'results' && (
              <>
                {myResults.length > 0
                  ? myResults.map(tournament => renderTournamentCard(tournament, 'results'))
                  : renderEmptyState('results')
                }
              </>
            )}
          </div>
        </section>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPaymentModal(false)}></div>
          <div className="relative w-full sm:max-w-md sm:rounded-lg bg-neutral-950 ring-1 ring-inset ring-neutral-800 shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-medium tracking-tight text-white">Payer les frais</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 ring-1 ring-inset ring-neutral-800/80 transition"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Tournoi</span>
                <span className="text-neutral-200">{selectedTournament.title}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Frais d'inscription</span>
                <span className="text-neutral-200">2 000 CFA</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Frais de service</span>
                <span className="text-neutral-200">100 CFA</span>
              </div>
              <div className="h-px bg-neutral-800 my-1"></div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-neutral-300">Total</span>
                <span className="text-white">2 100 CFA</span>
              </div>
              <div className="rounded-md bg-neutral-900/60 ring-1 ring-inset ring-neutral-800 p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs text-neutral-400">Paiement sécurisé. Vos informations sont chiffrées.</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-700/70 ring-1 ring-inset ring-neutral-700/80 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmPayment}
                className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium text-emerald-100 bg-emerald-700/30 hover:bg-emerald-700/40 ring-1 ring-inset ring-emerald-700/60 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Payer 2 100 CFA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-900/80">
        <div className="mx-auto max-w-6xl px-4">
          <div className="py-6 text-xs text-neutral-500 flex items-center justify-between">
            <span>© 2024 Arthur project</span>
            <div className="flex items-center gap-4">
              <button className="hover:text-neutral-300 transition-colors">Conditions</button>
              <button className="hover:text-neutral-300 transition-colors">Confidentialité</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
