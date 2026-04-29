import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface CierreProyectoProps {
  clientName?: string;
  projectName: string;
  deliverables?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}

export function CierreProyecto({
  clientName,
  projectName,
  deliverables,
  liveUrl,
  caseStudyUrl,
  calLink,
  signatureHtml,
  testMode = false,
}: CierreProyectoProps) {
  return (
    <EmailLayout
      title={`Proyecto ${projectName} completado — Cofoundy`}
      previewText={`El proyecto ${projectName} está completado y entregado`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Proyecto entregado con éxito</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        El proyecto <strong style={{ color: colors.navy }}>{projectName}</strong> está completado y entregado.
        Fue un placer construirlo contigo.
      </EmailText>

      {deliverables && deliverables.length > 0 && (
        <>
          <EmailHeading as="h2">Entregables finales</EmailHeading>
          <ul style={listStyle}>
            {deliverables.map((item, i) => (
              <li key={i} style={listItemStyle}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {liveUrl && <InfoBox label="Tu proyecto en línea" value={liveUrl} href={liveUrl} />}

      <EmailDivider />

      <EmailHeading as="h2">¿Qué sigue?</EmailHeading>
      <EmailText>
        En los próximos 30 días te haremos seguimiento para asegurarnos de que todo
        funciona correctamente y explorar cómo podemos seguir apoyándote.
      </EmailText>

      {caseStudyUrl && (
        <EmailText>
          Si estás de acuerdo, nos gustaría compartir tu caso con nuestra comunidad.{' '}
          <Link href={caseStudyUrl} style={linkStyle}>Ver borrador del caso de éxito</Link>
        </EmailText>
      )}

      {calLink && (
        <>
          <EmailText>¿Tienes un nuevo proyecto en mente o quieres coordinar el seguimiento?</EmailText>
          <EmailButton href={calLink}>Agendar llamada de cierre</EmailButton>
        </>
      )}

      <EmailText style={{ marginTop: '16px' }}>
        Gracias por confiar en Cofoundy. Nos vemos en el próximo.
      </EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.navyLight, textDecoration: 'underline' };
const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
