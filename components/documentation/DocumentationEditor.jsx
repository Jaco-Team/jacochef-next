"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_ERROR = "Изображение больше 5 МБ";
const UPLOAD_ERROR = "Не удалось загрузить изображение";

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

    return function DocumentationEditor({ value, onChange, onUploadImage, height = 640 }) {
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
              toolbar:
                "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image table | removeformat | code fullscreen",
              placeholder: "Опишите, как устроен модуль",
              paste_data_images: true,
              automatic_uploads: true,
              images_file_types: "jpeg,jpg,png,gif,webp",
              convert_urls: false,
              content_style:
                "body { font-family: Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #2B2B2B; margin: 16px; }",
              file_picker_types: "image",
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
