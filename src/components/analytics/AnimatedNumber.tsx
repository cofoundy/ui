type AnimatedNumberFormat = "number" | "duration" | "percentage";

export interface AnimatedNumberProps {
  value: number;
  format?: AnimatedNumberFormat;
  duration?: number;
  animate?: boolean;
  className?: string;
}

function formatAnimatedValue(value: number, format: AnimatedNumberFormat): string {
  const rounded = Math.round(value);

  switch (format) {
    case "duration": {
      if (rounded >= 3600) {
        const h = Math.floor(rounded / 3600);
        const m = Math.floor((rounded % 3600) / 60);
        return `${h}h ${String(m).padStart(2, "0")}m`;
      }
      const m = Math.floor(rounded / 60);
      const s = rounded % 60;
      return `${m}m ${String(s).padStart(2, "0")}s`;
    }
    case "percentage":
      return `${rounded}%`;
    case "number":
    default:
      return rounded.toLocaleString();
  }
}

export function AnimatedNumber({
  value,
  format = "number",
  className,
}: AnimatedNumberProps) {
  return (
    <span data-slot="animated-number" className={className}>
      {formatAnimatedValue(value, format)}
    </span>
  );
}
