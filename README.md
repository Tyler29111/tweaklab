# Tyler Tweaks

Verkaufsseite für die Tweak App und die PC-Optimierung. Statische Webseite —
kein Build, keine Abhängigkeiten, läuft per Doppelklick auf `index.html`.

Live: https://tylertweaks.github.io/

## Angebot

| Paket | Preis | Enthält |
|---|---|---|
| Tweak App | 15 € | Software, Lizenz für 1 PC |
| PC-Optimierung | 20 € | Remote-Sitzung, 45–90 Minuten |
| Bundle | 30 € statt 35 € | beides |

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Startseite: Hero, App-Vorstellung, Preise, Kaufablauf, Sicherheit, FAQ |
| `konto.html` | Kundenbereich mit Lizenz-Login und Download |
| `werkzeug-lizenzen.html` | Internes Werkzeug: neue Lizenzschlüssel erzeugen |
| `konfig.js` | **Zentrale Einstellungen** — Preise, PayPal, App-Version, Download |
| `lizenzen.js` | Liste der ausgegebenen Lizenzen (nur Hashes) |
| `lizenz.js` | SHA-256 und Lizenzprüfung |
| `konto.js` | Login-Logik des Kundenbereichs |
| `script.js` | Navigation, App-Ansichten, FAQ, PayPal-Buttons |
| `style.css` | Design-System der gesamten Seite |
| `mockup.css` | Gezeichnete App-Oberfläche und Kaufablauf-Illustrationen |

Im Normalbetrieb fasst du nur **`konfig.js`** und **`lizenzen.js`** an.

---

## Neuen Kunden freischalten

1. `werkzeug-lizenzen.html` im Browser öffnen (Doppelklick reicht)
2. Produkt auswählen, auf **Schlüssel erzeugen** klicken
3. Den Schlüssel dem Kunden schicken — er erscheint nur dieses eine Mal
4. Die angezeigte Code-Zeile in `lizenzen.js` vor die schließende Klammer setzen
5. `lizenzen.js` ins Repository hochladen

Einen Schlüssel sperrst du, indem du bei seinem Eintrag `gesperrt: true` ergänzt.

**Vor dem Live-Gang:** die drei Testschlüssel oben in `lizenzen.js` löschen
().

---

## PayPal-Buttons aktivieren

Standardmäßig laufen alle Käufe über `paypal.me` — das funktioniert sofort,
ohne Einrichtung.

Für die offiziellen PayPal-Buttons:

1. Auf developer.paypal.com einloggen → **Apps & Credentials** → **Live**
2. Die **Client ID** kopieren
3. In `konfig.js` bei `paypalClientId` eintragen

Danach erscheinen die Buttons automatisch in allen drei Preiskarten, und die
`paypal.me`-Links rutschen zur Ausweichlösung herunter. Lädt das PayPal-Skript
nicht (Werbeblocker, Netzwerk), bleibt `paypal.me` sichtbar.

**Wichtig:** Die Zahlungsbestätigung wird im Browser des Käufers abgeholt. Das
ist nicht fälschungssicher. Kontrolliere jede Zahlung in deinem PayPal-Konto,
bevor du einen Lizenzschlüssel herausgibst.

---

## Neue App-Version veröffentlichen

In `konfig.js` unter `app`:

```js
app: {
  version: '2.5.0',
  datum: '01.11.2026',
  groesse: '14,8 MB',
  datei: 'downloads/TylerTweaks-Setup-2.5.0.exe',
  sha256: ''
}
```

Version und Datum erscheinen dadurch automatisch überall auf der Seite —
im App-Fenster, im Sicherheits-Abschnitt und im Kundenbereich.

Solange `datei` leer ist, steht im Kundenbereich „Download wird gerade
vorbereitet" statt eines toten Links. Setup-Datei also erst hochladen, dann
den Pfad eintragen.

Neue Einträge in `changelog` erscheinen im Kundenbereich unter
„Was sich zuletzt geändert hat".

---

## Was der Login leistet — und was nicht

Der Kunde gibt seinen Schlüssel ein, dieser wird mit SHA-256 gehasht und gegen
die Liste in `lizenzen.js` geprüft. Die Schlüssel selbst stehen nirgends im
Repository und lassen sich aus den Hashes nicht zurückrechnen.

**Das ist kein Kopierschutz.** GitHub Pages hat keinen Server, die Prüfung läuft
im Browser des Besuchers. Wer den Quelltext liest, findet die Download-Adresse
auch ohne gültigen Schlüssel. Der Login sortiert Neugierige aus und gibt Kunden
eine feste Anlaufstelle — mehr soll er nicht.

Für echten Schutz bräuchtest du einen Server, der den Schlüssel prüft und erst
dann einen zeitlich begrenzten Download-Link ausgibt (zum Beispiel ein
Cloudflare Worker oder eine Vercel-Funktion). Die Seite ist so gebaut, dass sich
das später nachrüsten lässt: nur `lizenz.js` müsste den Server fragen statt der
lokalen Liste.

---

## Offen

**Impressum und Datenschutzerklärung fehlen weiterhin.** Sobald das Angebot
gewerblich läuft, sind beide in Deutschland und Österreich Pflicht. Die
Datenschutzerklärung muss unter anderem erwähnen, dass Google Fonts von
Google-Servern geladen werden und PayPal beim Bezahlen eingebunden wird.

Ebenfalls offen: die Setup-Datei selbst (`konfig.js` → `app.datei`).

---

## Lokal ansehen

`index.html` im Browser öffnen genügt für einen ersten Blick.

Für den Kundenbereich brauchst du einen lokalen Server, weil der Browser sonst
die verlinkten Skripte blockiert:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/server.ps1 -Port 5173
```

Danach http://localhost:5173 aufrufen. Der Server braucht weder Node noch
Python — nur Windows-Bordmittel.

## Kontakt & Zahlung

- PayPal: `paypal.me/Tyler971377`
- Discord: `tyler061312`
