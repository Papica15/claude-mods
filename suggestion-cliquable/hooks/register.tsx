import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// Suggestion affichée dans la bande, ou null quand il n'y en a pas.
const suggestion = atom({ plugin: 'suggestion-cliquable', key: 'texte' } as const, null)
// Vrai dès que l'application transmet ses propres suggestions (terminal) :
// le mod n'a alors rien à deviner.
const viaApplication = atom({ plugin: 'suggestion-cliquable', key: 'application' } as const, false)
// Dernier message écrit par la personne, pour donner le contexte au modèle.
const dernierMessage = atom({ plugin: 'suggestion-cliquable', key: 'dernier' } as const, '')
// Augmente à chaque message envoyé : une suggestion arrivée trop tard est ignorée.
const tour = atom({ plugin: 'suggestion-cliquable', key: 'tour' } as const, 0)

const LONGUEUR_MAX = 80
const EXTRAIT_MAX = 4000

// Dans une session dans le nuage, la suggestion de l'application ne passe pas
// par les mods : le mod en devine une lui-même à la fin de chaque réponse.
const CONSIGNE = [
  "Tu devines le prochain message qu'une personne va envoyer à son assistant.",
  "Réponds uniquement par ce message, tel qu'elle l'écrirait : une seule phrase courte",
  '(15 mots au plus), dans la langue de la personne, sans guillemets ni explication.',
].join(' ')

// Version courte, sur une ligne, pour l'étiquette du bouton ; le clic colle le texte entier.
const resume = (texte: string): string => {
  const ligne = texte.replace(/\s+/g, ' ').trim()
  return ligne.length > LONGUEUR_MAX ? `${ligne.slice(0, LONGUEUR_MAX - 1)}…` : ligne
}

const extrait = (texte: string): string =>
  texte.length > EXTRAIT_MAX ? texte.slice(-EXTRAIT_MAX) : texte

const nettoie = (texte: string): string =>
  texte
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'«»“”]+|[\s"'«»“”]+$/g, '')
    .trim()

export const register: Register = on => {
  // La suggestion de l'application, quand elle arrive jusqu'au mod (terminal).
  on('prompt.suggest', async ($, e, next) => {
    const result = await next(e)

    if (e.origin.kind === 'suggestion') {
      await update($, viaApplication, () => true).catch(() => undefined)
    }

    if (e.text.trim() !== '') {
      await update($, suggestion, () => e.text).catch(() => undefined)
    }

    return result
  })

  // Un message envoyé rend la suggestion périmée : la bande disparaît jusqu'à la suivante.
  on('prompt.submit', ($, e, next) => {
    void update($, tour, n => n + 1).catch(() => undefined)

    if (e.isMeta !== true) {
      void update($, dernierMessage, () => e.text).catch(() => undefined)
    }

    void update($, suggestion, () => null).catch(() => undefined)

    return next(e)
  })

  // À la fin d'une réponse de Claude, le mod devine le prochain message.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId !== undefined || e.reason !== 'answer' || e.answer.trim() === '') {
      return result
    }

    const answer = e.answer

    void (async () => {
      if (await read($, viaApplication)) {
        return
      }

      const ceTour = await read($, tour)
      const prompt = [
        `Dernier message de la personne :\n${extrait(await read($, dernierMessage))}`,
        `Réponse de l'assistant :\n${extrait(answer)}`,
        'Prochain message de la personne :',
      ].join('\n\n')

      const reponse = await $.model.complete({
        model: 'haiku',
        system: CONSIGNE,
        prompt,
        maxTokens: 80,
        timeoutMs: 30_000,
      })

      if (!reponse.isAnswered) {
        $.ui.log(`suggestion non créée : ${reponse.reason}`, { to: 'debug' })

        return
      }

      if (ceTour !== (await read($, tour)) || (await read($, viaApplication))) {
        return
      }

      const texte = nettoie(reponse.text)

      if (texte !== '') {
        await update($, suggestion, () => texte)
        $.ui.log('suggestion créée', { to: 'debug' })
      }
    })().catch(() => undefined)

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const texte = await read($, suggestion)

    if (e.props.hasSurvey || texte === null) {
      return next(e)
    }

    const { Box, Button } = $.ui.resolve(e)

    // La suggestion elle-même, terminée par « > » : un toucher la colle.
    return (
      <Box>
        <Button
          key="coller"
          variant="primary"
          label={`${resume(texte)} >`}
          onPress={async () => {
            await $.prompt.fill({ text: texte, mode: 'insert' })
            await update($, suggestion, () => null)
          }}
        />
      </Box>
    )
  })
}
