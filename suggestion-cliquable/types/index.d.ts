// Numéro du dernier message envoyé : une suggestion arrivée trop tard est ignorée.
export type TourSuggestion = number

declare module 'claude-code' {
  interface PluginState {
    'suggestion-cliquable': {
      // Vrai dès que l'application transmet ses propres suggestions au mod.
      application: boolean
      // Dernier message écrit par la personne, pour deviner le suivant.
      dernier: string
      tour: TourSuggestion
      // Vrai quand le tour en cours vient d'un message système.
      systeme: boolean
    }
  }
}
