"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
export default function TextEditor() {
  const editor = useCreateBlockNote();
  return (
    <BlockNoteView
      editor={editor}
      theme={"light"}
    />
  );
}
