# claude-mods

Mods pour Claude Code.

## suggestion-cliquable

Propose un prochain message au-dessus de la zone de saisie, sous forme de suggestion cliquable terminée par « > ». Un clic colle le texte complet dans la zone de saisie, sans l'envoyer : il reste modifiable avant l'envoi. La suggestion disparaît dès qu'un message est envoyé.

Dans le terminal, le bouton reprend la suggestion automatique de l'application. Dans les sessions dans le nuage suivies depuis l'application Claude (ordinateur ou mobile), cette suggestion ne parvient pas aux mods : à la fin de chaque réponse de Claude, le mod en crée donc une lui-même avec le modèle Haiku, ce qui ajoute un petit coût à chaque réponse.

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
