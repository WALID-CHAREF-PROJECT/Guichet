export type Language = 'fr' | 'en';

const LANGUAGE_KEY = 'ticketflow_language';

const dictionary = {
  fr: {
    brand: 'Guichet',
    ticketing: 'Billetterie',
    store: 'Store',
    travel: 'Voyage',
    cinema: 'Cinéma',
    sport: 'Sport',
    admin: 'Admin',
    searchPlaceholder: 'Cherchez ce que vous voulez',
    menu: 'Menu',
    close: 'Fermer',
    cart: 'Panier',
    checkout: 'Valider la commande',
    clear: 'Vider',
    loginRequired: 'Veuillez vous connecter pour finaliser votre commande.',
    login: 'Connexion',
    emptyCart: 'Votre panier est vide.',
    total: 'Total',
    quantity: 'Quantité',
    paymentTitle: 'Paiement par carte Visa',
    cardName: 'Nom sur la carte',
    cardNumber: 'Numéro Visa',
    expiry: 'Date d’expiration (MM/AA)',
    cvc: 'CVC',
    payNow: 'Payer maintenant',
    paymentSuccess: 'Commande validée avec succès. Merci !',
    invalidCard: 'Veuillez saisir une carte Visa valide.',
    invalidExpiry: 'Veuillez saisir une date valide.',
    invalidCvc: 'Le CVC doit contenir 3 chiffres.',
    adminWelcome: 'Administration du projet',
    adminDesc: 'Ajoutez et gérez les tickets pour les sections sport, cinéma et événements.',
    adminAccountHint: 'Compte admin par défaut',
    logout: 'Déconnexion'
  },
  en: {
    brand: 'Guichet',
    ticketing: 'Ticketing',
    store: 'Store',
    travel: 'Travel',
    cinema: 'Cinema',
    sport: 'Sport',
    admin: 'Admin',
    searchPlaceholder: 'Search what you need',
    menu: 'Menu',
    close: 'Close',
    cart: 'Cart',
    checkout: 'Validate order',
    clear: 'Clear',
    loginRequired: 'Please sign in to complete your order.',
    login: 'Sign in',
    emptyCart: 'Your cart is empty.',
    total: 'Total',
    quantity: 'Quantity',
    paymentTitle: 'Visa card payment',
    cardName: 'Name on card',
    cardNumber: 'Visa number',
    expiry: 'Expiry date (MM/YY)',
    cvc: 'CVC',
    payNow: 'Pay now',
    paymentSuccess: 'Order validated successfully. Thank you!',
    invalidCard: 'Please enter a valid Visa card.',
    invalidExpiry: 'Please enter a valid expiry date.',
    invalidCvc: 'CVC must contain 3 digits.',
    adminWelcome: 'Project administration',
    adminDesc: 'Add and manage tickets for sport, cinema, and events sections.',
    adminAccountHint: 'Default admin account',
    logout: 'Logout'
  }
} as const;

export type TranslationKey = keyof typeof dictionary.fr;

export function getLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === 'en' ? 'en' : 'fr';
}

export function setLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function t(language: Language, key: TranslationKey): string {
  return dictionary[language][key];
}
