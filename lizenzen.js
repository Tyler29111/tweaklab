/* ==========================================================================
   Tyler Tweaks — ausgegebene Lizenzen

   Hier stehen NUR Hashes, nie die Schlüssel selbst. Wer diese Datei liest,
   kann daraus keinen gültigen Schlüssel zurückrechnen.

   Neuen Kunden eintragen
   ----------------------
   1. werkzeug-lizenzen.html im Browser öffnen (Doppelklick genügt)
   2. auf "Schlüssel erzeugen" klicken
   3. den Schlüssel dem Kunden schicken
   4. die fertige Zeile aus dem Werkzeug hier unten einfügen
   5. Datei speichern und ins Repository hochladen

   Felder
   ------
   produkt      'app' | 'optimierung' | 'bundle'  (siehe konfig.js)
   ausgestellt  Datum als TT.MM.JJJJ
   notiz        nur für dich; erscheint nirgends auf der Seite
   gesperrt     true setzen, um einen Schlüssel ungültig zu machen

   Datenschutz: Schreib hier keine Klarnamen oder E-Mail-Adressen hinein.
   Die Datei ist im Repository öffentlich einsehbar.
   ========================================================================== */

window.TT_LIZENZEN = {

  'c7680442f9f4d7de7092a0d4e5edab23bcb39055b39a9b8745ffba3ad07dbb7f': {
    produkt: 'app',
    ausgestellt: '18.09.2026',
    notiz: 'Selbsttest - wird gleich wieder entfernt'
  },

  /* ---- Testschlüssel ---------------------------------------------------
     Zum Ausprobieren des Kundenbereichs. Vor dem Live-Gang löschen!

       TT-DEMO-APP1-TEST   -> Tweak App
       TT-DEMO-OPT1-TEST   -> PC-Optimierung
       TT-DEMO-2026-TEST   -> Bundle
     --------------------------------------------------------------------- */

  'a16cde5088966332622ac6f69ae1faf5974fec9185f9b14f9c30ebf90565daf8': {
    produkt: 'app',
    ausgestellt: '18.09.2026',
    notiz: 'TESTSCHLÜSSEL — vor dem Live-Gang entfernen'
  },

  '1b4ffa12235681d06107f70fe5d7c91a3c91eadb2792a5c939985525d3c985be': {
    produkt: 'optimierung',
    ausgestellt: '18.09.2026',
    notiz: 'TESTSCHLÜSSEL — vor dem Live-Gang entfernen'
  },

  'a66a0d1c850fc794e40e5d151baff5d0cab461a63d02b5cfb4e63c3b080c143b': {
    produkt: 'bundle',
    ausgestellt: '18.09.2026',
    notiz: 'TESTSCHLÜSSEL — vor dem Live-Gang entfernen'
  }

  /* ---- Echte Kunden ab hier --------------------------------------------

  ,'hier-den-hash-aus-dem-werkzeug-einfuegen': {
    produkt: 'bundle',
    ausgestellt: '01.10.2026',
    notiz: 'Discord-Kauf'
  }

  ----------------------------------------------------------------------- */

};
