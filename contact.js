/* Contact form: the message box can be pulled down (never smaller than its starting size),
   and it stops when Send is just above the bottom of the page.
   It also grows line by line when the typed text no longer fits. */
(function () {
  var ta = document.querySelector('.contact-form textarea');
  var btn = document.querySelector('.contact-form button');
  if (!ta || !btn) return;
  function setup() {
    ta.style.height = ''; ta.style.minHeight = ''; ta.style.maxHeight = '';
    if (window.matchMedia('(max-width: 44rem)').matches) return;
    var r = ta.getBoundingClientRect();
    var h0 = r.height;
    var tail = btn.getBoundingClientRect().bottom - r.bottom;      // space taken by Send under the box
    var foot = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2; // copyright strip
    var cap = window.innerHeight - foot - 10 - tail - (r.top + window.pageYOffset);
    ta.style.minHeight = h0 + 'px';
    ta.style.maxHeight = Math.max(h0, cap) + 'px';
  }
  // Grows line by line only when the typed text no longer fits; otherwise nothing changes.
  function grow() {
    if (window.matchMedia('(max-width: 44rem)').matches) return;
    if (ta.scrollHeight > ta.clientHeight) { ta.style.height = ta.scrollHeight + 'px'; }
  }
  ta.addEventListener('input', grow);
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(setup, 150); });
  window.addEventListener('load', setup);
  setup();
})();

/* Contact boxes are exactly as wide as the "Want to collaborate?" title. */
(function () {
  var t = document.querySelector('.contact-title'), f = document.querySelector('.contact-form');
  if (!t || !f) return;
  function fit() {
    var r = document.createRange(); r.selectNodeContents(t);
    var w = r.getBoundingClientRect().width;
    var ls = parseFloat(getComputedStyle(t).letterSpacing) || 0;   // drop the spacing after the last letter
    if (w > 0) f.style.setProperty('--tw', (w - ls) + 'px');
  }
  fit();
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
