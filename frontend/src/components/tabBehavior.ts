import { EditorSelection, keymap, Prec, type Command } from "@uiw/react-codemirror";
import { indentLess, indentMore } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";

export const TAB_SIZE = 4;

// Tab inserts spaces at the cursor (up to the next tab stop) instead of indenting the whole line.
// With a selection, it still indents the selected lines.
export const insertSpacesAtCursor: Command = (view) => {
    const { state } = view;
    if (state.selection.ranges.some((range) => !range.empty)) {
        return indentMore(view);
    }

    view.dispatch(state.update(state.changeByRange((range) => {
        const column = range.head - state.doc.lineAt(range.head).from;
        const spaces = " ".repeat(TAB_SIZE - (column % TAB_SIZE));
        return {
            changes: { from: range.head, insert: spaces },
            range: EditorSelection.cursor(range.head + spaces.length),
        };
    }), { scrollIntoView: true, userEvent: "input" }));
    return true;
};

export const tabBehavior = [
    indentUnit.of(" ".repeat(TAB_SIZE)),
    Prec.high(keymap.of([{ key: "Tab", run: insertSpacesAtCursor, shift: indentLess }])),
];
