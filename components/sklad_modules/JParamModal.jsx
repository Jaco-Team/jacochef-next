"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Button,
  Box,
  CircularProgress,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyAutocomplite, MyCheckBox, MySelect, MyTextInput } from "@/components/shared/Forms";
import MyAlert from "@/components/shared/MyAlert";

export default function JParamModal({
  open,
  fullScreen,
  method,
  param_name,
  item: propItem,
  save,
  onClose,
  getData,
}) {
  const [item, setItem] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    if (propItem) {
      setItem(propItem);
    }
  }, [propItem]);

  useEffect(() => {
    if (!item?.module_id) {
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoadingCategories(true);
        const data = {
          module_id: item?.module_id?.id,
        };
        const res = await getData("get_categories_by_module_id", data);
        setItem((prev) => {
          const categoryItem = res.categories?.find((c) => c.id === prev.category);
          return {
            ...prev,
            categories: res.categories || [],
            categoryItem,
          };
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, [item?.module_id]);

  const changeItem = (key, value) => {
    if (typeof value === "boolean") {
      setItem((prev) => (prev ? { ...prev, [key]: +value } : prev));
    } else {
      setItem((prev) => (prev ? { ...prev, [key]: value } : prev));
    }
  };

  const changeAutoComplete = (key, value) => {
    if (key === "category") {
      setItem((prev) =>
        !!prev
          ? {
              ...prev,
              category: value?.id || '',
              category_name: value?.id !== 0 ? value?.name : "",
              categoryItem: value,
            }
          : prev
      );
    } else {
      setItem((prev) => (!!prev ? { ...prev, [key]: value } : prev));
    }
  };

  const handleSave = async () => {
    if (!item) return;

    if (!item.name) return showError("Необходимо указать название");
    if (!item.param) return showError("Необходимо указать параметр");
    if (!item.module_id) return showError("Необходимо выбрать модуль");
    if (!item.type) return showError("Необходимо выбрать тип");
    const res = await save(item);
    if (res?.st) {
      handleClose();
    }
  };

  const showError = (message) => {
    setErrText(message);
    setErrStatus(false);
    setOpenAlert(true);
  };

  const handleClose = () => {
    setTimeout(() => {
      setItem(null);
    }, 100);
    onClose();
  };

  return (
    <>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle className="button">
          {method}
          {param_name ? `: ${param_name}` : null}
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
        </DialogTitle>

        {!!item && (
          <DialogContent sx={{ pb: 1, pt: 1 }}>
            <Grid
              container
              spacing={3}
              mt={2}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <MyTextInput
                  label="Название"
                  value={item.name || ""}
                  func={(e) => changeItem("name", e.target.value)}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <MyTextInput
                  label="Параметр (ключ)"
                  value={item.param || ""}
                  func={(e) => changeItem("param", e.target.value)}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12
                }}>
                <MyAutocomplite
                  label="Модуль"
                  disableCloseOnSelect={false}
                  multiple={false}
                  data={item?.modules || []}
                  value={item?.module_id || ""}
                  func={(_, value) => changeAutoComplete("module_id", value)}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12
                }}>
                <MySelect
                  is_none={false}
                  label="Тип"
                  data={item.types || []}
                  value={item.type || ""}
                  func={(e) => changeItem("type", e.target.value)}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
               {item?.module_id && (
                <MyAutocomplite
                  disabled={isLoadingCategories}
                  label="Категория параметра"
                  multiple={false}
                  disableCloseOnSelect={false}
                  data={item?.categories?.length > 0 ? item?.categories : []}
                  value={item?.categoryItem || ""}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id || option?.name === value?.category_name}
                  func={(_, value) => changeAutoComplete("category", value)}
                  renderInput={
                    (params) => (
                       <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingCategories ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )
                  }
                />
                )}

                {item.categoryItem?.id === 0 && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    mt={2}
                  >
                    <MyTextInput
                      label="Название категории"
                      value={item?.category_name || ""}
                      func={(e) => changeItem("category_name", e.target.value)}
                      mb={2}
                    />

                    <MyTextInput
                      label="Ключ категории (ID)"
                      value={item?.category || ""}
                      func={(e) => changeItem("category", e.target.value)}
                    />
                  </Box>
                )}
              </Grid>
              {item?.module_id && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <MyCheckBox
                    label="Доступ"
                    value={parseInt(item?.access) === 1}
                    func={(e) => changeItem("access", e.target.checked)}
                  />
                  <MyCheckBox
                    label="Просмотр"
                    value={parseInt(item?.view) === 1}
                    func={(e) => changeItem("view", e.target.checked)}
                  />
                  <MyCheckBox
                    label="Редактирование"
                    value={parseInt(item?.edit) === 1}
                    func={(e) => changeItem("edit", e.target.checked)}
                  />
                </Grid>
              )}  
            </Grid>
          </DialogContent>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
