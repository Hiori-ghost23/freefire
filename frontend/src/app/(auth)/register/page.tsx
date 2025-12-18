'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle, UserPlus, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, COUNTRIES } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

interface PasswordStrength {
  hasLength: boolean;
  hasCase: boolean;
  hasNumber: boolean;
  score: number;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasLength: false,
    hasCase: false,
    hasNumber: false,
    score: 0
  });
  const router = useRouter();
  const { addToast } = useToast();
  const { state: authState, register: registerUser } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authState.isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      phone_code: '+33',
      country: '',
      terms: false,
    }
  });

  const watchedPassword = watch('password');
  const watchedCountry = watch('country');

  // Update password strength in real-time
  useEffect(() => {
    if (!watchedPassword) {
      setPasswordStrength({ hasLength: false, hasCase: false, hasNumber: false, score: 0 });
      return;
    }

    const hasLength = watchedPassword.length >= 8;
    const hasCase = /[a-z]/.test(watchedPassword) && /[A-Z]/.test(watchedPassword);
    const hasNumber = /\d/.test(watchedPassword);
    const score = [hasLength, hasCase, hasNumber].filter(Boolean).length;

    setPasswordStrength({ hasLength, hasCase, hasNumber, score });
  }, [watchedPassword]);

  // Update phone code when country changes
  useEffect(() => {
    if (watchedCountry) {
      const country = COUNTRIES.find(c => c.code === watchedCountry);
      if (country) {
        setValue('phone_code', country.phoneCode);
      }
    }
  }, [watchedCountry, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    // Transform data to match API expectations
    const registerData = {
      email: data.email,
      password: data.password,
      display_name: data.display_name,
      phone: `${data.phone_code}${data.phone}`,
      country_code: data.country,
      uid_freefire: data.uid_freefire,
    };

    const success = await registerUser(registerData);
    
    if (success) {
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  };

  const getStrengthText = () => {
    const texts = ['Faible', 'Moyen', 'Fort', 'Très fort'];
    const colors = ['text-red-400', 'text-yellow-400', 'text-emerald-400', 'text-emerald-300'];
    return {
      text: texts[passwordStrength.score] || 'Faible',
      color: colors[passwordStrength.score] || 'text-red-400'
    };
  };

  const strengthInfo = getStrengthText();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Registration Card */}
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Créer un compte</h1>
              <p className="text-neutral-400 text-sm">Rejoignez notre communauté de joueurs</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="mb-2 block">
                  Mot de passe <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    className="pr-12"
                    error={!!errors.password}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Validation */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasLength ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-neutral-400">Au moins 8 caractères</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasCase ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-neutral-400">Une majuscule et une minuscule</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasNumber ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-neutral-400">Un chiffre</span>
                  </div>
                  <div className="text-xs text-right">
                    <span className={strengthInfo.color}>{strengthInfo.text}</span>
                  </div>
                </div>

                {errors.password && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Password Confirmation Field */}
              <div>
                <Label htmlFor="password_confirmation" className="mb-2 block">
                  Confirmer le mot de passe <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Confirmer votre mot de passe"
                  error={!!errors.password_confirmation}
                  {...register('password_confirmation')}
                />
                {errors.password_confirmation && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              {/* Display Name Field (Optional) */}
              <div>
                <Label htmlFor="display_name" className="mb-2 block">
                  Nom affiché (optionnel)
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="Votre pseudo"
                  {...register('display_name')}
                />
              </div>

              {/* Country Field */}
              <div>
                <Label htmlFor="country" className="mb-2 block">
                  Pays <span className="text-red-400">*</span>
                </Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select error={!!errors.country} {...field}>
                      <option value="">Sélectionnez votre pays</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.country && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Téléphone <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-2">
                  <Controller
                    name="phone_code"
                    control={control}
                    render={({ field }) => (
                      <Select className="w-24" {...field}>
                        {COUNTRIES.map((country) => (
                          <option key={country.phoneCode} value={country.phoneCode}>
                            {country.phoneCode}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="123456789"
                    className="flex-1"
                    error={!!errors.phone}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* UID FreeFire Field */}
              <div>
                <Label htmlFor="uid_freefire" className="mb-2 block">
                  UID Free Fire <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="uid_freefire"
                  type="text"
                  placeholder="123456789"
                  maxLength={12}
                  error={!!errors.uid_freefire}
                  {...register('uid_freefire')}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Votre identifiant unique dans Free Fire
                </p>
                {errors.uid_freefire && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.uid_freefire.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-start gap-3">
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <input
                        type="checkbox"
                        id="terms"
                        checked={value}
                        onChange={onChange}
                        className="h-4 w-4 mt-1 rounded border border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-2"
                      />
                    )}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    J'accepte les{' '}
                    <button 
                      type="button" 
                      className="text-primary hover:text-primary/80 underline"
                      onClick={() => addToast({ type: 'info', message: 'Fonctionnalité en cours de développement' })}
                    >
                      Conditions Générales d'Utilisation
                    </button>
                    {' '}et la{' '}
                    <button 
                      type="button" 
                      className="text-primary hover:text-primary/80 underline"
                      onClick={() => addToast({ type: 'info', message: 'Fonctionnalité en cours de développement' })}
                    >
                      Politique de Confidentialité
                    </button>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || authState.isLoading}
              >
                {authState.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer mon compte
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-neutral-400">
                Déjà un compte ?
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-primary hover:text-primary/80 font-medium transition-colors ml-1"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-neutral-500">© 2024 Arthur project. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
