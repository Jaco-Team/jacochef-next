"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const TextEditorInner = dynamic(
  async () => {
    await import("tinymce/tinymce");
    await import("tinymce/icons/default");
    await import("tinymce/themes/silver");
    await import("tinymce/models/dom");

    // plugins
    await import("tinymce/plugins/advlist");
    await import("tinymce/plugins/autolink");
    await import("tinymce/plugins/lists");
    await import("tinymce/plugins/link");
    await import("tinymce/plugins/image");
    await import("tinymce/plugins/charmap");
    await import("tinymce/plugins/preview");
    await import("tinymce/plugins/anchor");
    await import("tinymce/plugins/searchreplace");
    await import("tinymce/plugins/visualblocks");
    await import("tinymce/plugins/code");
    await import("tinymce/plugins/fullscreen");
    await import("tinymce/plugins/insertdatetime");
    await import("tinymce/plugins/media");
    await import("tinymce/plugins/table");
    await import("tinymce/plugins/help");
    await import("tinymce/plugins/wordcount");

    const { Editor } = await import("@tinymce/tinymce-react");

    return function TextEditor(props) {
      useEffect(() => {
        const handler = (e) => {
          if (
            e.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root") !== null
          ) {
            e.stopImmediatePropagation();
          }
        };
        document.addEventListener("focusin", handler);
        return () => document.removeEventListener("focusin", handler);
      }, []);
      return (
        <Editor
          apiKey="q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj"
          value={props.value}
          disabled={props.disabled}
          onEditorChange={props.func}
          init={{
            license_key: "gpl",
            language: "ru",
            language_load: false,
            language_url: "/tinymce/langs/ru.js",
            height: 500,
            promotion: false,
            branding: false,
            skin_url: "/tinymce/skins/ui/oxide",
            content_css: "/tinymce/skins/ui/oxide/content.css",
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              // "help",
              "wordcount",
            ],
            toolbar:
              "undo redo | blocks | bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | link image | code fullscreen help",
            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />
      );
    };
  },
  { ssr: false },
);

export default TextEditorInner;
