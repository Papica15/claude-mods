import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'suggestion-cliquable',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 6,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 6 },
    view: {},
  },
} as const

test('la suggestion devient un bouton qui la colle dans la zone de saisie', async ($, on) => {
  const filled: string[] = []
  on('prompt.suggest', () => ({ isShown: true }))
  on('prompt.fill', (_, e) => {
    filled.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  for (const surface of ['desktop', 'mobile', 'terminal'] as const) {
    await $.prompt.suggest({ text: 'Lance les tests', origin: { kind: 'suggestion' } })
    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await ui.find({ key: 'coller' })).toBeDefined()
    await ui.press({ key: 'coller' })
    expect(await ui.find({ key: 'coller' })).toBeUndefined()
    await ui.unmount()
  }

  expect(filled).toEqual(['Lance les tests', 'Lance les tests', 'Lance les tests'])
})

test('sans suggestion, aucune bande', async $ => {
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})

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

test("sans suggestion de l'application, le mod en devine une à la fin d'une réponse", async ($, on) => {
  const filled: string[] = []
  const demandes: string[] = []
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('model.complete', (_, e) => {
    demandes.push(e.model)

    return { value: { isAnswered: true, text: '« Lance les tests »', usage: USAGE } }
  })
  on('prompt.fill', (_, e) => {
    filled.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  await $.turn.complete(FIN_DE_REPONSE)

  for (const surface of ['desktop', 'mobile', 'terminal'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    let bouton = await ui.find({ key: 'coller' })

    for (let essai = 0; bouton === undefined && essai < 50; essai += 1) {
      bouton = await ui.find({ key: 'coller' })
    }

    expect(bouton).toBeDefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'coller' })
  await ui.unmount()

  expect(demandes).toEqual(['haiku'])
  expect(filled).toEqual(['Lance les tests'])
})

test("quand l'application transmet sa suggestion, le mod ne devine rien", async ($, on) => {
  const demandes: string[] = []
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('prompt.suggest', () => ({ isShown: true }))
  on('model.complete', (_, e) => {
    demandes.push(e.model)

    return { value: { isAnswered: true, text: 'Autre chose', usage: USAGE } }
  })

  await $.prompt.suggest({ text: 'Lance les tests', origin: { kind: 'suggestion' } })
  await $.turn.complete(FIN_DE_REPONSE)

  for (let essai = 0; essai < 50; essai += 1) {
    await Promise.resolve()
  }

  expect(demandes).toEqual([])
})

test('la suggestion cliquable se termine par « > »', async ($, on) => {
  on('prompt.suggest', () => ({ isShown: true }))

  await $.prompt.suggest({ text: 'Résume le rapport', origin: { kind: 'suggestion' } })

  for (const surface of ['desktop', 'mobile', 'terminal'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    const bouton = await ui.find({ key: 'coller' })
    expect(bouton?.props.label).toBe('Résume le rapport >')
    await ui.unmount()
  }
})
