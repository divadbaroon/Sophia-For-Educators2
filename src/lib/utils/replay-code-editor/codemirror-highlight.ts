import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

// Create highlight decoration with light yellow
export const highlightMark = Decoration.line({
  attributes: { style: "background-color: #fff9c4; animation: highlightPersist 5s forwards;" }
});

// State effect to add highlight
export const addHighlight = StateEffect.define<number>();

// State field to manage highlights
export const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    
    for (const effect of tr.effects) {
      if (effect.is(addHighlight)) {
        const line = tr.state.doc.line(effect.value);
        highlights = highlights.update({
          add: [highlightMark.range(line.from, line.from)]
        });
      }
    }
    
    return highlights;
  },
  provide: f => EditorView.decorations.from(f)
});

export const applyHighlight = (editorView: EditorView, lineNumber: number) => {
  try {
    editorView.dispatch({
      effects: addHighlight.of(lineNumber)
    });
  } catch (error) {
    console.error("❌ Error applying highlight:", error);
  }
};