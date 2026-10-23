/* Desktop | Mobile choice.
   PHONES: asks once per visit which version to show, and shows a small "Desktop | Mobile" switch under the copyright.
   COMPUTERS / TABLETS: the same switch; "Mobile" shows the phone version in a phone-sized window, "Desktop" brings the normal page back.
   Desktop view on a phone = the page is shown at full desktop width (the phone zooms out). */
(function () {
  var KEY = 'viewChoice';
  var doc = document.documentElement;

  /* the phone-sized window used by computers (mobile-view.html) */
  if (doc.hasAttribute('data-vc-wrapper')) {
    var fr = null;
    function load() {
      fr = document.getElementById('vc-frame');
      var p = new URLSearchParams(location.search).get('p') || 'index.html';
      if (!/^[A-Za-z0-9._-]+(#[A-Za-z0-9_-]+)?$/.test(p)) p = 'index.html';
      fr.src = p;
    }
    if (document.getElementById('vc-frame')) load(); else document.addEventListener('DOMContentLoaded', load);
    return;
  }

  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var phone = coarse && Math.min(screen.width, screen.height) <= 600;
  var inFrame = window.self !== window.top;
  var here = (location.pathname.split('/').pop() || 'index.html') + location.hash;
  var saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch (e) {}
  var meta = document.querySelector('meta[name="viewport"]');
  var isDesktop = phone ? saved === 'desktop' : !inFrame;
  if (phone && isDesktop) {
    if (meta) meta.setAttribute('content', 'width=1280');
    doc.classList.add('vc-desktop-view');
  }

  function setView(v) {
    if (phone) {
      try { sessionStorage.setItem(KEY, v); } catch (e) {}
      location.reload();
    } else if (inFrame) {
      if (v === 'desktop') { try { top.location.href = here; } catch (e) { window.open(here, '_top'); } }
    } else if (v === 'mobile') {
      location.href = 'mobile-view.html?p=' + encodeURIComponent(here).replace(/%23/g, '#');
    }
  }
  function addSwitch() {
    var f = document.querySelector('.site-footer');
    if (!f || f.querySelector('.vc-switch')) return;
    var p = document.createElement('p');
    p.className = 'vc-switch';
    p.innerHTML = '<a href="#" data-v="desktop"' + (isDesktop ? ' class="on"' : '') + '>Desktop</a> | <a href="#" data-v="mobile"' + (!isDesktop ? ' class="on"' : '') + '>Mobile</a>';
    p.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      e.preventDefault(); setView(a.getAttribute('data-v'));
    });
    f.insertBefore(p, f.firstChild);
  }
  function popup() {
    var d = document.createElement('div');
    d.id = 'view-choice'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Choose a version of the website');
    var brand = document.querySelector('.site-header .brand');
    d.innerHTML = '<header class="site-header vc-head"></header><div class="vc-card"><p class="vc-q">How would you like to view this website?</p>' +
      '<button type="button" class="vc-btn vc-desktop">Desktop version</button>' +
      '<button type="button" class="vc-btn vc-mobile">Mobile version</button></div>';
    if (brand) { var b = brand.cloneNode(true); b.removeAttribute('href'); d.querySelector('.vc-head').appendChild(b); }
    d.querySelector('.vc-desktop').addEventListener('click', function () { setView('desktop'); });
    d.querySelector('.vc-mobile').addEventListener('click', function () {
      try { sessionStorage.setItem(KEY, 'mobile'); } catch (e) {}
      d.remove(); doc.classList.remove('view-choice-open');
    });
    document.body.appendChild(d);
    doc.classList.add('view-choice-open');
  }
  function addExits() {
    var bs = document.querySelectorAll('.credits-box');
    for (var i = 0; i < bs.length; i++) {
      if (bs[i].querySelector('.credits-x')) continue;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'credits-x'; b.innerHTML = '&times;'; b.setAttribute('aria-label', 'Close credits');
      b.addEventListener('click', function (e) { var d = e.target.closest('details'); if (d) d.removeAttribute('open'); });
      bs[i].insertBefore(b, bs[i].firstChild);
    }
  }
  function ready() {
    addSwitch(); addExits();
    if (phone && window.matchMedia('(max-width: 44rem)').matches && !saved) popup();
  }
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready);
})();
