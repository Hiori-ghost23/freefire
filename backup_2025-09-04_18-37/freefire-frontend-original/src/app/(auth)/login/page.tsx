'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useLogin } from '@/lib/hooks/api-hooks';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      addToast({
        type: 'success',
        title: 'Connexion réussie !',
        message: 'Redirection en cours...',
      });
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 
        'Email ou mot de passe incorrect. Essayez demo@freefire.com / demo123';
      
      addToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: errorMessage,
      });
    }
  };

  const handleForgotPassword = () => {
    addToast({
      type: 'info',
      message: 'Fonctionnalité "Mot de passe oublié" en cours de développement.',
    });
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Login Card */}
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
                  <span className="text-lg font-bold text-primary tracking-tight">FF</span>
                </div>
              </div>
              
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Connexion</h1>
              <p className="text-neutral-400 text-sm">Ravi de vous revoir ! Accédez à votre compte.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="mb-2 block">Email</Label>
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
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
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
                {errors.password && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-2"
                />
                <Label htmlFor="remember" className="ml-2">
                  Se souvenir de moi
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-neutral-400">
                Pas encore de compte ?
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-primary hover:text-primary/80 font-medium transition-colors ml-1"
                >
                  Créer un compte
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

      {/* Demo credentials hint */}
      <div className="fixed bottom-4 left-4 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-primary max-w-xs z-50">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Demo</p>
            <p className="text-xs opacity-90">
              Email: demo@freefire.com<br />
              Mot de passe: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
