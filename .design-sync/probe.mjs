import { chromium } from '/Users/melissaimannoriega/cofoundy/packages/ui/.ds-sync/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file:///Users/melissaimannoriega/cofoundy/packages/ui/ds-bundle/components/ui/Separator/Separator.html', {waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const res = [];
  for (const el of document.querySelectorAll('h4,p,div')) {
    const t = (el.textContent||'').trim();
    if (['Radix Primitives','Option 1','Dashboard'].includes(t)) {
      const cs = getComputedStyle(el);
      let bg='', n=el;
      while (n && bg==='') { const c=getComputedStyle(n).backgroundColor; if(c && c!=='rgba(0, 0, 0, 0)') bg=c; n=n.parentElement; }
      res.push({text:t, color:cs.color, cls:String(el.className||'(none)'), bg});
    }
  }
  const body = getComputedStyle(document.body);
  return {items:res, bodyColor:body.color, rootFg:getComputedStyle(document.documentElement).getPropertyValue('--foreground'), rootColorFg:getComputedStyle(document.documentElement).getPropertyValue('--color-foreground')};
});
console.log(JSON.stringify(out,null,1));
await b.close();
