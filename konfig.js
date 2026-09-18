/* ==========================================================================
   Tyler Tweaks — zentrale Einstellungen

   Diese Datei liegt öffentlich im Repository. Es darf hier deshalb NICHTS
   stehen, was geheim bleiben muss:

     KEIN PayPal Secret        -> Supabase, Edge Functions, Secrets
     KEIN service_role Key     -> Supabase, Edge Functions, Secrets
     KEINE Datenbankpasswörter -> gar nicht nötig

   Was hier steht, ist alles öffentlich unbedenklich. Der Supabase-anon-Key
   und die PayPal-Client-ID sind dafür gemacht, im Browser zu stehen: allein
   damit kommt man an keine fremden Daten. Die Zugriffsrechte liegen in der
   Datenbank (Row Level Security), nicht im Schlüssel.
   ========================================================================== */

window.TT_KONFIG = {

  /* ---- Kontakt ---------------------------------------------------------- */
  discord: 'tyler061312',

  /* ---- Supabase ---------------------------------------------------------
     Zu finden im Supabase-Dashboard unter
     Project Settings -> API -> Project URL / Publishable (anon) key.
     ----------------------------------------------------------------------- */
  supabaseUrl: 'https://dfypxfkqastndvblfvvl.supabase.co',
  supabaseAnonKey: 'sb_publishable_xXO2n-NPKwMaCulDWN6R7A_BOLcNvUV',

  /* ---- PayPal -----------------------------------------------------------
     Nur die Client-ID! Das dazugehörige Secret gehört ausschließlich in die
     Supabase-Secrets (siehe EINRICHTUNG.md, Schritt 4).

     Solange dieses Feld leer ist, zeigt die Kaufseite einen deutlichen
     Hinweis statt eines Buttons, der nicht funktioniert.
     ----------------------------------------------------------------------- */
  paypalClientId: '',

  // 'sandbox' zum Testen mit PayPal-Testkonten, 'live' für echtes Geld.
  // Muss zu PAYPAL_ENV in den Supabase-Secrets passen.
  paypalUmgebung: 'sandbox',

  waehrung: 'EUR',

  /* ---- Adresse der Seite ------------------------------------------------
     Wird für die Links in den Bestätigungs-Mails gebraucht. Beim Wechsel auf
     eine eigene Domain hier und in den Supabase-Einstellungen ändern.
     ----------------------------------------------------------------------- */
  seitenUrl: 'https://tylertweaks.github.io',

  /* ---- Anzeige der Pakete -----------------------------------------------
     Verbindlich ist immer der Preis in der Datenbank — die Kaufseite holt ihn
     dort, und die Edge Function berechnet ausschließlich damit. Die Werte hier
     sorgen nur dafür, dass die Preisliste sofort etwas anzeigt, statt kurz
     leer zu bleiben. Weichen sie ab, korrigiert die Seite sich beim Laden
     selbst aus der Datenbank.
     ----------------------------------------------------------------------- */
  laufzeiten: [
    { slug: 'app-24h',      kurz: '24 Std.',  lang: '24 Stunden', preis: '2.00'  },
    { slug: 'app-2d',       kurz: '2 Tage',   lang: '2 Tage',     preis: '3.00'  },
    { slug: 'app-1w',       kurz: '1 Woche',  lang: '1 Woche',    preis: '5.00'  },
    { slug: 'app-1m',       kurz: '1 Monat',  lang: '1 Monat',    preis: '8.00'  },
    { slug: 'app-1y',       kurz: '1 Jahr',   lang: '1 Jahr',     preis: '12.00' },
    { slug: 'app-lifetime', kurz: 'Lifetime', lang: 'Lifetime',   preis: '15.00' }
  ],

  /* ---- Aktuelle App-Version ---------------------------------------------
     Version und Datum erscheinen überall, wo data-app-version bzw.
     data-app-date im HTML steht.

     Die Setup-Datei selbst steht NICHT mehr hier. Sie liegt in einem privaten
     Supabase-Bucket und wird nur nach Lizenzprüfung über einen signierten
     Link ausgegeben (Edge Function "download"). Größe und Prüfsumme holt der
     Kundenbereich direkt von dort.
     ----------------------------------------------------------------------- */
  app: {
    version: '2.4.0',
    datum: '18.09.2026'
  },

  /* ---- Änderungen der letzten Versionen ---------------------------------- */
  changelog: [
    { version: '2.4.0', datum: '18.09.2026', text: 'Autostart-Manager erkennt jetzt auch geplante Aufgaben. Silent-Profil überarbeitet.' },
    { version: '2.3.1', datum: '02.08.2026', text: 'Fehler beim Anlegen von Wiederherstellungspunkten auf Windows 11 behoben.' },
    { version: '2.3.0', datum: '19.07.2026', text: 'Neue Netzwerk-Tweaks, Erklärtexte zu jedem Schalter ergänzt.' }
  ]
};
