import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { ScopeList } from '../components/ScopeList';
import { NextStepCallout } from '../components/NextStepCallout';
import { colors } from '../constants';

export interface DevEntregaProps {
  clientName?: string;
  projectName?: string;
  featureName?: string;
  testUrl?: string;
  notes?: string;
  reviewItems?: string[];
  nextStepsBullets?: string[];
  calLink?: string;
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
  testMode = false,
}: DevEntregaProps) {
  return (
    <EmailLayout
      title={`Entrega: ${featureName || 'Avance del proyecto'} — ${projectName || ''}`}
      heading="Entrega lista para revisión"
      subtitle={featureName || projectName || undefined}
      previewText={`${featureName || 'Avance'} listo para revisión`}
      testMode={testMode}
    >
      <EmailText variant="greeting">Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Terminamos de implementar{' '}
        <strong style={{ color: colors.textDark }}>{featureName || 'el avance solicitado'}</strong>
        {projectName && <> en <strong style={{ color: colors.textDark }}>{projectName}</strong></>}
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
          <ScopeList items={reviewItems} />
        </>
      )}

      {nextStepsBullets && nextStepsBullets.length > 0 && (
        <>
          <EmailHeading as="h2">Próximos pasos</EmailHeading>
          <ScopeList items={nextStepsBullets} />
        </>
      )}

      <EmailDivider />

      <NextStepCallout>
        Por favor revisa y danos tu feedback para proceder con los ajustes finales
        o confirmar la aprobación.
      </NextStepCallout>

      {calLink && (
        <>
          <EmailText style={{ marginTop: '16px' }}>Si prefieres revisar juntos en una llamada rápida:</EmailText>
          <EmailButton href={calLink}>Agendar revisión</EmailButton>
        </>
      )}
    </EmailLayout>
  );
}
