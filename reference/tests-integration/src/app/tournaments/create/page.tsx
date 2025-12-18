'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, GamepadIcon, CalendarClock, Trophy, FileText, Phone, Coins, CheckCircle2, Ticket, Copy, Users, Shield, Swords, Target, Crosshair } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

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
  const { toast } = useToast();
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
    toast({
      title: 'Brouillon enregistré',
      variant: 'success'
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
      toast({
        title: 'Tournoi créé avec succès !',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur lors de la création du tournoi',
        variant: 'error'
      });
    }
  };

  const copyTicketCode = async () => {
    if (formData.ticketCode) {
      try {
        await navigator.clipboard.writeText(formData.ticketCode);
        toast({
          title: 'Code copié !',
          variant: 'success'
        });
      } catch (e) {
        toast({
          title: 'Erreur lors de la copie',
          variant: 'error'
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

          {/* Wizard Card */}
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

            {/* Form Content */}
            <form className="px-4 sm:px-6 py-6 space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-8 transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visibility */}
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold tracking-tight text-white">Visibilité</h3>
                          <p className="text-xs text-white/60">Tournoi public ou privé</p>
                        </div>
                        <Eye className="w-5 h-5 text-white/60" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, visibility: 'public' }));
                            setErrors(prev => ({ ...prev, visibility: '' }));
                          }}
                          className={`px-3 py-3 rounded-lg border transition text-left ${
                            formData.visibility === 'public'
                              ? 'ring-2 ring-white/20 border-white/20 bg-white/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-white/70" />
                            <span className="text-sm font-medium">Public</span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">Visible par tous</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, visibility: 'private' }));
                            setErrors(prev => ({ ...prev, visibility: '' }));
                          }}
                          className={`px-3 py-3 rounded-lg border transition text-left ${
                            formData.visibility === 'private'
                              ? 'ring-2 ring-white/20 border-white/20 bg-white/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-white/70" />
                            <span className="text-sm font-medium">Privé</span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">Code d'accès requis</p>
                        </button>
                      </div>
                      {errors.visibility && (
                        <p className="mt-2 text-xs text-rose-400">{errors.visibility}</p>
                      )}
                    </div>

                    {/* Game Mode */}
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold tracking-tight text-white">Mode de jeu</h3>
                          <p className="text-xs text-white/60">Format du tournoi</p>
                        </div>
                        <GamepadIcon className="w-5 h-5 text-white/60" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {GAME_MODES.map(mode => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, gameMode: mode.id as any }));
                              setErrors(prev => ({ ...prev, gameMode: '' }));
                            }}
                            className={`px-3 py-3 rounded-lg border transition text-left ${
                              formData.gameMode === mode.id
                                ? 'ring-2 ring-white/20 border-white/20 bg-white/10'
                                : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <mode.icon className="w-4 h-4 text-white/70" />
                              <span className="text-sm font-medium">{mode.label}</span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-1">{mode.maxPlayers}</p>
                          </button>
                        ))}
                      </div>
                      {errors.gameMode && (
                        <p className="mt-2 text-xs text-rose-400">{errors.gameMode}</p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">Date & heure</h3>
                        <p className="text-xs text-white/60">Programmation du tournoi</p>
                      </div>
                      <CalendarClock className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/60">Date et heure de début</label>
                        <input
                          type="datetime-local"
                          value={formData.datetime}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, datetime: e.target.value }));
                            setErrors(prev => ({ ...prev, datetime: '' }));
                          }}
                          className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 px-3 py-2 text-sm placeholder:text-white/40"
                        />
                        {errors.datetime && (
                          <p className="mt-2 text-xs text-rose-400">{errors.datetime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6 transition-all duration-500">
                  {/* Rewards */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">Récompenses</h3>
                        <p className="text-xs text-white/60">Détaillez les prix (optionnel)</p>
                      </div>
                      <Trophy className="w-5 h-5 text-white/60" />
                    </div>
                    <textarea
                      rows={3}
                      value={formData.rewards}
                      onChange={(e) => setFormData(prev => ({ ...prev, rewards: e.target.value }))}
                      className="w-full rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 px-3 py-2 text-sm placeholder:text-white/40"
                      placeholder="Ex: 1er place 50 000 CFA, 2e place 25 000 CFA, 3e place 10 000 CFA..."
                    />
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">Description & Règles</h3>
                        <p className="text-xs text-white/60">Max 10 000 caractères</p>
                      </div>
                      <FileText className="w-5 h-5 text-white/60" />
                    </div>
                    <textarea
                      rows={5}
                      maxLength={10000}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        setErrors(prev => ({ ...prev, description: '' }));
                      }}
                      className="w-full rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 px-3 py-2 text-sm placeholder:text-white/40"
                      placeholder="Décrivez les règles du tournoi, format des matchs, critères de victoire, conditions de participation..."
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-white/50">{formData.description.length} / 10 000</span>
                      {errors.description && (
                        <p className="text-xs text-rose-400">{errors.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">Contact organisateur</h3>
                        <p className="text-xs text-white/60">WhatsApp requis pour les participants</p>
                      </div>
                      <Phone className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-white/60">Numéro WhatsApp</label>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, whatsapp: e.target.value }));
                            setErrors(prev => ({ ...prev, whatsapp: '' }));
                          }}
                          placeholder="+229 XX XX XX XX"
                          className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 px-3 py-2 text-sm placeholder:text-white/40"
                        />
                        {errors.whatsapp && (
                          <p className="mt-2 text-xs text-rose-400">{errors.whatsapp}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Fees */}
              {currentStep === 3 && (
                <div className="space-y-6 transition-all duration-500">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">Frais d'entrée</h3>
                        <p className="text-xs text-white/60">Optionnel - définir un prix d'entrée</p>
                      </div>
                      <Coins className="w-5 h-5 text-white/60" />
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, hasFee: !prev.hasFee }))}
                          className={`w-11 h-6 rounded-full border relative transition ${
                            formData.hasFee
                              ? 'bg-emerald-500/20 border-emerald-400/40'
                              : 'bg-white/10 border-white/15'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full transition ${
                              formData.hasFee
                                ? 'left-5 bg-emerald-300'
                                : 'left-0.5 bg-white/80'
                            }`}
                          />
                        </button>
                        <span className="text-sm">Activer les frais d'entrée</span>
                      </div>
                    </div>

                    {formData.hasFee && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-xs text-white/60">Montant</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.feeAmount}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, feeAmount: e.target.value }));
                              setErrors(prev => ({ ...prev, feeAmount: '' }));
                            }}
                            placeholder="0.00"
                            className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 px-3 py-2 text-sm placeholder:text-white/40"
                          />
                          {errors.feeAmount && (
                            <p className="mt-2 text-xs text-rose-400">{errors.feeAmount}</p>
                          )}
                        </div>
                        
                        <div className="relative">
                          <label className="text-xs text-white/60">Devise</label>
                          <button
                            type="button"
                            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                            className="mt-1 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition text-sm"
                          >
                            <span>{formData.currency}</span>
                          </button>
                          
                          {showCurrencyMenu && (
                            <div className="absolute mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 shadow-xl overflow-hidden z-20">
                              <div className="py-1">
                                {CURRENCIES.map(currency => (
                                  <button
                                    key={currency.code}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, currency: currency.code as any }));
                                      setShowCurrencyMenu(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm"
                                  >
                                    {currency.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Summary */}
              {currentStep === 4 && (
                <div className="space-y-6 transition-all duration-500">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">Résumé & Confirmation</h3>
                        <p className="text-xs text-white/60">Vérifiez vos informations avant soumission</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-white/60" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-white/10 p-3 bg-black/20">
                        <div className="text-xs text-white/50">Visibilité</div>
                        <div className="text-sm mt-0.5">
                          {formData.visibility === 'public' ? 'Public' : 'Privé'}
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-white/10 p-3 bg-black/20">
                        <div className="text-xs text-white/50">Mode de jeu</div>
                        <div className="text-sm mt-0.5">{formData.gameMode || '—'}</div>
                      </div>
                      
                      <div className="rounded-lg border border-white/10 p-3 bg-black/20">
                        <div className="text-xs text-white/50">Date & heure</div>
                        <div className="text-sm mt-0.5">
                          {formData.datetime ? new Date(formData.datetime).toLocaleString('fr-FR') : '—'}
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-white/10 p-3 bg-black/20">
                        <div className="text-xs text-white/50">Frais d'entrée</div>
                        <div className="text-sm mt-0.5">
                          {formData.hasFee ? `${formData.feeAmount} ${formData.currency}` : 'Gratuit'}
                        </div>
                      </div>
                      
                      {formData.rewards && (
                        <div className="rounded-lg border border-white/10 p-3 bg-black/20 md:col-span-2">
                          <div className="text-xs text-white/50">Récompenses</div>
                          <div className="text-sm mt-0.5 whitespace-pre-wrap">{formData.rewards}</div>
                        </div>
                      )}
                      
                      {formData.description && (
                        <div className="rounded-lg border border-white/10 p-3 bg-black/20 md:col-span-2">
                          <div className="text-xs text-white/50">Description</div>
                          <div className="text-sm mt-0.5 whitespace-pre-wrap line-clamp-5">{formData.description}</div>
                        </div>
                      )}
                    </div>

                    {/* Ticket code preview for private tournaments */}
                    {formData.visibility === 'private' && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-white/70" />
                            <span className="text-sm font-medium">Code d'accès privé</span>
                          </div>
                          <span className="text-[11px] text-white/50">Sera généré après création</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-black/30">
                          <code className="font-mono text-sm tracking-wider">FF****-****</code>
                          <span className="text-xs text-white/50 ml-2">Généré automatiquement</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="mt-4 px-4 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="mt-4 px-4 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/80 hover:text-white"
                  >
                    Enregistrer le brouillon
                  </button>
                  
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="mt-4 px-4 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-2"
                    >
                      <span>Suivant</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitTournament}
                      className="mt-4 px-4 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
                    >
                      Soumettre le tournoi
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
