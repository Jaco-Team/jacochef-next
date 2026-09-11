import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import MyAlert from "@/ui/MyAlert";
import { MySelect } from "@/ui/Forms";
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
      templates: Array.isArray(res.templates) ? res.templates : [],
      history: Array.isArray(res.history) ? res.history : [],
      config_history: Array.isArray(res.config_history) ? res.config_history : [],
    };
  }

  const list = Array.isArray(res?.configs) ? res.configs : Array.isArray(res) ? res : [];
  const first = list[0] || null;

  return {
    config: first,
    scheduled_config: null,
    templates: first
      ? [{ promo_city: first.promo_city || 0, config: first, scheduled_config: null }]
      : [],
    history: first && Array.isArray(first.history) ? first.history : [],
    config_history: Array.isArray(res?.config_history) ? res.config_history : [],
  };
}

function isTemplateVersionActive(config) {
  return (
    !!config &&
    (config.is_active == null || config.is_active === true || parseInt(config.is_active, 10) === 1)
  );
}

function templateHasActiveState(template) {
  return (
    isTemplateVersionActive(template?.config) || isTemplateVersionActive(template?.scheduled_config)
  );
}

class SiteSale2EmployeePromos_ extends React.Component {
  constructor(props) {
    super(props);

    const isCreateRoute = props.mode === "create";
    const hasInitialPromoCity = !isCreateRoute && Number.isInteger(props.initialPromoCity);
    const initialPromoCity = hasInitialPromoCity ? props.initialPromoCity : 0;

    this.state = {
      module: "site_sale_2",
      module_name: "",
      is_load: false,
      formKey: 0,
      activeTab: 0,
      selectedPromoCity: initialPromoCity,
      settingsView: isCreateRoute ? "create" : hasInitialPromoCity ? "edit" : "list",
      templateNotFound: false,

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
      templates: [],
      history: [],
      config_history: [],
      promoStats: {
        summary: {},
        rows: [],
      },

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

    await new Promise((resolve) => {
      this.setState(
        {
          points: data.points || [],
          cities: data.cities || [],
          items: data.items || [],
          cats: data.cats || [],
          promo_action_list: data.promo_action_list || [],
          promo_sale_list: data.promo_sale_list || [],
          module_name: data.module_info ? data.module_info.name : "",
          catalogsReady: true,
          acces: (allData && allData.acces) || data.acces || {},
        },
        resolve,
      );
    });

    if (data.module_info && data.module_info.name) {
      document.title = data.module_info.name;
    }

    if (this.props.mode === "create") {
      await this.loadCreateTemplate();
    } else {
      await this.loadConfigs(this.state.selectedPromoCity);
    }
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

  getPromoCityOptions(cities = this.state.cities) {
    const cityOptions = (cities || []).filter((city) => parseInt(city.id, 10) !== 0);

    return [{ id: 0, name: "Вся сеть" }, ...cityOptions];
  }

  getAvailableCreateOptions(templates = this.state.templates, cities = this.state.cities) {
    const availableTemplates = Array.isArray(templates) ? templates : [];
    const occupiedCities = new Set(
      availableTemplates.map((template) => parseInt(template.promo_city, 10) || 0),
    );
    const hasActiveNetworkTemplate = availableTemplates.some(
      (template) => parseInt(template.promo_city, 10) === 0 && templateHasActiveState(template),
    );
    const hasActiveCityTemplate = availableTemplates.some(
      (template) => parseInt(template.promo_city, 10) > 0 && templateHasActiveState(template),
    );

    return this.getPromoCityOptions(cities).filter((option) => {
      const promoCity = parseInt(option.id, 10) || 0;

      if (occupiedCities.has(promoCity)) {
        return false;
      }

      return promoCity === 0 ? !hasActiveCityTemplate : !hasActiveNetworkTemplate;
    });
  }

  getPromoCityName(promoCity) {
    return (
      this.getPromoCityOptions().find(
        (option) => parseInt(option.id, 10) === parseInt(promoCity, 10),
      )?.name || `Город #${promoCity}`
    );
  }

  openTemplate(promoCity) {
    const selectedPromoCity = Math.max(0, parseInt(promoCity, 10) || 0);

    this.props.router.push(`/site_sale_2/employee_promos/${selectedPromoCity}`);
  }

  startCreateTemplate() {
    if (!this.getAvailableCreateOptions().length) {
      return;
    }

    this.props.router.push("/site_sale_2/employee_promos/new");
  }

  changeCreatePromoCity(event) {
    const available = this.getAvailableCreateOptions();
    const requestedCity = Math.max(0, parseInt(event.target.value, 10) || 0);
    const selectedPromoCity = available.some((option) => parseInt(option.id, 10) === requestedCity)
      ? requestedCity
      : parseInt(available[0]?.id, 10) || 0;

    this.setState({
      selectedPromoCity,
      formKey: this.state.formKey + 1,
    });
  }

  backToTemplateList() {
    this.props.router.push("/site_sale_2/employee_promos");
  }

  getFormInitialData() {
    const catalogs = this.getCatalogs();

    if (this.state.scheduled_config) {
      return {
        ...hydrateEmployeePromoConfig(this.state.scheduled_config, catalogs),
        city: this.state.selectedPromoCity,
      };
    }

    if (this.state.config) {
      return {
        ...hydrateEmployeePromoConfig(this.state.config, catalogs),
        effective_date: formatDate(Date.now()),
        city: this.state.selectedPromoCity,
      };
    }

    return {
      ...getEmptyEmployeePromoForm(),
      city: this.state.selectedPromoCity,
    };
  }

  async loadCreateTemplate() {
    const res = await this.getData("get_employee_promo_configs", { promo_city: 0 });

    if (!res || res.st === false) {
      this.showAlert(
        false,
        (res && (res.text_err || res.text)) || "Не удалось загрузить данные для нового шаблона",
      );
      await this.props.router.replace("/site_sale_2/employee_promos");
      return;
    }

    const normalized = normalizeEmployeePromoConfigsResponse(res);
    const available = this.getAvailableCreateOptions(normalized.templates);

    if (!available.length) {
      await this.props.router.replace("/site_sale_2/employee_promos");
      return;
    }

    this.setState({
      selectedPromoCity: parseInt(available[0].id, 10) || 0,
      settingsView: "create",
      config: null,
      scheduled_config: null,
      templates: normalized.templates,
      history: [],
      config_history: [],
      templateNotFound: false,
      formReady: true,
      formKey: this.state.formKey + 1,
    });
  }

  async loadConfigs(promoCity = this.state.selectedPromoCity) {
    const res = await this.getData("get_employee_promo_configs", { promo_city: promoCity });

    if (!res) {
      this.showAlert(false, "Не удалось загрузить шаблон");
      this.setState({
        config: null,
        scheduled_config: null,
        templates: [],
        history: [],
        config_history: [],
        templateNotFound: this.state.settingsView === "edit",
        formReady: true,
        formKey: this.state.formKey + 1,
      });
      return;
    }

    if (res.st === false) {
      this.showAlert(false, res.text_err || res.text || "Не удалось загрузить шаблон");
      this.setState({
        config: null,
        scheduled_config: null,
        templates: [],
        history: [],
        config_history: [],
        templateNotFound: this.state.settingsView === "edit",
        formReady: true,
        formKey: this.state.formKey + 1,
      });
      return;
    }

    const normalized = normalizeEmployeePromoConfigsResponse(res);
    const templateExists = normalized.templates.some(
      (template) => parseInt(template.promo_city, 10) === parseInt(promoCity, 10),
    );

    this.setState({
      config: normalized.config,
      scheduled_config: normalized.scheduled_config,
      templates: normalized.templates,
      history: normalized.history,
      config_history: normalized.config_history,
      templateNotFound: this.state.settingsView === "edit" && !templateExists,
      formReady: true,
      formKey: this.state.formKey + 1,
    });
  }

  async saveConfig(payload) {
    const promoCity = this.state.selectedPromoCity;
    const isCreating = this.state.settingsView === "create";
    const res = await this.getData("save_employee_promo_config", {
      ...payload,
      promo_where: 1,
      promo_city: promoCity,
      promo_point: 0,
    });

    if (!res || res.st === false) {
      this.showAlert(
        false,
        (res && (res.text_err || res.text)) || "Не удалось сохранить изменения",
      );
      return;
    }

    this.showAlert(true, res.text || "Изменения сохранены");

    if (isCreating) {
      await this.props.router.push(`/site_sale_2/employee_promos/${promoCity}`);
      return;
    }

    await this.loadConfigs(promoCity);
  }

  async loadEmployeePromoStats(filters) {
    try {
      const res = await this.getData("get_employee_promo_stats", filters);

      if (!res || res.st === false) {
        this.showAlert(
          false,
          (res && (res.text_err || res.text)) || "Не удалось загрузить статистику",
        );
        return;
      }

      this.setState({
        promoStats: {
          summary: res.summary || {},
          rows: Array.isArray(res.rows) ? res.rows : [],
        },
      });
    } catch (error) {
      this.showAlert(false, "Не удалось загрузить статистику");
    }
  }

  getTemplateStatus(template) {
    const currentIsActive = isTemplateVersionActive(template.config);
    const pendingIsActive = isTemplateVersionActive(template.scheduled_config);

    if (template.config && template.scheduled_config) {
      if (currentIsActive !== pendingIsActive) {
        return {
          label: currentIsActive
            ? "Активный · отключение запланировано"
            : "Неактивен · включение запланировано",
          color: "warning",
        };
      }

      return {
        label: `${currentIsActive ? "Активный" : "Неактивен"} · есть отложенные изменения`,
        color: "warning",
      };
    }

    if (template.config) {
      return currentIsActive
        ? { label: "Активный", color: "success" }
        : { label: "Неактивен", color: "default" };
    }

    return pendingIsActive
      ? { label: "Запланирован", color: "info" }
      : { label: "Запланирован · будет неактивен", color: "default" };
  }

  renderTemplateDates(template) {
    const activeDate = template.config?.effective_date;
    const scheduledDate = template.scheduled_config?.effective_date;

    return (
      <Box>
        {activeDate ? (
          <Typography variant="body2">
            Действует с {dayjs(activeDate).format("DD.MM.YYYY")}
          </Typography>
        ) : null}
        {scheduledDate ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {template.config ? "Изменения" : "Запланирован"} с{" "}
            {dayjs(scheduledDate).format("DD.MM.YYYY")}
          </Typography>
        ) : null}
      </Box>
    );
  }

  renderTemplateList() {
    const templates = Array.isArray(this.state.templates) ? this.state.templates : [];
    const createOptions = this.getAvailableCreateOptions();
    const hasActiveNetworkTemplate = templates.some(
      (template) => parseInt(template.promo_city, 10) === 0 && templateHasActiveState(template),
    );
    const hasActiveCityTemplate = templates.some(
      (template) => parseInt(template.promo_city, 10) > 0 && templateHasActiveState(template),
    );

    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Созданные шаблоны
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Выберите шаблон для редактирования или создайте новый для доступной территории.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!createOptions.length}
            onClick={this.startCreateTemplate.bind(this)}
            sx={{ alignSelf: { xs: "stretch", sm: "center" }, whiteSpace: "nowrap" }}
          >
            Создать шаблон
          </Button>
        </Box>

        {!createOptions.length && templates.length ? (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
          >
            {hasActiveNetworkTemplate
              ? "Активный шаблон «Вся сеть» уже существует, поэтому создать городской шаблон нельзя. Сначала сделайте сетевой шаблон неактивным."
              : hasActiveCityTemplate
                ? "Для всех доступных городов шаблоны уже созданы. Активные городские шаблоны не позволяют создать активный шаблон «Вся сеть»."
                : "Для всех доступных территорий шаблоны уже созданы."}
          </Alert>
        ) : null}

        {createOptions.length && hasActiveCityTemplate && !hasActiveNetworkTemplate ? (
          <Alert
            severity="info"
            sx={{ mb: 2, py: 0 }}
          >
            Пока существуют активные городские шаблоны, активный шаблон «Вся сеть» недоступен. Можно
            добавить шаблон только для ещё не настроенного города.
          </Alert>
        ) : null}

        {templates.length ? (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      bgcolor: "grey.50",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>Территория</TableCell>
                  <TableCell>Состояние</TableCell>
                  <TableCell>Дата действия / изменений</TableCell>
                  <TableCell align="right">Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => {
                  const promoCity = parseInt(template.promo_city, 10) || 0;
                  const status = this.getTemplateStatus(template);

                  return (
                    <TableRow
                      key={promoCity}
                      hover
                      tabIndex={0}
                      role="button"
                      onClick={() => this.openTemplate(promoCity)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          this.openTemplate(promoCity);
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {this.getPromoCityName(promoCity)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={status.color}
                          label={status.label}
                          variant={status.color === "warning" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 190 }}>
                        {this.renderTemplateDates(template)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            this.openTemplate(promoCity);
                          }}
                        >
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Шаблоны ещё не созданы. Создайте общий шаблон для всей сети или отдельный шаблон для
            города.
          </Alert>
        )}
      </>
    );
  }

  renderTemplateForm() {
    const scheduled = this.state.scheduled_config;
    const scheduledDateLabel = scheduled?.effective_date
      ? dayjs(scheduled.effective_date).format("DD.MM.YYYY")
      : "";
    const editingScheduled = !!scheduled;
    const isCreating = this.state.settingsView === "create";
    const territoryName = this.getPromoCityName(this.state.selectedPromoCity);
    const hasActiveCityTemplate = (this.state.templates || []).some(
      (template) => parseInt(template.promo_city, 10) > 0 && templateHasActiveState(template),
    );

    if (this.state.templateNotFound) {
      return (
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={this.backToTemplateList.bind(this)}
            sx={{ mb: 2 }}
          >
            К списку шаблонов
          </Button>
          <Alert severity="warning">
            Шаблон для территории «{territoryName}» не найден. Выберите существующий шаблон в списке
            или создайте новый по доступным правилам.
          </Alert>
        </Box>
      );
    }

    return (
      <>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={this.backToTemplateList.bind(this)}
          sx={{ mb: 2 }}
        >
          К списку шаблонов
        </Button>

        {scheduled ? (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
          >
            Изменения запланированы на {scheduledDateLabel}. Форма редактирует отложенную версию:
            сохранение с будущей датой заменит её. Сохранение с сегодняшней датой применит изменения
            сразу.
          </Alert>
        ) : null}

        <Paper
          variant="outlined"
          sx={{ p: { xs: 1.5, sm: 2 }, mb: 2.5, borderRadius: 2, bgcolor: "grey.50" }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            {isCreating ? "Новый шаблон" : `Шаблон: ${territoryName}`}
          </Typography>
          {isCreating ? (
            <Box sx={{ maxWidth: 480, mt: 1.5 }}>
              <MySelect
                data={this.getAvailableCreateOptions()}
                value={this.state.selectedPromoCity}
                func={this.changeCreatePromoCity.bind(this)}
                label="Территория нового шаблона"
                is_none={false}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {hasActiveCityTemplate
                  ? "Уже есть активные городские шаблоны: доступны только ещё не настроенные города, а активный шаблон «Вся сеть» создать нельзя."
                  : "Активный шаблон «Вся сеть» нельзя совмещать с активными городскими шаблонами. Неактивные шаблоны не блокируют создание для другой территории."}
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {editingScheduled
                ? "Редактируется запланированная версия шаблона."
                : "Редактируется текущий активный шаблон."}
            </Typography>
          )}
        </Paper>

        <EmployeePromoConfigForm
          key={this.state.formKey}
          catalogs={this.getCatalogs()}
          initialData={this.getFormInitialData()}
          saveLabel="Сохранить шаблон"
          onError={(text) => this.showAlert(false, text)}
          onSave={this.saveConfig.bind(this)}
        />

        {!isCreating ? (
          <EmployeePromoConfigHistoryPanel
            configHistory={this.state.config_history}
            cities={this.state.cities}
            points={this.state.points}
            promo_action_list={this.state.promo_action_list}
          />
        ) : null}
      </>
    );
  }

  render() {
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
          subtitle="Шаблоны, по которым создаются персональные промокоды для сотрудников"
        >
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, mb: 2.5, overflow: "hidden" }}
          >
            <Tabs
              value={this.state.activeTab}
              onChange={(event, activeTab) => this.setState({ activeTab })}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Разделы промокодов для сотрудников"
              sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Настройка шаблона" />
              <Tab label="Статистика" />
            </Tabs>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              {this.state.catalogsReady && this.state.formReady && this.state.activeTab === 0
                ? this.state.settingsView === "list"
                  ? this.renderTemplateList()
                  : this.renderTemplateForm()
                : null}

              {this.state.catalogsReady && this.state.formReady && this.state.activeTab === 1 ? (
                <EmployeePromoUsagePanel
                  stats={this.state.promoStats}
                  points={this.state.points}
                  onLoad={this.loadEmployeePromoStats.bind(this)}
                />
              ) : null}
            </Box>
          </Paper>
        </SiteSale2Page>
      </>
    );
  }
}

export default function EmployeePromosPage({ initialPromoCity = null, mode = "list" }) {
  const router = useRouter();

  return (
    <SiteSale2EmployeePromos_
      router={router}
      initialPromoCity={initialPromoCity}
      mode={mode}
    />
  );
}
