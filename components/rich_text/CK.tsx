"use client";
import { CKEditor } from "@ckeditor/ckeditor5-react";

// interface mismatch hack
import ClassicEditorType from "@ckeditor/ckeditor5-build-classic";
import { EditorWatchdog, ContextWatchdog } from "@ckeditor/ckeditor5-watchdog";
const ClassicEditor = ClassicEditorType as unknown as {
  create(...args: any[]): Promise<any>;
  EditorWatchdog: typeof EditorWatchdog;
  ContextWatchdog: typeof ContextWatchdog;
};

export default function TextEditor({ value, onChange }) {
  return (
    <div style={{ height: 500 }}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          language: "ru",
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "link",
            "imageUpload",
            "insertTable",
            "mediaEmbed",
            "codeBlock",
            "|",
            "bulletedList",
            "numberedList",
            "outdent",
            "indent",
            "|",
            "alignment",
            "blockQuote",
            "removeFormat",
            "sourceEditing",
          ],
          table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  );
}
