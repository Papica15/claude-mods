import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// Vrai dès que l'application transmet ses propres suggestions (terminal) : elle
// les montre alors elle-même dans la zone de saisie, et le mod n'a rien à faire.
const viaApplication = atom({ plugin: 'suggestion-cliquable', key: 'application' } as const, false)
// Dernier message écrit par la personne, pour donner le contexte au modèle.
const dernierMessage = atom({ plugin: 'suggestion-cliquable', key: 'dernier' } as const, '')
// Augmente à chaque message envoyé : une suggestion arrivée trop tard est ignorée.
const tour = atom({ plugin: 'suggestion-cliquable', key: 'tour' } as const, 0)
// Vrai quand le tour en cours vient d'un message système et non de la personne :
// le mod n'écrit rien après, pour ne pas empiler deux suggestions.
const tourSysteme = atom({ plugin: 'suggestion-cliquable', key: 'systeme' } as const, false)

const EXTRAIT_MAX = 4000

// Dans une session dans le nuage, la suggestion de l'application ne passe pas
// par les mods : le mod en devine une lui-même à la fin de chaque réponse.
const CONSIGNE = [
  "Tu devines le prochain message qu'une personne va envoyer à son assistant.",
  "Réponds uniquement par ce message, tel qu'elle l'écrirait : une seule phrase courte",
  '(15 mots au plus), dans la langue de la personne, sans guillemets ni explication.',
].join(' ')

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
    if (e.origin.kind === 'suggestion') {
      await update($, viaApplication, () => true).catch(() => undefined)
    }

    return next(e)
  })

  on('prompt.submit', ($, e, next) => {
    void update($, tour, n => n + 1).catch(() => undefined)
    void update($, tourSysteme, () => e.isMeta === true).catch(() => undefined)

    if (e.isMeta !== true) {
      void update($, dernierMessage, () => e.text).catch(() => undefined)
    }

    return next(e)
  })

  // À la fin d'une réponse de Claude, le mod écrit sa suggestion dans la zone de saisie.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId !== undefined || e.reason !== 'answer' || e.answer.trim() === '') {
      return result
    }

    const answer = e.answer

    void (async () => {
      if ((await read($, viaApplication)) || (await read($, tourSysteme))) {
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

      if (texte === '') {
        return
      }

      const ecrit = await $.prompt.fill({ text: texte, mode: 'insert' })
      $.ui.log(`suggestion écrite : ${ecrit.isFilled}`, { to: 'debug' })
    })().catch(() => undefined)

    return result
  })
}
