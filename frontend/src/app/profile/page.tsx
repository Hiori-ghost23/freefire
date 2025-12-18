'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Gamepad2,
  Shield,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  Trophy,
  ShoppingBag,
  CreditCard,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, COUNTRIES } from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMyOrders, useMyTournaments, useUpdateProfile, useChangePassword } from '@/lib/hooks/api-hooks';

// Types for history data
interface OrderHistoryItem {
  id: string;
  date: string;
  items: string;
  amount: number;
  status: string;
}

interface TournamentHistoryItem {
  id: string | number;
  name: string;
  date: string;
  position: number;
  prize: number;
}

// Validation schema for profile update
const profileSchema = z.object({
  display_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  country: z.string().min(2, 'Sélectionnez un pays'),
  uid_freefire: z.string().regex(/^\d{8,12}$/, 'UID FreeFire invalide (8-12 chiffres)'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Mot de passe actuel requis'),
  new_password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { state: authState } = useAuth();
  const { data: ordersData } = useMyOrders();
  const { data: tournamentsData } = useMyTournaments();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'history'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  // Get user from auth context
  const profileData = authState.user;
  const profileLoading = authState.isLoading;

  // Transform API data or use defaults
  const userData = profileData ? {
    id: profileData.id,
    email: profileData.email,
    display_name: profileData.display_name || profileData.email?.split('@')[0] || 'Utilisateur',
    phone: profileData.phone || '',
    country: profileData.country_code || 'BJ',
    uid_freefire: profileData.uid_freefire || '',
    role: profileData.role || 'user',
    avatar_url: null,
    created_at: profileData.created_at || new Date().toISOString(),
    email_verified: profileData.email_verified || false,
    stats: {
      tournaments_played: Array.isArray(tournamentsData) ? tournamentsData.length : 0,
      tournaments_won: Array.isArray(tournamentsData) ? tournamentsData.filter((t: { position?: number }) => t.position === 1).length : 0,
      total_orders: Array.isArray(ordersData) ? ordersData.length : 0,
      total_spent: Array.isArray(ordersData) ? ordersData.reduce((sum: number, o: { total_amount?: number }) => sum + (o.total_amount || 0), 0) : 0,
    }
  } : null;

  const isSubmitting = updateProfileMutation.isPending || changePasswordMutation.isPending;

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: userData?.display_name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      country: userData?.country || 'BJ',
      uid_freefire: userData?.uid_freefire || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Update form when userData changes
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        display_name: userData.display_name,
        email: userData.email,
        phone: userData.phone,
        country: userData.country,
        uid_freefire: userData.uid_freefire,
      });
    }
  }, [profileData]);


  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setIsEditing(false);
      
      addToast({
        type: 'success',
        title: 'Profil mis à jour',
        message: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error?.response?.data?.detail || 'Impossible de mettre à jour le profil.',
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      
      passwordForm.reset();
      
      addToast({
        type: 'success',
        title: 'Mot de passe modifié',
        message: 'Votre mot de passe a été changé avec succès.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error?.response?.data?.detail || 'Impossible de modifier le mot de passe.',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatXOF = (amount: number) => {
    return `${amount.toLocaleString()} XOF`;
  };

  // Transform orders data
  const orderHistory: OrderHistoryItem[] = Array.isArray(ordersData) 
    ? ordersData.map((order: { code?: string; id?: string; created_at?: string; item_name?: string; catalog_item?: { name?: string }; total_amount?: number; amount?: number; status?: string }) => ({
        id: order.code || order.id || '',
        date: order.created_at?.split('T')[0] || 'N/A',
        items: order.item_name || order.catalog_item?.name || 'Produit',
        amount: order.total_amount || order.amount || 0,
        status: order.status || 'pending',
      }))
    : [];

  // Transform tournaments data
  const tournamentHistory: TournamentHistoryItem[] = Array.isArray(tournamentsData)
    ? tournamentsData.map((t: { id?: string | number; tournament_id?: string | number; title?: string; tournament?: { title?: string; start_date?: string }; created_at?: string; position?: number; final_position?: number; prize_won?: number }) => ({
        id: t.id || t.tournament_id || '',
        name: t.title || t.tournament?.title || 'Tournoi',
        date: t.created_at?.split('T')[0] || t.tournament?.start_date?.split('T')[0] || 'N/A',
        position: t.position || t.final_position || 0,
        prize: t.prize_won || 0,
      }))
    : [];

  const tabs = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'history', label: 'Historique', icon: ShoppingBag },
  ];

  // Loading state
  if (profileLoading) {
    return (
      <AppLayout user={null}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Chargement du profil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Not authenticated - redirect to login
  if (!authState.isAuthenticated || !userData) {
    router.push('/login');
    return null;
  }

  // User data for AppLayout
  const appUser = {
    id: userData.id,
    email: userData.email,
    display_name: userData.display_name,
    role: userData.role as 'user' | 'admin' | 'organizer',
  };

  return (
    <AppLayout user={appUser}>
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Mon Compte</h1>
            <p className="mt-2 text-neutral-400">Gérez vos informations personnelles et vos préférences</p>
          </div>

          {/* Profile Card */}
          <div className="card mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                  {userData.display_name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary/80 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{userData.display_name}</h2>
                <p className="text-neutral-400">{userData.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userData.email_verified 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-yellow-400/10 text-yellow-400'
                  }`}>
                    {userData.email_verified ? 'Email vérifié' : 'Email non vérifié'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {userData.role}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  Membre depuis {formatDate(userData.created_at)}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{userData.stats.tournaments_won}</div>
                  <div className="text-xs text-neutral-400">Victoires</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{userData.stats.total_orders}</div>
                  <div className="text-xs text-neutral-400">Commandes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>


          {/* Tab Content */}
          <div className="card">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>

                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Name */}
                    <div>
                      <Label htmlFor="display_name">Nom affiché</Label>
                      <Input
                        id="display_name"
                        disabled={!isEditing}
                        error={!!profileForm.formState.errors.display_name}
                        {...profileForm.register('display_name')}
                        className="mt-2"
                      />
                      {profileForm.formState.errors.display_name && (
                        <p className="mt-1 text-sm text-red-400">
                          {profileForm.formState.errors.display_name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        disabled={!isEditing}
                        error={!!profileForm.formState.errors.email}
                        {...profileForm.register('email')}
                        className="mt-2"
                      />
                      {profileForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-400">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        disabled={!isEditing}
                        error={!!profileForm.formState.errors.phone}
                        {...profileForm.register('phone')}
                        className="mt-2"
                      />
                      {profileForm.formState.errors.phone && (
                        <p className="mt-1 text-sm text-red-400">
                          {profileForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <Label htmlFor="country">Pays</Label>
                      <Select
                        disabled={!isEditing}
                        error={!!profileForm.formState.errors.country}
                        {...profileForm.register('country')}
                        className="mt-2"
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </Select>
                      {profileForm.formState.errors.country && (
                        <p className="mt-1 text-sm text-red-400">
                          {profileForm.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    {/* UID FreeFire */}
                    <div className="md:col-span-2">
                      <Label htmlFor="uid_freefire">UID FreeFire</Label>
                      <div className="relative mt-2">
                        <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="uid_freefire"
                          disabled={!isEditing}
                          error={!!profileForm.formState.errors.uid_freefire}
                          {...profileForm.register('uid_freefire')}
                          className="pl-10"
                        />
                      </div>
                      {profileForm.formState.errors.uid_freefire && (
                        <p className="mt-1 text-sm text-red-400">
                          {profileForm.formState.errors.uid_freefire.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          profileForm.reset();
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Sécurité du compte</h3>

                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                  {/* Current Password */}
                  <div>
                    <Label htmlFor="current_password">Mot de passe actuel</Label>
                    <div className="relative mt-2">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        error={!!passwordForm.formState.errors.current_password}
                        {...passwordForm.register('current_password')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.current_password && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="new_password">Nouveau mot de passe</Label>
                    <div className="relative mt-2">
                      <Input
                        id="new_password"
                        type={showNewPassword ? 'text' : 'password'}
                        error={!!passwordForm.formState.errors.new_password}
                        {...passwordForm.register('new_password')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.new_password && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordForm.formState.errors.new_password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      error={!!passwordForm.formState.errors.confirm_password}
                      {...passwordForm.register('confirm_password')}
                      className="mt-2"
                    />
                    {passwordForm.formState.errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordForm.formState.errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Changer le mot de passe
                      </>
                    )}
                  </Button>
                </form>

                {/* Danger Zone */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-red-400 mb-4">Zone de danger</h4>
                  <p className="text-neutral-400 mb-4">
                    La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                    onClick={() => addToast({ type: 'info', message: 'Fonctionnalité en cours de développement' })}
                  >
                    Supprimer mon compte
                  </Button>
                </div>
              </div>
            )}


            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-8">
                {/* Orders History */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Historique des commandes
                  </h3>
                  
                  {orderHistory.length > 0 ? (
                    <div className="space-y-3">
                      {orderHistory.map((order: OrderHistoryItem) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{order.items}</p>
                              <p className="text-sm text-neutral-400">{order.id} • {order.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">{formatXOF(order.amount)}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Livré
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-400">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune commande pour le moment</p>
                    </div>
                  )}
                </div>

                {/* Tournaments History */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Historique des tournois
                  </h3>
                  
                  {tournamentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {tournamentHistory.map((tournament: TournamentHistoryItem) => (
                        <div
                          key={tournament.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              tournament.position === 1 
                                ? 'bg-yellow-400/10' 
                                : tournament.position <= 3 
                                  ? 'bg-primary/10' 
                                  : 'bg-white/5'
                            }`}>
                              <Trophy className={`w-5 h-5 ${
                                tournament.position === 1 
                                  ? 'text-yellow-400' 
                                  : tournament.position <= 3 
                                    ? 'text-primary' 
                                    : 'text-neutral-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{tournament.name}</p>
                              <p className="text-sm text-neutral-400">{tournament.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              tournament.position === 1 
                                ? 'text-yellow-400' 
                                : tournament.position <= 3 
                                  ? 'text-primary' 
                                  : 'text-white'
                            }`}>
                              #{tournament.position}
                            </p>
                            {tournament.prize > 0 && (
                              <p className="text-sm text-green-400">+{formatXOF(tournament.prize)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-400">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun tournoi joué pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
