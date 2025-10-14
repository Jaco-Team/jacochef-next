import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CalendarToday, Close, Person, VpnKey, Work } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { Timeline } from "@mui/lab";
import Card from "@mui/material/Card";
import { CardContent } from "@mui/material";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { MyTextInput } from "@/ui/Forms";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Cookies from "js-cookie";
import MyAlert from "@/ui/MyAlert";
const ModalEdit = ({
  open,
  onClose,
  save,
  title = "Смена кода доступа",
  content = "",
  auth_code = 0,
}) => {
  const [authCode, setAuthCode] = useState(0);
  useEffect(() => {
    setAuthCode(auth_code);
  }, []);
  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={onClose}
    >
      <DialogTitle className="button">
        {title}
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
        style={{ paddingBottom: 10, paddingTop: 10 }}
      >
        <MyTextInput
          label="Код доступа"
          type="number"
          min={0}
          inputProps={{ min: 0 }}
          value={authCode}
          func={(event) => {
            setAuthCode(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button onClick={() => save(authCode)}>Подтвердить</Button>
      </DialogActions>
    </Dialog>
  );
};

const ModalChangePassword = ({ open, onClose, save, title = "Смена пароля" }) => {
  const [password, setPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState("");

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={onClose}
    >
      <DialogTitle className="button">
        {title}
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
        style={{ paddingBottom: 10, paddingTop: 10 }}
      >
        <MyTextInput
          label="Новый пароль"
          type="password"
          value={password}
          func={(event) => {
            setPassword(event.target.value);
          }}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
      </DialogContent>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
        style={{ paddingBottom: 10, paddingTop: 10 }}
      >
        <MyTextInput
          label="Повторите пароль"
          value={passwordReset}
          type="password"
          func={(event) => {
            setPasswordReset(event.target.value);
          }}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button onClick={() => save(password, passwordReset)}>Подтвердить</Button>
      </DialogActions>
    </Dialog>
  );
};
function LkPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [my, setMy] = useState({});
  const [open, setOpen] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setMy(data.my);
    });
  }, []);

  const save = (auth_code) => {
    getData("save_acc", { auth_code }).then((data) => {
      if (data.st) {
        showAlert(data.st, data.text);
        getData("get_all").then((data) => {
          setMy(data.my);
        });
      } else {
        showAlert(data.st, data.text);
      }
    });
  };

  const savePassword = (password, resetPassword) => {
    getData("save_password", { password, resetPassword }).then((data) => {
      if (data.st) {
        showAlert(data.st, data.text);
        localStorage.setItem("token", data.token);
        Cookies.set("token", data.token, { expires: 60 });
        setOpenPassword(false);
        getData("get_all").then((data) => {
          setMy(data.my);
        });
      } else {
        showAlert(data.st, data.text);
      }
    });
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("lk", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const showAlert = (status, message) => {
    setErrStatus(status);
    setErrText(message);
    setOpenAlert(true);
  };

  return (
    <Grid
      container
      spacing={3}
      mb={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      {open ? (
        <ModalEdit
          open={open}
          onClose={() => setOpen(false)}
          save={save}
          auth_code={my.auth_code}
        />
      ) : null}
      {openPassword ? (
        <ModalChangePassword
          open={openPassword}
          onClose={() => setOpenPassword(false)}
          save={savePassword}
        />
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <h1>{module.name}</h1>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            maxWidth: "900px",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                  }}
                >
                  {my.img_name ? (
                    <Avatar
                      src={`https://storage.yandexcloud.net/user-img/min-img/${my.img_name}?${my.img_update}`}
                      sx={{
                        width: 200,
                        height: 305,
                        borderColor: "primary.main",
                        borderRadius: 0,
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: "primary.main",
                        border: "3px solid",
                        borderColor: "primary.light",
                      }}
                    >
                      <Person sx={{ fontSize: 60 }} />
                    </Avatar>
                  )}
                </Paper>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 8,
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        ФИО
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "medium" }}
                      >
                        {my.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Код доступа
                      </Typography>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        {" "}
                        <span>{my.auth_code}</span>{" "}
                        <IconButton
                          style={{ marginLeft: "10px" }}
                          onClick={() => setOpen(true)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Должность */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Должность
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {my.app_name}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box>
                      <Button
                        variant="contained"
                        onClick={() => setOpenPassword(true)}
                      >
                        Сменить пароль
                      </Button>
                    </Box>
                  </Box>
                  <Divider />

                  {/* Даты */}
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Дата регистрации
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {my.date_registration}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Стаж работы
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {my.exp}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <LkPage />;
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
