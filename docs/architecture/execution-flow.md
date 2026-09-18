# Flux d'exécution du code

## Flux nominal

```text
Utilisateur
    │
    │ Submit code
    ▼
   API
    │
    ▼
Exercise Service
    │
    ▼
Execution Service
    │
    ▼
Python Sandbox
    │
    ▼
Test Runner
    │
    ▼
Execution Result
    │
    ▼
Feedback
    │
    ▼
Utilisateur
```

## Résultats possibles
SUCCESS
WRONG_ANSWER
SYNTAX_ERROR
RUNTIME_ERROR
TIMEOUT
EXECUTION_ERROR