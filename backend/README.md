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

## Livebetrieb

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
