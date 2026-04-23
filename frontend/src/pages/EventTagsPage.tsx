import { Link, useParams } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import PlatformTopNav from '../components/PlatformTopNav';
import { eventTags, getEventsByTag } from '../services/platformData';
import FavoriteButton from '../components/FavoriteButton';

export default function EventTagsPage(): JSX.Element {
  const { tag = '' } = useParams();
  const selectedTag = eventTags.find((item) => item.id === tag);
  const events = getEventsByTag(tag);

  return (
    <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
      <PlatformTopNav active="billeterie" />
      <CategoryStrip />
      <section className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Tous les événements {selectedTag?.id ?? tag}</h1>
        {events.length === 0 ? <p className="text-slate-300">Aucun événement pour cette catégorie.</p> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <Link key={event.id} to={`/ma-fr/event/${event.slug}`} className="group relative rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1">
              <div className="absolute right-3 top-3 z-10"><FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image, location: event.location, date: `${event.date} · ${event.time}`, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} /></div>
              <img src={event.image} alt={event.title} className="h-72 w-full rounded-xl object-cover" />
              <h3 className="mt-3 line-clamp-2 font-semibold">{event.title}</h3>
              <p className="mt-1 text-xs text-slate-300">{event.location} · {event.date}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
