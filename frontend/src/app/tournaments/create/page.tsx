'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, GamepadIcon, CalendarClock, Trophy, FileText, Phone, Coins, CheckCircle2, Ticket, Copy, Users, Shield, Swords, Target, Crosshair } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';

interface TournamentFormData {
  visibility: 'public' | 'private' | null;
  gameMode: 'BR Solo' | 'BR Duo' | 'BR Squad' | 'Clash Squad' | 'Lone Wolf' | 'Room Headshot' | null;
  datetime: string;
  rewards: string;
  description: string;
  isCreator: boolean;
  whatsapp: string;
  hasFee: boolean;
  feeAmount: string;
  currency: 'XOF' | 'XAF' | 'EUR' | 'USD';
  ticketCode: string;
}

const GAME_MODES = [
  { id: 'BR Solo', label: 'BR Solo', icon: Users, maxPlayers: '100 joueurs' },
  { id: 'BR Duo', label: 'BR Duo', icon: Users, maxPlayers: '50 duos' },
  { id: 'BR Squad', label: 'BR Squad', icon: Users, maxPlayers: '25 équipes' },
  { id: 'Clash Squad', label: 'Clash Squad', icon: Swords, maxPlayers: '16 équipes' },
  { id: 'Lone Wolf', label: 'Lone Wolf', icon: Shield, maxPlayers: '100 joueurs' },
  { id: 'Room Headshot', label: 'Room HS', icon: Crosshair, maxPlayers: '32 joueurs' },
];

const CURRENCIES = [
  { code: 'XOF', label: 'XOF — CFA (Ouest)', symbol: 'CFA' },
  { code: 'XAF', label: 'XAF — CFA (Central)', symbol: 'CFA' },
  { code: 'EUR', label: 'EUR — €', symbol: '€' },
  { code: 'USD', label: 'USD — $', symbol: '$' },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  
  const [formData, setFormData] = useState<TournamentFormData>({
    visibility: null,
    gameMode: null,
    datetime: '',
    rewards: '',
    description: '',
    isCreator: true,
    whatsapp: '',
    hasFee: false,
    feeAmount: '',
    currency: 'XOF',
    ticketCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Generate ticket code for private tournaments
  const generateTicketCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `FF${part1}-${part2}`;
  };

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('freefire-tournament-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    localStorage.setItem('freefire-tournament-draft', JSON.stringify(formData));
    addToast({
      title: 'Brouillon enregistré',
      message: 'Vos modifications ont été sauvegardées',
      type: 'success'
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.visibility) {
        newErrors.visibility = 'Veuillez choisir une visibilité';
      }
      if (!formData.gameMode) {
        newErrors.gameMode = 'Veuillez sélectionner un mode de jeu';
      }
      if (!formData.datetime) {
        newErrors.datetime = 'Veuillez choisir une date et heure';
      } else {
        const selectedDate = new Date(formData.datetime);
        const now = new Date();
        if (selectedDate.getTime() <= now.getTime() + 5 * 60 * 1000) {
          newErrors.datetime = 'La date doit être au moins 5 minutes dans le futur';
        }
      }
    }

    if (step === 2) {
      if (formData.description.length > 10000) {
        newErrors.description = 'Description trop longue (max 10 000 caractères)';
      }
      if (formData.isCreator && (!formData.whatsapp || formData.whatsapp.trim().length < 8)) {
        newErrors.whatsapp = 'Numéro WhatsApp requis (min 8 caractères)';
      }
    }

    if (step === 3) {
      if (formData.hasFee) {
        const amount = parseFloat(formData.feeAmount);
        if (!amount || amount <= 0) {
          newErrors.feeAmount = 'Montant invalide (doit être supérieur à 0)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitTournament = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Generate ticket code for private tournaments
      if (formData.visibility === 'private' && !formData.ticketCode) {
        setFormData(prev => ({ ...prev, ticketCode: generateTicketCode() }));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      localStorage.removeItem('freefire-tournament-draft');
      addToast({
        title: 'Tournoi créé avec succès !',
        message: 'Votre tournoi sera examiné sous 48h',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Erreur',
        message: 'Erreur lors de la création du tournoi',
        type: 'error'
      });
    }
  };

  const copyTicketCode = async () => {
    if (formData.ticketCode) {
      try {
        await navigator.clipboard.writeText(formData.ticketCode);
        addToast({
          title: 'Code copié !',
          message: 'Le code a été copié dans le presse-papiers',
          type: 'success'
        });
      } catch (e) {
        addToast({
          title: 'Erreur',
          message: 'Erreur lors de la copie',
          type: 'error'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      visibility: null,
      gameMode: null,
      datetime: '',
      rewards: '',
      description: '',
      isCreator: true,
      whatsapp: '',
      hasFee: false,
      feeAmount: '',
      currency: 'XOF',
      ticketCode: '',
    });
    setCurrentStep(1);
    setIsSubmitted(false);
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-[Inter] antialiased">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-indigo-500/10 grid place-items-center border border-indigo-400/20">
                <span className="text-[13px] tracking-tight font-semibold text-indigo-300">FF</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-white/70">FreeFire Tournaments</span>
                <span className="text-[11px] text-white/40 -mt-0.5">Création réussie</span>
              </div>
            </div>
          </div>
        </header>

        {/* Success State */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/20 grid place-items-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="mt-4 text-xl font-semibold tracking-tight">Demande envoyée !</h1>
              <p className="mt-1 text-sm text-white/70">Votre tournoi sera examiné sous 48h</p>
              
              {formData.visibility === 'private' && formData.ticketCode && (
                <div className="mt-6 p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-300" />
                      Code d'accès privé
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-black/30">
                    <code className="font-mono text-sm tracking-wider flex-1">{formData.ticketCode}</code>
                    <button
                      onClick={copyTicketCode}
                      className="px-2.5 h-8 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copier</span>
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-2">Partagez ce code avec les participants</p>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  Créer un autre
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
                >
                  Retour au tableau de bord
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-[Inter] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-3 h-8 rounded-md border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-indigo-500/10 grid place-items-center border border-indigo-400/20">
                <span className="text-[13px] tracking-tight font-semibold text-indigo-300">FF</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-white/70">FreeFire Tournaments</span>
                <span className="text-[11px] text-white/40 -mt-0.5">Création guidée</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Créer un tournoi FreeFire</h1>
            <p className="text-white/60 mt-1 text-sm">Complétez les étapes pour soumettre votre tournoi à validation</p>
          </div>

          {/* Rest of the tournament creation form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            {/* Progress */}
            <div className="px-4 sm:px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div
                        className={`w-8 h-8 rounded-full grid place-items-center text-[12px] font-medium border transition-colors ${
                          step < currentStep
                            ? 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300'
                            : step === currentStep
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {step < currentStep ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          step
                        )}
                      </div>
                      {step < 4 && <div className="w-8 h-[2px] bg-white/10 mx-2"></div>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/70">Étape {currentStep} sur {totalSteps}</div>
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Form content would continue here with all the steps... */}
            <div className="px-4 sm:px-6 py-6">
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Formulaire de création</h2>
                <p className="text-white/60">
                  Le formulaire complet sera implémenté dans les prochaines étapes.
                  Pour l'instant, cette page démontre la structure migrée vers Next.js.
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-4 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 disabled:opacity-40"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                  <button
                    onClick={saveDraft}
                    className="px-4 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-4 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-2"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
