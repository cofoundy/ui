import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from '../../components/messaging/inputs/MessageComposer'

/**
 * The optional, additive props: controlled text, per-item `disabled`, visible
 * item labels, `data-*` on items, and classes for the box and the textarea.
 *
 * Each block pairs the new behaviour with the default it must NOT change, so
 * "the prop works" can't be confused with "the default moved".
 */
describe('MessageComposer — controlled value', () => {
  function Host({ initial = '', onSend = vi.fn() }: { initial?: string; onSend?: (m: string) => void }) {
    const [value, setValue] = useState(initial)
    return (
      <>
        <MessageComposer value={value} onValueChange={setValue} onSend={onSend} sendLabel="Send" />
        <button type="button" onClick={() => setValue('escrito por el padre')}>
          write
        </button>
        <output data-testid="mirror">{value}</output>
      </>
    )
  }

  it('renders the value the parent writes, without an input event', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'write' }))
    expect(screen.getByPlaceholderText('Type a message...')).toHaveValue('escrito por el padre')
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled()
  })

  it('reports typing through onValueChange', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.type(screen.getByPlaceholderText('Type a message...'), 'hola')
    expect(screen.getByTestId('mirror')).toHaveTextContent('hola')
  })

  it('sends the controlled text and asks the parent to clear it', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Host initial="  listo  " onSend={onSend} />)
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(onSend).toHaveBeenCalledWith('listo')
    expect(screen.getByTestId('mirror')).toHaveTextContent('')
    expect(screen.getByPlaceholderText('Type a message...')).toHaveValue('')
  })

  it('a controlled value the parent refuses to clear stays put', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageComposer value="fijo" onValueChange={() => {}} onSend={onSend} sendLabel="Send" />)
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(onSend).toHaveBeenCalledWith('fijo')
    expect(screen.getByPlaceholderText('Type a message...')).toHaveValue('fijo')
  })

  it('uncontrolled (default) still owns its text and clears itself on send', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const onValueChange = vi.fn()
    render(<MessageComposer onSend={onSend} onValueChange={onValueChange} sendLabel="Send" />)
    const ta = screen.getByPlaceholderText('Type a message...')
    await user.type(ta, 'hola{Enter}')
    expect(onSend).toHaveBeenCalledWith('hola')
    expect(ta).toHaveValue('')
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })
})

describe('MessageComposer — toolbar item options', () => {
  const base = { id: 'x', icon: <span>★</span>, label: 'Redactar', onClick: vi.fn() }

  it('disables only the item that asks for it', () => {
    render(
      <MessageComposer
        onSend={vi.fn()}
        toolbarItems={[{ ...base, disabled: true }, { ...base, id: 'y', label: 'Otro' }]}
      />
    )
    expect(screen.getByTitle('Redactar')).toBeDisabled()
    expect(screen.getByTitle('Otro')).toBeEnabled()
  })

  it('the composer-wide disabled still wins over an item that is not disabled', () => {
    render(<MessageComposer onSend={vi.fn()} disabled toolbarItems={[base]} />)
    expect(screen.getByTitle('Redactar')).toBeDisabled()
  })

  it('shows the label as text only with showLabel', () => {
    const { rerender } = render(<MessageComposer onSend={vi.fn()} toolbarItems={[base]} />)
    expect(screen.getByTitle('Redactar')).not.toHaveTextContent('Redactar')
    rerender(<MessageComposer onSend={vi.fn()} toolbarItems={[{ ...base, showLabel: true }]} />)
    expect(screen.getByTitle('Redactar')).toHaveTextContent('Redactar')
  })

  it('forwards data-* attributes and the item className', () => {
    render(
      <MessageComposer
        onSend={vi.fn()}
        toolbarItems={[{ ...base, className: 'acento', dataAttributes: { 'data-tour': 'composer-instruct' } }]}
      />
    )
    const btn = screen.getByTitle('Redactar')
    expect(btn).toHaveAttribute('data-tour', 'composer-instruct')
    expect(btn).toHaveClass('acento')
  })
})

describe('MessageComposer — box and textarea classes', () => {
  it('appends the classes without dropping the defaults', () => {
    render(<MessageComposer onSend={vi.fn()} inputContainerClassName="borrador" textareaClassName="ta-borrador" />)
    const ta = screen.getByPlaceholderText('Type a message...')
    expect(ta).toHaveClass('ta-borrador', 'w-full')
    const box = ta.closest('form')!.parentElement!
    expect(box).toHaveClass('borrador', 'rounded-xl')
  })
})
