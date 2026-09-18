# Architecture — Vue d'ensemble

## Objectif

Décrire les composants principaux de pyBudo et leurs responsabilités.

## Architecture logique

```text
┌─────────────────┐
│     Frontend    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│       API       │
└────────┬────────┘
         │
    ┌────┴──────────────┐
    ▼                   ▼
┌─────────────┐   ┌───────────────┐
│   Exercise  │   │   Execution   │
│   Service   │   │    Service    │
└──────┬──────┘   └───────┬───────┘
       │                  │
       ▼                  ▼
   Database          Python Sandbox
```