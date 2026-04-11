import { Link } from 'react-router-dom';

export default function NotFoundPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
      <h1 className="text-6xl font-black">404</h1>
      <p>La page demandée est introuvable.</p>
      <Link to="/" className="rounded bg-white px-4 py-2 text-slate-900">Retour à l'accueil</Link>
    </main>
  );
}
