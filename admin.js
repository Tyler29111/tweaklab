/* ==========================================================================
   Tyler Tweaks — Verwaltung

   Diese Seite hat keine eigenen Rechte. Sie stellt genau das dar, was die
   Datenbank dem angemeldeten Konto herausgibt. Wer kein Admin ist, bekommt
   auf jede Abfrage eine leere Antwort — egal, ob er diese Datei verändert
   oder die Seite direkt aufruft.

   Der Admin darf auch nicht alles: sperren, entsperren, PC-Bindung lösen und
   eine Notiz hinterlegen. Schlüssel, Lizenztyp und Ablaufdatum sind auch für
   ihn unveränderlich — das ist in der Datenbank per Spaltenrecht festgelegt.
   ========================================================================== */

(function () {
  'use strict';

  if (!window.TT) return;
  var db = TT.db;

  TT.grundgeruest();
  TT.navAufbauen();

  var daten = {
    bestellungen: [], lizenzen: [], kunden: [], zahlungen: [], produkte: []
  };
  var kundeNach = {};

  /* ====================================================================
     Start
     ==================================================================== */
  (async function start() {
    if (TT.startFehler) {
      document.getElementById('laden').textContent = TT.startFehler;
      return;
    }

    var sitzung = await TT.schuetzen();
    if (!sitzung) return;

    var profil = await TT.profil(true);

    if (!profil || !profil.is_admin) {
      document.getElementById('laden').hidden = true;
      document.getElementById('kein-zugriff').hidden = false;
      return;
    }

    document.getElementById('a-email').textContent = sitzung.user.email;

    await ladeAlles();

    document.getElementById('laden').hidden = true;
    document.getElementById('admin').hidden = false;

    allesZeichnen();
  })();

  async function ladeAlles() {
    var e = await Promise.all([
      db.from('orders')
        .select('id, order_no, user_id, product_slug, product_name, price, currency, payment_status, paypal_order_id, paypal_capture_id, paid_at, created_at')
        .order('created_at', { ascending: false }).limit(500),

      db.from('licenses')
        .select('id, key, type, expires_at, created_at, activated_at, last_seen_at, revoked, hwid, note, user_id, order_id, product_slug')
        .order('created_at', { ascending: false }).limit(500),

      db.from('profiles')
        .select('id, email, name, is_admin, created_at')
        .order('created_at', { ascending: false }).limit(500),

      db.from('payments')
        .select('id, order_id, paypal_order_id, paypal_capture_id, event_type, status, amount, currency, payer_email, created_at')
        .order('created_at', { ascending: false }).limit(300),

      db.from('products')
        .select('slug, name, subtitle, price, currency, license_type, is_download, is_service, active, sort_order')
        .order('sort_order', { ascending: true })
    ]);

    daten.bestellungen = e[0].data || [];
    daten.lizenzen     = e[1].data || [];
    daten.kunden       = e[2].data || [];
    daten.zahlungen    = e[3].data || [];
    daten.produkte     = e[4].data || [];

    kundeNach = {};
    daten.kunden.forEach(function (k) { kundeNach[k.id] = k; });

    var fehler = e.filter(function (x) { return x.error; });
    if (fehler.length) {
      console.error('Verwaltung laden:', fehler.map(function (f) { return f.error; }));
      TT.melden('meldung',
        'Ein Teil der Daten konnte nicht geladen werden. Lade die Seite neu.', 'error');
    }
  }

  /* ====================================================================
     Bereiche
     ==================================================================== */
  var BEREICHE = ['bestellungen', 'lizenzen', 'kunden', 'zahlungen', 'produkte'];

  document.getElementById('admin-nav').addEventListener('click', function (e) {
    var knopf = e.target.closest('button[data-ziel]');
    if (!knopf) return;

    BEREICHE.forEach(function (b) {
      var el = document.getElementById('abereich-' + b);
      if (el) el.hidden = b !== knopf.dataset.ziel;
    });
    document.querySelectorAll('#admin-nav button').forEach(function (k) {
      k.classList.toggle('an', k === knopf);
    });
  });

  document.getElementById('neu-laden').addEventListener('click', async function () {
    this.disabled = true;
    this.textContent = 'Lädt …';
    await ladeAlles();
    allesZeichnen();
    this.disabled = false;
    this.textContent = 'Neu laden';
    TT.melden('meldung', '');
  });

  /* ====================================================================
     Zeichnen
     ==================================================================== */
  function allesZeichnen() {
    kennzahlen();
    bestellungenZeichnen();
    lizenzenZeichnen();
    kundenZeichnen();
    zahlungenZeichnen();
    produkteZeichnen();
  }

  function kennzahlen() {
    var bezahlt = daten.bestellungen.filter(function (b) { return b.payment_status === 'paid'; });
    var umsatz = bezahlt.reduce(function (s, b) { return s + Number(b.price || 0); }, 0);
    var aktiv = daten.lizenzen.filter(function (l) { return TT.lizenzStatus(l).klasse === 'an'; });

    var heute = new Date(); heute.setHours(0, 0, 0, 0);
    var heuteBezahlt = bezahlt.filter(function (b) {
      return b.paid_at && new Date(b.paid_at) >= heute;
    });

    var karten = [
      { wert: TT.geld(umsatz), label: 'Umsatz gesamt' },
      { wert: bezahlt.length, label: 'Bezahlte Bestellungen' },
      { wert: aktiv.length, label: 'Aktive Lizenzen' },
      { wert: daten.kunden.length, label: 'Kunden' },
      { wert: heuteBezahlt.length, label: 'Heute bezahlt' }
    ];

    document.getElementById('kennzahlen').innerHTML = karten.map(function (k) {
      return '<div class="kennzahl"><span class="wert">' + TT.escape(k.wert) +
        '</span><span class="label">' + TT.escape(k.label) + '</span></div>';
    }).join('');
  }

  function kundeText(userId) {
    var k = kundeNach[userId];
    if (!k) return '<span class="muted">unbekannt</span>';
    return TT.escape(k.name || '—') + '<br><span class="zeile-klein">' +
      TT.escape(k.email || '') + '</span>';
  }

  function statusPunkt(status) {
    return '<span class="status status-' + status.klasse + '">' +
      '<span class="punkt" aria-hidden="true"></span>' + TT.escape(status.text) + '</span>';
  }

  function tabelle(id, spalten, zeilen, leerText) {
    var el = document.getElementById(id);
    if (!zeilen.length) {
      el.innerHTML = '<tbody><tr><td class="leer">' + TT.escape(leerText) + '</td></tr></tbody>';
      return;
    }
    el.innerHTML =
      '<thead><tr>' + spalten.map(function (s) { return '<th>' + TT.escape(s) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + zeilen.join('') + '</tbody>';
  }

  /* ---- Bestellungen ---------------------------------------------------- */
  function bestellungenZeichnen() {
    var suche = (document.getElementById('suche-bestellungen').value || '').toLowerCase().trim();

    var liste = daten.bestellungen.filter(function (b) {
      if (!suche) return true;
      var k = kundeNach[b.user_id] || {};
      return [b.order_no, b.product_name, b.product_slug, b.paypal_order_id, k.name, k.email]
        .join(' ').toLowerCase().indexOf(suche) >= 0;
    });

    var zeilen = liste.map(function (b) {
      var lizenz = daten.lizenzen.find(function (l) { return l.order_id === b.id; });
      return '<tr>' +
        '<td><strong>#' + TT.escape(b.order_no) + '</strong><br>' +
          '<span class="zeile-klein">' + TT.escape(TT.datumZeit(b.created_at)) + '</span></td>' +
        '<td>' + kundeText(b.user_id) + '</td>' +
        '<td>' + TT.escape(b.product_name) + '</td>' +
        '<td>' + TT.escape(TT.geld(b.price, b.currency)) + '</td>' +
        '<td>' + statusPunkt(TT.zahlungStatus(b.payment_status)) + '</td>' +
        '<td class="mono klein">' + TT.escape(b.paypal_order_id || '—') + '</td>' +
        '<td class="mono klein">' + (lizenz ? TT.escape(lizenz.key) : '<span class="muted">—</span>') + '</td>' +
      '</tr>';
    });

    tabelle('t-bestellungen',
      ['Bestellung', 'Kunde', 'Produkt', 'Preis', 'Zahlung', 'PayPal-Order', 'Lizenz'],
      zeilen, 'Noch keine Bestellungen.');
  }

  document.getElementById('suche-bestellungen').addEventListener('input', bestellungenZeichnen);

  /* ---- Lizenzen -------------------------------------------------------- */
  function lizenzenZeichnen() {
    var suche = (document.getElementById('suche-lizenzen').value || '').toLowerCase().trim();

    var liste = daten.lizenzen.filter(function (l) {
      if (!suche) return true;
      var k = kundeNach[l.user_id] || {};
      return [l.key, l.product_slug, l.type, l.note, k.name, k.email]
        .join(' ').toLowerCase().indexOf(suche) >= 0;
    });

    var zeilen = liste.map(function (l) {
      var status = TT.lizenzStatus(l);
      return '<tr>' +
        '<td class="mono">' + TT.escape(l.key) + '</td>' +
        '<td>' + kundeText(l.user_id) + '</td>' +
        '<td>' + TT.escape(TT.laufzeit(l.type)) + '</td>' +
        '<td>' + statusPunkt(status) + '</td>' +
        '<td>' + (l.expires_at
            ? TT.escape(TT.datum(l.expires_at)) + '<br><span class="zeile-klein">' +
              TT.escape(TT.restzeit(l.expires_at)) + '</span>'
            : '<span class="muted">unbegrenzt</span>') + '</td>' +
        '<td>' + (l.hwid
            ? '<span class="zeile-klein mono" title="' + TT.escape(l.hwid) + '">gebunden</span>'
            : '<span class="muted">frei</span>') +
          '<br><span class="zeile-klein">' +
          (l.last_seen_at ? 'zuletzt ' + TT.escape(TT.datum(l.last_seen_at)) : 'nie benutzt') +
          '</span></td>' +
        '<td class="aktionen">' +
          '<button type="button" class="mini" data-tun="' + (l.revoked ? 'entsperren' : 'sperren') +
            '" data-key="' + TT.escape(l.key) + '">' +
            (l.revoked ? 'Entsperren' : 'Sperren') + '</button>' +
          (l.hwid
            ? '<button type="button" class="mini" data-tun="pc-loesen" data-key="' +
              TT.escape(l.key) + '">PC lösen</button>'
            : '') +
          '<button type="button" class="mini" data-tun="notiz" data-key="' + TT.escape(l.key) +
            '" data-notiz="' + TT.escape(l.note || '') + '">Notiz</button>' +
        '</td>' +
      '</tr>' +
      (l.note
        ? '<tr class="notiz-zeile"><td colspan="7"><span class="zeile-klein">Notiz: ' +
          TT.escape(l.note) + '</span></td></tr>'
        : '');
    });

    tabelle('t-lizenzen',
      ['Lizenz-Key', 'Kunde', 'Laufzeit', 'Status', 'Ablauf', 'PC', ''],
      zeilen, 'Noch keine Lizenzen.');
  }

  document.getElementById('suche-lizenzen').addEventListener('input', lizenzenZeichnen);

  /* ---- Aktionen auf Lizenzen ------------------------------------------ */
  document.addEventListener('click', async function (e) {
    var knopf = e.target.closest('button[data-tun]');
    if (!knopf) return;

    var key = knopf.dataset.key;
    var tun = knopf.dataset.tun;
    var lizenz = daten.lizenzen.find(function (l) { return l.key === key; });
    if (!lizenz) return;

    var aenderung = null;

    if (tun === 'sperren') {
      if (!confirm('Lizenz ' + key + ' wirklich sperren?\n\n' +
                   'Die App lässt sich damit sofort nicht mehr starten.')) return;
      aenderung = { revoked: true };

    } else if (tun === 'entsperren') {
      aenderung = { revoked: false };

    } else if (tun === 'pc-loesen') {
      if (!confirm('Bindung an den PC lösen?\n\n' +
                   'Der Kunde kann die Lizenz danach auf einem anderen Rechner aktivieren.')) return;
      aenderung = { hwid: null };

    } else if (tun === 'notiz') {
      var neu = prompt('Notiz zu ' + key + ':', knopf.dataset.notiz || '');
      if (neu === null) return;
      aenderung = { note: neu.trim() || null };
    }

    if (!aenderung) return;

    knopf.disabled = true;
    var erg = await db.from('licenses').update(aenderung).eq('key', key);
    knopf.disabled = false;

    if (erg.error) {
      console.error('Lizenz ändern:', erg.error);
      return TT.melden('meldung',
        'Die Änderung wurde abgelehnt. Prüfe, ob dein Konto noch Adminrechte hat.', 'error');
    }

    Object.assign(lizenz, aenderung);
    lizenzenZeichnen();
    kennzahlen();
    TT.melden('meldung', 'Gespeichert.', 'ok');
  });

  /* ---- Kunden ---------------------------------------------------------- */
  function kundenZeichnen() {
    var suche = (document.getElementById('suche-kunden').value || '').toLowerCase().trim();

    var liste = daten.kunden.filter(function (k) {
      if (!suche) return true;
      return [k.name, k.email].join(' ').toLowerCase().indexOf(suche) >= 0;
    });

    var zeilen = liste.map(function (k) {
      var bestellungen = daten.bestellungen.filter(function (b) {
        return b.user_id === k.id && b.payment_status === 'paid';
      });
      var lizenzen = daten.lizenzen.filter(function (l) { return l.user_id === k.id; });
      var umsatz = bestellungen.reduce(function (s, b) { return s + Number(b.price || 0); }, 0);

      return '<tr>' +
        '<td><strong>' + TT.escape(k.name || '—') + '</strong>' +
          (k.is_admin ? ' <span class="merker">Admin</span>' : '') + '</td>' +
        '<td>' + TT.escape(k.email || '—') + '</td>' +
        '<td>' + TT.escape(TT.datum(k.created_at)) + '</td>' +
        '<td>' + bestellungen.length + '</td>' +
        '<td>' + lizenzen.length + '</td>' +
        '<td>' + TT.escape(TT.geld(umsatz)) + '</td>' +
      '</tr>';
    });

    tabelle('t-kunden',
      ['Name', 'E-Mail', 'Kunde seit', 'Bestellungen', 'Lizenzen', 'Umsatz'],
      zeilen, 'Noch keine Kunden.');
  }

  document.getElementById('suche-kunden').addEventListener('input', kundenZeichnen);

  /* ---- Zahlungen ------------------------------------------------------- */
  function zahlungenZeichnen() {
    var zeilen = daten.zahlungen.map(function (z) {
      var bestellung = daten.bestellungen.find(function (b) { return b.id === z.order_id; });
      return '<tr>' +
        '<td>' + TT.escape(TT.datumZeit(z.created_at)) + '</td>' +
        '<td>' + (bestellung ? '#' + TT.escape(bestellung.order_no) : '<span class="muted">—</span>') + '</td>' +
        '<td>' + TT.escape(TT.geld(z.amount, z.currency)) + '</td>' +
        '<td>' + TT.escape(z.payer_email || '—') + '</td>' +
        '<td class="klein">' + TT.escape(z.event_type || '—') + '</td>' +
        '<td class="mono klein">' + TT.escape(z.paypal_capture_id || '—') + '</td>' +
      '</tr>';
    });

    tabelle('t-zahlungen',
      ['Zeitpunkt', 'Bestellung', 'Betrag', 'Zahler', 'Meldung', 'PayPal-Buchung'],
      zeilen, 'Noch keine Zahlungen protokolliert.');
  }

  /* ---- Produkte -------------------------------------------------------- */
  function produkteZeichnen() {
    var zeilen = daten.produkte.map(function (p) {
      var verkauft = daten.bestellungen.filter(function (b) {
        return b.product_slug === p.slug && b.payment_status === 'paid';
      }).length;

      return '<tr' + (p.active ? '' : ' class="inaktiv"') + '>' +
        '<td><strong>' + TT.escape(p.name) + '</strong><br>' +
          '<span class="zeile-klein mono">' + TT.escape(p.slug) + '</span></td>' +
        '<td>' + TT.escape(TT.geld(p.price, p.currency)) + '</td>' +
        '<td>' + (p.license_type
            ? TT.escape(TT.laufzeit(p.license_type))
            : '<span class="muted">keine Lizenz</span>') + '</td>' +
        '<td>' + (p.is_download ? 'ja' : '—') + '</td>' +
        '<td>' + (p.is_service ? 'ja' : '—') + '</td>' +
        '<td>' + (p.active ? 'aktiv' : '<span class="muted">versteckt</span>') + '</td>' +
        '<td>' + verkauft + '</td>' +
      '</tr>';
    });

    tabelle('t-produkte',
      ['Produkt', 'Preis', 'Laufzeit', 'Download', 'Service', 'Sichtbar', 'Verkauft'],
      zeilen, 'Keine Produkte hinterlegt.');
  }
})();
