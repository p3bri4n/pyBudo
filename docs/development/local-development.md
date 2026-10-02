# Développement local

## Objectif

Le développement local doit permettre à chaque développeur de lancer,
tester et debugger pyBudo sans dépendre d'un autre développeur.

## Configuration

Les paramètres locaux doivent être séparés du code versionné.

Exemple :

```text
APP_ENV=development
DATABASE_URL=...
```

## Recuperer les types depuis fastAPI:
npx openapi-typescript   http://localhost:8000/openapi.json   -o ./src/interfaces/tsschema.d.ts
