"use client";

import { useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from "@mui/material";

function compareByName(a, b) {
  return String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "ru", {
    sensitivity: "base",
  });
}

function getItemDedupeKey(item) {
  if (item?.id !== undefined && item?.id !== null && item?.id !== "") {
    return `id:${item.id}`;
  }
  return `name:${String(item?.name ?? "")}|${String(item?.shelf_life ?? "")}`;
}

export default function CookPfTab({ pf }) {
  const [search, setSearch] = useState("");

  const filteredPf = useMemo(() => {
    const query = search.trim().toLowerCase();

    const list = (pf ?? []).filter((item) => {
      if (!query) {
        return true;
      }

      return String(item?.name ?? "")
        .toLowerCase()
        .includes(query);
    });

    if (!query) {
      return [...list].sort(compareByName);
    }

    return [...list].sort((a, b) => {
      const aName = String(a?.name ?? "").toLowerCase();
      const bName = String(b?.name ?? "").toLowerCase();
      const aStarts = aName.startsWith(query) ? 0 : 1;
      const bStarts = bName.startsWith(query) ? 0 : 1;
      if (aStarts !== bStarts) {
        return aStarts - bStarts;
      }
      return compareByName(a, b);
    });
  }, [pf, search]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: 800 },
        minWidth: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <TextField
        size="small"
        fullWidth
        value={search}
        placeholder="Поиск"
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2, maxWidth: "100%" }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <List disablePadding>
          {filteredPf.map((item, index) => (
            <ListItem
              disablePadding
              key={`${getItemDedupeKey(item)}-${index}`}
            >
              <ListItemButton
                sx={{
                  borderBottom: "1px solid #e5e5e5",
                  cursor: "default",
                  gap: 1,
                  alignItems: "flex-start",
                }}
              >
                <ListItemText
                  primary={item.name}
                  sx={{ flex: "1 1 40%", minWidth: 0, m: 0 }}
                  slotProps={{
                    primary: {
                      sx: { wordBreak: "break-word", fontSize: { xs: 13, sm: 14 } },
                    },
                  }}
                />
                <ListItemText
                  primary={item.shelf_life}
                  sx={{ flex: "1 1 60%", minWidth: 0, m: 0 }}
                  slotProps={{
                    primary: {
                      sx: { wordBreak: "break-word", fontSize: { xs: 13, sm: 14 } },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
