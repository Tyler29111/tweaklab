/* ==========================================================================
   Tyler Tweaks — Kundenbereich
   Anmeldung per Lizenzschlüssel, Anzeige von Lizenz und Download.
   Die eigentliche Prüfung steckt in lizenz.js.
   ========================================================================== */

(function () {
  'use strict';

  var KONFIG  = window.TT_KONFIG || {};
  var Lizenz  = window.TTLizenz;
  if (!Lizenz) return;

  var ansichtLogin = document.getElementById('ansicht-login');
  var ansichtKonto = document.getElementById('ansicht-konto');
  var formular     = document.getElementById('login-form');
  var eingabe      = document.getElementById('schluessel');
  var meldung      = document.getElementById('meldung');
  var knopfAnmelden = formular ? formular.querySelector('button[type="submit"]') : null;

  /* ====================================================================
     Lizenzliste laden — mit Zeitstempel gegen den Zwischenspeicher

     GitHub Pages erlaubt Browsern, Dateien bis zu zehn Minuten lang
     aufzubewahren. Stünde lizenzen.js als <script> im HTML, bekäme ein
     Kunde womöglich die Liste von vorhin — und sein frisch vergebener
     Schlüssel würde abgelehnt, obwohl er längst online ist.
     Der Zeitstempel erzwingt bei jedem Aufruf eine frische Liste.
     ==================================================================== */
  function listeLaden(fertig) {
    var skript = document.createElement('script');
    skript.src = 'lizenzen.js?t=' + Date.now();
    skript.onload  = function () { fertig(true); };
    skript.onerror = function () { fertig(false); };
    document.head.appendChild(skript);
  }

  /* ====================================================================
     Discord-Name aus der Konfiguration überall eintragen
     ==================================================================== */
  (function discord() {
    if (!KONFIG.discord) return;
    var d1 = document.getElementById('discord-1');
    if (d1) d1.textContent = KONFIG.discord;
    document.querySelectorAll('.discord-name').forEach(function (el) {
      el.textContent = KONFIG.discord;
    });
  })();

  /* ====================================================================
     Fehlermeldungen in Klartext
     ==================================================================== */
  var TEXTE = {
    'zu-kurz':       'Der Schlüssel sieht unvollständig aus. Er hat das Format TT-XXXX-XXXX-XXXX.',
    'unbekannt':     'Diesen Schlüssel kenne ich nicht. Prüfe bitte die Eingabe — Bindestriche und Groß- oder Kleinschreibung spielen keine Rolle.',
    'gesperrt':      'Dieser Schlüssel wurde gesperrt. Melde dich bitte auf Discord, dann klären wir das.',
    'produkt-fehlt': 'Zu diesem Schlüssel fehlt die Produktangabe. Bitte melde dich auf Discord.'
  };

  function zeigeFehler(text) {
    if (!meldung) return;
    meldung.textContent = text;
    meldung.className = 'form-msg error show';
  }

  function versteckeMeldung() {
    if (!meldung) return;
    meldung.className = 'form-msg';
    meldung.textContent = '';
  }

  /* ====================================================================
     Eingabe während des Tippens lesbar gruppieren
     Nur, wenn der Cursor am Ende steht — sonst springt er beim Korrigieren.
     ==================================================================== */
  if (eingabe) {
    eingabe.addEventListener('input', function () {
      var amEnde = eingabe.selectionStart === eingabe.value.length;
      if (!amEnde) return;

      var formatiert = Lizenz.formatieren(eingabe.value);
      if (formatiert !== eingabe.value) {
        eingabe.value = formatiert;
        eingabe.setSelectionRange(formatiert.length, formatiert.length);
      }
      versteckeMeldung();
    });
  }

  /* ====================================================================
     Anmelden
     ==================================================================== */
  if (formular) {
    formular.addEventListener('submit', function (e) {
      e.preventDefault();

      var eingegeben = eingabe ? eingabe.value : '';
      var ergebnis = Lizenz.pruefen(eingegeben);

      if (!ergebnis.ok) {
        zeigeFehler(TEXTE[ergebnis.grund] || 'Die Anmeldung hat nicht geklappt.');
        if (eingabe) { eingabe.focus(); eingabe.select(); }
        return;
      }

      Lizenz.merken(eingegeben);
      versteckeMeldung();
      kontoAnzeigen(ergebnis);
    });
  }

  /* ====================================================================
     Abmelden
     ==================================================================== */
  var knopfAbmelden = document.getElementById('abmelden');
  if (knopfAbmelden) {
    knopfAbmelden.addEventListener('click', function () {
      Lizenz.vergessen();
      if (ansichtKonto) ansichtKonto.hidden = true;
      if (ansichtLogin) ansichtLogin.hidden = false;
      if (eingabe) { eingabe.value = ''; eingabe.focus(); }
      versteckeMeldung();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ====================================================================
     Schlüssel in die Zwischenablage
     ==================================================================== */
  var knopfKopieren = document.getElementById('kopieren');
  if (knopfKopieren) {
    knopfKopieren.addEventListener('click', function () {
      var feld = document.getElementById('k-schluessel');
      if (!feld) return;

      var fertig = function () {
        var alt = knopfKopieren.textContent;
        knopfKopieren.textContent = 'Kopiert';
        window.setTimeout(function () { knopfKopieren.textContent = alt; }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(feld.textContent.trim()).then(fertig, auswaehlen);
      } else {
        auswaehlen();
      }

      // Rückfallebene: Text markieren, damit der Kunde selbst kopieren kann
      function auswaehlen() {
        var bereich = document.createRange();
        bereich.selectNodeContents(feld);
        var auswahl = window.getSelection();
        auswahl.removeAllRanges();
        auswahl.addRange(bereich);
        knopfKopieren.textContent = 'Markiert — Strg+C';
      }
    });
  }

  /* ====================================================================
     Kundenbereich befüllen und anzeigen
     ==================================================================== */
  function kontoAnzeigen(lizenz) {
    var app = KONFIG.app || {};
    var produkt = lizenz.produkt;

    setzen('k-produkt', produkt.name);
    setzen('k-produkt-2', produkt.name);
    setzen('k-schluessel', lizenz.schluessel);
    setzen('k-datum', lizenz.ausgestellt || 'unbekannt');

    /* ---- Download nur bei Produkten mit App ---- */
    var panelDownload = document.getElementById('panel-download');
    if (panelDownload) {
      panelDownload.hidden = !produkt.download;

      if (produkt.download) {
        var link = document.getElementById('download-link');
        var text = document.getElementById('download-text');

        if (app.datei) {
          link.href = app.datei;
          link.setAttribute('download', '');
          if (text) text.textContent = 'Setup herunterladen (Version ' + (app.version || '') + ')';
        } else {
          // Noch keine Datei hinterlegt — lieber ehrlich als ein toter Link
          link.href = '#';
          link.setAttribute('aria-disabled', 'true');
          link.classList.add('btn-ghost');
          link.classList.remove('btn-primary');
          if (text) text.textContent = 'Download wird gerade vorbereitet';
          link.addEventListener('click', function (e) { e.preventDefault(); });
        }

        setzen('dl-groesse', app.groesse || '');

        var pruef = document.getElementById('dl-pruefsumme');
        if (pruef && app.sha256) {
          pruef.hidden = false;
          pruef.textContent = 'SHA-256 der Datei: ' + app.sha256;
        }
      }
    }

    /* ---- Terminblock nur bei Produkten mit Dienstleistung ---- */
    var panelService = document.getElementById('panel-service');
    if (panelService) panelService.hidden = !produkt.service;

    /* ---- Änderungen der letzten Versionen ---- */
    changelogFuellen();

    if (ansichtLogin) ansichtLogin.hidden = true;
    if (ansichtKonto) ansichtKonto.hidden = false;
  }

  function changelogFuellen() {
    var liste = document.getElementById('changelog');
    if (!liste || liste.childElementCount) return;

    var eintraege = KONFIG.changelog || [];
    if (!eintraege.length) {
      liste.innerHTML = '<li><p class="muted">Noch keine Einträge.</p></li>';
      return;
    }

    eintraege.forEach(function (e) {
      var li = document.createElement('li');

      var kopf = document.createElement('div');
      kopf.className = 'ver';

      var v = document.createElement('span');
      v.className = 'v';
      v.textContent = 'Version ' + e.version;

      var d = document.createElement('span');
      d.className = 'd';
      d.textContent = e.datum;

      kopf.append(v, d);

      var p = document.createElement('p');
      p.textContent = e.text;

      li.append(kopf, p);
      liste.appendChild(li);
    });
  }

  function setzen(id, wert) {
    var el = document.getElementById(id);
    if (el && wert) el.textContent = wert;
  }

  /* ====================================================================
     Beim Laden: erst die Lizenzliste holen, dann gemerkte Anmeldung prüfen
     ==================================================================== */
  (function start() {
    // Solange die Liste fehlt, darf niemand anmelden — sonst käme
    // fälschlich „Schlüssel unbekannt“ heraus.
    if (knopfAnmelden) knopfAnmelden.disabled = true;

    listeLaden(function (geklappt) {
      if (knopfAnmelden) knopfAnmelden.disabled = false;

      if (!geklappt) {
        zeigeFehler('Die Lizenzliste konnte nicht geladen werden. Prüfe deine ' +
                    'Internetverbindung und lade die Seite neu.');
        return;
      }

      var gemerkt = Lizenz.gemerkt();
      if (!gemerkt) {
        if (eingabe) eingabe.focus();
        return;
      }

      var ergebnis = Lizenz.pruefen(gemerkt);
      if (ergebnis.ok) {
        kontoAnzeigen(ergebnis);
      } else {
        // Schlüssel wurde zwischenzeitlich entfernt oder gesperrt
        Lizenz.vergessen();
        if (eingabe) eingabe.focus();
      }
    });
  })();

})();
