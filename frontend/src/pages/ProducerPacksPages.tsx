import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { producerPacksService, PackRecord, ProducerDashboardData, ProducerRecord } from '../services/producerPacks';

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

export function AdminProducersPage(): JSX.Element {
  const [producers, setProducers] = useState<ProducerRecord[]>([]);
  const [packs, setPacks] = useState<PackRecord[]>([]);
  const [error, setError] = useState('');

  const load = async (): Promise<void> => {
    try {
      setError('');
      const [nextProducers, nextPacks] = await Promise.all([
        producerPacksService.listProducers(),
        producerPacksService.listPacks(),
      ]);
      setProducers(nextProducers);
      setPacks(nextPacks);
    } catch (e) {
      setError((e as Error).message || 'Impossible de charger les producteurs pour le moment.');
      setProducers([]);
      setPacks([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#041743] p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Admin · Producteurs</h1>
        <Link className="rounded bg-white px-3 py-1 text-[#041743]" to="/ma-fr/admin/producers/new">Nouveau fournisseur</Link>
      </div>
      {error && <p className="rounded bg-red-500/20 p-2 text-sm text-red-200">{error}</p>}
      <div className="space-y-2">
        {producers.map((producer) => (
          <div key={producer.id} className="rounded bg-white/5 p-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{producer.name}</strong>
              <span>{producer.slug}</span>
              <span>{producer.email ?? 'Sans email'}</span>
              <span>{producer.is_active ? 'actif' : 'inactif'}</span>
              <Link className="rounded bg-white/10 px-2" to={`/ma-fr/admin/producers/new?producerId=${producer.id}`}>éditer</Link>
              <button
                className="rounded bg-white/10 px-2"
                onClick={async () => {
                  try {
                    await producerPacksService.updateProducer(producer.id, { is_active: !producer.is_active });
                    await load();
                  } catch (e) {
                    setError((e as Error).message || 'Mise à jour impossible.');
                  }
                }}
              >
                {producer.is_active ? 'désactiver' : 'activer'}
              </button>
              <Link className="rounded bg-white/10 px-2" to={`/ma-fr/event/producer/${producer.slug}`}>page publique</Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  className="rounded border border-white/20 px-2 py-1"
                  onClick={async () => {
                    try {
                      await producerPacksService.assignPack(producer.id, pack.id);
                      setError('');
                    } catch (e) {
                      setError((e as Error).message || 'Assignation pack impossible.');
                    }
                  }}
                >
                  Pack: {pack.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link className="underline" to="/ma-fr/admin/packs">Aller vers packs</Link>
    </section>
  );
}

interface ProducerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  name: string;
  slug: string;
  logo: string;
  cover_image: string;
  city: string;
  address: string;
  support_email: string;
  support_phone: string;
  description: string;
  is_active: boolean;
  pack_id: number | '';
  subscription_starts_at: string;
  subscription_ends_at: string;
}

const defaultProducerForm: ProducerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  name: '',
  slug: '',
  logo: '',
  cover_image: '',
  city: '',
  address: '',
  support_email: '',
  support_phone: '',
  description: '',
  is_active: true,
  pack_id: '',
  subscription_starts_at: '',
  subscription_ends_at: '',
};

export function AdminProducerCreatePage(): JSX.Element {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<PackRecord[]>([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState<ProducerFormValues>(defaultProducerForm);
  const canSubmit = useMemo(() => !!form.name && !!form.slug && !!form.firstName && !!form.lastName && !!form.email, [form]);

  useEffect(() => {
    producerPacksService.listPacks().then(setPacks).catch(() => setPacks([]));
  }, []);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError('');
    setOk('');
    try {
      const producer = await producerPacksService.createProducer({
        ...form,
      });
      if (form.pack_id) {
        await producerPacksService.assignPack(producer.id, Number(form.pack_id));
      }
      setOk('Fournisseur créé avec succès.');
      navigate('/ma-fr/admin/producers');
    } catch (e) {
      setError((e as Error).message || 'Création du fournisseur impossible.');
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#041743] p-4">
      <h1 className="text-2xl font-bold">Nouveau fournisseur</h1>
      {error && <p className="rounded bg-red-500/20 p-2 text-sm text-red-200">{error}</p>}
      {ok && <p className="rounded bg-emerald-500/20 p-2 text-sm text-emerald-100">{ok}</p>}
      <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => void submit(e)}>
        <input className="rounded bg-white/10 p-2" placeholder="Prénom" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
        <input className="rounded bg-white/10 p-2" placeholder="Nom de famille" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
        <input className="rounded bg-white/10 p-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
        <input className="rounded bg-white/10 p-2" type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
        <input className="rounded bg-white/10 p-2" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
        <input className="rounded bg-white/10 p-2" placeholder="Nom de l'entreprise" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
        <input className="rounded bg-white/10 p-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} required />
        <select className="rounded bg-white/10 p-2" value={form.is_active ? '1' : '0'} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.value === '1' }))}><option value="1">Actif</option><option value="0">Inactif</option></select>
        <input className="rounded bg-white/10 p-2" placeholder="Logo URL" value={form.logo} onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))} />
        <input className="rounded bg-white/10 p-2" placeholder="Cover image URL" value={form.cover_image} onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))} />
        <input className="rounded bg-white/10 p-2" placeholder="Ville" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
        <input className="rounded bg-white/10 p-2" placeholder="Adresse" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
        <input className="rounded bg-white/10 p-2" placeholder="Support email" value={form.support_email} onChange={(e) => setForm((prev) => ({ ...prev, support_email: e.target.value }))} />
        <input className="rounded bg-white/10 p-2" placeholder="Support téléphone" value={form.support_phone} onChange={(e) => setForm((prev) => ({ ...prev, support_phone: e.target.value }))} />
        <textarea className="rounded bg-white/10 p-2 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        <select className="rounded bg-white/10 p-2" value={form.pack_id} onChange={(e) => setForm((prev) => ({ ...prev, pack_id: e.target.value ? Number(e.target.value) : '' }))}>
          <option value="">Sélectionner un pack</option>
          {packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
        </select>
        <input className="rounded bg-white/10 p-2" type="date" value={form.subscription_starts_at} onChange={(e) => setForm((prev) => ({ ...prev, subscription_starts_at: e.target.value }))} />
        <input className="rounded bg-white/10 p-2" type="date" value={form.subscription_ends_at} onChange={(e) => setForm((prev) => ({ ...prev, subscription_ends_at: e.target.value }))} />
        <div className="md:col-span-2 flex gap-2">
          <button className="rounded bg-white px-3 py-2 text-[#041743] disabled:opacity-50" disabled={!canSubmit} type="submit">Créer fournisseur</button>
          <Link to="/ma-fr/admin/producers" className="rounded border border-white/20 px-3 py-2">Retour</Link>
        </div>
      </form>
    </section>
  );
}

export function AdminPacksPage(): JSX.Element {
  const [packs, setPacks] = useState<PackRecord[]>([]);
  const [error, setError] = useState('');

  const load = async (): Promise<void> => {
    try {
      setError('');
      setPacks(await producerPacksService.listPacks());
    } catch (e) {
      setError((e as Error).message || 'Impossible de charger les packs.');
      setPacks([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#041743] p-4">
      <h1 className="text-2xl font-bold">Admin · Packs</h1>
      {error && <p className="rounded bg-red-500/20 p-2 text-sm text-red-200">{error}</p>}
      <button
        className="rounded bg-white px-3 py-1 text-[#041743]"
        onClick={async () => {
          try {
            await producerPacksService.createPack({
              name: 'Pack Standard',
              code: `PACK-${Date.now()}`,
              max_events_per_month: 5,
              max_active_events: 3,
              is_active: true,
            });
            await load();
          } catch (e) {
            setError((e as Error).message || 'Création pack impossible.');
          }
        }}
      >
        Ajouter pack
      </button>
      {packs.map((pack) => (
        <div key={pack.id} className="flex flex-wrap items-center gap-2 rounded bg-white/5 p-2 text-sm">
          <strong>{pack.name}</strong>
          <span>{pack.code}</span>
          <span>Mensuel: {pack.max_events_per_month ?? '∞'}</span>
          <span>Actifs: {pack.max_active_events ?? '∞'}</span>
          <button
            className="rounded bg-white/10 px-2"
            onClick={async () => {
              try {
                await producerPacksService.updatePack(pack.id, { is_active: !pack.is_active });
                await load();
              } catch (e) {
                setError((e as Error).message || 'Mise à jour pack impossible.');
              }
            }}
          >
            toggle actif
          </button>
          <button
            className="rounded bg-red-500/20 px-2"
            onClick={async () => {
              try {
                await producerPacksService.deletePack(pack.id);
                await load();
              } catch (e) {
                setError((e as Error).message || 'Suppression pack impossible.');
              }
            }}
          >
            supprimer
          </button>
        </div>
      ))}
      <Link className="underline" to="/ma-fr/admin/producers">Aller vers producteurs</Link>
    </section>
  );
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
