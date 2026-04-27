import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <h1 className="text-2xl font-bold">Admin · Producteurs</h1>
      {error && <p className="rounded bg-red-500/20 p-2 text-sm text-red-200">{error}</p>}
      <button
        className="rounded bg-white px-3 py-1 text-[#041743]"
        onClick={async () => {
          try {
            await producerPacksService.createProducer({ name: 'Nouveau Producteur', slug: `producer-${Date.now()}`, is_active: true });
            await load();
          } catch (e) {
            setError((e as Error).message || 'Création impossible pour le moment.');
          }
        }}
      >
        Ajouter producteur
      </button>
      <div className="space-y-2">
        {producers.map((producer) => (
          <div key={producer.id} className="rounded bg-white/5 p-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{producer.name}</strong>
              <span>{producer.slug}</span>
              <span>{producer.email ?? 'Sans email'}</span>
              <span>{producer.is_active ? 'actif' : 'inactif'}</span>
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
                toggle actif
              </button>
              <button
                className="rounded bg-red-500/20 px-2"
                onClick={async () => {
                  try {
                    await producerPacksService.deleteProducer(producer.id);
                    await load();
                  } catch (e) {
                    setError((e as Error).message || 'Suppression impossible.');
                  }
                }}
              >
                supprimer
              </button>
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
                  Assigner: {pack.name}
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
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

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
    const payload = {
      title: String(fd.get('title') ?? ''),
      category_id: Number(fd.get('category_id') ?? 1),
      city_id: Number(fd.get('city_id') ?? 1),
      venue: String(fd.get('venue') ?? ''),
      description: String(fd.get('description') ?? ''),
      starts_at: String(fd.get('starts_at') ?? ''),
      price_mad: Number(fd.get('price_mad') ?? 0),
    };

    try {
      await producerPacksService.createOwnEvent(payload);
      setOk('Événement créé avec succès.');
      event.currentTarget.reset();
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
      <form className="grid gap-2" onSubmit={(e) => void onSubmit(e)}>
        <input className="rounded bg-white/10 p-2" name="title" placeholder="Titre" required />
        <input className="rounded bg-white/10 p-2" name="category_id" type="number" min={1} defaultValue={1} required />
        <input className="rounded bg-white/10 p-2" name="city_id" type="number" min={1} defaultValue={1} required />
        <input className="rounded bg-white/10 p-2" name="venue" placeholder="Lieu" required />
        <textarea className="rounded bg-white/10 p-2" name="description" placeholder="Description" required />
        <input className="rounded bg-white/10 p-2" name="starts_at" type="datetime-local" required />
        <input className="rounded bg-white/10 p-2" name="price_mad" type="number" min={0} step="0.01" defaultValue={0} required />
        <button className="rounded bg-white px-3 py-2 text-[#041743]" type="submit">Créer</button>
      </form>
      <Link className="underline" to="/ma-fr/producer/dashboard">Retour dashboard</Link>
    </section>
  );
}
