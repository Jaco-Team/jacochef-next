import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Chip from "@mui/material/Chip";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import CloseIcon from "@mui/icons-material/Close";
import {
  JacoAlert,
  JacoButton,
  JacoFieldSwitch,
  JacoIconButton,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";

// "Оценить заказ" for clients, switched separately for the site and the app.
const CLIENT_PLATFORMS = [
  { key: "site", label: "Сайт" },
  { key: "app", label: "Приложение" },
];

function FeedbackPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [formsActive, setFormsActive] = useState([]);
  const [formsNonActive, setFormsNonActive] = useState([]);
  const [active, setActive] = useState({});
  const [channelLabels, setChannelLabels] = useState({});
  const [clientSettings, setClientSettings] = useState({ site: false, app: false });
  const [settingError, setSettingError] = useState("");
  const [testers, setTesters] = useState([]);
  const [testerPhone, setTesterPhone] = useState("");
  const [testerMessage, setTesterMessage] = useState(null);
  const router = useRouter();
  const tabsData = {
    add_feedback: "Добавление новой формы",
  };

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setFormsActive(data.forms_active);
      setChannelLabels(
        Object.fromEntries(
          (data.channels_available || []).map((channel) => [channel.value, channel.label]),
        ),
      );
      const tabsCheck = Object.entries(tabsData).filter(
        ([key]) => parseInt(data.acces[key + "_access"]) === 1,
      );
      setActive(Object.fromEntries(tabsCheck));
      setFormsNonActive(data.forms_nonactive);
      setClientSettings(data.client_settings || { site: false, app: false });
      setTesters(data.client_testers || []);
    });
  }, []);

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("feedback_form", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const saveClientSetting = async (platform, enabled) => {
    setSettingError("");
    const result = await getData("save_client_setting", { platform, enabled });
    if (result?.st && result.client_settings) {
      setClientSettings(result.client_settings);
    } else {
      setSettingError(result?.text || "Не удалось сохранить настройку");
    }
  };

  // Аккаунты команды, которым оценка видна, пока для всех она выключена.
  const saveTester = async (data) => {
    setTesterMessage(null);
    const result = await getData("save_client_tester", data);
    if (Array.isArray(result?.client_testers)) {
      setTesters(result.client_testers);
    }
    if (result?.st && data.action === "add") {
      setTesterPhone("");
    }
    setTesterMessage({
      ok: Boolean(result?.st),
      text: result?.text || "Не удалось сохранить",
    });
  };

  const renderChannels = (channels) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {(channels || []).map((channel) => (
        <Chip
          key={channel.channel}
          label={`${channelLabels[channel.channel] || channel.channel} · ${channel.priority}`}
          size="small"
          variant="outlined"
        />
      ))}
    </div>
  );

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
        <JacoSurface sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 520 }}>
          <h3 style={{ margin: 0 }}>Оценка заказов клиентами</h3>
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            Кнопка «Оценить заказ» в завершённых заказах. Показываются активные формы с каналом «Сайт».
          </div>
          {CLIENT_PLATFORMS.map((platform) => (
            <JacoFieldSwitch
              key={platform.key}
              label={platform.label}
              checked={Boolean(clientSettings[platform.key])}
              disabled={!active.add_feedback || isLoad}
              onChange={(event) => saveClientSetting(platform.key, event.target.checked)}
            />
          ))}
          {settingError ? <JacoAlert severity="error">{settingError}</JacoAlert> : null}

          <h4 style={{ margin: "8px 0 0" }}>Тестировщики</h4>
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            Этим аккаунтам сайта оценка видна на сайте и в приложении, даже если выше она выключена.
          </div>
          {testers.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {testers.map((tester) => (
                <div
                  key={tester.user_id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
                >
                  <span>
                    {tester.login || `id ${tester.user_id}`}
                    {tester.name ? ` · ${tester.name}` : ""}
                  </span>
                  {active.add_feedback ? (
                    <JacoIconButton
                      aria-label={`Убрать ${tester.login || tester.user_id} из тестировщиков`}
                      disabled={isLoad}
                      onClick={() => saveTester({ action: "remove", user_id: tester.user_id })}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </JacoIconButton>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, opacity: 0.6 }}>Список пуст</div>
          )}
          {active.add_feedback ? (
            <form
              style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              onSubmit={(event) => {
                event.preventDefault();
                if (testerPhone.trim()) saveTester({ action: "add", phone: testerPhone });
              }}
            >
              <JacoTextInput
                label="Телефон аккаунта"
                placeholder="89001234567"
                value={testerPhone}
                onChange={(event) => setTesterPhone(event.target.value)}
                inputMode="tel"
              />
              <JacoButton
                type="submit"
                disabled={isLoad || !testerPhone.trim()}
              >
                Добавить
              </JacoButton>
            </form>
          ) : null}
          {testerMessage ? (
            <JacoAlert severity={testerMessage.ok ? "success" : "error"}>{testerMessage.text}</JacoAlert>
          ) : null}
        </JacoSurface>
      </Grid>
      {active.add_feedback ? (
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Button
            variant="contained"
            onClick={() => router.push("/feedback_form/new")}
          >
            Добавить новую форму
          </Button>
        </Grid>
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <h3>Активные формы</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Создатель</TableCell>
              <TableCell>Каналы и приоритет</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formsActive.map((it, k) => (
              <TableRow
                style={{ cursor: "pointer" }}
                hover
                key={it.name}
                onClick={() => router.push(`/feedback_form/${it.id}`)}
              >
                <TableCell>{k + 1}</TableCell>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.date}</TableCell>
                <TableCell>{it.user_name}</TableCell>
                <TableCell>{renderChannels(it.channels)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <h3>Не активные формы</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Создатель</TableCell>
              <TableCell>Каналы и приоритет</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formsNonActive.map((it, k) => (
              <TableRow
                style={{ cursor: "pointer" }}
                hover
                key={it.name}
                onClick={() => router.push(`/feedback_form/${it.id}`)}
              >
                <TableCell>{k + 1}</TableCell>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.date}</TableCell>
                <TableCell>{it.user_name}</TableCell>
                <TableCell>{renderChannels(it.channels)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <FeedbackPage />;
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
