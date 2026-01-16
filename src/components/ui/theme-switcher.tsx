import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const themeSwitcherVariants = cva(
  "relative cursor-pointer transition-all",
  {
    variants: {
      size: {
        sm: "w-10 h-10",
        default: "w-14 h-14",
        lg: "w-20 h-20",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface ThemeSwitcherProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof themeSwitcherVariants> {
  /** Current theme - "light" or "dark" */
  theme?: "light" | "dark"
  /** Callback when theme changes */
  onThemeChange?: (theme: "light" | "dark") => void
  /** Animation duration in ms */
  duration?: number
}

// Cofoundy palette colors
const COLORS = {
  dark: {
    background: "#020b1b",
    foreground: "#ffffff",
  },
  light: {
    background: "#ffffff",
    foreground: "#0f172a",
  },
}

function ThemeSwitcher({
  className,
  size,
  theme = "dark",
  onThemeChange,
  duration = 500,
  ...props
}: ThemeSwitcherProps) {
  const isDark = theme === "dark"
  const colors = COLORS[theme]
  const transitionStyle = `${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`

  const handleClick = () => {
    onThemeChange?.(isDark ? "light" : "dark")
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={handleClick}
      className={cn(
        themeSwitcherVariants({ size }),
        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-full",
        className
      )}
      {...props}
    >
      <svg
        viewBox="3 3 94 94"
        className="w-full h-full"
        style={{
          transform: isDark ? "rotate(0deg)" : "rotate(40deg)",
          transition: `transform ${transitionStyle}`,
        }}
      >
        {/* Sun circle */}
        <circle
          cx="50"
          cy="50"
          r="28"
          style={{
            fill: isDark ? colors.foreground : "var(--secondary)",
            transition: `fill ${transitionStyle}`,
          }}
        />

        {/* Moon shadow overlay */}
        <circle
          cx="65"
          cy="38"
          r="28"
          style={{
            fill: colors.background,
            transform: isDark
              ? "translate(0px, 0px) scale(1)"
              : "translate(60px, -10px) scale(0)",
            transition: `transform ${transitionStyle}, fill ${transitionStyle}`,
            transformOrigin: "center",
          }}
        />

        {/* Sun rays */}
        <g
          style={{
            stroke: isDark ? colors.background : "var(--secondary)",
            strokeWidth: 6,
            strokeLinecap: "round",
            opacity: isDark ? 0 : 1,
            transition: `stroke ${transitionStyle}, opacity ${transitionStyle}`,
          }}
        >
          {/* Cardinal rays */}
          <line x1="50" y1="5" x2="50" y2="16" />
          <line x1="50" y1="84" x2="50" y2="95" />
          <line x1="5" y1="50" x2="16" y2="50" />
          <line x1="84" y1="50" x2="95" y2="50" />
          {/* Diagonal rays */}
          <line x1="18" y1="18" x2="26" y2="26" />
          <line x1="74" y1="74" x2="82" y2="82" />
          <line x1="18" y1="82" x2="26" y2="74" />
          <line x1="74" y1="26" x2="82" y2="18" />
        </g>
      </svg>
    </button>
  )
}

export { ThemeSwitcher, themeSwitcherVariants }
