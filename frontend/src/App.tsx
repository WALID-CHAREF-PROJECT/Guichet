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
import PaymentPage from './pages/commerce/PaymentPage';
import AccountAreaPage, {
  AccountBalance,
  AccountDashboard,
  AccountFavorites,
  AccountMovies,
  AccountProfile,
  AccountReservations,
  AccountSecurity,
  AccountStatus,
  AccountTravels
} from './pages/AccountAreaPage';
import {
  OrganizerDashboardPage,
  OrganizerEditEventPage,
  OrganizerEventsPage,
  OrganizerNewEventPage,
  OrganizerOrdersPage,
  OrganizerProfilePage,
  OrganizerPublicPage
} from './pages/OrganizerPages';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/ma-fr/billeterie" replace />} />
        <Route path="/ma-fr/billeterie" element={<BilleteriePage />} />
        <Route path="/ma-fr/store" element={<StorePage />} />
        <Route path="/ma-fr/voyage" element={<VoyagesPage />} />
        <Route path="/ma-fr/travel/category/:category" element={<VoyagesPage />} />
        <Route path="/ma-fr/voyage/:slug" element={<VoyageDetailsPage />} />
        <Route path="/ma-fr/travel/:category/:slug" element={<VoyageDetailsPage />} />
        <Route path="/ma-fr/travel/:category/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/ma-fr/cinema" element={<CinemaPage />} />
        <Route path="/ma-fr/cinema/:slug" element={<CinemaDetailsPage />} />
        <Route path="/ma-fr/sport" element={<SportPage />} />
        <Route path="/ma-fr/event/tags/:tag" element={<EventTagsPage />} />
        <Route path="/ma-fr/event/producer/:slug" element={<OrganizerPublicPage />} />
        <Route path="/ma-fr/event/:slug" element={<EventDetailsPage />} />
        <Route path="/ma-fr/event/:category/:slug" element={<EventDetailsPage />} />
        <Route path="/ma-fr/event/:slug/tickets" element={<EventDetailsPage />} />
        <Route path="/ma-fr/event/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/ma-fr/panier" element={<CartPage />} />
        <Route path="/ma-fr/checkout" element={<CheckoutPage />} />
        <Route path="/ma-fr/payment" element={<PaymentPage />} />
        <Route path="/ma-fr/confirmation" element={<OrderConfirmationPage />} />

        <Route path="/ma-fr/account" element={<AccountAreaPage />}>
          <Route index element={<AccountDashboard />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="reservations" element={<AccountReservations />} />
          <Route path="travels" element={<AccountTravels />} />
          <Route path="movies" element={<AccountMovies />} />
          <Route path="favorites" element={<AccountFavorites />} />
          <Route path="balance" element={<AccountBalance />} />
          <Route path="security" element={<AccountSecurity />} />
          <Route path="status" element={<AccountStatus />} />
        </Route>

        <Route path="/ma-fr/organizer" element={<OrganizerDashboardPage />} />
        <Route path="/ma-fr/organizer/events" element={<OrganizerEventsPage />} />
        <Route path="/ma-fr/organizer/events/new" element={<OrganizerNewEventPage />} />
        <Route path="/ma-fr/organizer/events/:id/edit" element={<OrganizerEditEventPage />} />
        <Route path="/ma-fr/organizer/orders" element={<OrganizerOrdersPage />} />
        <Route path="/ma-fr/organizer/profile" element={<OrganizerProfilePage />} />

        <Route path="/ma-fr/admin" element={<AdminPage />} />
        <Route path="/ma-fr/admin/events" element={<AdminPage />} />
        <Route path="/ma-fr/admin/users" element={<AdminPage />} />
        <Route path="/ma-fr/admin/orders" element={<AdminPage />} />
        <Route path="/ma-fr/admin/organizers" element={<AdminPage />} />
        <Route path="/ma-fr/admin/content" element={<AdminPage />} />

        <Route path="/login" element={<Navigate to="/ma-fr/login" replace />} />
        <Route path="/register" element={<Navigate to="/ma-fr/signup" replace />} />
        <Route path="/ma-fr/login" element={<LoginPage />} />
        <Route path="/ma-fr/signup" element={<RegisterPage />} />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/admin" element={<Navigate to="/ma-fr/admin" replace />} />
        <Route path="/home" element={<HomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
