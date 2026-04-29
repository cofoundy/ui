import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { InfoBoxRow } from '../components/InfoBoxRow';
import { NextStepCallout } from '../components/NextStepCallout';

export interface ReminderPagoProps {
  clientName?: string;
  invoiceNumber?: string;
  amount: string;
  dueDate?: string;
  daysOverdue?: number;
  bdnAccount?: string;
  calLink?: string;
  testMode?: boolean;
}

export function ReminderPago({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  daysOverdue,
  bdnAccount,
  calLink,
  testMode = false,
}: ReminderPagoProps) {
  const dueDateDisplay = dueDate && daysOverdue && daysOverdue > 0
    ? `${dueDate} (${daysOverdue} días vencida)`
    : dueDate;

  return (
    <EmailLayout
      title={`Recordatorio de pago — ${invoiceNumber || 'Factura pendiente'}`}
      heading="Recordatorio de pago pendiente"
      subtitle={invoiceNumber || undefined}
      previewText={`Recordatorio: pago pendiente de ${amount}`}
      testMode={testMode}
    >
      <EmailText variant="greeting">Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Te escribimos para recordarte un pago pendiente correspondiente a los
        servicios de Cofoundy S.A.C.
      </EmailText>

      {invoiceNumber && dueDateDisplay ? (
        <InfoBoxRow
          items={[
            { label: 'Comprobante', value: invoiceNumber },
            { label: 'Monto pendiente', value: amount },
          ]}
        />
      ) : (
        <>
          {invoiceNumber && <InfoBox label="Comprobante" value={invoiceNumber} />}
          <InfoBox label="Monto pendiente" value={amount} />
        </>
      )}

      {dueDateDisplay && <InfoBox label="Fecha de vencimiento" value={dueDateDisplay} />}

      {bdnAccount && (
        <>
          <EmailHeading as="h2">Datos para el pago</EmailHeading>
          <EmailText>
            Si aún no has procesado la detracción SPOT, realiza el depósito a nuestra
            cuenta del Banco de la Nación:
          </EmailText>
          <InfoBox label="Cuenta BdN · Cofoundy S.A.C." value={bdnAccount} />
        </>
      )}

      <EmailDivider />

      <NextStepCallout label="Nota">
        Si ya realizaste el pago, por favor ignora este mensaje y envíanos la
        constancia para actualizar nuestros registros.
      </NextStepCallout>

      <EmailText style={{ marginTop: '16px' }}>
        Si tienes algún inconveniente o quieres coordinar una alternativa, no dudes
        en responder a este correo o contactarnos directamente.
      </EmailText>

      {calLink && <EmailButton href={calLink}>Coordinar llamada</EmailButton>}
    </EmailLayout>
  );
}
