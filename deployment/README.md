# Linevast-Veröffentlichung

GitHub: https://github.com/kreativdeck/jmc-streamline

Der Build aus `frontend/dist/` kommt nach `public_html/`. Nur für das
Kontaktformular laufen PHP und PHPMailer auf dem vorhandenen Webhosting.
Ein Node.js-Prozess auf Linevast ist nicht erforderlich.

## Vertrauliche lokale Dateien

- `.env.linevast`: `FTP_HOST`, `FTP_PORT`, `FTP_USER`, `FTP_PASSWORD`.
- `backend/.env`: SMTP-Konfiguration gemäß `.env.example`.
- `.deploy/`: Deployment-Zustand, Prüfsummen und gegebenenfalls heruntergeladene
  Datenbanksicherung. Dieser Ordner darf niemals öffentlich hochgeladen werden.

Alle drei Pfade sind durch `.gitignore` ausgeschlossen. Passwörter mit `#`
oder anderen Sonderzeichen in der env-Datei in Anführungszeichen setzen.

## Ablauf

`scripts/linevast.py` nutzt FTP mit explizitem TLS, Zertifikatsprüfung und
verschlüsseltem Datenkanal. Um die env-Dateien ohne eigene Parser auszuwerten,
werden die Befehle über Node.js 24 gestartet, beispielsweise:

```sh
node --env-file=.env.linevast --env-file=backend/.env -e 'const {spawnSync}=require("node:child_process");const r=spawnSync("python3",["scripts/linevast.py","prepare"],{stdio:"inherit",env:process.env});process.exit(r.status??1)'
```

Das letzte Argument ist die jeweilige Aktion:

1. `prepare`: private PHP-Anwendung konfigurieren; authentifizierte temporäre
   Prüfroutine bereitstellen; Tests und SMTP-Anmeldung ausführen, ohne Mailversand.
2. `preview`: separate Vorschau unter einem zufälligen Pfad in `public_html`
   hochladen. Interne Pfade werden nur in dieser Kopie angepasst. Die Vorschau
   erhält `noindex`, die endgültige Version behält die originalen SEO-Angaben.
3. `release`: unveränderten Produktionsbuild neben `public_html` bereitstellen.
4. `backup`: vorhandene WordPress-Datenbank serverseitig exportieren, privat
   herunterladen und SHA-256 vergleichen. Benötigt eine vorhandene Installation
   einschließlich `wp-load.php` und `wp-config.php`.
5. `promote`: erst nach geprüftem Backup ausführen. Temporären Prüfendpunkt
   entfernen, bisheriges `public_html` privat archivieren, Release umbenennen.
   Bei einem Fehler beim Umbenennen wird das ursprüngliche Verzeichnis wiederhergestellt.

Die Aktionen ersetzen keine abschließende Browser- und HTTP-Prüfung. Vor dem
Umschalten alle Seiten, Assets, Sprachwechsel und Formularroute kontrollieren.
Ein Datenbankexport ist keine vollständige Sicherung von WordPress; die alten
Dateien müssen ebenfalls erhalten bleiben. Wurden sie bereits entfernt, erst
die vorhandene Sicherung klären. Das Skript umgeht diese Voraussetzung nicht.

## Rückkehr zur vorherigen Version

Die Namen der privaten Release- und Archivordner stehen ausschließlich lokal
in `.deploy/linevast.json`. Zum Zurückwechseln die aktuelle Version in einen
neuen privaten Ordner verschieben und das archivierte Verzeichnis wieder
`public_html` nennen. `.jmc-private` und die bisherige WordPress-Datenbank
werden bei der Veröffentlichung nicht gelöscht.

Die einmalige Prüfroutine `operations.php` ist kein dauerhafter API-Endpunkt.
Sie gehört nach den Prüfungen vom Server entfernt. Zugang nur mit zusätzlichem
zufälligem Header-Schlüssel, keine Ausführung beliebiger Befehle. `cleanup`
entfernt sie auch dann, wenn noch nicht veröffentlicht wird; vor einem späteren
Datenbankexport nochmals `prepare` ausführen.
