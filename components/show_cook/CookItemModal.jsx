"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CookItemModal({ isOpened, onClose, itemsEdit, stage_1, stage_2, stage_3 }) {
  const [fullScreen, setFullScreen] = useState(false);
  useEffect(() => {
    setFullScreen(window.innerWidth < 600);
  }, []);

  return (
    <Dialog
      open={isOpened}
      fullScreen={fullScreen}
      maxWidth={"md"}
      onClose={onClose}
    >
      <DialogTitle style={{ textAlign: "center" }}>
        {itemsEdit.name}
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer", position: "fixed", top: 0, right: 0, padding: 20 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={0}
        >
          <Grid
            style={{ display: "flex", justifyContent: "center" }}
            size={{
              xs: 12
            }}>
            {itemsEdit.img_app.length == 0 && itemsEdit.img_new.length > 0 ? (
              <img
                src={
                  "https://storage.yandexcloud.net/site-img/" +
                  itemsEdit.img_new +
                  "_585x585.jpg"
                }
                style={{ maxHeight: 400, width: "100%" }}
                loading="lazy"
              />
            ) : itemsEdit.img_app.length > 0 ? (
              <picture>
                <img
                  style={{ maxHeight: 400, width: "100%" }}
                  src={`https://storage.yandexcloud.net/site-img/${itemsEdit.img_app}_585x585.jpg`}
                  loading="lazy"
                />
              </picture>
            ) : (
              <div style={{ maxHeight: 400, width: "100%" }} />
            )}
            {/* {itemsEdit.img_new || itemsEdit.img_app ? (
              <Image
                src={`https://cdnimg.jacofood.ru/${
                  itemsEdit.img_new
                    ? itemsEdit.img_new + "600х400.jpg?" + itemsEdit.img_new_update
                    : itemsEdit.img_app + "_600х400.jpg"
                }`}
                alt=""
                width={600}
                height={400}
                style={{ height: "100%", width: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <div style={{ height: "100%" }} />
            )} */}
          </Grid>

          {stage_1?.length > 0 ? (
            <Grid
              size={{
                xs: 12
              }}>
              <h3 style={{ textAlign: "center" }}>Этап 1</h3>
              <List>
                {stage_1?.map((item, key) => (
                  <ListItem
                    disablePadding
                    key={key}
                  >
                    <ListItemButton style={{ borderBottom: "1px solid #e5e5e5" }}>
                      <ListItemText
                        primary={item.name}
                        style={{ width: "60%" }}
                      />
                      <ListItemText
                        primary={item.count + " " + item.ei_name}
                        style={{ width: "40%" }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ) : null}

          {stage_2?.length > 0 ? (
            <Grid
              size={{
                xs: 12
              }}>
              <h3 style={{ textAlign: "center" }}>Этап 2</h3>
              <List>
                {stage_2?.map((item, key) => (
                  <ListItem
                    disablePadding
                    key={key}
                  >
                    <ListItemButton style={{ borderBottom: "1px solid #e5e5e5" }}>
                      <ListItemText
                        primary={item.name}
                        style={{ width: "60%" }}
                      />
                      <ListItemText
                        primary={item.count + " " + item.ei_name}
                        style={{ width: "40%" }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ) : null}

          {stage_3?.length > 0 ? (
            <Grid
              size={{
                xs: 12
              }}>
              <h3 style={{ textAlign: "center" }}>Этап 3</h3>
              <List>
                {stage_3?.map((item, key) => (
                  <ListItem
                    disablePadding
                    key={key}
                  >
                    <ListItemButton style={{ borderBottom: "1px solid #e5e5e5" }}>
                      <ListItemText
                        primary={item.name}
                        style={{ width: "60%" }}
                      />
                      <ListItemText
                        primary={item.count + " " + item.ei_name}
                        style={{ width: "40%" }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
