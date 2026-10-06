import type {Kata, KataTestReport,} from "../../interfaces/interfaces.ts";

import { getPyodide } from "./pyodideRuntime";
import { getKataFunctionName } from "./PyodideService";

let kataRunnerLoaded = false;

const kataRunnerSource = `
def _run_kata_tests(code, function_name, tests_json):
    import json

    namespace = {}
    exec(code, namespace)

    function = namespace[function_name]
    tests = json.loads(tests_json)

    results = []

    for test in tests:
        try:
            got = function(*test["input"])
            expected = test["output"]

            results.append({
                "input": test["input"],
                "expected": expected,
                "got": got,
                "error": None,
                "passed": got == expected,
            })

        except Exception as error:
            results.append({
                "input": test["input"],
                "expected": test["output"],
                "got": None,
                "error": str(error),
                "passed": False,
            })

    return json.dumps({
        "error": None,
        "results": results,
    })
`;

export async function runWorkerTask(
    code: string,
    kata: Kata,
): Promise<KataTestReport> {
    const runtime = await getPyodide();

    const functionName = getKataFunctionName(kata.signature);

    if (!functionName) {
        return {
            error: `Invalid kata signature: ${kata.signature}`,
            results: [],
            stdout: "",
        };
    }

    if (!kataRunnerLoaded) {
        runtime.runPython(kataRunnerSource);
        kataRunnerLoaded = true;
    }

    let stdout = "";

    runtime.setStdout({
        batched: (text: string): void => {
            stdout += text + "\n";
        },
    });

    runtime.setStderr({
        batched: (text: string): void => {
            stdout += text + "\n";
        },
    });

    const runKataTestsPy = runtime.globals.get("_run_kata_tests");

    try {
        const report: string = runKataTestsPy(
            code,
            functionName,
            JSON.stringify(kata.tests),
        );

        return {
            ...JSON.parse(report),
            stdout,
        };
    } finally {
        runKataTestsPy.destroy();
    }
}
