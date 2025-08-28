"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";


export default function CookRecipesTab({rec}) {
  return (
    <Paper
      sx={{ display: { xs: "block", md: "flex" }, width: { xs: "100%", md: "50%" } }}
      style={{ justifyContent: "center", flexDirection: "column" }}
    >
      {rec?.map((item, key) => (
        <Accordion key={key}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{item.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {item.items.map((it, k) => (
                <ListItem
                  disablePadding
                  key={k}
                >
                  <ListItemButton style={{ borderBottom: "1px solid #e5e5e5", cursor: "default" }}>
                    <ListItemText
                      primary={it.name}
                      style={{ width: "70%" }}
                    />
                    <ListItemText
                      primary={it.count + " " + it.ei_name}
                      style={{ width: "30%" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={""}
                    style={{ width: "70%" }}
                  />
                  <span style={{ width: "30%", fontWeight: "900" }}>
                    {item.all_w + " " + item.ei_name}
                  </span>
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
}
