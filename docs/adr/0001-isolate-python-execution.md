# ADR 0001 — Isoler l'exécution Python

## Status

Accepted

## Context

pyBudo doit exécuter du code Python fourni par les utilisateurs.

Ce code est considéré comme non fiable.

Une exécution directe dans le processus principal pourrait permettre
l'accès à des ressources auxquelles l'utilisateur ne doit pas avoir accès.

## Decision

Le code utilisateur sera exécuté dans un environnement isolé.

L'environnement devra notamment appliquer :

- timeout ;
- limite CPU ;
- limite mémoire ;
- filesystem restreint ;
- réseau désactivé par défaut ;
- absence des secrets de l'application.

## Alternatives

### Exécution directe

Simple mais insuffisamment isolée.

### Processus séparé

Améliore l'isolation mais ne constitue pas nécessairement une frontière
de sécurité suffisante.

### Sandbox isolé

**Plus complexe mais permet de mieux contrôler les ressources et accès.**

## Consequences

### Positives

- meilleure isolation ;
- contrôle des ressources ;
- réduction de l'impact d'une exécution malveillante.

### Négatives

- infrastructure plus complexe ;
- coût supplémentaire ;
- nécessité de surveiller le mécanisme d'isolation.

## Notes

Le mécanisme technique exact sera défini dans une décision ultérieure
si nécessaire.