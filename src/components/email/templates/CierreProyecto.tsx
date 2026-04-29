import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { ScopeList } from '../components/ScopeList';
import { NextStepCallout } from '../components/NextStepCallout';
import { colors } from '../constants';

export interface CierreProyectoProps {
  clientName?: string;
  projectName: string;
  deliverables?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  calLink?: string;
  testMode?: boolean;
}

export function CierreProyecto({
  clientName,
  projectName,
  deliverables,
  liveUrl,
  caseStudyUrl,
  calLink,
  testMode = false,
}: CierreProyectoProps) {
  return (
    <EmailLayout
      title={`Proyecto ${projectName} completado — Cofoundy`}
      heading="Proyecto entregado con éxito"
      subtitle={projectName}
      previewText={`El proyecto ${projectName} está completado y entregado`}
      testMode={testMode}
    >
      <EmailText variant="greeting">Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        El proyecto <strong style={{ color: colors.textDark }}>{projectName}</strong> está completado y entregado.
        Fue un placer construirlo contigo.
      </EmailText>

      {deliverables && deliverables.length > 0 && (
        <>
          <EmailHeading as="h2">Entregables finales</EmailHeading>
          <ScopeList items={deliverables} />
        </>
      )}

      {liveUrl && <InfoBox label="Tu proyecto en línea" value={liveUrl} href={liveUrl} />}

      <EmailDivider />

      <NextStepCallout label="¿Qué sigue?">
        En los próximos 30 días te haremos seguimiento para asegurarnos de que todo
        funciona correctamente y explorar cómo podemos seguir apoyándote.
      </NextStepCallout>

      {caseStudyUrl && (
        <EmailText>
          Si estás de acuerdo, nos gustaría compartir tu caso con nuestra comunidad.{' '}
          <Link href={caseStudyUrl} style={linkStyle}>Ver borrador del caso de éxito</Link>
        </EmailText>
      )}

      {calLink && (
        <>
          <EmailText style={{ marginTop: '16px' }}>
            ¿Tienes un nuevo proyecto en mente o quieres coordinar el seguimiento?
          </EmailText>
          <EmailButton href={calLink}>Agendar llamada de cierre</EmailButton>
        </>
      )}

      <EmailText variant="muted">
        Gracias por confiar en Cofoundy. Nos vemos en el próximo.
      </EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.primary, textDecoration: 'underline' };
