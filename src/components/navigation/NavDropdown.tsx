import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "../../utils/cn";

// ============================================
// Types
// ============================================

export type FeaturedEffect =
  | "shimmer"        // Gold shimmer sweep on card
  | "gradient-border"; // Brand color animated border

export interface NavDropdownItem {
  key: string;
  href: string;
  label: string;
  description?: string;
  isActive?: boolean;
  /** Badge text to display (e.g., "Nuevo", "🔥") */
  badge?: string;
  /** Featured effect for highlighting special items */
  featured?: FeaturedEffect;
}

export interface NavDropdownProps
  extends VariantProps<typeof navDropdownVariants> {
  label: string;
  items: NavDropdownItem[];
  onItemClick?: (key: string, href: string) => void;
  className?: string;
  menuClassName?: string;
  /** Render custom link component (e.g., Next.js Link) */
  renderLink?: (
    item: NavDropdownItem,
    children: React.ReactNode
  ) => React.ReactNode;
}

// ============================================
// Variants
// ============================================

const navDropdownVariants = cva("", {
  variants: {
    variant: {
      dark: "",
      light: "",
    },
  },
  defaultVariants: {
    variant: "dark",
  },
});

// ============================================
// CSS Variables for animation timing (matching design system)
// ============================================
const ANIMATION_DURATION = 250; // --cf-duration-normal
const CLOSE_DELAY = 150;
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)"; // Premium easing

// ============================================
// Featured Effect Styles
// ============================================
function getFeaturedStyles(
  effect: FeaturedEffect | undefined,
  isDark: boolean
): {
  base: string;
  style?: React.CSSProperties;
  overlay?: React.ReactNode;
} {
  if (!effect) return { base: "" };

  switch (effect) {
    // Gold shimmer sweep effect
    case "shimmer":
      return {
        base: "border border-[#fbbf24]/30",
        style: {
          background: isDark ? "rgba(251, 191, 36, 0.1)" : "rgba(251, 191, 36, 0.15)",
        },
        overlay: (
          <>
            <style>{`
              @keyframes nav-shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
            <div
              className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 w-full"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent)",
                  animation: "nav-shimmer 2s ease-in-out infinite",
                }}
              />
            </div>
          </>
        ),
      };

    // Brand color animated border using mask-composite technique
    case "gradient-border":
      return {
        base: "nav-gradient-border",
        style: {
          background: isDark ? "#020916" : "#ffffff",
        },
        overlay: (
          <style>{`
            @property --nav-angle {
              syntax: '<angle>';
              initial-value: 0deg;
              inherits: false;
            }
            .nav-gradient-border {
              --nav-angle: 0deg;
              position: relative;
              animation: nav-gradient-rotate 3s linear infinite;
            }
            .nav-gradient-border::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: inherit;
              padding: 2px;
              background: conic-gradient(from var(--nav-angle), #2984AD, #46a0d0, #0D3A59, #2984AD);
              -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
              mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              pointer-events: none;
            }
            @keyframes nav-gradient-rotate {
              to { --nav-angle: 360deg; }
            }
          `}</style>
        ),
      };

    default:
      return { base: "" };
  }
}

// ============================================
// Component
// ============================================

export function NavDropdown({
  label,
  items,
  variant = "dark",
  onItemClick,
  className,
  menuClassName,
  renderLink,
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Clear close timeout
  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Open menu
  const open = React.useCallback(() => {
    clearCloseTimeout();
    setIsOpen(true);
    setActiveIndex(-1);
  }, [clearCloseTimeout]);

  // Close menu with delay
  const close = React.useCallback(
    (immediate = false) => {
      clearCloseTimeout();
      if (immediate) {
        setIsOpen(false);
        setActiveIndex(-1);
      } else {
        closeTimeoutRef.current = setTimeout(() => {
          setIsOpen(false);
          setActiveIndex(-1);
        }, CLOSE_DELAY);
      }
    },
    [clearCloseTimeout]
  );

  // Handle mouse events (desktop)
  const handleMouseEnter = React.useCallback(() => {
    if (!isTouchDevice) {
      open();
    }
  }, [isTouchDevice, open]);

  const handleMouseLeave = React.useCallback(() => {
    if (!isTouchDevice) {
      close();
    }
  }, [isTouchDevice, close]);

  // Handle click events (mobile/touch + keyboard)
  const handleTriggerClick = React.useCallback(() => {
    if (isTouchDevice || !isOpen) {
      if (isOpen) {
        close(true);
      } else {
        open();
      }
    }
  }, [isTouchDevice, isOpen, open, close]);

  // Keyboard navigation
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (!isOpen) {
            open();
            setActiveIndex(0);
          } else if (activeIndex >= 0 && activeIndex < items.length) {
            const item = items[activeIndex];
            onItemClick?.(item.key, item.href);
            close(true);
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            open();
            setActiveIndex(0);
          } else {
            setActiveIndex((prev) =>
              prev < items.length - 1 ? prev + 1 : prev
            );
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          if (isOpen) {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;

        case "Escape":
          event.preventDefault();
          close(true);
          triggerRef.current?.focus();
          break;

        case "Tab":
          if (isOpen) {
            close(true);
          }
          break;

        case "Home":
          if (isOpen) {
            event.preventDefault();
            setActiveIndex(0);
          }
          break;

        case "End":
          if (isOpen) {
            event.preventDefault();
            setActiveIndex(items.length - 1);
          }
          break;
      }
    },
    [isOpen, activeIndex, items, open, close, onItemClick]
  );

  // Focus management for keyboard navigation
  React.useEffect(() => {
    if (isOpen && activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [isOpen, activeIndex]);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close(true);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, close]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => clearCloseTimeout();
  }, [clearCloseTimeout]);

  // Handle item click
  const handleItemClick = React.useCallback(
    (item: NavDropdownItem, event: React.MouseEvent) => {
      // Allow default navigation if no callback or renderLink
      if (onItemClick) {
        event.preventDefault();
        onItemClick(item.key, item.href);
      }
      close(true);
    },
    [onItemClick, close]
  );

  // Theme-specific styles
  const isDark = variant === "dark";

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="nav-dropdown-menu"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg",
          "transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isDark
            ? [
                "text-white/90 hover:text-white",
                "focus-visible:ring-[#46a0d0] focus-visible:ring-offset-[#020916]",
              ]
            : [
                "text-[#1e293b] hover:text-[#0f172a]",
                "focus-visible:ring-[#46a0d0] focus-visible:ring-offset-white",
              ]
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            isOpen && "rotate-180"
          )}
          style={{
            transitionDuration: `${ANIMATION_DURATION}ms`,
            transitionTimingFunction: EASING,
          }}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      <div
        ref={menuRef}
        id="nav-dropdown-menu"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="nav-dropdown-trigger"
        className={cn(
          "absolute left-0 top-full z-[100] mt-2 min-w-[320px] origin-top-left",
          // Glassmorphism
          "rounded-xl border backdrop-blur-xl",
          // Shadow
          "shadow-xl shadow-black/20",
          // Animation
          "transition-all",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
          // Theme - solid backgrounds for better visibility
          isDark
            ? [
                "bg-[#020916]",
                "border-white/15",
              ]
            : [
                "bg-white",
                "border-[#e2e8f0]",
              ],
          menuClassName
        )}
        style={{
          transitionDuration: `${ANIMATION_DURATION}ms`,
          transitionTimingFunction: EASING,
        }}
      >
        {/* Inset highlight for glass effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl pointer-events-none",
            isDark
              ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              : "shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
          )}
        />

        {/* Menu Items */}
        <div className="relative p-2">
          {items.map((item, index) => {
            const isItemActive = item.isActive;
            const isKeyboardActive = activeIndex === index;
            const isFeatured = !!item.featured;

            // Featured effect styles
            const featuredStyles = getFeaturedStyles(item.featured, isDark);

            const itemContent = (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium whitespace-nowrap",
                      isFeatured && "font-semibold",
                      isDark
                        ? isItemActive
                          ? "text-[#46a0d0]"
                          : isFeatured
                            ? "text-[#fbbf24]" // Gold for featured
                            : "text-white"
                        : isItemActive
                          ? "text-[#2984AD]"
                          : isFeatured
                            ? "text-[#b45309]" // Amber for featured light
                            : "text-[#0f172a]"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.description && (
                    <span
                      className={cn(
                        "block text-xs mt-0.5 whitespace-nowrap",
                        isDark
                          ? isFeatured
                            ? "text-[#fcd34d]/80"
                            : "text-white/60"
                          : isFeatured
                            ? "text-[#92400e]/80"
                            : "text-[#64748b]"
                      )}
                    >
                      {item.description}
                    </span>
                  )}
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0",
                      isDark
                        ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                        : "bg-[#fbbf24]/20 text-[#b45309]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );

            const itemClasses = cn(
              // Base styles
              "block w-full text-left px-4 py-3 rounded-lg",
              "transition-all duration-300",
              "outline-none relative overflow-hidden",
              // Min touch target (44px)
              "min-h-[44px]",
              // Focus ring
              "focus-visible:ring-2 focus-visible:ring-inset",
              // Active indicator
              isItemActive && [
                isDark ? "bg-[#46a0d0]/10" : "bg-[#2984AD]/5",
              ],
              // Featured base styles
              isFeatured && !isItemActive && featuredStyles.base,
              // Hover/keyboard active state
              !isFeatured && (isKeyboardActive || !isItemActive) &&
                (isDark
                  ? "hover:bg-white/5 focus-visible:bg-white/5 focus-visible:ring-[#46a0d0]/50"
                  : "hover:bg-[#f1f5f9] focus-visible:bg-[#f1f5f9] focus-visible:ring-[#2984AD]/50")
            );

            const linkElement = (
              <a
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                href={item.href}
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                onClick={(e) => handleItemClick(item, e)}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => setActiveIndex(index)}
                className={itemClasses}
                style={featuredStyles.style}
              >
                {/* Featured effect overlay */}
                {isFeatured && featuredStyles.overlay}

                {/* Active indicator bar */}
                {isItemActive && (
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full z-10",
                      isDark ? "bg-[#46a0d0]" : "bg-[#2984AD]"
                    )}
                  />
                )}
                <div className="relative z-10">{itemContent}</div>
              </a>
            );

            // Use custom link renderer if provided
            if (renderLink) {
              return (
                <div
                  key={item.key}
                  role="none"
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {renderLink(item, itemContent)}
                </div>
              );
            }

            return (
              <div key={item.key} role="none">
                {linkElement}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Export variants for external use
export { navDropdownVariants };
