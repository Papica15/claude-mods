import { expect, mock, test } from 'claude-code/testing'

const USAGE = {
  input_tokens: 1,
  output_tokens: 1,
  cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0,
}

const FIN_DE_REPONSE = {
  answer: 'Voici les tests.',
  durationMs: 10,
  isAborted: false,
  turnId: 't1',
  reason: 'answer',
} as const

test("à la fin d'une réponse, le mod écrit sa suggestion dans la zone de saisie", async ($, on) => {
  const horloge = mock.clock(on)
  const demandes: string[] = []
  const ecrits: string[] = []
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('model.complete', (_, e) => {
    demandes.push(e.model)

    return { value: { isAnswered: true, text: '« Lance les tests »', usage: USAGE } }
  })
  on('prompt.fill', (_, e) => {
    ecrits.push(`${e.mode}:${e.text}`)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  await $.turn.complete(FIN_DE_REPONSE)
  await horloge.settle()

  expect(demandes).toEqual(['haiku'])
  expect(ecrits).toEqual(['insert:Lance les tests'])
})

test("quand l'application transmet sa suggestion, le mod n'écrit rien", async ($, on) => {
  const horloge = mock.clock(on)
  const demandes: string[] = []
  const ecrits: string[] = []
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('prompt.suggest', () => ({ isShown: true }))
  on('model.complete', (_, e) => {
    demandes.push(e.model)

    return { value: { isAnswered: true, text: 'Autre chose', usage: USAGE } }
  })
  on('prompt.fill', (_, e) => {
    ecrits.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  await $.prompt.suggest({ text: 'Lance les tests', origin: { kind: 'suggestion' } })
  await $.turn.complete(FIN_DE_REPONSE)
  await horloge.settle()

  expect(demandes).toEqual([])
  expect(ecrits).toEqual([])
})

test("sans réponse du modèle, rien n'est écrit", async ($, on) => {
  const horloge = mock.clock(on)
  const ecrits: string[] = []
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('model.complete', () => ({
    value: { isAnswered: false, reason: 'empty-reply', usage: USAGE },
  }))
  on('prompt.fill', (_, e) => {
    ecrits.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  await $.turn.complete(FIN_DE_REPONSE)
  await horloge.settle()

  expect(ecrits).toEqual([])
})
