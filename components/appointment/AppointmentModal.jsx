"use client";

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AppointmentParamModal from "@/components/appointment/AppointmentParamModal";
import AppointmentModalInput from "@/components/appointment/AppointmentModalInput";
import { Fragment, memo, useCallback, useEffect, useState } from "react";
import { MyAutocomplite, MyCheckBox, MyTextInput } from "@/ui/Forms";
import { useAppointmentModalStore } from "@/components/appointment/store/useAppointmentModalStore";
import TextFilter from "../../ui/TextFilter";
import { useDebounce } from "@/src/hooks/useDebounce";

const AppointmentModal = (props) => {
  const {
    setItem,
    setFullMenu,
    setUiParams,
    setParams,
    setMethod,
    setMainKey,
    setParentKey,
    setParamModal,
    setParamMethod,
    setType,
    setItemField,
    changeActiveModule,
    reset,
  } = useAppointmentModalStore.getState();

  const [item, full_menu, method] = useAppointmentModalStore((s) => [
    s.item,
    s.full_menu,
    s.method,
  ]);

  // filter by name
  const [moduleNameFilter, setModuleNameFilter] = useState("");
  const [fullMenuFiltered, setFullMenuFiltered] = useState(full_menu);
  const filterFullMenu = useCallback(() => {
    if (!moduleNameFilter) {
      // IMPORTANT: still annotate indices even without filter
      const withIndices = full_menu?.map((item, mainIndex) => ({
        ...item,
        __mainIndex: mainIndex,
        chaild: item.chaild?.map((child, childIndex) => ({
          ...child,
          __mainIndex: mainIndex,
          __childIndex: childIndex,
        })),
      }));

      setFullMenuFiltered(withIndices);
      return;
    }

    const q = moduleNameFilter.toLowerCase();

    const filtered = full_menu
      ?.map((item, mainIndex) => {
        const children = item.chaild
          ?.map((child, childIndex) => ({
            ...child,
            __mainIndex: mainIndex,
            __childIndex: childIndex,
          }))
          .filter((child) => child.name?.toLowerCase().includes(q));

        return {
          ...item,
          __mainIndex: mainIndex,
          chaild: children,
        };
      })
      .filter((item) => item.chaild && item.chaild.length > 0);

    setFullMenuFiltered(filtered);
  }, [full_menu, moduleNameFilter]);
  const debouncedFilterFullMenu = useDebounce(filterFullMenu, 400);
  useEffect(() => {
    debouncedFilterFullMenu();
  }, [full_menu, moduleNameFilter]);
  //

  useEffect(() => {
    if (!props) {
      return;
    }
    if (props.item !== item) {
      setItem(props.item);
    }
    setFullMenu(props.full_menu);
    setMethod(props.method);
  }, [props]);

  useEffect(() => {
    // rebuilding modal params from features here
    !!full_menu && setUiParams();
  }, [full_menu]);

  const changeItemChecked = (key, event) => {
    setItemField(key, +event.target.checked);
  };

  const onClose = () => {
    setTimeout(() => {
      reset();
    }, 100);

    props.onClose();
  };

  const save = useCallback(() => {
    try {
      props.save(item, full_menu);
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      onClose();
    }
  }, [item, full_menu]);

  const openParams = (paramMethod, main_key, parent_key, type) => {
    if (!canEdit("app")) return;
    setMainKey(main_key);
    setParentKey(parent_key);
    setParamMethod(paramMethod);
    setType(type);
    setUiParams(); // see the store: generates params structure for current module
    setParamModal(true);
  };

  const { fullScreen, open, units, canEdit } = props;

  return (
    <>
      <AppointmentParamModal
        onClose={() => {
          setParamModal(false);
          setParams(null);
          setMainKey("");
          setParentKey("");
          setType("");
        }}
      />
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth={true}
        maxWidth={"lg"}
        fullScreen={fullScreen}
      >
        <DialogTitle>
          {method}
          {item?.name}
          <IconButton
            onClick={onClose}
            style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <AppointmentModalInput
              data={item?.name}
              disabled={!canEdit("app")}
              changeItem={setItemField}
              label="Название должности"
              type="name"
            />
            <AppointmentModalInput
              data={item?.short_name}
              disabled={!canEdit("app")}
              changeItem={setItemField}
              label="Сокращенное название"
              type="short_name"
            />
            <Grid
              size={{
                xs: 6,
                md: 4,
              }}
            >
              <MyTextInput
                label="Норма бонусов"
                type="number"
                value={item?.bonus || 0}
                disabled={!canEdit("app")}
                func={({ target: { value } }) => setItemField("bonus", value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
                md: 4,
              }}
            >
              <MyAutocomplite
                data={units}
                disabled={!canEdit("app") || !canEdit("units")}
                multiple={false}
                disableCloseOnSelect={false}
                label="Отдел"
                value={units?.find((unit) => unit.id === item?.unit_id) || ""}
                func={(_, newValue) => setItemField("unit_id", newValue.id)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <MyCheckBox
                func={(e) => changeItemChecked("is_graph", e)}
                value={parseInt(item?.is_graph) == 1 ? true : false}
                disabled={!canEdit("app")}
                label="Нужен в графике работы"
              />
            </Grid>

            {fullMenuFiltered?.length > 0 && (
              <Grid
                mb={10}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TableContainer sx={{ maxHeight: { xs: "none", sm: 630 } }}>
                  <Table
                    size="small"
                    stickyHeader
                  >
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell style={{ width: "5%" }}>#</TableCell>
                        <TableCell style={{ width: "40%" }}>
                          Наименование модуля
                          <TextFilter
                            value={moduleNameFilter}
                            onChange={setModuleNameFilter}
                          />
                        </TableCell>
                        <TableCell style={{ width: "30%" }}>Параметры модуля</TableCell>
                        <TableCell style={{ width: "25%" }}>Активность модуля</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fullMenuFiltered.map((item) =>
                        item.chaild?.length > 0 ? (
                          <Fragment key={item.__mainIndex}>
                            <TableRow sx={{ "& th": { border: "none" } }}>
                              <TableCell>{item.__mainIndex + 1}</TableCell>
                              <TableCell
                                colSpan={3}
                                sx={{ fontWeight: "bold" }}
                              >
                                {item?.parent?.name}
                              </TableCell>
                            </TableRow>
                            {item.chaild.map((it) =>
                              it.features.length ? (
                                <Fragment key={`${item.__mainIndex}-${it.__childIndex}`}>
                                  <TableRow hover>
                                    <TableCell></TableCell>
                                    <TableCell
                                      sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: "center" }}
                                    >
                                      <li>{it.name}</li>
                                    </TableCell>
                                    <TableCell
                                      sx={{ cursor: "pointer" }}
                                      onClick={() =>
                                        openParams(
                                          `Редактирование параметров модуля: ${it.name}`,
                                          item.__mainIndex,
                                          it.__childIndex,
                                          "one",
                                        )
                                      }
                                    >
                                      <Tooltip
                                        title={
                                          <Typography color="inherit">
                                            Редактировать параметры модуля
                                          </Typography>
                                        }
                                      >
                                        <EditIcon />
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                      <Checkbox
                                        edge="end"
                                        onChange={(e) =>
                                          changeActiveModule(item.__mainIndex, it.__childIndex, e)
                                        }
                                        disabled={!canEdit("module_active")}
                                        checked={!!+it.is_active}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </Fragment>
                              ) : it?.features_cat?.length ? (
                                <Fragment key={it.__childIndex}>
                                  <TableRow hover>
                                    <TableCell></TableCell>
                                    <TableCell
                                      sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: "center" }}
                                    >
                                      <li>{it.name}</li>
                                    </TableCell>
                                    <TableCell
                                      sx={{ cursor: "pointer" }}
                                      onClick={() =>
                                        openParams(
                                          `Редактирование параметров модуля: ${it.name}`,
                                          item.__mainIndex,
                                          it.__childIndex,
                                          "two",
                                        )
                                      }
                                    >
                                      <Tooltip
                                        title={
                                          <Typography color="inherit">
                                            Редактирование свойств модуля
                                          </Typography>
                                        }
                                      >
                                        <EditIcon />
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                      <Checkbox
                                        edge="end"
                                        onChange={(e) =>
                                          changeActiveModule(item.__mainIndex, it.__childIndex, e)
                                        }
                                        disabled={!canEdit("module_active")}
                                        checked={!!+it.is_active}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </Fragment>
                              ) : (
                                <TableRow
                                  hover
                                  key={it.__childIndex}
                                >
                                  <TableCell></TableCell>
                                  <TableCell
                                    sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: "center" }}
                                  >
                                    <li>{it.name}</li>
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell>
                                    <Checkbox
                                      edge="end"
                                      onChange={(e) =>
                                        changeActiveModule(item.__mainIndex, it.__childIndex, e)
                                      }
                                      checked={!!+it.is_active}
                                      disabled={
                                        !canEdit("module_active") ||
                                        it.key_query === "home" ||
                                        it.key_query === "lk"
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </Fragment>
                        ) : (
                          <TableRow
                            hover
                            key={item.__mainIndex}
                            sx={{ "& th": { border: "none" } }}
                          >
                            <TableCell>{item.__mainIndex + 1}</TableCell>
                            <TableCell
                              colSpan={3}
                              sx={{ fontWeight: "bold" }}
                            >
                              {item?.parent?.name}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          {canEdit("app") && (
            <Button
              color="primary"
              onClick={save}
            >
              Сохранить
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(AppointmentModal);
