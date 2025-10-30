"use client";

import { RefObject, useEffect, useState } from "react";
import { Box, IconButton, Paper, Tooltip, Divider, useTheme } from "@mui/material";

import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  TableChart,
  Add,
  DeleteOutline,
} from "@mui/icons-material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CharacterCount from "@tiptap/extension-character-count";

// Highlight / Lowlight setup
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";

// Create one shared lowlight instance
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("xml", xml);
lowlight.register("css", css);
lowlight.register("json", json);
lowlight.register("typescript", typescript);

interface TextEditorProps {
  value: string;
  onChange: (html: string) => void;
  language?: string;
}

export function TextEditor({ value, onChange, language = "ru" }: TextEditorProps) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        lang: language,
        style: `
          font-family: Inter, Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 1.6;
        `,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!mounted || !editor) return null;

  const toolbarBtn = (icon: React.ReactNode, title: string, action: () => void, active = false) => (
    <Tooltip
      title={title}
      key={title}
    >
      <IconButton
        size="small"
        color={active ? "primary" : "default"}
        onClick={action}
        sx={{
          borderRadius: 1,
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)",
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          px: 1,
          py: 0.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
        }}
      >
        {toolbarBtn(<Undo fontSize="small" />, "Undo", () => editor.chain().focus().undo().run())}
        {toolbarBtn(<Redo fontSize="small" />, "Redo", () => editor.chain().focus().redo().run())}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1 }}
        />

        {toolbarBtn(
          <FormatBold fontSize="small" />,
          "Bold",
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
        )}
        {toolbarBtn(
          <FormatItalic fontSize="small" />,
          "Italic",
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
        )}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1 }}
        />

        {toolbarBtn(
          <FormatListBulleted fontSize="small" />,
          "Bullet list",
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList"),
        )}
        {toolbarBtn(
          <FormatListNumbered fontSize="small" />,
          "Numbered list",
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive("orderedList"),
        )}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1 }}
        />

        {toolbarBtn(
          <LinkIcon fontSize="small" />,
          "Add link",
          () =>
            editor
              .chain()
              .focus()
              .toggleLink({ href: prompt("URL?") || "" })
              .run(),
          editor.isActive("link"),
        )}
        {toolbarBtn(<ImageIcon fontSize="small" />, "Insert image", () =>
          editor
            .chain()
            .focus()
            .setImage({ src: prompt("Image URL?") || "" })
            .run(),
        )}
        {toolbarBtn(<Code fontSize="small" />, "Code block", () =>
          editor.chain().focus().toggleCodeBlock().run(),
        )}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1 }}
        />

        {toolbarBtn(<TableChart fontSize="small" />, "Insert table", () =>
          editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run(),
        )}
        {toolbarBtn(<Add fontSize="small" />, "Add row", () =>
          editor.chain().focus().addRowAfter().run(),
        )}
        {toolbarBtn(<DeleteOutline fontSize="small" />, "Delete table", () =>
          editor.chain().focus().deleteTable().run(),
        )}
      </Box>

      {/* Content area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 300,
          px: 2,
          py: 1.5,
          "& .ProseMirror": {
            outline: "none",
            minHeight: 280,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          fontSize: 13,
          px: 2,
          py: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.secondary,
        }}
      >
        Characters: {editor.storage.characterCount.characters()}
      </Box>
    </Paper>
  );
}
