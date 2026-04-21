import ServiceTabs from '../components/ServiceTabs';

export default function StorePage(): JSX.Element {
  return (
    <section className="space-y-8">
      <ServiceTabs active="store" />
      <div className="grid min-h-[42vh] place-items-center rounded-3xl border border-white/15 bg-[#041743] p-8 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-wide">Bientôt Disponible</h1>
          <p className="text-slate-300">Le Store Guichet arrive bientôt avec une sélection premium.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#041743] p-6">
        <h2 className="text-xl font-semibold">Recevez le lancement en avant-première</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input placeholder="Votre email" className="flex-1 rounded-full border border-white/20 bg-[#021131] px-4 py-3" />
          <button className="rounded-full bg-orange-500 px-6 py-3 font-semibold">S’inscrire</button>
        </div>
      </div>
      <footer className="border-t border-white/10 py-6 text-sm text-slate-400">© 2026 Guichet Store · Tous droits réservés.</footer>
    </section>
  );
}
