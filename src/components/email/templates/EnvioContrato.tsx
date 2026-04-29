import { EmailLayout } from '../components/EmailLayout';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { EmailHeading } from '../components/EmailHeading';
import { InfoBox } from '../components/InfoBox';
import { InfoBoxRow } from '../components/InfoBoxRow';
import { ScopeList } from '../components/ScopeList';
import { NextStepCallout } from '../components/NextStepCallout';

export interface EnvioContratoProps {
  clientName?: string;
  contractType?: string;
  projectName?: string;
  keyPoints?: string[];
  signingDeadline?: string;
  contactName?: string;
  calLink?: string;
  testMode?: boolean;
}

export function EnvioContrato({
  clientName,
  contractType = 'Contrato de servicios',
  projectName,
  keyPoints,
  signingDeadline,
  contactName,
  calLink,
  testMode = false,
}: EnvioContratoProps) {
  const hasInfoRow = signingDeadline && contactName;

  return (
    <EmailLayout
      title={`${contractType} — Cofoundy`}
      heading="Tu contrato está listo"
      subtitle={contractType}
      previewText={`${contractType} adjunto para tu revisión y firma`}
      testMode={testMode}
    >
      <EmailText variant="greeting">
        Hola{clientName ? ` ${clientName}` : ''},
      </EmailText>
      <EmailText>
        Adjunto encontrarás el {contractType.toLowerCase()}
        {projectName ? ` correspondiente al proyecto ${projectName}` : ''}.
        Por favor revísalo con detenimiento antes de firmar.
      </EmailText>

      {keyPoints && keyPoints.length > 0 && (
        <>
          <EmailHeading as="h2">Puntos clave</EmailHeading>
          <ScopeList items={keyPoints} />
        </>
      )}

      {hasInfoRow ? (
        <InfoBoxRow
          items={[
            { label: 'Plazo de firma', value: signingDeadline! },
            { label: 'Tu contacto', value: contactName! },
          ]}
        />
      ) : signingDeadline ? (
        <InfoBox label="Plazo de firma" value={signingDeadline} />
      ) : null}

      <EmailDivider />

      <NextStepCallout>
        Revisa el documento adjunto, fírmalo y envíalo de vuelta respondiendo a este correo.
      </NextStepCallout>

      {calLink && (
        <>
          <EmailText style={{ marginTop: '32px' }}>¿Tienes dudas sobre alguna cláusula?</EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText variant="muted">
        También puedes responder a este correo con tus preguntas.
      </EmailText>
    </EmailLayout>
  );
}
