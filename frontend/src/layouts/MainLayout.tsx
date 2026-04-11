import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function MainLayout(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6"><Outlet /></main>
      <Footer />
    </div>
  );
}
