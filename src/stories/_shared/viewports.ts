// Mobile-first contract — canonical viewport constants for Storybook stories.
//
// Source: docs-ai .cofoundy/specs/architecture-v1.md §8 +
// vault/team/docs-ai/mobile-first-contract-v1.mdx §7.
//
// Every interactive primitive MUST export a `MobileBaseline` story using
// VIEWPORT_MOBILE. See packages/ui/CLAUDE.md → "Mobile-state stories".
//
// The string values match `@storybook/addon-viewport` defaults so they work
// out-of-the-box with `addon-essentials` (which bundles the viewport addon).

export const VIEWPORT_MOBILE = { defaultViewport: 'mobile1' }            // 375 px (iPhone SE)
export const VIEWPORT_MOBILE_LANDSCAPE = { defaultViewport: 'mobile2' }  // 414 px (iPhone 13 Pro Max)
export const VIEWPORT_TABLET = { defaultViewport: 'tablet' }             // 768 px (iPad)
export const VIEWPORT_DESKTOP = { defaultViewport: 'responsive' }        // full width
