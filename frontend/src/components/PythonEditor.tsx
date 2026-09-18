import { useState } from "react";
import { executePython } from "../services/pyodide/PyodideService";

export function PythonRunner() {
    const [code, setCode] = useState("print('Hello pyBudo!')");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    async function runCode() {
        setLoading(true);
        try {
            const result = await executePython(code);

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
        <div>
      <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
      />

            <button onClick={runCode} disabled={loading}>
                {loading ? "Exécution..." : "Exécuter"}
            </button>

            <pre>{output}</pre>
        </div>
    );
}
