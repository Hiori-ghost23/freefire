'use client';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks/api-hooks';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Tableau de bord FreeFire MVP
            </h1>
            <p className="text-neutral-400">
              Bienvenue sur votre tableau de bord !
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Déconnexion...' : 'Se déconnecter'}
          </Button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Tournois</h3>
            <p className="text-neutral-400 text-sm">
              Gérez vos tournois et participez aux compétitions
            </p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2">Boutique</h3>
            <p className="text-neutral-400 text-sm">
              Achetez des diamants et autres contenus FreeFire
            </p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold mb-2">Profil</h3>
            <p className="text-neutral-400 text-sm">
              Gérez votre compte et vos préférences
            </p>
          </div>
        </div>

        <div className="mt-8 card">
          <h2 className="text-xl font-semibold mb-4">🎉 Félicitations !</h2>
          <p className="text-neutral-300">
            Vous avez réussi à intégrer la page de connexion dans Next.js ! 
            Cette page est maintenant connectée à votre API backend avec :
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-400">
            <li>✅ Authentification JWT</li>
            <li>✅ Validation des formulaires avec Zod</li>
            <li>✅ Gestion d'état avec React Query</li>
            <li>✅ UI moderne avec TailwindCSS</li>
            <li>✅ Notifications toast</li>
            <li>✅ Architecture Next.js 14</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
