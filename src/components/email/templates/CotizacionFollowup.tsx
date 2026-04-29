import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface CotizacionFollowupProps {
  clientName?: string;
  projectName?: string;
  scopeBullets?: string[];
  amount?: string;
  timeline?: string;
  nextStep?: string;
  calLink?: string;
  signatureHtml?: string;
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
  signatureHtml,
  testMode = false,
}: CotizacionFollowupProps) {
  return (
    <EmailLayout
      title={`Propuesta Cofoundy — ${projectName || clientName || ''}`}
      previewText={`Tu propuesta para ${projectName || 'tu proyecto'} está lista`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Tu propuesta está lista</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Gracias por la conversación. Quedamos bien alineados en los objetivos
        y te comparto la propuesta formal que resume lo que acordamos.
      </EmailText>

      {scopeBullets && scopeBullets.length > 0 && (
        <>
          <EmailHeading as="h2">Lo que incluye</EmailHeading>
          <ul style={listStyle}>
            {scopeBullets.map((bullet, i) => (
              <li key={i} style={listItemStyle}>{bullet}</li>
            ))}
          </ul>
        </>
      )}

      {amount && <InfoBox label="Inversión total" value={amount} />}
      {timeline && <InfoBox label="Tiempo estimado" value={timeline} />}

      <EmailText>
        En el adjunto encontrarás el documento completo con el detalle de fases,
        entregables y condiciones de pago.
      </EmailText>

      <EmailDivider />

      {nextStep && (
        <EmailText>
          <strong style={{ color: colors.navy }}>Próximo paso:</strong> {nextStep}
        </EmailText>
      )}

      {calLink && (
        <>
          <EmailText>
            ¿Tienes preguntas o quieres coordinar una llamada de revisión?
            Agenda directamente aquí:
          </EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText style={{ marginTop: '16px' }}>
        También puedes responder a este correo y te contesto a la brevedad.
      </EmailText>
    </EmailLayout>
  );
}

const listStyle: React.CSSProperties = {
  margin: '0 0 16px',
  paddingLeft: '22px',
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.7',
  fontFamily,
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '6px',
};
