/* Accumulating speaker notes per fragment.
 *
 * A slide's <aside class="notes"> may hold bullets tagged data-fragment="N".
 * After every navigation event this hides the bullets whose N is beyond the
 * furthest visible fragment on the current slide, so the speaker view shows
 * the notes accumulated so far. Reveal's notes plugin sends the aside's
 * innerHTML on the same events (slidechanged, fragmentshown, fragmenthidden);
 * it registers those listeners only when the speaker window connects, so the
 * listeners installed here always run first.
 *
 * A slide reached by going back shows all of its fragments, so all of its
 * bullets. A slide reached by going forward starts with the untagged bullets.
 *
 * Usage: load after reveal.js, then after Reveal.initialize() call
 *   FragmentNotes.install(Reveal);
 */
window.FragmentNotes = (function () {
  function furthestVisible(slide) {
    var max = -1;
    slide.querySelectorAll('.fragment.visible').forEach(function (el) {
      var i = parseInt(el.getAttribute('data-fragment-index'), 10);
      if (!isNaN(i) && i > max) max = i;
    });
    return max;
  }

  function update(deck) {
    var slide = deck.getCurrentSlide();
    if (!slide) return;
    var max = furthestVisible(slide);
    slide.querySelectorAll('aside.notes [data-fragment]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-fragment'), 10);
      el.hidden = isNaN(n) ? false : n > max;
    });
  }

  function install(deck) {
    ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden'].forEach(function (name) {
      deck.on(name, function () { update(deck); });
    });
    if (deck.isReady && deck.isReady()) update(deck);
  }

  return { install: install, update: update };
})();
