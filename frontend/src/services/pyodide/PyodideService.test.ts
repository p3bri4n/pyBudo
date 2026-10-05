import { describe, expect, it } from "vitest";
import { getKataFunctionName, isKataPassed } from "./PyodideService";
import type { KataTestResult } from "../../interfaces/interfaces.ts";

const passed: KataTestResult = {
    input: [1],
    expected: 1,
    got: 1,
    error: null,
    passed: true,
};

const failed: KataTestResult = {
    input: [1],
    expected: 1,
    got: 2,
    error: null,
    passed: false,
};

describe("getKataFunctionName", () => {
    it("Extracts the function name from the signature", () => {
        expect(
            getKataFunctionName(
                "def saluer(nom: str, salutation: str = 'Bonjour') -> str:"
            )
        ).toBe("saluer");
    });

    it("Returns null for an invalid signature", () => {
        expect(getKataFunctionName("saluer(nom)")).toBeNull();
    });
});

describe("isKataPassed", () => {
    it("Is true when every test passed", () => {
        expect(
            isKataPassed({
                error: null,
                results: [passed, passed],
                stdout: "",
            })
        ).toBe(true);
    });

    it("Is false when a test failed", () => {
        expect(
            isKataPassed({
                error: null,
                results: [passed, failed],
                stdout: "",
            })
        ).toBe(false);
    });

    it("Is false when the code raised an error", () => {
        expect(
            isKataPassed({
                error: "SyntaxError",
                results: [],
                stdout: "",
            })
        ).toBe(false);
    });

    it("Is false without any test", () => {
        expect(
            isKataPassed({
                error: null,
                results: [],
                stdout: "",
            })
        ).toBe(false);
    });

    it("Is false when execution times out", () => {
        expect(
            isKataPassed({
                error: "TIMEOUT",
                results: [],
                stdout: "",
            })
        ).toBe(false);
    });
});
