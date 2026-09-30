import json
import math


def _equal(got, expected):
    # bool est un sous-type de int en Python : True ne doit pas valoir 1
    if isinstance(got, bool) or isinstance(expected, bool):
        return got is expected
    # Tolérance sur les flottants (0.1 + 0.2 != 0.3)
    if isinstance(got, (int, float)) and isinstance(expected, (int, float)):
        return math.isclose(got, expected, rel_tol=1e-9, abs_tol=1e-9)
    if isinstance(got, list) and isinstance(expected, list):
        return len(got) == len(expected) and all(map(_equal, got, expected))
    if isinstance(got, dict) and isinstance(expected, dict):
        return got.keys() == expected.keys() and all(_equal(got[k], expected[k]) for k in got)
    return got == expected


def _run_test(func, test):
    try:
        # Aller-retour JSON : les clés de dict deviennent des str, comme dans les tests
        got = json.loads(json.dumps(func(*test["input"])))
        return {"got": got, "error": None, "passed": _equal(got, test["output"])}
    except Exception as e:
        return {"got": None, "error": f"{type(e).__name__}: {e}", "passed": False}


def _run_kata_tests(user_code, func_name, tests_json):
    namespace = {}
    try:
        exec(user_code, namespace)
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}", "results": []})

    func = namespace.get(func_name)
    if not callable(func):
        return json.dumps({"error": f"NameError: '{func_name}' is not defined", "results": []})

    results = [
        {"input": test["input"], "expected": test["output"], **_run_test(func, test)}
        for test in json.loads(tests_json)
    ]
    return json.dumps({"error": None, "results": results})
