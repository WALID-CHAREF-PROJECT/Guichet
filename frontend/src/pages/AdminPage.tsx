import {
  Component,
  CSSProperties,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, Navigate, NavLink, useLocation } from "react-router-dom";
import {
  backofficeService,
  CategoryModel,
  ContentBlock,
  MovieModel,
  PlanZoneModel,
  TravelModel,
} from "../services/backoffice";
import { useUser } from "../contexts/UserContext";
import { uploadAdminMedia } from "../services/producerPacks";
import {
  AdminCollection,
  AdminData,
  adminPersistence,
} from "../services/adminPersistence";
import { getAuthToken } from "../services/api/authClient";

const menu = [
  { to: "/ma-fr/admin/dashboard", label: "Tableau de bord", icon: "⌘" },
  { to: "/ma-fr/admin/users", label: "Utilisateurs", icon: "👥" },
  { to: "/ma-fr/admin/organizers", label: "Fournisseurs", icon: "🏢" },
  { to: "/ma-fr/admin/events", label: "Événements", icon: "🎟️" },
  { to: "/ma-fr/admin/orders", label: "Commandes", icon: "🧾" },
  { to: "/ma-fr/admin/travels", label: "Voyages", icon: "✈️" },
  { to: "/ma-fr/admin/movies", label: "Films", icon: "🎬" },
  { to: "/ma-fr/admin/categories", label: "Catégories", icon: "🏷️" },
  { to: "/ma-fr/admin/content", label: "Contenu", icon: "🧩" },
  { to: "/ma-fr/admin/producers", label: "Producteurs (packs)", icon: "💼" },
  { to: "/ma-fr/admin/packs", label: "Packs producteurs", icon: "📦" },
  { to: "/ma-fr/admin/settings", label: "Paramètres", icon: "⚙️" },
];
const panel =
  "rounded-[2rem] border border-white/10 bg-white/[0.065] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl";
const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20";
const btn =
  "rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5";
const ghost =
  "rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12";
const danger =
  "rounded-2xl border border-red-300/20 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/25";

type EditableKind = "event" | "travel" | "movie" | "category" | "content";
type Editable = Record<string, any> & { id?: string; kind?: EditableKind };

const theatrePlanZones: PlanZoneModel[] = [
  { id: 'zone-orchestre-vip', name: 'Orchestre VIP', label: 'Premiers rangs premium', price: 650, capacity: 48, availableCapacity: 48, color: '#f59e0b', sortOrder: 0, isAvailable: true },
  { id: 'zone-orchestre', name: 'Orchestre', label: 'Face scène', price: 320, capacity: 220, availableCapacity: 220, color: '#38bdf8', sortOrder: 1, isAvailable: true },
  { id: 'zone-balcon', name: 'Balcon', label: 'Vue surélevée', price: 220, capacity: 160, availableCapacity: 160, color: '#818cf8', sortOrder: 2, isAvailable: true },
  { id: 'zone-mezzanine', name: 'Mezzanine', label: 'Centre mezzanine', price: 260, capacity: 96, availableCapacity: 96, color: '#a78bfa', sortOrder: 3, isAvailable: true },
  { id: 'zone-galerie', name: 'Galerie', label: 'Placement économique', price: 140, capacity: 180, availableCapacity: 180, color: '#14b8a6', sortOrder: 4, isAvailable: true },
];
const stadiumPlanZones: PlanZoneModel[] = [
  { id: 'zone-tribune-nord', name: 'Tribune Nord', label: 'Virage Nord', price: 120, capacity: 1200, availableCapacity: 1200, color: '#22c55e', sortOrder: 0, isAvailable: true },
  { id: 'zone-tribune-sud', name: 'Tribune Sud', label: 'Virage Sud', price: 120, capacity: 1200, availableCapacity: 1200, color: '#14b8a6', sortOrder: 1, isAvailable: true },
  { id: 'zone-tribune-est', name: 'Tribune Est', label: 'Latérale Est', price: 180, capacity: 900, availableCapacity: 900, color: '#3b82f6', sortOrder: 2, isAvailable: true },
  { id: 'zone-tribune-ouest', name: 'Tribune Ouest', label: 'Latérale Ouest', price: 220, capacity: 820, availableCapacity: 820, color: '#6366f1', sortOrder: 3, isAvailable: true },
  { id: 'zone-virage-nord', name: 'Virage Nord', label: 'Supporters Nord', price: 90, capacity: 1600, availableCapacity: 1600, color: '#ef4444', sortOrder: 4, isAvailable: true },
  { id: 'zone-virage-sud', name: 'Virage Sud', label: 'Supporters Sud', price: 90, capacity: 1500, availableCapacity: 1500, color: '#f97316', sortOrder: 5, isAvailable: true },
  { id: 'zone-vip', name: 'VIP', label: 'Loges présidentielles', price: 650, capacity: 120, availableCapacity: 120, color: '#eab308', sortOrder: 6, isAvailable: true },
];
const clonePlanZones = (zones: PlanZoneModel[]): PlanZoneModel[] => zones.map((zone, index) => ({ ...zone, id: `${zone.id}-${Date.now()}-${index}` }));
const inferPlanType = (category?: string): 'theatre' | 'stadium' => {
  const normalized = (category ?? '').toLowerCase();
  if (/(sport|stad|mal3ab|basket|football|match)/.test(normalized)) return 'stadium';
  return 'theatre';
};
const templateForPlanType = (planType?: string): PlanZoneModel[] => planType === 'stadium' ? stadiumPlanZones : theatrePlanZones;
const emptyEvent: Editable = {
  kind: "event",
  title: "",
  slug: "",
  category: "Concerts",
  city: "Casablanca",
  location: "",
  date: "",
  time: "20:00",
  image: "",
  shortDescription: "",
  description: "",
  status: "draft",
  featured: false,
  ticketsSold: 0,
  revenue: 0,
  buyingMode: "ticket",
  hasPlan: false,
  planType: "theatre",
  seatingEnabled: false,
  planZones: [],
  ticketTypes: [{ id: 'ticket-normal', name: 'Normal', price: 150, stock: 300, seatPlanRequired: false }],
};
const emptyTravel: Editable = {
  kind: "travel",
  title: "",
  category: "Voyage organisé",
  destination: "",
  departureDate: "",
  price: 0,
  image: "",
  description: "",
  status: "draft",
  featured: false,
};
const emptyMovie: Editable = {
  kind: "movie",
  title: "",
  genre: "",
  duration: "",
  releaseDate: "",
  cinemas: "",
  poster: "",
  description: "",
  status: "draft",
  featured: false,
  sessions: [{ id: 'session-demo', sessionDate: '', sessionTime: '20:00', cinema: 'Megarama', city: 'Casablanca', hallName: 'Salle 1', price: 70, standardPrice: 70, vipPrice: 100, vvipPrice: 150, reservedSeatCount: 12, seatingEnabled: true, seatTemplate: 'medium', reservedSeats: [] }],
};
const emptyCategory: Editable = {
  kind: "category",
  type: "event",
  name: "",
  slug: "",
  icon: "",
  image: "",
  isActive: true,
  order: 1,
};
const emptyContent: Editable = {
  kind: "content",
  type: "section",
  title: "",
  subtitle: "",
  description: "",
  ctaLabel: "",
  ctaLink: "",
  image: "",
  visible: true,
  order: 1,
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
async function uploadImageWithDevFallback(
  file: File,
  collection: string,
): Promise<string> {
  try {
    return await uploadAdminMedia(file, collection);
  } catch (error) {
    if (import.meta.env.DEV) return fileToDataUrl(file);
    throw error;
  }
}
function MediaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="space-y-2 text-sm text-slate-200">
      <span>{label}</span>
      <input
        className={input}
        placeholder="URL image ou chemin média"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        className={input}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file)
            void uploadImageWithDevFallback(file, "admin-media").then(onChange);
        }}
      />
      {value ? (
        <img
          src={value}
          alt={`Aperçu ${label}`}
          className="h-32 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-slate-400">
          Aperçu média
        </div>
      )}
    </label>
  );
}
function Shell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  const { logout } = useUser();
  const [open, setOpen] = useState(false);
  return (
    <section className="grid min-h-[70vh] gap-6 text-white lg:grid-cols-[292px_1fr]">
      <aside
        className={`${open ? "block" : "hidden"} ${panel} sticky top-4 h-fit bg-gradient-to-b from-slate-950 via-[#071d55] to-slate-950 lg:block`}
      >
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-cyan-300/15 to-blue-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">
            TicketFlow
          </p>
          <h2 className="text-2xl font-black">Backoffice</h2>
        </div>
        <nav className="space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${isActive ? "bg-white text-[#041743] shadow-lg shadow-cyan-200/20" : "text-slate-200 hover:bg-white/10"}`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-5 w-full rounded-2xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-red-100"
        >
          Déconnexion
        </button>
      </aside>
      <main className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#061a4d] via-slate-950 to-[#071d55] p-6 shadow-2xl shadow-black/30">
          <button
            onClick={() => setOpen((v) => !v)}
            className={ghost + " lg:hidden"}
          >
            Menu
          </button>
          <p className="mt-3 text-sm uppercase tracking-[0.28em] text-cyan-200/70">
            Administration premium
          </p>
          <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
        </div>
        {children}
      </main>
    </section>
  );
}
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}): JSX.Element {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/12 to-white/[0.04] p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15 text-xl">
        {icon}
      </div>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </article>
  );
}

type LoadState = "idle" | "loading" | "ready" | "error";

const sectionCollections: Record<string, AdminCollection[]> = {
  dashboard: ["organizers", "events", "orders", "travels", "movies", "content"],
  admin: ["organizers", "events", "orders", "travels", "movies", "content"],
  users: ["users"],
  organizers: ["organizers"],
  events: ["events"],
  orders: ["orders"],
  travels: ["travels"],
  movies: ["movies"],
  categories: ["categories"],
  content: ["content"],
  settings: ["settings"],
};

function LoadingBanner({ label }: { label: string }): JSX.Element {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
      Chargement de {label}…
    </div>
  );
}

function RetryNotice({ onRetry }: { onRetry: () => void }): JSX.Element {
  return (
    <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          Impossible de récupérer les dernières données depuis l’API. Les
          données locales restent affichées si disponibles.
        </p>
        <button className={ghost} onClick={onRetry} type="button">
          Réessayer
        </button>
      </div>
    </div>
  );
}

function EmptyState(): JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-sm text-slate-300">
      Aucune donnée trouvée
    </div>
  );
}

function SkeletonLine({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): JSX.Element {
  return (
    <div
      className={`animate-pulse rounded-full bg-white/10 ${className}`}
      style={style}
    />
  );
}

function CardSkeletonGrid({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className={panel}>
          <div className="flex gap-4">
            <SkeletonLine className="h-16 w-16 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <SkeletonLine className="h-5 w-2/3" />
              <SkeletonLine className="h-4 w-1/2" />
            </div>
          </div>
          <SkeletonLine className="mt-5 h-4 w-full" />
          <SkeletonLine className="mt-3 h-4 w-4/5" />
        </article>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }): JSX.Element {
  return (
    <div className={`${panel} space-y-3`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-2xl bg-white/[0.04] p-3">
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonLine className="h-10 w-16 rounded-xl" />
            <div className="min-w-[180px] flex-1 space-y-2">
              <SkeletonLine className="h-4 w-1/2" />
              <SkeletonLine className="h-3 w-1/3" />
            </div>
            <SkeletonLine className="h-9 w-20 rounded-2xl" />
            <SkeletonLine className="h-9 w-24 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className={panel}>
            <SkeletonLine className="h-11 w-11 rounded-2xl" />
            <SkeletonLine className="mt-4 h-4 w-2/3" />
            <SkeletonLine className="mt-3 h-8 w-1/2" />
          </article>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className={panel}>
          <SkeletonLine className="h-6 w-44" />
          <div className="mt-5 flex h-56 items-end gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLine
                key={index}
                className="w-full rounded-t-2xl"
                style={{ height: `${35 + index * 8}%` }}
              />
            ))}
          </div>
        </section>
        <section className={`${panel} space-y-3`}>
          <SkeletonLine className="h-6 w-40" />
          <SkeletonLine className="h-11 w-full rounded-2xl" />
          <SkeletonLine className="h-11 w-full rounded-2xl" />
          <SkeletonLine className="h-11 w-full rounded-2xl" />
        </section>
      </div>
    </>
  );
}

class AdminPageErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  render(): ReactNode {
    return this.state.hasError ? (
      <Shell title="Tableau de bord admin">
        <div className={panel}>
          Impossible de charger le tableau de bord admin.
        </div>
      </Shell>
    ) : (
      this.props.children
    );
  }
}

export default function AdminPage(): JSX.Element {
  return (
    <AdminPageErrorBoundary>
      <AdminPageContent />
    </AdminPageErrorBoundary>
  );
}
function AdminPageContent(): JSX.Element {
  const { pathname } = useLocation();
  const { user } = useUser();
  const token = getAuthToken();
  const isAuthenticatedAdmin = Boolean(token && user?.role === "admin");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [editing, setEditing] = useState<Editable | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [db, setDb] = useState<AdminData>(() => ({
    ...backofficeService.getAdminData(),
    users: [],
    source: "local-fallback",
    failedCollections: [],
  }));
  useEffect(() => {
    if (!isAuthenticatedAdmin) return;
    let cancelled = false;
    setLoadState("loading");
    setLoadError(null);
    void adminPersistence
      .load()
      .then((nextDb) => {
        if (!cancelled) {
          setDb(nextDb);
          setLoadState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Impossible de charger les données admin.",
          );
          setLoadState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticatedAdmin, refreshNonce]);
  const refresh = (): void => setRefreshNonce((n) => n + 1);
  if (!isAuthenticatedAdmin) return <Navigate to="/ma-fr/login" replace />;
  const section = pathname.split("/")[3] ?? "dashboard";
  const retry = (): void => refresh();
  const sectionFailures = sectionCollections[section] ?? ["settings"];
  const hasSectionFailure = sectionFailures.some((collection) =>
    db.failedCollections?.includes(collection),
  );
  const isLoading = loadState === "loading";
  const sectionStatus = (label: string, skeleton: ReactNode): ReactNode => {
    if (loadState === "loading") {
      return (
        <>
          <LoadingBanner label={label} />
          {skeleton}
        </>
      );
    }
    if (loadState === "error") {
      return (
        <>
          <RetryNotice onRetry={retry} />
          {loadError && (
            <p className="text-sm text-amber-100/80">{loadError}</p>
          )}
          {skeleton}
        </>
      );
    }
    if (hasSectionFailure) return <RetryNotice onRetry={retry} />;
    return null;
  };
  const users = db.users;
  const revenue = db.orders.reduce((sum, order) => sum + order.total, 0);
  const revenueSeries = useMemo(
    () =>
      db.orders.slice(0, 6).map((order) => ({
        label: order.createdAt.slice(5, 10),
        value: order.total,
      })),
    [db.orders],
  );
  const saveEditable = (event: FormEvent): void => {
    event.preventDefault();
    if (!editing?.kind) return;
    const done = (): void => {
      setEditing(null);
      refresh();
    };
    if (editing.kind === "event")
      void adminPersistence
        .saveEvent(editing as any)
        .then(done);
    if (editing.kind === "travel")
      void adminPersistence
        .saveTravel(editing as Omit<TravelModel, "id"> & { id?: string })
        .then(done);
    if (editing.kind === "movie")
      void adminPersistence
        .saveMovie(editing as Omit<MovieModel, "id"> & { id?: string })
        .then(done);
    if (editing.kind === "category")
      void adminPersistence
        .saveCategory(editing as Omit<CategoryModel, "id"> & { id?: string })
        .then(done);
    if (editing.kind === "content")
      void adminPersistence
        .saveContent(editing as Omit<ContentBlock, "id"> & { id?: string })
        .then(done);
  };
  if (section === "dashboard" || section === "admin")
    return (
      <Shell title="Tableau de bord">
        {sectionStatus("du tableau de bord", <DashboardSkeleton />)}
        {!isLoading && revenueSeries.length === 0 && <EmptyState />}
        {!isLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Producteurs"
                value={String(db.organizers.length)}
                icon="🏢"
              />
              <StatCard
                label="Événements"
                value={String(db.events.length)}
                icon="🎟️"
              />
              <StatCard
                label="Revenu"
                value={`${revenue.toLocaleString()} MAD`}
                icon="💳"
              />
              <StatCard
                label="Listings actifs"
                value={String(
                  db.events.filter((e) => e.status === "published").length +
                    db.travels.filter((t) => t.status === "published").length +
                    db.movies.filter((m) => m.status === "published").length,
                )}
                icon="⚡"
              />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <section className={panel}>
                <h2 className="text-xl font-bold">Revenus récents</h2>
                <div className="mt-5 flex h-56 items-end gap-3">
                  {revenueSeries.map((bar) => (
                    <div
                      key={bar.label}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-blue-500 to-cyan-300"
                        style={{
                          height: `${Math.max(18, Math.min(100, (bar.value / Math.max(1, revenue)) * 420))}%`,
                        }}
                      />
                      <span className="text-xs text-slate-400">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section className={panel}>
                <h2 className="text-xl font-bold">Actions rapides</h2>
                <div className="mt-4 grid gap-2">
                  <Link className={ghost} to="/ma-fr/admin/producers/new">
                    Créer fournisseur
                  </Link>
                  <Link className={ghost} to="/ma-fr/admin/packs">
                    Créer pack
                  </Link>
                  <button
                    className={ghost}
                    onClick={() =>
                      setEditing({
                        ...emptyContent,
                        order: db.content.length + 1,
                      })
                    }
                  >
                    Ajouter bloc contenu
                  </button>
                  <button
                    className={ghost}
                    onClick={() => setEditing({ ...emptyEvent })}
                  >
                    Ajouter événement
                  </button>
                  <button
                    className={ghost}
                    onClick={() => setEditing({ ...emptyTravel })}
                  >
                    Ajouter voyage
                  </button>
                </div>
              </section>
            </div>
            {editing && (
              <Editor
                editing={editing}
                setEditing={setEditing}
                saveEditable={saveEditable}
              />
            )}
          </>
        )}
      </Shell>
    );
  if (section === "users")
    return (
      <Shell title="Utilisateurs">
        {sectionStatus("des utilisateurs", <TableSkeleton />)}
        {!isLoading && (
          <div className={panel}>
            {users.length === 0 ? (
              <EmptyState />
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm"
                >
                  <span>
                    {user.firstName ?? user.email} · {user.email} · {user.role}
                  </span>
                  <button
                    className={danger}
                    onClick={() =>
                      adminPersistence.deleteUser(user.id).then(refresh)
                    }
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </Shell>
    );
  if (section === "organizers")
    return (
      <Shell title="Fournisseurs">
        {sectionStatus("des fournisseurs", <CardSkeletonGrid />)}
        {!isLoading && (
          <div className="grid gap-4 xl:grid-cols-2">
            {db.organizers.length === 0 ? (
              <EmptyState />
            ) : (
              db.organizers.map((o) => (
                <article key={o.id} className={panel}>
                  <div className="flex gap-4">
                    <img
                      src={o.logo || o.coverImage}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{o.companyName}</h2>
                      <p className="text-sm text-slate-300">
                        {o.city} · /{o.slug}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{o.description}</p>
                  <button
                    className={ghost + " mt-3"}
                    onClick={() =>
                      adminPersistence
                        .updateOrganizer(o.id, { isApproved: !o.isApproved })
                        .then(refresh)
                    }
                  >
                    {o.isApproved ? "Désapprouver" : "Approuver"}
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </Shell>
    );
  if (section === "events")
    return (
      <Shell title="Événements">
        {sectionStatus("des événements", <TableSkeleton />)}
        {!isLoading && (
          <div className={panel}>
            <button className={btn + " mb-4"} onClick={() => setEditing({ ...emptyEvent })}>Créer événement</button>
            {db.events.length === 0 ? (
              <EmptyState />
            ) : (
              db.events.map((e) => (
                <div
                  key={e.id}
                  className="mb-2 flex flex-wrap items-center gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm"
                >
                  <strong>{e.title}</strong>
                  <span>{e.status}</span>
                  {e.buyingMode === "plan" && <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-100">Plan interactif · {e.planType}</span>}
                  <button
                    className={ghost}
                    onClick={() =>
                      adminPersistence
                        .updateEvent(e.id, {
                          status:
                            e.status === "published" ? "draft" : "published",
                        })
                        .then(refresh)
                    }
                  >
                    Publier / retirer
                  </button>
                  <button
                    className={ghost}
                    onClick={() =>
                      adminPersistence
                        .updateEvent(e.id, { featured: !e.featured })
                        .then(refresh)
                    }
                  >
                    Feature
                  </button>
                  <button
                    className={ghost}
                    onClick={() => setEditing({ ...e, kind: "event" })}
                  >
                    Modifier
                  </button>
                  <button
                    className={danger}
                    onClick={() =>
                      adminPersistence.deleteEvent(e.id).then(refresh)
                    }
                  >
                    Supprimer
                  </button>
                  <Link className={ghost} to={`/ma-fr/event/${e.slug}`}>
                    Ouvrir
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
        {editing && (
          <Editor
            editing={editing}
            setEditing={setEditing}
            saveEditable={saveEditable}
          />
        )}
      </Shell>
    );
  if (section === "orders")
    return (
      <Shell title="Commandes">
        {sectionStatus("des commandes", <TableSkeleton />)}
        {!isLoading && (
          <div className={panel}>
            {db.orders.length === 0 ? (
              <EmptyState />
            ) : (
              db.orders.map((o) => (
                <div
                  key={o.id}
                  className="mb-2 rounded-2xl bg-white/[0.04] p-3 text-sm"
                >
                  {o.reference} · {o.customerName} · {o.productName} · {o.total}{" "}
                  MAD · {o.paymentStatus}
                </div>
              ))
            )}
          </div>
        )}
      </Shell>
    );
  if (section === "travels")
    return (
      <Shell title="Voyages">
        {sectionStatus("des voyages", <TableSkeleton />)}
        {!isLoading && (
          <CrudList
            title="Gestion voyages"
            items={db.travels}
            imageKey="image"
            onNew={() => setEditing({ ...emptyTravel })}
            onEdit={(item) => setEditing({ ...item, kind: "travel" })}
            onToggle={(item) =>
              adminPersistence
                .updateTravel(item.id, {
                  status: item.status === "published" ? "draft" : "published",
                })
                .then(refresh)
            }
            onFeature={(item) =>
              adminPersistence
                .updateTravel(item.id, { featured: !item.featured })
                .then(refresh)
            }
            onDelete={(item) =>
              adminPersistence.deleteTravel(item.id).then(refresh)
            }
          />
        )}
        {editing && (
          <Editor
            editing={editing}
            setEditing={setEditing}
            saveEditable={saveEditable}
          />
        )}
      </Shell>
    );
  if (section === "movies")
    return (
      <Shell title="Films">
        {sectionStatus("des films", <TableSkeleton />)}
        {!isLoading && (
          <CrudList
            title="Gestion films"
            items={db.movies}
            imageKey="poster"
            onNew={() => setEditing({ ...emptyMovie })}
            onEdit={(item) => setEditing({ ...item, kind: "movie" })}
            onToggle={(item) =>
              adminPersistence
                .updateMovie(item.id, {
                  status: item.status === "published" ? "draft" : "published",
                })
                .then(refresh)
            }
            onFeature={(item) =>
              adminPersistence
                .updateMovie(item.id, { featured: !item.featured })
                .then(refresh)
            }
            onDelete={(item) =>
              adminPersistence.deleteMovie(item.id).then(refresh)
            }
          />
        )}
        {editing && (
          <Editor
            editing={editing}
            setEditing={setEditing}
            saveEditable={saveEditable}
          />
        )}
      </Shell>
    );
  if (section === "categories")
    return (
      <Shell title="Catégories">
        {sectionStatus("des catégories", <TableSkeleton />)}
        {!isLoading && (
          <CrudList
            title="Category management"
            items={db.categories}
            imageKey="image"
            onNew={() =>
              setEditing({ ...emptyCategory, order: db.categories.length + 1 })
            }
            onEdit={(item) => setEditing({ ...item, kind: "category" })}
            onToggle={(item) =>
              adminPersistence
                .updateCategory(item.id, { isActive: !item.isActive })
                .then(refresh)
            }
            onFeature={(item) =>
              adminPersistence
                .updateCategory(item.id, { order: Math.max(1, item.order - 1) })
                .then(refresh)
            }
            onDelete={(item) =>
              adminPersistence.deleteCategory(item.id).then(refresh)
            }
          />
        )}
        {editing && (
          <Editor
            editing={editing}
            setEditing={setEditing}
            saveEditable={saveEditable}
          />
        )}
      </Shell>
    );
  if (section === "content")
    return (
      <Shell title="Contenu">
        {sectionStatus("du contenu", <TableSkeleton />)}
        {!isLoading && (
          <CrudList
            title="Homepage content"
            items={db.content}
            imageKey="image"
            onNew={() =>
              setEditing({ ...emptyContent, order: db.content.length + 1 })
            }
            onEdit={(item) => setEditing({ ...item, kind: "content" })}
            onToggle={(item) =>
              adminPersistence
                .updateContent(item.id, { visible: !item.visible })
                .then(refresh)
            }
            onFeature={(item) =>
              adminPersistence
                .updateContent(item.id, { order: Math.max(1, item.order - 1) })
                .then(refresh)
            }
            onDelete={(item) =>
              adminPersistence.deleteContent(item.id).then(refresh)
            }
          />
        )}
        {editing && (
          <Editor
            editing={editing}
            setEditing={setEditing}
            saveEditable={saveEditable}
          />
        )}
      </Shell>
    );
  return (
    <Shell title="Paramètres">
      {sectionStatus("des paramètres", <TableSkeleton rows={2} />)}
      {!isLoading && (
        <div className={panel}>
          <label className="block text-sm">
            Branding
            <input
              defaultValue={db.settings.platformName}
              onBlur={(e) =>
                adminPersistence
                  .updateSettings({ platformName: e.target.value })
                  .then(refresh)
              }
              className={input + " mt-1"}
            />
          </label>
          <label className="mt-4 block text-sm">
            Support email
            <input
              defaultValue={db.settings.supportEmail}
              onBlur={(e) =>
                adminPersistence
                  .updateSettings({ supportEmail: e.target.value })
                  .then(refresh)
              }
              className={input + " mt-1"}
            />
          </label>
        </div>
      )}
    </Shell>
  );
}
function CrudList<
  T extends {
    id: string;
    title?: string;
    name?: string;
    status?: string;
    featured?: boolean;
    isActive?: boolean;
    visible?: boolean;
    order?: number;
  },
>({
  title,
  items,
  imageKey,
  onNew,
  onEdit,
  onToggle,
  onFeature,
  onDelete,
}: {
  title: string;
  items: T[];
  imageKey: keyof T;
  onNew: () => void;
  onEdit: (item: T) => void;
  onToggle: (item: T) => void;
  onFeature: (item: T) => void;
  onDelete: (item: T) => void;
}): JSX.Element {
  return (
    <section className={panel}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <button className={btn} onClick={onNew}>
          Créer
        </button>
      </div>
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.04] p-3"
            >
              <img
                src={String(
                  item[imageKey] ||
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=240&q=80",
                )}
                className="h-14 w-20 rounded-xl object-cover"
              />
              <div className="min-w-[180px] flex-1">
                <h3 className="font-bold">{item.title ?? item.name}</h3>
                <p className="text-sm text-slate-400">
                  {item.status ??
                    ((item.isActive ?? item.visible)
                      ? "actif"
                      : "inactif")}{" "}
                  {item.featured ? "· featured" : ""}{" "}
                  {item.order ? `· ordre ${item.order}` : ""}
                </p>
              </div>
              <button className={ghost} onClick={() => onEdit(item)}>
                Éditer
              </button>
              <button className={ghost} onClick={() => onToggle(item)}>
                Toggle
              </button>
              <button className={ghost} onClick={() => onFeature(item)}>
                Reorder / feature
              </button>
              <button className={danger} onClick={() => onDelete(item)}>
                Supprimer
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function Editor({
  editing,
  setEditing,
  saveEditable,
}: {
  editing: Editable;
  setEditing: (value: Editable | null) => void;
  saveEditable: (event: FormEvent) => void;
}): JSX.Element {
  const set = (key: string, value: string | number | boolean): void =>
    setEditing({ ...editing, [key]: value });
  const setZone = (index: number, key: string, value: string | number | boolean): void => {
    const zones = [...(editing.planZones ?? [])];
    zones[index] = { ...zones[index], [key]: value };
    setEditing({ ...editing, planZones: zones });
  };
  const setMovieSession = (index: number, key: string, value: string | number | boolean | unknown[]): void => {
    const sessions = [...(editing.sessions ?? [])];
    sessions[index] = { ...sessions[index], [key]: value };
    setEditing({ ...editing, sessions });
  };

  const reservedSeatsText = (value: unknown): string => {
    if (Array.isArray(value)) return JSON.stringify(value, null, 2);
    if (typeof value === 'string') return value;
    return '[]';
  };
  const parseReservedSeatsInput = (value: string): unknown[] => {
    if (!value.trim()) return [];
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  };
  if (editing.kind === "event") {
    const usePlan = editing.buyingMode === "plan";
    const zones = editing.planZones ?? [];
    const activeZones = zones.filter((zone: any) => zone.isAvailable !== false && Number(zone.capacity) > 0);
    const planType = (editing.planType ?? inferPlanType(editing.category)) as 'theatre' | 'stadium';
    const setPlanMode = (buyingMode: string): void => {
      if (buyingMode === 'plan') {
        const nextPlanType = (editing.planType ?? inferPlanType(editing.category)) as 'theatre' | 'stadium';
        setEditing({ ...editing, buyingMode: 'plan', hasPlan: true, seatingEnabled: true, planType: nextPlanType, planZones: zones.length ? zones : clonePlanZones(templateForPlanType(nextPlanType)) });
        return;
      }
      setEditing({ ...editing, buyingMode: 'ticket', hasPlan: false, seatingEnabled: false, planType: null, planZones: [] });
    };
    const setPlanType = (nextPlanType: 'theatre' | 'stadium'): void => {
      setEditing({ ...editing, planType: nextPlanType, hasPlan: true, seatingEnabled: true, planZones: zones.length ? zones : clonePlanZones(templateForPlanType(nextPlanType)) });
    };
    const resetZones = (nextPlanType: 'theatre' | 'stadium'): void => {
      setEditing({ ...editing, buyingMode: 'plan', hasPlan: true, seatingEnabled: true, planType: nextPlanType, planZones: clonePlanZones(templateForPlanType(nextPlanType)) });
    };
    const handleCategoryChange = (category: string): void => {
      const inferred = inferPlanType(category);
      setEditing({ ...editing, category, planType: usePlan && !editing.planType ? inferred : editing.planType });
    };
    const handleSubmit = (submitEvent: FormEvent): void => {
      if (usePlan && (!planType || activeZones.length === 0)) {
        submitEvent.preventDefault();
        return;
      }
      saveEditable(submitEvent);
    };
    return (
      <form className={panel + " grid gap-5 md:grid-cols-2"} onSubmit={handleSubmit}>
        <h2 className="md:col-span-2 text-xl font-bold">{editing.id ? "Modifier" : "Créer"} événement</h2>

        <section className="md:col-span-2 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-2">
          <h3 className="md:col-span-2 text-base font-bold text-cyan-100">Informations</h3>
          <input className={input} placeholder="Titre" value={editing.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          <input className={input} placeholder="Slug" value={editing.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
          <input className={input} placeholder="Catégorie (Sport, Concerts, Théâtre...)" value={editing.category ?? ""} onChange={(e) => handleCategoryChange(e.target.value)} />
          <input className={input} placeholder="Ville" value={editing.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          <input className={input} placeholder="Lieu / salle" value={editing.location ?? ""} onChange={(e) => set("location", e.target.value)} />
          <input className={input} type="date" value={editing.date ?? ""} onChange={(e) => set("date", e.target.value)} />
          <input className={input} type="time" value={editing.time ?? ""} onChange={(e) => set("time", e.target.value)} />
          <input className={input} type="number" placeholder="Prix normal" value={editing.ticketTypes?.[0]?.price ?? 0} onChange={(e) => setEditing({ ...editing, ticketTypes: [{ ...(editing.ticketTypes?.[0] ?? { id: 'ticket-normal', name: 'Normal', stock: 300, seatPlanRequired: false }), price: Number(e.target.value) }] })} />
          <textarea className={input + " md:col-span-2"} placeholder="Description" value={editing.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </section>

        <section className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <h3 className="mb-3 text-base font-bold text-cyan-100">Média</h3>
          <MediaInput label="Image" value={editing.image ?? ""} onChange={(value) => set("image", value)} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <h3 className="mb-3 text-base font-bold text-cyan-100">Publication</h3>
          <div className="space-y-3">
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={editing.status === "published"} onChange={(e) => set("status", e.target.checked ? "published" : "draft")} /> Publié</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={editing.featured ?? false} onChange={(e) => set("featured", e.target.checked)} /> Mis en avant</label>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <h3 className="text-base font-bold text-cyan-100">Mode d’achat</h3>
          <p className="text-xs leading-5 text-slate-300">Utilisez le mode plan quand le client doit choisir une zone sur un plan de salle ou un stade. Les billets normaux restent sans plan interactif.</p>
          <label className="block text-sm font-semibold">Mode d’achat</label>
          <select className={input} value={editing.buyingMode ?? "ticket"} onChange={(e) => setPlanMode(e.target.value)}>
            <option value="ticket">Normal ticket</option>
            <option value="plan">Acheter via plan</option>
          </select>
          {usePlan && <select className={input} value={planType} onChange={(e) => setPlanType(e.target.value as 'theatre' | 'stadium')} required>
            <option value="theatre">Théâtre / Salle</option>
            <option value="stadium">Stade / Mal3ab</option>
          </select>}
          {usePlan && <label className="flex gap-2 text-sm"><input type="checkbox" checked={editing.seatingEnabled ?? true} onChange={(e) => set("seatingEnabled", e.target.checked)} /> Seating enabled</label>}
        </section>

        {usePlan && <section className="md:col-span-2 space-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-cyan-100">Plan & zones</h3>
              <p className="text-xs text-slate-300">Ajoutez au moins une zone active avec prix et capacité. Ces zones apparaîtront dans le sélecteur public {planType === 'stadium' ? 'stade' : 'salle'}.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ghost} onClick={() => resetZones('theatre')}>Reset theatre template</button>
              <button type="button" className={ghost} onClick={() => resetZones('stadium')}>Reset stadium template</button>
              <button type="button" className={btn} onClick={() => setEditing({ ...editing, planZones: [...zones, { id: String(Date.now()), name: 'Nouvelle zone', label: '', price: 100, capacity: 100, availableCapacity: 100, color: '#f97316', sortOrder: zones.length, isAvailable: true }] })}>Add zone</button>
            </div>
          </div>
          {activeZones.length === 0 && <p className="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">Le mode plan nécessite au moins une zone active avant l’enregistrement.</p>}
          {zones.map((zone: any, index: number) => <div key={zone.id ?? index} className="grid gap-2 rounded-xl bg-white/[0.04] p-3 md:grid-cols-8">
            <input className={input} placeholder="Zone name" value={zone.name} onChange={(e) => setZone(index, 'name', e.target.value)} />
            <input className={input} placeholder="Label" value={zone.label ?? ''} onChange={(e) => setZone(index, 'label', e.target.value)} />
            <input className={input} type="number" min="0" placeholder="Prix" value={zone.price} onChange={(e) => setZone(index, 'price', Number(e.target.value))} />
            <input className={input} type="number" min="0" placeholder="Capacité" value={zone.capacity} onChange={(e) => setZone(index, 'capacity', Number(e.target.value))} />
            <input className={input} type="number" min="0" placeholder="Disponible" value={zone.availableCapacity ?? zone.capacity ?? 0} onChange={(e) => setZone(index, 'availableCapacity', Number(e.target.value))} />
            <input className={input} type="color" title="Couleur" value={zone.color} onChange={(e) => setZone(index, 'color', e.target.value)} />
            <input className={input} type="number" min="0" placeholder="Ordre" value={zone.sortOrder ?? index} onChange={(e) => setZone(index, 'sortOrder', Number(e.target.value))} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={zone.isAvailable !== false} onChange={(e) => setZone(index, 'isAvailable', e.target.checked)} /> actif</label>
              <button type="button" className={danger} onClick={() => setEditing({ ...editing, planZones: zones.filter((_: any, zoneIndex: number) => zoneIndex !== index) })}>Remove zone</button>
            </div>
          </div>)}
        </section>}
        <div className="md:col-span-2 flex gap-2"><button className={btn} type="submit">Enregistrer</button><button className={ghost} type="button" onClick={() => setEditing(null)}>Annuler</button></div>
      </form>
    );
  }
  return (
    <form
      className={panel + " grid gap-4 md:grid-cols-2"}
      onSubmit={saveEditable}
    >
      <h2 className="md:col-span-2 text-xl font-bold">
        {editing.id ? "Modifier" : "Créer"} {editing.kind}
      </h2>
      <input
        className={input}
        placeholder="Titre / nom"
        value={editing.title ?? editing.name ?? ""}
        onChange={(e) =>
          editing.kind === "category"
            ? set("name", e.target.value)
            : set("title", e.target.value)
        }
      />
      <input
        className={input}
        placeholder="Slug / type / genre / destination"
        value={
          editing.slug ??
          editing.genre ??
          editing.destination ??
          editing.type ??
          ""
        }
        onChange={(e) =>
          editing.kind === "category"
            ? set("slug", e.target.value)
            : editing.kind === "movie"
              ? set("genre", e.target.value)
              : editing.kind === "travel"
                ? set("destination", e.target.value)
                : set("type", e.target.value)
        }
      />
      <input
        className={input}
        placeholder="Catégorie / durée / sous-titre"
        value={editing.category ?? editing.duration ?? editing.subtitle ?? ""}
        onChange={(e) =>
          editing.kind === "travel"
            ? set("category", e.target.value)
            : editing.kind === "movie"
              ? set("duration", e.target.value)
              : set("subtitle", e.target.value)
        }
      />
      <input
        className={input}
        type={
          editing.kind === "travel" || editing.kind === "movie"
            ? "date"
            : "number"
        }
        placeholder="Date / ordre"
        value={
          editing.departureDate ?? editing.releaseDate ?? editing.order ?? ""
        }
        onChange={(e) =>
          editing.kind === "travel"
            ? set("departureDate", e.target.value)
            : editing.kind === "movie"
              ? set("releaseDate", e.target.value)
              : set("order", Number(e.target.value))
        }
      />
      <input
        className={input}
        placeholder="Prix / CTA label / icône"
        value={editing.price ?? editing.ctaLabel ?? editing.icon ?? ""}
        onChange={(e) =>
          editing.kind === "travel"
            ? set("price", Number(e.target.value))
            : editing.kind === "category"
              ? set("icon", e.target.value)
              : set("ctaLabel", e.target.value)
        }
      />
      <input
        className={input}
        placeholder="Cinémas / CTA link"
        value={editing.cinemas ?? editing.ctaLink ?? ""}
        onChange={(e) =>
          editing.kind === "movie"
            ? set("cinemas", e.target.value)
            : set("ctaLink", e.target.value)
        }
      />
      <textarea
        className={input + " md:col-span-2"}
        placeholder="Description"
        value={editing.description ?? ""}
        onChange={(e) => set("description", e.target.value)}
      />
      <MediaInput
        label="Image"
        value={editing.image ?? editing.poster}
        onChange={(value) =>
          editing.kind === "movie" ? set("poster", value) : set("image", value)
        }
      />
      {editing.kind === "movie" && <section className="md:col-span-2 space-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-cyan-100">Séances cinéma</h3>
            <p className="text-xs text-slate-300">Activez le seating pour ouvrir le plan cinéma public, sinon la séance garde le bouton Réserver normal.</p>
          </div>
          <button type="button" className={btn} onClick={() => setEditing({ ...editing, sessions: [...(editing.sessions ?? []), { id: String(Date.now()), sessionDate: '', sessionTime: '20:00', cinema: editing.cinemas?.split(',')[0]?.trim() || 'Megarama', city: 'Casablanca', hallName: 'Salle 1', price: 70, standardPrice: 70, vipPrice: 100, vvipPrice: 150, reservedSeatCount: 12, seatingEnabled: true, seatTemplate: 'medium', reservedSeats: [] }] })}>Ajouter séance</button>
        </div>
        {(editing.sessions ?? []).map((session: any, index: number) => <div key={session.id ?? index} className="grid gap-2 rounded-xl bg-white/[0.04] p-3 md:grid-cols-8">
          <input className={input} type="date" value={session.sessionDate ?? ''} onChange={(e) => setMovieSession(index, 'sessionDate', e.target.value)} />
          <input className={input} type="time" value={session.sessionTime ?? ''} onChange={(e) => setMovieSession(index, 'sessionTime', e.target.value)} />
          <input className={input} placeholder="Cinéma" value={session.cinema ?? ''} onChange={(e) => setMovieSession(index, 'cinema', e.target.value)} />
          <input className={input} placeholder="Ville" value={session.city ?? ''} onChange={(e) => setMovieSession(index, 'city', e.target.value)} />
          <input className={input} placeholder="Salle" value={session.hallName ?? ''} onChange={(e) => setMovieSession(index, 'hallName', e.target.value)} />
          <input className={input} type="number" min="0" placeholder="Prix standard/Balcon" value={session.standardPrice ?? session.price ?? 0} onChange={(e) => { setMovieSession(index, 'standardPrice', Number(e.target.value)); setMovieSession(index, 'price', Number(e.target.value)); }} />
          <select className={input} value={session.seatTemplate ?? 'medium'} onChange={(e) => setMovieSession(index, 'seatTemplate', e.target.value)}><option value="small">Small room</option><option value="medium">Medium room</option><option value="large">Large room</option><option value="premium">Premium room</option></select>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={session.seatingEnabled !== false} onChange={(e) => setMovieSession(index, 'seatingEnabled', e.target.checked)} /> seating</label>
            <button type="button" className={danger} onClick={() => setEditing({ ...editing, sessions: (editing.sessions ?? []).filter((_: any, sessionIndex: number) => sessionIndex !== index) })}>Remove</button>
          </div>
          <input className={input} type="number" min="0" placeholder="Prix VIP" value={session.vipPrice ?? 0} onChange={(e) => setMovieSession(index, 'vipPrice', Number(e.target.value))} />
          <input className={input} type="number" min="0" placeholder="Prix VVIP" value={session.vvipPrice ?? 0} onChange={(e) => setMovieSession(index, 'vvipPrice', Number(e.target.value))} />
          <input className={input} type="number" min="0" placeholder="Réservés démo" value={session.reservedSeatCount ?? 0} onChange={(e) => setMovieSession(index, 'reservedSeatCount', Number(e.target.value))} />
          <textarea className={input + ' md:col-span-5'} rows={3} placeholder={'Sièges réservés JSON, ex: [{"row":"C","number":5}] ou C5,C6'} value={reservedSeatsText(session.reservedSeats)} onChange={(e) => setMovieSession(index, 'reservedSeats', parseReservedSeatsInput(e.target.value))} />
        </div>)}
      </section>}
      <div className="space-y-3">
        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={
              editing.status === "published" ||
              editing.isActive === true ||
              editing.visible === true
            }
            onChange={(e) =>
              editing.kind === "category"
                ? set("isActive", e.target.checked)
                : editing.kind === "content"
                  ? set("visible", e.target.checked)
                  : set("status", e.target.checked ? "published" : "draft")
            }
          />{" "}
          Actif / visible / publié
        </label>
        {(editing.kind === "travel" || editing.kind === "movie") && (
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={editing.featured ?? false}
              onChange={(e) => set("featured", e.target.checked)}
            />{" "}
            Mis en avant
          </label>
        )}
        <div className="flex gap-2">
          <button className={btn} type="submit">
            Enregistrer
          </button>
          <button
            className={ghost}
            type="button"
            onClick={() => setEditing(null)}
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}
