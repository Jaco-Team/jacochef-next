import { useEffect, useState } from "react";
import { Editor } from "textcrafter";

const PageComponent = ({ value, onChange }) => {
  const [content, setContent] = useState(value);
  useEffect(() => {
    setContent(value);
  }, [value]);

  return (
    <div>
      <Editor
        value={content}
        onChange={onChange}
      />
    </div>
  );
};

export default PageComponent;
