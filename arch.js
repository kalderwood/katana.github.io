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
