#!/usr/bin/env bun
/**
 * Render CLI — renders React Email templates to HTML + plain text.
 *
 * Consumer interface for non-JS systems (Python mail skill calls this via subprocess).
 * Lives in @cofoundy/ui so all deps (react, @react-email/render) resolve naturally.
 *
 * Usage: bun run scripts/render-email.ts <template-name> '<json-props>'
 * Output: {"html": "...", "text": "..."} on stdout
 *
 * Props accept snake_case keys (auto-converted to camelCase for React components).
 */

import { createElement } from 'react';
import type { ReactElement } from 'react';
import {
  renderEmail,
  renderEmailPlainText,
} from '../src/components/email/render';
import { CotizacionFollowup } from '../src/components/email/templates/CotizacionFollowup';
import { Factura } from '../src/components/email/templates/Factura';
import { BienvenidaCliente } from '../src/components/email/templates/BienvenidaCliente';
import { CierreProyecto } from '../src/components/email/templates/CierreProyecto';
import { DevEntrega } from '../src/components/email/templates/DevEntrega';
import { ReminderPago } from '../src/components/email/templates/ReminderPago';
import { EnvioContrato } from '../src/components/email/templates/EnvioContrato';
import { PersonalNote } from '../src/components/email/templates/PersonalNote';

type TemplateFn = (props: Record<string, unknown>) => ReactElement;

const TEMPLATES: Record<string, TemplateFn> = {
  'cotizacion-followup': CotizacionFollowup as unknown as TemplateFn,
  'factura': Factura as unknown as TemplateFn,
  'bienvenida-cliente': BienvenidaCliente as unknown as TemplateFn,
  'cierre-proyecto': CierreProyecto as unknown as TemplateFn,
  'dev-entrega': DevEntrega as unknown as TemplateFn,
  'envio-contrato': EnvioContrato as unknown as TemplateFn,
  'reminder-pago': ReminderPago as unknown as TemplateFn,
  'personal-note': PersonalNote as unknown as TemplateFn,
};

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function convertKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

const templateName = process.argv[2];
const rawProps = process.argv[3] || '{}';

if (!templateName || templateName === '--help') {
  console.error('Usage: bun run scripts/render-email.ts <template> \'<json-props>\'');
  console.error(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
  process.exit(templateName === '--help' ? 0 : 1);
}

const Component = TEMPLATES[templateName];
if (!Component) {
  console.error(`Unknown template: ${templateName}`);
  console.error(`Available: ${Object.keys(TEMPLATES).join(', ')}`);
  process.exit(1);
}

let props: Record<string, unknown>;
try {
  props = convertKeys(JSON.parse(rawProps));
} catch (e) {
  console.error(`Invalid JSON props: ${e}`);
  process.exit(1);
}

const element = createElement(Component, props);
const [html, text] = await Promise.all([
  renderEmail(element),
  renderEmailPlainText(element),
]);

process.stdout.write(JSON.stringify({ html, text }));
