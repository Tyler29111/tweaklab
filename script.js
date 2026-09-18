/* ==========================================================================
   Tyler Tweaks — Interaktionen der Startseite
   Aufbau: Konfiguration einsetzen · Navigation · Mobiles Menü ·
           Sanftes Scrollen · Reveal · FAQ · App-Ansichten · PayPal
   ========================================================================== */

(function () {
  'use strict';

  var KONFIG = window.TT_KONFIG || {};

  /* ====================================================================
     1. Werte aus konfig.js ins HTML einsetzen
     Überall, wo data-app-version oder data-app-date steht, wird der Wert
     aus der Konfiguration eingetragen. So gibt es nur eine Quelle.
     ==================================================================== */
  (function einsetzen() {
    var app = KONFIG.app || {};

    document.querySelectorAll('[data-app-version]').forEach(function (el) {
      if (!app.version) return;
      // In der Fenster-Titelleiste steht ein "v" davor
      el.textContent = (el.textContent.trim().charAt(0) === 'v' ? 'v' : '') + app.version;
    });

    document.querySelectorAll('[data-app-date]').forEach(function (el) {
      if (app.datum) el.textContent = app.datum;
    });

    // paypal.me-Links aus der Konfiguration aufbauen
    if (KONFIG.paypalMe) {
      document.querySelectorAll('[data-paypalme]').forEach(function (el) {
        var betrag = el.getAttribute('data-paypalme');
        el.href = KONFIG.paypalMe.replace(/\/+$/, '') + '/' + betrag + 'EUR';
      });
    }

    var jahr = document.getElementById('year');
    if (jahr) jahr.textContent = new Date().getFullYear();
  })();

  /* ====================================================================
     2. Navigation: Hintergrund beim Scrollen
     ==================================================================== */
  (function navScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var aktualisieren = function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    aktualisieren();
    window.addEventListener('scroll', aktualisieren, { passive: true });
  })();

  /* ====================================================================
     3. Mobiles Menü
     ==================================================================== */
  (function mobilesMenue() {
    var nav = document.getElementById('nav');
    var knopf = document.getElementById('nav-toggle');
    if (!nav || !knopf) return;

    var schliessen = function () {
      nav.classList.remove('open');
      knopf.setAttribute('aria-expanded', 'false');
      knopf.setAttribute('aria-label', 'Menü öffnen');
    };

    knopf.addEventListener('click', function () {
      var offen = nav.classList.toggle('open');
      knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
      knopf.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    });

    // Nach einem Klick auf einen Link wieder zumachen
    nav.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', schliessen);
    });

    // Escape schließt ebenfalls
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        schliessen();
        knopf.focus();
      }
    });

    // Klick außerhalb der Navigation schließt das Menü
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target)) schliessen();
    });
  })();

  /* ====================================================================
     4. Sanftes Scrollen zu einer bestimmten Preiskarte
     Die Hero-Buttons springen nicht nur zum Preisblock, sondern heben
     die passende Karte kurz hervor.
     ==================================================================== */
  (function scrollZuKarte() {
    document.querySelectorAll('[data-scroll-to]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var ziel = document.getElementById(link.getAttribute('data-scroll-to'));
        if (!ziel) return; // Der normale #preise-Sprung greift dann weiterhin

        e.preventDefault();
        ziel.scrollIntoView({ behavior: 'smooth', block: 'center' });

        ziel.classList.remove('flash');
        // Neustart der Animation erzwingen
        void ziel.offsetWidth;
        ziel.classList.add('flash');
        window.setTimeout(function () { ziel.classList.remove('flash'); }, 1600);
      });
    });
  })();

  /* ====================================================================
     5. Sektionen beim Hereinscrollen einblenden
     ==================================================================== */
  (function reveal() {
    var elemente = document.querySelectorAll('.reveal');
    if (!elemente.length) return;

    if (!('IntersectionObserver' in window)) {
      elemente.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) return;
        eintrag.target.classList.add('visible');
        beobachter.unobserve(eintrag.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elemente.forEach(function (el) { beobachter.observe(el); });
  })();

  /* ====================================================================
     6. FAQ: immer nur eine Antwort offen
     ==================================================================== */
  (function faq() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
    panels.forEach(function (panel) {
      panel.addEventListener('toggle', function () {
        if (!panel.open) return;
        panels.forEach(function (anderes) {
          if (anderes !== panel) anderes.open = false;
        });
      });
    });
  })();

  /* ====================================================================
     7. App-Ansichten umschalten (Übersicht / Tweaks / Sicherung)
     Mit Pfeiltasten bedienbar, wie es für Tabs üblich ist.
     ==================================================================== */
  (function ansichten() {
    var leiste = document.querySelector('.shot-tabs');
    if (!leiste) return;

    var tabs = Array.prototype.slice.call(leiste.querySelectorAll('.shot-tab'));
    if (!tabs.length) return;

    var zeigen = function (index, fokus) {
      tabs.forEach(function (tab, i) {
        var aktiv = i === index;
        tab.setAttribute('aria-selected', aktiv ? 'true' : 'false');
        tab.tabIndex = aktiv ? 0 : -1;

        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !aktiv;
      });
      if (fokus) tabs[index].focus();
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { zeigen(i, false); });

      tab.addEventListener('keydown', function (e) {
        var ziel = null;
        if (e.key === 'ArrowRight') ziel = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') ziel = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') ziel = 0;
        else if (e.key === 'End') ziel = tabs.length - 1;

        if (ziel === null) return;
        e.preventDefault();
        zeigen(ziel, true);
      });
    });
  })();

  /* ====================================================================
     8. PayPal-Buttons
     Nur aktiv, wenn in konfig.js eine Client-ID hinterlegt ist. Ohne ID
     bleibt alles beim paypal.me-Button — die Seite funktioniert also in
     jedem Fall.

     Wichtig: Diese Prüfung läuft im Browser. Verlass dich nicht darauf,
     sondern kontrolliere jede Zahlung in deinem PayPal-Konto, bevor du
     einen Lizenzschlüssel herausgibst.
     ==================================================================== */
  (function paypal() {
    var slots = document.querySelectorAll('.paypal-slot');
    if (!slots.length) return;

    var clientId = (KONFIG.paypalClientId || '').trim();
    if (!clientId) return; // Kein Konto hinterlegt -> paypal.me bleibt der Weg

    var skript = document.createElement('script');
    skript.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(clientId) +
                 '&currency=' + encodeURIComponent(KONFIG.waehrung || 'EUR') +
                 '&locale=de_DE&intent=capture';
    skript.async = true;

    skript.onerror = function () {
      // SDK nicht erreichbar (Blocker, Netzwerk) — paypal.me bleibt sichtbar
      console.warn('PayPal-SDK konnte nicht geladen werden. Die paypal.me-Buttons bleiben aktiv.');
    };

    skript.onload = function () {
      if (!window.paypal || !window.paypal.Buttons) return;

      slots.forEach(function (slot) {
        var schluessel = slot.getAttribute('data-paypal');
        var produkt = (KONFIG.produkte || {})[schluessel];
        if (!produkt) return;

        window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', color: 'gold', label: 'paypal', height: 46 },

          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [{
                description: produkt.beschreibung,
                amount: {
                  value: produkt.preis,
                  currency_code: KONFIG.waehrung || 'EUR'
                }
              }]
            });
          },

          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              bestaetigungZeigen(slot, produkt, details);
            });
          },

          onError: function (err) {
            console.error('PayPal-Fehler:', err);
            var hinweis = document.createElement('p');
            hinweis.className = 'plan-alt';
            hinweis.style.color = '#fca5a5';
            hinweis.textContent = 'Die Zahlung konnte nicht gestartet werden. Nutze bitte den Button darunter.';
            slot.appendChild(hinweis);
          }
        }).render(slot);

        // Der paypal.me-Button rutscht zur Ausweichlösung herunter
        var karte = slot.closest('.plan');
        var alt = karte && karte.querySelector('[data-paypalme]');
        if (alt) {
          alt.classList.remove('btn-primary');
          alt.classList.add('btn-ghost');
          alt.textContent = 'Stattdessen über paypal.me zahlen';
        }
      });
    };

    document.head.appendChild(skript);
  })();

  /* Bestätigung nach erfolgreicher Zahlung ------------------------------- */
  function bestaetigungZeigen(slot, produkt, details) {
    var karte = slot.closest('.plan');
    if (!karte) return;

    var name = '';
    try { name = details.payer.name.given_name || ''; } catch (e) { /* optional */ }

    var id = (details && details.id) ? details.id : '—';

    var box = document.createElement('div');
    box.className = 'paypal-ok';
    box.setAttribute('role', 'status');
    box.innerHTML =
      '<strong>Zahlung eingegangen. Danke' + (name ? ', ' + escapeHtml(name) : '') + '!</strong>' +
      '<p>Bestellnummer: <code>' + escapeHtml(id) + '</code></p>' +
      '<p>Schreib mir jetzt auf Discord <strong>' + escapeHtml(KONFIG.discord || '') + '</strong> ' +
      'und nenne diese Bestellnummer. Du bekommst dann deinen Lizenzschlüssel für „' +
      escapeHtml(produkt.name) + '“.</p>';

    karte.querySelector('.plan-buy').replaceChildren(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function escapeHtml(wert) {
    return String(wert).replace(/[&<>"']/g, function (z) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z];
    });
  }

})();
