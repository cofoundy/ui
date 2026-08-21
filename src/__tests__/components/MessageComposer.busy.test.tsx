import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from '../../components/messaging/inputs/MessageComposer'

/**
 * El estado ocupado: mientras la IA despacha su respuesta, el operador no puede
 * mandar encima — pero sí puede seguir redactando.
 *
 * La regla de producto es "no hay mensajes cruzados". Eso hace que la aserción
 * que de verdad importa sea NEGATIVA ("Enter no envía"), y una aserción negativa
 * se cumple sola si el envío nunca era observable. Por eso cada bloqueo va
 * emparejado con su control positivo: el MISMO gesto, sin `busy`, sí manda.
 */
describe('MessageComposer — busy / stop', () => {
  const onSend = vi.fn()
  const onStop = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const PLACEHOLDER = 'Type a message...'
  const textarea = () => screen.getByPlaceholderText(PLACEHOLDER)

  describe('Enter mientras `busy`', () => {
    it('CONTROL POSITIVO: sin `busy`, Enter sí envía', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Enviar" />)

      await user.type(textarea(), 'hola')
      await user.keyboard('{Enter}')

      expect(onSend).toHaveBeenCalledWith('hola')
    })

    it('con `busy`, Enter NO envía', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      await user.type(textarea(), 'hola')
      await user.keyboard('{Enter}')

      expect(onSend).not.toHaveBeenCalled()
    })

    it('con `busy`, Enter tampoco mete un salto de línea en el borrador', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      await user.type(textarea(), 'hola')
      await user.keyboard('{Enter}')

      expect(textarea()).toHaveValue('hola')
    })

    it('Shift+Enter sigue haciendo salto de línea, con `busy` y sin él', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      await user.type(textarea(), 'hola')
      await user.keyboard('{Shift>}{Enter}{/Shift}')

      expect(onSend).not.toHaveBeenCalled()
      expect(textarea()).toHaveValue('hola\n')
    })

    it('con `busy`, un submit del form tampoco envía', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <MessageComposer onSend={onSend} sendLabel="Enviar" />
      )
      await user.type(textarea(), 'hola')

      // Control positivo primero: el mismo submit, sin busy, sí manda.
      fireEvent.submit(textarea().closest('form')!)
      expect(onSend).toHaveBeenCalledTimes(1)

      onSend.mockClear()
      rerender(
        <MessageComposer onSend={onSend} sendLabel="Enviar" busy onStop={onStop} />
      )
      await user.type(textarea(), 'otra vez')
      fireEvent.submit(textarea().closest('form')!)

      expect(onSend).not.toHaveBeenCalled()
    })
  })

  describe('el botón primario', () => {
    it('con `busy` es Parar, y Enviar ya no existe', () => {
      render(
        <MessageComposer
          onSend={onSend}
          sendLabel="Enviar"
          busy
          onStop={onStop}
          stopLabel="Parar"
        />
      )

      expect(screen.getByRole('button', { name: 'Parar' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Enviar' })).not.toBeInTheDocument()
    })

    it('llama a onStop al pulsarlo', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      await user.click(screen.getByRole('button', { name: 'Parar' }))

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('NUNCA se pone `disabled` mientras se está parando — solo aria-disabled', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      const stop = screen.getByRole('button', { name: 'Parar' })
      await user.click(stop)

      // Un control `disabled` se borra de su propio submit: el navegador arma
      // la entry list DESPUÉS de despachar el evento. Ya costó un incidente.
      expect(stop).not.toBeDisabled()
      expect(stop).toHaveAttribute('aria-disabled', 'true')
    })

    it('dos clics seguidos disparan onStop una sola vez', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      const stop = screen.getByRole('button', { name: 'Parar' })
      await user.click(stop)
      await user.click(stop)

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('tiene nombre accesible aunque el host no pase stopLabel', () => {
      render(<MessageComposer onSend={onSend} busy onStop={onStop} />)
      expect(screen.getByRole('button', { name: 'Parar' })).toBeInTheDocument()
    })
  })

  describe('el textarea sigue siendo del operador', () => {
    it('con `busy` se puede escribir', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} busy onStop={onStop} stopLabel="Parar" />)

      expect(textarea()).not.toBeDisabled()
      await user.type(textarea(), 'entro yo')
      expect(textarea()).toHaveValue('entro yo')
    })

    it('el borrador sobrevive a parar', async () => {
      const user = userEvent.setup()

      function Harness() {
        const [busy, setBusy] = useState(true)
        return (
          <MessageComposer
            onSend={onSend}
            busy={busy}
            onStop={() => setBusy(false)}
            stopLabel="Parar"
            sendLabel="Enviar"
          />
        )
      }
      render(<Harness />)

      await user.type(textarea(), 'lo sigo yo')
      await user.click(screen.getByRole('button', { name: 'Parar' }))

      expect(textarea()).toHaveValue('lo sigo yo')
      // Y el control vuelve a ser Enviar, ya habilitado por el texto escrito.
      expect(screen.getByRole('button', { name: 'Enviar' })).not.toBeDisabled()
    })
  })

  describe('busyLabel', () => {
    it('se anuncia como estado en vivo', () => {
      render(
        <MessageComposer
          onSend={onSend}
          busy
          onStop={onStop}
          busyLabel="Sofía está respondiendo…"
        />
      )

      const status = screen.getByRole('status')
      expect(status).toHaveTextContent('Sofía está respondiendo…')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('describe el textarea, para que el lector de pantalla diga por qué no se envía', () => {
      render(
        <MessageComposer
          onSend={onSend}
          busy
          onStop={onStop}
          busyLabel="Sofía está respondiendo…"
        />
      )

      expect(textarea()).toHaveAccessibleDescription('Sofía está respondiendo…')
    })
  })

  describe('`disabled` gana sobre `busy`', () => {
    it('con ambos, el compositor se comporta como deshabilitado: Enviar, no Parar', () => {
      render(
        <MessageComposer
          onSend={onSend}
          sendLabel="Enviar"
          disabled
          busy
          onStop={onStop}
          stopLabel="Parar"
          busyLabel="Sofía está respondiendo…"
        />
      )

      expect(screen.queryByRole('button', { name: 'Parar' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('sin `busy` — prueba de no-regresión', () => {
    it('no renderiza nada del estado ocupado', () => {
      render(<MessageComposer onSend={onSend} sendLabel="Enviar" />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Parar' })).not.toBeInTheDocument()
      expect(textarea()).not.toHaveAccessibleDescription()
    })

    it('Enviar sigue deshabilitado en vacío y habilitado con texto', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Enviar" />)

      expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
      await user.type(textarea(), 'hola')
      expect(screen.getByRole('button', { name: 'Enviar' })).not.toBeDisabled()
    })

    it('el click en Enviar manda el texto recortado y limpia el campo', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Enviar" />)

      await user.type(textarea(), '  hola  ')
      await user.click(screen.getByRole('button', { name: 'Enviar' }))

      expect(onSend).toHaveBeenCalledWith('hola')
      expect(textarea()).toHaveValue('')
    })
  })
})
