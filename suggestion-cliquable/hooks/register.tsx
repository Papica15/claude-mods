import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// Dernière suggestion proposée par l'application, ou null quand il n'y en a pas.
const suggestion = atom({ plugin: 'suggestion-cliquable', key: 'texte' } as const, null)

const LONGUEUR_MAX = 80

// Version courte, sur une ligne, pour l'étiquette du bouton ; le clic colle le texte entier.
const resume = (texte: string): string => {
  const ligne = texte.replace(/\s+/g, ' ').trim()
  return ligne.length > LONGUEUR_MAX ? `${ligne.slice(0, LONGUEUR_MAX - 1)}…` : ligne
}

export const register: Register = on => {
  // Chaque suggestion de l'application est gardée ; elle reste aussi affichée en gris, comme avant.
  on('prompt.suggest', async ($, e, next) => {
    const result = await next(e)

    if (e.text.trim() !== '') {
      await update($, suggestion, () => e.text).catch(() => undefined)
    }

    return result
  })

  // Un message envoyé rend la suggestion périmée : la bande disparaît jusqu'à la suivante.
  on('prompt.submit', ($, e, next) => {
    void update($, suggestion, () => null).catch(() => undefined)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const texte = await read($, suggestion)

    if (e.props.hasSurvey || texte === null) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>Suggestion : </Text>
        <Button
          key="coller"
          variant="primary"
          label={`Coller « ${resume(texte)} »`}
          onPress={async () => {
            await $.prompt.fill({ text: texte, mode: 'insert' })
            await update($, suggestion, () => null)
          }}
        />
        <Button
          key="masquer"
          role="dismiss"
          label="Masquer"
          onPress={() => update($, suggestion, () => null)}
        />
      </Box>
    )
  })
}
