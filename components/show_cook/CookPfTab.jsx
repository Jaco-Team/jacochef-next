"use client";

import { List, ListItem, ListItemButton, ListItemText, Paper } from "@mui/material";

export default function CookPfTab({pf}) {
  return (
    <Paper>
      <List>
        {pf?.map((item, key) => (
          <ListItem
            disablePadding
            key={key}
          >
            <ListItemButton style={{ borderBottom: "1px solid #e5e5e5", cursor: "default" }}>
              <ListItemText
                primary={item.name}
                style={{ width: "40%" }}
              />
              <ListItemText
                primary={item.shelf_life}
                style={{ width: "60%" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
