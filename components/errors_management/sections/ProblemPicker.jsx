"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { JacoAutocomplete, JacoStatusChip } from "@/design-system/shared/ui";
import { matchesQuery } from "../complaintTree.mjs";
import { focusFirstInput } from "../focusModel.mjs";
import FieldMessage from "./FieldMessage";

export default function ProblemPicker({ options, value, onChange, autoOpen = false, error }) {
  const selected = options.find((option) => String(option.id) === String(value)) || null;
  const [open, setOpen] = useState(Boolean(autoOpen) && !selected && options.length > 0);
  const rootRef = useRef(null);
  const focusOnMount = useRef(Boolean(autoOpen) && !selected);

  useEffect(() => {
    if (!focusOnMount.current) return undefined;
    const frame = window.requestAnimationFrame(() => focusFirstInput(rootRef.current));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <Stack spacing={0.5}>
      <JacoAutocomplete
        ref={rootRef}
        label="Проблема"
        placeholder={selected ? undefined : "Поиск: «забыли», «упаковка», «холодным»…"}
        options={options}
        value={selected}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={(_event, option) => onChange(option ? String(option.id) : "")}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => option?.name ?? ""}
        isOptionEqualToValue={(option, current) => option.id === current.id}
        filterOptions={(list, state) => list.filter((option) => matchesQuery(option.search, state.inputValue))}
        noOptionsText="Ничего не нашлось"
        autoHighlight
        selectAppearance
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box
              component="li"
              key={key}
              {...optionProps}
              sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}
            >
              <span>{option.name}</span>
              {option.needImg ? (
                <JacoStatusChip
                  label="нужно фото"
                  tone="danger"
                  variant="soft"
                  sx={{ flexShrink: 0 }}
                />
              ) : null}
            </Box>
          );
        }}
      />
      {selected?.group ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mx: 1.75 }}
        >
          {selected.group}
        </Typography>
      ) : null}
      <FieldMessage>{error}</FieldMessage>
    </Stack>
  );
}
