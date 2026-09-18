/* ==========================================================================
   Tyler Tweaks — Interaktionen der Startseite

   Aufbau: Navigation · Sanftes Scrollen · Reveal · FAQ · App-Ansichten ·
           Laufzeit-Auswahl · Preise aus der Datenbank

   Was hier NICHT mehr passiert: Zahlungen. Der frühere PayPal-Block hat die
   Zahlung im Browser bestätigt und dem Kunden gesagt, er solle sich auf
   Discord melden. Das war nicht fälschungssicher. Gekauft wird jetzt auf
   kaufen.html, wo Preis und Zahlungsprüfung auf dem Server liegen.
   ========================================================================== */

(function () {
  'use strict';

  var KONFIG = window.TT_KONFIG || {};

  /* ====================================================================
     1. Grundgerüst: Version, Jahr, Navigation, Anmeldestatus
     ==================================================================== */
  if (window.TT) {
    TT.grundgeruest();
    TT.navAufbauen();
  }

  /* ====================================================================
     2. Sanftes Scrollen zu einer bestimmten Preiskarte
     ==================================================================== */
  (function scrollZuKarte() {
    document.querySelectorAll('[data-scroll-to]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var ziel = document.getElementById(link.getAttribute('data-scroll-to'));
        if (!ziel) return; // Der normale #preise-Sprung greift dann weiterhin

        e.preventDefault();
        ziel.scrollIntoView({ behavior: 'smooth', block: 'center' });

        ziel.classList.remove('flash');
        void ziel.offsetWidth; // Neustart der Animation erzwingen
        ziel.classList.add('flash');
        window.setTimeout(function () { ziel.classList.remove('flash'); }, 1600);
      });
    });
  })();

  /* ====================================================================
     3. Sektionen beim Hereinscrollen einblenden
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
     4. FAQ: immer nur eine Antwort offen
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
     5. App-Ansichten umschalten (Übersicht / Tweaks / Sicherung)
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
     6. Laufzeit-Auswahl in der Preiskarte
     ==================================================================== */
  var laufzeiten = (KONFIG.laufzeiten || []).slice();
  var gewaehlt = 'app-lifetime';

  function preisFormat(wert) {
    var zahl = Number(wert);
    if (!isFinite(zahl)) return '—';
    // Ganze Beträge ohne Nachkommastellen: "15" statt "15,00"
    return zahl % 1 === 0 ? String(zahl) : zahl.toFixed(2).replace('.', ',');
  }

  function laufzeitZeigen(slug) {
    var eintrag = laufzeiten.filter(function (l) { return l.slug === slug; })[0];
    if (!eintrag) return;

    gewaehlt = slug;

    var preisEl = document.getElementById('app-preis');
    if (preisEl) preisEl.textContent = preisFormat(eintrag.preis);

    var knopf = document.getElementById('app-kaufen');
    if (knopf) {
      knopf.href = 'kaufen.html?produkt=' + encodeURIComponent(slug);
      knopf.textContent = 'Für ' + preisFormat(eintrag.preis) + ' € kaufen';
    }

    var zeile = document.getElementById('app-lizenz-zeile');
    if (zeile) {
      zeile.textContent = slug === 'app-lifetime'
        ? 'Lebenslange Lizenz für 1 PC'
        : 'Lizenz für 1 PC · ' + eintrag.lang;
    }

    document.querySelectorAll('#laufzeit-knoepfe button').forEach(function (b) {
      var aktiv = b.dataset.slug === slug;
      b.classList.toggle('an', aktiv);
      b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
    });
  }

  var zuhoererGesetzt = false;

  function laufzeitenZeichnen() {
    var behaelter = document.getElementById('laufzeit-knoepfe');
    if (!behaelter || !laufzeiten.length) return;

    behaelter.innerHTML = laufzeiten.map(function (l) {
      return '<button type="button" data-slug="' + l.slug + '" aria-pressed="false">' +
        '<span class="lz-name">' + l.kurz + '</span>' +
        '<span class="lz-preis">' + preisFormat(l.preis) + ' €</span>' +
        '</button>';
    }).join('');

    // Der Zuhörer hängt am Behälter, nicht an den Knöpfen — er überlebt das
    // Neuzeichnen und darf deshalb nur einmal gesetzt werden.
    if (!zuhoererGesetzt) {
      behaelter.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-slug]');
        if (b) laufzeitZeigen(b.dataset.slug);
      });
      zuhoererGesetzt = true;
    }

    laufzeitZeigen(gewaehlt);
  }

  laufzeitenZeichnen();

  /* ====================================================================
     7. Preise aus der Datenbank bestätigen

     Die Preise im HTML sind nur die schnelle Anzeige. Verbindlich ist, was
     in der Datenbank steht — und genau das berechnet auch die Edge Function
     beim Kauf. Weicht etwas ab, korrigiert sich die Seite hier selbst,
     damit nirgends ein falscher Preis stehen bleibt.
     ==================================================================== */
  (async function preiseAbgleichen() {
    if (!window.TT || !TT.db) return;

    var erg = await TT.db.from('products')
      .select('slug, price, active')
      .eq('active', true);

    if (erg.error || !erg.data) return; // Anzeige aus konfig.js bleibt stehen

    var ausDb = {};
    erg.data.forEach(function (p) { ausDb[p.slug] = p.price; });

    var geaendert = false;
    laufzeiten.forEach(function (l) {
      if (ausDb[l.slug] != null && Number(ausDb[l.slug]) !== Number(l.preis)) {
        l.preis = ausDb[l.slug];
        geaendert = true;
      }
    });

    // Laufzeiten, die es in der Datenbank nicht (mehr) gibt, verschwinden.
    var vorher = laufzeiten.length;
    laufzeiten = laufzeiten.filter(function (l) { return ausDb[l.slug] != null; });
    if (laufzeiten.length !== vorher) geaendert = true;

    if (geaendert) {
      if (!laufzeiten.some(function (l) { return l.slug === gewaehlt; })) {
        gewaehlt = laufzeiten.length ? laufzeiten[laufzeiten.length - 1].slug : 'app-lifetime';
      }
      laufzeitenZeichnen();
    }

    // Die beiden festen Karten
    document.querySelectorAll('[data-preis]').forEach(function (el) {
      var preis = ausDb[el.dataset.preis];
      if (preis == null) return;
      el.textContent = 'Für ' + preisFormat(preis) + ' € kaufen';

      var karte = el.closest('.plan');
      var betrag = karte && karte.querySelector('.price .amount');
      if (betrag) betrag.textContent = preisFormat(preis);
    });
  })();

})();
