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
    function next() { if (s < S - 1) { s++; render(); if (root._rz) root._rz(); } }
    function prev() { if (s > min) { s--; render(); if (root._rz) root._rz(); } }

    [prevBtn, nextBtn].forEach(function (b) {
      if (b) b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    });
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    book.addEventListener('click', function (e) {
      if (Date.now() - (root._lt ? root._lt() : 0) < 700) return; // touch taps are handled by the touch code
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

    /* ---- touch: swipe to turn, pinch / double-tap to zoom (zooming never turns a page) ---- */
    var stage = root.querySelector('.stage');
    var z = 1, tx = 0, ty = 0, lastTouch = 0, lastTap = null, tapTimer = null;
    function rotated() { return document.body.classList.contains('book-page') && window.matchMedia('(max-width: 44rem)').matches; }
    function toLocal(cx, cy) {            // screen point -> point inside the (possibly rotated) viewer
      if (rotated()) return { x: cy, y: document.documentElement.clientWidth - cx };
      var r = root.getBoundingClientRect(); return { x: cx - r.left, y: cy - r.top };
    }
    function geom() {
      var vw = root.offsetWidth, vh = root.offsetHeight;
      return { vw: vw, vh: vh, cx: vw / 2, cy: vh / 2, sL: stage.offsetLeft, sT: stage.offsetTop, sw: stage.offsetWidth, sh: stage.offsetHeight };
    }
    function clampAxis(t, v, c, sL, sw) {
      var lo = v - c - z * (sL - c) - z * sw, hi = -c - z * (sL - c);
      return lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, t));
    }
    function applyZoom(animate) {
      var g = geom();
      if (z <= 1.001) { z = 1; tx = 0; ty = 0; }
      else { tx = clampAxis(tx, g.vw, g.cx, g.sL, g.sw); ty = clampAxis(ty, g.vh, g.cy, g.sT, g.sh); }
      stage.style.transformOrigin = (g.cx - g.sL) + 'px ' + (g.cy - g.sT) + 'px';
      stage.style.transition = animate ? 'transform 0.25s ease-out' : 'none';
      stage.style.transform = z === 1 && !tx && !ty ? '' : 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')';
      root.classList.toggle('zoomed', z > 1);
    }
    function resetZoom() { z = 1; tx = 0; ty = 0; applyZoom(true); }
    function zoomAt(p, nz, animate) {      // keep the content under local point p fixed while changing the zoom
      var g = geom(), qx = g.cx + (p.x - g.cx - tx) / z, qy = g.cy + (p.y - g.cy - ty) / z;
      z = Math.max(1, Math.min(5, nz));
      tx = p.x - g.cx - z * (qx - g.cx); ty = p.y - g.cy - z * (qy - g.cy);
      applyZoom(animate);
    }
    function tapFlip(cx, cy) {             // same as a mouse click on the book
      var bl = book.getBoundingClientRect(), right;
      if (rotated()) right = toLocal(cx, cy).x > toLocal(bl.left, bl.top + bl.height / 2).x;
      else right = cx > bl.left + bl.width / 2;
      if (s === 0 && !spreadStart) next();
      else if (S > 1 && s === S - 1 && n % 2 === 0) prev();
      else if (right) next(); else prev();
    }
    var g1 = null, pinch = null, blocked = false;
    function skip(e) { return e.target.closest && e.target.closest('button, a'); }
    root.addEventListener('touchstart', function (e) {
      if (skip(e)) { blocked = true; return; }
      lastTouch = Date.now();
      if (e.touches.length === 1) {
        blocked = false; pinch = null;
        var t = e.touches[0];
        g1 = { x: t.clientX, y: t.clientY, t: Date.now(), tx: tx, ty: ty, moved: false };
      } else if (e.touches.length === 2) {
        g1 = null; blocked = true; clearTimeout(tapTimer); lastTap = null;
        var a = e.touches[0], b = e.touches[1];
        var mid = toLocal((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: z, mid: mid };
        var g = geom(); pinch.qx = g.cx + (mid.x - g.cx - tx) / z; pinch.qy = g.cy + (mid.y - g.cy - ty) / z;
      }
    }, { passive: true });
    root.addEventListener('touchmove', function (e) {
      lastTouch = Date.now();
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        var a = e.touches[0], b = e.touches[1], g = geom();
        var mid = toLocal((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        z = Math.max(1, Math.min(5, pinch.z * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d));
        tx = mid.x - g.cx - z * (pinch.qx - g.cx); ty = mid.y - g.cy - z * (pinch.qy - g.cy);
        applyZoom(false);
      } else if (g1 && e.touches.length === 1) {
        var t = e.touches[0];
        if (Math.abs(t.clientX - g1.x) + Math.abs(t.clientY - g1.y) > 10) g1.moved = true;
        if (z > 1) {                       // zoomed in: one finger pans
          e.preventDefault();
          var p0 = toLocal(g1.x, g1.y), p1 = toLocal(t.clientX, t.clientY);
          tx = g1.tx + (p1.x - p0.x); ty = g1.ty + (p1.y - p0.y); applyZoom(false);
        } else if (g1.moved) e.preventDefault();
      }
    }, { passive: false });
    root.addEventListener('touchend', function (e) {
      lastTouch = Date.now();
      if (pinch) { if (e.touches.length === 0) { pinch = null; if (z < 1.05) resetZoom(); } return; }
      if (blocked) { if (e.touches.length === 0) blocked = false; return; }
      if (!g1 || !e.changedTouches.length) return;
      var t = e.changedTouches[0], gg = g1; g1 = null;
      var p0 = toLocal(gg.x, gg.y), p1 = toLocal(t.clientX, t.clientY);
      var dx = p1.x - p0.x, dy = p1.y - p0.y, dt = Date.now() - gg.t;
      if (gg.moved) {
        if (z === 1 && dt < 900) {         // swipe along the book (or across it when the page is turned to landscape)
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { if (dx < 0) next(); else prev(); }
          else if (rotated() && Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.2) { if (dy > 0) next(); else prev(); }
        }
        return;
      }
      // a tap: two quick taps zoom in / out, a single tap (when not zoomed) turns the page
      var now = Date.now();
      if (lastTap && now - lastTap.t < 320 && Math.abs(t.clientX - lastTap.x) + Math.abs(t.clientY - lastTap.y) < 40) {
        clearTimeout(tapTimer); lastTap = null;
        if (z > 1) resetZoom(); else zoomAt(p1, 2.6, true);
        return;
      }
      lastTap = { t: now, x: t.clientX, y: t.clientY };
      if (z === 1) { var cx = t.clientX, cy = t.clientY; tapTimer = setTimeout(function () { lastTap = null; tapFlip(cx, cy); }, 330); }
    }, { passive: true });
    root.addEventListener('touchcancel', function () { g1 = null; pinch = null; blocked = false; }, { passive: true });
    window.addEventListener('resize', function () { if (z > 1) applyZoom(false); });

    leaves.forEach(function (leaf, i) { if (i < s) { leaf.classList.add('flipped'); leaf.style.zIndex = i + 1; } }); // already-turned leaves start turned, no animation
    root._rz = resetZoom; root._lt = function () { return lastTouch; };
    root.classList.add('ready');
    render();
  }

  var roots = document.querySelectorAll('.viewer');
  for (var k = 0; k < roots.length; k++) init(roots[k]);
})();
