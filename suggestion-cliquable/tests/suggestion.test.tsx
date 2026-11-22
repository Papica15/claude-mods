import { expect, mock, test } from 'claude-code/testing'

const MESSAGE = { text: 'Bonjour', wait: false, origin: { kind: 'composer' } } as const

test("à chaque message, le mod demande à l'application de continuer à créer sa suggestion", async ($, on) => {
  const horloge = mock.clock(on)
  const reglages: string[] = []
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('env.get', () => ({ value: undefined }))
  on('env.set', (_, e) => {
    reglages.push(`${e.name}=${e.value}`)

    return { value: {} }
  })

  await $.prompt.submit(MESSAGE)
  await horloge.settle()

  expect(reglages).toEqual(['CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=1'])
})

test("un réglage déjà posé n'est pas remplacé", async ($, on) => {
  const horloge = mock.clock(on)
  const reglages: string[] = []
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('env.get', () => ({ value: '0' }))
  on('env.set', (_, e) => {
    reglages.push(`${e.name}=${e.value}`)

    return { value: {} }
  })

  await $.prompt.submit(MESSAGE)
  await horloge.settle()

  expect(reglages).toEqual([])
})

test("le mod n'écrit rien dans la zone de saisie", async ($, on) => {
  const horloge = mock.clock(on)
  const ecrits: string[] = []
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('env.get', () => ({ value: '1' }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('prompt.fill', (_, e) => {
    ecrits.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  await $.prompt.submit(MESSAGE)
  await $.turn.complete({
    answer: 'Voici les tests.',
    durationMs: 10,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
  await horloge.settle()

  expect(ecrits).toEqual([])
})
