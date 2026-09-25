import * as React from "react"

/**
 * Two-edge indicator on transforms only (compositor). The frame clips; three layers:
 *  L  translateX(--cf-edge-l)      box starts at the LEFT edge; overflow hidden + left radius
 *  C  translateX(-(--cf-edge-l))   same spring as L → cancels L exactly, back to frame coords
 *  R  translateX(--cf-edge-r)      box whose RIGHT edge is the right edge; paint + right radius
 * Visible = L ∩ R = [left, right]. Each edge rides its own spring; nothing animates a length.
 * Shared by Switch (knob) and TabsList (pill). CSS: `.cf-edge-*` in styles/index.css.
 */
export function EdgeLayers() {
  return (
    <span className="cf-edge-l" aria-hidden>
      <span className="cf-edge-c">
        <span className="cf-edge-r" />
      </span>
    </span>
  )
}
