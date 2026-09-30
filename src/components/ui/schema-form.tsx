"use client";

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotionConfig,
  type Transition,
} from "framer-motion"
import { CircleAlert, Plus, X } from "lucide-react"

import { cn } from "../../utils/cn"
import { springTransition, type SpringName } from "../../lib/spring"
import { Switch } from "./switch"
import { Input } from "./input"
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import { EdgeLayers, useEdgeIndicator } from "./edge-layers"

/* ──────────────────────────────────────────────────────────────────────────────────────────
 * SchemaForm — a form generated from a JSON Schema (pydantic `model_json_schema()` shape)
 * plus `x-ui` hints the backend emits via `json_schema_extra`.
 *
 *   x-ui        widget hint: segmented · duration · integer · nullable_threshold · message ·
 *               service_list · tags · secret — anything else goes to `renderCustom`
 *               (e.g. `whatsapp_templates`, whose options come from the product's API).
 *   x-unit      base unit of a `duration` / `nullable_threshold` (minutes | hours | days).
 *   x-group     visual group; a group marked `advanced` renders collapsed («Opcional»)
 *               and opens by itself when one of its fields has an error.
 *   x-show-if   `{ field, equals }` or `{ field, in: [...] }` — hide unless another field matches.
 *   x-placeholders   `{placeholder}` chips offered under a `message` textarea.
 *
 * Controlled: `value` + `onChange(next, key)`. Errors are the caller's (`errors` by field —
 * from the server's `loc`, or from `validateSchemaForm()`), so a 422 lands on its field
 * without losing what was typed. Copy is Spanish by default; pass `labels` / `strings` to
 * translate. With `readOnly` the configuration is READ as text, never as disabled controls.
 * ────────────────────────────────────────────────────────────────────────────────────────── */

export type SchemaFormUnit = "minutes" | "hours" | "days"

export interface SchemaFormField {
  type?: "integer" | "number" | "string" | "boolean" | "array" | "object" | "null"
  title?: string
  description?: string
  nullable?: boolean
  default?: unknown
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  enum?: (string | number)[]
  items?: unknown
  "x-ui"?: string
  "x-unit"?: SchemaFormUnit
  "x-group"?: string
  "x-show-if"?: { field: string; equals?: unknown; in?: unknown[] }
  "x-placeholders"?: string[]
}

export interface SchemaFormGroup {
  key: string
  title?: string
  /** Collapsed behind a header («Opcional») until opened — or until a field in it errors. */
  advanced?: boolean
}

export interface SchemaFormSchema {
  required?: string[]
  properties: Record<string, SchemaFormField>
  /** Group order + titles. Also accepted as the `groups` prop (which wins). */
  "x-groups"?: SchemaFormGroup[]
}

export interface SchemaFormFieldLabels {
  label?: string
  help?: string
  /** Enum value → label, for `segmented` / select. */
  options?: Record<string, string>
  /** Unit after a number: «personas», «por día». */
  suffix?: string
  placeholder?: string
}

export type SchemaFormValue = Record<string, unknown>

export interface SchemaFormStrings {
  optional: string
  required: string
  requiredList: string
  notANumber: string
  min: (n: number) => string
  max: (n: number) => string
  maxLength: (n: number) => string
  serviceIncomplete: (minMinutes: number) => string
  units: Record<SchemaFormUnit, [singular: string, plural: string]>
  unitAria: string
  serviceName: string
  serviceNamePlaceholder: string
  serviceDuration: (name: string) => string
  serviceMinutes: string
  addService: string
  remove: (what: string) => string
  tagsPlaceholder: string
  tagsAddAnother: string
  messagePlaceholder: string
  thresholdOn: (v: number, unit: string) => string
  off: string
  empty: string
  defaultMessage: string
  yes: string
  no: string
}

export const SCHEMA_FORM_STRINGS: SchemaFormStrings = {
  optional: "Opcional",
  required: "Este dato es obligatorio.",
  requiredList: "Agrega al menos uno.",
  notANumber: "Escribe un número.",
  min: (n) => `Mínimo ${n}.`,
  max: (n) => `Máximo ${n}.`,
  maxLength: (n) => `Máximo ${n} caracteres.`,
  serviceIncomplete: (m) => `Cada servicio necesita nombre y una duración de al menos ${m} min.`,
  units: { minutes: ["minuto", "minutos"], hours: ["hora", "horas"], days: ["día", "días"] },
  unitAria: "Unidad",
  serviceName: "Nombre del servicio",
  serviceNamePlaceholder: "Ej.: Consulta inicial",
  serviceDuration: (n) => `Duración de ${n || "este servicio"} en minutos`,
  serviceMinutes: "min",
  addService: "Agregar servicio",
  remove: (w) => `Quitar ${w}`,
  tagsPlaceholder: "Escribe y presiona Enter",
  tagsAddAnother: "Agregar otro",
  messagePlaceholder: "Vacío = usamos el mensaje por defecto.",
  thresholdOn: (v, unit) => `Sí · ${v} ${unit}`,
  off: "No",
  empty: "—",
  defaultMessage: "Mensaje por defecto",
  yes: "Sí",
  no: "No",
}

export interface SchemaFormCustomContext {
  id: string
  name: string
  field: SchemaFormField
  value: unknown
  onChange: (next: unknown) => void
  invalid: boolean
  labels: SchemaFormFieldLabels
  readOnly: boolean
}

export interface SchemaFormProps {
  schema: SchemaFormSchema
  value: SchemaFormValue
  onChange: (next: SchemaFormValue, changedKey: string) => void
  /** Field → message, in the owner's words. */
  errors?: Record<string, string | undefined>
  /** Field to flag (warn bar at its left) — e.g. the one an `invalid_config` points to. */
  highlight?: string
  labels?: Record<string, SchemaFormFieldLabels>
  groups?: SchemaFormGroup[]
  /** Render a field yourself. Return `undefined` to fall back to the built-in widget. */
  renderCustom?: (ctx: SchemaFormCustomContext) => React.ReactNode | undefined
  /** Read-only text for a custom field in `readOnly` mode. */
  formatCustom?: (name: string, value: unknown, field: SchemaFormField) => string | undefined
  readOnly?: boolean
  strings?: Partial<SchemaFormStrings>
  idPrefix?: string
  className?: string
}

/* ── pure helpers (exported: the caller validates with the same rules the form shows) ─────── */

export function isSchemaFieldVisible(field: SchemaFormField, value: SchemaFormValue): boolean {
  const s = field["x-show-if"]
  if (!s) return true
  const v = value[s.field]
  if (Array.isArray(s.in)) return s.in.includes(v)
  return v === s.equals
}

const isEmpty = (v: unknown) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0)

type Service = { name: string; duration_minutes: number }

/** Errors by field, with the same criteria pydantic applies (required · min · max · maxLength). */
export function validateSchemaForm(
  schema: SchemaFormSchema,
  value: SchemaFormValue,
  strings: Partial<SchemaFormStrings> = {},
): Record<string, string> {
  const s = { ...SCHEMA_FORM_STRINGS, ...strings }
  const required = new Set(schema.required ?? [])
  const err: Record<string, string> = {}
  for (const [k, f] of Object.entries(schema.properties)) {
    if (!isSchemaFieldVisible(f, value)) continue
    const v = value[k]
    const hint = f["x-ui"]
    if (required.has(k) && isEmpty(v) && hint !== "nullable_threshold" && !f.nullable) {
      err[k] = f.type === "array" ? s.requiredList : s.required
      continue
    }
    if (hint === "service_list" && Array.isArray(v)) {
      const min = f.minimum ?? 5
      if ((v as Service[]).some((x) => !String(x?.name ?? "").trim() || !(Number(x?.duration_minutes) >= min))) {
        err[k] = s.serviceIncomplete(min)
      }
      continue
    }
    if ((f.type === "integer" || f.type === "number" || hint === "duration") && !isEmpty(v)) {
      const n = Number(v)
      if (!Number.isFinite(n)) err[k] = s.notANumber
      else if (f.minimum !== undefined && n < f.minimum) err[k] = s.min(f.minimum)
      else if (f.maximum !== undefined && n > f.maximum) err[k] = s.max(f.maximum)
      continue
    }
    if (typeof v === "string" && f.maxLength !== undefined && v.length > f.maxLength) err[k] = s.maxLength(f.maxLength)
  }
  return err
}

/* ── motion ─────────────────────────────────────────────────────────────────────────────── */

const INSTANT: Transition = { duration: 0 }
/** Content leaves first (≈ 80 ms, opacity only: this text is < 14 px, blur would flicker). */
const EXIT: Transition = { duration: 0.08, ease: "linear" as const }

function useSprings() {
  const reduce = useReducedMotionConfig() ?? false
  return React.useMemo(
    () => ({
      reduce,
      t: (name: SpringName): Transition => (reduce ? INSTANT : springTransition(name)),
      exit: reduce ? INSTANT : EXIT,
      /** Service rows: height auto (smooth), then the content's opacity once the box is mostly open. */
      reveal: {
        initial: { height: 0, opacity: 0 },
        animate: {
          height: "auto",
          opacity: 1,
          transition: reduce
            ? INSTANT
            : { height: springTransition("smooth"), opacity: { duration: 0.16, delay: 0.12, ease: "linear" as const } },
        },
        exit: {
          height: 0,
          opacity: 0,
          transition: reduce ? INSTANT : { opacity: EXIT, height: springTransition("smooth") },
        },
      },
    }),
    [reduce],
  )
}

/* ── styling ────────────────────────────────────────────────────────────────────────────── */

const colorT =
  "transition-[border-color,box-shadow,background-color,color] duration-[var(--cf-duration-fast)] ease-[var(--cf-spring-smooth)]"
const inputCls = cn(
  "h-11 rounded-[10px] border bg-[var(--background)] px-3 text-[16px] text-[var(--foreground)] outline-none md:text-[14.5px]",
  "border-[var(--border)] placeholder:text-[var(--muted-foreground)]",
  "focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--ring)_28%,transparent)]",
  "aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:focus-visible:ring-[color-mix(in_srgb,var(--destructive)_22%,transparent)]",
  colorT,
)
const numCls = "w-24 tabular-nums font-[family-name:var(--font-mono)]"
const quietBtn =
  "rounded-[8px] text-[var(--muted-foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] hover:text-[var(--foreground)] outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--ring)_35%,transparent)]"

const UNIT_MIN: Record<SchemaFormUnit, number> = { minutes: 1, hours: 60, days: 1440 }

function unitWord(s: SchemaFormStrings, u: SchemaFormUnit, n: number) {
  return s.units[u][n === 1 ? 0 : 1]
}

function toNumberOrNull(raw: string): number | null {
  const t = raw.trim().replace(",", ".")
  if (t === "") return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

/* ── field shell: label · control · help ⇄ error ───────────────────────────────────────── */

function FieldMessage({ id, help, error }: { id: string; help?: string; error?: string }) {
  const { t, exit, reduce } = useSprings()
  // With help present the line swaps in place: the old line pops out of the flow and fades
  // in 80 ms, the new one starts fading in once it is gone (never two labels on top of each
  // other). Without help the error opens its own room (height auto) so nothing below jumps.
  // Deliberately not mode="wait": its hand-off waits on a callback a frozen clock never fires.
  const collapse = !help
  const key = error ? `e:${error}` : help ? "h" : null
  return (
    <AnimatePresence mode={collapse ? "sync" : "popLayout"} initial={false}>
      {key ? (
        <motion.div
          key={key}
          id={id}
          className="overflow-hidden"
          initial={{ opacity: 0, height: collapse ? 0 : "auto", y: reduce ? 0 : -3 }}
          animate={{
            opacity: 1,
            height: "auto",
            y: 0,
            transition: reduce
              ? INSTANT
              : {
                  height: t("smooth"),
                  y: { ...t("snappy"), delay: collapse ? 0 : 0.08 },
                  opacity: { duration: 0.14, delay: collapse ? 0.06 : 0.08, ease: "linear" as const },
                },
          }}
          exit={{ opacity: 0, height: collapse ? 0 : "auto", transition: collapse && !reduce ? { opacity: exit, height: t("smooth") } : exit }}
        >
          {error ? (
            <p role="alert" className="flex items-start gap-1.5 pt-1.5 text-[12.5px] leading-[1.45] text-[var(--destructive)]">
              <CircleAlert aria-hidden className="mt-[2px] size-3.5 shrink-0" strokeWidth={2.25} />
              {error}
            </p>
          ) : (
            <p className="pt-1.5 text-[12.5px] leading-[1.45] text-[var(--muted-foreground)]">{help}</p>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function FieldShell({
  id,
  label,
  help,
  error,
  highlight,
  children,
  labelFor = true,
}: {
  id: string
  label: string
  help?: string
  error?: string
  highlight?: boolean
  children: React.ReactNode
  labelFor?: boolean
}) {
  const Label = labelFor ? "label" : "span"
  return (
    <div
      data-slot="schema-form-field"
      data-highlight={highlight ? "" : undefined}
      className={cn(
        "relative flex flex-col",
        highlight && "pl-3 shadow-[inset_3px_0_0_var(--status-warning,var(--chat-warning))]",
      )}
    >
      <Label
        {...(labelFor ? { htmlFor: id } : { id: `${id}-label` })}
        className="pb-1.5 text-[13.5px] font-medium text-[var(--foreground)]"
      >
        {label}
      </Label>
      {children}
      <FieldMessage id={`${id}-msg`} help={help} error={error} />
    </div>
  )
}

/* ── widgets ────────────────────────────────────────────────────────────────────────────── */

/**
 * Radiogroup whose selection is ONE pill with two edges (`EdgeLayers`), the same indicator as
 * Tabs and Switch: the leading edge rides `edge`, the trailing one the compressed `smooth`,
 * so it stretches and settles. `useEdgeIndicator` measures the checked radio; nothing checked
 * (no value yet) hides the pill and the first choice places it in place, without sliding in.
 */
const SEG_PILL_STYLE = {
  "--cf-edge-fill": "var(--background)",
  filter:
    "drop-shadow(1px 0 0 var(--border)) drop-shadow(-1px 0 0 var(--border)) drop-shadow(0 1px 0 var(--border)) drop-shadow(0 -1px 0 var(--border)) drop-shadow(0 1px 2px color-mix(in srgb, var(--foreground) 10%, transparent))",
} as React.CSSProperties

function Segmented({
  id,
  options,
  value,
  onChange,
  labelledBy,
}: {
  id: string
  options: [string, string][]
  value: unknown
  onChange: (v: string) => void
  labelledBy: string
}) {
  const { t, reduce } = useSprings()
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const pillRef = React.useRef<HTMLSpanElement | null>(null)
  useEdgeIndicator(listRef, pillRef, '[role="radio"][data-state="checked"]', {
    concentric: true,
    resetOnEmpty: true,
    reduced: reduce,
  })
  const idx = Math.max(
    0,
    options.findIndex(([v]) => v === String(value)),
  )
  const move = (d: number) => {
    const n = (idx + d + options.length) % options.length
    onChange(options[n][0])
    refs.current[n]?.focus()
  }
  return (
    <div
      ref={listRef}
      id={id}
      role="radiogroup"
      aria-labelledby={labelledBy}
      data-slot="schema-form-segmented"
      className="relative inline-flex w-full gap-1 self-start rounded-[12px] border border-[var(--border)] bg-[var(--muted)] p-1 sm:w-auto"
    >
      <span
        ref={pillRef}
        aria-hidden
        data-slot="schema-form-segmented-pill"
        className="pointer-events-none absolute inset-1 overflow-clip data-[empty]:opacity-0"
        style={SEG_PILL_STYLE}
      >
        <EdgeLayers />
      </span>
      {options.map(([v, l], i) => {
        const on = v === String(value)
        return (
          <motion.button
            key={v}
            ref={(n) => {
              refs.current[i] = n
            }}
            type="button"
            role="radio"
            aria-checked={on}
            data-state={on ? "checked" : "unchecked"}
            tabIndex={on || (value === undefined && i === 0) ? 0 : -1}
            onClick={() => onChange(v)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault()
                move(1)
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault()
                move(-1)
              }
            }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            transition={t("snappy")}
            className={cn(
              // Labels sit above the pill, which lives in the list, not in the active option.
              "relative z-[1] h-9 flex-1 rounded-[8px] px-3.5 text-[14px] font-medium outline-none sm:flex-none",
              "focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--ring)_35%,transparent)]",
              colorT,
              on ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {l}
          </motion.button>
        )
      })}
    </div>
  )
}

function NumberInput({
  id,
  value,
  onChange,
  suffix,
  invalid,
  describedBy,
  ariaLabel,
}: {
  id: string
  value: unknown
  onChange: (v: number | null) => void
  suffix?: string
  invalid?: boolean
  describedBy?: string
  ariaLabel?: string
}) {
  // Keep what was typed ("1," / "") while it is not yet a number; the value is the caller's.
  const [draft, setDraft] = React.useState<string | null>(null)
  const shown = draft ?? (value === null || value === undefined || Number.isNaN(value) ? "" : String(value))
  return (
    <div className="flex items-center gap-2">
      <Input
        id={id}
        inputMode="decimal"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        className={cn(inputCls, numCls)}
        value={shown}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(toNumberOrNull(e.target.value))
        }}
        onBlur={() => setDraft(null)}
      />
      {suffix ? <span className="text-[14px] text-[var(--muted-foreground)]">{suffix}</span> : null}
    </div>
  )
}

/** The value lives in the schema's unit; the owner sees it in its natural unit. */
function DurationInput({
  id,
  field,
  value,
  onChange,
  invalid,
  describedBy,
  s,
}: {
  id: string
  field: SchemaFormField
  value: unknown
  onChange: (v: number | null) => void
  invalid?: boolean
  describedBy?: string
  s: SchemaFormStrings
}) {
  const base = field["x-unit"] ?? "minutes"
  const inMin = Number(value ?? 0) * UNIT_MIN[base]
  const natural: SchemaFormUnit =
    base === "days" ? "days" : inMin > 0 && inMin % 1440 === 0 ? "days" : inMin > 0 && inMin % 60 === 0 ? "hours" : base
  const [unit, setUnit] = React.useState<SchemaFormUnit>(natural)
  const units: SchemaFormUnit[] = base === "days" ? ["days"] : base === "hours" ? ["hours", "days"] : ["minutes", "hours", "days"]
  const shown = value === null || value === undefined ? null : +(inMin / UNIT_MIN[unit]).toFixed(2)
  return (
    <div className="flex items-center gap-2">
      <NumberInput
        id={id}
        value={shown}
        invalid={invalid}
        describedBy={describedBy}
        onChange={(n) => onChange(n === null || Number.isNaN(n) ? n : Math.round((n * UNIT_MIN[unit]) / UNIT_MIN[base]))}
      />
      {units.length > 1 ? (
        // Native <select> on purpose: 2–3 options, and on a phone it opens the OS picker (wheel /
        // sheet) instead of a popover that fights the on-screen keyboard. Styled like `Input`.
        <select
          aria-label={s.unitAria}
          className={cn(inputCls, "w-auto pr-8")}
          value={unit}
          onChange={(e) => setUnit(e.target.value as SchemaFormUnit)}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {s.units[u][1]}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-[14px] text-[var(--muted-foreground)]">{s.units[units[0]][1]}</span>
      )}
    </div>
  )
}

function TagsInput({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
  s,
}: {
  id: string
  value: unknown
  onChange: (v: string[]) => void
  invalid?: boolean
  describedBy?: string
  placeholder?: string
  s: SchemaFormStrings
}) {
  const { t, exit, reduce } = useSprings()
  const list = Array.isArray(value) ? (value as string[]) : []
  const [txt, setTxt] = React.useState("")
  const add = () => {
    const v = txt.trim()
    if (v && !list.includes(v)) onChange([...list, v])
    setTxt("")
  }
  return (
    <div
      aria-invalid={invalid || undefined}
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--background)] p-1.5",
        "focus-within:border-[var(--ring)] aria-[invalid=true]:border-[var(--destructive)]",
        colorT,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {list.map((tag) => (
          <motion.span
            key={tag}
            layout={!reduce}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: t("snappy") }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.92, transition: exit }}
            transition={t("smooth")}
            className="inline-flex h-8 items-center gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--muted)] pl-2.5 pr-1 text-[13.5px] text-[var(--foreground)]"
          >
            {tag}
            <button
              type="button"
              aria-label={s.remove(tag)}
              className={cn(quietBtn, "grid size-6 place-items-center rounded-[4px]")}
              onClick={() => onChange(list.filter((x) => x !== tag))}
            >
              <X className="size-3.5" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <Input
        id={id}
        value={txt}
        aria-describedby={describedBy}
        onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            add()
          } else if (e.key === "Backspace" && !txt && list.length) {
            onChange(list.slice(0, -1))
          }
        }}
        onBlur={add}
        placeholder={list.length ? s.tagsAddAnother : (placeholder ?? s.tagsPlaceholder)}
        // The chip box is the field (border + focus ring); the Input inside is bare.
        className="h-8 w-auto min-w-[140px] flex-1 rounded-none border-0 bg-transparent px-1.5 py-0 text-[16px] shadow-none focus-visible:ring-0 md:text-[14px]"
      />
    </div>
  )
}

let serviceSeq = 0
const newServiceId = () => `svc-${++serviceSeq}`

function ServiceList({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
  s,
}: {
  id: string
  value: unknown
  onChange: (v: Service[]) => void
  invalid?: boolean
  describedBy?: string
  placeholder?: string
  s: SchemaFormStrings
}) {
  const { t, reveal, reduce } = useSprings()
  const list = Array.isArray(value) ? (value as Service[]) : []
  // Stable row keys so a removed row animates out instead of the last one.
  const keys = React.useRef<string[]>([])
  if (keys.current.length !== list.length) keys.current = list.map((_, i) => keys.current[i] ?? newServiceId())
  const set = (i: number, patch: Partial<Service>) => onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const lastNameRef = React.useRef<HTMLInputElement | null>(null)
  const focusNew = React.useRef(false)
  React.useEffect(() => {
    if (focusNew.current) {
      focusNew.current = false
      lastNameRef.current?.focus()
    }
  }, [list.length])
  return (
    <div id={id} role="group" aria-describedby={describedBy} className="flex flex-col">
      <AnimatePresence initial={false}>
        {list.map((svc, i) => (
          <motion.div key={keys.current[i]} {...reveal} className="overflow-hidden">
            <div className="flex items-center gap-2 pb-2">
              <Input
                ref={i === list.length - 1 ? lastNameRef : undefined}
                aria-label={s.serviceName}
                aria-invalid={(invalid && !String(svc.name ?? "").trim()) || undefined}
                className={cn(inputCls, "min-w-0 flex-1")}
                value={svc.name ?? ""}
                placeholder={placeholder ?? s.serviceNamePlaceholder}
                onChange={(e) => set(i, { name: e.target.value })}
              />
              <NumberInput
                id={`${id}-${keys.current[i]}-min`}
                ariaLabel={s.serviceDuration(svc.name)}
                invalid={invalid && !(Number(svc.duration_minutes) > 0)}
                value={svc.duration_minutes}
                onChange={(n) => set(i, { duration_minutes: n as number })}
                suffix={s.serviceMinutes}
              />
              <motion.button
                type="button"
                aria-label={s.remove(svc.name || s.serviceName.toLowerCase())}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                transition={t("snappy")}
                onClick={() => {
                  keys.current = keys.current.filter((_, j) => j !== i)
                  onChange(list.filter((_, j) => j !== i))
                }}
                className={cn(quietBtn, "grid h-11 w-9 shrink-0 place-items-center")}
              >
                <X className="size-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button
        type="button"
        whileTap={reduce ? undefined : { scale: 0.96 }}
        transition={t("snappy")}
        onClick={() => {
          keys.current = [...keys.current, newServiceId()]
          focusNew.current = true
          onChange([...list, { name: "", duration_minutes: 30 }])
        }}
        className={cn(quietBtn, "inline-flex h-10 items-center gap-1.5 self-start px-2 text-[14px] font-medium")}
      >
        <Plus className="size-4" /> {s.addService}
      </motion.button>
    </div>
  )
}

function MessageInput({
  id,
  field,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
  s,
}: {
  id: string
  field: SchemaFormField
  value: unknown
  onChange: (v: string | null) => void
  invalid?: boolean
  describedBy?: string
  placeholder?: string
  s: SchemaFormStrings
}) {
  const { t, reduce } = useSprings()
  const txt = typeof value === "string" ? value : ""
  const ref = React.useRef<HTMLTextAreaElement | null>(null)
  const insert = (ph: string) => {
    const el = ref.current
    const token = `{${ph}}`
    const at = el ? el.selectionStart : txt.length
    const end = el ? el.selectionEnd : txt.length
    const next = txt.slice(0, at) + token + txt.slice(end)
    if (field.maxLength !== undefined && next.length > field.maxLength) return
    onChange(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(at + token.length, at + token.length)
    })
  }
  const near = field.maxLength !== undefined && txt.length >= field.maxLength * 0.9
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        ref={ref}
        id={id}
        rows={3}
        maxLength={field.maxLength}
        value={txt}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder ?? s.messagePlaceholder}
        className={cn(inputCls, "h-auto resize-y py-2.5 leading-[1.5] md:text-[14px]")}
      />
      <div className="flex flex-wrap items-center gap-1">
        {(field["x-placeholders"] ?? []).map((ph) => (
          <motion.button
            key={ph}
            type="button"
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={t("snappy")}
            onClick={() => insert(ph)}
            className="inline-flex h-7 items-center gap-1 rounded-[6px] border border-[var(--border)] px-2 font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--muted-foreground)] outline-none hover:bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] hover:text-[var(--foreground)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--ring)_35%,transparent)]"
          >
            <Plus aria-hidden className="size-3" />
            {ph}
          </motion.button>
        ))}
        {field.maxLength !== undefined ? (
          <span
            className={cn(
              "ml-auto font-[family-name:var(--font-mono)] text-[11px] tabular-nums",
              near ? "text-[var(--status-warning,var(--chat-warning))]" : "text-[var(--muted-foreground)]",
            )}
          >
            {txt.length}/{field.maxLength}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** Switch (label + help) with the number underneath while it is on; off = `null`. */
function NullableThreshold({
  id,
  field,
  value,
  onChange,
  label,
  help,
  suffix,
  error,
  highlight,
  s,
}: {
  id: string
  field: SchemaFormField
  value: unknown
  onChange: (v: number | null) => void
  label: string
  help?: string
  suffix?: string
  error?: string
  highlight?: boolean
  s: SchemaFormStrings
}) {
  const on = value !== null && value !== undefined
  const unit = field["x-unit"]
  return (
    <div
      data-slot="schema-form-field"
      className={cn("relative flex flex-col", highlight && "pl-3 shadow-[inset_3px_0_0_var(--status-warning,var(--chat-warning))]")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={`${id}-sw`} className="text-[13.5px] font-medium text-[var(--foreground)]">
            {label}
          </label>
          {help ? <p className="mt-0.5 text-[12.5px] leading-[1.45] text-[var(--muted-foreground)]">{help}</p> : null}
        </div>
        <Switch
          id={`${id}-sw`}
          checked={on}
          onCheckedChange={(next) => onChange(next ? Number(field.default ?? field.minimum ?? 1) : null)}
        />
      </div>
      <Collapsible open={on}>
        <CollapsibleContent className="pt-2.5">
          <NumberInput
            id={id}
            value={value}
            invalid={Boolean(error)}
            describedBy={`${id}-msg`}
            onChange={(n) => onChange(n)}
            suffix={suffix ?? (unit ? unitWord(s, unit, Number(value)) : undefined)}
          />
        </CollapsibleContent>
      </Collapsible>
      <FieldMessage id={`${id}-msg`} error={error} />
    </div>
  )
}

/* ── read-only summary ──────────────────────────────────────────────────────────────────── */

function humanizeMinutes(min: number, s: SchemaFormStrings) {
  if (min >= 1440 && min % 1440 === 0) return `${min / 1440} ${unitWord(s, "days", min / 1440)}`
  if (min >= 60 && min % 60 === 0) return `${min / 60} ${unitWord(s, "hours", min / 60)}`
  return `${min} ${s.serviceMinutes}`
}

function formatValue(
  k: string,
  f: SchemaFormField,
  v: unknown,
  lab: SchemaFormFieldLabels,
  s: SchemaFormStrings,
): string {
  const hint = f["x-ui"]
  if (hint === "service_list")
    return (Array.isArray(v) ? (v as Service[]) : []).map((x) => `${x.name} · ${x.duration_minutes} ${s.serviceMinutes}`).join(", ") || s.empty
  if (hint === "message") return v ? String(v) : s.defaultMessage
  if (hint === "nullable_threshold") {
    if (v === null || v === undefined) return s.off
    const unit = lab.suffix ?? (f["x-unit"] ? unitWord(s, f["x-unit"], Number(v)) : "")
    return s.thresholdOn(Number(v), unit).trim()
  }
  if (hint === "duration") return v === null || v === undefined ? s.empty : humanizeMinutes(Number(v) * UNIT_MIN[f["x-unit"] ?? "minutes"], s)
  if (f.enum || hint === "segmented") return lab.options?.[String(v)] ?? (isEmpty(v) ? s.empty : String(v))
  if (typeof v === "boolean") return v ? s.yes : s.no
  if (Array.isArray(v)) return v.map(String).join(", ") || s.empty
  if (isEmpty(v)) return s.empty
  return lab.suffix ? `${v} ${lab.suffix}` : String(v)
}

/* ── the form ───────────────────────────────────────────────────────────────────────────── */

export function SchemaForm({
  schema,
  value,
  onChange,
  errors = {},
  highlight,
  labels = {},
  groups: groupsProp,
  renderCustom,
  formatCustom,
  readOnly = false,
  strings: stringsProp,
  idPrefix,
  className,
}: SchemaFormProps) {
  const s = React.useMemo(() => ({ ...SCHEMA_FORM_STRINGS, ...stringsProp }), [stringsProp])
  const auto = React.useId()
  const prefix = idPrefix ?? `sf${auto.replace(/:/g, "")}`
  const { t, reduce } = useSprings()
  const [open, setOpen] = React.useState<Record<string, boolean>>({})

  const entries = Object.entries(schema.properties)
  const groups: SchemaFormGroup[] = (() => {
    const declared = groupsProp ?? schema["x-groups"]
    if (declared?.length) return declared
    const seen: string[] = []
    for (const [, f] of entries) {
      const g = f["x-group"] ?? "default"
      if (!seen.includes(g)) seen.push(g)
    }
    return (seen.length ? seen : ["default"]).map((key) => ({ key }))
  })()
  const firstGroup = groups[0]?.key ?? "default"
  const lab = (k: string, f: SchemaFormField): SchemaFormFieldLabels => ({
    label: labels[k]?.label ?? f.title ?? k,
    help: labels[k]?.help ?? f.description,
    options: labels[k]?.options,
    suffix: labels[k]?.suffix,
    placeholder: labels[k]?.placeholder,
  })
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v }, k)

  if (readOnly) {
    return (
      <dl
        data-slot="schema-form-summary"
        className={cn("divide-y divide-[var(--border)] overflow-hidden rounded-[12px] border border-[var(--border)]", className)}
      >
        {entries
          .filter(([, f]) => isSchemaFieldVisible(f, value))
          .map(([k, f]) => {
            const l = lab(k, f)
            const custom = formatCustom?.(k, value[k], f)
            return (
              <div key={k} className="grid grid-cols-1 gap-0.5 px-3.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4">
                <dt className="text-[13px] text-[var(--muted-foreground)]">{l.label}</dt>
                <dd className="text-[14px] text-[var(--foreground)]">{custom ?? formatValue(k, f, value[k], l, s)}</dd>
              </div>
            )
          })}
      </dl>
    )
  }

  const renderField = (k: string, f: SchemaFormField) => {
    const id = `${prefix}-${k}`
    const l = lab(k, f)
    const error = errors[k]
    const invalid = Boolean(error)
    const hl = highlight === k
    const msgId = `${id}-msg`
    const v = value[k]
    const hint = f["x-ui"]

    const custom = renderCustom?.({
      id,
      name: k,
      field: f,
      value: v,
      onChange: (next) => set(k, next),
      invalid,
      labels: l,
      readOnly,
    })
    if (custom !== undefined) {
      return (
        <FieldShell id={id} label={l.label!} help={l.help} error={error} highlight={hl} labelFor={false}>
          <div role="group" aria-labelledby={`${id}-label`} aria-describedby={msgId}>
            {custom}
          </div>
        </FieldShell>
      )
    }

    if (hint === "nullable_threshold") {
      return (
        <NullableThreshold
          id={id}
          field={f}
          value={v}
          onChange={(n) => set(k, n)}
          label={l.label!}
          help={l.help}
          suffix={l.suffix}
          error={error}
          highlight={hl}
          s={s}
        />
      )
    }

    if (f.type === "boolean") {
      return (
        <div
          data-slot="schema-form-field"
          className={cn("relative flex flex-col", hl && "pl-3 shadow-[inset_3px_0_0_var(--status-warning,var(--chat-warning))]")}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <label htmlFor={id} className="text-[13.5px] font-medium text-[var(--foreground)]">
                {l.label}
              </label>
              {l.help ? <p className="mt-0.5 text-[12.5px] leading-[1.45] text-[var(--muted-foreground)]">{l.help}</p> : null}
            </div>
            <Switch id={id} checked={Boolean(v)} onCheckedChange={(on) => set(k, on)} />
          </div>
          <FieldMessage id={msgId} error={error} />
        </div>
      )
    }

    let control: React.ReactNode
    let labelFor = true
    const common = { id, invalid, describedBy: msgId }
    const enumOpts = (f.enum ?? []).map((o) => [String(o), l.options?.[String(o)] ?? String(o)] as [string, string])

    if (hint === "segmented" || (f.enum && f.enum.length <= 4 && !hint)) {
      labelFor = false
      control = <Segmented id={id} options={enumOpts} value={v} onChange={(x) => set(k, x)} labelledBy={`${id}-label`} />
    } else if (f.enum) {
      // Native <select> on purpose (long enums): on a phone the OS picker beats a popover.
      control = (
        <select
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={msgId}
          className={cn(inputCls, "pr-8")}
          value={v === undefined || v === null ? "" : String(v)}
          onChange={(e) => set(k, e.target.value)}
        >
          {enumOpts.map(([o, name]) => (
            <option key={o} value={o}>
              {name}
            </option>
          ))}
        </select>
      )
    } else if (hint === "duration") {
      control = <DurationInput {...common} field={f} value={v} onChange={(n) => set(k, n)} s={s} />
    } else if (hint === "service_list") {
      labelFor = false
      control = <ServiceList {...common} value={v} onChange={(x) => set(k, x)} placeholder={l.placeholder} s={s} />
    } else if (hint === "tags") {
      control = <TagsInput {...common} value={v} onChange={(x) => set(k, x)} placeholder={l.placeholder} s={s} />
    } else if (hint === "message") {
      control = <MessageInput {...common} field={f} value={v} onChange={(x) => set(k, x)} placeholder={l.placeholder} s={s} />
    } else if (hint === "integer" || f.type === "integer" || f.type === "number") {
      control = <NumberInput {...common} value={v} onChange={(n) => set(k, n)} suffix={l.suffix} />
    } else {
      // `secret` / links / plain strings.
      control = (
        <Input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={msgId}
          autoComplete={hint === "secret" ? "off" : undefined}
          spellCheck={hint === "secret" ? false : undefined}
          maxLength={f.maxLength}
          className={inputCls}
          placeholder={l.placeholder}
          value={v === undefined || v === null ? "" : String(v)}
          onChange={(e) => set(k, e.target.value)}
        />
      )
    }

    return (
      <FieldShell id={id} label={l.label!} help={l.help} error={error} highlight={hl} labelFor={labelFor}>
        {control}
      </FieldShell>
    )
  }

  /**
   * Fields of a group. The ones with `x-show-if` stay in the list and open/close through
   * `Collapsible` (animated height; unmounted once closed). The gap above a field is padding
   * inside its box, so it is clipped with the field instead of popping.
   */
  const renderFields = (list: [string, SchemaFormField][]) => {
    const firstVisible = list.find(([, f]) => isSchemaFieldVisible(f, value))?.[0]
    return (
      <div className="flex flex-col">
        {list.map(([k, f]) => {
          const pad = k === firstVisible ? undefined : "pt-5"
          if (!f["x-show-if"]) {
            return (
              <div key={k} className={pad}>
                {renderField(k, f)}
              </div>
            )
          }
          return (
            <Collapsible key={k} open={isSchemaFieldVisible(f, value)}>
              <CollapsibleContent className={pad}>{renderField(k, f)}</CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    )
  }

  const plainGroups = groups.filter((g) => !g.advanced).length

  return (
    <div data-slot="schema-form" className={cn("flex min-w-0 flex-col gap-7", className)}>
      {groups.map((g) => {
        // Every field of the group (the hidden `x-show-if` ones animate out); the group itself
        // only renders while at least one of them is visible.
        const fields = entries.filter(([, f]) => (f["x-group"] ?? firstGroup) === g.key)
        const visible = fields.filter(([, f]) => isSchemaFieldVisible(f, value))
        if (!visible.length) return null
        const hasError = visible.some(([k]) => errors[k])
        const title = g.title ?? g.key
        if (g.advanced) {
          const isOpen = Boolean(open[g.key]) || hasError
          return (
            <Collapsible
              key={g.key}
              asChild
              open={isOpen}
              onOpenChange={(next) => setOpen((o) => ({ ...o, [g.key]: next }))}
            >
              <section className="border-t border-[var(--border)] pt-2">
                <CollapsibleTrigger asChild>
                  <motion.button
                    type="button"
                    whileTap={reduce ? undefined : { scale: 0.985 }}
                    transition={t("snappy")}
                    className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center justify-between rounded-[8px] px-2 text-left text-[13.5px] font-semibold text-[var(--foreground)] outline-none hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--ring)_35%,transparent)]"
                  >
                    {title}
                    <span className="flex items-center gap-2 text-[12.5px] font-normal text-[var(--muted-foreground)]">
                      <AnimatePresence initial={false} mode="wait">
                        {isOpen ? null : (
                          <motion.span
                            key="opt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: reduce ? INSTANT : { duration: 0.12, ease: "linear" as const } }}
                            exit={{ opacity: 0, transition: reduce ? INSTANT : EXIT }}
                          >
                            {s.optional}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <CollapsibleChevron />
                    </span>
                  </motion.button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-1 pt-3">{renderFields(fields)}</CollapsibleContent>
              </section>
            </Collapsible>
          )
        }
        return (
          <section key={g.key} className="flex flex-col gap-4">
            {plainGroups > 1 && g.title ? (
              <h3 className="font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                {title}
              </h3>
            ) : null}
            {renderFields(fields)}
          </section>
        )
      })}
    </div>
  )
}
