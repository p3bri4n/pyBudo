# Sécurité

## Principe fondamental

Le code fourni par l'utilisateur doit être considéré comme non fiable.

## Objectifs

Une exécution utilisateur ne doit pas pouvoir :

- accéder aux secrets de l'application ;
- accéder librement au filesystem ;
- accéder au réseau sans autorisation ;
- consommer des ressources sans limite ;
- bloquer indéfiniment un worker ;
- compromettre l'application.

## Isolation

L'exécution doit être séparée du processus principal de pyBudo.

## Limites

Chaque exécution doit avoir :

- une limite de temps ;
- une limite CPU ;
- une limite mémoire ;
- une limite de stockage.

## Réseau

L'accès réseau doit être désactivé par défaut.

## Filesystem

L'accès au filesystem doit être limité au strict nécessaire.

## Secrets

Aucun secret de l'application ne doit être exposé à l'environnement
d'exécution utilisateur.

## Menaces

Les scénarios suivants doivent être considérés :

- boucle infinie ;
- consommation mémoire ;
- consommation CPU ;
- fork bomb ;
- accès filesystem ;
- accès réseau ;
- exécution de commandes système ;
- tentative d'évasion du sandbox ;
- récupération de secrets.

## Règle

Aucune solution d'exécution de code utilisateur ne doit être considérée
comme prête pour la production sans revue de sécurité.