// Navbar bekommt beim Scrollen einen Hintergrund
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Sektionen beim Hereinscrollen einblenden
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { observer.observe(el); });
})();

// FAQ: immer nur ein Panel offen
(function () {
  var panels = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
  panels.forEach(function (panel) {
    panel.addEventListener('toggle', function () {
      if (!panel.open) return;
      panels.forEach(function (other) {
        if (other !== panel) other.open = false;
      });
    });
  });
})();

// Aktuelles Jahr im Footer
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
