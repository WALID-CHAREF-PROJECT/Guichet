import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function MainLayout(): JSX.Element {
  const { pathname } = useLocation();
  const isTicketingHome = pathname === '/ma-fr/billeterie' || pathname.startsWith('/ma-fr/event');

  if (isTicketingHome) {
    return (
      <div className="min-h-screen bg-[#020b22]">
        <main className="mx-auto max-w-[1800px] px-4 py-0 lg:px-8">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1700px] space-y-10 px-4 py-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
