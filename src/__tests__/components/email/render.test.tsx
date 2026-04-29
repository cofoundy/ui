import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import { CotizacionFollowup } from '../../../components/email/templates/CotizacionFollowup';
import { Factura } from '../../../components/email/templates/Factura';
import { BienvenidaCliente } from '../../../components/email/templates/BienvenidaCliente';
import { CierreProyecto } from '../../../components/email/templates/CierreProyecto';
import { DevEntrega } from '../../../components/email/templates/DevEntrega';
import { ReminderPago } from '../../../components/email/templates/ReminderPago';
import { EnvioContrato } from '../../../components/email/templates/EnvioContrato';

describe('Email template rendering', () => {
  it('renders CotizacionFollowup to valid HTML', async () => {
    const html = await render(
      CotizacionFollowup({
        clientName: 'Test',
        projectName: 'Test Project',
        amount: 'S/1,000',
        timeline: '4 semanas',
        scopeBullets: ['Item 1', 'Item 2'],
        calLink: 'https://example.com',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Tu propuesta está lista');
    expect(html).toContain('Test Project');
    expect(html).toContain('S/1,000');
    expect(html).toContain('Item 1');
  });

  it('renders Factura to valid HTML', async () => {
    const html = await render(
      Factura({
        clientName: 'Test',
        invoiceNumber: 'F001-00001',
        amount: 'S/500',
        hasXml: true,
        hasCdr: true,
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('F001-00001');
    expect(html).toContain('XML firmado');
    expect(html).toContain('CDR');
  });

  it('renders BienvenidaCliente to valid HTML', async () => {
    const html = await render(
      BienvenidaCliente({
        clientName: 'Test',
        projectName: 'Test Project',
        kickoffDate: '1 de enero',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('¡Bienvenido, Test!');
    expect(html).toContain('Test Project');
  });

  it('renders CierreProyecto to valid HTML', async () => {
    const html = await render(
      CierreProyecto({
        projectName: 'Test Project',
        deliverables: ['Entregable 1'],
        liveUrl: 'https://example.com',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Proyecto entregado con éxito');
    expect(html).toContain('Entregable 1');
  });

  it('renders DevEntrega to valid HTML', async () => {
    const html = await render(
      DevEntrega({
        clientName: 'Test',
        featureName: 'Feature X',
        testUrl: 'https://staging.example.com',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Feature X');
    expect(html).toContain('staging.example.com');
  });

  it('renders ReminderPago to valid HTML', async () => {
    const html = await render(
      ReminderPago({
        amount: 'S/1,000',
        dueDate: '1 de enero',
        daysOverdue: 5,
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Recordatorio de pago pendiente');
    expect(html).toContain('5 días vencida');
  });

  it('renders EnvioContrato to valid HTML', async () => {
    const html = await render(
      EnvioContrato({
        clientName: 'Test',
        contractType: 'Acuerdo de Confidencialidad (NDA)',
        projectName: 'Test Project',
        keyPoints: ['Vigencia de 2 años', 'Bilateral'],
        signingDeadline: '5 de mayo, 2026',
        contactName: 'André Pacheco',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Tu contrato está listo');
    expect(html).toContain('NDA');
    expect(html).toContain('Vigencia de 2 años');
    expect(html).toContain('5 de mayo, 2026');
  });

  it('includes test banner when testMode is true', async () => {
    const html = await render(
      CotizacionFollowup({ testMode: true })
    );
    expect(html).toContain('MODO TEST');
  });

  it('omits test banner when testMode is false', async () => {
    const html = await render(
      CotizacionFollowup({ testMode: false })
    );
    expect(html).not.toContain('MODO TEST');
  });
});
