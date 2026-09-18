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

## Offen

**Impressum und Datenschutzerklärung fehlen.** Sobald das Angebot gewerblich
läuft, sind beide in Deutschland und Österreich Pflicht. Die
Datenschutzerklärung muss unter anderem Google Fonts, PayPal, Supabase und —
falls genutzt — Cloudflare R2 nennen.

## Kontakt

- Discord: `tyler061312`
