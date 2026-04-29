import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface FacturaProps {
  clientName?: string;
  invoiceNumber: string;
  amount: string;
  dueDate?: string;
  detractionAmount?: string;
  bdnAccount?: string;
  hasXml?: boolean;
  hasCdr?: boolean;
  signatureHtml?: string;
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
  signatureHtml,
  testMode = false,
}: FacturaProps) {
  return (
    <EmailLayout
      title={`Factura ${invoiceNumber} — Cofoundy`}
      previewText={`Factura ${invoiceNumber} por ${amount}`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Factura {invoiceNumber}</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Adjuntamos la factura electrónica <strong style={{ color: colors.navy }}>{invoiceNumber}</strong> por
        los servicios prestados por Cofoundy S.A.C. Aquí el resumen:
      </EmailText>

      <InfoBox label="Monto total" value={amount} />
      {dueDate && <InfoBox label="Fecha de vencimiento" value={dueDate} />}

      {detractionAmount && (
        <>
          <EmailHeading as="h2">Detracción SPOT [022]</EmailHeading>
          <EmailText>
            Esta operación está sujeta al Sistema de Pago de Obligaciones Tributarias (SPOT).
            Deposita <strong style={{ color: colors.navy }}>{detractionAmount}</strong> (12%) a nuestra
            cuenta del Banco de la Nación:
          </EmailText>
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
      <ul style={listStyle}>
        <li style={listItemStyle}><strong style={{ color: colors.navy }}>PDF de la factura</strong> — representación impresa</li>
        {hasXml && <li style={listItemStyle}><strong style={{ color: colors.navy }}>XML firmado</strong> — documento oficial SUNAT</li>}
        {hasCdr && <li style={listItemStyle}><strong style={{ color: colors.navy }}>CDR</strong> — constancia de recepción SUNAT</li>}
      </ul>

      <EmailText>
        Cualquier consulta sobre este comprobante, responde a este correo o escríbenos a{' '}
        <Link href="mailto:info@cofoundy.dev" style={linkStyle}>info@cofoundy.dev</Link>.
      </EmailText>
      <EmailText>Gracias por confiar en Cofoundy.</EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.navyLight, textDecoration: 'underline' };
const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
