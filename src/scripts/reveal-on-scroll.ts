/**
 * Bootstrap script for analytics reveal-on-scroll animations.
 *
 * Usage (Next.js app layout, or any SSR framework):
 * ```tsx
 * import { revealOnScrollScript } from "@cofoundy/ui/scripts/reveal-on-scroll";
 * // In <head>:
 * <script dangerouslySetInnerHTML={{ __html: revealOnScrollScript }} />
 * ```
 *
 * The script:
 *   1. Synchronously adds `.cf-reveals-ready` to <html> before first paint,
 *      so the reveal CSS hides bars/donut at scaleX(0) / angle=0 without flash.
 *   2. On DOMContentLoaded, sets up an IntersectionObserver that flips
 *      `data-cf-reveal="visible"` on each `.cf-bar-reveal-*` / `.cf-donut-reveal`
 *      / `.cf-stagger-fade-in` element when it enters the viewport.
 *   3. Each element is revealed once; the reveal is then made STICKY:
 *      - a MutationObserver re-asserts `data-cf-reveal="visible"` if a React
 *        re-render / hydration strips it (otherwise a masked donut or scaled-0
 *        bar would fall back to its hidden resting state and never recover —
 *        the reveal is "fail-hidden" by construction), and
 *      - a safety-net timer reveals anything still hidden a short while after
 *        load, so content is NEVER left permanently invisible when the
 *        IntersectionObserver doesn't fire (SPA nav, off-screen-forever, etc).
 *   4. If IntersectionObserver is missing, falls back to immediate reveal.
 *
 * Design rule: the reveal is a progressive ENHANCEMENT. Its terminal state is
 * always "shown" — no failure mode (observer never firing, attribute wiped by a
 * re-render) may leave an element stuck in its hidden pre-reveal state.
 *
 * Without this script, animations don't run — but values still render correctly
 * at their final state, so degradation is graceful.
 */
export const revealOnScrollScript = `(function(){
  // Idempotency guard — Next.js App Router emits inline <script> twice
  // (raw HTML stream + RSC payload that React processes on hydration), so
  // without this check the bootstrap runs twice → animations fire twice.
  if (window.__cfRevealBoot) return; window.__cfRevealBoot = 1;
  // Inject hide-rule synchronously in <head> so body paints with bars already
  // at scaleX(0) — prevents first-frame flash of the final-width inline style.
  var s = document.createElement('style');
  s.textContent = '.cf-bar-reveal-x:not([data-cf-reveal="visible"]){transform:scaleX(0);transform-origin:left center}.cf-bar-reveal-y:not([data-cf-reveal="visible"]){transform:scaleY(0);transform-origin:bottom center}.cf-donut-reveal:not([data-cf-reveal="visible"]){--cf-reveal-angle:0deg}.cf-stagger-fade-in:not([data-cf-reveal="visible"]){opacity:0}';
  (document.head || document.documentElement).appendChild(s);
  document.documentElement.classList.add('cf-reveals-ready');
  var SEL = '.cf-bar-reveal-x,.cf-bar-reveal-y,.cf-donut-reveal,.cf-stagger-fade-in';
  // Elements we have already decided must be shown. Once here, the reveal is
  // sticky: if a re-render strips the attribute we put it back, so the element
  // can never revert to its hidden pre-reveal state.
  var shown = (typeof WeakSet === 'function') ? new WeakSet() : null;
  function reveal(el){
    if (shown) shown.add(el);
    if (el.getAttribute('data-cf-reveal') === 'visible') return;
    el.setAttribute('data-cf-reveal','visible');
  }
  function setup(){
    var els = document.querySelectorAll(SEL);
    if (!('IntersectionObserver' in window)) { els.forEach(reveal); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el){ io.observe(el); });
    // Watch for (a) dynamically inserted analytics nodes (client-rendered
    // dashboards / SPA navigation) and (b) a re-render stripping the reveal
    // attribute off an element we already revealed — re-assert it so the
    // donut/bars can't fall back to their invisible hidden state.
    if ('MutationObserver' in window) {
      new MutationObserver(function(muts){
        muts.forEach(function(m){
          if (m.type === 'attributes') {
            var t = m.target;
            if (shown && shown.has(t) && t.getAttribute('data-cf-reveal') !== 'visible') {
              t.setAttribute('data-cf-reveal','visible');
            }
            return;
          }
          m.addedNodes.forEach(function(n){
            if (n.nodeType !== 1) return;
            if (n.matches && n.matches(SEL)) io.observe(n);
            if (n.querySelectorAll) n.querySelectorAll(SEL).forEach(function(c){ io.observe(c); });
          });
        });
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-cf-reveal'] });
    }
    // Safety net: whatever the IntersectionObserver has not revealed a short
    // while after load gets revealed unconditionally. Guarantees no element is
    // ever left permanently hidden (fail-visible), at the cost of skipping the
    // scroll-in animation for still-offscreen elements.
    setTimeout(function(){
      document.querySelectorAll(SEL).forEach(function(el){
        if (el.getAttribute('data-cf-reveal') !== 'visible') reveal(el);
      });
    }, 1600);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();`;
