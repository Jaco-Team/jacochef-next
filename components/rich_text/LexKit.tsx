"use client";

import React, { useEffect, useRef } from "react";
import {
  DefaultTemplate,
  DefaultTemplateRef,
} from "@/components/rich_text/LexKitTemplate/DefaultTemplate";

interface TextEditorProps {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}

export function TextEditor({ value, onChange, height = 500 }: TextEditorProps) {
  // must match the full type from your DefaultTemplate file
  const ref = useRef<DefaultTemplateRef>(null);

  // keep external value synced in
  useEffect(() => {
    const editor = ref.current;
    if (editor) {
      const current = editor.getHTML();
      if (normalize(current) !== normalize(value)) {
        editor.injectHTML(value);
      }
    }
  }, [value]);

  // basic poll loop (since DefaultTemplate has no onChange prop)
  useEffect(() => {
    const timer = setInterval(() => {
      const editor = ref.current;
      if (!editor) return;
      const html = editor.getHTML();
      onChange(html);
    }, 400);
    return () => clearInterval(timer);
  }, [onChange]);

  return (
    <div style={{ height }}>
      <DefaultTemplate
        ref={ref}
        onReady={(api) => {
          // ref already wired by forwardRef, but we ensure initial content
          api.injectHTML(value);
        }}
      />
    </div>
  );
}

function normalize(str: string) {
  return str.replace(/\s+/g, " ").trim();
}
