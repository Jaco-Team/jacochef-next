"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import Image from "next/image";
export default function CookCatsTab({ cats, openItem }) {
  return (
    <>
      {cats?.map((item, key) => (
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
                  onClick={async () => await openItem(it.id)}
                >
                  <ListItemButton>
                    <div style={{ width: 60, height: 60 }}>
                      {it.img_app.length == 0 && it.img_new.length > 0 ? (
                        <img
                          src={
                            "https://storage.yandexcloud.net/site-img/" +
                            it.img_new +
                            "_276x276.jpg?" +
                            it.img_new_update
                          }
                          style={{ height: "100%" }}
                          loading="lazy"
                        />
                      ) : it.img_app.length > 0 ? (
                        <picture style={{ width: "100%", height: "100%" }}>
                          <img
                            style={{ height: "100%" }}
                            src={`https://storage.yandexcloud.net/site-img/${it.img_app}_276x276.jpg`}
                            loading="lazy"
                          />
                        </picture>
                      ) : (
                        <div style={{ height: "100%" }} />
                      )}
                    </div>

                    <ListItemText
                      primary={it.name}
                      style={{ paddingLeft: 20 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
