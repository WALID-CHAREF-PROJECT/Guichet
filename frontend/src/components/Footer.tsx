const footerLinks = {
  Explorer: ['Billetterie', 'Store', 'Cinéma', 'Voyage', 'Sport'],
  'Guichet.com': ['Qui sommes-nous ?', 'Contactez-nous', 'F.A.Q', 'Blog'],
  'Termes & conditions': ['Mentions légales', 'Conditions générales de vente', 'Conditions générales d’utilisation', 'Politique de remboursement']
};

export default function Footer(): JSX.Element {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#021133]">
      <div className="mx-auto grid max-w-[1700px] gap-10 px-4 py-12 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-black text-white">Guichet</h2>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Guichet.com est la plateforme numéro 1 de la billetterie digitale au Maroc. Retrouvez vos événements, voyages et expériences.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 className="font-semibold text-white">{title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {links.map((link) => <li key={link}>{link}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
