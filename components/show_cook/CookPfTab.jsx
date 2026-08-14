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
  Tab,
  Tabs,
  TextField,
} from "@mui/material";

const ROLE_TABS = [
  { key: "cook", label: "Повар", hideCatIds: [11, 4] },
  { key: "cashier", label: "Кассир", hideCatIds: [] },
  { key: "kitchen", label: "Кух. работник", hideCatIds: [] },
  { key: "universal", label: "Повар универсал", hideCatIds: [] },
];

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

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getItemDedupeKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default function CookPfTab({ pf }) {
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState(0);

  const filteredPf = useMemo(() => {
    const hideCatIds = ROLE_TABS[roleTab]?.hideCatIds ?? [];
    const query = search.trim().toLowerCase();

    const list = dedupeItems(pf ?? []).filter((item) => {
      const catId = Number(item?.cat_id);
      if (hideCatIds.includes(catId)) {
        return false;
      }

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
  }, [pf, roleTab, search]);

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
      <Paper sx={{ mb: 2, overflow: "hidden", width: "100%" }}>
        <Tabs
          value={roleTab}
          onChange={(_, value) => setRoleTab(value)}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            width: "100%",
            "& .MuiTabs-scroller": { overflow: "auto !important" },
            "& .MuiTab-root": {
              minWidth: "auto",
              minHeight: 40,
              px: 1.5,
              fontSize: { xs: 13, sm: 14 },
              textTransform: "none",
            },
          }}
        >
          {ROLE_TABS.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
            />
          ))}
        </Tabs>
      </Paper>

      <TextField
        size="small"
        fullWidth
        value={search}
        placeholder="Поиск"
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2, maxWidth: "100%" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
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
                  primaryTypographyProps={{
                    sx: { wordBreak: "break-word", fontSize: { xs: 13, sm: 14 } },
                  }}
                />
                <ListItemText
                  primary={item.shelf_life}
                  sx={{ flex: "1 1 60%", minWidth: 0, m: 0 }}
                  primaryTypographyProps={{
                    sx: { wordBreak: "break-word", fontSize: { xs: 13, sm: 14 } },
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
