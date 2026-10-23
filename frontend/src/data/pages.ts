/**
 * Structured content of the hand-built pages (home, services, about, contact,
 * blog intro, category intro). Texts are reproduced verbatim from the original
 * website (DE/EN); no content was invented or shortened.
 */
import type { Lang } from './site';

export interface Cta {
  label: string;
  href: string;
}

export interface ImageData {
  src: string;
  alt: string;
}

/* ------------------------------------------------------------------ home */
export interface HomeData {
  hero: {
    heading: string;
    accent: string;
    lede: string;
    cta: Cta;
    video: string;
  };
  potential: {
    heading: string;
    subheading: string;
    accent: string;
    cards: { heading: string; text: string }[];
  };
  contactBand: {
    text: string;
    image: ImageData;
  };
  process: {
    heading: string;
    accent: string;
    cta: Cta;
    cards: { heading: string; items: string[] }[];
  };
  feature: {
    heading: string;
    accent: string;
    lede: string;
    cta: Cta;
    image: ImageData;
    cards: { heading: string; text: string }[];
  };
  quote: string;
  solutions: {
    heading: string;
    accent: string;
    lede: string;
    cards: { heading: string; items: string[] }[];
    cta: Cta;
  };
  blog: {
    accent: string;
    heading: string;
  };
  cta: {
    image: ImageData;
    heading: string;
    accent: string;
    lede: string;
    phone: Cta;
    email: Cta;
  };
}

export const home: Record<Lang, HomeData> = {
  de: {
    hero: {
      heading: 'Optimieren Deine Geschäftsprozesse',
      accent: 'Kosten senken. Effizienz steigern. Servicequalität verbessern.',
      lede: 'Vom täglichen Büromanagement über die strategische Durchführung von Projekten bis hin zur Finanzaufsicht – jeder Aspekt deines Unternehmens wird auf Effizienz und Wachstum ausgerichtet.',
      cta: { label: 'Services', href: '/de/services/' },
      video: '/videos/szene-1.mp4',
    },
    potential: {
      heading: 'Erschließe das volle Potenzial deines Unternehmens mit meiner operativen Exzellenz.',
      subheading:
        'Mit meiner Leistungsstärke vom täglichen Büromanagement über die strategische Durchführung von Projekten bis hin zur finanziellen Überwachung sorge ich dafür, dass du greifbare Vorteile wie Kosteneinsparungen, erhöhte Wirtschaftlichkeit und verbesserte Servicequalität gewinnst.',
      accent: 'Effizienz durch Exzellenz',
      cards: [
        {
          heading: 'Dein Unternehmen zum Blühen bringen',
          text: 'Kraftvolle Strategien für nachhaltiges Wachstum.',
        },
        {
          heading: 'Ressourcennutzung beherrschen, Wachstum fördern',
          text: 'Optimierungspotenziale freisetzen, um Marktführerschaft zu erlangen.',
        },
        {
          heading: 'Optimierter Erfolg in allen Bereichen deines Unternehmens',
          text: 'Effiziente Prozesse für messbare Ergebnisse.',
        },
        {
          heading: 'Rationalisieren, Organisieren, Erzielen',
          text: 'Strukturiertes Vorgehen für höchste Leistungsfähigkeit.',
        },
        {
          heading: 'Exzellenz im Betrieb, Exzellenz in den Ergebnissen',
          text: 'Operative Spitzenleistung folgen exzellente Resultate.',
        },
      ],
    },
    contactBand: {
      text: 'Lass uns sprechen, wenn du deine Arbeitsabläufe effizienter gestalten und echte Qualitätsverbesserungen erzielen möchtest.',
      image: {
        src: '/media/telefonieren-arbeitsablaeufe-effizienter-gestalten.jpg',
        alt: 'Telefonieren Arbeitsablaeufe Effizienter Gestalten',
      },
    },
    process: {
      heading: 'Meine Fähigkeit, Prozesse zu verschlanken und Geschäftsabläufe Erfolg versprechend zu gestalten.',
      accent: 'Effizienz',
      cta: { label: 'Services', href: '/de/services/' },
      cards: [
        {
          heading: 'Business Operations Consulting',
          items: [
            'Rationalisierung interner Prozesse für mehr Wirksamkeit',
            'Optimierung der Organisationsstruktur für eine verbessertes Betriebsergebnis',
          ],
        },
        {
          heading: 'Office Management Services',
          items: [
            'Bereitstellung von Lösungen für das Remote-Büromanagement',
            'Handhabung von Kundenbeziehungen',
            'Verwaltung der Bürologistik',
          ],
        },
        {
          heading: 'Project & Event Management',
          items: [
            'Planung und Durchführung von internen und externen Veranstaltungen/Networking',
            'Koordinierung von Reise- und Besprechungsterminen',
            'Verwaltung von Zeitplänen und Ergebnissen für Projekte',
          ],
        },
        {
          heading: 'Financial & Administrative Support',
          items: [
            'Erstellung und Verwaltung von Rechnungen und Zahlungen',
            'Buchhaltung und vorbereitende Buchführungsdienste',
            'Cashflow-Management',
          ],
        },
      ],
    },
    feature: {
      heading: 'Wie kann ich dein Unternehmen auf das nächste Level bringen?',
      accent: 'Dein Partner für Wachstum und Erfolg',
      lede: 'Ich helfe deinem Unternehmen zu wachsen. Ich bin der Schlüssel zur Entfaltung des vollen Potenzials deines Unternehmens – vom täglichen Management bis zur strategischen Projektdurchführung, von Networking-Veranstaltungen bis zur finanziellen Überwachung.',
      cta: { label: 'Kontakt', href: '/de/kontakt/' },
      image: {
        src: '/media/gespraech-hielfe-ihr-unternehmen-zum-wachsen-zu-bringen.jpg',
        alt: 'Gespraech Hielfe Ihr Unternehmen Zum Wachsen Zu Bringen',
      },
      cards: [
        {
          heading: 'Effizienz',
          text: 'Fähigkeit, Prozesse zu rationalisieren und Geschäftsabläufe ergebnisorientiert zu optimieren.',
        },
        {
          heading: 'Zuverlässigkeit',
          text: 'Verlässliche Erbringung von Dienstleistungen, genaue finanzielle Abwicklung und gründliches Projektmanagement.',
        },
        {
          heading: 'Wachstum',
          text: 'Unterstützung von Unternehmen beim Unternehmenswachstum durch bessere Organisation, finanzielle Gesundheit und strategische Abläufe.',
        },
      ],
    },
    quote: 'Ich strebe danach, dass alle Elemente – von der Logistik bis zur Kundeninteraktion – perfekt harmonieren.',
    solutions: {
      heading: 'Maßgeschneiderte Lösungen',
      accent: 'Dein Erfolg ist mein Ziel',
      lede: 'Ich biete individuelle Beratung und passgenaue Strategien, um die bestmöglichen Ergebnisse für dein Unternehmen zu erzielen und deine Probleme zu lösen.',
      cards: [
        {
          heading: 'Immobilien & Grundstücke',
          items: ['Beziehungen zu Mietern und Kunden', 'Koordination der Instandhaltung', 'Betriebskosten'],
        },
        {
          heading: 'KMU',
          items: [
            'Verwaltung der Ressourcen',
            'Kostenkontrolle',
            'Herausforderungen der Skalierung',
            'Technologie-Integration',
          ],
        },
        {
          heading: 'Beratung',
          items: [
            'Kunden Projektabwicklung',
            'Fachwissen Diversifizierung',
            'Operative Leistungsfähigkeit',
            'Marktanpassung',
          ],
        },
        {
          heading: 'Start-ups',
          items: [
            'Schnelle Skalierung',
            'Marken- und Marktpositionierung',
            'Cashflow-Management',
            'Kompetenzlücken',
          ],
        },
      ],
      cta: { label: 'Services', href: '/de/services/' },
    },
    blog: {
      accent: 'Blog',
      heading:
        'Schön, dass du den Blog von jmc gefunden hast! Hier möchte ich meine Gedanken und Erfahrungen teilen, die mich auf meinem persönlichen Weg inspirieren',
    },
    cta: {
      image: {
        src: '/media/telefongespraech-kontakt-aufnehmen.jpg',
        alt: 'Telefongespraech Kontakt Aufnehmen',
      },
      heading: 'Dein Erfolg ist nur einen Klick entfernt!',
      accent: 'Erfolg wartet!',
      lede: 'Zögere nicht – starte noch heute mit Effizienz gezielt auf Erfolgskurs.',
      phone: { label: '+34 699 313750', href: 'tel:+34699313750' },
      email: { label: 'contact@jmc-streamline.com', href: 'mailto:contact@jmc-streamline.com' },
    },
  },
  en: {
    hero: {
      heading: 'Optimise your business processes',
      accent: 'Reduce costs. Increase efficiency. Improve service quality.',
      lede: 'From day-to-day office management to strategic project delivery and financial oversight, every aspect of your business is designed for efficiency and growth.',
      cta: { label: 'Services', href: '/en/services/' },
      video: '/videos/szene-1.mp4',
    },
    potential: {
      heading: 'Unlock the full potential of your business with my operational excellence.',
      subheading:
        'Using my expertise in fields ranging from daily administrative management to strategic project realization and financial monitoring, I will ensure that you achieve measurable benefits such as cost savings, increased profitability and improved service quality.',
      accent: 'Efficiency through excellence',
      cards: [
        { heading: 'Empowering your Business to flourish', text: 'Powerful strategies for sustainable growth.' },
        {
          heading: 'Mastering Efficiency, Empowering Growth',
          text: 'Unlock optimization potential to achieve market leadership.',
        },
        {
          heading: 'Excellence in Operations, Excellence in Outcomes',
          text: 'Operational peak performance is followed by excellent results.',
        },
        { heading: 'Streamline, Organize, Achieve', text: 'Structured approach for maximum performance.' },
        {
          heading: 'Streamlining Success across your Operations',
          text: 'Efficient processes for measurable results.',
        },
      ],
    },
    contactBand: {
      text: 'If you’re ready to transform your operations and see real improvements in efficiency and quality, let’s start a conversation.',
      image: {
        src: '/media/telephone-workflows-more-efficient-organisation.jpg',
        alt: 'Telephone Workflows More Efficient Organisation',
      },
    },
    process: {
      heading: 'My skill in streamlining processes and designing promising business procedures.',
      accent: 'Efficiency',
      cta: { label: 'Services', href: '/en/services/' },
      cards: [
        {
          heading: 'Business Operations Consulting',
          items: [
            'Streamlining internal processes for improved performance',
            'Optimize organizational structure for better operating results',
          ],
        },
        {
          heading: 'Office Management Services',
          items: [
            'Providing remote office management solutions',
            'Handling client relationships',
            'Management of office logistics',
          ],
        },
        {
          heading: 'Project & Event Management',
          items: [
            'Planning and realisation of internal and external events/networking',
            'Coordination of travel and meeting schedules',
            'Management of timetables and results for projects',
          ],
        },
        {
          heading: 'Financial & Administrative Support',
          items: [
            'Invoicing and payment management',
            'Bookkeeping and interim accounting services',
            'Cash flow management',
          ],
        },
      ],
    },
    feature: {
      heading: 'How can I bring your business to the next level?',
      accent: 'Your partner for growth and success',
      lede: 'I help your company to grow. I am the key to unlocking your company\'s full potential. From daily management activities to strategic project execution, from networking events to financial oversight.',
      cta: { label: 'Contact', href: '/en/contact/' },
      image: { src: '/media/talk-help-your-company-grow.jpg', alt: 'Talk Help Your Company Grow' },
      cards: [
        {
          heading: 'Efficiency',
          text: 'Ability to streamline processes and optimize business processes with a focus on results',
        },
        {
          heading: 'Reliability',
          text: 'Reliable service delivery, accurate financial management and thorough project management.',
        },
        {
          heading: 'Growth',
          text: 'Empowering businesses to grow through better organization, financial health and strategic operations.',
        },
      ],
    },
    quote: 'My aim is to ensure that all elements - from logistics to customer interaction - are in perfect harmony.',
    solutions: {
      heading: 'Customized solutions',
      accent: 'Your success is my goal',
      lede: 'I provide individualized advice and tailor-made strategies to achieve the best possible results for your company and to solve your challenges.',
      cards: [
        {
          heading: 'Real Estate & Property Management',
          items: ['Tenant and customer relations', 'Coordination of maintenance', 'Operating costs'],
        },
        {
          heading: 'SMEs',
          items: [
            'Management of resources',
            'Cost control',
            'Challenges of scaling',
            'Technology integration',
          ],
        },
        {
          heading: 'Consulting Firms',
          items: [
            'Clients Project management',
            'Expertise Diversification',
            'Operational capability',
            'Market adaptation',
          ],
        },
        {
          heading: 'Start-ups',
          items: [
            'High-speed scaling',
            'Brand and market positioning',
            'Cash flow management',
            'Expertise gaps',
          ],
        },
      ],
      cta: { label: 'Services', href: '/en/services/' },
    },
    blog: {
      accent: 'Blog',
      heading:
        'So glad you found jmc\'s blog! Here I would like to share my thoughts and experiences that inspire me on my personal journey',
    },
    cta: {
      image: { src: '/media/contact-telephone-talk.jpg', alt: 'Contact Telephone Talk' },
      heading: 'Your success is just a click away!',
      accent: 'Success Awaits!',
      lede: 'Don\'t hesitate - get started today with a targeted efficiency boost for your success.',
      phone: { label: '+34 699 313750', href: 'tel:+34699313750' },
      email: { label: 'contact@jmc-streamline.com', href: 'mailto:contact@jmc-streamline.com' },
    },
  },
};

/* -------------------------------------------------------------- services */
export interface ServicesData {
  hero: {
    heading: string;
    accent: string;
    lede: string;
    trigger: string;
    image: ImageData;
  };
  grid: {
    heading: string;
    accent: string;
    subheading: string;
    cards: { heading: string; textHtml: string }[];
  };
  features: {
    heading: string;
    lede: string;
    mail: Cta;
    cards: { heading: string; text: string }[];
  };
  modal: {
    image: ImageData;
  };
}

export const services: Record<Lang, ServicesData> = {
  de: {
    hero: {
      heading: 'Operative Exzellenz',
      accent: 'Services',
      lede: 'Ich biete effizientes Office Management, einschließlich Remote-Büroorganisation und Kundenmanagement. Zudem plane ich Events, koordiniere Termine und überwache Projekte. Im Finanzbereich übernehme ich Rechnungsstellung, Buchhaltung und Cashflow-Management.',
      trigger: 'Beratung',
      image: {
        src: '/media/services-operative-exzellenz.jpg',
        alt: 'Services Operative Exzellenz',
      },
    },
    grid: {
      heading: 'So meistere ich deine Herausforderungen',
      accent: 'Der Weg',
      subheading:
        'Ich biete umfassende Office Management Services, einschließlich Remote-Büromanagement, Kundenbeziehungsmanagement und Bürologistik. Im Bereich Project & Event Management plane und koordiniere ich Veranstaltungen, Reise- und Besprechungstermine und überwache Projektzeiten. Zudem übernehme ich Financial & Administrative Support, einschließlich Rechnungsstellung, Buchhaltung, Cashflow-Management.',
      cards: [
        {
          heading: 'Business Operations Consulting',
          textHtml:
            'Ich konzentriere mich darauf, interne Prozesse zu optimieren, um die Effizienz und Effektivität in deinem Unternehmen zu steigern. Dazu gehört eine gründliche Analyse und Anpassung der bestehenden Abläufe, um Engpässe zu beseitigen und die Leistung zu maximieren. Gleichzeitig überarbeite ich die Organisationsstruktur, damit sie den Anforderungen deines Unternehmens entspricht und zu besseren Betriebsergebnissen führt.<br /><br /><strong>Mein Ziel ist es, die gesamte Leistungsfähigkeit deines Unternehmens zu verbessern und nachhaltige Erfolge zu erzielen.</strong>',
        },
        {
          heading: 'Office Management Services',
          textHtml:
            'Ich biete umfassende Office Management Services an, die speziell auf das Remote-Büromanagement zugeschnitten sind. Dabei übernehme ich die komplette Handhabung von Kundenbeziehungen, um eine professionelle und effiziente Kommunikation zu gewährleisten. Außerdem kümmere ich mich um die Verwaltung der Bürologistik, einschließlich der Organisation und Koordination aller bürointernen Abläufe.<br /><br /><strong>Mein Ziel ist es, durch diese Services eine reibungslose und effektive Büroorganisation sicherzustellen, damit du dich auf dein Kerngeschäft konzentrieren kannst.</strong>',
        },
        {
          heading: 'Project & Event Management',
          textHtml:
            'Im Bereich Project & Event Management übernehme ich die umfassende Planung und Durchführung von internen und externen Veranstaltungen sowie Networking-Events, um deren Erfolg sicherzustellen. Ich kümmere mich um die Koordination aller Reise- und Besprechungstermine, um einen reibungslosen Ablauf zu gewährleisten. Darüber hinaus manage ich detailliert Zeitpläne und Ergebnisse für Projekte, um sicherzustellen, dass alle Aufgaben fristgerecht und effizient abgeschlossen werden.<br /><br /><strong>Mein Ziel ist es, sowohl deine Events als auch deine Projekte erfolgreich umzusetzen und eine nahtlose Organisation zu gewährleisten.</strong>',
        },
        {
          heading: 'Financial & Administrative Support',
          textHtml:
            'Im Bereich Financial & Administrative Support übernehme ich die Erstellung und Verwaltung von Rechnungen sowie die Abwicklung von Zahlungen, um einen reibungslosen Finanzfluss sicherzustellen. Ich führe die Buchhaltung und biete vorbereitende Buchführungsdienste an, um die finanziellen Aufzeichnungen präzise und aktuell zu halten. Zusätzlich kümmere ich mich um das Cashflow-Management, um die finanzielle Gesundheit des Unternehmens zu überwachen und zukünftige Entwicklungen zu planen.<br /><br /><strong>Mein Ziel ist es, eine solide finanzielle Basis zu schaffen und administrative Prozesse effizient zu gestalten.</strong>',
        },
      ],
    },
    features: {
      heading:
        'Hat dein Unternehmen bereits seine zentralen Herausforderungen definiert und ist es gut aufgestellt, um diese zu meistern?',
      lede: 'Lass uns gemeinsam deine Probleme angehen – mit maßgeschneiderten Lösungen in den Bereichen Ressourcenmanagement, Skalierung und Marktpositionierung für mehr Effizienz, Zuverlässigkeit und Wachstum.',
      mail: { label: 'contact@jmc-streamline.com', href: 'mailto:contact@jmc-streamline.com' },
      cards: [
        {
          heading: 'Immobilien & Grundstücke',
          text: 'Die Verwaltung von Immobilien und Grundstücken umfasst die Pflege der Beziehungen zu Mietern und Kunden, die Koordination der Instandhaltungsmaßnahmen sowie die Überwachung der Betriebskosten.',
        },
        {
          heading: 'KMU',
          text: 'Für kleine und mittlere Unternehmen (KMU) sind die Verwaltung der Ressourcen, Kostenkontrolle, die Bewältigung der Skalierungsherausforderungen und die Integration neuer Technologien wesentliche Aspekte des Geschäftsmanagements.',
        },
        {
          heading: 'Beratung',
          text: 'In der Beratung gehören die Kundenprojektabwicklung, die Diversifizierung des Fachwissens, die Sicherstellung der operativen Leistungsfähigkeit und die Anpassung an den Markt zu den wesentlichen Aufgaben.',
        },
        {
          heading: 'Start-ups',
          text: 'Bei Start-ups sind schnelle Skalierung, effektive Marken- und Marktpositionierung, sorgfältiges Cashflow-Management und das Schließen von Kompetenzlücken entscheidend für den Erfolg.',
        },
      ],
    },
    modal: {
      image: {
        src: '/media/kontakt-aufnehmen-jmc-streamline-processes-s-l.jpg',
        alt: 'Kontakt Aufnehmen Jmc Streamline Processes S L',
      },
    },
  },
  en: {
    hero: {
      heading: 'Operational excellence',
      accent: 'Services',
      lede: 'I provide professional office management, including remote work organization and client management. I also organize events, coordinate schedules and monitor projects. My financial responsibilities include invoicing, bookkeeping and cash flow management.',
      trigger: 'Consulting',
      image: { src: '/media/operative-exzellenz.jpg', alt: 'Operative Exzellenz' },
    },
    grid: {
      heading: 'This is how I master your challenges',
      accent: 'The Way',
      subheading:
        'My services include full office management services, including remote working, client relationship management and organizing office logistics. In project and event management, I plan and coordinate events, travel and meeting schedules, and monitor project timelines. I also provide financial and administrative support, including invoicing, bookkeeping and cash flow management.',
      cards: [
        {
          heading: 'Business Operations Consulting',
          textHtml:
            'I focus on streamlining internal processes to increase organizational efficiency and effectiveness. This involves a thorough analysis and adaptation of existing processes to remove bottlenecks and maximize performance. At the same time, I review the organizational structure to ensure that it meets the needs of the business and leads to better operating results.<br /><br /><strong>My aim is to improve the overall performance of your business and achieve sustainable success.</strong>',
        },
        {
          heading: 'Office Management Services',
          textHtml:
            'I offer comprehensive office management services that are specifically tailored to remote practice administration. I take over the complete handling of client relations to ensure professional and efficient communication. Additionally, I take care of the management of office logistics, including the organization and coordination of all internal workflows.<br /><br /><strong>My aim is to ensure smooth and effective organizational structures so that you can concentrate on your core business..</strong>',
        },
        {
          heading: 'Project & Event Management',
          textHtml:
            'In the field of project & event management, I take on the comprehensive planning and realization of internal and external events as well as networking events to ensure their smooth running. I take care of the coordination of all travel and meeting appointments to ensure that everything runs according to plan. Furthermore, I manage detailed timelines and deliverables for projects to guarantee that all tasks are completed on time and in the most efficient manner.<br /><br /><strong>My aim is to execute both your events and projects successfully and maintain a seamless level of overall management.</strong>',
        },
        {
          heading: 'Financial & Administrative Support',
          textHtml:
            'Within financial & administrative support, I create and manage invoices and process payments to ensure a fluent financial flow. I maintain bookkeeping and provide preparatory accounting services to keep financial records accurate and up to date. Additionally, I handle cash flow management to monitor the financial health of the business and plan for future developments.<br /><br /><strong>My aim is to establish a solid financial base and make administrative processes run in an orderly and cost-effective way.</strong>',
        },
      ],
    },
    features: {
      heading: 'As a business, are you optimally positioned to master your most significant challenges?',
      lede: 'How we tackle your pain points together - through customized solutions in the areas of resource management, scaling, market positioning and more with efficiency, reliability and growth.',
      mail: { label: 'contact@jmc-streamline.com', href: 'mailto:contact@jmc-streamline.com' },
      cards: [
        {
          heading: 'Real Estate & Property Management',
          text: 'Property management involves managing relationships with tenants and clients, coordinating maintenance and monitoring operating costs.',
        },
        {
          heading: 'SMEs',
          text: 'For small and medium-sized enterprises (SMEs), essential aspects of business management include managing resources, controlling costs, overcoming scaling challenges and integrating new technologies.',
        },
        {
          heading: 'Consulting Firms',
          text: 'In consulting, key challenges include managing client projects, diversifying expertise, ensuring operational efficiency and adapting to the market.',
        },
        {
          heading: 'Start-ups',
          text: 'For start-ups, rapid scaling, effective brand and market positioning, careful cash flow management and closing skills gaps are essential for success.',
        },
      ],
    },
    modal: {
      image: {
        src: '/media/contact-jmc-streamline-processes-s-l.jpg',
        alt: 'Contact Jmc Streamline Processes S L',
      },
    },
  },
};

/* ----------------------------------------------------------------- about */
export interface AboutData {
  intro: {
    heading: string;
    accent: string;
    lede: string;
  };
  bodyHtml: string;
  image: ImageData;
  impact: string;
  callout: string;
  videoSection: {
    heading: string;
    lede: string;
    video: string;
    videoFallback: string;
    ctaHeading: string;
    ctaText: string;
    cta: Cta;
  };
}

export const about: Record<Lang, AboutData> = {
  de: {
    intro: {
      heading: 'Ich helfe deinem Unternehmen zu wachsen.',
      accent: 'Mein Fokus',
      lede: 'Sieh mich als den Schlüssel zur Entfaltung des vollen Potenzials deines Unternehmens.',
    },
    bodyHtml:
      '<p>Hallo! Ich bin Jasmin-Madeleine A. Christensen-Matassa und ich freue mich, meine Reise mit Ihnen zu teilen. Ich bin in München geboren und aufgewachsen und habe seitdem an vielen Orten gelebt, von den sonnigen Küsten Australiens und Italiens über die USA und die UK bis hin zu den pulsierenden Städten Hamburg und Berlin. Mein Hintergrund ist so vielfältig wie die Kulturen, in die ich eingetaucht bin, was meine Einstellung zum Leben und zur Arbeit geprägt hat. Ich habe einen globalen Blick, spreche fließend Deutsch, Englisch und Italienisch und mache sehr gute Fortschritte in Spanisch.</p><p><b>Meine Karriere hat mich durch verschiedene aufregende Rollen geführt.</b></p><p>Ich habe vielbeschäftigte Büros geleitet, für ausgeglichene Buchführung gesorgt, Marketingkampagnen durchgeführt und Großveranstaltungen koordiniert. In jeder Position habe ich etwas Wertvolles darüber gelernt, wie man Dinge reibungslos und effizient ablaufen lässt, sei es die Organisation eines Teams oder die Planung einer großen Veranstaltung. Ich war auch mitten im operativen Geschäft und habe eng mit CEOs und anderen wichtigen Interessenvertretern zusammengearbeitet, um den Erfolg zu fördern.</p><p>Jetzt, da ich mich mit meiner Familie auf Mallorca niedergelassen habe, freue ich mich darauf, den mediterranen Lebensstil zu genießen, der an die Wurzeln meiner Familie erinnert. Dieser Umzug markiert den Start meines neuen Unternehmens, in dem ich meine Erfahrungen einbringe, um maßgeschneiderte Unterstützung zu bieten und Unternehmen zum Erfolg zu verhelfen.</p>',
    image: {
      src: '/media/ueber-mich-jasmin-madeleine-a-christensen-matassa.jpg',
      alt: 'Ueber Mich Jasmin Madeleine A Christensen Matassa',
    },
    impact: 'Ich bin bereit, neue Herausforderungen anzunehmen und Projekte bis zum erfolgreichen Abschluss zu begleiten.',
    callout:
      'Ganz gleich, ob ich in München, Hamburg oder auf Mallorca bin, ich habe immer einen Plan. Das ist einfach meine Art.',
    videoSection: {
      heading:
        'Ich bin hier, damit dein Unternehmen seine Ziele nicht nur erreicht, sondern übertrifft!',
      lede: 'Mein Ziel ist es, Netzwerke zu erweitern und kraftvolle, authentische Beziehungen zu schaffen.',
      video: '/videos/jasmin-christensen-matassa.mp4',
      videoFallback: 'Dein Browser unterstützt das Video-Tag nicht.',
      ctaHeading: 'Kennenlernen?',
      ctaText:
        'Vielen Dank, dass du dir die Zeit genommen hast, mehr über mich zu erfahren. Ich freue mich auf den Austausch und die Zusammenarbeit. Bei Fragen oder weiteren Anliegen stehe ich dir jederzeit zur Verfügung und gebe gerne zusätzliche Informationen.',
      cta: { label: 'Kontakt', href: '/de/kontakt/' },
    },
  },
  en: {
    intro: {
      heading: 'I help your business to grow.',
      accent: 'My Focus',
      lede: "Think of me as the key to unlocking your company's full potential.",
    },
    bodyHtml:
      "<p>Hi! I’m Jasmin-Madeleine A. Christensen-Matassa and I’m delighted to share my journey with you. I was born and raised in Munich and have since called many places home, from the sunny shores of Australia and Italy to the USA, the UK and the vibrant cities of Hamburg and Berlin. My background is as diverse as the cultures I’ve immersed myself in, which has shaped my approach to life and work. I have a global outlook, speak fluent German, English and Italian and am making very good progress in Spanish.</p><p><b>My career has taken me through various exciting roles.</b></p><p>I’ve managed busy offices, kept the bookkeeping balanced, run marketing campaigns, and coordinated major events. Each position taught me something valuable about how to make things run smoothly and efficiently, whether it’s organizing a team or planning a large event. I’ve also been right at the heart of business operations, working closely with CEOs and other key stakeholders to drive success.</p><p>Now, as I settle in Mallorca with my family, I am thrilled to tap into the Mediterranean lifestyle that echoes my family’s roots. This move marks the beginning of a new venture for me—a venture where I aim to bring all my experiences together to provide tailored support that helps businesses thrive.</p>",
    image: {
      src: '/media/about-me-jasmin-madeleine-a-christensen-matassa.jpg',
      alt: 'About Me Jasmin Madeleine A Christensen Matassa',
    },
    impact: 'I am ready to take on new challenges and to see projects through to a successful conclusion.',
    callout: 'Wherever I am, from Munich to Hamburg or Mallorca, I have a plan. That\'s just who I am.',
    videoSection: {
      heading: 'I’m here to make sure your business not only meets but exceeds its goals.',
      lede: 'I believe in the power of connecting with others and building strong relationships.',
      video: '/videos/jasmin-christensen-matassa.mp4',
      videoFallback: 'Your browser does not support the video tag.',
      ctaHeading: 'Reach out!',
      ctaText:
        'Thank you for taking the time to learn more about me. I look forward to exchanging ideas and working with you. If you have any questions or concerns, I am always available and happy to provide additional information.',
      cta: { label: 'Contact', href: '/en/contact/' },
    },
  },
};

/* --------------------------------------------------------------- contact */
export interface ContactData {
  hero: {
    heading: string;
    accent: string;
    lede: string;
    image: ImageData;
  };
  info: {
    heading: string;
    text: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    socialsLabel: string;
  };
  formHeading?: string;
}

export const contact: Record<Lang, ContactData> = {
  de: {
    hero: {
      heading: 'Sprich mich an – ich unterstütze dich gerne!',
      accent: 'Kontakt',
      lede: 'Mit umfassender Beratung und Betreuung stehe ich dir gerne zur Seite. Wenn du Fragen hast oder professionelle Hilfe benötigst, kannst du mich jederzeit telefonisch oder über das Kontaktformular erreichen.',
      image: {
        src: '/media/telefongespraech-kontakt-aufnehmen.jpg',
        alt: 'Telefongespraech Kontakt Aufnehmen',
      },
    },
    info: {
      heading: 'Ich freue mich auf deine Nachricht!',
      text: 'Ich stehe dir in drei Sprachen (Deutsch, Englisch, Italienisch) zur Verfügung und freue mich darauf, dein Anliegen zu besprechen. Lass mich gerne wissen, wie ich dich gezielt unterstützen kann.',
      phoneLabel: 'Telefon',
      emailLabel: 'E-Mail',
      addressLabel: 'Adresse',
      socialsLabel: 'Socials',
    },
  },
  en: {
    hero: {
      heading: 'Reach out - I am happy to support you!',
      accent: 'Contact',
      lede: 'I am at your side with comprehensive advice and support. If you have any questions or need professional help, you can contact me at any time by phone or via the contact form.',
      image: { src: '/media/contact-telephone-talk.jpg', alt: 'Contact Telephone Talk' },
    },
    info: {
      heading: 'Looking forward hearing from you!',
      text: 'Please feel free to contact me in three languages (German, English, Italian) and discuss any concerns you may have. Don\'t hesitate to let me know how I can help you in a targeted manner.',
      phoneLabel: 'Phone',
      emailLabel: 'E-mail',
      addressLabel: 'Address',
      socialsLabel: 'Socials',
    },
  },
};

/* ------------------------------------------------------------------ blog */
export interface BlogIntro {
  heading: string;
  accent: string;
  paragraphs: string[];
}

export const blogIntro: Record<Lang, BlogIntro> = {
  de: {
    heading: 'Ideen und Einblicke für Arbeit und Leben',
    accent: 'Blog',
    paragraphs: [
      'Willkommen beim jmc. Blog! Hier teile ich Gedanken und Erfahrungen, die mich auf meinem Weg begleiten. Es geht um Themen, die mir wichtig sind und die das Leben – beruflich wie privat – ein bisschen klarer und einfacher machen können.',
      'Ich schreibe darüber, was mich bewegt. Dabei geht es nicht nur um Prozesse und Strukturen, sondern auch um Kreativität, neue Ideen und kleine Veränderungen, die oft einen großen Unterschied machen. Vieles davon stammt aus meinem Alltag – aus den Momenten, in denen ich selbst innehalte, etwas hinterfrage oder einen neuen Weg entdecke.',
      'Ganz gleich, ob es sich um schlanke Prozesse, frische Ansätze oder persönliche Einsichten handelt – meine Beiträge sollen Anregungen geben und neue Perspektiven eröffnen. Ich möchte keinen fertigen Plan liefern, sondern einen Raum schaffen, in dem Ideen wachsen können. Mal ist es ein kleiner Gedanke, mal eine große Idee – alles, was ich hier teile, begleitet mich selbst auf meinem Weg.',
      'Lass dich inspirieren und nimm mit, was dich anspricht. Vielleicht ist ein Gedanke dabei, der gerade richtig kommt, oder eine Idee, die deinen Blick verändert.',
    ],
  },
  en: {
    heading: 'Ideas and insights for work and life',
    accent: 'Blog',
    paragraphs: [
      'Welcome to the jmc. blog!! Here I share thoughts and experiences that accompany me on my journey. It’s about topics that are important to me and that can make life – both professionally and privately – a little clearer and a little easier.',
      'I am writing about what drives me. It’s not just about processes and structures, it’s also about creativity, new ideas and small shifts that often make a big difference. Much of this comes from my day-to-day life – from moments when I stop for a moment, question something or discover a new direction.',
      'Whether it’s streamlined processes, fresh approaches or personal insights – my blog posts are there to provide inspiration and open up new perspectives. I don’t want to provide a ready-made plan, rather a place where ideas can blossom. Sometimes it’s a small thought, sometimes a bigger idea – everything I share on this blog is something that accompanies me on my journey.',
      'Pick up what speaks to you and let yourself be inspired. Perhaps you will find a timely thought or an idea that will help you to transform your view of something.',
    ],
  },
};

/** Category archive pages: title is empty, the accent heading carries the name. */
export const categoryIntroHeading: Record<Lang, string> = {
  de: '',
  en: '',
};
