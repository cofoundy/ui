import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { InfoBoxRow } from '../components/InfoBoxRow';
import { ScopeList } from '../components/ScopeList';
import { colors } from '../constants';

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
  testMode = false,
}: BienvenidaClienteProps) {
  const defaultSteps = [
    'Te iremos actualizando por WhatsApp con los avances de cada fase.',
    'Para consultas formales, responde a este correo.',
  ];

  const steps = nextStepsBullets && nextStepsBullets.length > 0
    ? nextStepsBullets
    : defaultSteps;

  // Build the full list including conditional items
  const allSteps = [...steps];
  if (vikunjaUrl) allSteps.push(`Panel de seguimiento del proyecto: ${vikunjaUrl}`);
  if (kickoffDetails) allSteps.push(kickoffDetails);

  return (
    <EmailLayout
      title={`Bienvenido a Cofoundy — ${projectName || clientName}`}
      heading={`¡Bienvenido, ${clientName}!`}
      subtitle={projectName}
      previewText={`¡Bienvenido, ${clientName}! Tu proyecto ${projectName} está activo`}
      testMode={testMode}
    >
      <EmailText variant="greeting">
        Hola {clientName},
      </EmailText>
      <EmailText>
        Nos alegra arrancar contigo en <strong style={{ color: colors.textDark }}>{projectName}</strong>.
        Tu proyecto ya está activo en nuestro sistema y el equipo está listo para empezar.
      </EmailText>

      {kickoffDate && pmName && senderEmail ? (
        <InfoBoxRow
          items={[
            { label: 'Fecha de inicio', value: kickoffDate },
            { label: 'Tu contacto', value: pmName },
          ]}
        />
      ) : (
        <>
          {kickoffDate && <InfoBox label="Fecha de inicio" value={kickoffDate} />}
          {pmName && (
            <InfoBox
              label="Tu punto de contacto en Cofoundy"
              value={senderEmail ? `${pmName} · ${senderEmail}` : pmName}
              href={senderEmail ? `mailto:${senderEmail}` : undefined}
            />
          )}
        </>
      )}

      <EmailHeading as="h2">¿Qué sigue?</EmailHeading>
      <ScopeList items={allSteps} />

      <EmailDivider />

      {calLink && (
        <>
          <EmailText>Si necesitas coordinar una llamada rápida en cualquier momento:</EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText variant="muted">
        Gracias por confiar en Cofoundy. Vamos a construir algo excelente juntos.
      </EmailText>
    </EmailLayout>
  );
}
