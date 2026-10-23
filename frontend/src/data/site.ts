/**
 * Seitenweite Konfiguration und UI-Texte (DE/EN) aus der
 * Originalseite. Newsletter-Einträge sind bewusst
 * nicht enthalten (Kundenentscheidung).
 */
export type Lang = 'de' | 'en';

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteData {
  lang: Lang;
  htmlLang: string;
  homeUrl: string;
  otherLang: Lang;
  skipToContent: string;
  skipToFooter: string;
  openMenu: string;
  menuAria: string;
  logoAlt: string;
  nav: NavLink[];
  footerNav: NavLink[];
  footerAria: string;
  legalAria: string;
  legalLinks: NavLink[];
  socials: { label: string; href: string; icon: 'linkedin' | 'instagram' | 'facebook' }[];
  blogHomeLabel: string;
  allPostsLabel: string;
  readingTime: { prefix: string; suffix: string; wpm: number };
  form: {
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
    dsgvoText: string;
    dsgvoLinkLabel: string;
    dsgvoHref: string;
    sectionLabel: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    messageLabel: string;
    requiredNotice: string;
  };
  modal: {
    triggerLabel: string;
    triggerAria: string;
    heading: string;
    lede: string;
    sidebarText: string;
    phoneLabel: string;
    closeLabel: string;
  };
}

const socials = [
  {
    label: 'Auf Linkedin folgen',
    href: 'https://www.linkedin.com/company/jmc-streamline-processes/',
    icon: 'linkedin' as const,
  },
  { label: 'Auf Instagram folgen', href: 'https://www.instagram.com/jmc.streamline/', icon: 'instagram' as const },
  {
    label: 'Auf Facebook folgen',
    href: 'https://www.facebook.com/people/jmcstreamline/61564668764679/',
    icon: 'facebook' as const,
  },
];

export const site: Record<Lang, SiteData> = {
  de: {
    lang: 'de',
    htmlLang: 'de-DE',
    homeUrl: '/de/',
    otherLang: 'en',
    skipToContent: 'Zum Hauptinhalt springen',
    skipToFooter: 'Zur Fußzeile springen',
    openMenu: 'Öffnen Sie das mobile Menü',
    menuAria: 'Haupt',
    logoAlt: 'jmc. | Streamline Processes S.L. logo',
    nav: [
      { label: 'Über mich', href: '/de/ueber-mich/' },
      { label: 'Services', href: '/de/services/' },
      { label: 'Blog', href: '/de/blog/' },
      { label: 'Kontakt', href: '/de/kontakt/' },
    ],
    footerNav: [
      { label: 'Services', href: '/de/services/' },
      { label: 'Blog', href: '/de/blog/' },
      { label: 'Über mich', href: '/de/ueber-mich/' },
      { label: 'Kontakt', href: '/de/kontakt/' },
    ],
    footerAria: 'Footer',
    legalAria: 'Legal',
    legalLinks: [
      { label: 'Impressum', href: '/de/impressum/' },
      { label: 'Datenschutz', href: '/de/datenschutzerklaerung/' },
    ],
    socials,
    blogHomeLabel: 'Home',
    allPostsLabel: '→ Alle Beiträge',
    readingTime: { prefix: 'Lesezeit: ', suffix: ' Min.', wpm: 180 },
    form: {
      namePlaceholder: 'Name',
      emailPlaceholder: 'E-Mail *',
      phonePlaceholder: 'Telefon',
      messagePlaceholder: 'Nachricht *',
      submitLabel: 'Absenden',
      dsgvoText:
        'Über unsere SSL-Verschlüsselung werden Ihre Daten sicher übertragen. Beachten Sie bitte unsere',
      dsgvoLinkLabel: 'Datenschutzerklärung',
      dsgvoHref: '/de/datenschutzerklaerung/',
      sectionLabel: 'Abschnitt',
      nameLabel: 'Name',
      emailLabel: 'E-Mail',
      phoneLabel: 'Telefon',
      messageLabel: 'Nachricht',
      requiredNotice: 'Dies ist ein Pflichtfeld.',
    },
    modal: {
      triggerLabel: 'Beratung',
      triggerAria: 'Kontakt aufnehmen jmc. | Streamline Processes S.L.',
      heading: 'Lassen Sie uns reden - ich bin für Sie da!',
      lede: 'Sie können mich jederzeit telefonisch oder über das Kontaktformular erreichen, wenn Sie Fragen haben oder fachliche Hilfe benötigen.',
      sidebarText:
        'Ich stehe Ihnen in drei Sprachen (Deutsch, Englisch, Italienisch) zur Verfügung und freue mich auf Ihre Anfragen. Bitte teilen Sie mir mit, wie ich Ihnen gezielt weiterhelfen kann.',
      phoneLabel: 'Telefon',
      closeLabel: 'Schließen',
    },
  },
  en: {
    lang: 'en',
    htmlLang: 'en-US',
    homeUrl: '/en/',
    otherLang: 'de',
    skipToContent: 'Skip to main content',
    skipToFooter: 'Skip to footer',
    openMenu: 'Open mobile menu',
    menuAria: 'Haupt',
    logoAlt: 'jmc. | Streamline Processes S.L. logo',
    nav: [
      { label: 'About me', href: '/en/about-me/' },
      { label: 'Services', href: '/en/services/' },
      { label: 'Blog', href: '/en/blog/' },
      { label: 'Contact', href: '/en/contact/' },
    ],
    footerNav: [
      { label: 'Services', href: '/en/services/' },
      { label: 'Blog', href: '/en/blog/' },
      { label: 'About me', href: '/en/about-me/' },
      { label: 'Contact', href: '/en/contact/' },
    ],
    footerAria: 'Footer',
    legalAria: 'Legal',
    legalLinks: [
      { label: 'Imprint', href: '/en/imprint/' },
      { label: 'Privacy Policy', href: '/en/privacy-policy/' },
    ],
    socials,
    blogHomeLabel: 'Home',
    allPostsLabel: '→ All articles',
    readingTime: { prefix: 'Reading Time: ', suffix: ' Min.', wpm: 180 },
    form: {
      namePlaceholder: 'Name',
      emailPlaceholder: 'E-mail *',
      phonePlaceholder: 'Phone',
      messagePlaceholder: 'Message *',
      submitLabel: 'Send',
      dsgvoText: 'Your data is transmitted securely via our SSL encryption. Please note our',
      dsgvoLinkLabel: 'Privacy Policy',
      dsgvoHref: '/en/privacy-policy/',
      sectionLabel: 'Abschnitt',
      nameLabel: 'Name',
      emailLabel: 'E-mail',
      phoneLabel: 'Phone',
      messageLabel: 'Message',
      requiredNotice: 'This field is required.',
    },
    modal: {
      triggerLabel: 'Consulting',
      triggerAria: 'Kontakt aufnehmen jmc. | Streamline Processes S.L.',
      heading: "Let's talk - I'm here for you!",
      lede: 'You can contact me at any time by phone or via the contact form if you have any questions or need professional help.',
      sidebarText:
        'I am available in three languages (German, English, Italian) and look forward to your enquiries. Please let me know how I can help you specifically.',
      phoneLabel: 'Phone',
      closeLabel: 'Close',
    },
  },
};

/** Contact + company data (identical on both language versions). */
export const company = {
  name: 'jmc. | Streamline Processes S.L.',
  phone: '+34 699 313750',
  phoneHref: 'tel:+34699313750',
  phoneTitle: 'Rufen Sie uns gerne für weitere Fragen an',
  email: 'contact@jmc-streamline.com',
  emailHref: 'mailto:contact@jmc-streamline.com',
  emailTitle: 'Nehmen Sie gern Kontakt zu uns auf',
  address: ['jmc. | Streamline Processes S.L.', 'Carrer dels Apuntadors, 4', 'ES - 07012 Palma'],
};

export const logos = {
  /** white variant (header, over hero) */
  light: '/media/business-operations-management-jasmin-christensen-matassa.svg',
  /** dark variant (footer, contact modal) */
  dark: '/media/jasmin-christensen-matassa-business-operations-management.svg',
};
