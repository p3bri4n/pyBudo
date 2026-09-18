# Stratégie de tests

## Objectif

Les tests doivent protéger le comportement attendu et empêcher les
régressions.

## Tests unitaires

Testent une unité de code isolée.

```python
def test_add_returns_sum():
    assert add(2, 3) == 5
```

Toute nouvelle fonctionnalité doit avoir les tests appropriés.
Une correction de bug doit idéalement ajouter un test de non-régression.