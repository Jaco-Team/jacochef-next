"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import {
  ACCESS_BLOCK_ATTR,
  focusAccessBlockInEditor,
  getAccessBlockAtSelection,
  removeAccessBlockFromEditor,
  unwrapAccessAtSelection,
  wrapSelectionAsAccessBlock,
} from "./accessBlocks";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_ERROR = "Изображение больше 5 МБ";
const UPLOAD_ERROR = "Не удалось загрузить изображение";

const BASE_TOOLBAR =
  "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image table | removeformat | code fullscreen";
const ACCESS_TOOLBAR =
  "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image table | docaccess docaccessremove | removeformat | code fullscreen";

const ACCESS_CONTENT_STYLE = `
body { font-family: Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #2B2B2B; margin: 16px; }
.doc-access-block {
  position: relative;
  border-left: 3px solid #dd1a32;
  background: #fff7f8;
  padding: 28px 12px 8px;
  margin: 12px 0;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(221, 26, 50, 0.18);
}
.doc-access-block::before {
  content: "Ограниченный доступ · «Снять ограничение» в панели";
  position: absolute;
  top: 6px;
  left: 12px;
  right: 12px;
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: #dd1a32;
  pointer-events: none;
}
.doc-access-block.is-active {
  box-shadow: inset 0 0 0 1px #dd1a32;
  background: #fff1f3;
}
`;

const DocumentationEditorInner = dynamic(
  async () => {
    const tinymce = (await import("tinymce/tinymce")).default;
    await import("tinymce/icons/default");
    await import("tinymce/themes/silver");
    await import("tinymce/models/dom");
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
    await import("tinymce/plugins/table");
    await import("tinymce/plugins/wordcount");

    const { Editor } = await import("@tinymce/tinymce-react");

    return function DocumentationEditor({
      value,
      onChange,
      onUploadImage,
      height = 640,
      activeBlockId = null,
      accessBlocksEnabled = false,
      commandRef = null,
      onAccessError,
      onAccessCreated,
      onAccessRemoved,
      onActivateBlock,
    }) {
      const editorRef = useRef(null);
      const callbackRef = useRef({});
      const activeBlockIdRef = useRef(activeBlockId);
      callbackRef.current = { onAccessError, onAccessCreated, onAccessRemoved, onActivateBlock };
      activeBlockIdRef.current = activeBlockId;

      const notifyError = (text) =>
        tinymce.activeEditor?.notificationManager?.open({ text, type: "error", timeout: 4000 });

      useEffect(() => {
        const handler = (event) => {
          if (event.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root")) {
            event.stopImmediatePropagation();
          }
        };

        document.addEventListener("focusin", handler);
        return () => document.removeEventListener("focusin", handler);
      }, []);

      useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
          return undefined;
        }

        const applyActive = () => {
          editor.dom.select(`.doc-access-block[${ACCESS_BLOCK_ATTR}]`).forEach((node) => {
            editor.dom.toggleClass(
              node,
              "is-active",
              node.getAttribute(ACCESS_BLOCK_ATTR) === activeBlockIdRef.current,
            );
          });
        };

        applyActive();
        editor.on("SetContent Change NodeChange", applyActive);

        return () => {
          editor.off("SetContent Change NodeChange", applyActive);
        };
      }, [activeBlockId, value]);

      useEffect(
        () => () => {
          if (commandRef) {
            commandRef.current = null;
          }
        },
        [commandRef],
      );

      return (
        <div className="documentation-editor">
          <style
            jsx
            global
          >{`
            .documentation-editor .tox-tinymce {
              border: 1px solid #e5e5e5;
              border-radius: 12px;
              box-shadow: none;
              overflow: hidden;
            }

            .documentation-editor .tox-editor-header,
            .documentation-editor .tox-toolbar-overlord,
            .documentation-editor .tox-toolbar__primary,
            .documentation-editor .tox-toolbar,
            .documentation-editor .tox-toolbar__overflow {
              background: #f3f3f3;
              background-image: none !important;
              box-shadow: none;
            }

            .documentation-editor .tox-toolbar__primary {
              padding: 6px;
            }

            .documentation-editor .tox-toolbar__group {
              padding: 0 4px;
              border: 0 !important;
            }

            .documentation-editor .tox-tbtn,
            .documentation-editor .tox-tbtn--select,
            .documentation-editor .tox-split-button {
              border-radius: 8px;
              min-height: 36px;
            }

            .documentation-editor .tox-tbtn[aria-pressed="true"] {
              background: #fff1f3 !important;
              color: #dd1a32 !important;
            }

            .documentation-editor .tox-edit-area {
              border-top: 1px solid #e5e5e5;
            }

            .documentation-editor .tox-edit-area__iframe,
            .documentation-editor .tox-statusbar {
              background: #ffffff;
            }

            .documentation-editor .tox-statusbar {
              border-top: 1px solid #e5e5e5;
              color: #5e5e5e;
            }

            .documentation-editor .tox-statusbar__path,
            .documentation-editor .tox-statusbar__branding {
              display: none;
            }
          `}</style>
          <Editor
            value={value}
            onEditorChange={onChange}
            onInit={(_event, editor) => {
              editorRef.current = editor;
              if (commandRef) {
                commandRef.current = {
                  remove(id) {
                    return removeAccessBlockFromEditor(editor, id);
                  },
                  unwrapSelection() {
                    return unwrapAccessAtSelection(editor);
                  },
                  focus(id) {
                    focusAccessBlockInEditor(editor, id);
                  },
                };
              }
            }}
            init={{
              license_key: "gpl",
              language: "ru",
              language_load: false,
              language_url: "/tinymce/langs/ru.js",
              height,
              promotion: false,
              branding: false,
              menubar: false,
              statusbar: true,
              resize: true,
              toolbar_mode: "wrap",
              skin_url: "/tinymce/skins/ui/oxide",
              content_css: "/tinymce/skins/ui/oxide/content.css",
              extended_valid_elements: "+div[data-doc-access|class]",
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
                "table",
                "wordcount",
              ],
              toolbar: accessBlocksEnabled ? ACCESS_TOOLBAR : BASE_TOOLBAR,
              placeholder: "Опишите, как устроен модуль",
              paste_data_images: true,
              automatic_uploads: true,
              images_file_types: "jpeg,jpg,png,gif,webp",
              convert_urls: false,
              content_style: accessBlocksEnabled
                ? ACCESS_CONTENT_STYLE
                : ACCESS_CONTENT_STYLE.replace(
                    "Ограниченный доступ · «Снять ограничение» в панели",
                    "Ограниченный доступ",
                  ),
              file_picker_types: "image",
              setup: (editor) => {
                const wrapAccess = () => {
                  const result = wrapSelectionAsAccessBlock(editor);
                  if (!result.ok) {
                    callbackRef.current.onAccessError?.(result.reason);
                    return;
                  }

                  callbackRef.current.onAccessCreated?.(result.id);
                };

                const unwrapAccess = () => {
                  const result = unwrapAccessAtSelection(editor);
                  if (!result.ok) {
                    callbackRef.current.onAccessError?.(result.reason);
                    return;
                  }

                  callbackRef.current.onAccessRemoved?.(result);
                };

                editor.ui.registry.addIcon(
                  "doc-access",
                  '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z" fill="currentColor"/></svg>',
                );
                editor.ui.registry.addIcon(
                  "doc-access-off",
                  '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 0-5 5v1H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5zm3 6H9V7a3 3 0 0 1 6 0v1z" fill="currentColor"/><path d="M3.5 3.5l17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
                );

                if (accessBlocksEnabled) {
                  editor.ui.registry.addButton("docaccess", {
                    icon: "doc-access",
                    text: "Блок доступа",
                    tooltip: "Выделите текст и ограничьте к нему доступ",
                    onAction: wrapAccess,
                  });

                  editor.ui.registry.addButton("docaccessremove", {
                    icon: "doc-access-off",
                    text: "Снять ограничение",
                    tooltip:
                      "Убрать ограничение со всего блока. Или выделите часть текста внутри блока — ограничение снимется только с неё.",
                    onAction: unwrapAccess,
                    onSetup: (api) => {
                      const sync = () => {
                        api.setEnabled(Boolean(getAccessBlockAtSelection(editor)));
                      };

                      sync();
                      editor.on("NodeChange keyup click SetContent", sync);
                      return () => editor.off("NodeChange keyup click SetContent", sync);
                    },
                  });

                  editor.ui.registry.addContextToolbar("docaccesscontext", {
                    predicate: (node) => Boolean(node?.classList?.contains("doc-access-block")),
                    items: "docaccessremove",
                    position: "node",
                    scope: "node",
                  });
                }

                editor.on("click", (event) => {
                  const host = event.target?.closest?.(`[${ACCESS_BLOCK_ATTR}]`);
                  callbackRef.current.onActivateBlock?.(
                    host?.getAttribute(ACCESS_BLOCK_ATTR) || null,
                  );
                });
              },
              file_picker_callback: (callback, _value, meta) => {
                if (meta.filetype !== "image") {
                  return;
                }

                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/png,image/jpeg,image/gif,image/webp";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) {
                    return;
                  }

                  if (file.size > MAX_IMAGE_BYTES) {
                    notifyError(MAX_IMAGE_ERROR);
                    return;
                  }

                  try {
                    const url = await onUploadImage(file);
                    callback(url, { alt: file.name, title: file.name });
                  } catch (error) {
                    notifyError(error?.message || UPLOAD_ERROR);
                  }
                };
                input.click();
              },
              images_upload_handler: async (blobInfo) => {
                const blob = blobInfo.blob();

                if (blob.size > MAX_IMAGE_BYTES) {
                  throw { message: MAX_IMAGE_ERROR, remove: true };
                }

                const file = new File([blob], blobInfo.filename(), { type: blob.type });

                try {
                  return await onUploadImage(file);
                } catch (error) {
                  throw { message: error?.message || UPLOAD_ERROR, remove: true };
                }
              },
            }}
          />
        </div>
      );
    };
  },
  { ssr: false },
);

export default DocumentationEditorInner;
