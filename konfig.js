/* ==========================================================================
   Tyler Tweaks — zentrale Einstellungen
   Diese Datei ist die einzige, die du im Normalbetrieb anfassen musst.
   Sie wird von index.html und konto.html geladen.
   ========================================================================== */

window.TT_KONFIG = {

  /* ---- Kontakt ---------------------------------------------------------- */
  discord: 'tyler061312',

  /* ---- PayPal ----------------------------------------------------------- */

  // Rückfallebene: funktioniert immer, ohne Konfiguration.
  paypalMe: 'https://paypal.me/Tyler971377',

  // Echte PayPal-Buttons: Client-ID aus deinem PayPal-Entwicklerkonto
  // (developer.paypal.com -> Apps & Credentials -> Live -> Client ID).
  // Solange dieses Feld leer ist, erscheinen nur die paypal.me-Buttons.
  paypalClientId: '',

  waehrung: 'EUR',

  /* ---- Produkte ---------------------------------------------------------
     Der Schlüssel (app / optimierung / bundle) taucht an drei Stellen auf:
     - in index.html als data-paypal="..."
     - in lizenzen.js als "produkt"
     - hier
     ----------------------------------------------------------------------- */
  produkte: {
    app: {
      name: 'Tweak App',
      preis: '15.00',
      beschreibung: 'Tyler Tweaks — Tweak App, Lizenz für 1 PC',
      download: true,
      service: false
    },
    optimierung: {
      name: 'PC-Optimierung',
      preis: '20.00',
      beschreibung: 'Tyler Tweaks — persönliche PC-Optimierung per Remote-Sitzung',
      download: false,
      service: true
    },
    bundle: {
      name: 'Bundle',
      preis: '30.00',
      beschreibung: 'Tyler Tweaks — Tweak App und PC-Optimierung im Bundle',
      download: true,
      service: true
    }
  },

  /* ---- Aktuelle App-Version ---------------------------------------------
     Wird automatisch überall eingesetzt, wo data-app-version bzw.
     data-app-date im HTML steht. Bei einem Update nur hier ändern.
     ----------------------------------------------------------------------- */
  app: {
    version: '2.4.0',
    datum: '18.09.2026',
    groesse: '14,2 MB',

    // Pfad oder vollständige URL zur Setup-Datei.
    // Solange das Feld leer ist, steht im Kundenbereich ehrlich
    // "Download wird gerade vorbereitet" statt eines toten Links.
    // Sobald die Datei liegt, hier eintragen, zum Beispiel:
    //   datei: 'downloads/TylerTweaks-Setup-2.4.0.exe'
    //
    // ACHTUNG: Auf GitHub Pages ist jede Datei im Repository öffentlich
    // erreichbar, auch ohne Login. Wer die URL kennt, kann sie laden.
    // Für echten Schutz brauchst du einen Server, der den Schlüssel prüft.
    datei: '',

    // Optionale Prüfsumme, damit Käufer die Datei verifizieren können.
    sha256: ''
  },

  /* ---- Änderungen der letzten Versionen ---------------------------------- */
  changelog: [
    { version: '2.4.0', datum: '18.09.2026', text: 'Autostart-Manager erkennt jetzt auch geplante Aufgaben. Silent-Profil überarbeitet.' },
    { version: '2.3.1', datum: '02.08.2026', text: 'Fehler beim Anlegen von Wiederherstellungspunkten auf Windows 11 behoben.' },
    { version: '2.3.0', datum: '19.07.2026', text: 'Neue Netzwerk-Tweaks, Erklärtexte zu jedem Schalter ergänzt.' }
  ]
};
