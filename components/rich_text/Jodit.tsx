"use client";

import { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

const TextEditor = ({ placeholder, value, onChange }) => {
  const editor = useRef(null);
  const [content, setContent] = useState(value);

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder || "Start typings...",
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
