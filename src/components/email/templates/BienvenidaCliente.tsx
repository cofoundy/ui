import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { fontFamily, colors } from '../constants';

export interface BienvenidaClienteProps {
  clientName: string;
  projectName: string;
  kickoffDate?: string;
  pmName?: string;
  senderEmail?: string;
  nextStepsBullets?: string[];
  vikunjaUrl?: string;
  kickoffDetails?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}

export function BienvenidaCliente({
  clientName,
  projectName,
  kickoffDate,
  pmName,
  senderEmail,
  nextStepsBullets,
  vikunjaUrl,
  kickoffDetails,
  calLink,
  signatureHtml,
  testMode = false,
}: BienvenidaClienteProps) {
  const defaultSteps = [
    'Te iremos actualizando por WhatsApp con los avances de cada fase.',
    'Para consultas formales, responde a este correo.',
  ];

  const steps = nextStepsBullets && nextStepsBullets.length > 0
    ? nextStepsBullets
    : defaultSteps;

  return (
    <EmailLayout
      title={`Bienvenido a Cofoundy — ${projectName || clientName}`}
      previewText={`¡Bienvenido, ${clientName}! Tu proyecto ${projectName} está activo`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>¡Bienvenido, {clientName}!</EmailHeading>
      <EmailText>
        Nos alegra arrancar contigo en <strong style={{ color: colors.navy }}>{projectName}</strong>.
        Tu proyecto ya está activo en nuestro sistema y el equipo está listo para empezar.
      </EmailText>

      {kickoffDate && <InfoBox label="Fecha de inicio" value={kickoffDate} />}
      {pmName && (
        <InfoBox
          label="Tu punto de contacto en Cofoundy"
          value={senderEmail ? `${pmName} · ${senderEmail}` : pmName}
          href={senderEmail ? `mailto:${senderEmail}` : undefined}
        />
      )}

      <EmailHeading as="h2">¿Qué sigue?</EmailHeading>
      <ul style={listStyle}>
        {steps.map((item, i) => (
          <li key={i} style={listItemStyle}>{item}</li>
        ))}
        {vikunjaUrl && (
          <li style={listItemStyle}>
            Panel de seguimiento del proyecto:{' '}
            <Link href={vikunjaUrl} style={linkStyle}>ver aquí</Link>
          </li>
        )}
        {kickoffDetails && <li style={listItemStyle}>{kickoffDetails}</li>}
      </ul>

      <EmailDivider />

      {calLink && (
        <>
          <EmailText>Si necesitas coordinar una llamada rápida en cualquier momento:</EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText style={{ marginTop: '16px' }}>
        Gracias por confiar en Cofoundy. Vamos a construir algo excelente juntos.
      </EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.navyLight, textDecoration: 'none', fontWeight: 600 };
const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
