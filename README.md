# Website jmc. | Streamline Processes S.L.

Originalgetreuer Nachbau der öffentlichen Website
<https://www.jmc-streamline.com/de/> und `/en/` mit Astro, Tailwind CSS und
TypeScript. Die Seiten werden statisch erzeugt. Auf Linevast versendet das
Kontaktformular über PHP und SMTP; lokal steht ein Node.js-Endpunkt zur Verfügung.
CMS, Datenbank und Docker sind für die neue Website nicht nötig.

Der Newsletter-Bereich der Originalseite (Seiten, An-/Abmeldebestätigungen,
Menüpunkt) wurde auf Kundenwunsch bewusst **nicht** übernommen.

## Lokal arbeiten

Node.js 24 und npm verwenden. Nach einem frischen Checkout im Ordner
`frontend/` zuerst `npm ci` ausführen.

Im Ordner `frontend/`:

- `npm run dev`: Entwicklungsserver (z. B. `npm run dev -- --host 127.0.0.1 --port 4321`),
  danach <http://localhost:4321/de/> öffnen.
- `npm run check`: Astro und TypeScript prüfen.
- `npm run build`: statische Website in `dist/` erzeugen (33 Seiten).
- `npm run preview`: den Build lokal ansehen.
- `node ../research/qa/check-links.mjs dist`: interne Links und lokale Dateien
  im Build prüfen (nach `npm run build`).
- `node ../research/qa/check-pairs.mjs dist`: alle 32 Sprachwechsel prüfen.
- Vom Projektstamm: `python3 research/qa/check-seo.py` vergleicht Titel,
  Descriptions, Social-Metadaten, Canonicals, hreflang und JSON-LD aller 32
  Sprachseiten mit dem gespeicherten Original und prüft Sitemap/Medienpfade.

Server mit Ctrl+C beenden. Falls Astro einen Hintergrundprozess startet,
`npm run dev -- stop` beziehungsweise `npm run preview -- stop` verwenden.

## Seiten

Es gibt 32 Sprachseiten plus eine Weiterleitung auf der Wurzel (`/`):

| Bereich | Deutsch | Englisch |
| --- | --- | --- |
| Startseite | `/de/` | `/en/` |
| Über mich | `/de/ueber-mich/` | `/en/about-me/` |
| Services | `/de/services/` | `/en/services/` |
| Kontakt | `/de/kontakt/` | `/en/contact/` |
| Blog | `/de/blog/` | `/en/blog/` |
| Kategorien | `/de/allgemein/`, `/de/insights/`, `/de/leadership/` | `/en/generally/`, `/en/insights/`, `/en/leadership/` |
| Rechtliches | `/de/impressum/`, `/de/datenschutzerklaerung/` | `/en/imprint/`, `/en/privacy-policy/` |
| Blogartikel | 6 Artikel | 6 Artikel |

Die Zuordnung der Sprachpaare steht in `frontend/src/data/routes.ts`; der
Sprachwechsel im Header verweist immer auf die jeweilige Partnerseite.
Eine vollständige Abdeckung und die durchgeführten Prüfungen stehen in
[docs/rebuild-audit.md](docs/rebuild-audit.md).

## Projektdateien

- `frontend/src/pages/[lang]/index.astro`, `frontend/src/pages/[lang]/[slug]/index.astro`:
  Startseite und alle weiteren Seiten je Sprache; `frontend/src/pages/index.astro`
  leitet die Wurzel weiter.
- `frontend/src/data/`: Routen (`routes.ts`), Texte und Navigation (`site.ts`,
  `pages.ts`) sowie aus der Originalseite übernommene Inhalte (`generated/*.json`).
- `frontend/src/components/`: Header, Footer, Seitenbausteine, Kontaktformular
  und Kontakt-Modal, Blog- und Artikel-Komponenten.
- `frontend/src/layouts/BaseLayout.astro`: Seitenrahmen, Meta-Angaben, Menü- und
  Scroll-Verhalten.
- `frontend/src/styles/global.css`: Tailwind-Theme (gemessene Farben, Abstände,
  Schriftgrößen), lokale Schriften und globale Element-Basisregeln. Die
  Komponentengestaltung besteht aus Tailwind-Utilities; Funktionen verwenden
  `data-*`-Attribute und ARIA-Zustände.
- `frontend/src/data/generated/seo.json` und `schema.json`: originale
  SEO-/Social-Metadaten und strukturierte Daten je Sprachseite.
- `frontend/src/pages/sitemap.xml.ts` und `robots.txt.ts`: beim statischen Build
  erzeugte Sitemap mit allen 32 Sprachseiten und robots.txt.
- `frontend/public/media`, `frontend/public/fonts`, `frontend/public/videos`:
  lokale Bilder, Logos, Schriften und Videos (aus `02_Assets` bzw. der Originalseite).
- `research/`: Recherche-Material (Original-HTML/CSS, Inventar, QA-Skripte).
  Es wird nicht ausgeliefert und ist keine Laufzeit-Abhängigkeit.
- `docs/rebuild-audit.md`: Abdeckung, Prüfungen und offene Punkte.
- `AGENTS.md`: gemeinsamer KI-Projektkontext; `CLAUDE.md` importiert ihn.

## Kontaktformular und Veröffentlichung

Das Formular sendet an `/api/contact`. In `backend/` liegt der zugehörige
Node.js-SMTP-Dienst: Admin-Mail und Autoresponder jeweils auf Deutsch oder
Englisch, passend zum Formular. Die Signatur verwendet die bestätigte Adresse
Gremi des Fusters 33, Local 6, ES-07009 Palma.

Lokal in einem zweiten Terminal im Ordner `backend/` zunächst `npm ci`, danach
`npm start` ausführen. Astro leitet den Endpunkt an Port 4322 weiter.
Ohne SMTP-Passwort meldet das Formular ausdrücklich, dass nichts gesendet wurde.
`npm test` im Backend prüft den Versand mit simuliertem Mailtransport.

SMTP-Zugang lokal konfiguriert und Anmeldung am 23.10.2026 erfolgreich geprüft.
Für Linevast liegt der gleichwertige PHP-Endpunkt unter `backend/php/`.
PHP 8.2.34 und die SMTP-Anmeldung wurden auf dem Zielhosting geprüft.
Sieben Prüfungen mit simuliertem Versand sind dort bestanden. Eine tatsächliche
Zustellungsprüfung steht noch aus; dabei werden echte E-Mails verschickt.
Anleitung und Grenzen: [backend/README.md](backend/README.md).

Das Projekt liegt auf [GitHub](https://github.com/kreativdeck/jmc-streamline).
GitHub verwaltet den Quellcode; die Website wird auf Linevast ausgeliefert.
Deployment und Sicherung: [deployment/README.md](deployment/README.md).
Das Projekt ist unabhängig vom Website-Starter und erhält keine automatischen Updates.
