"use client";

import { useState, useEffect } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Extension } from "@tiptap/core";

/* ---- Font size extension ---- */
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize?.replace("px", ""),
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size:${attrs.fontSize}px` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) => {
          const px = size.endsWith("px") ? size : `${size}px`;
          return chain().setMark("textStyle", { fontSize: px }).run();
        },
    };
  },
});
/* ------------------------------ */

interface Props {
  value?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
}

export default function TextEditor({ value = "", placeholder, onChange }: Props) {
  const [content, setContent] = useState(value);
  useEffect(() => setContent(value), [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder: placeholder || "Начните печатать...",
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  const handleBlur = () => onChange?.(content);
  if (!editor) return null;

  const fontSizes = [12, 14, 16, 18, 24, 32];

  const startSpeech = () => {
    const SR = (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition unsupported");
    const rec = new SR();
    rec.lang = "ru-RU";
    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      editor.chain().focus().insertContent(text).run();
    };
    rec.start();
  };

  const printHTML = () => {
    const html = editor.getHTML();
    const win = window.open("", "_blank");
    win?.document.write(html);
    win?.document.close();
    win?.print();
  };

  const toggleFullscreen = () => {
    document.querySelector(".mantine-RichTextEditor-root")?.classList.toggle("fixed");
  };

  return (
    <RichTextEditor
      editor={editor}
      onBlur={handleBlur}
    >
      <RichTextEditor.Toolbar
        sticky
        stickyOffset={0}
      >
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.Control
            title="Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            ¶
          </RichTextEditor.Control>
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.Underline />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignRight />
          <RichTextEditor.AlignJustify />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.ColorPicker
            colors={[
              "#000000",
              "#666666",
              "#999999",
              "#FF0000",
              "#FF9900",
              "#FFFF00",
              "#00FF00",
              "#00FFFF",
              "#0000FF",
              "#9900FF",
            ]}
          />
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            defaultValue=""
            style={{
              background: "transparent",
              border: "none",
              fontSize: 13,
              padding: "2px 4px",
            }}
          >
            <option
              value=""
              disabled
            >
              Font
            </option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
          <select
            onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()}
            defaultValue=""
            style={{
              background: "transparent",
              border: "none",
              fontSize: 13,
              padding: "2px 4px",
            }}
          >
            <option
              value=""
              disabled
            >
              Size
            </option>
            {fontSizes.map((s) => (
              <option
                key={s}
                value={s}
              >
                {s}px
              </option>
            ))}
          </select>
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
          <RichTextEditor.Control
            title="Insert image"
            onClick={() => {
              const url = prompt("Image URL:");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            🖼
          </RichTextEditor.Control>
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Control
            title="Speech input"
            onClick={startSpeech}
          >
            🎙
          </RichTextEditor.Control>
          <RichTextEditor.Control
            title="View source"
            onClick={() => alert(editor.getHTML())}
          >
            {"</>"}
          </RichTextEditor.Control>
          <RichTextEditor.Control
            title="Print"
            onClick={printHTML}
          >
            🖨
          </RichTextEditor.Control>
          <RichTextEditor.Control
            title="Fullscreen"
            onClick={toggleFullscreen}
          >
            ⛶
          </RichTextEditor.Control>
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
