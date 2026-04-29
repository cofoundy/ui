import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface DevEntregaProps {
  clientName?: string;
  projectName?: string;
  featureName?: string;
  testUrl?: string;
  notes?: string;
  reviewItems?: string[];
  nextStepsBullets?: string[];
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}

export function DevEntrega({
  clientName,
  projectName,
  featureName,
  testUrl,
  notes,
  reviewItems,
  nextStepsBullets,
  calLink,
  signatureHtml,
  testMode = false,
}: DevEntregaProps) {
  return (
    <EmailLayout
      title={`Entrega: ${featureName || 'Avance del proyecto'} — ${projectName || ''}`}
      previewText={`${featureName || 'Avance'} listo para revisión`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Entrega lista para revisión</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Terminamos de implementar{' '}
        <strong style={{ color: colors.navy }}>{featureName || 'el avance solicitado'}</strong>
        {projectName && <> en <strong style={{ color: colors.navy }}>{projectName}</strong></>}
        {' '}y está lista para tu revisión.
      </EmailText>

      {testUrl && <InfoBox label="Ambiente de revisión" value={testUrl} href={testUrl} />}
      {notes && (
        <>
          <EmailHeading as="h2">Notas de la entrega</EmailHeading>
          <EmailText>{notes}</EmailText>
        </>
      )}

      {reviewItems && reviewItems.length > 0 && (
        <>
          <EmailHeading as="h2">Puntos a revisar</EmailHeading>
          <ul style={listStyle}>
            {reviewItems.map((item, i) => (
              <li key={i} style={listItemStyle}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {nextStepsBullets && nextStepsBullets.length > 0 && (
        <>
          <EmailHeading as="h2">Próximos pasos</EmailHeading>
          <ul style={listStyle}>
            {nextStepsBullets.map((item, i) => (
              <li key={i} style={listItemStyle}>{item}</li>
            ))}
          </ul>
        </>
      )}

      <EmailDivider />

      <EmailText>
        Por favor revisa y danos tu feedback para proceder con los ajustes finales
        o confirmar la aprobación.
      </EmailText>

      {calLink && (
        <>
          <EmailText>Si prefieres revisar juntos en una llamada rápida:</EmailText>
          <EmailButton href={calLink}>Agendar revisión</EmailButton>
        </>
      )}
    </EmailLayout>
  );
}

const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
