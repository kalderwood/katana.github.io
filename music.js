/* Music: press a picture to play it, press again to pause. Only one tune plays at a time.
   - Most pictures play a file from the audio folder (data-audio="audio/xxx.mp3").
   - The Sunyata Cycles plays from SoundCloud (data-sc). If SoundCloud will not start, it opens in a new tab instead. */
(function () {
  var picks = Array.prototype.slice.call(document.querySelectorAll('.pick.playable'));
  var current = null;
  function setState(p, on) {
    p.setAttribute('aria-pressed', on ? 'true' : 'false');
    p.classList.toggle('on', on);
  }
  function stopAll(except) {
    picks.forEach(function (p) {
      if (p === except) return;
      if (p._audio) p._audio.pause();
      if (p._sc) p._sc.pause();
      setState(p, false);
    });
  }
  picks.forEach(function (p) {
    var src = p.getAttribute('data-audio');
    var scUrl = p.getAttribute('data-sc');
    var widget = null, ready = false, wantPlay = false;
    if (src) {
      var a = new Audio(); a.preload = 'none'; a.src = src; a.loop = (src.indexOf('solo') > -1);
      p._audio = a;
      a.addEventListener('ended', function () { setState(p, false); });
      a.addEventListener('error', function () { setState(p, false); });
    }
    if (scUrl && window.SC && document.getElementById('sc-player')) {
      widget = SC.Widget(document.getElementById('sc-player'));
      p._sc = widget;
      widget.bind(SC.Widget.Events.READY, function () { ready = true; });
      widget.bind(SC.Widget.Events.PLAY, function () { setState(p, true); });
      widget.bind(SC.Widget.Events.PAUSE, function () { setState(p, false); });
      widget.bind(SC.Widget.Events.FINISH, function () { setState(p, false); });
    }
    function toggle() {
      if (p.classList.contains('on')) {
        if (p._audio) p._audio.pause();
        if (widget) widget.pause();
        setState(p, false);
        return;
      }
      stopAll(p);
      if (p._audio) {
        var pr = p._audio.play();
        setState(p, true);
        if (pr && pr.catch) pr.catch(function () { setState(p, false); });
      } else if (scUrl) {
        if (widget) {
          widget.play();
          setTimeout(function () { if (!p.classList.contains('on')) window.open(p.getAttribute('data-sc-fallback') || scUrl, '_blank', 'noopener'); }, 2500);
        } else {
          window.open(p.getAttribute('data-sc-fallback') || scUrl, '_blank', 'noopener');
        }
      }
    }
    p.addEventListener('click', toggle);
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
})();
