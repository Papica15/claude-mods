import type { EngineInterface, Register } from 'claude-code'

// La suggestion grise de la zone de saisie vient de l'application, et le mod n'y touche pas : il
// n'écrit aucune suggestion à sa place. Le moteur cesse de la créer dès que l'usage du compte passe
// en alerte, sauf si ce réglage lui demande de continuer : installer ce mod, c'est faire ce choix
// (le README le dit). Un réglage déjà posé, par la personne ou par l'environnement, n'est jamais
// remplacé. Il disparaît avec le moteur : le mod le repose à chaque message.
async function reactiverSuggestionApplication($: EngineInterface): Promise<void> {
  if ((await $.env.get('CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION')) !== undefined) {
    return
  }

  const reglage = await $.env.set('CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION', '1')
  const issue = reglage.deny === undefined ? 'acceptée' : `refusée (${reglage.deny})`

  $.ui.log(`réactivation de la suggestion de l'application : ${issue}`, { to: 'debug' })
}

export const register: Register = on => {
  on('prompt.submit', ($, e, next) => {
    void reactiverSuggestionApplication($).catch(() => undefined)

    return next(e)
  })
}
