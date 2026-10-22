"use client";

import { useEffect, useMemo, useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  JacoAutocomplete,
  JacoButton,
  JacoSelect,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTypography,
} from "@/design-system/shared/ui";

import {
  MATCH_OPTIONS,
  accessBlockHasRules,
  normalizeAccessOptions,
  readAccessBlockExcerpt,
} from "./accessBlocks";

const multipleFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: "auto",
    minHeight: 44,
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: "4px",
    py: "6px !important",
    borderRadius: uiRadii.md,
    backgroundColor: uiColors.surface,
    "& fieldset": {
      borderColor: uiColors.border,
    },
    "&:hover fieldset": {
      borderColor: uiColors.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: uiColors.primary,
      borderWidth: 1,
    },
    "&.Mui-disabled": {
      backgroundColor: uiStateColors.disabledSurface,
    },
  },
  "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
    height: "auto",
    minHeight: 24,
    minWidth: "80px !important",
    py: "0 !important",
  },
  "& .MuiChip-root": {
    height: 28,
    borderRadius: uiRadii.sm,
  },
};

function RestrictionAutocomplete({
  label,
  placeholder,
  options,
  value,
  onChange,
  onInputChange,
  filterOptions,
  noOptionsText,
  disabled,
}) {
  return (
    <JacoAutocomplete
      multiple
      disableCloseOnSelect
      limitTags={3}
      label={label}
      placeholder={value?.length ? "" : placeholder}
      options={options}
      value={value}
      disabled={disabled}
      onChange={onChange}
      onInputChange={onInputChange}
      filterOptions={filterOptions}
      noOptionsText={noOptionsText}
      getOptionKey={(option) => String(option?.id ?? "")}
      isOptionEqualToValue={(option, selected) => String(option?.id) === String(selected?.id)}
      sx={multipleFieldSx}
    />
  );
}

function UserRestrictionField({ block, searchUsers, onChange }) {
  const [query, setQuery] = useState("");
  const [remoteUsers, setRemoteUsers] = useState([]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const users = await searchUsers(query);
      if (active) {
        setRemoteUsers(users);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, searchUsers]);

  const options = useMemo(
    () => normalizeAccessOptions([...(block.users || []), ...remoteUsers]),
    [block.users, remoteUsers],
  );

  return (
    <RestrictionAutocomplete
      label="Кому"
      placeholder="Сотрудники"
      options={options}
      value={block.users}
      noOptionsText="Сотрудник не найден"
      onInputChange={(_event, value, reason) => {
        if (reason === "input" || reason === "clear") {
          setQuery(value);
        }
      }}
      filterOptions={(current) => current}
      onChange={(_event, value) => onChange({ users: value || [] })}
    />
  );
}

function AccessBlockCard({
  block,
  html,
  active,
  positions,
  rights,
  rightsConnected,
  searchUsers,
  onSelect,
  onChange,
  onDelete,
}) {
  const excerpt = readAccessBlockExcerpt(html, block.id);

  return (
    <Box
      onClick={onSelect}
      sx={{
        p: 1.5,
        borderRadius: uiRadii.md,
        border: `1px solid ${active ? uiColors.primary : uiColors.border}`,
        borderLeftWidth: 3,
        borderLeftColor: uiColors.primary,
        backgroundColor: active ? uiColors.primarySoft : uiColors.surface,
        cursor: "pointer",
      }}
    >
      <Stack
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...uiTypography.label, fontWeight: 600, color: uiColors.textStrong }}>
            {block.name || "Блок"}
          </Typography>
          {excerpt ? (
            <Typography
              sx={{
                mt: 0.5,
                ...uiTypography.compactLabel,
                color: uiColors.textMuted,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {excerpt}
            </Typography>
          ) : null}
        </Box>
        <JacoButton
          tone="secondary"
          compact
          startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          sx={{ alignSelf: "flex-start" }}
        >
          Убрать ограничение
        </JacoButton>
      </Stack>

      <Stack
        spacing={1.5}
        onClick={(event) => event.stopPropagation()}
      >
        <JacoTextInput
          label="Название блока"
          value={block.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
        <UserRestrictionField
          block={block}
          searchUsers={searchUsers}
          onChange={onChange}
        />
        <RestrictionAutocomplete
          label="Должности"
          placeholder="Должности"
          options={positions}
          value={block.positions}
          noOptionsText="Должность не найдена"
          onChange={(_event, value) => onChange({ positions: value || [] })}
        />
        <RestrictionAutocomplete
          label="Необходимые права"
          placeholder="Права"
          options={rights}
          value={block.rights}
          disabled={!rightsConnected}
          noOptionsText="Право не найдено"
          onChange={(_event, value) => onChange({ rights: value || [] })}
        />
        {!rightsConnected ? (
          <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.textMuted }}>
            Система прав не подключена. Условия по правам пока не проверяются.
          </Typography>
        ) : null}
        <JacoSelect
          label="Условие просмотра"
          allowNone={false}
          options={MATCH_OPTIONS}
          value={block.match}
          onChange={(event) => onChange({ match: event.target.value === "all" ? "all" : "any" })}
        />
        {!accessBlockHasRules(block) ? (
          <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.textMuted }}>
            Ограничения не выбраны — фрагмент виден всем, у кого открыт модуль.
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function DocumentationAccessPanel({
  blocks,
  html,
  activeId,
  positions,
  rights,
  rightsConnected,
  searchUsers,
  onSelect,
  onChange,
  onDelete,
}) {
  return (
    <Box
      sx={{
        p: 2,
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.md,
        backgroundColor: uiColors.surface,
        position: { lg: "sticky" },
        top: { lg: 88 },
        maxHeight: { lg: "calc(100vh - 112px)" },
        overflow: "auto",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", mb: 0.5 }}
      >
        <LockOutlinedIcon sx={{ fontSize: 18, color: uiColors.primary }} />
        <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
          Блоки доступа {blocks.length}
        </Typography>
      </Stack>
      <Typography sx={{ mb: 2, ...uiTypography.compactLabel, color: uiColors.textMuted }}>
        Выделите текст → «Блок доступа». Чтобы снять: курсор в розовый блок → «Снять ограничение»
        или кнопка «Убрать ограничение» здесь. Часть текста внутри блока можно снять отдельно.
      </Typography>

      {blocks.length === 0 ? (
        <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted }}>
          Ограничения пока не выбраны.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {blocks.map((block) => (
            <AccessBlockCard
              key={block.id}
              block={block}
              html={html}
              active={block.id === activeId}
              positions={positions}
              rights={rights}
              rightsConnected={rightsConnected}
              searchUsers={searchUsers}
              onSelect={() => onSelect(block.id)}
              onChange={(patch) => onChange(block.id, patch)}
              onDelete={() => onDelete(block)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
