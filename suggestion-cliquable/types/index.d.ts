// Texte de la dernière suggestion de l'application, ou null quand il n'y en a pas.
export type TexteSuggestion = string | null

declare module 'claude-code' {
  interface PluginState {
    'suggestion-cliquable': { texte: TexteSuggestion }
  }
}
