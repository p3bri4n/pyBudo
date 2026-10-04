import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { executePython, isKataPassed, runKataTests } from "../services/pyodide/PyodideService";
import type {ExecutionResult, Kata, KataTestReport} from "../interfaces/interfaces.ts";
import "./python-editor.css"
import {useTranslation} from "react-i18next";
import { TAB_SIZE, tabBehavior } from "./tabBehavior";

const extensions = [python(), tabBehavior];

const DEFAULT_CODE = "print('Hello pyBudo!')";

type PythonRunnerProps = {
    initialCode?: string
    kata?: Kata
    onKataPassed?: (kata: Kata, code: string) => void
}

function formatValue(value: unknown): string {
    return JSON.stringify(value);
}

export function PythonRunner({initialCode = DEFAULT_CODE, kata, onKataPassed}: PythonRunnerProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<KataTestReport | null>(null);
    const {t} = useTranslation();

    async function runCode(): Promise<void> {
        setLoading(true);
        try {
            const result: ExecutionResult = await executePython(code);

            if (result.error) {
                setOutput(result.error);
                return;
            }

            setOutput(result.stdout);
        } catch (error) {
            setOutput(String(error));
        } finally {
            setLoading(false);
        }
    }

    async function testKata(kata: Kata): Promise<void> {
        setLoading(true);
        try {
            const testReport = await runKataTests(code, kata);
            setOutput(testReport.stdout ?? "");
            setReport(testReport);
            if (isKataPassed(testReport)) {
                onKataPassed?.(kata, code);
            }
        } catch (error) {
            setReport({error: String(error), results: []});
        } finally {
            setLoading(false);
        }
    }

    const passedCount = report?.results.filter((result) => result.passed).length ?? 0;

    return (
        <div className={"pythonEditor"}>
            <div className={"editorMain"}>
                <CodeMirror
                    className={"codeEditor"}
                    value={code}
                    height={"300px"}
                    theme={"dark"}
                    extensions={extensions}
                    onChange={setCode}
                    indentWithTab={false}
                    basicSetup={{ tabSize: TAB_SIZE }}
                />
                {/* Avec un kata sélectionné, Exécuter lance aussi les tests du kata */}
                <button className={"btn-dojo"} onClick={() => kata ? testKata(kata) : runCode()} disabled={loading}>
                    {loading ? `${t("python-runner.execution")}` : `${t("python-runner.execute")}`}
                </button>

                <pre>{output}</pre>
            </div>

            {report && (
                <div className={"testReport"}>
                    {report.error ? (
                        <p className={"testFailed"}>{report.error}</p>
                    ) : (
                        <>
                            <p className={isKataPassed(report) ? "testPassed" : "testFailed"}>
                                {isKataPassed(report)
                                    ? t("python-runner.kata-passed")
                                    : t("python-runner.tests-summary", {passed: passedCount, total: report.results.length})}
                            </p>
                            <ul className={"testResults"}>
                                {report.results.map((result, index) => (
                                    <li key={index} className={result.passed ? "testPassed" : "testFailed"}>
                                        <span>{result.passed ? "✅" : "❌"} </span>
                                        <code>({result.input.map(formatValue).join(", ")})</code>
                                        {" "}{t("python-runner.expected")} <code>{formatValue(result.expected)}</code>
                                        {!result.passed && (
                                            result.error
                                                ? <> — {t("python-runner.error")} <code>{result.error}</code></>
                                                : <> — {t("python-runner.got")} <code>{formatValue(result.got)}</code></>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
