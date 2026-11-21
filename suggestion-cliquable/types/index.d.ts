// Texte de la suggestion affichée dans la bande, ou null quand il n'y en a pas.
export type TexteSuggestion = string | null

declare module 'claude-code' {
  interface PluginState {
    'suggestion-cliquable': {
      texte: TexteSuggestion
      // Vrai dès que l'application transmet ses propres suggestions au mod.
      application: boolean
      // Dernier message écrit par la personne, pour deviner le suivant.
      dernier: string
      // Augmente à chaque message envoyé : une suggestion arrivée trop tard est ignorée.
      tour: number
    }
  }
}
