import { redirect } from 'next/navigation';

export default function HomePage() {
  // Pour le moment, on redirige vers la page de connexion
  redirect('/login');
}
