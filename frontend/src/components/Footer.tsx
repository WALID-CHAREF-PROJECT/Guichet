export default function Footer(): JSX.Element {
  return (
    <footer className="mt-14 bg-slate-900 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div><h3 className="font-semibold">Légal</h3><ul className="mt-3 space-y-2 text-sm"><li>Conditions</li><li>Confidentialité</li><li>Cookies</li></ul></div>
        <div><h3 className="font-semibold">Aide</h3><ul className="mt-3 space-y-2 text-sm"><li>Centre d'aide</li><li>Contact</li><li>FAQ</li></ul></div>
        <div><h3 className="font-semibold">Société</h3><ul className="mt-3 space-y-2 text-sm"><li>À propos</li><li>Partenaires</li><li>Carrières</li></ul></div>
        <div><h3 className="font-semibold">Apps</h3><ul className="mt-3 space-y-2 text-sm"><li>iOS</li><li>Android</li><li>API</li></ul></div>
      </div>
    </footer>
  );
}
