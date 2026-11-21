/* Music: pressing a SoundCloud CD plays it right here in a small player (no login needed).
   A "Open on SoundCloud" link stays under the player. Ctrl/Cmd/middle click still opens SoundCloud normally. */
(function () {
  var links = document.querySelectorAll('a.cd-link[href*="soundcloud.com"]');
  if (!links.length) return;
  var box = null, frame = null, out = null, last = null;
  function build() {
    box = document.createElement('div');
    box.className = 'sc-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'SoundCloud player');
    box.hidden = true;
    box.innerHTML = '<div class="sc-card"><button type="button" class="sc-close" aria-label="Close player">&times;</button>' +
      '<iframe class="sc-frame" title="SoundCloud player" allow="autoplay" scrolling="no" frameborder="0"></iframe>' +
      '<a class="sc-out" target="_blank" rel="noopener">Open on SoundCloud</a></div>';
    document.body.appendChild(box);
    frame = box.querySelector('.sc-frame');
    out = box.querySelector('.sc-out');
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.querySelector('.sc-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  }
  function open(a) {
    if (!box) build();
    last = a;
    var url = a.getAttribute('href');
    frame.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) +
      '&color=%23888888&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false';
    out.href = url;
    box.hidden = false;
    document.documentElement.classList.add('sc-open');
    box.querySelector('.sc-close').focus();
  }
  function close() {
    box.hidden = true;
    frame.src = 'about:blank';
    document.documentElement.classList.remove('sc-open');
    if (last) last.focus();
  }
  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      open(a);
    });
  });
})();
