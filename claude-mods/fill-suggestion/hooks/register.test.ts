import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

// The engine's own guess after a turn, and a message the person typed.
const SUGGESTION = { kind: 'suggestion' } as const
const TYPED = { kind: 'composer' } as const

// The engine beneath the plugin: a prompt box holding `box.text`, and a
// record of every suggestion shown and every prompt submitted.
function engine(on: On) {
  const box = { text: '' }
  const shown: string[] = []
  const sent: string[] = []
  mock.store(on)
  on('prompt.read', () => ({ value: { text: box.text, cursor: box.text.length } }))
  on('prompt.fill', (_$, e) => {
    box.text = e.text
    return { isFilled: true }
  })
  on('prompt.suggest', (_$, e) => {
    shown.push(e.text)
    return { isShown: true }
  })
  on('prompt.submit', (_$, e) => {
    sent.push(e.text)
    return { text: e.text }
  })
  on('command.register', () => ({ value: { command: 'autofill' } }))
  return { box, shown, sent }
}

test('types the suggestion into the empty box and sends nothing', async ($, on) => {
  const { box, shown, sent } = engine(on)
  const result = await $.prompt.suggest({ text: 'run the tests', origin: SUGGESTION })
  expect(box.text).toBe('run the tests')
  expect(result.isShown).toBe(false)
  expect(shown).toEqual([])
  expect(sent).toEqual([])
})

test('leaves a box you already typed in alone', async ($, on) => {
  const { box } = engine(on)
  box.text = 'my own words'
  await $.prompt.suggest({ text: 'run the tests', origin: SUGGESTION })
  expect(box.text).toBe('my own words')
})

test('/autofill off goes back to the dim suggestion', async ($, on) => {
  const { box, shown } = engine(on)
  on('command.run', () => ({ text: '' }))
  await $.command.run({
    command: 'autofill',
    args: 'off',
    origin: TYPED,
    presentation: { isFullscreen: false, columns: 80 },
  })
  await $.prompt.suggest({ text: 'run the tests', origin: SUGGESTION })
  expect(box.text).toBe('')
  expect(shown).toEqual(['run the tests'])
})
