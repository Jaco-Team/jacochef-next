// import { TextEditor } from "@/components/rich_text/LexKit";
// import { TexetEditor } from "@/components/rich_text/TipTap";
// import TextEditor from "@/components/rich_text/CK";
import { Grid } from "@mui/material";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

// const TextEditor = dynamic(() => import("@/components/rich_text/CK"), { ssr: false });
// const TextEditor = dynamic(() => import('@/components/rich_text/TipTap'), { ssr: false });
// const TextEditor = dynamic(() => import('@/components/rich_text/LexKit'), { ssr: false });
// const TextEditor = dynamic(() => import("@/components/rich_text/BlockNote"), { ssr: false });
const TextEditor = dynamic(() => import("@/components/rich_text/Jodit"), { ssr: false });
export default function WysiwygEditor() {
  const [content, setContent] = useState("<p>Hello world!</p>");
  const editorRef = useRef(null);
  return (
    <Grid
      container
      spacing={2}
      className="container_first_child"
    >
      <Grid size={12}>
        {/* <TextEditor // tiptap
          value={content}
          onChange={setContent}
          editorRef={editorRef}
          toolbar={true} // show control buttons
          menubar={false} // unused but kept for parity
          language="ru"
        /> */}
        <TextEditor
          value={content}
          onChange={setContent}
          toolbar
          menubar
          language="ru"
        />
      </Grid>
      <Grid size={12}>{/* <textarea value={() => JSON.stringify(content)} /> */}</Grid>
    </Grid>
  );
}
