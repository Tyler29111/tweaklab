/* ==========================================================================
   Tyler Tweaks — Lizenzprüfung

   Wie es funktioniert
   -------------------
   Der Kunde gibt seinen Lizenzschlüssel ein. Der Schlüssel wird normalisiert
   (Großbuchstaben, alles außer A–Z und 0–9 fällt weg), mit einem festen
   Zusatzwort verbunden und durch SHA-256 geschickt. Das Ergebnis wird mit
   der Liste in lizenzen.js verglichen. Der Schlüssel selbst steht also
   nirgends im Repository.

   Was das NICHT ist
   -----------------
   Kein echter Kopierschutz. Die Seite liegt auf GitHub Pages und hat keinen
   Server. Wer den Quelltext liest, findet die Download-Adresse auch ohne
   gültigen Schlüssel. Der Login hält ehrliche Kunden auf Kurs und sortiert
   Neugierige aus — mehr soll er nicht.

   SHA-256 ist hier von Hand implementiert, damit die Seite auch per
   Doppelklick auf index.html läuft (window.crypto.subtle ist dort je nach
   Browser nicht verfügbar).
   ========================================================================== */

window.TTLizenz = (function () {
  'use strict';

  /* ---- Zusatzwort ------------------------------------------------------
     Wenn du das hier änderst, werden alle bestehenden Hashes ungültig.
     Dann musst du sie mit werkzeug-lizenzen.html neu erzeugen.
     --------------------------------------------------------------------- */
  var PFEFFER = 'tyler-tweaks::lizenz::v1:';

  /* ====================================================================
     SHA-256
     ==================================================================== */
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function utf8Bytes(text) {
    var aus = [], i, c, c2, cp;
    for (i = 0; i < text.length; i++) {
      c = text.charCodeAt(i);
      if (c < 0x80) {
        aus.push(c);
      } else if (c < 0x800) {
        aus.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
        c2 = text.charCodeAt(i + 1);
        cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        aus.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f),
                 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        i++;
      } else {
        aus.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return aus;
  }

  function hex8(zahl) {
    var s = (zahl >>> 0).toString(16);
    while (s.length < 8) s = '0' + s;
    return s;
  }

  function sha256(text) {
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
             0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    var bytes = utf8Bytes(text);
    var bitLaenge = bytes.length * 8;

    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    // Länge als 64-Bit-Zahl, obere 32 Bit bleiben 0 (reicht weit über jede Eingabe hier)
    bytes.push(0, 0, 0, 0,
               (bitLaenge >>> 24) & 0xff, (bitLaenge >>> 16) & 0xff,
               (bitLaenge >>> 8) & 0xff, bitLaenge & 0xff);

    var w = new Array(64);
    var i, off, s0, s1, S0, S1, ch, maj, t1, t2, a, b, c, d, e, f, g, h;

    for (off = 0; off < bytes.length; off += 64) {
      for (i = 0; i < 16; i++) {
        w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) |
               (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      }
      for (i = 16; i < 64; i++) {
        s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      a = H[0]; b = H[1]; c = H[2]; d = H[3];
      e = H[4]; f = H[5]; g = H[6]; h = H[7];

      for (i = 0; i < 64; i++) {
        S1  = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        ch  = (e & f) ^ (~e & g);
        t1  = (h + S1 + ch + K[i] + w[i]) | 0;
        S0  = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        maj = (a & b) ^ (a & c) ^ (b & c);
        t2  = (S0 + maj) | 0;

        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }

      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }

    return H.map(hex8).join('');
  }

  /* ====================================================================
     Schlüssel: normalisieren, formatieren, hashen
     ==================================================================== */

  // "tt demo-2026 test" -> "TTDEMO2026TEST"
  function normalisieren(schluessel) {
    return String(schluessel || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // "TTDEMO2026TEST" -> "TT-DEMO-2026-TEST"  (nur für die Anzeige)
  function formatieren(schluessel) {
    var roh = normalisieren(schluessel);
    if (roh.length < 6) return roh;
    var kopf = roh.slice(0, 2);
    var rest = roh.slice(2).match(/.{1,4}/g) || [];
    return [kopf].concat(rest).join('-');
  }

  function hashVon(schluessel) {
    return sha256(PFEFFER + normalisieren(schluessel));
  }

  /* ====================================================================
     Prüfung gegen die Liste aus lizenzen.js
     ==================================================================== */
  function pruefen(schluessel) {
    var roh = normalisieren(schluessel);

    if (roh.length < 10) {
      return { ok: false, grund: 'zu-kurz' };
    }

    var liste = window.TT_LIZENZEN || {};
    var eintrag = liste[hashVon(roh)];

    if (!eintrag) {
      return { ok: false, grund: 'unbekannt' };
    }
    if (eintrag.gesperrt) {
      return { ok: false, grund: 'gesperrt' };
    }

    var produkte = (window.TT_KONFIG && window.TT_KONFIG.produkte) || {};
    var produkt = produkte[eintrag.produkt];

    if (!produkt) {
      return { ok: false, grund: 'produkt-fehlt' };
    }

    return {
      ok: true,
      schluessel: formatieren(roh),
      produktSchluessel: eintrag.produkt,
      produkt: produkt,
      ausgestellt: eintrag.ausgestellt || '',
      notiz: eintrag.notiz || ''
    };
  }

  /* ====================================================================
     Anmeldung merken
     Gespeichert wird nur der Schlüssel selbst, im Browser des Kunden.
     Nichts davon verlässt das Gerät.
     ==================================================================== */
  var SPEICHER = 'tt-lizenz';

  function merken(schluessel) {
    try { window.localStorage.setItem(SPEICHER, normalisieren(schluessel)); }
    catch (e) { /* Privatmodus o. Ä. — dann gilt die Anmeldung nur für diese Seite */ }
  }

  function gemerkt() {
    try { return window.localStorage.getItem(SPEICHER) || ''; }
    catch (e) { return ''; }
  }

  function vergessen() {
    try { window.localStorage.removeItem(SPEICHER); }
    catch (e) { /* nichts zu tun */ }
  }

  return {
    sha256: sha256,
    normalisieren: normalisieren,
    formatieren: formatieren,
    hashVon: hashVon,
    pruefen: pruefen,
    merken: merken,
    gemerkt: gemerkt,
    vergessen: vergessen
  };
})();
