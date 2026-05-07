import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { producerPacksService, uploadAdminMedia, PackRecord, ProducerDashboardData, ProducerRecord } from '../services/producerPacks';

const defaultDashboard: ProducerDashboardData = {
  producer: null,
  pack: null,
  quota: {
    max_events_per_month: null,
    used_events_this_month: 0,
    max_active_events: null,
    active_events_count: 0,
    can_create_event: true,
  },
};


const card = 'rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl';
const input = 'w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20';
const btn = 'rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5';
const ghostBtn = 'rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10';
const dangerBtn = 'rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/25';

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
async function uploadImageWithDevFallback(file: File, collection: string): Promise<string> {
  try {
    return await uploadAdminMedia(file, collection);
  } catch (error) {
    if (import.meta.env.DEV) return fileToDataUrl(file);
    throw error;
  }
}

function MediaField({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string) => void }): JSX.Element {
  return <label className="space-y-2 text-sm text-slate-200"><span>{label}</span><input className={input} type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImageWithDevFallback(file, 'admin-media').then(onChange); }} />{value ? <img src={value} alt={label} className="h-32 w-full rounded-2xl border border-white/10 object-cover" /> : <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.04] text-xs text-slate-400">Aperçu image</div>}</label>;
}

export function AdminProducersPage(): JSX.Element {
  const [producers, setProducers] = useState<ProducerRecord[]>([]);
  const [packs, setPacks] = useState<PackRecord[]>([]);
  const [error, setError] = useState('');
  const load = async (): Promise<void> => { try { setError(''); const [nextProducers, nextPacks] = await Promise.all([producerPacksService.listProducers(), producerPacksService.listPacks()]); setProducers(nextProducers); setPacks(nextPacks); } catch (e) { setError((e as Error).message || 'Impossible de charger les producteurs.'); } };
  useEffect(() => { void load(); }, []);
  return <section className="space-y-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#061a4d] to-slate-950 p-6 text-white shadow-2xl">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Backoffice</p><h1 className="text-3xl font-black">Fournisseurs / producteurs</h1></div><Link className={btn} to="/ma-fr/admin/producers/new">Nouveau fournisseur</Link></div>
    {error && <p className="rounded-2xl border border-amber-300/20 bg-amber-500/15 p-3 text-sm text-amber-100">{error}</p>}
    <div className="grid gap-4 xl:grid-cols-2">{producers.length ? producers.map((producer) => <article key={producer.id} className={card}>
      <div className="flex gap-4"><img src={producer.logo || producer.cover_image || 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=240&q=80'} alt="" className="h-16 w-16 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><h2 className="truncate text-xl font-bold">{producer.name}</h2><p className="text-sm text-slate-300">/{producer.slug} · {producer.email ?? 'Sans email'} · {producer.is_active ? 'Actif' : 'Inactif'}</p></div></div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-300">{producer.description || 'Aucune description.'}</p>
      <div className="mt-4 flex flex-wrap gap-2"><select className={input + ' max-w-xs'} value={producer.pack_id ?? ''} onChange={(e) => void producerPacksService.assignPack(producer.id, Number(e.target.value)).then(load)}><option value="">Assigner un pack</option>{packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}</select><button className={ghostBtn} onClick={() => void producerPacksService.updateProducer(producer.id, { is_active: !producer.is_active }).then(load)}>{producer.is_active ? 'Désactiver' : 'Activer'}</button><Link className={ghostBtn} to={`/ma-fr/event/producer/${producer.slug}`}>Page publique</Link><button className={dangerBtn} onClick={() => void producerPacksService.deleteProducer(producer.id).then(load)}>Supprimer</button></div>
    </article>) : <div className={card + ' xl:col-span-2 text-center text-slate-300'}>Aucun fournisseur. Créez votre premier fournisseur avec logo, couverture et pack.</div>}</div>
    <Link className="text-sm font-semibold text-cyan-200 underline" to="/ma-fr/admin/packs">Gérer les packs producteurs</Link>
  </section>;
}

interface ProducerFormValues { firstName: string; lastName: string; email: string; password: string; phone: string; name: string; slug: string; logo: string; cover_image: string; city: string; address: string; support_email: string; support_phone: string; description: string; is_active: boolean; pack_id: number | ''; subscription_starts_at: string; subscription_ends_at: string; }
const defaultProducerForm: ProducerFormValues = { firstName: '', lastName: '', email: '', password: '', phone: '', name: '', slug: '', logo: '', cover_image: '', city: '', address: '', support_email: '', support_phone: '', description: '', is_active: true, pack_id: '', subscription_starts_at: '', subscription_ends_at: '' };

export function AdminProducerCreatePage(): JSX.Element {
  const navigate = useNavigate(); const [packs, setPacks] = useState<PackRecord[]>([]); const [error, setError] = useState(''); const [form, setForm] = useState<ProducerFormValues>(defaultProducerForm);
  const canSubmit = useMemo(() => !!form.name && !!form.slug && !!form.firstName && !!form.lastName && !!form.email && !!form.password, [form]);
  useEffect(() => { void producerPacksService.listPacks().then(setPacks).catch((e) => setError((e as Error).message)); }, []);
  const set = <K extends keyof ProducerFormValues>(key: K, value: ProducerFormValues[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async (event: FormEvent): Promise<void> => { event.preventDefault(); setError(''); try { const producer = await producerPacksService.createProducer({ ...form, ...(form.pack_id === '' ? { pack_id: undefined } : { pack_id: Number(form.pack_id) }) }); if (form.pack_id) await producerPacksService.assignPack(producer.id, Number(form.pack_id)); navigate('/ma-fr/admin/producers'); } catch (e) { setError((e as Error).message || 'Création impossible.'); } };
  return <section className="space-y-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#061a4d] to-slate-950 p-6 text-white shadow-2xl"><div><p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Nouveau fournisseur</p><h1 className="text-3xl font-black">Créer un fournisseur complet</h1></div>{error && <p className="rounded-2xl bg-red-500/15 p-3 text-red-100">{error}</p>}
    <form className="grid gap-5" onSubmit={(e) => void submit(e)}><div className={card + ' grid gap-4 md:grid-cols-2'}><input className={input} placeholder="Prénom" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required /><input className={input} placeholder="Nom" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required /><input className={input} type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} required /><input className={input} type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => set('password', e.target.value)} required /><input className={input} placeholder="Téléphone" value={form.phone} onChange={(e) => set('phone', e.target.value)} /><input className={input} placeholder="Entreprise" value={form.name} onChange={(e) => { set('name', e.target.value); if (!form.slug) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} required /><input className={input} placeholder="Slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} required /><select className={input} value={form.is_active ? '1' : '0'} onChange={(e) => set('is_active', e.target.value === '1')}><option value="1">Actif</option><option value="0">Inactif</option></select></div>
      <div className={card + ' grid gap-4 md:grid-cols-2'}><MediaField label="Logo" value={form.logo} onChange={(value) => set('logo', value)} /><MediaField label="Image de couverture" value={form.cover_image} onChange={(value) => set('cover_image', value)} /></div>
      <div className={card + ' grid gap-4 md:grid-cols-2'}><input className={input} placeholder="Ville" value={form.city} onChange={(e) => set('city', e.target.value)} /><input className={input} placeholder="Adresse" value={form.address} onChange={(e) => set('address', e.target.value)} /><input className={input} placeholder="Email support" value={form.support_email} onChange={(e) => set('support_email', e.target.value)} /><input className={input} placeholder="Téléphone support" value={form.support_phone} onChange={(e) => set('support_phone', e.target.value)} /><textarea className={input + ' md:col-span-2 min-h-32'} placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} /><select className={input} value={form.pack_id} onChange={(e) => set('pack_id', e.target.value ? Number(e.target.value) : '')}><option value="">Sélectionner un pack</option>{packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}</select><input className={input} type="date" value={form.subscription_starts_at} onChange={(e) => set('subscription_starts_at', e.target.value)} /><input className={input} type="date" value={form.subscription_ends_at} onChange={(e) => set('subscription_ends_at', e.target.value)} /></div>
      <div className="flex gap-3"><button className={btn} disabled={!canSubmit} type="submit">Créer et afficher dans la liste</button><Link to="/ma-fr/admin/producers" className={ghostBtn}>Annuler</Link></div></form></section>;
}

const defaultPack: Partial<PackRecord> = { name: '', code: '', slug: '', price: 0, billing_type: 'monthly', max_events_per_month: 5, max_active_events: 3, quotas: '', features: [], is_active: true, is_featured: false, image: '', description: '' };
export function AdminPacksPage(): JSX.Element {
  const [packs, setPacks] = useState<PackRecord[]>([]); const [error, setError] = useState(''); const [editing, setEditing] = useState<Partial<PackRecord>>(defaultPack);
  const load = async (): Promise<void> => { try { setPacks(await producerPacksService.listPacks()); setError(''); } catch (e) { setError((e as Error).message || 'Impossible de charger les packs.'); } };
  useEffect(() => { void load(); }, []);
  const save = async (event: FormEvent): Promise<void> => { event.preventDefault(); try { const payload = { ...editing, features: Array.isArray(editing.features) ? editing.features : String(editing.features ?? '').split('\n').filter(Boolean) }; if (editing.id) await producerPacksService.updatePack(editing.id, payload); else await producerPacksService.createPack(payload); setEditing(defaultPack); await load(); } catch (e) { setError((e as Error).message || 'Sauvegarde pack impossible.'); } };
  return <section className="space-y-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#061a4d] to-slate-950 p-6 text-white shadow-2xl"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Catalogue commercial</p><h1 className="text-3xl font-black">Packs producteurs</h1></div><Link className={ghostBtn} to="/ma-fr/admin/producers">Fournisseurs</Link></div>{error && <p className="rounded-2xl bg-red-500/15 p-3 text-red-100">{error}</p>}
    <form className={card + ' grid gap-4 lg:grid-cols-3'} onSubmit={(e) => void save(e)}><input className={input} placeholder="Nom du pack" value={editing.name ?? ''} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} required /><input className={input} placeholder="Code / slug" value={editing.code ?? ''} onChange={(e) => setEditing((p) => ({ ...p, code: e.target.value, slug: e.target.value }))} required /><input className={input} type="number" placeholder="Prix" value={editing.price ?? 0} onChange={(e) => setEditing((p) => ({ ...p, price: Number(e.target.value) }))} /><select className={input} value={editing.billing_type ?? 'monthly'} onChange={(e) => setEditing((p) => ({ ...p, billing_type: e.target.value as PackRecord['billing_type'] }))}><option value="monthly">Mensuel</option><option value="yearly">Annuel</option><option value="custom">Custom</option></select><input className={input} type="number" placeholder="Listings/mois" value={editing.max_events_per_month ?? ''} onChange={(e) => setEditing((p) => ({ ...p, max_events_per_month: e.target.value ? Number(e.target.value) : null }))} /><input className={input} type="number" placeholder="Actifs max" value={editing.max_active_events ?? ''} onChange={(e) => setEditing((p) => ({ ...p, max_active_events: e.target.value ? Number(e.target.value) : null }))} /><textarea className={input + ' lg:col-span-2'} placeholder="Fonctionnalités (une par ligne)" value={Array.isArray(editing.features) ? editing.features.join('\n') : String(editing.features ?? '')} onChange={(e) => setEditing((p) => ({ ...p, features: e.target.value }))} /><textarea className={input} placeholder="Description" value={editing.description ?? ''} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} /><div className="lg:col-span-2"><MediaField label="Image / icône du pack" value={editing.image} onChange={(value) => setEditing((p) => ({ ...p, image: value }))} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing((p) => ({ ...p, is_active: e.target.checked }))} /> Actif</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing((p) => ({ ...p, is_featured: e.target.checked }))} /> Mis en avant</label><div className="flex gap-2"><button className={btn} type="submit">{editing.id ? 'Mettre à jour' : 'Créer pack'}</button><button className={ghostBtn} type="button" onClick={() => setEditing(defaultPack)}>Réinitialiser</button></div></form>
    <div className="grid gap-4 lg:grid-cols-3">{packs.map((pack) => <article key={pack.id} className={card}><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{pack.name}</h2><p className="text-sm text-slate-300">{pack.code} · {pack.billing_type ?? 'monthly'} · {pack.price ?? 0} MAD</p></div>{pack.is_featured && <span className="rounded-full bg-amber-300 px-2 py-1 text-xs font-bold text-slate-950">Featured</span>}</div>{pack.image && <img src={pack.image} alt="" className="mt-3 h-28 w-full rounded-2xl object-cover" />}<p className="mt-3 text-sm text-slate-300">{pack.description}</p><p className="mt-2 text-sm">Actifs {pack.max_active_events ?? '∞'} · Mois {pack.max_events_per_month ?? '∞'}</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{(Array.isArray(pack.features) ? pack.features : String(pack.features ?? '').split('\n')).map((feature) => feature && <li key={feature}>{feature}</li>)}</ul><div className="mt-4 flex flex-wrap gap-2"><button className={ghostBtn} onClick={() => setEditing(pack)}>Éditer</button><button className={ghostBtn} onClick={() => void producerPacksService.updatePack(pack.id, { is_active: !pack.is_active }).then(load)}>{pack.is_active ? 'Désactiver' : 'Activer'}</button><button className={dangerBtn} onClick={() => void producerPacksService.deletePack(pack.id).then(load)}>Supprimer</button></div></article>)}</div></section>;
}

export function ProducerDashboardPackPage(): JSX.Element {
  const [dashboard, setDashboard] = useState<ProducerDashboardData>(defaultDashboard);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setDashboard(await producerPacksService.getDashboard());
      } catch {
        setError('Service pack indisponible. Mode local sécurisé activé.');
        setDashboard(defaultDashboard);
      }
    };
    void load();
  }, []);

  return (
    <section className="space-y-3 rounded-3xl border border-white/10 bg-[#041743] p-4">
      <h1 className="text-2xl font-bold">Dashboard Producteur</h1>
      {error && <p className="rounded bg-yellow-500/20 p-2 text-sm text-yellow-100">{error}</p>}
      <p>Producteur: {dashboard.producer?.name ?? 'Aucun profil lié'}</p>
      <p>Pack: {dashboard.pack?.name ?? 'Aucun pack actif'}</p>
      <p>Quota mensuel: {dashboard.quota.used_events_this_month}/{dashboard.quota.max_events_per_month ?? '∞'}</p>
      <p>Quota événements actifs: {dashboard.quota.active_events_count}/{dashboard.quota.max_active_events ?? '∞'}</p>
      <p>Création autorisée: {dashboard.quota.can_create_event ? 'Oui' : 'Non'}</p>
      <Link className="underline" to="/ma-fr/producer/events/new">Créer un événement (quota check)</Link>
    </section>
  );
}

export function ProducerCreateEventPage(): JSX.Element {
  const navigate = useNavigate();
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [publicSlug, setPublicSlug] = useState('');

  useEffect(() => {
    const loadDashboard = async (): Promise<void> => {
      try {
        const data = await producerPacksService.getDashboard();
        if (!data.quota.can_create_event) {
          setWarning('Attention: quota pack atteint. La création peut être refusée.');
        }
      } catch {
        setWarning('Impossible de vérifier le quota maintenant. Vous pouvez continuer en mode sûr.');
      }
    };
    void loadDashboard();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    setOk('');

    const fd = new FormData(event.currentTarget);
    const status = String(fd.get('status') ?? 'draft');
    const payload = {
      title: String(fd.get('title') ?? ''),
      slug: String(fd.get('slug') ?? ''),
      category_id: Number(fd.get('category_id') ?? 1),
      city_id: Number(fd.get('city_id') ?? 1),
      city_name: String(fd.get('city_name') ?? ''),
      venue: String(fd.get('venue') ?? ''),
      short_description: String(fd.get('short_description') ?? ''),
      description: String(fd.get('description') ?? ''),
      event_date: String(fd.get('event_date') ?? ''),
      event_time: String(fd.get('event_time') ?? ''),
      featured_image: String(fd.get('featured_image') ?? ''),
      ticket_types: [
        {
          name: String(fd.get('ticket_name') ?? 'Standard'),
          stock: Number(fd.get('ticket_stock') ?? 0),
          price: Number(fd.get('price_mad') ?? 0),
        },
      ],
      starts_at: String(fd.get('starts_at') ?? ''),
      price_mad: Number(fd.get('price_mad') ?? 0),
      image_url: String(fd.get('image_url') ?? ''),
      status,
    };

    try {
      const result = await producerPacksService.createOwnEvent(payload) as { event?: { slug?: string } };
      setPublicSlug(result?.event?.slug ?? payload.slug);
      setOk('Événement créé avec succès.');
      if (status === 'published') {
        setTimeout(() => navigate('/ma-fr/organizer/events'), 900);
      }
    } catch (e) {
      setError((e as Error).message || 'Création impossible. Vérifiez votre quota et réessayez.');
    }
  };

  return (
    <section className="space-y-3 rounded-3xl border border-white/10 bg-[#041743] p-4">
      <h1 className="text-2xl font-bold">Créer un événement (Producteur)</h1>
      {warning && <p className="rounded bg-yellow-500/20 p-2 text-sm text-yellow-100">{warning}</p>}
      {error && <p className="rounded bg-red-500/20 p-2 text-sm text-red-200">{error}</p>}
      {ok && <p className="rounded bg-emerald-500/20 p-2 text-sm text-emerald-100">{ok}</p>}
      {publicSlug && <Link to={`/ma-fr/event/${publicSlug}`} className="inline-flex rounded bg-white/10 px-3 py-1 text-sm">Voir la page publique</Link>}
      <form className="grid gap-2" onSubmit={(e) => void onSubmit(e)}>
        <input className="rounded bg-white/10 p-2" name="title" placeholder="Titre" required />
        <input className="rounded bg-white/10 p-2" name="slug" placeholder="Slug" required />
        <input className="rounded bg-white/10 p-2" name="category_id" type="number" min={1} defaultValue={1} required />
        <input className="rounded bg-white/10 p-2" name="city_id" type="number" min={1} defaultValue={1} required />
        <input className="rounded bg-white/10 p-2" name="city_name" placeholder="Ville" required />
        <input className="rounded bg-white/10 p-2" name="venue" placeholder="Lieu / salle" required />
        <input className="rounded bg-white/10 p-2" name="event_date" type="date" required />
        <input className="rounded bg-white/10 p-2" name="event_time" type="time" required />
        <textarea className="rounded bg-white/10 p-2" name="short_description" placeholder="Description courte" required />
        <textarea className="rounded bg-white/10 p-2" name="description" placeholder="Description" required />
        <input className="rounded bg-white/10 p-2" name="starts_at" type="datetime-local" required />
        <input className="rounded bg-white/10 p-2" name="image_url" placeholder="Image URL" />
        <input className="rounded bg-white/10 p-2" name="featured_image" placeholder="Image mise en avant URL" />
        <input className="rounded bg-white/10 p-2" name="ticket_name" placeholder="Type de ticket" defaultValue="Standard" required />
        <input className="rounded bg-white/10 p-2" name="ticket_stock" type="number" min={1} defaultValue={100} required />
        <input className="rounded bg-white/10 p-2" name="price_mad" type="number" min={0} step="0.01" defaultValue={0} required />
        <select className="rounded bg-white/10 p-2" name="status" defaultValue="draft">
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
        </select>
        <button className="rounded bg-white px-3 py-2 text-[#041743]" type="submit">Créer</button>
      </form>
      <Link className="underline" to="/ma-fr/producer/dashboard">Retour dashboard</Link>
    </section>
  );
}
