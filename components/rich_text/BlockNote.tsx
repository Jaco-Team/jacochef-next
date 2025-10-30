"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
export default function TextEditor({ onChange }) {
  const editor = useCreateBlockNote();
  return (
    <BlockNoteView
      editor={editor}
      theme={"light"}
      onChange={onChange}
    />
  );
}
