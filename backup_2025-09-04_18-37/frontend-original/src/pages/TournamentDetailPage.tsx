import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Trophy, Users, CreditCard, MapPin, Clock, Eye, EyeOff, Key, MessageCircle, Phone, Copy, Check, Ticket, UserPlus, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Tournament {
  id: string;
  title: string;
  gameMode: string;
  organizer: string;
  organizerContact: string;
  visibility: 'public' | 'private';
  status: 'open' | 'closed' | 'completed';
  isPaid: boolean;
  entryFee: number;
  currency: string;
  datetime: string;
  description: string;
  rewards: string;
  currentParticipants: number;
  maxParticipants: number;
  requiresTicket: boolean;
  ticketCode?: string;
  banner?: string;
}

// Mock tournament data
const mockTournament: Tournament = {
  id: '1',
  title: 'Battle Royale Squad Championship',
  gameMode: 'BR Squad',
  organizer: 'ArenaPro Gaming',
  organizerContact: '+229 97 12 34 56',
  visibility: 'private',
  status: 'open',
  isPaid: true,
  entryFee: 2000,
  currency: 'CFA',
  datetime: '2025-01-15T18:00:00',
  description: `🔥 CHAMPIONSHIP FREE FIRE - BR SQUAD 🔥

📅 Date : Samedi 15 Janvier 2025 à 18h00 GMT
🎮 Mode : Battle Royale Squad (4 joueurs par équipe)
👥 Places : 25 équipes maximum
💰 Frais d'entrée : 2 000 CFA par équipe
🏆 Récompenses totales : 150 000 CFA

📋 RÈGLEMENT :
• Check-in obligatoire 30 minutes avant le début
• Salles personnalisées Free Fire (ID/MDP envoyés avant match)
• Preuves de victoire obligatoires (captures d'écran + vidéo)
• Aucun émulateur ou logiciel externe autorisé
• Système de points FFWS : 12pts Booyah, +1pt par kill

🚫 INTERDICTIONS :
• Pas d'émulateurs (BlueStacks, LDPlayer, etc.)
• Pas de hacks, cheats ou mods
• Respect des autres participants obligatoire

📞 Contact organisateur : WhatsApp uniquement
💳 Paiement sécurisé par Mobile Money ou carte bancaire

Bonne chance à tous les participants ! 🎯`,
  rewards: '1ère place : 80 000 CFA\n2ème place : 40 000 CFA\n3ème place : 20 000 CFA\n4ème place : 10 000 CFA',
  currentParticipants: 18,
  maxParticipants: 25,
  requiresTicket: true,
  banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
};

export default function TournamentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [ticketInput, setTicketInput] = useState('');
  const [ticketValidated, setTicketValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock load tournament
  useEffect(() => {
    const loadTournament = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTournament(mockTournament);
      setLoading(false);
    };

    loadTournament();
  }, [id]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowContact(true);
    toast.success('Connecté avec succès');
  };

  const handleTicketValidation = () => {
    if (ticketInput.trim().toUpperCase() === 'FF1234-ABCD') {
      setTicketValidated(true);
      toast.success('Ticket validé avec succès !');
    } else {
      toast.error('Code de ticket invalide');
    }
  };

  const copyContact = async () => {
    if (tournament?.organizerContact) {
      try {
        await navigator.clipboard.writeText(tournament.organizerContact);
        toast.success('Numéro copié !');
      } catch (e) {
        toast.error('Erreur lors de la copie');
      }
    }
  };

  const handleRegistration = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour vous inscrire');
      return;
    }
    
    if (tournament?.requiresTicket && !ticketValidated) {
      toast.error('Ticket d\'accès requis pour ce tournoi privé');
      return;
    }

    // Navigate to registration/payment
    navigate(`/tournaments/${id}/register`);
  };

  const progressPercentage = tournament ? (tournament.currentParticipants / tournament.maxParticipants) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 antialiased font-[Inter] selection:bg-neutral-800 selection:text-neutral-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-neutral-400">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 antialiased font-[Inter]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Tournoi non trouvé</h1>
            <button onClick={() => navigate('/tournaments')} className="mt-4 px-4 py-2 bg-indigo-600 rounded-md">
              Retour aux tournois
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 antialiased font-[Inter] selection:bg-neutral-800 selection:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tournaments')}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-800/80 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 hover:border-neutral-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <div className="h-6 w-px bg-neutral-800"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/20 text-indigo-300 tracking-tight text-[13px] leading-none">
                FF
              </div>
              <span className="text-sm text-neutral-400">FreeFire Tournaments</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-800/80 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 hover:border-neutral-700 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-400">✓ Connecté</span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl tracking-tight font-semibold text-neutral-50">{tournament.title}</h1>
              <p className="text-sm text-neutral-400 mt-1">
                Organisé par <span className="text-neutral-200">{tournament.organizer}</span>
              </p>
            </div>
            
            {/* Status Badges */}
            <div className="hidden md:flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${
                tournament.status === 'open' 
                  ? 'border-emerald-700/40 bg-emerald-900/30 text-emerald-300'
                  : 'border-amber-700/40 bg-amber-900/30 text-amber-300'
              }`}>
                <Check className="w-3.5 h-3.5" /> 
                {tournament.status === 'open' ? 'Ouvert' : 'Fermé'}
              </span>
              
              <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${
                tournament.visibility === 'public'
                  ? 'border-blue-700/40 bg-blue-900/30 text-blue-300'
                  : 'border-amber-700/40 bg-amber-900/30 text-amber-300'
              }`}>
                {tournament.visibility === 'public' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {tournament.visibility === 'public' ? 'Public' : 'Privé'}
              </span>
              
              {tournament.isPaid && (
                <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-700/40 bg-fuchsia-900/30 px-2.5 py-1 text-xs text-fuchsia-300">
                  <CreditCard className="w-3.5 h-3.5" /> Payant
                </span>
              )}
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-neutral-900 bg-neutral-950/60 p-4">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Calendar className="w-4 h-4" />
                Date & heure
              </div>
              <div className="mt-2 text-sm text-neutral-200">
                {new Date(tournament.datetime).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                à {new Date(tournament.datetime).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div className="rounded-lg border border-neutral-900 bg-neutral-950/60 p-4">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Trophy className="w-4 h-4" />
                Récompenses
              </div>
              <div className="mt-2 text-sm text-neutral-200">
                {tournament.rewards.split('\n')[0]}
              </div>
            </div>
            
            <div className="rounded-lg border border-neutral-900 bg-neutral-950/60 p-4">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Users className="w-4 h-4" />
                Participants
              </div>
              <div className="mt-2 text-sm text-neutral-200">
                <span className="font-medium">{tournament.currentParticipants}</span> / {tournament.maxParticipants} inscrits
              </div>
            </div>
            
            <div className="rounded-lg border border-neutral-900 bg-neutral-950/60 p-4">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <CreditCard className="w-4 h-4" />
                Frais d'entrée
              </div>
              <div className="mt-2 text-sm text-neutral-200">
                {tournament.isPaid ? `${tournament.entryFee.toLocaleString()} ${tournament.currency}` : 'Gratuit'}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <section className="lg:col-span-2 space-y-6">
            {/* Banner */}
            {tournament.banner && (
              <div className="rounded-xl overflow-hidden border border-neutral-900">
                <img
                  src={tournament.banner}
                  alt="Tournament banner"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg tracking-tight font-semibold text-neutral-100">Description & Règles</h2>
                <span className="text-xs text-neutral-500">{tournament.gameMode}</span>
              </div>
              <div className="mt-3 text-sm leading-6 text-neutral-300 whitespace-pre-wrap">
                {tournament.description}
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <MapPin className="w-4 h-4 text-neutral-400" /> En ligne
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <Clock className="w-4 h-4 text-neutral-400" /> Durée: 2-4h
                </div>
              </div>
            </div>

            {/* Ticket Required (Private Tournament) */}
            {tournament.requiresTicket && tournament.visibility === 'private' && (
              <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg tracking-tight font-semibold text-neutral-100 flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-300" />
                    Code d'accès requis
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-700/40 bg-amber-900/30 px-2.5 py-1 text-xs text-amber-300">
                    <EyeOff className="w-3.5 h-3.5" /> Privé
                  </span>
                </div>
                
                <p className="mt-2 text-sm text-neutral-400">
                  Ce tournoi est privé. Entrez le code d'accès fourni par l'organisateur pour pouvoir vous inscrire.
                </p>
                
                {!ticketValidated ? (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Ticket className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={ticketInput}
                        onChange={(e) => setTicketInput(e.target.value)}
                        placeholder="Ex: FF1234-ABCD"
                        className="w-full rounded-md bg-neutral-900/70 border border-neutral-800 pl-9 pr-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition"
                      />
                    </div>
                    <button
                      onClick={handleTicketValidation}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 text-neutral-50 px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      <Check className="w-4 h-4" />
                      Valider le code
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 p-3 rounded-md border border-emerald-800/40 bg-emerald-900/20">
                    <Check className="w-5 h-5 text-emerald-300" />
                    <span className="text-sm text-emerald-200">Code validé ! Vous pouvez maintenant vous inscrire.</span>
                  </div>
                )}
                
                {!ticketValidated && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Le code d'accès est requis pour participer à ce tournoi.
                  </p>
                )}
              </div>
            )}

            {/* Organizer Contact */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg tracking-tight font-semibold text-neutral-100 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-300" />
                  Contact organisateur
                </h2>
                <span className="text-xs text-neutral-500">
                  {isAuthenticated ? 'Connecté' : 'Non connecté'}
                </span>
              </div>

              {!showContact ? (
                <div className="mt-3 flex items-center justify-between rounded-md border border-neutral-900 bg-neutral-950 px-4 py-3">
                  <p className="text-sm text-neutral-400">
                    Connectez-vous pour voir le contact WhatsApp de l'organisateur.
                  </p>
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 hover:bg-neutral-900 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Afficher
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-emerald-800/40 bg-emerald-900/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=180&auto=format&fit=crop"
                      alt="Organisateur"
                      className="h-9 w-9 rounded-md object-cover ring-1 ring-inset ring-emerald-800/50"
                    />
                    <div>
                      <div className="text-sm text-neutral-100">{tournament.organizer}</div>
                      <div className="text-xs text-neutral-300 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-300" />
                        <a
                          href={`https://wa.me/${tournament.organizerContact.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-emerald-300"
                        >
                          WhatsApp: {tournament.organizerContact}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${tournament.organizerContact.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-neutral-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Envoyer un message
                    </a>
                    <button
                      onClick={copyContact}
                      className="inline-flex items-center gap-2 rounded-md border border-emerald-700/50 bg-emerald-900/20 text-emerald-200 px-3 py-2 text-sm hover:bg-emerald-900/30 transition"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Column - Registration & Info */}
          <aside className="space-y-6">
            {/* Registration Card */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg tracking-tight font-semibold text-neutral-100">Inscription</h3>
                {tournament.isPaid && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-700/40 bg-fuchsia-900/30 px-2.5 py-1 text-xs text-fuchsia-300">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payant
                  </span>
                )}
              </div>
              
              {tournament.isPaid && (
                <div className="mt-3 text-sm text-neutral-300">
                  Frais d'entrée: <span className="text-neutral-100 font-medium">
                    {tournament.entryFee.toLocaleString()} {tournament.currency}
                  </span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2">
                <button
                  onClick={handleRegistration}
                  disabled={tournament.status !== 'open' || (tournament.requiresTicket && !ticketValidated)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed text-white px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {tournament.isPaid ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Payer et s'inscrire
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      S'inscrire gratuitement
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                {tournament.isPaid 
                  ? "Le paiement sécurise votre place dans le tournoi"
                  : "L'inscription est gratuite et immédiate"
                }
              </p>
            </div>

            {/* Participants */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg tracking-tight font-semibold text-neutral-100 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants
                </h3>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-neutral-300">
                  Inscrits: <span className="text-neutral-100 font-medium">{tournament.currentParticipants}</span> / {tournament.maxParticipants}
                </div>
                <div className="text-xs text-neutral-400">
                  {Math.round((tournament.maxParticipants - tournament.currentParticipants) / tournament.maxParticipants * 100)}% de places restantes
                </div>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-neutral-900 overflow-hidden border border-neutral-900">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Sample participant avatars */}
              <div className="mt-4 grid grid-cols-6 gap-2">
                {[...Array(Math.min(6, tournament.currentParticipants))].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-md bg-neutral-800 ring-1 ring-inset ring-neutral-700 flex items-center justify-center text-xs text-neutral-400"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {tournament.currentParticipants > 6 && (
                  <div className="h-10 w-10 rounded-md ring-1 ring-inset ring-neutral-800 bg-neutral-900 flex items-center justify-center text-xs text-neutral-300">
                    +{tournament.currentParticipants - 6}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5">
              <h3 className="text-lg tracking-tight font-semibold text-neutral-100 mb-3">Informations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Mode de jeu</span>
                  <span className="text-neutral-200">{tournament.gameMode}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Visibilité</span>
                  <span className="text-neutral-200">{tournament.visibility === 'public' ? 'Public' : 'Privé'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">État</span>
                  <span className={`${tournament.status === 'open' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {tournament.status === 'open' ? 'Ouvert aux inscriptions' : 'Fermé'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-neutral-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">© 2025 FreeFire Tournaments — Plateforme de tournois</p>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <button className="hover:text-neutral-200">Conditions</button>
            <button className="hover:text-neutral-200">Règlement</button>
            <button className="hover:text-neutral-200">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
