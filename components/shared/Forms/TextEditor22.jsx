"use client";

import { Editor } from "@tinymce/tinymce-react";

export function TextEditor22(props) {
  return (
    <Editor
      apiKey="q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj"
      value={props.value}
      onEditorChange={props.func}
      onInit={(_, editor) => (props.refs_.current = editor)}
      init={{
        height: 500,
        menubar: props?.menubar,
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
        toolbar: props?.toolbar
          ? "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | link image | code | fullscreen | help"
          : false,
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
