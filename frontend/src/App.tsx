import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AboutPage from './pages/AboutPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import EventDetailsPage from './pages/EventDetailsPage';
import EventsPage from './pages/EventsPage';
import StorePage from './pages/StorePage';
import GalleryPage from './pages/GalleryPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import VoyagesPage from './pages/VoyagesPage';
import CinemaPage from './pages/CinemaPage';
import SportPage from './pages/SportPage';
import VoyageDetailsPage from './pages/VoyageDetailsPage';
import AdminPage from './pages/AdminPage';
import BilleteriePage from './pages/BilleteriePage';
import EventTagsPage from './pages/EventTagsPage';
import CinemaDetailsPage from './pages/CinemaDetailsPage';
import CheckoutPage from './pages/commerce/CheckoutPage';
import OrderConfirmationPage from './pages/commerce/OrderConfirmationPage';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/ma-fr/billeterie" replace />} />
        <Route path="/ma-fr/billeterie" element={<BilleteriePage />} />
        <Route path="/ma-fr/store" element={<StorePage />} />
        <Route path="/ma-fr/voyage" element={<VoyagesPage />} />
        <Route path="/ma-fr/voyage/:slug" element={<VoyageDetailsPage />} />
        <Route path="/ma-fr/travel/:category/:slug" element={<VoyageDetailsPage />} />
        <Route path="/ma-fr/travel/:category/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/ma-fr/cinema" element={<CinemaPage />} />
        <Route path="/ma-fr/cinema/:slug" element={<CinemaDetailsPage />} />
        <Route path="/ma-fr/sport" element={<SportPage />} />
        <Route path="/ma-fr/event/tags/:tag" element={<EventTagsPage />} />
        <Route path="/ma-fr/event/:slug" element={<EventDetailsPage />} />
        <Route path="/ma-fr/event/:category/:slug" element={<EventDetailsPage />} />
        <Route path="/ma-fr/event/:slug/tickets" element={<EventDetailsPage />} />
        <Route path="/ma-fr/event/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/ma-fr/panier" element={<CartPage />} />
        <Route path="/ma-fr/checkout" element={<CheckoutPage />} />
        <Route path="/ma-fr/confirmation" element={<OrderConfirmationPage />} />

        <Route path="/billeterie" element={<Navigate to="/ma-fr/billeterie" replace />} />
        <Route path="/store" element={<Navigate to="/ma-fr/store" replace />} />
        <Route path="/voyages" element={<Navigate to="/ma-fr/voyage" replace />} />
        <Route path="/voyages/:slug" element={<Navigate to="/ma-fr/voyage" replace />} />
        <Route path="/cinema" element={<Navigate to="/ma-fr/cinema" replace />} />
        <Route path="/sport" element={<Navigate to="/ma-fr/sport" replace />} />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/cart" element={<Navigate to="/ma-fr/panier" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/home" element={<HomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
