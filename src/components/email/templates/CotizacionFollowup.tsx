import { EmailLayout } from '../components/EmailLayout';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { EmailHeading } from '../components/EmailHeading';
import { InfoBoxRow } from '../components/InfoBoxRow';
import { ScopeList } from '../components/ScopeList';
import { NextStepCallout } from '../components/NextStepCallout';

export interface CotizacionFollowupProps {
  clientName?: string;
  projectName?: string;
  scopeBullets?: string[];
  amount?: string;
  timeline?: string;
  nextStep?: string;
  calLink?: string;
  testMode?: boolean;
}

export function CotizacionFollowup({
  clientName,
  projectName,
  scopeBullets,
  amount,
  timeline,
  nextStep,
  calLink,
  testMode = false,
}: CotizacionFollowupProps) {
  return (
    <EmailLayout
      title={`Propuesta Cofoundy — ${projectName || clientName || ''}`}
      heading="Tu propuesta está lista"
      subtitle={projectName ? `Cotización para ${projectName}` : undefined}
      previewText={`Tu propuesta para ${projectName || 'tu proyecto'} está lista`}
      testMode={testMode}
    >
      <EmailText variant="greeting">
        Hola{clientName ? ` ${clientName}` : ''},
      </EmailText>
      <EmailText>
        Gracias por la conversación. Quedamos bien alineados en los objetivos
        y te comparto la propuesta formal que resume lo que acordamos.
      </EmailText>

      {scopeBullets && scopeBullets.length > 0 && (
        <>
          <EmailHeading as="h2">Lo que incluye</EmailHeading>
          <ScopeList items={scopeBullets} />
        </>
      )}

      {amount && timeline && (
        <InfoBoxRow
          items={[
            { label: 'Inversión total', value: amount },
            { label: 'Tiempo estimado', value: timeline },
          ]}
        />
      )}

      <EmailText>
        En el adjunto encontrarás el documento completo con el detalle de fases,
        entregables y condiciones de pago.
      </EmailText>

      <EmailDivider />

      {nextStep && (
        <NextStepCallout>
          {nextStep}
        </NextStepCallout>
      )}

      {calLink && (
        <>
          <EmailText style={{ marginTop: '32px' }}>¿Tienes preguntas?</EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText variant="muted">
        También puedes responder a este correo y te contesto a la brevedad.
      </EmailText>
    </EmailLayout>
  );
}
