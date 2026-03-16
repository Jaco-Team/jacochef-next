import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const toneMap = {
  "-1": {
    label: "Негатив",
    color: "#E25555",
    chipBg: "#FDECEC",
    chipBorder: "#F6CACA",
  },
  0: {
    label: "Нейтрально",
    color: "#0075ff",
    chipBg: "#F3F4F6",
    chipBorder: "#E3E6EB",
  },
  1: {
    label: "Позитив",
    color: "#2E9B57",
    chipBg: "#EAF7EF",
    chipBorder: "#CBEAD6",
  },
};

function getToneMeta(ton) {
  return toneMap[String(ton)] || toneMap["0"];
}

function getNamesWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return "название";
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
    return "названия";
  }
  return "названий";
}

function ThemeNamesPopover({ names }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={handleOpen}
        sx={{
          border: "none",
          background: "transparent",
          p: 0,
          m: 0,
          cursor: "pointer",
          color: "#5B6B88",
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "underline dotted",
            textUnderlineOffset: "3px",
          }}
        >
          {names.length} {getNamesWord(names.length)}
        </Typography>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 1.5,
            borderRadius: 3,
            boxShadow: "0 12px 32px rgba(17, 24, 39, 0.12)",
            minWidth: 260,
          },
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Связанные названия</Typography>

        <Stack spacing={0.75}>
          {names.map((name) => (
            <Box
              key={name}
              sx={{
                px: 1,
                py: 0.75,
                borderRadius: 2,
                bgcolor: "#F7F8FA",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#2A2F3A" }}>{name}</Typography>
            </Box>
          ))}
        </Stack>
      </Popover>
    </>
  );
}

function ThemeChip({ item }) {
  const meta = getToneMeta(item.ton);

  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>{item.theme}</Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.9 }}>Упоминаний: {item.count}</Typography>
          {item.names && item.names.length > 0 && (
            <Typography sx={{ fontSize: 12, opacity: 0.9, mt: 0.75 }}>
              Нажмите ниже в строке, чтобы посмотреть названия.
            </Typography>
          )}
        </Box>
      }
    >
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{item.theme}</Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
              {item.count}
            </Typography>
          </Box>
        }
        sx={{
          height: 34,
          borderRadius: "999px",
          bgcolor: meta.chipBg,
          border: `1px solid ${meta.chipBorder}`,
          "& .MuiChip-label": {
            px: 1.5,
          },
        }}
      />
    </Tooltip>
  );
}

function ThemeRow({ item, maxCount }) {
  const meta = getToneMeta(item.ton);
  const value = maxCount ? (item.count / maxCount) * 100 : 0;
  const uniqueNames = useMemo(() => [...new Set(item.names)], [item.names]);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 1.1fr) minmax(240px, 2.4fr) 40px",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 15,
            color: "#151A23",
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.theme}
        </Typography>

        {uniqueNames && uniqueNames.length > 0 && (
          <Box sx={{ mt: 0.25 }}>
            <ThemeNamesPopover names={uniqueNames} />
          </Box>
        )}
      </Box>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: "#E9EDF3",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            backgroundColor: meta.color,
          },
        }}
      />

      <Typography
        sx={{
          fontSize: 15,
          color: "#6B7280",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {item.count}
      </Typography>
    </Box>
  );
}

export default function ReviewThemesWidget({ data }) {
  const sortedData = [...(data || [])].sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...(sortedData.map((item) => item.count) || [0]), 0);

  return (
    <Box
      sx={{
        p: 0,
      }}
    >
      <Card
        sx={{
          mx: "auto",
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#1B2230" }}>
            Основные темы отзывов
          </Typography>

          <IconButton
            size="small"
            sx={{ ml: 3 }}
            title="Наиболее частые причины жалоб или комментариев клиентов"
          >
            <InfoOutlined
              fontSize="small"
              sx={{ color: "text.secondary" }}
            />
          </IconButton>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {sortedData.map((item) => (
            <ThemeChip
              key={item.theme}
              item={item}
            />
          ))}
        </Stack>

        <Stack spacing={2.25}>
          {sortedData.map((item) => (
            <ThemeRow
              key={item.theme}
              item={item}
              maxCount={maxCount}
            />
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
