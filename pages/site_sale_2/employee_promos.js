import React from "react";
import dayjs from "dayjs";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import MyAlert from "@/ui/MyAlert";
import { api_laravel } from "@/src/api_new";
import { formatDate } from "@/src/helpers/ui/formatDate";
import { EmployeePromoConfigForm } from "@/components/site_sale_2/EmployeePromoConfigForm";
import { EmployeePromoConfigHistoryPanel } from "@/components/site_sale_2/EmployeePromoConfigHistoryPanel";
import { EmployeePromoUsagePanel } from "@/components/site_sale_2/EmployeePromoUsagePanel";
import {
  getEmptyEmployeePromoForm,
  hydrateEmployeePromoConfig,
} from "@/components/site_sale_2/employeePromoConfig";
import { SiteSale2Page } from "@/components/site_sale_2/siteSale2Ui";

function normalizeEmployeePromoConfigsResponse(res) {
  if (res && (res.config !== undefined || res.scheduled_config !== undefined)) {
    return {
      config: res.config || null,
      scheduled_config: res.scheduled_config || null,
      history: Array.isArray(res.history) ? res.history : [],
      config_history: Array.isArray(res.config_history) ? res.config_history : [],
    };
  }

  const list = Array.isArray(res?.configs) ? res.configs : Array.isArray(res) ? res : [];
  const first = list[0] || null;

  return {
    config: first,
    scheduled_config: null,
    history: first && Array.isArray(first.history) ? first.history : [],
    config_history: Array.isArray(res?.config_history) ? res.config_history : [],
  };
}

class SiteSale2EmployeePromos_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "site_sale_2",
      module_name: "",
      is_load: false,
      formKey: 0,

      points: [],
      cities: [],
      items: [],
      cats: [],
      promo_action_list: [],
      promo_sale_list: [],
      catalogsReady: false,
      formReady: false,

      config: null,
      scheduled_config: null,
      history: [],
      config_history: [],

      openAlert: false,
      err_status: true,
      err_text: "",

      acces: {},
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all_for_new");

    if (!data) {
      this.showAlert(false, "Не удалось загрузить справочники");
      return;
    }

    const allData = await this.getData("get_all");

    this.setState({
      points: data.points || [],
      cities: data.cities || [],
      items: data.items || [],
      cats: data.cats || [],
      promo_action_list: data.promo_action_list || [],
      promo_sale_list: data.promo_sale_list || [],
      module_name: data.module_info ? data.module_info.name : "",
      catalogsReady: true,
      acces: (allData && allData.acces) || data.acces || {},
    });

    if (data.module_info && data.module_info.name) {
      document.title = data.module_info.name;
    }

    await this.loadConfigs();
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });
  };

  showAlert(status, text) {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  }

  getCatalogs() {
    return {
      points: this.state.points,
      cities: this.state.cities,
      items: this.state.items,
      cats: this.state.cats,
      promo_action_list: this.state.promo_action_list,
      promo_sale_list: this.state.promo_sale_list,
    };
  }

  getFormInitialData() {
    const catalogs = this.getCatalogs();

    if (this.state.scheduled_config) {
      return hydrateEmployeePromoConfig(this.state.scheduled_config, catalogs);
    }

    if (this.state.config) {
      return {
        ...hydrateEmployeePromoConfig(this.state.config, catalogs),
        effective_date: formatDate(Date.now()),
      };
    }

    return getEmptyEmployeePromoForm();
  }

  async loadConfigs() {
    const res = await this.getData("get_employee_promo_configs");

    if (!res) {
      this.showAlert(false, "Не удалось загрузить конфиг");
      this.setState({
        config: null,
        scheduled_config: null,
        history: [],
        config_history: [],
        formReady: true,
        formKey: this.state.formKey + 1,
      });
      return;
    }

    if (res.st === false) {
      this.showAlert(false, res.text_err || res.text || "Не удалось загрузить конфиг");
      this.setState({
        config: null,
        scheduled_config: null,
        history: [],
        config_history: [],
        formReady: true,
        formKey: this.state.formKey + 1,
      });
      return;
    }

    const normalized = normalizeEmployeePromoConfigsResponse(res);

    this.setState({
      config: normalized.config,
      scheduled_config: normalized.scheduled_config,
      history: normalized.history,
      config_history: normalized.config_history,
      formReady: true,
      formKey: this.state.formKey + 1,
    });
  }

  async saveConfig(payload) {
    const res = await this.getData("save_employee_promo_config", payload);

    if (!res || res.st === false) {
      this.showAlert(
        false,
        (res && (res.text_err || res.text)) || "Не удалось сохранить изменения",
      );
      return;
    }

    this.showAlert(true, res.text || "Изменения сохранены");
    await this.loadConfigs();
  }

  render() {
    const scheduled = this.state.scheduled_config;
    const scheduledDateLabel = scheduled?.effective_date
      ? dayjs(scheduled.effective_date).format("DD.MM.YYYY")
      : "";
    const editingScheduled = !!scheduled;

    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <SiteSale2Page
          title="Промокоды для сотрудников"
          subtitle="Один глобальный конфиг промокода для сотрудников"
        >
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, mb: 2.5, overflow: "hidden" }}
          >
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              {scheduled ? (
                <Alert
                  severity="info"
                  sx={{ mb: 2 }}
                >
                  Изменения запланированы на {scheduledDateLabel}. Форма редактирует отложенную
                  версию: сохранение с будущей датой заменит её. Сохранение с сегодняшней датой
                  применит изменения сразу.
                </Alert>
              ) : null}

              {this.state.catalogsReady && this.state.formReady ? (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {editingScheduled
                      ? "Редактируется запланированная версия конфига."
                      : this.state.config
                        ? "Редактируется текущий активный конфиг."
                        : "Конфиг ещё не создан — заполните форму и сохраните."}
                  </Typography>

                  <EmployeePromoUsagePanel
                    history={this.state.history}
                    cities={this.state.cities}
                    points={this.state.points}
                  />

                  <EmployeePromoConfigHistoryPanel
                    configHistory={this.state.config_history}
                    cities={this.state.cities}
                    points={this.state.points}
                    promo_action_list={this.state.promo_action_list}
                  />

                  <EmployeePromoConfigForm
                    key={this.state.formKey}
                    catalogs={this.getCatalogs()}
                    initialData={this.getFormInitialData()}
                    saveLabel="Сохранить изменения"
                    onError={(text) => this.showAlert(false, text)}
                    onSave={this.saveConfig.bind(this)}
                  />
                </>
              ) : null}
            </Box>
          </Paper>
        </SiteSale2Page>
      </>
    );
  }
}

export default function SiteSale2EmployeePromos() {
  return <SiteSale2EmployeePromos_ />;
}
