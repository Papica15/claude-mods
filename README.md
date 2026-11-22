# claude-mods

Mods pour Claude Code.

## suggestion-cliquable

Laisse l'application afficher sa propre suggestion grise dans la zone de saisie, sans la modifier : le mod n'écrit aucune suggestion à sa place.

Quand l'usage du compte approche de sa limite, l'application cesse de créer cette suggestion. Le mod lui demande de continuer (réglage `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION`, posé seulement s'il est absent) : la suggestion reste affichée, au prix d'un appel de plus au modèle à chaque réponse pendant cette période.

### Installation

Dans une session Claude Code au terminal :

```
/plugin install suggestion-cliquable --marketplace Papica15/claude-mods
```

Répondre `y` pour ajouter le catalogue, puis choisir la portée utilisateur avec Entrée.

Depuis un terminal :

```
claude plugin install suggestion-cliquable --marketplace Papica15/claude-mods
```

Dans l'application Claude sur ordinateur : cliquer sur + à côté de la zone de saisie, puis Plugins, ajouter le catalogue `Papica15/claude-mods`, puis ajouter le plugin `suggestion-cliquable`.

Pour les sessions dans le nuage : ajouter la commande `claude plugin install suggestion-cliquable --marketplace Papica15/claude-mods || true` au script de configuration de l'environnement. Elle s'exécute au démarrage de chaque nouvelle session.
