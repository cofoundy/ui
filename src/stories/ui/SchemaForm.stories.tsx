import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  SchemaForm,
  validateSchemaForm,
  type SchemaFormFieldLabels,
  type SchemaFormSchema,
  type SchemaFormValue,
} from "../../components/ui/schema-form";
import { Button } from "../../components/ui/button";

/**
 * A form generated from a JSON Schema (pydantic `model_json_schema()`) plus `x-ui` hints.
 * Widgets: segmented · duration · integer · nullable_threshold · message · service_list ·
 * tags · secret; anything else (e.g. `whatsapp_templates`) through `renderCustom`.
 * `x-group` groups (an `advanced` group is collapsed and opens by itself on error),
 * `x-show-if` hides fields with animated height. Errors are controlled (`errors`).
 */
const meta: Meta<typeof SchemaForm> = {
  title: "UI/SchemaForm",
  component: SchemaForm,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SchemaForm>;

const SCHEMA: SchemaFormSchema = {
  required: ["kind", "services"],
  "x-groups": [
    { key: "reserva", title: "La reserva" },
    { key: "agenda", title: "Dónde queda agendada" },
    { key: "mensajes", title: "Mensajes al cliente", advanced: true },
  ],
  properties: {
    kind: { type: "string", enum: ["table", "appointment"], "x-ui": "segmented", "x-group": "reserva" },
    services: { type: "array", "x-ui": "service_list", "x-group": "reserva", "x-show-if": { field: "kind", equals: "appointment" } },
    max_party_size: { type: "integer", minimum: 1, maximum: 40, "x-group": "reserva", "x-show-if": { field: "kind", equals: "table" } },
    handoff_party_size: { type: "integer", nullable: true, minimum: 2, default: 10, "x-ui": "nullable_threshold", "x-group": "reserva", "x-show-if": { field: "kind", equals: "table" } },
    min_lead_minutes: { type: "integer", minimum: 0, "x-ui": "duration", "x-unit": "minutes", "x-group": "reserva" },
    zonas: { type: "array", "x-ui": "tags", "x-group": "reserva" },
    provider: { type: "string", enum: ["internal", "calcom"], "x-ui": "segmented", "x-group": "agenda" },
    calcom_link: { type: "string", "x-ui": "secret", "x-group": "agenda", "x-show-if": { field: "provider", equals: "calcom" } },
    reminder_hours_before: { type: "integer", nullable: true, minimum: 1, maximum: 72, default: 3, "x-ui": "nullable_threshold", "x-unit": "hours", "x-group": "agenda" },
    mensaje_confirmacion: { type: "string", nullable: true, maxLength: 160, "x-ui": "message", "x-group": "mensajes", "x-placeholders": ["nombre", "personas", "hora"] },
  },
};

const LABELS: Record<string, SchemaFormFieldLabels> = {
  kind: { label: "Qué reservan tus clientes", options: { table: "Una mesa", appointment: "Una cita" } },
  services: { label: "Servicios que se pueden agendar", help: "El agente solo ofrece estos." },
  max_party_size: { label: "Máximo de personas por reserva", suffix: "personas" },
  handoff_party_size: { label: "Grupos grandes los coordina tu equipo", help: "Desde este número, el agente te pasa la conversación.", suffix: "personas o más" },
  min_lead_minutes: { label: "Anticipación mínima" },
  zonas: { label: "Zonas del local", placeholder: "Ej.: Terraza" },
  provider: { label: "Dónde queda agendada", options: { internal: "En la bandeja", calcom: "En Cal.com" } },
  calcom_link: { label: "Tu enlace de Cal.com", placeholder: "https://cal.com/tu-negocio/reserva" },
  reminder_hours_before: { label: "Recordarle al cliente", suffix: "horas antes" },
  mensaje_confirmacion: { label: "Mensaje al confirmar" },
};

const INITIAL: SchemaFormValue = {
  kind: "table",
  services: [{ name: "Almuerzo ejecutivo", duration_minutes: 60 }],
  max_party_size: 12,
  handoff_party_size: null,
  min_lead_minutes: 120,
  zonas: ["Salón", "Terraza"],
  provider: "internal",
  calcom_link: "",
  reminder_hours_before: 3,
  mensaje_confirmacion: null,
};

function Controlled(props: { readOnly?: boolean; highlight?: string; initialErrors?: Record<string, string> }) {
  const [value, setValue] = React.useState(INITIAL);
  const [errors, setErrors] = React.useState<Record<string, string>>(props.initialErrors ?? {});
  return (
    <div className="flex max-w-[560px] flex-col gap-6">
      <SchemaForm
        schema={SCHEMA}
        value={value}
        labels={LABELS}
        errors={errors}
        highlight={props.highlight}
        readOnly={props.readOnly}
        onChange={(next, key) => {
          setValue(next);
          if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
        }}
      />
      {props.readOnly ? null : (
        <Button className="self-start" onClick={() => setErrors(validateSchemaForm(SCHEMA, value))}>
          Guardar cambios
        </Button>
      )}
    </div>
  );
}

export const Default: Story = { render: () => <Controlled /> };

/** A 422 from the server lands on its field; the collapsed group opens by itself. */
export const WithErrors: Story = {
  render: () => <Controlled initialErrors={{ max_party_size: "Máximo 40.", mensaje_confirmacion: "El mensaje no puede llevar enlaces." }} />,
};

/** The field an `invalid_config` points to, flagged with the warn bar. */
export const Highlighted: Story = { render: () => <Controlled highlight="min_lead_minutes" /> };

/** Without write permission the configuration is read as text, never as disabled controls. */
export const ReadOnly: Story = { render: () => <Controlled readOnly /> };
