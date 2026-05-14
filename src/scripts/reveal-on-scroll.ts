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
 *   3. Each element is observed exactly once (`unobserve` after intersect),
 *      so animations never re-trigger on hydration or React re-render.
 *   4. If IntersectionObserver is missing, falls back to immediate reveal.
 *
 * Without this script, animations don't run — but values still render correctly
 * at their final state, so degradation is graceful.
 */
export const revealOnScrollScript = `(function(){
  // Inject hide-rule synchronously in <head> so body paints with bars already
  // at scaleX(0) — prevents first-frame flash of the final-width inline style.
  var s = document.createElement('style');
  s.textContent = '.cf-bar-reveal-x:not([data-cf-reveal="visible"]){transform:scaleX(0);transform-origin:left center}.cf-bar-reveal-y:not([data-cf-reveal="visible"]){transform:scaleY(0);transform-origin:bottom center}.cf-donut-reveal:not([data-cf-reveal="visible"]){--cf-reveal-angle:0deg}.cf-stagger-fade-in:not([data-cf-reveal="visible"]){opacity:0}';
  (document.head || document.documentElement).appendChild(s);
  document.documentElement.classList.add('cf-reveals-ready');
  var SEL = '.cf-bar-reveal-x,.cf-bar-reveal-y,.cf-donut-reveal,.cf-stagger-fade-in';
  function reveal(el){ el.setAttribute('data-cf-reveal','visible'); }
  function setup(){
    var els = document.querySelectorAll(SEL);
    if (!('IntersectionObserver' in window)) { els.forEach(reveal); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el){ io.observe(el); });
    // Watch for dynamically inserted analytics nodes (client-rendered dashboards)
    if ('MutationObserver' in window) {
      new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(n){
            if (n.nodeType !== 1) return;
            if (n.matches && n.matches(SEL)) io.observe(n);
            if (n.querySelectorAll) n.querySelectorAll(SEL).forEach(function(c){ io.observe(c); });
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();`;
