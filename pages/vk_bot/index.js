import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { IOSSwitch, ModalAddNewGroup } from "@/components/vk_bot/ModalAddNewGroup";
import { ModalEditNewGroup } from "@/components/vk_bot/ModalEditNewGroup";
import { ModalAccept } from "@/components/general/ModalAccept";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ModalAddNewTrigger } from "@/components/vk_bot/ModalAddNewTrigger";
import { ModalEditNewTrigger } from "@/components/vk_bot/ModaEditNewTrigger";
import { ModalCopyTrigger } from "@/components/vk_bot/ModalCopyTrigger";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MyAlert from "@/ui/MyAlert";

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const TYPE_VK = [
  { id: 1, type_vk: "message", name: "Сообщение" },
  { id: 2, type_vk: "group_join", name: "Вступление в группу" },
  { id: 3, type_vk: "prize", name: "Приз" },
  { id: 4, type_vk: "prize_failed", name: "Не найден приз" },
];

export const MATCH_TYPE = [
  { id: 1, match_type: "contains", name: "Содержит" },
  { id: 2, match_type: "exact", name: "Точная надпись" },
];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function VkBotPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [searchItem, setSearchItem] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [groupSelect, setGroupSelect] = useState({});
  const [event, setEvent] = useState({});
  const [dataGroup, setDataGroup] = useState([]);
  const [dataTrigger, setDataTrigger] = useState([]);
  const [group, setGroup] = useState({});
  const [trigger, setTrigger] = useState({});
  const [cities, setCities] = useState([]);
  const [openModalAddGroup, setOpenModalGroup] = useState(false);
  const [openModalEditGroup, setOpenModalEditGroup] = useState(false);
  const [openModalDeleteGroup, setOpenModalDeleteGroup] = useState(false);
  const [openModalAddTrigger, setOpenModalTrigger] = useState(false);
  const [openModalCopyTrigger, setOpenModalCopyTrigger] = useState(false);
  const [openModalEditTrigger, setOpenModalEditTrigger] = useState(false);
  const [openModalDeleteTrigger, setOpenModalDeleteTrigger] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const debouncedSearch = useDebounce(searchTrigger, 700);
  const debouncedSearchItem = useDebounce(searchItem, 700);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      const groupId = groupSelect?.vk_group_id || "";
      getData("get_search_trigger", {
        search: debouncedSearch,
        event: event?.type_vk,
        group_id: groupId,
      }).then((data2) => {
        setDataTrigger(data2.group);
      });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (debouncedSearchItem !== undefined) {
      const groupId = groupSelect?.vk_group_id || "";
      getData("get_search_group", {
        search: debouncedSearchItem,
      }).then((data2) => {
        setDataGroup(data2.group);
      });
    }
  }, [debouncedSearchItem]);

  const changeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setDataGroup(data.groups ?? []);
      setDataTrigger(data.triggers ?? []);
      setCities(data.cities);
    });
  }, []);

  const saveGroup = (group) => {
    getData("save_group", { group }).then((data2) => {
      update();
      setOpenModalGroup(false);
    });
  };

  const saveTrigger = (group) => {
    getData("save_trigger", { group }).then((data2) => {
      update();
      setOpenModalTrigger(false);
    });
  };

  const editGroup = (group) => {
    getData("save_edit_group", { group }).then((data2) => {
      update();
      setOpenModalEditGroup(false);
    });
  };

  const editTrigger = (group) => {
    getData("save_edit_trigger", { group }).then((data2) => {
      update();
      setOpenModalEditTrigger(false);
    });
  };

  const update = () => {
    getData("get_all").then((data) => {
      setDataGroup(data.groups ?? []);
      setDataTrigger(data.triggers ?? []);
      setCities(data.cities);
    });
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);
    try {
      const result = await api_laravel("vk_bot", method, data);
      if (result?.data?.text) {
        setErrStatus(result.data?.st);
        setErrText(result.data?.text);
        setOpenAlert(true);
      }

      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const checkValid = (it) => {
    getData("check_valid", it).then((data2) => {
      console.log(data2);
      update();
    });
  };

  const getGroup = (it) => {
    getData("get_one_group", it).then((data2) => {
      const group2 = { ...data2.group, city_id: cities.find((i) => i.id === data2.group.city_id) };
      setGroup(group2);
      setOpenModalEditGroup(true);
    });
  };

  const getTrigger = (it) => {
    getData("get_one_trigger", it).then((data2) => {
      const group2 = {
        ...data2.group,
        city_id: cities.find((i) => i.id === data2.group.city_id),
        vk_group_id: dataGroup.find((i) => i.vk_group_id === data2.group.vk_group_id),
        type_vk: TYPE_VK.find((i) => i.type_vk === data2.group.type_vk),
        match_type: MATCH_TYPE.find((i) => i.match_type === data2.group.match_type),
      };
      setTrigger(group2);
      setOpenModalEditTrigger(true);
    });
  };

  const copyTriggerOpen = (it) => {
    setTrigger(it);
    setOpenModalCopyTrigger(true);
  };

  const copyTrigger = (data) => {
    getData("copy_trigger", { id: trigger.id, group: data }).then((data2) => {
      update();
      setOpenModalCopyTrigger(false);
    });
  };

  const deleteGroup = () => {
    getData("delete_group", { id: group.id }).then((data2) => {
      update();
      setOpenModalDeleteGroup(false);
    });
  };

  const changeActiveGroup = (id, active) => {
    getData("change_trigger_active", { id, active }).then((data2) => {
      update();
    });
  };

  const searchTriggerFunc = () => {
    setTimeout(() => {
      getData("get_search_trigger", {
        search: searchTrigger,
        event: event?.type_vk,
        group_id: groupSelect?.vk_group_id,
      }).then((data2) => {
        setDataTrigger(data2.group);
      });
    }, 700);
  };

  useEffect(() => {
    searchTriggerFunc();
  }, [groupSelect, event]);

  const deleteTrigger = () => {
    getData("delete_trigger", { id: trigger.id }).then((data2) => {
      update();
      setOpenModalDeleteTrigger(false);
    });
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{ xs: 12, sm: 12 }}
      sx={{ mb: 3 }}
    >
      {openModalAddGroup ? (
        <ModalAddNewGroup
          save={saveGroup}
          open={openModalAddGroup}
          cities={cities}
          onClose={() => setOpenModalGroup(false)}
        />
      ) : null}
      {openModalAddTrigger ? (
        <ModalAddNewTrigger
          save={saveTrigger}
          open={openModalAddTrigger}
          groups={dataGroup}
          onClose={() => setOpenModalTrigger(false)}
        />
      ) : null}
      {openModalDeleteGroup ? (
        <ModalAccept
          open={openModalDeleteGroup}
          onClose={() => setOpenModalEditGroup(false)}
          save={() => {
            deleteGroup();
          }}
        />
      ) : null}
      {openModalDeleteTrigger ? (
        <ModalAccept
          open={openModalDeleteTrigger}
          onClose={() => setOpenModalEditTrigger(false)}
          save={() => {
            deleteTrigger();
          }}
        />
      ) : null}
      {openModalEditGroup ? (
        <ModalEditNewGroup
          save={editGroup}
          open={openModalEditGroup}
          defaultValue={group}
          cities={cities}
          onClose={() => setOpenModalEditGroup(false)}
        />
      ) : null}
      {openModalEditTrigger ? (
        <ModalEditNewTrigger
          save={editTrigger}
          open={openModalEditTrigger}
          defaultValue={trigger}
          groups={dataGroup}
          onClose={() => setOpenModalEditTrigger(false)}
        />
      ) : null}
      {openModalCopyTrigger ? (
        <ModalCopyTrigger
          save={copyTrigger}
          open={openModalCopyTrigger}
          defaultValue={trigger}
          groups={dataGroup}
          onClose={() => setOpenModalCopyTrigger(false)}
        />
      ) : null}
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid size={{ xs: 12, sm: 6 }}>
        <h1>{module.name}</h1>
      </Grid>
      <Grid
        style={{ paddingBottom: 24 }}
        size={{ xs: 12, sm: 12 }}
      >
        <Paper>
          <Tabs
            value={activeTab}
            onChange={changeTab}
            centered
            variant="fullWidth"
          >
            <Tab
              label="Группы ВК"
              {...a11yProps(0)}
            />
            <Tab
              label="Триггеры"
              {...a11yProps(1)}
            />
          </Tabs>

          <TabPanel
            value={activeTab}
            index={0}
          >
            <Grid
              container
              spacing={3}
              className="container_first_child"
              size={{ xs: 12, sm: 12 }}
              sx={{ mb: 3 }}
            >
              <Grid size={{ xs: 12, sm: 9 }}>
                <h1>Группы ВКонтакте</h1>
                <h4 style={{ color: "#666" }}>Управление подключёнными сообществами</h4>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenModalGroup(true)}
                >
                  {" "}
                  <AddIcon /> Добавить группу
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyTextInput
                  label="Поиск..."
                  inputAdornment={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <IconButton>
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      </>
                    ),
                  }}
                  value={searchItem}
                  func={(event) => {
                    setSearchItem(event.target.value);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 9 }}></Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                {dataGroup.length ? (
                  <TableContainer component={Paper}>
                    <Table
                      stickyHeader
                      aria-label="sticky table"
                    >
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "20%" }}>Название</TableCell>
                          <TableCell style={{ width: "20%" }}>VK Group ID</TableCell>
                          <TableCell style={{ width: "10%" }}>Статус</TableCell>
                          <TableCell style={{ width: "15%" }}>Токен</TableCell>
                          <TableCell style={{ width: "10%" }}>Добавлена</TableCell>
                          <TableCell style={{ width: "10%" }}>Действия</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {dataGroup.map((it, key) => (
                          <TableRow
                            key={key}
                            hover
                          >
                            <TableCell>{it.name}</TableCell>
                            <TableCell>{it.vk_group_id}</TableCell>
                            <TableCell>
                              <div
                                style={
                                  it.is_active
                                    ? {
                                        padding: "4px",
                                        backgroundColor: "#e7f2fe",
                                        color: "#526ccc",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        width: "90px",
                                      }
                                    : {
                                        padding: "4px",
                                        backgroundColor: "#f3f5f7",
                                        color: "#908a94",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                      }
                                }
                              >
                                {it.is_active_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div
                                style={
                                  it.is_valid_token
                                    ? {
                                        padding: "4px",
                                        backgroundColor: "#e9fbf0",
                                        color: "#378460",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        width: "90px",
                                      }
                                    : {
                                        padding: "4px",
                                        backgroundColor: "#fbe9e9",
                                        color: "#af1d1d",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        width: "110px",
                                      }
                                }
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  {it.is_valid_token ? (
                                    <CheckIcon
                                      style={{ color: "#378460", margin: "0 4px", width: "16px" }}
                                    />
                                  ) : (
                                    <CloseIcon
                                      tyle={{ color: "#af1d1d", margin: "0 4px", width: "16px" }}
                                    />
                                  )}{" "}
                                  {it.is_valid_token_name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{it.date_create}</TableCell>
                            <TableCell style={{ cursor: "pointer" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <IconButton onClick={() => checkValid(it)}>
                                  <CheckIcon style={{ color: "green" }} />
                                </IconButton>
                                <IconButton onClick={() => getGroup(it)}>
                                  <EditIcon style={{ color: "black" }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    setGroup(it);
                                    setOpenModalDeleteGroup(true);
                                  }}
                                >
                                  <DeleteIcon style={{ color: "red" }} />
                                </IconButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : null}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel
            value={activeTab}
            index={1}
          >
            <Grid
              container
              spacing={3}
              className="container_first_child"
              size={{ xs: 12, sm: 12 }}
              sx={{ mb: 3 }}
            >
              <Grid size={{ xs: 12, sm: 9 }}>
                <h1>Триггерные фразы</h1>
                <h4 style={{ color: "#666" }}>Автоматические ответы на события в группах</h4>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenModalTrigger(true)}
                >
                  {" "}
                  <AddIcon /> Добавить триггер
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyTextInput
                  label="Поиск..."
                  inputAdornment={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <IconButton>
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      </>
                    ),
                  }}
                  value={searchTrigger}
                  func={(event) => {
                    setSearchTrigger(event.target.value);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Группы"
                  data={dataGroup}
                  multiple={false}
                  value={groupSelect}
                  func={(event, data) => {
                    setGroupSelect(data);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="События"
                  data={TYPE_VK}
                  multiple={false}
                  value={event}
                  func={(event, data) => {
                    setEvent(data);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                {dataTrigger.length ? (
                  <TableContainer component={Paper}>
                    <Table
                      stickyHeader
                      aria-label="sticky table"
                    >
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "20%" }}>Название</TableCell>
                          <TableCell style={{ width: "15%" }}>Группа</TableCell>
                          <TableCell style={{ width: "10%" }}>Событие</TableCell>
                          <TableCell style={{ width: "5%" }}>Режим</TableCell>
                          <TableCell style={{ width: "10%" }}>Фразы</TableCell>
                          <TableCell style={{ width: "10%" }}>Активен</TableCell>
                          <TableCell style={{ width: "10%" }}>Действия</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {dataTrigger.map((it, key) => (
                          <TableRow
                            key={key}
                            hover
                          >
                            <TableCell>{it.trigger_name}</TableCell>
                            <TableCell>{it.group_name}</TableCell>
                            <TableCell>
                              <div
                                style={{
                                  padding: "4px",
                                  backgroundColor: "#f3f5f7",
                                  color: "black",
                                  borderRadius: "12px",
                                  textAlign: "center",
                                }}
                              >
                                {it.type_message}
                              </div>
                            </TableCell>
                            <TableCell>{it.match_type}</TableCell>
                            <TableCell>{it.phrase}</TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <IOSSwitch
                                    checked={it.is_active}
                                    onChange={(e) => changeActiveGroup(it.id, e.target.checked)}
                                    color="secondary"
                                    size="medium"
                                  />
                                }
                                labelPlacement="right"
                                label=""
                              />
                            </TableCell>
                            <TableCell style={{ cursor: "pointer" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <IconButton onClick={() => copyTriggerOpen(it)}>
                                  <ContentCopyIcon style={{ color: "black" }} />
                                </IconButton>
                                <IconButton onClick={() => getTrigger(it)}>
                                  <EditIcon style={{ color: "black" }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    setTrigger(it);
                                    setOpenModalDeleteTrigger(true);
                                  }}
                                >
                                  <DeleteIcon style={{ color: "red" }} />
                                </IconButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : null}
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Grid>
    </Grid>
  );
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
