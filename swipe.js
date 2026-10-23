/* Phones: swipe left = Next, swipe right = Back on the purchase-print pages (same as tapping the links). */
(function () {
  var next = document.querySelector('.print .back a.next'), prev = document.querySelector('.print .back a.prev');
  if (!next && !prev) return;
  var x0 = 0, y0 = 0, t0 = 0;
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Date.now() - t0 > 700 || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    var a = dx < 0 ? next : prev;
    if (a && a.href) window.location.href = a.href;
  }, { passive: true });
})();
