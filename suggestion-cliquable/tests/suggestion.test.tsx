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

test('Masquer retire la bande sans rien coller', async ($, on) => {
  const filled: string[] = []
  on('prompt.suggest', () => ({ isShown: true }))
  on('prompt.fill', (_, e) => {
    filled.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  await $.prompt.suggest({ text: 'Résume le rapport', origin: { kind: 'suggestion' } })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'masquer' })
  expect(await ui.find({ key: 'coller' })).toBeUndefined()
  expect(filled).toEqual([])
  await ui.unmount()
})
