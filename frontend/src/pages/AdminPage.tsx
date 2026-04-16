import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentUser } from '../services/storage';

export default function AdminPage(): JSX.Element {
  const { translate } = useLanguage();
  const user = getCurrentUser();

  if (!user || user.role !== 'admin') {
    return (
      <section className="rounded-2xl border bg-white p-8">
        <h1 className="text-3xl font-bold text-slate-900">{translate('admin')}</h1>
        <p className="mt-3 text-slate-700">
          Accès refusé. Connectez-vous avec le compte admin: <strong>admin@guichet.ma / Admin@123</strong>.
        </p>
        <Link to="/login" className="mt-4 inline-block rounded bg-brand-600 px-4 py-2 text-white">{translate('login')}</Link>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border bg-white p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{translate('adminWelcome')}</h1>
        <p className="mt-2 text-slate-700">{translate('adminDesc')}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold">{translate('adminAccountHint')}</p>
        <p>Email: admin@guichet.ma</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border p-4">
          <h2 className="font-semibold">Sports</h2>
          <p className="mt-2 text-sm text-slate-600">Ajouter des tickets sportifs et gérer les stocks.</p>
        </article>
        <article className="rounded-xl border p-4">
          <h2 className="font-semibold">Cinéma</h2>
          <p className="mt-2 text-sm text-slate-600">Ajouter des séances, films, et prix de billets.</p>
        </article>
        <article className="rounded-xl border p-4">
          <h2 className="font-semibold">Événements</h2>
          <p className="mt-2 text-sm text-slate-600">Créer des événements et publier la billetterie.</p>
        </article>
      </div>
    </section>
  );
}
