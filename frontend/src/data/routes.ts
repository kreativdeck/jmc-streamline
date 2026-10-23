/**
 * Route inventory of the rebuilt site. Every public page of the original
 * site (except the newsletter area, which the client dropped) is listed here.
 */
import postsJson from './generated/posts.json';
import listingJson from './generated/listing.json';
import legalJson from './generated/legal.json';
import seoJson from './generated/seo.json';
import categoryIntroJson from './generated/category_intro.json';
import type { Lang } from './site';

export interface PostRecord {
  id: number;
  lang: Lang;
  slug: string;
  title: string;
  date: string;
  dateDisplay: string;
  category: { slug: string; name: string };
  featured: { src: string; alt: string } | null;
  excerpt: string;
  lede: string;
  toc: { level: number; text: string }[];
  body: string;
  homeLabel: string;
  tocHeading: string;
  cta: { heading: string; lede: string; label: string; href: string };
}

export interface CategoryIntro {
  heading: string;
  accent: string;
  paragraphs: string[];
}

export interface CardRecord {
  href: string;
  title: string;
  cat: string;
  day: string;
  month: string;
  image: { src: string; alt: string } | null;
  footerDate?: string;
  author?: string;
}

/** eRecht24 badge shown at the end of the legal pages (original markup/placement) */
export interface LegalBadge {
  src: string;
  alt: string;
  title: string;
  placement: 'container' | 'columns';
}

const legalBadges: Record<string, LegalBadge> = {
  impressum: { src: '/media/erecht24-impressum.png', alt: 'Erecht24 Impressum', title: 'Datenschutzerklärung', placement: 'container' },
  datenschutzerklaerung: { src: '/media/erecht24-datenschutz.png', alt: 'Erecht24 Datenschutz', title: 'Datenschutzerklärung', placement: 'columns' },
  imprint: { src: '/media/erecht24-imprint.png', alt: 'Erecht24 Imprint', title: 'Datenschutzerklärung', placement: 'columns' },
  'privacy-policy': { src: '/media/erecht24-privacy-policy.png', alt: 'Erecht24 Privacy Policy', title: 'Datenschutzerklärung', placement: 'columns' },
};

export type RouteType = 'about' | 'services' | 'contact' | 'blog' | 'legal' | 'category' | 'post';

export interface RouteEntry {
  lang: Lang;
  slug: string;
  type: RouteType;
  translations: { de: string; en: string };
  title: string;
  description: string;
  /** category archives */
  categoryName?: string;
  cards?: CardRecord[];
  categoryIntro?: CategoryIntro;
  /** legal pages */
  legal?: { h1: string; columns: string[]; badge?: LegalBadge };
  /** blog posts */
  post?: PostRecord;
  categoryHref?: string;
  blogHref: string;
  homeLabel: string;
}

const posts = (postsJson as unknown as { posts: PostRecord[] }).posts;
const listing = listingJson as unknown as Record<string, CardRecord[] | Record<string, CardRecord[]>>;
const legal = legalJson as unknown as Record<string, { h1: string; columns: string[] }>;
const seo = seoJson as unknown as Record<string, { title: string; description: string }>;
const categoryIntros = categoryIntroJson as unknown as Record<string, CategoryIntro>;

/** fixed pages: DE slug / EN slug */
const pages: { type: RouteType; de: string; en: string; legalKey?: { de: string; en: string }; categoryNames?: { de: string; en: string } }[] = [
  { type: 'about', de: 'ueber-mich', en: 'about-me' },
  { type: 'services', de: 'services', en: 'services' },
  { type: 'contact', de: 'kontakt', en: 'contact' },
  { type: 'blog', de: 'blog', en: 'blog' },
  {
    type: 'legal',
    de: 'impressum',
    en: 'imprint',
    legalKey: { de: 'impressum', en: 'imprint' },
  },
  {
    type: 'legal',
    de: 'datenschutzerklaerung',
    en: 'privacy-policy',
    legalKey: { de: 'datenschutzerklaerung', en: 'privacy-policy' },
  },
];

/** category archives: DE slug / EN slug + display names */
const categories = [
  { de: 'allgemein', en: 'generally', names: { de: 'Allgemein', en: 'Generally' } },
  { de: 'insights', en: 'insights', names: { de: 'Insights', en: 'Insights' } },
  { de: 'leadership', en: 'leadership', names: { de: 'Leadership', en: 'Leadership' } },
];

const blogHref = (lang: Lang) => `/${lang}/blog/`;
const homeLabel = (lang: Lang) => (lang === 'de' ? 'Home' : 'Home');

/** DE/EN post pairs (explizite Slugs, wie in der Originalseite verknüpft) */
const postPairsMap: { de: string; en: string }[] = [
  { de: 'stillstand-ist-keine-option', en: 'standing-still-is-not-an-option' },
  {
    de: 'warum-leadership-und-sport-das-ultimative-power-duo-sind',
    en: 'why-leadership-and-sports-are-the-ultimate-power-duo',
  },
  {
    de: 'effiziente-geschaeftsprozesse-fuer-expats-5-smarte-strategien-fuer-den-internationalen-arbeitsalltag',
    en: 'efficient-business-processes-for-expats-5-smart-strategies-for-international-work',
  },
  {
    de: 'warum-illustrationen-der-kreative-weg-zu-klarheit-und-verbindung',
    en: 'why-illustrations-the-creative-path-to-clarity-and-connection',
  },
  {
    de: 'effiziente-meetings-in-einer-globalen-geschaeftswelt-kulturelle-unterschiede-verstehen',
    en: 'efficient-meetings-in-a-global-business-world-understanding-cultural-differences',
  },
  {
    de: 'wie-schlanke-prozesse-unternehmen-und-leben-verandern',
    en: 'transformation-of-businesses-and-lives-with-lean-processes',
  },
];

function postPairs(): { de: PostRecord; en: PostRecord }[] {
  return postPairsMap.map((pair) => ({
    de: posts.find((p) => p.lang === 'de' && p.slug === pair.de)!,
    en: posts.find((p) => p.lang === 'en' && p.slug === pair.en)!,
  }));
}

export function allRoutes(): RouteEntry[] {
  const routes: RouteEntry[] = [];

  for (const page of pages) {
    for (const lang of ['de', 'en'] as Lang[]) {
      const slug = page[lang];
      const key = `${lang}:${slug}`;
      routes.push({
        lang,
        slug,
        type: page.type,
        translations: { de: `/de/${page.de}/`, en: `/en/${page.en}/` },
        title: seo[key]?.title ?? slug,
        description: seo[key]?.description ?? '',
        legal: page.legalKey
          ? { ...legal[page.legalKey[lang]], badge: legalBadges[page.legalKey[lang]] }
          : undefined,
        blogHref: blogHref(lang),
        homeLabel: homeLabel(lang),
      });
    }
  }

  for (const cat of categories) {
    for (const lang of ['de', 'en'] as Lang[]) {
      const slug = cat[lang];
      const key = `${lang}:${slug}`;
      const cards = (listing[key] as CardRecord[]) ?? [];
      routes.push({
        lang,
        slug,
        type: 'category',
        translations: { de: `/de/${cat.de}/`, en: `/en/${cat.en}/` },
        title: seo[key]?.title ?? slug,
        description: seo[key]?.description ?? '',
        categoryName: cat.names[lang],
        cards,
        categoryIntro: categoryIntros[key],
        blogHref: blogHref(lang),
        homeLabel: homeLabel(lang),
      });
    }
  }

  for (const pair of postPairs()) {
    for (const lang of ['de', 'en'] as Lang[]) {
      const post = pair[lang];
      const key = `${lang}:${post.slug}`;
      routes.push({
        lang,
        slug: post.slug,
        type: 'post',
        translations: { de: `/de/${pair.de.slug}/`, en: `/en/${pair.en.slug}/` },
        title: seo[key]?.title ?? post.title,
        description: seo[key]?.description ?? post.excerpt,
        post,
        categoryHref: `/${lang}/${post.category.slug}/`,
        blogHref: blogHref(lang),
        homeLabel: post.homeLabel,
      });
    }
  }

  return routes;
}

/** cards of the blog listing page */
export function blogCards(lang: Lang): CardRecord[] {
  const blog = listing.blog as Record<string, CardRecord[]>;
  return blog[lang] ?? [];
}

export const homeTranslations = { de: '/de/', en: '/en/' };
