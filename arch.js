/* Architecture page: one cover is in colour at a time (the first on load, or whichever you hover / arrow to).
   Up / Down arrows move between projects; Enter or Space opens the one that is in colour. */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.projects .project'));
  if (!items.length) return;
  var cur = 0;
  function set(i, scroll) {
    if (i < 0 || i >= items.length) return;
    cur = i;
    items.forEach(function (p, k) { p.classList.toggle('active', k === i); });
    if (scroll) {
      var pg = items[i].closest('.apage');
      if (pg && pg.scrollIntoView) pg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  // after an arrow key, hovering only counts again once the mouse really moves (scrolling under a resting mouse is ignored)
  var moved = true, lx = -1, ly = -1;
  document.addEventListener('mousemove', function (e) {
    if (Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly) > 3) { if (lx >= 0) moved = true; lx = e.clientX; ly = e.clientY; }
  });
  items.forEach(function (p, i) { p.addEventListener('mouseenter', function () { if (moved) set(i, false); }); });
  document.addEventListener('keydown', function (e) {
    var t = e.target && e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') moved = false;
    if (k === 'ArrowDown') { e.preventDefault(); set(Math.min(cur + 1, items.length - 1), true); }
    else if (k === 'ArrowUp') { e.preventDefault(); set(Math.max(cur - 1, 0), true); }
    else if ((k === 'Enter' || k === ' ' || k === 'Spacebar') && t !== 'A' && t !== 'BUTTON' && t !== 'SUMMARY') {
      if (items[cur].classList.contains('texts')) return;
      var a = items[cur].querySelector('.about-image a');
      if (a) { e.preventDefault(); window.location.href = a.getAttribute('href'); }
    }
  });
  // credits pop-up: closes with Escape or a click anywhere else
  var crs = document.querySelectorAll('details.credits');
  if (crs.length) {
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') crs.forEach(function (c) { c.open = false; }); });
    document.addEventListener('click', function (e) { crs.forEach(function (c) { if (c.open && !c.contains(e.target)) c.open = false; }); });
  }
  set(0, false);
})();

/* Phone: shrink each project's picture just enough that the title, text, button, links and credits all fit on one page. */
(function () {
  var mq = window.matchMedia('(max-width: 44rem)');
  function fit() {
    var secs = document.querySelectorAll('.projects .about.project');
    Array.prototype.forEach.call(secs, function (s) {
      var img = s.querySelector('.about-image img, .cover-ph');
      if (!img) return;
      img.style.removeProperty('max-height'); s.style.removeProperty('gap');
      if (!mq.matches) return;
      for (var pass = 0; pass < 4; pass++) {
      var cs = getComputedStyle(s);
        var kids = Array.prototype.slice.call(s.querySelectorAll('h2, .about-image > a, .about-image > .cover-ph, p.desc, .book-btn, p.links, .links2')).filter(function (e) { return e.offsetParent; });
        var top = Infinity, bot = -Infinity;
        kids.forEach(function (k) { var r = k.getBoundingClientRect(), m = getComputedStyle(k); top = Math.min(top, r.top - parseFloat(m.marginTop)); bot = Math.max(bot, r.bottom + parseFloat(m.marginBottom)); });
        var over = (bot - top) - (s.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom));
        if (over > 1) img.style.setProperty('max-height', Math.max(0, Math.floor(img.getBoundingClientRect().height - over - 2)) + 'px', 'important');
        if (over <= 1) break;
        if (parseFloat(img.style.maxHeight) === 0 || img.getBoundingClientRect().height < 2) {
          // picture is already gone: close up the spacing a little instead
          var g = parseFloat(getComputedStyle(s).rowGap) || 0, n = Math.max(1, kids.length - 1);
          s.style.setProperty('gap', Math.max(6, g - Math.ceil(over / n) - 1) + 'px', 'important');
        }
      }
    });
  }
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();
})();
