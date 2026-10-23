# Kontaktformular-Versand

Eigenständiger Node.js-24-Dienst für die statische Astro-Website, kein CMS.
`POST /api/contact` empfängt JSON mit `lang`, `name`, `email`, `phone`,
`message` und dem leeren Bot-Feld `website`.

## Lokal

1. In diesem Ordner `npm ci` ausführen.
2. Optional `.env.example` als `.env` kopieren. Das SMTP-Passwort ausschließlich
   vertraulich in dieser ignorierten Datei oder als Server-Umgebungsvariable
   hinterlegen, niemals im Frontend, Git oder Chat.
3. `npm start` ausführen. Der Dienst lauscht standardmäßig auf `127.0.0.1:4322`.
4. Die Website unter <http://localhost:4321/de/kontakt/> beziehungsweise
   <http://localhost:4321/en/contact/> öffnen. Der Astro-Proxy verbindet beide.

Ohne Passwort wird kein SMTP-Transport angelegt und kein Versand versucht.
Das Formular zeigt eine entsprechende Meldung und behält die Eingaben.
`npm test` nutzt ausschließlich simulierten Versand, keine externen Empfänger.

## Nachrichten

- Absenderadresse und Admin-Empfänger: `contact@jmc-streamline.com`.
- Admin-Anzeigename: eingegebener Name, wie im Original. Reply-To ist die
  validierte Adresse der anfragenden Person. Betreff und Feldnamen folgen DE/EN.
- Autoresponder: fester Firmenabsender, an die anfragende Person, jeweils DE/EN.
  Signatur exakt mit der bestätigten Anschrift aus dem Screenshot.
- HTML und Klartext; Benutzereingaben werden nicht als HTML interpretiert.
- SMTP `mail.jmc-streamline.com:465`, TLS ab Verbindungsbeginn (`secure: true`),
  Zertifikatsprüfung aktiv. Siehe [Nodemailer-SMTP-Dokumentation](https://nodemailer.com/smtp).

## Livebetrieb auf Linevast

Die Produktion verwendet `php/public/api/contact.php`, erreichbar über
`/api/contact` durch die mitgelieferte `.htaccess`. PHP 8.2 mit OpenSSL und
mbstring reicht aus. PHPMailer 7.1.1 ist mit Lizenz, Herkunft und SHA-256-
Prüfsummen unter `php/vendor/PHPMailer/` fest eingebunden.

Nur `php/public/` wird öffentlich ausgeliefert. Anwendung, SMTP-Konfiguration
und Zustellzustand liegen im Domainverzeichnis unter `.jmc-private/`, außerhalb
von `public_html`. Das Passwort wird aus der ignorierten lokalen `.env`
übertragen und weder ins Frontend noch nach GitHub geschrieben.

Die PHP-Version erhält dieselben Sprachtexte, Empfänger, Validierungsregeln,
Limits und Teilerfolgsbehandlung wie die lokale Node-Version. Zustellmarker und
IP-Limits werden mit Dateisperren für zehn Minuten gespeichert; die Dateien
enthalten ausschließlich HMACs, Zähler und Statuswerte, keine Nachrichten.
Ein Absturz nach SMTP-Annahme und vor dem Speichern des Markers kann weiterhin
zu einer wiederholten Nachricht führen; SMTP bietet keine transaktionale
Zustellgarantie. Es gibt keine Warteschlange oder Speicherung der Anfrage.

Auf Linevast am 23.10.2026 geprüft: PHP 8.2.34, sieben Tests mit simuliertem
Versand, erfolgreiche SMTP-Anmeldung mit aktiver Zertifikatsprüfung.
Es wurden dabei keine echten Nachrichten versendet. Die endgültige Route
`https://www.jmc-streamline.com/api/contact` ist aktiv und geprüft. Ein echter
Zustellungstest von Admin-Mail und Bestätigung steht noch aus.
Siehe [Deployment-Anleitung](../deployment/README.md).

## Alternativ: Node.js auf einem eigenen Server

Der Anbietername ist nicht erforderlich. Technische Voraussetzung dieser
Implementierung ist ein Node.js-24-Prozess mit ausgehendem SMTP-Zugang. Die
statischen Seiten bleiben in `frontend/dist/`. Der Webserver muss ausschließlich
`/api/contact` an den privaten Node-Dienst weiterleiten und die Website über
HTTPS ausliefern. Ein reines Hosting statischer Dateien führt diesen Dienst
nicht aus; dann muss der Endpunkt separat betrieben oder passend adaptiert werden.

`CONTACT_ORIGINS` enthält die erlaubten Website-Ursprünge, durch Kommas getrennt.
Hinter einem vertrauenswürdigen Reverse-Proxy `CONTACT_TRUST_PROXY=true` nur
setzen, wenn dieser `X-Forwarded-For` zuverlässig durch die echte Besucher-IP
ersetzt. Standardmäßig wird der Header nicht vertraut. Der Endpunkt begrenzt
Anfragen auf zehn Versuche je IP in zehn Minuten und auf 20 kB pro Anfrage.

Eine Formular-ID verhindert doppelte Mails bei Wiederholungen für zehn Minuten
innerhalb dieses Serverprozesses. Schlägt nur die Bestätigung fehl, bleibt die
Admin-Mail als versendet markiert; ein erneuter Versuch sendet nur die Bestätigung.
Diese Informationen sind flüchtig: keine dauerhafte Warteschlange, Speicherung
der Anfragen oder Zusage einer exakt einmaligen Zustellung nach einem Neustart.
Mehrere Instanzen benötigen gemeinsam gespeicherte Limits/Zustellzustände.

Lokal am 23.10.2026 geprüft: SMTP-Anmeldung mit den vertraulich hinterlegten
Zugangsdaten erfolgreich, TLS-Zertifikatsprüfung aktiv. Der lokale Dienst
wurde anschließend mit dieser Konfiguration neu gestartet.
Noch nicht geprüft: tatsächliche Zustellung und Live-Routing.
Es wurden keine echten Nachrichten versendet.
