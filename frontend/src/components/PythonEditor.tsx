import { useState } from "react";
import { executePython } from "../services/pyodide/PyodideService";
import type {ExecutionResult} from "../interfaces/interfaces.ts";
import "./python-editor.css"
import {useTranslation} from "react-i18next";

export function PythonRunner() {
    const [code, setCode] = useState("print('Hello pyBudo!')");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
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

    return (
        <div className={"pythonEditor"}>
            <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
            />
            <button className={"btn-dojo"} onClick={runCode} disabled={loading}>
                {loading ? `${t("python-runner.execution")}` : `${t("python-runner.execute")}`}
            </button>

            <pre>{output}</pre>
        </div>
    );
}
