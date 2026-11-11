import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { CalendarToday, Close, VpnKey, Work } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { Timeline } from "@mui/lab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { MyTextInput } from "@/ui/Forms";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Cookies from "js-cookie";
import MyAlert from "@/ui/MyAlert";
import LkDashboard from "@/components/lk/LkDashboard";
import LkSidebar from "@/components/lk/LkSidebar";
import { LK_SECTION, getLkSections } from "@/components/lk/lkSections";
import { JacoAutocomplete } from "@/design-system/shared/ui";
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
  const [dashboard, setDashboard] = useState(null);
  const [canViewEmployees, setCanViewEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewed, setViewed] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(LK_SECTION.overview);
  const requestedEmployeeId = useRef(null);

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setMy(data.my);

      if (Number(data.access?.view_other_employees_access) === 1) {
        setCanViewEmployees(true);
        api_laravel("lk", "get_employees").then((result) => {
          if (result?.data?.st) {
            setEmployees(result.data.employees ?? []);
          }
        });
      }
    });
    api_laravel("lk", "get_dashboard").then((result) => {
      if (result?.data?.st) {
        setDashboard(result.data);
      }
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

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    requestedEmployeeId.current = employee?.id ?? null;

    if (!employee) {
      setViewed(null);
      return;
    }

    getData("get_employee", { user_id: employee.id }).then((data) => {
      if (requestedEmployeeId.current !== employee.id) {
        return;
      }

      if (data?.st) {
        setViewed(data);
      } else {
        requestedEmployeeId.current = null;
        setSelectedEmployee(null);
        setViewed(null);
        showAlert(false, data?.text);
      }
    });
  };

  const shownMy = viewed?.my ?? my;
  const shownDashboard = viewed ?? dashboard;
  const employeeOptions = employees.filter((employee) => employee.id !== my.id);
  const sections = getLkSections(shownDashboard, { isOwn: !viewed });
  const activeSectionId = sections.some((section) => section.id === selectedSectionId)
    ? selectedSectionId
    : LK_SECTION.overview;

  const goToSection = (sectionId) => {
    setSelectedSectionId(sectionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
      sx={{
        mb: 3,
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
      <Grid size={12}>
        <h1>{module.name}</h1>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 4,
          lg: 3,
        }}
        sx={{ height: "max-content", position: { md: "sticky" }, top: { md: "88px" } }}
      >
        <LkSidebar
          my={shownMy}
          workplace={shownDashboard?.workplace}
          sections={sections}
          activeSectionId={activeSectionId}
          onNavigate={goToSection}
          employeeSelect={
            canViewEmployees ? (
              <JacoAutocomplete
                label="Сотрудник"
                placeholder="Выберите сотрудника"
                options={employeeOptions}
                value={selectedEmployee}
                onChange={(_event, employee) => selectEmployee(employee)}
                getOptionLabel={(employee) =>
                  [employee?.name, employee?.app_name].filter(Boolean).join(" — ")
                }
                isOptionEqualToValue={(employee, selected) => employee.id === selected.id}
                getOptionKey={(employee) => employee.id}
              />
            ) : null
          }
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 8,
          lg: 9,
        }}
      >
        <LkDashboard
          key={`${shownMy?.id ?? "own"}-${activeSectionId}`}
          dashboard={shownDashboard}
          sections={sections}
          activeSectionId={activeSectionId}
          my={shownMy}
          isOwn={!viewed}
          onNavigate={goToSection}
          onEditCode={() => setOpen(true)}
          onChangePassword={() => setOpenPassword(true)}
        />
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
