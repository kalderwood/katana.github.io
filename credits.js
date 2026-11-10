/* Closes the Credits pop-up when you click anywhere outside it (or press Escape). */
(function () {
  function openOnes() { return document.querySelectorAll('details.credits[open]'); }
  document.addEventListener('click', function (e) {
    openOnes().forEach(function (d) {
      var box = d.querySelector('.credits-box');
      var sum = d.querySelector('summary');
      if ((box && box.contains(e.target)) || (sum && sum.contains(e.target))) return;
      d.removeAttribute('open');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') openOnes().forEach(function (d) { d.removeAttribute('open'); });
  });
})();
