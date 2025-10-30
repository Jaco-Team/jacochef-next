"use client";

import { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

const TextEditor = ({ placeholder, value, onChange }) => {
  const editor = useRef(null);
  const [content, setContent] = useState(value);

  const config = useMemo(
    () => ({
      theme: "classic",
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder || "Начните печатать...",
      buttons: [
        "undo",
        "redo",
        "|",
        "paragraph",
        "bold",
        "italic",
        "strikethrough",
        "ul",
        "ol",
        "|",
        "eraser",
        "|",
        "align",
        "font",
        "fontsize",
        "brush",
        "|",
        "link",
        "image",
        "speechRecognize",
        "|",
        "source",
        "print",
        "fullsize",
      ],
    }),
    [placeholder],
  );

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      tabIndex={1} // tabIndex of textarea
      onBlur={onChange} // preferred to use only this option to update the content for performance reasons
      onChange={(c) => setContent(c)}
    />
  );
};

export default TextEditor;
