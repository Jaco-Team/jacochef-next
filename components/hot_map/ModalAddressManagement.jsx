import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { MyTextInput } from "@/ui/Forms";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { CardContent } from "@mui/material";
import YandexMapAddressPicker from "@/components/hot_map/YandexMapAddressPicker";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";
import YandexMapAddressTextField from "@/components/hot_map/YandexMapAddressTextField";

export const ModalAddressManagement = ({ open, onClose, save, centerMap }) => {
  const [value, setValue] = useState("list");
  const [tip, setTip] = useState("");
  const [mapSelectedAddresses, setMapSelectedAddresses] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrorStatus] = useState(false);
  const [errText, setErrorText] = useState("");
  const [name, setName] = useState("");
  const [dataAddress, setDataAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const YANDEX_MAPS_API_KEY = "665f5b53-8905-4934-9502-4a6a7b06a900";
  const YANDEX_MAPS_API_SUGGEST_KEY = "15826a23-3220-4e58-acdf-05db437d0837";
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  useEffect(() => {
    if (open) {
      //setValue(defaultValue || "");
    }
  }, [open]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  const handleSave = () => {
    save(name, dataAddress);
  };

  const handleSaveAddress = () => {
    const dt = [...dataAddress];
    const date = dayjs(new Date()).format("YYYY-MM-DD HH:mm");
    setOpenAlert(true);
    setErrorStatus(true);
    setErrorText(`Вы успешно добавили адрес ${selectedAddress.address}`);
    dt.push({ ...selectedAddress, tip, date_create: date });
    setDataAddress(dt);
    setSelectedAddress("");
  };

  const handleSaveAddressMulti = () => {
    const dt = [...dataAddress];
    const date = dayjs(new Date()).format("YYYY-MM-DD HH:mm");
    setOpenAlert(true);
    setErrorStatus(true);
    setErrorText(`Вы успешно добавили адреса`);
    const m = mapSelectedAddresses.map((item) => ({
      ...item,
      tip,
      date_create: date,
    }));
    setDataAddress([...dt, ...m]);
    setMapSelectedAddresses([]);
  };

  const deleteAddress = (index) => {
    const dt = [...dataAddress].filter((it, k) => k !== index);
    setDataAddress(dt);
  };

  const access = {
    list: "Список адресов",
    add_map: "Добавить на карте",
    add_hands: "Добавить вручную",
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="lg"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Создание группы адресов</DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        <MyAlert
          isOpen={openAlert}
          onClose={() => setOpenAlert(false)}
          status={errStatus}
          text={errText}
        />
        <Grid
          style={{ paddingBottom: 24 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Paper>
            <TabContext value={value}>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons={false}
              >
                {Object.entries(access).map(([value, key]) => (
                  <Tab
                    label={key}
                    value={value}
                  />
                ))}
              </Tabs>
            </TabContext>
          </Paper>
        </Grid>
        <Grid
          style={{ paddingTop: 0 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <TabContext value={value}>
            <TabPanel value="list">
              <Grid style={{ marginTop: "10px" }}>
                <MyTextInput
                  value={name}
                  func={(e) => setName(e.target.value)}
                  label="Название группы"
                />
              </Grid>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Адрес</TableCell>
                      <TableCell>Примечания</TableCell>
                      <TableCell>Дата создания</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataAddress.map((it, k) => (
                      <TableRow
                        hover
                        key={k}
                      >
                        <TableCell>{it.address}</TableCell>
                        <TableCell>{it.tip ? it.tip : "-"}</TableCell>
                        <TableCell>{it.date_create}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => deleteAddress(k)}>
                            <DeleteIcon style={{ color: "red" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            <TabPanel value="add_map">
              <Box sx={{ p: 3 }}>
                <Card>
                  <CardContent>
                    <YandexMapAddressPicker
                      centerMap={centerMap}
                      onMultipleAddressesSelect={setMapSelectedAddresses}
                      allowMultiple={true}
                      maxMarkers={8}
                      apiKey={YANDEX_MAPS_API_KEY}
                      initialAddress={selectedAddress?.address || ""}
                    />
                  </CardContent>
                </Card>

                <Grid style={{ marginTop: "10px" }}>
                  <MyTextInput
                    value={tip}
                    func={(e) => setTip(e.target.value)}
                    label="Примечание"
                  />
                </Grid>

                <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveAddressMulti}
                    disabled={!mapSelectedAddresses.length}
                  >
                    Сохранить адрес
                  </Button>
                </Box>
              </Box>
            </TabPanel>
            <TabPanel value="add_hands">
              <Box sx={{ p: 3 }}>
                <Card>
                  <CardContent>
                    <YandexMapAddressTextField
                      onAddressSelect={handleAddressSelect}
                      apiKey={YANDEX_MAPS_API_KEY}
                      centerMap={centerMap}
                      apiKeySuggest={YANDEX_MAPS_API_SUGGEST_KEY}
                      initialAddress={selectedAddress?.address || ""}
                    />
                  </CardContent>
                </Card>

                {selectedAddress && (
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                      >
                        Выбранный адрес
                      </Typography>
                      <Typography variant="body1">{selectedAddress.address}</Typography>
                    </CardContent>
                  </Card>
                )}
                <Grid style={{ marginTop: "10px" }}>
                  <MyTextInput
                    value={tip}
                    func={(e) => setTip(e.target.value)}
                    label="Примечание"
                  />
                </Grid>

                <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedAddress(null)}
                    disabled={!selectedAddress}
                  >
                    Сбросить
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSaveAddress}
                    disabled={!selectedAddress}
                  >
                    Сохранить адрес
                  </Button>
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={handleClose}
        >
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};
