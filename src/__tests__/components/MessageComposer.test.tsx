import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from '../../components/messaging/inputs/MessageComposer'

/**
 * The send gate — and the twin assertion that gives it meaning.
 *
 * `allowEmptySend` exists because a customer on WhatsApp sends a photo with no
 * caption all the time. The composer knows nothing about attachments (it does
 * not render, count or validate them), so the prop is named after what the
 * composer itself does: it permits a send with an empty textarea. The parent
 * passes a LIVE value — true only while it has something else queued.
 *
 * Every "it enables" assertion below is paired with the direction that must NOT
 * change: without the prop, and with nothing queued, an empty composer is still
 * blocked. Without the pair, "enabled by an attachment" is indistinguishable
 * from "always enabled".
 */
describe('MessageComposer — send gate', () => {
  const onSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const sendButton = () => screen.getByRole('button', { name: /send/i })

  describe('default (no allowEmptySend) — the behaviour every existing consumer has', () => {
    it('disables send while the textarea is empty', () => {
      render(<MessageComposer onSend={onSend} sendLabel="Send" />)
      expect(sendButton()).toBeDisabled()
    })

    it('does not send on Enter with an empty textarea', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" />)

      await user.click(screen.getByPlaceholderText('Type a message...'))
      await user.keyboard('{Enter}')

      expect(onSend).not.toHaveBeenCalled()
    })

    it('does not send whitespace-only text', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" />)

      await user.type(screen.getByPlaceholderText('Type a message...'), '   ')

      expect(sendButton()).toBeDisabled()
      await user.keyboard('{Enter}')
      expect(onSend).not.toHaveBeenCalled()
    })

    it('still sends trimmed text', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" />)

      await user.type(screen.getByPlaceholderText('Type a message...'), '  hola  ')
      await user.click(sendButton())

      expect(onSend).toHaveBeenCalledWith('hola')
    })
  })

  describe('allowEmptySend', () => {
    it('enables send with an empty textarea', () => {
      render(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend />)
      expect(sendButton()).toBeEnabled()
    })

    it('calls onSend with the empty string — the composer invents no content', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend />)

      await user.click(sendButton())

      expect(onSend).toHaveBeenCalledWith('')
    })

    it('sends on Enter with an empty textarea', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend />)

      await user.click(screen.getByPlaceholderText('Type a message...'))
      await user.keyboard('{Enter}')

      expect(onSend).toHaveBeenCalledWith('')
    })

    it('still sends the text when there is text', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend />)

      await user.type(screen.getByPlaceholderText('Type a message...'), 'mira esto')
      await user.click(sendButton())

      expect(onSend).toHaveBeenCalledWith('mira esto')
    })

    it('clears the textarea after an empty send, so the next send is a fresh decision', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend />
      )

      await user.type(screen.getByPlaceholderText('Type a message...'), 'con foto')
      await user.click(sendButton())
      expect(onSend).toHaveBeenCalledWith('con foto')

      // The parent's queue is empty again once it consumed the send.
      rerender(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend={false} />)
      expect(screen.getByPlaceholderText('Type a message...')).toHaveValue('')
      expect(sendButton()).toBeDisabled()
    })

    it('does not override `disabled` — the parent can still shut the composer', async () => {
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend disabled />)

      expect(sendButton()).toBeDisabled()
      await user.click(sendButton())
      expect(onSend).not.toHaveBeenCalled()
    })
  })

  /*
   * `allowEmptySend` and `busy` landed within hours of each other and they meet
   * on the same gate, so the crossing gets its own tests: each feature's own
   * suite exercises it with the other one off, which is exactly where a bad
   * composition hides.
   *
   * The rule is `busy` wins. It encodes a product decision — no crossed
   * messages while the AI is dispatching — while `allowEmptySend` only says
   * "empty is legitimate content". A permission cannot outrank a prohibition.
   */
  describe('crossed with `busy`', () => {
    it('busy blocks the empty send too — no send button while the AI is dispatching', async () => {
      const user = userEvent.setup()
      const onStop = vi.fn()
      render(
        <MessageComposer
          onSend={onSend}
          sendLabel="Send"
          allowEmptySend
          busy
          onStop={onStop}
          stopLabel="Stop"
        />
      )

      expect(screen.queryByRole('button', { name: /send/i })).toBeNull()
      await user.click(screen.getByRole('button', { name: /stop/i }))
      expect(onStop).toHaveBeenCalledTimes(1)
      expect(onSend).not.toHaveBeenCalled()
    })

    it('busy swallows Enter even with allowEmptySend on', async () => {
      const user = userEvent.setup()
      render(
        <MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend busy stopLabel="Stop" />
      )

      await user.click(screen.getByPlaceholderText('Type a message...'))
      await user.keyboard('{Enter}')

      expect(onSend).not.toHaveBeenCalled()
    })

    it('once busy clears, the queued attachment can still go out with no text', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend busy stopLabel="Stop" />
      )

      rerender(<MessageComposer onSend={onSend} sendLabel="Send" allowEmptySend stopLabel="Stop" />)

      await user.click(sendButton())
      expect(onSend).toHaveBeenCalledWith('')
    })
  })
})
