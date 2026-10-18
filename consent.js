/*!
 * consent.js – gemeinsame Cookie-Einwilligung für alle Seiten von finanzberater-friedl.info
 *
 * Einbindung auf JEDER Seite (im <head>, VOR allen anderen Skripten):
 *   <script src="/consent.js" defer></script>
 * Footer-Link zum Ändern/Widerrufen (auf jeder Seite; jeder Link mit href="#cookie-einstellungen" funktioniert ebenfalls):
 *   <a href="#cookie-einstellungen" data-mf-cookie-settings>Cookie-Einstellungen ändern</a>
 *
 * Verhalten:
 *  - Google Analytics 4 wird NUR geladen, wenn die gespeicherte Entscheidung "analytics = true" lautet.
 *  - Ohne Entscheidung, bei Ablehnung oder wenn der Browser-Speicher nicht verfügbar ist: kein GA.
 *  - Widerruf: GA wird abgeschaltet (ga-disable-Flag), GA-Cookies werden gelöscht, Script wird entfernt.
 *  - Alte Einwilligungen (andere Schlüssel/Versionen) gelten nicht und werden gelöscht -> erneute Abfrage.
 *  - Bei geänderten Datenschutz-Texten CONSENT_VERSION erhöhen -> alle werden erneut gefragt.
 *
 * Hinweis: Die technische Speicherung der Entscheidung selbst (localStorage) ist kein Tracking.
 * Rechtliche Bewertung erfolgt gesondert.
 */
(function () {
  'use strict';

  var GA_ID = 'G-Q5N5F85YTW';
  var CONSENT_VERSION = 2;
  var STORAGE_KEY = 'mf_consent_v' + CONSENT_VERSION;
  var LEGACY_KEYS = ['cookiesAccepted', 'mf_cookie_consent', 'mf_cookie_consent_ts', 'mf_consent_v1'];
  var PRIVACY_URL = '/datenschutz.html';

  var gaLoaded = false;
  var memoryChoice = null; // Fallback, wenn localStorage nicht verfügbar ist (gilt nur für diese Seite)

  /* GA ist standardmäßig AUS – bevor irgendetwas anderes passiert. */
  window['ga-disable-' + GA_ID] = true;

  /* ───────────── Speicher ───────────── */
  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return memoryChoice;
      var o = JSON.parse(raw);
      if (o && o.v === CONSENT_VERSION && typeof o.analytics === 'boolean') return o;
    } catch (e) { /* ignorieren */ }
    return memoryChoice;
  }

  function writeChoice(analytics) {
    var o = { v: CONSENT_VERSION, analytics: !!analytics, ts: new Date().toISOString() };
    memoryChoice = o;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch (e) { /* ignorieren */ }
    return o;
  }

  function removeLegacy() {
    try {
      LEGACY_KEYS.forEach(function (k) { window.localStorage.removeItem(k); });
    } catch (e) { /* ignorieren */ }
  }

  /* ───────────── Google Analytics ───────────── */
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var s = document.createElement('script');
    s.id = 'mf-ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function deleteGaCookies() {
    var host = window.location.hostname;
    var parts = host.split('.');
    var domains = ['', host];
    for (var i = 0; i < parts.length - 1; i++) {
      domains.push('.' + parts.slice(i).join('.'));
    }
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name.indexOf('_gat') === 0) {
        domains.forEach(function (d) {
          var base = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/';
          document.cookie = d ? base + '; domain=' + d : base;
        });
      }
    });
  }

  function disableGA() {
    window['ga-disable-' + GA_ID] = true;
    window.gtag = function () { /* nach Widerruf: nichts mehr senden */ };
    var s = document.getElementById('mf-ga-script');
    if (s && s.parentNode) s.parentNode.removeChild(s);
    gaLoaded = false;
    deleteGaCookies();
    // Nachlaufende Ereignisse abfangen und eventuell neu gesetzte Cookies erneut löschen
    setTimeout(deleteGaCookies, 500);
    setTimeout(deleteGaCookies, 2500);
  }

  function applyChoice(choice) {
    if (choice && choice.analytics === true) loadGA();
    else disableGA();
  }

  /* ───────────── Banner ───────────── */
  var CSS = '' +
    '#mfc-banner{position:fixed;left:0;right:0;bottom:0;z-index:100000;display:none;justify-content:center;padding:12px;font-family:"Outfit",system-ui,sans-serif}' +
    '#mfc-banner.mfc-open{display:flex}' +
    '#mfc-box{background:#fff;color:#1a3555;max-width:980px;width:100%;border-radius:14px;box-shadow:0 -6px 32px rgba(0,0,0,.28);border:1px solid rgba(26,53,85,.15);padding:22px 26px;display:flex;gap:22px;align-items:center;flex-wrap:wrap}' +
    '#mfc-text{flex:1 1 320px;min-width:0}' +
    '#mfc-title{font-family:"Playfair Display",Georgia,serif;font-size:1.15rem;font-weight:700;margin:0 0 8px}' +
    '#mfc-text p{margin:0 0 6px;font-size:.92rem;line-height:1.55;color:#333}' +
    '#mfc-text a{color:#1a3555;font-weight:600;text-decoration:underline;cursor:pointer}' +
    '#mfc-status{font-size:.8rem!important;color:#6b7d95!important}' +
    '#mfc-actions{display:flex;gap:12px;flex:0 0 auto;flex-wrap:wrap}' +
    /* Beide Buttons: identisches Aussehen */
    '.mfc-btn{font-family:inherit;font-size:.95rem;font-weight:700;line-height:1;min-width:140px;padding:13px 24px;border-radius:8px;border:2px solid #1a3555;background:#1a3555;color:#fff;cursor:pointer;transition:background .15s}' +
    '.mfc-btn:hover{background:#2a4a70;border-color:#2a4a70}' +
    '.mfc-btn:focus-visible,#mfc-text a:focus-visible{outline:3px solid #D4AF37;outline-offset:2px}' +
    '#mfc-fab{position:fixed;left:12px;bottom:12px;z-index:99990;font-family:"Outfit",system-ui,sans-serif;font-size:.78rem;font-weight:600;color:#1a3555;background:#fff;border:1px solid rgba(26,53,85,.3);border-radius:20px;padding:7px 14px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.18)}' +
    '#mfc-fab:hover{background:#f0ede8}' +
    '#mfc-fab:focus-visible{outline:3px solid #D4AF37;outline-offset:2px}' +
    '@media(max-width:640px){#mfc-box{padding:18px}#mfc-actions{width:100%}.mfc-btn{flex:1 1 0;min-width:0}}';

  function ensureStyle() {
    if (document.getElementById('mfc-style')) return;
    var st = document.createElement('style');
    st.id = 'mfc-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* Auffangnetz: Hat eine Seite keinen Footer-Link zum Widerruf, wird ein kleiner Button eingeblendet. */
  function ensureSettingsLink() {
    if (document.querySelector('[data-mf-cookie-settings]')) return;
    ensureStyle();
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'mfc-fab';
    b.setAttribute('data-mf-cookie-settings', '');
    b.textContent = 'Cookie-Einstellungen';
    document.body.appendChild(b);
  }

  function buildBanner() {
    if (document.getElementById('mfc-banner')) return;
    ensureStyle();

    var wrap = document.createElement('div');
    wrap.id = 'mfc-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'false');
    wrap.setAttribute('aria-labelledby', 'mfc-title');
    wrap.innerHTML =
      '<div id="mfc-box">' +
        '<div id="mfc-text">' +
          '<h2 id="mfc-title">Cookies &amp; Statistik</h2>' +
          '<p>Mit deiner Einwilligung nutze ich Google Analytics&nbsp;4, um zu verstehen, wie diese Website genutzt wird. ' +
          'Dabei werden Cookies gesetzt und Nutzungsdaten an Google übermittelt, auch in die USA. ' +
          'Die Analytics-Daten werden 2&nbsp;Monate gespeichert, Google-Signale und personalisierte Werbung sind deaktiviert. ' +
          'Ohne Zustimmung wird Google Analytics nicht geladen.</p>' +
          '<p>Unabhängig davon verarbeiten das Hosting (GitHub) und, wenn du ein Formular absendest, Formspree technisch notwendige Daten ' +
          '(Details in der <a href="' + PRIVACY_URL + '" data-mf-privacy>Datenschutzerklärung</a>). ' +
          'Du kannst deine Entscheidung jederzeit im Footer unter „Cookie-Einstellungen ändern“ widerrufen.</p>' +
          '<p id="mfc-status" aria-live="polite"></p>' +
        '</div>' +
        '<div id="mfc-actions">' +
          '<button type="button" class="mfc-btn" id="mfc-accept">Akzeptieren</button>' +
          '<button type="button" class="mfc-btn" id="mfc-reject">Ablehnen</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('mfc-accept').addEventListener('click', function () { decide(true); });
    document.getElementById('mfc-reject').addEventListener('click', function () { decide(false); });
  }

  function statusText() {
    var c = readChoice();
    if (!c) return 'Aktuell: noch keine Entscheidung – es wird nichts geladen.';
    return c.analytics ? 'Aktuell: Statistik (Google Analytics) erlaubt.' : 'Aktuell: Statistik abgelehnt.';
  }

  function openBanner() {
    buildBanner();
    var s = document.getElementById('mfc-status');
    if (s) s.textContent = statusText();
    document.getElementById('mfc-banner').className = 'mfc-open';
    var first = document.getElementById('mfc-accept');
    if (first && first.focus) first.focus();
  }

  function closeBanner() {
    var b = document.getElementById('mfc-banner');
    if (b) b.className = '';
  }

  function decide(analytics) {
    var c = writeChoice(analytics);
    applyChoice(c);
    closeBanner();
  }

  /* ───────────── Klicks (Footer-Link, Datenschutz-Link) ───────────── */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest
      ? e.target.closest('[data-mf-cookie-settings],a[href$="#cookie-einstellungen"]')
      : null;
    if (!t) return;
    e.preventDefault();
    openBanner();
  });

  /* Auch Aufrufe über die Adresse mit Anker (z. B. datenschutz.html#cookie-einstellungen) öffnen die Einstellungen. */
  function openFromHash() {
    if (window.location.hash !== '#cookie-einstellungen') return;
    openBanner();
    try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* ignorieren */ }
  }
  window.addEventListener('hashchange', openFromHash);

  /* Entscheidung in einem anderen Tab geändert -> hier nachziehen */
  window.addEventListener('storage', function (e) {
    if (e.key !== STORAGE_KEY) return;
    var c = readChoice();
    applyChoice(c);
    if (c) closeBanner();
  });

  /* ───────────── Start ───────────── */
  function init() {
    removeLegacy();
    ensureSettingsLink();
    var c = readChoice();
    if (c) {
      applyChoice(c);        // nur bei analytics=true wird GA geladen
    } else {
      openBanner();          // keine gültige Entscheidung -> fragen, nichts laden
    }
    openFromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Ereignis an GA4 senden – nur bei gültiger Statistik-Einwilligung und geladenem GA.
     Ohne Einwilligung (oder nach Widerruf) wird nichts gesendet und nichts zwischengespeichert. */
  function track(name, params) {
    try {
      var c = readChoice();
      if (!c || c.analytics !== true) return false;
      if (!gaLoaded || window['ga-disable-' + GA_ID] === true || typeof window.gtag !== 'function') return false;
      window.gtag('event', name, params || {});
      return true;
    } catch (e) { return false; }
  }

  /* Kleine, bewusst öffentliche Schnittstelle (z. B. für Tests in der Konsole und Ereignismessung) */
  window.mfConsent = { open: openBanner, get: readChoice, version: CONSENT_VERSION, track: track };
})();
