# Tyler Tweaks — Website

Verkaufsseite und Kundenbereich für die Tweak App und die PC-Optimierung.
Statische Seite ohne Build-Schritt, läuft auf GitHub Pages.

Live: https://tylertweaks.github.io/

**Einrichtung und alle Zugangsdaten:** siehe `EINRICHTUNG.md` im Ordner
`E:\Tweak app` (liegt bewusst nicht in diesem öffentlichen Repository).

## Angebot

| Paket | Preis |
|---|---|
| Tweak App — 24 Stunden | 2 € |
| Tweak App — 2 Tage | 3 € |
| Tweak App — 1 Woche | 5 € |
| Tweak App — 1 Monat | 8 € |
| Tweak App — 1 Jahr | 12 € |
| Tweak App — Lifetime | 15 € |
| PC-Optimierung | 20 € |
| Bundle (App Lifetime + Optimierung) | 30 € |

Verbindlich sind immer die Preise in der Supabase-Tabelle `products` — die
Edge Function rechnet ausschließlich damit. Die Zahlen in `konfig.js` sorgen nur
dafür, dass die Preisliste sofort etwas anzeigt; weichen sie ab, korrigiert die
Seite sich beim Laden selbst.

## Wie der Kauf abläuft

```
Kunde registriert sich          -> Supabase Auth, Bestätigungsmail
Kunde bestätigt die E-Mail      -> echter Link mit einmaligem Token
Kunde wählt ein Paket           -> kaufen.html
Kunde zahlt mit PayPal          -> Edge Function legt die Bestellung mit dem
                                   Preis aus der Datenbank an
PayPal bestätigt die Zahlung    -> Edge Function bucht ab und prüft den Betrag
Backend erzeugt den Schlüssel   -> TWKX-XXXX-XXXX-XXXX, garantiert einmalig
Lizenz landet im Kundenkonto    -> sofort sichtbar unter "Meine Lizenzen"
Kunde lädt die App herunter     -> signierter Link, 2 Minuten gültig
Kunde gibt den Schlüssel ein    -> Tyler.exe prüft ihn gegen Supabase
```

Der Kunde muss nichts anfordern und niemanden anschreiben.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Startseite: Hero, App, Optimierung, Preise, Ablauf, Sicherheit, FAQ |
| `registrieren.html` | Konto anlegen |
| `anmelden.html` | Login |
| `passwort-vergessen.html` | Link zum Zurücksetzen anfordern |
| `passwort-neu.html` | Neues Passwort setzen (Ziel des Links aus der Mail) |
| `kaufen.html` | Kaufabschluss mit PayPal |
| `konto.html` | Kundenbereich: Übersicht, Bestellungen, Produkte, Lizenzen, Downloads, Kontodaten |
| `admin.html` | Verwaltung — nur für Konten mit `is_admin` |
| `konfig.js` | **Zentrale Einstellungen.** Nur öffentlich unbedenkliche Werte. |
| `tt-backend.js` | Supabase-Verbindung, Anmeldestatus, Fehlertexte, Formatierung |
| `auth.js` | Registrierung, Login, Passwort |
| `kaufen.js` | PayPal-Buttons, ruft die Edge Functions auf |
| `konto.js` | Kundenbereich |
| `admin.js` | Verwaltung |
| `script.js` | Startseite: Navigation, FAQ, App-Ansichten, Laufzeit-Auswahl |
| `style.css` | Design-System der gesamten Seite |
| `mockup.css` | Gezeichnete App-Oberfläche und Ablauf-Illustrationen |

Im Normalbetrieb fasst du hier **gar nichts** an. Preise änderst du in Supabase
unter **Table Editor → products**, neue Versionen über die Tabelle
`app_release`.

## Sicherheit

**In diesem Repository darf nichts Geheimes stehen.** Es ist öffentlich.

Unbedenklich und deshalb in `konfig.js`:

- Supabase Project URL und der **anon**-Key — beide sind dafür gemacht, im
  Browser zu stehen. Die Zugriffsrechte liegen in der Datenbank (Row Level
  Security), nicht im Schlüssel.
- Die PayPal **Client ID**.

Gehört ausschließlich in die Supabase-Secrets:

- PayPal **Secret** und **Webhook ID**
- der **service_role**-Key
- die Cloudflare-R2-Zugangsdaten

Was daraus folgt:

- Passwörter liegen gehasht bei Supabase Auth und sind für niemanden lesbar.
- Ein Kunde sieht ausschließlich seine eigenen Bestellungen und Lizenzen — das
  setzt die Datenbank durch, nicht der Browser.
- Der Zahlungsstatus kommt von PayPal, serverseitig geprüft. Er lässt sich im
  Browser nicht setzen.
- Der Download braucht eine gültige Lizenz und läuft über einen Link, der nach
  zwei Minuten verfällt.
- Der Admin-Bereich ist nicht nur ausgeblendet: ohne `is_admin` gibt die
  Datenbank keine fremden Zeilen heraus.

## Lokal ansehen

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/server.ps1 -Port 5173
```

Danach http://localhost:5173 aufrufen. Ein Doppelklick auf `index.html` reicht
nicht mehr — die Seite lädt Skripte und spricht mit Supabase, beides braucht
eine echte Adresse.

Damit Anmeldung und Mail-Links lokal funktionieren, muss
`http://localhost:5173/**` in Supabase unter
**Authentication → URL Configuration → Redirect URLs** stehen.

## Keine fremden Server

Alles, was die Seite zum Anzeigen und Funktionieren braucht, liegt im Projekt:

| Ordner | Inhalt | Lizenz |
|---|---|---|
| `fonts/` | Inter und Space Grotesk als Variable Fonts | SIL OFL 1.1 |
| `js/` | supabase-js (Anmeldung, Datenbank, Edge Functions) | MIT |

Beim Aufruf der Seite geht dadurch **keine einzige Anfrage an einen Dritten** —
weder an Google Fonts noch an ein Auslieferungsnetz. Die einzige Verbindung
nach außen ist die zu deinem eigenen Supabase-Projekt, und die ist der Zweck
der Sache.

Herkunft, Lizenz und die Anleitung zum Aktualisieren stehen jeweils in
`LIESMICH.txt` im betreffenden Ordner. Die Versionsnummer der Bibliothek steht
absichtlich im Dateinamen, damit beim Wechsel kein Browser eine alte Fassung
aus dem Zwischenspeicher verwendet.

## Rechtliches

Vier Seiten, aus dem Fußbereich jeder Seite erreichbar:

| Seite | Inhalt |
|---|---|
| `impressum.html` | Anbieterkennzeichnung nach § 5 DDG |
| `datenschutz.html` | Information nach Art. 13 DSGVO |
| `agb.html` | Allgemeine Geschäftsbedingungen |
| `widerruf.html` | Widerrufsbelehrung mit Muster-Formular |

Auf der Kaufseite muss der Kunde AGB und Widerrufsbelehrung **aktiv per
Haken bestätigen** — vorher bleiben die PayPal-Knöpfe abgeschaltet. Bei
Softwarelizenzen enthält der Text zusätzlich die ausdrückliche Zustimmung zum
sofortigen Beginn; ohne die erlischt das Widerrufsrecht nicht vorzeitig. Bei
der PC-Optimierung wird dieser Zusatz automatisch ausgeblendet, weil er dort
nicht zutrifft.

## Offen

Alle vier Rechtsseiten sind **fertig gebaut, aber noch mit Platzhaltern** —
jede trägt eine gelbe Warnbox. Vor dem ersten echten Verkauf einsetzen:

- Name und vollständige Postanschrift
- eine E-Mail-Adresse (vorgeschrieben, Discord allein genügt nicht)
- die Umsatzsteuer-Angabe — entweder USt-IdNr. oder der
  Kleinunternehmer-Satz nach § 19 UStG

Danach die Warnboxen entfernen (`<div class="platzhalter-warnung">`).

Die Texte sind Vorlagen nach üblichem Aufbau, **keine anwaltliche Prüfung**.

## Kontakt

- Discord: `tyler061312`
