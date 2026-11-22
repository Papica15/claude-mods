# claude-mods

Mods pour Claude Code.

## suggestion-cliquable

À la fin de chaque réponse de Claude, écrit une suggestion de prochain message directement dans la zone de saisie : il suffit de l'envoyer telle quelle, de la modifier ou de l'effacer. Si tu as commencé à écrire pendant la réponse, la suggestion s'ajoute à ton texte.

Dans le terminal, l'application montre déjà sa propre suggestion dans la zone de saisie (Tab pour la prendre) : le mod n'y touche pas. Dans les sessions dans le nuage suivies depuis l'application Claude (ordinateur ou mobile), cette suggestion ne parvient pas aux mods : le mod en crée donc une lui-même avec le modèle Haiku, ce qui ajoute un petit coût à chaque réponse.

Quand l'usage du compte approche de sa limite, l'application cesse de créer sa propre suggestion. Le mod lui demande de continuer (réglage `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION`, posé seulement s'il est absent) : la suggestion reste affichée, au prix d'un appel de plus au modèle à chaque réponse pendant cette période.

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
