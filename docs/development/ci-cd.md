# CI/CD

## Workflow

```text
1/feature/*
    │
    │ PR + CI + Review
    ▼
   dev
    │
    │ PR + CI + Review
    ▼
  main
```

La CI vérifie :
- Format
- Lint
- Type checking
- Tests