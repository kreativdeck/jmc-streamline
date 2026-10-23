# Rebuild-Audit: jmc. | Streamline Processes S.L.

Stand: 23.10.2026. Ziel: originalgetreuer Nachbau der öffentlichen Website
<https://www.jmc-streamline.com/de/> und `/en/` mit Astro 7, Tailwind CSS 4 und
TypeScript. Nichts wurde „verbessert“; Abweichungen vom Original sind unten
ausdrücklich genannt.

## 1. Routenabdeckung

Quelle der Original-URLs: `robots.txt` → `sitemap.xml` →
`sitemap-post-type-post.xml`, `sitemap-post-type-page.xml`,
`sitemap-taxonomy-category.xml` (`/sitemap_index.xml` und `/wp-sitemap.xml`
liefern 404). REST `/wp-json/wp/v2/pages?per_page=100` liefert 22 Seiten, davon
8 Newsletter-Seiten (bewusst nicht übernommen); Beiträge: 12; Kategorien: 3 je
Sprache.

Gebaut werden **33 Seiten** (`npm run build`): 32 Sprachseiten + Weiterleitung
`/` → `/de/`.

| Typ | Deutsch | Englisch | Gebaut |
| --- | --- | --- | --- |
| Startseite | `/de/` | `/en/` | ✔ ✔ |
| Über mich | `/de/ueber-mich/` | `/en/about-me/` | ✔ ✔ |
| Services | `/de/services/` | `/en/services/` | ✔ ✔ |
| Kontakt | `/de/kontakt/` | `/en/contact/` | ✔ ✔ |
| Blog | `/de/blog/` | `/en/blog/` | ✔ ✔ |
| Impressum | `/de/impressum/` | `/en/imprint/` | ✔ ✔ |
| Datenschutz | `/de/datenschutzerklaerung/` | `/en/privacy-policy/` | ✔ ✔ |
| Kategorie | `/de/allgemein/` | `/en/generally/` | ✔ ✔ |
| Kategorie | `/de/insights/` | `/en/insights/` | ✔ ✔ |
| Kategorie | `/de/leadership/` | `/en/leadership/` | ✔ ✔ |
| Beitrag 1 | `/de/stillstand-ist-keine-option/` | `/en/standing-still-is-not-an-option/` | ✔ ✔ |
| Beitrag 2 | `/de/warum-leadership-und-sport-das-ultimative-power-duo-sind/` | `/en/why-leadership-and-sports-are-the-ultimate-power-duo/` | ✔ ✔ |
| Beitrag 3 | `/de/effiziente-geschaeftsprozesse-fuer-expats-5-smarte-strategien-fuer-den-internationalen-arbeitsalltag/` | `/en/efficient-business-processes-for-expats-5-smart-strategies-for-international-work/` | ✔ ✔ |
| Beitrag 4 | `/de/warum-illustrationen-der-kreative-weg-zu-klarheit-und-verbindung/` | `/en/why-illustrations-the-creative-path-to-clarity-and-connection/` | ✔ ✔ |
| Beitrag 5 | `/de/effiziente-meetings-in-einer-globalen-geschaeftswelt-kulturelle-unterschiede-verstehen/` | `/en/efficient-meetings-in-a-global-business-world-understanding-cultural-differences/` | ✔ ✔ |
| Beitrag 6 | `/de/wie-schlanke-prozesse-unternehmen-und-leben-verandern/` | `/en/transformation-of-businesses-and-lives-with-lean-processes/` | ✔ ✔ |

Ausgeschlossen (Kundenwunsch): Newsletter-Seiten DE/EN, An-/Abmeldebestätigungen
und der Menüpunkt „Newsletter“ (Header, Footer). Der Begriff „Newsletter“
kommt nur noch im originalen Datenschutztext vor (Abschnitt zur
Datenverarbeitung) und wurde dort nicht verändert.

## 2. Durchgeführte Prüfungen

Die technischen Prüfungen beziehen sich auf den aktuellen Tailwind-Build.
Layoutmessungen des vorigen Auftrags werden gesondert benannt.

| Prüfung | Ergebnis |
| --- | --- |
| `npm run check` (Astro + TypeScript) | 0 Fehler, 0 Warnungen, 0 Hinweise |
| `npm run build` | 33 Seiten erfolgreich |
| `node research/qa/check-links.mjs frontend/dist` | 33 HTML-Seiten, 543 interne Links, 270 lokale Dateiverweise: keine Defekte |
| `node research/qa/check-pairs.mjs dist` | Sprachwechsel auf allen 32 Seiten entspricht den hreflang-Partnern des Originals |
| `python3 research/qa/check-seo.py` | 32 Titel, alle vorhandenen Descriptions, Social-Metadaten und 32 JSON-LD-Blöcke stimmen mit dem Original überein; dokumentierte URL-/Such-Anpassungen siehe Abschnitt 7 |
| Ausgeliefertes Markup | Keine alten Builder-Klassen/-IDs, keine Inline-Styles; keine eigenen Komponenten-Styles in den Astro-Dateien |
| Vergleich mit dem Original im Browser (T3-Vorschau) | Seitenhöhe und Abschnittshöhen von 32 Seiten bei 1280 px und 17 Seiten bei 390 px gegen die Live-Seite gemessen; siehe „Abweichungen“ |
| Horizontaler Überlauf bei 390 px | behoben (Footer-Navigation, Startseite, Kontakt, Services, Über mich); offen siehe Abschnitt 4 |

Die Messungen (iframe-basiert, gleiche Pfade auf Original und Nachbau) liegen
nicht als Skript im Projekt, weil sie nur einmalig zum Abgleich dienten. Die
reproduzierbaren Prüfskripte sind `research/qa/check-links.mjs` und
`research/qa/check-pairs.mjs`.

## 3. Medien, Logos, Favicon

- Logos: dunkles Logo `jasmin-christensen-matassa-business-operations-management.svg`
  (Header auf Unterseiten, Footer), helles Logo
  `business-operations-management-jasmin-christensen-matassa.svg` (Header der
  Startseite über dem Hero-Video und Kontakt-Modal). Originale in `02_Assets/Image`
  sind unverändert.
- Favicon: `favicon-jmc-streamline-processes.png` (`frontend/public/favicon*.png`).
- Videos (`frontend/public/videos`): `szene-1.mp4` (Hero Startseite DE/EN; das
  Original nutzt eine 1080p-Fassung derselben Aufnahme) und
  `jasmin-christensen-matassa.mp4` (Über mich). `Beratungsgespräch 1/2.mp4`
  werden von keiner öffentlichen Seite des Originals verwendet und sind deshalb
  nicht eingebunden.
- eRecht24-Siegel auf Impressum/Datenschutz (4 PNG, aus `02_Assets/Image`).
- `polylang-pro.zip` aus `02_Assets/Image` ist kein Medienasset und wurde weder
  veröffentlicht noch installiert.
- Eingebundene Schriften lokal (`frontend/public/fonts`): Inter und Nunito.
  Die mitgelieferte Script-Schrift liegt ebenfalls im Ordner, wird derzeit aber
  von keinem Seitenelement benötigt.

## 4. Offene Punkte / bekannte Abweichungen

1. **Kontaktformular-Versand (implementiert, Aktivierung noch offen).** Das Formular ist
   optisch/im Verhalten dem Original nachgebaut (Felder ohne sichtbare Labels
   mit Placeholdern und `aria-label`, E-Mail und Telefon nebeneinander ab
   1200 px, Pflichtfelder E-Mail und Nachricht, Datenschutzhinweis, Button),
   und an `/api/contact` angebunden. Ein separater Node.js-SMTP-Dienst in
   `backend/` erzeugt Admin-Mail und Autoresponder passend zur Formularsprache.
   Der WordPress-Endpunkt wird nicht benutzt. Ohne SMTP-Passwort erfolgt
   ausdrücklich kein Versand. Offen: Zugangsdaten, reale Zustellprüfung und
   Live-Einbindung des Endpunkts. Details siehe Abschnitt 9 und `backend/README.md`.
2. **Videogröße.** `szene-1.mp4` ist die 4K-Originaldatei des Kunden (33 MB);
   das Original liefert eine ca. 5,7 MB große 1080p-Fassung. Für den Livegang
   sollte eine komprimierte Fassung bereitgestellt werden (nicht verändert,
   weil keine Änderung gewünscht war).
3. **Newsletter** fehlt absichtlich; dadurch ist der Footer auf schmalen
   Bildschirmen eine Zeile (ca. 43 px) kürzer als im Original.
4. **Kleine Maßabweichungen (≤ 6 px je Seite)** bei einzelnen Abschnitten
   (z. B. Services-Karten, Beitrags-CTA); sie ergeben sich aus Rundungen und
   Schriftmetriken und wurden nicht weiterverfolgt.
5. **Lesezeit** der Beiträge ist im Original ein clientseitig berechneter Wert;
   im Nachbau sind die dort angezeigten Minuten je Beitrag fest hinterlegt.
6. **Nicht geprüft:** Barrierefreiheits-Audit und Performance-Messung (nicht Teil
   des Auftrags „originalgetreu“). Titel, Beschreibungen und hreflang-Angaben der
   Seiten sind aus dem Original übernommen. `sitemap.xml` und `robots.txt`
   werden inzwischen statisch erzeugt; Details siehe Abschnitt 7.
7. Die Social-Links auf beiden Kontaktseiten wurden auf Kundenwunsch vom
   ursprünglichen Platzhalter `#` auf die Instagram- und Facebook-Profile aus
   der zentralen Footer-Konfiguration korrigiert. Sie öffnen ein neues Tab.

## 5. Technologie (Tailwind/Astro)

- Native Astro-Komponenten, statischer Build, keine Laufzeit-Frameworks im
  Frontend. Separater Node.js-Dienst für den SMTP-Versand.
- `frontend/src/styles/global.css` bindet Tailwind 4 ein und enthält ein
  reduziertes `@theme`, lokale `@font-face`-Definitionen und echte globale
  Element-Basisregeln. Layout, Komponentenvarianten und Zustände werden mit
  Tailwind-Utilities gestaltet, einschließlich responsiver, ARIA- und
  Datenattribut-Varianten. Es gibt keine eigenen Komponenten-Stilklassen,
  keine scoped CSS-Blöcke und keinen `@apply`-Klassenapparat.
- Menü, Header-Scroll und Kontaktmodal verwenden sprechende `data-*`-Attribute.
  Skiplinks verwenden semantische IDs (`main-content`, `site-footer`).
- Original-HTML/CSS unter `research/` dient ausschließlich dem Abgleich und wird
  nicht ausgeliefert oder als Laufzeit-Abhängigkeit verwendet.

## 6. Änderungen der Abschlussrunde (23.10.2026)

- Kontaktformular: Markup/Layout wie im gerenderten Original (Name voll breit,
  E-Mail/Telefon nebeneinander ab 1200 px, 20-px-Gutter, Unterstrich-Felder,
  Button-Umbruch wie im Original, Pflichtfeld-Hinweise).
- Header: Unterseiten nutzen wie im Original den „Standard“-Header (dunkles Logo,
  sticky im Seitenfluss, blendet beim Herunterscrollen aus); die Startseite den
  „Overlay“-Header mit hellem Logo.
- Kategorie-Archive: eine Karte je Zeile ohne Zwischenabstand, leerer Intro-Block
  bei „Allgemein/Generally“.
- Beiträge: Titelbild sichtbar, Inhaltsverzeichnis nur H2 und ohne Nummerierung,
  Lesezeit, Absatzabstände, Autoren-Box.
- Rechtstexte: eRecht24-Siegel ergänzt, Überschriften-Abstände.
- Über mich: Dreispaltiges Raster (Bild/Impact-Statement in der Mitte),
  Responsive-Regeln des Originals.
- Services/Startseite: Intro-Kopf, Karten-Icons, Raster-Abstände, Mobil-Regeln.
- Global: Zeilenhöhe von `p`/`li` je Elementgröße, Absatzabstände ohne
  Standard-Unterabstand, Footer-Breite auf Mobilgeräten.

## 7. SEO-Abschlussprüfung mit GPT Sol (23.10.2026)

- Alle 32 Sprachseiten wurden im erzeugten HTML gegen das gespeicherte Original
  geprüft: **32/32 SEO-Titel identisch**, **30/30 vorhandene Meta-Descriptions
  identisch**. `/de/allgemein/` und `/en/generally/` haben wie im Original keine
  Meta-Description; es wurden keine Texte erfunden.
- Open Graph, Twitter Cards, Robots-Metadaten, Bildtexte/-maße und vorhandene
  Artikel-/Änderungsdaten sind übernommen. Originale Bilder für Blog-/Kategorie-
  Teaser werden nun auch in den Metadaten verwendet, statt überall dasselbe
  Standardbild zu setzen. Canonical und hreflang stimmen auf allen Sprachseiten
  mit dem Original überein; die Startseiten enthalten außerdem `x-default`.
- **32/32 JSON-LD-Blöcke vorhanden und mit dem Original abgeglichen.** Dazu
  gehören WebSite, Organization, WebPage, BreadcrumbList, CollectionPage,
  AboutPage, ContactPage, ReadAction und alle zwölf BlogPosting-/ImageObject-
  Einträge. Es wurden keine neuen Leistungen, Bewertungen oder Autoren erfunden.
- Dokumentierte technische Anpassungen am JSON-LD: Upload-URLs verwenden die
  enthaltenen `/media/`-Dateien; das Organisationslogo verweist auf die vorhandene
  192-px-Favicon-Variante. `SearchAction` und die darauf verweisende
  `potentialAction` sind entfernt, weil der statische Nachbau keinen Such-Endpunkt
  anbietet. Alle übrigen Schema-Inhalte stimmen nach dieser Normalisierung überein.
- Schema- und Metadaten-Bilder wurden auf lokale Existenz geprüft. JSON ist
  syntaktisch gültig. Dies ist ein Quell-/Buildabgleich, kein Nachweis einer
  Freigabe durch Google oder eines externen Rich-Results-Tests.
- `/sitemap.xml` enthält alle 32 Sprachseiten und ihre Sprachpartner, keine
  Newsletter-Seiten. `/robots.txt` erlaubt Crawling und nennt diese Sitemap.
  Die Domain bleibt wie im Original `https://www.jmc-streamline.com`.
- Reproduzierbar vom Projektstamm: `python3 research/qa/check-seo.py`.
  `--sync` importiert die originalen Head-Metadaten in `seo.json`; danach ist ein
  neuer Build nötig. Ergebnis der letzten Prüfung: `docs/seo-audit.json`.
- Offen bleibt der Kontaktformular-Versand aus Abschnitt 4. Die Website ist
  deshalb noch nicht als vollständig funktionsfertig für den Livegang freigegeben.

## 8. Gewünschte Darstellungskorrekturen (23.10.2026)

- Startseite: Icons der Karten zu Unternehmenswachstum und operativer Exzellenz
  in der Akzentfarbe; Kontaktband-Überschrift weiß; E-Mail-Button bei Hover mit
  weißer Schrift. In der englischen Fassung liegt die Exzellenz-Karte an dritter
  statt an fünfter Stelle; die Farbe folgt dem Inhalt.
- Services: Consulting- und Financial-/Administrative-Support-Icons in der
  Akzentfarbe. Intro über der dekorativen Fläche angeordnet, damit Überschrift
  und Einleitung sichtbar bleiben. E-Mail-Button ebenfalls mit weißem Hover-Text.
  Die Label-Zeile „Der Weg“ / „The Way“ richtet ihre Elemente mit `items-start`
  aus, damit der graue Hintergrund nur den Text umschließt. DE/EN bei 390 und
  1280 px im Browser geprüft; anschließender Build erfolgreich.
- Footer: vollständiger Instagram-SVG-Pfad aus den vorhandenen Icon-Daten;
  Copyright `© 2025 - {aktuelles Jahr} jmc.`. Ein Clientskript aktualisiert das
  Jahr auch bei einem älteren statischen Build. Jahreswechsel auf 2027 im
  Browser simuliert und erfolgreich geprüft.
- Blogübersicht: Kartentitel verwenden `text-h4` (`--text-h4`). Kategoriearchive
  behalten ihre bisherige Titelgröße.
- Blogartikel: linke Fläche als Tailwind-Verlauf von `accent-ultra-light` oben
  zu Weiß unten, ohne harte Farbkante zur Fußzeile.
- Prüfung: Astro/TypeScript und Build erfolgreich; Desktop bei 1280 px und
  mobile Ansichten bei 390 px kontrolliert, DE/EN ohne horizontalen Überlauf.
  Farbwerte, Hover, sichtbare Services-Überschrift, Blog-Schriftgröße und Verlauf
  im Browser geprüft. SEO-Abgleich bleibt auf allen 32 Sprachseiten erfolgreich.

## 9. Kontaktformular: bestätigte Vorgaben, Versand noch offen

- Admin-Benachrichtigung und Autoresponder werden jeweils in der Sprache des
  ausgefüllten Formulars erstellt: Deutsch für DE, Englisch für EN. Die zuvor
  genannte ausschließlich englische Umsetzung ist ausdrücklich verworfen.
- SMTP-Daten laut bereitgestelltem Screenshot: `mail.jmc-streamline.com`,
  Port `465`, SSL/TLS ab Verbindungsbeginn, Authentifizierung aktiviert;
  Benutzer und Absender `contact@jmc-streamline.com`, Absendername
  `jmc. | Streamline Processes S.L.`. Keine Zugangsdaten im Quellcode ablegen.
- Admin-Empfänger ist `contact@jmc-streamline.com`; Reply-To ist die geprüfte
  E-Mail-Adresse aus dem Formular. Bestätigung an die anfragende Person.
- Bestätigte E-Mail-Signatur: Gremi des Fusters 33, Local 6, ES-07009 Palma.
  Die übrigen Website-/Schema-Adressen bleiben wie beauftragt aus dem Original.
- Implementiert: Node.js-24-Endpunkt, SMTP-Transport mit Nodemailer, lokale
  Astro-Proxy-Anbindung, Sprachübermittlung, lokalisierte Erfolg-/Fehlermeldungen,
  serverseitige Validierung, Origin-Prüfung, Anfragenlimit und Bot-Feld.
  Eingaben bleiben bei Fehlern erhalten; während des Sendens wird der Button
  gesperrt. Wiederholungen verwenden dieselbe Zustell-ID. Falls nur die
  Bestätigung fehlschlägt, dupliziert ein erneuter Versuch keine Admin-Mail.
- Geprüft: sieben Backend-Tests mit simuliertem Transport (DE/EN, Empfänger,
  Signatur, HTML-Escaping, ungültige Eingaben, Header-Injection, Origin,
  fehlendes SMTP, Wiederholungen, Teilfehler und Anfragenlimit). Astro-Prüfung
  ohne Fehler/Warnungen/Hinweise und Build erfolgreich. Browseranbindung über
  den lokalen Proxy in DE/EN geprüft: ohne Passwort ehrliche Fehlermeldung,
  Eingaben erhalten und Button wieder verfügbar.
- SMTP-Zugang am 23.10.2026 lokal vertraulich hinterlegt. Anmeldung mit
  aktivierter TLS-Zertifikatsprüfung erfolgreich; Dienst auf Port 4322
  anschließend mit SMTP-Konfiguration neu gestartet.
- Noch offen: tatsächliche Zustellung und Live-Routing des Node-Dienstes.
  Anbietername nicht erforderlich. Keine echte Nachricht versendet.
  Die Website bleibt auf Port 4321 erreichbar.

## 10. Services: schräge Hintergrundfläche korrigiert

- Ursache: Die relativ positionierte Container-Komponente war Bezugspunkt für
  die absolute Dekoration. Dadurch begann die weiße Fläche direkt am Label
  statt am äußeren Abschnitt, ohne dessen oberen und seitlichen Innenabstand.
- Die Dekoration ist jetzt ein eigenes `aria-hidden`-Element innerhalb des
  relativen, isolierten Abschnitts. Tailwind-Utilities: `absolute inset-0`,
  `bg-white`, `z-0`, `pointer-events-none` und die polygonale Clip-Path-Utility.
  Der Inhalt liegt separat mit `relative z-[1]` darüber. Keine Originalklassen,
  Komponenten-CSS oder Inline-Stile übernommen.
- Das Polygon bezieht sich auf die volle Abschnittsfläche; ab 767 px sichtbar,
  darunter wie im Original ausgeblendet. Label, Überschrift und Karten behalten
  ihre Abstände und bleiben unabhängig von der Dekoration bedienbar.
- Original live bei 1280 px vermessen: Dekoration absolut, Container statisch,
  oberer Abschnittsabstand rund 116 px. Nach der Korrektur lokale Darstellung
  als Screenshot kontrolliert. Anschließend wegen Vorschau-Timeouts neu mit
  dem Browser verbunden: DE/EN bei 390, 768 und 1440 px geprüft. Dekoration
  umfasst jeweils exakt die Abschnittsfläche, kein horizontaler Überlauf,
  oberer Textabstand am Desktop 120 px. Build erfolgreich.

## 11. Services: mobiles Kontaktmodal nach Original korrigiert

- Doppelte Breitenbegrenzung entfernt: außen keine zusätzlichen 50-/25-px-
  Innenabstände mehr, der Dialog selbst erhält die Breite abzüglich der
  vorgesehenen Ränder. Bei 390/640/1280 px sind die Panelbreiten wie im Original
  340/540/1180 px. Innenabstände, Grid, Formularbreite, Schriftgewicht und
  vertikale Abstände live gegen das Original vermessen.
- Überflüssige Mindesthöhe entfernt. Den Einleitungstext unter 479 px wie im
  Original ausgeblendet. Textarea als `inline-block` mit dem originalen
  Grundlinienabstand statt `block`; damit stimmen auch Formular-/Panelhöhen.
  DE-Panelhöhen bei 900 px Viewport-Höhe: 589,234 / 659,992 / 695,367 px für
  390/640/1280 px Breite, identisch zum Original.
- Overlay startet an der tatsächlichen Header-Unterkante (rund 97 px).
  Der im Original verwendete Header-Token liegt auf kleinen Geräten einige
  Pixel darüber; hier bleibt der gesamte Header wie angefragt frei sichtbar.
  Der Header wird beim Öffnen eingeblendet und bleibt währenddessen sichtbar.
- Fokus auf die Modalüberschrift ohne Scrollsprung; Escape und Außenklick
  schließen, Fokus kehrt zum Auslöser zurück. Tab/Shift-Tab bleiben im Dialog.
  Auf nachträglichen Nutzerwunsch dauerhaft sichtbares weißes Schließen-X
  oben rechts im Overlay ergänzt, mit übersetztem Screenreader-Label und
  sichtbarer Tastatur-Fokusmarkierung. Rein über Tailwind gestaltet.
  Ergänzung separat in Chrome bei DE/EN und 390/1280 px geprüft: weißes X
  sichtbar, per Klick erreichbar, Dialog schließt und Fokus kehrt zum Auslöser
  zurück. Mobile Darstellung per Screenshot kontrolliert.
- Auf kurzen Bildschirmen wird die Panelhöhe begrenzt, damit das untere Ende
  nicht außerhalb des sichtbaren Bereichs liegt. Der Inhalt ist dann scrollbar.
- DE/EN im Browser bei 390×844, 640×900, 1280×900 und 390×600 geprüft:
  Header sichtbar, Overlay darunter, kein Scrollsprung, Panel im Viewport,
  Escape/Außenklick und Fokusrückgabe erfolgreich. Lokalen Screenshot bei
  640×900 kontrolliert. Keine Inline-Stile im Modal. Astro/TypeScript ohne
  Fehler/Warnungen/Hinweise, Build und SEO-Abgleich erfolgreich. Keine Mail
  bei diesen Prüfungen abgesendet.

## 12. Veröffentlichung auf Linevast

- Quellcode auf GitHub unter `kreativdeck/jmc-streamline`, Branch `main`.
- Explizites FTPS mit Zertifikatsprüfung und verschlüsseltem Datenkanal geprüft.
- PHP 8.2.34 auf dem Zielhosting geprüft. Produktionsformular auf PHP mit
  PHPMailer 7.1.1 adaptiert; kein Node-Prozess beim Webhoster erforderlich.
- Private Anwendung und SMTP-Konfiguration liegen außerhalb von `public_html`.
  Lokale `.env`-Dateien und `.deploy/` sind von Git ausgeschlossen.
- Sieben PHP-Prüfungen auf Linevast mit simuliertem Versand bestanden, darunter
  DE/EN, Eingabevalidierung, Wiederholungsschutz, Teilfehler und Limits.
  SMTP-Anmeldung auf Linevast erfolgreich; keine echten Testmails versendet.
- Separate Vorschau hochgeladen. 97 öffentliche Dateien per HTTP erfolgreich
  geprüft. Formular weist GET mit 405, fremde Origins mit 403 und ungültige
  Nutzdaten mit 400 zurück. Services-Modal im Browser geöffnet; weißes X und
  Darstellung unterhalb des Headers geprüft.
- Astro-Prüfung: keine Fehler, Warnungen oder Hinweise. 33 HTML-Seiten gebaut;
  543 interne Links, 270 Dateiverweise und 32 Sprachpaare geprüft. SEO-Abgleich
  aller 32 Sprachseiten einschließlich Schema ohne Abweichungen bestanden.
- Nutzer übernimmt ausdrücklich die WordPress-Sicherung. Es wurde kein eigener
  WordPress-Datenbankexport durchgeführt. Die fehlenden WordPress-Dateien
  blockieren die Veröffentlichung daher nicht mehr.
- Produktionsrelease am 23.10.2026 direkt als `public_html` aktiviert.
  Vorheriger Inhalt (Vorschauordner) liegt außerhalb des öffentlichen Webroots.
  Temporärer Prüfendpunkt und dessen Schlüssel entfernt.
- 99 Release-Dateien vor dem Wechsel per FTPS auf Größe geprüft. Anschließend
  97 öffentliche Dateien auf der Hauptdomain geprüft, ohne Fehler. HTML, CSS,
  Sitemap und robots.txt stimmen per SHA-256 mit dem Release überein.
  Deutsche und englische Seiten über www und die auf www weiterleitende Domain
  erreichbar. Produktions-API liefert wie erwartet 405/403/400 bei GET,
  fremdem Origin bzw. ungültigen Nutzdaten.
- **Noch offen:** echter Zustellungstest von Admin-Mail und Autoresponder;
  bei den technischen Prüfungen wurden keine echten Nachrichten versendet.
