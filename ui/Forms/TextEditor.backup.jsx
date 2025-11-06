//q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj - новый
//r0ihgs4ukfpmudzw7aexxgb88tnx5jw26h1xx9x6409ji3gx - старый
//q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj - еще более новый

import { Editor } from "@tinymce/tinymce-react";
import { useEffect } from "react";

export default function TextEditor(props) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root") !== null) {
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
        height: 500,
        //menubar: false,
        language: "ru",
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
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | link image | code | fullscreen | help",
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
