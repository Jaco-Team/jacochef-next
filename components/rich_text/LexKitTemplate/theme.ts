// components/rich_text/LexKitTemplate/theme.ts
export interface LexKitTheme {
  background?: string;
  text?: string;
  border?: string;
  toolbar?: {
    background?: string;
    border?: string;
    button?: string;
    active?: string;
  };
}

import type { EditorThemeClasses } from "lexical";

export const defaultTheme: EditorThemeClasses = {
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
  },
  list: {
    listitem: "editor-listitem",
    nested: { listitem: "editor-nested-listitem" },
    olDepth: ["editor-ol1", "editor-ol2", "editor-ol3"],
  },
  link: "editor-link",
  code: "editor-code",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    code: "editor-text-code",
  },
};
