import { useState } from "react";
import { Stack, Typography } from "@mui/material";

import JacoSearchField from "../JacoSearchField";

const meta = {
  title: "Chef Design System/Shared UI/JacoSearchField",
  component: JacoSearchField,
};

export default meta;

function SearchFieldStory({ initialValue = "", debounceMs = 350 }) {
  const [value, setValue] = useState(initialValue);
  const [committedValue, setCommittedValue] = useState(initialValue);

  return (
    <Stack
      spacing={2}
      sx={{ width: 520, maxWidth: "100%", p: 4 }}
    >
      <JacoSearchField
        label="Поиск"
        placeholder="Название товара"
        value={value}
        debounceMs={debounceMs}
        onValueChange={(nextValue) => {
          setValue(nextValue);
          setCommittedValue(nextValue);
        }}
      />
      <Typography variant="body2">Применённый запрос: {committedValue || "—"}</Typography>
    </Stack>
  );
}

export function Empty() {
  return <SearchFieldStory />;
}

export function PopulatedWithClearAction() {
  return <SearchFieldStory initialValue="Базилик" />;
}

export function DebouncedCommit() {
  return <SearchFieldStory debounceMs={800} />;
}
