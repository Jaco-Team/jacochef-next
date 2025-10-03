"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyAutocomplite, MyCheckBox, MyTextInput } from "@/components/shared/Forms";

const ModalNewTagNav = ({open, onClose, save}) => {
  const [newTagName, setNewTagName] = useState('');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Добавить новый тег навигации</DialogTitle>
      <DialogContent>
        <Grid
          mt={2}
          size={{
            xs: 12,
            sm: 12
          }}>
          <MyTextInput
            label="Название"
            value={newTagName}
            func={(e) => setNewTagName(e.target.value)}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={() => save(newTagName)}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}

const ModalNewTagCont = ({open, onClose, save}) => {
  const [newTagName, setNewTagName] = useState('');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Добавить новое название контента</DialogTitle>
      <DialogContent>
        <Grid
          mt={2}
          size={{
            xs: 12,
            sm: 12
          }}>
          <MyTextInput
            label="Название"
            value={newTagName}
            func={(e) => setNewTagName(e.target.value)}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={() => save(newTagName)}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function JModal({
  open,
  fullScreen,
  method,
  itemName,
  item: propItem,
  listCat: propListCat,
  listNav: propListNav,
  listContent : propListContent,
  mark,
  updateOne,
  getData,
  save,
  onClose,
  canEdit
}) {
  const [item, setItem] = useState(null);
  const [listCat, setListCat] = useState(null);
  const [listNav, setListNav] = useState(null);
  const [listContent, setListContent] = useState(null);
  const [itemCat, setItemCat] = useState(null);
  const [itemNav, setItemNav] = useState([]);
  const [itemContent, setItemContent] = useState([]);
  const [openNewTagNavModal, setOpenNewNavTagModal] = useState(false);
  const [openNewContTagModal, setOpenNewContTagModal] = useState(false);

  useEffect(() => {
    if (propItem) {
      const foundCat = propListCat?.find(
        (c) => parseInt(c.id) === parseInt(propItem.parent_id)
      );
      setItem(propItem);
      setListCat(propListCat || []);
      const navEls = [];
      const contsEls = [];
      if (propListNav?.length && propItem.navs_id) {
        propItem.navs_id.split(',').map((id) => {
          const item = propListNav.find((item) => item.id == id);
          if (item?.id) {
            navEls.push(item);
          }
        })
      }

      if (propListContent?.length && propItem.conts_id) {
        propItem.conts_id.split(',').map((id) => {
          const item = propListContent.find((item) => item.id == id);
          if (item?.id) {
            contsEls.push(item);
          }
        })
      }

      setItemContent(contsEls);
      setItemNav(navEls);
      setItemCat(foundCat || null);
    }
  }, [propItem, propListCat]);

  useEffect(() => {
    if (propListContent?.length || propListNav?.length) {
      if (propListNav?.length) {
        setListNav([
          {id: -1, name: 'Добавить новый'},
          ...propListNav,
        ] || []);
      }

      if (propListContent?.length) {
        setListContent([
          {id: -1, name: 'Добавить новый'},
          ...propListContent,
        ] || []);
      }
    }
  }, [propListCat, propListContent]);

  const changeItem = (key, value) => {
    setItem((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const changeItemChecked = (key, checked) => {
    setItem((prev) =>
      prev ? { ...prev, [key]: checked === true ? 1 : 0 } : prev
    );
  };

  const changeItemCat = (key, value) => {
    setItem((prev) => (prev ? { ...prev, [key]: value ? value.id : "" } : prev));
    setItemCat(value);
  };

  const changeItemNav = (key, value) => {
    setItem((prev) => (prev ? { ...prev, [key]: value ? value.id : "" } : prev));
    const addPlaceholder = value.find(tag => tag.id === -1);
    let selected = value;
    if (addPlaceholder) {
      selected = value.filter(tag => tag.id !== -1);
      setOpenNewNavTagModal(true);
    }
    setItemNav(selected);
  };

  const changeItemContent = (key, value) => {
    setItem((prev) => (prev ? { ...prev, [key]: value ? value.id : "" } : prev));
    const addPlaceholder = value.find(tag => tag.id === -1);
    let selected = value;
    if (addPlaceholder) {
      selected = value.filter(tag => tag.id !== -1);
      setOpenNewContTagModal(true);
    }
    setItemContent(selected);
  };

  const handleSaveNav = async (name) => {
    const res = await getData('save_nav', {name});
    if (res.st) {
      setOpenNewNavTagModal(false);
      updateOne(propItem.id);
    } else {

    }
  }

  const handleSaveCont = async (name) => {
    const res = await getData('save_cont', {name});
    if (res.st) {
      setOpenNewContTagModal(false);
      updateOne(propItem.id);
    } else {

    }
  }

  const handleSave = () => {
    if (!item) return;
    const itemCurrent = {...item, itemContent, itemNav};
    save(itemCurrent);
    handleClose();
  };

  const handleClose = () => {
    setItem(null);
    setListCat(null);
    setItemCat(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle className="button">
        {method}
        {itemName ? `: ${itemName}` : null}
      </DialogTitle>
      {openNewTagNavModal && <ModalNewTagNav open={openNewTagNavModal} onClose={() => setOpenNewNavTagModal(false)} save={handleSaveNav}/>}
      {openNewContTagModal && <ModalNewTagCont open={openNewContTagModal} onClose={() => setOpenNewContTagModal(false)} save={handleSaveCont}/>}
      <IconButton
        onClick={handleClose}
        sx={{
          cursor: "pointer",
          position: "absolute",
          top: 0,
          right: 0,
          p: 2,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pb: 1, pt: 1 }}>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12
            }}>
            <MyTextInput
              label="Название"
              value={item?.name || ""}
              func={(e) => changeItem("name", e.target.value)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12
            }}>
            <MyTextInput
              label="Адрес модуля (URL)"
              value={item?.link ?? ""}
              func={(e) => changeItem("link", e.target.value)}
              disabled={mark === "edit"}
            />
          </Grid>

          <Grid
            size={{
              xs: 12
            }}>
            <MyAutocomplite
              label="Категория"
              multiple={false}
              data={listCat || []}
              value={itemCat || ""}
              func={(_event, value) => changeItemCat("parent_id", value)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12
            }}>
            <MyAutocomplite
              label="Внутренняя навигация"
              multiple={true}
              data={listNav || []}
              value={itemNav || []}
              func={(_event, value) => changeItemNav("navs", value)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12
            }}>
            <MyAutocomplite
              label="Контент"
              multiple={true}
              data={listContent || []}
              value={itemContent || []}
              func={(_event, value) => changeItemContent("conts", value)}
            />
          </Grid>

          {mark === "edit" && (
            <Grid
              size={{
                xs: 12
              }}>
              <MyCheckBox
                label="Активность"
                value={parseInt(item?.is_show) === 1}
                func={(e) => changeItemChecked("is_show", e.target.checked)}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSave}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
