import { describe, expect, it } from "vitest";
import { EditorSelection, EditorState, EditorView } from "@uiw/react-codemirror";
import { insertSpacesAtCursor, tabBehavior } from "./tabBehavior";

function createView(doc: string, selection: EditorSelection): EditorView {
    return new EditorView({ state: EditorState.create({ doc, selection, extensions: tabBehavior }), parent: document.body });
}

describe("tabBehavior", () => {
    it("Tab inserts spaces at the cursor up to the next tab stop", () => {
        const view = createView("x = 1", EditorSelection.single(1));
        insertSpacesAtCursor(view);
        expect(view.state.doc.toString()).toBe("x    = 1");
        expect(view.state.selection.main.head).toBe(4);
        view.destroy();
    })

    it("Tab indents the whole line when text is selected", () => {
        const view = createView("x = 1", EditorSelection.single(0, 1));
        insertSpacesAtCursor(view);
        expect(view.state.doc.toString()).toBe("    x = 1");
        view.destroy();
    })
})
