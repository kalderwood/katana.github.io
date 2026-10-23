/* Page-turning book viewer (Architecture project pages).
   Turn pages: click the arrows, click a page, or hover over the book and press Space or Return
   (Shift+Space / Shift+Return goes back; the left/right arrow keys also work).
   Each page is cut into thin strips that bend slightly while turning, so the page curls like paper. */
(function () {
  'use strict';
  var K = 10; // strips per page
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function init(root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll('.book-pages img'));
    var srcs = imgs.map(function (im) { return im.getAttribute('src'); });
    // data-spread-start: the book opens on a full two-page spread (e.g. back + front cover) instead of a single closed cover
    var spreadStart = root.hasAttribute('data-spread-start');
    var off = spreadStart ? 1 : 0, min = off;
    if (spreadStart) srcs.unshift(null);
    var n = srcs.length;
    if (!imgs.length) return;
    var book = root.querySelector('.book');
    var prevBtn = root.querySelector('.nav.prev');
    var nextBtn = root.querySelector('.nav.next');
    var label = root.querySelector('.counter .pg');
    var L = Math.ceil(n / 2);          // physical leaves (sheets)
    var S = Math.floor(n / 2) + 1;     // spreads: cover, 2-3, 4-5, ...
    var s = min, leaves = [], timers = [];
    // data-start-page="45": open on the spread that shows that page image (used by CERESOMA to open at the Project Proposal)
    var sp = parseInt(root.getAttribute('data-start-page'), 10);
    if (sp) { s = Math.max(min, Math.min(Math.floor((sp + off) / 2), S - 1)); }

    function face(cls, src, idx, overlap, back) {
      var f = el('div', 'face ' + cls);
      if (src) {
        f.style.backgroundImage = 'url("' + src + '")';
        f.style.backgroundPosition = 'calc(var(--sw) * -' + idx + (back && overlap ? ' + 1px' : '') + ') 0';
      }
      return f;
    }
    function seg(k, frontSrc, backSrc) {
      var sg = el('div', 'seg' + (k === K - 1 ? ' last' : ''));
      sg.style.setProperty('--k', k);
      var ov = k < K - 1 ? 1 : 0;
      sg.appendChild(face('pg-front', frontSrc, k, ov, false));
      sg.appendChild(face('pg-back', backSrc, K - 1 - k, ov, true));
      if (k < K - 1) sg.appendChild(seg(k + 1, frontSrc, backSrc));
      return sg;
    }
    for (var i = 0; i < L; i++) {
      var leaf = el('div', 'leaf');
      var fs = srcs[2 * i] || null;
      var bs = srcs[2 * i + 1] || null;
      // flat, seamless pages shown at rest; the bending strips only show while a page is turning
      var flat = el('div', 'flat');
      flat.appendChild(face('pg-front', fs, 0, 0, false));
      flat.appendChild(face('pg-back', bs, 0, 0, true));
      leaf.appendChild(flat);
      leaf.appendChild(seg(0, fs, bs));
      leaf.style.zIndex = L - i;
      if (i < s) { leaf.classList.add('flipped'); leaf.style.zIndex = i + 1; } // opening spread: earlier sheets already turned
      book.appendChild(leaf);
      leaves.push(leaf);
    }

    function render() {
      leaves.forEach(function (leaf, i) {
        var flipped = i < s;
        if (flipped !== leaf.classList.contains('flipped')) {
          clearTimeout(timers[i]);
          leaf.style.zIndex = flipped ? 1000 + i : 2000 - i; // the page being turned always sits above the others, newest turn on top
          leaf.classList.remove('curl-fwd', 'curl-back');
          void leaf.offsetWidth; // restart the curl animation
          leaf.classList.add(flipped ? 'curl-fwd' : 'curl-back');
          leaf.classList.toggle('flipped', flipped);
          timers[i] = setTimeout(function () {
            leaf.classList.remove('curl-fwd', 'curl-back');
            leaf.style.zIndex = flipped ? i + 1 : L - i;
          }, 2000);
        }
      });
      book.classList.toggle('at-start', s === 0 && !spreadStart);
      book.classList.toggle('at-end', S > 1 && s === S - 1 && n % 2 === 0);
      var l = 2 * s - off, r = 2 * s + 1 - off, total = n - off;
      if (label) label.textContent = (s === 0 ? '1' : (r <= total ? l + '\u2013' + r : String(l))) + ' / ' + total;
      if (prevBtn) prevBtn.disabled = s === min;
      if (nextBtn) nextBtn.disabled = s === S - 1;
    }
    function next() { if (s < S - 1) { s++; render(); } }
    function prev() { if (s > min) { s--; render(); } }

    [prevBtn, nextBtn].forEach(function (b) {
      if (b) b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    });
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    book.addEventListener('click', function (e) {
      var rect = book.getBoundingClientRect();
      var right = e.clientX > rect.left + rect.width / 2;
      if (s === 0 && !spreadStart) next();
      else if (S > 1 && s === S - 1 && n % 2 === 0) prev();
      else if (right) next(); else prev();
    });

    // hovering either side of the book (or an arrow) arms Space / Return for that direction
    var side = null;
    function inside(r, x, y) { return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
    document.addEventListener('mousemove', function (e) {
      var x = e.clientX, y = e.clientY, r = book.getBoundingClientRect();
      side = null;
      if (prevBtn && inside(prevBtn.getBoundingClientRect(), x, y)) side = 'prev';
      else if (nextBtn && inside(nextBtn.getBoundingClientRect(), x, y)) side = 'next';
      else if (inside(r, x, y)) {
        if (s === 0 && !spreadStart) side = 'next';
        else if (S > 1 && s === S - 1 && n % 2 === 0) side = 'prev';
        else side = x > r.left + r.width / 2 ? 'next' : 'prev';
      }
    });
    document.addEventListener('keydown', function (e) {
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      var k = e.key;
      if (side && (k === ' ' || k === 'Spacebar' || k === 'Enter')) {
        e.preventDefault();
        var dir = side;
        if (e.shiftKey) dir = dir === 'next' ? 'prev' : 'next';
        if (dir === 'next') next(); else prev();
      } else if (t === 'BUTTON' || t === 'A') { return; }
      else if (k === 'ArrowRight') { next(); }
      else if (k === 'ArrowLeft') { prev(); }
    });

    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
    });

    leaves.forEach(function (leaf, i) { if (i < s) { leaf.classList.add('flipped'); leaf.style.zIndex = i + 1; } }); // already-turned leaves start turned, no animation
    root.classList.add('ready');
    render();
  }

  var roots = document.querySelectorAll('.viewer');
  for (var k = 0; k < roots.length; k++) init(roots[k]);
})();
