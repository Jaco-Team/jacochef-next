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
      const {
        value,
        disabled,
        func,
        height,
        menubar,
        toolbar,
        plugins,
        contentStyle,
        init,
        variant = "default",
      } = props;

      const defaultPlugins = [
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
        "wordcount",
      ];

      const isNewsDialog = variant === "newsDialog";
      const isNewsDialogMobile = variant === "newsDialogMobile";
      const isNewsEditorVariant = isNewsDialog || isNewsDialogMobile;

      const editorInit = {
        license_key: "gpl",
        language: "ru",
        language_load: false,
        language_url: "/tinymce/langs/ru.js",
        height: height ?? (isNewsDialogMobile ? 520 : isNewsDialog ? 310 : 500),
        promotion: false,
        branding: false,
        skin_url: "/tinymce/skins/ui/oxide",
        content_css: "/tinymce/skins/ui/oxide/content.css",
        menubar:
          menubar ?? (isNewsEditorVariant ? "file edit view insert format tools table" : true),
        plugins: plugins ?? defaultPlugins,
        toolbar:
          toolbar ??
          (isNewsDialogMobile
            ? "undo redo | bold italic forecolor | alignleft | removeformat"
            : isNewsDialog
              ? "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat"
              : "undo redo | blocks | bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | link image | code fullscreen help"),
        toolbar_mode: isNewsEditorVariant ? "wrap" : "sliding",
        statusbar: true,
        resize: isNewsDialogMobile ? false : isNewsDialog ? "vertical" : true,
        content_style:
          contentStyle ??
          "body { font-family:Roboto, Helvetica, Arial, sans-serif; font-size:16px; line-height:20px; color:#3C3B3B; margin:12px; }",
        ...(isNewsDialogMobile
          ? {
              mobile: {
                menubar: "file edit view insert format tools table",
                toolbar: "undo redo | bold italic forecolor | alignleft | removeformat",
                toolbar_mode: "wrap",
                statusbar: true,
                plugins: defaultPlugins,
              },
            }
          : {}),
        ...init,
      };

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
        <>
          {isNewsEditorVariant ? (
            <style
              jsx
              global
            >{`
              .text-editor--news-dialog .tox-tinymce,
              .text-editor--news-dialog-mobile .tox-tinymce {
                border: 1px solid #e5e5e5;
                box-shadow: none;
                overflow: hidden;
              }

              .text-editor--news-dialog .tox-editor-header {
                background: #f3f3f3;
                box-shadow: none;
                padding: 2px;
              }

              .text-editor--news-dialog .tox-menubar,
              .text-editor--news-dialog .tox-toolbar-overlord,
              .text-editor--news-dialog .tox-toolbar__primary,
              .text-editor--news-dialog .tox-toolbar,
              .text-editor--news-dialog .tox-toolbar__overflow {
                background: #f3f3f3;
                box-shadow: none;
              }

              .text-editor--news-dialog .tox-menubar {
                padding: 0 2px 2px;
              }

              .text-editor--news-dialog .tox-toolbar-overlord {
                padding: 0 2px 2px;
              }

              .text-editor--news-dialog .tox-menubar + .tox-toolbar,
              .text-editor--news-dialog .tox-menubar + .tox-toolbar-overlord,
              .text-editor--news-dialog .tox-menubar + .tox-toolbar-overlord .tox-toolbar__primary,
              .text-editor--news-dialog .tox-toolbar,
              .text-editor--news-dialog .tox-toolbar__overflow,
              .text-editor--news-dialog .tox-toolbar__primary {
                background-image: none !important;
                border-top: 0 !important;
                margin-top: 0 !important;
              }

              .text-editor--news-dialog .tox-toolbar__primary {
                gap: 6px;
                padding: 0;
              }

              .text-editor--news-dialog .tox-toolbar__group {
                align-items: center;
                gap: 6px;
                margin: 0;
                padding: 0 2px;
                border: 0 !important;
              }

              .text-editor--news-dialog .tox-toolbar__group:not(:last-of-type) {
                border-right: 0 !important;
              }

              .text-editor--news-dialog .tox-label,
              .text-editor--news-dialog .tox-number-input,
              .text-editor--news-dialog .tox-split-button,
              .text-editor--news-dialog .tox-tbtn,
              .text-editor--news-dialog .tox-tbtn--select,
              .text-editor--news-dialog .tox-toolbar-label {
                margin: 0 !important;
              }

              .text-editor--news-dialog .tox-mbtn,
              .text-editor--news-dialog .tox-tbtn,
              .text-editor--news-dialog .tox-tbtn.tox-tbtn--select {
                min-height: 36px;
                border-radius: 8px;
                border: 0 !important;
                box-shadow: none;
              }

              .text-editor--news-dialog .tox-menubar .tox-mbtn {
                padding-inline: 6px;
                color: #5e5e5e;
                font-size: 14px;
                line-height: 16px;
              }

              .text-editor--news-dialog .tox-tbtn,
              .text-editor--news-dialog .tox-tbtn.tox-tbtn--select,
              .text-editor--news-dialog .tox-toolbar-textfield {
                background: #ffffff;
              }

              .text-editor--news-dialog .tox-tbtn--select {
                padding-inline: 6px;
              }

              .text-editor--news-dialog .tox-toolbar-textfield {
                min-height: 36px;
              }

              .text-editor--news-dialog .tox-tbtn svg,
              .text-editor--news-dialog .tox-mbtn__select-label,
              .text-editor--news-dialog .tox-mbtn__select-chevron,
              .text-editor--news-dialog .tox-tbtn__select-label,
              .text-editor--news-dialog .tox-tbtn__select-chevron {
                color: #5e5e5e;
                fill: #5e5e5e;
              }

              .text-editor--news-dialog .tox-edit-area {
                border-top: 1px solid #e5e5e5;
              }

              .text-editor--news-dialog .tox-edit-area__iframe {
                background: #ffffff;
              }

              .text-editor--news-dialog .tox-statusbar {
                min-height: 28px;
                padding: 4px 10px;
                border-top: 1px solid #e5e5e5;
                background: #ffffff;
                color: #5e5e5e;
              }

              .text-editor--news-dialog .tox-statusbar__path,
              .text-editor--news-dialog .tox-statusbar__branding {
                display: none;
              }

              .text-editor--news-dialog .tox-statusbar__wordcount {
                margin-left: auto;
                font-size: 12px;
                line-height: 16px;
                color: #5e5e5e;
              }

              .text-editor--news-dialog-mobile .tox-tinymce {
                border: 0;
                border-radius: 0;
                background: transparent;
              }

              .text-editor--news-dialog-mobile .tox-editor-header {
                background: #ffffff;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                box-shadow: none;
                margin-bottom: 12px;
                padding: 8px;
              }

              .text-editor--news-dialog-mobile .tox-menubar,
              .text-editor--news-dialog-mobile .tox-toolbar-overlord,
              .text-editor--news-dialog-mobile .tox-toolbar__primary,
              .text-editor--news-dialog-mobile .tox-toolbar,
              .text-editor--news-dialog-mobile .tox-toolbar__overflow {
                background: transparent;
                background-image: none !important;
                border-top: 0 !important;
                box-shadow: none;
                margin-top: 0 !important;
              }

              .text-editor--news-dialog-mobile .tox-menubar {
                display: flex !important;
                flex-wrap: wrap;
                gap: 0;
                justify-content: flex-start;
                padding: 0;
              }

              .text-editor--news-dialog-mobile .tox-toolbar-overlord {
                padding: 0;
              }

              .text-editor--news-dialog-mobile .tox-toolbar__primary {
                gap: 4px;
                padding: 0;
              }

              .text-editor--news-dialog-mobile .tox-toolbar__group {
                gap: 4px;
                margin: 0;
                padding: 0;
                border: 0 !important;
              }

              .text-editor--news-dialog-mobile .tox-toolbar__group:not(:last-of-type) {
                border-right: 0 !important;
              }

              .text-editor--news-dialog-mobile .tox-label,
              .text-editor--news-dialog-mobile .tox-number-input,
              .text-editor--news-dialog-mobile .tox-split-button,
              .text-editor--news-dialog-mobile .tox-tbtn,
              .text-editor--news-dialog-mobile .tox-tbtn--select,
              .text-editor--news-dialog-mobile .tox-toolbar-label {
                margin: 0 !important;
              }

              .text-editor--news-dialog-mobile .tox-mbtn {
                min-height: 32px;
                padding: 8px;
                border-radius: 8px;
                background: transparent !important;
                box-shadow: none !important;
                color: #5e5e5e;
                font-size: 14px;
                line-height: 16px;
              }

              .text-editor--news-dialog-mobile .tox-tbtn,
              .text-editor--news-dialog-mobile .tox-tbtn.tox-tbtn--select {
                min-height: 32px;
                padding-inline: 8px;
                border-radius: 8px;
                border: 0 !important;
                background: transparent;
                box-shadow: none;
              }

              .text-editor--news-dialog-mobile .tox-tbtn--select .tox-tbtn__select-label,
              .text-editor--news-dialog-mobile .tox-mbtn__select-label,
              .text-editor--news-dialog-mobile .tox-mbtn__select-chevron,
              .text-editor--news-dialog-mobile .tox-tbtn svg,
              .text-editor--news-dialog-mobile .tox-tbtn__select-chevron {
                color: #5e5e5e;
                fill: #5e5e5e;
              }

              .text-editor--news-dialog-mobile .tox-editor-container {
                background: #ffffff;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                overflow: hidden;
              }

              .text-editor--news-dialog-mobile .tox-edit-area {
                border-top: 0;
              }

              .text-editor--news-dialog-mobile .tox-edit-area__iframe {
                background: #ffffff;
              }

              .text-editor--news-dialog-mobile .tox-statusbar {
                min-height: 28px;
                padding: 4px 12px;
                border-top: 1px solid #e5e5e5;
                background: #ffffff;
                color: #5e5e5e;
              }

              .text-editor--news-dialog-mobile .tox-statusbar__path,
              .text-editor--news-dialog-mobile .tox-statusbar__branding {
                display: none;
              }

              .text-editor--news-dialog-mobile .tox-statusbar__wordcount {
                margin-left: auto;
                font-size: 12px;
                line-height: 16px;
                color: #5e5e5e;
              }
            `}</style>
          ) : null}

          <div
            className={
              isNewsDialogMobile
                ? "text-editor--news-dialog-mobile"
                : isNewsDialog
                  ? "text-editor--news-dialog"
                  : undefined
            }
          >
            <Editor
              apiKey="q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj"
              value={value}
              disabled={disabled}
              onEditorChange={func}
              init={editorInit}
            />
          </div>
        </>
      );
    };
  },
  { ssr: false },
);

export default TextEditorInner;
