import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { InfoBoxRow } from '../components/InfoBoxRow';
import { NextStepCallout } from '../components/NextStepCallout';
import { ScopeList } from '../components/ScopeList';
import { colors } from '../constants';

export interface FacturaProps {
  clientName?: string;
  invoiceNumber: string;
  amount: string;
  dueDate?: string;
  detractionAmount?: string;
  bdnAccount?: string;
  hasXml?: boolean;
  hasCdr?: boolean;
  testMode?: boolean;
}

export function Factura({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  detractionAmount,
  bdnAccount,
  hasXml = false,
  hasCdr = false,
  testMode = false,
}: FacturaProps) {
  const attachments: string[] = ['PDF de la factura — representación impresa'];
  if (hasXml) attachments.push('XML firmado — documento oficial SUNAT');
  if (hasCdr) attachments.push('CDR — constancia de recepción SUNAT');

  return (
    <EmailLayout
      title={`Factura ${invoiceNumber} — Cofoundy`}
      heading={`Factura ${invoiceNumber}`}
      previewText={`Factura ${invoiceNumber} por ${amount}`}
      testMode={testMode}
    >
      <EmailText variant="greeting">Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Adjuntamos la factura electrónica <strong style={{ color: colors.textDark }}>{invoiceNumber}</strong> por
        los servicios prestados por Cofoundy S.A.C. Aquí el resumen:
      </EmailText>

      {dueDate ? (
        <InfoBoxRow
          items={[
            { label: 'Monto total', value: amount },
            { label: 'Fecha de vencimiento', value: dueDate },
          ]}
        />
      ) : (
        <InfoBox label="Monto total" value={amount} />
      )}

      {detractionAmount && (
        <>
          <NextStepCallout label="Detracción SPOT [022]">
            Esta operación está sujeta al Sistema de Pago de Obligaciones Tributarias (SPOT).
            Deposita <strong>{detractionAmount}</strong> (12%) a nuestra cuenta del Banco de la Nación.
          </NextStepCallout>
          <InfoBox label="Cuenta BdN · Cofoundy S.A.C." value={bdnAccount || '00-028-152698'} />
          <EmailText>
            Una vez realizado el depósito, envíanos la constancia a{' '}
            <Link href="mailto:info@cofoundy.dev" style={linkStyle}>info@cofoundy.dev</Link> para
            completar el registro.
          </EmailText>
        </>
      )}

      <EmailDivider />

      <EmailHeading as="h2">Adjuntos en este correo</EmailHeading>
      <ScopeList items={attachments} />

      <EmailText>
        Cualquier consulta sobre este comprobante, responde a este correo o escríbenos a{' '}
        <Link href="mailto:info@cofoundy.dev" style={linkStyle}>info@cofoundy.dev</Link>.
      </EmailText>
      <EmailText>Gracias por confiar en Cofoundy.</EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.primary, textDecoration: 'underline' };
