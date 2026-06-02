import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Download } from "@mui/icons-material";

import { MyDatePickerNewViews } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import DownloadButton from "@/ui/DownloadButton";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import axios from "axios";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";

// ---------- Таб Динамика ----------
class StatSale_Tab_Dynamic extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),
      data_clients_list: {},
      res: {},
      data_clients_list_cafe: {},
      data_clients_list_kc: {},
      data_clients_list_site: {},
      yearly_totals: null,
      yearly_totals_cafe: null,
      yearly_totals_kc: null,
      yearly_totals_site: null,
      loading: false,
    };
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  /**
   * Конвертирует объект { "2025-1": {...}, "2026-4": {...} }
   * в отсортированный массив по дате
   */
  objectToSortedArray = (obj) => {
    if (!obj || typeof obj !== "object") return [];

    return Object.values(obj).sort((a, b) => {
      if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
      return a.month - b.month;
    });
  };

  get_data_clients = async (exp = false) => {
    const { date_start, date_end, point } = this.state;
    const data = {
      date_start,
      date_end,
      points: point,
    };

    // export
    if (exp) {
      try {
        this.setState({ is_load: true });

        const response = await axios.post(
          "https://apichef.jacochef.ru/api/stat_sale/export_data_dynamics",
          {
            method: "export_data_dynamics",
            module: "orders_by_hour",
            version: 2,
            login: localStorage.getItem("token"),
            data: this.state.res,
          },
          {
            responseType: "blob",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
            timeout: 30000,
          },
        );

        const contentType = response.headers["content-type"];

        if (contentType && contentType.includes("application/json")) {
          const text = await response.data.text();
          const errorData = JSON.parse(text);
          this.props.openAlert(false, errorData.text || "Ошибка экспорта");
          return;
        }

        if (response.data.size === 0) {
          this.props.openAlert(false, "Ошибка: получен пустой файл");
          return;
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        let fileName = `stat_dynamics_${new Date().toISOString().split("T")[0]}.xlsx`;
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, "");
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        this.props.openAlert(true, "Экспорт успешно выполнен");
      } catch (error) {
        console.error("Export error:", error);

        let errorMessage = "Ошибка при экспорте";
        if (error.response && error.response.data) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.text || errorMessage;
          } catch (e) {
            errorMessage = error.message || errorMessage;
          }
        } else {
          errorMessage = error.message || errorMessage;
        }

        this.props.openAlert(false, errorMessage);
      } finally {
        this.setState({ is_load: false });
      }
      return;
    }

    this.setState({ loading: true });
    const res = await this.props.getData("get_dynamics", data);
    this.setState({ loading: false });

    if (res.st) {
      this.setState({
        // ✅ Данные приходят как объекты { "2025-1": {...} }
        data_clients_list: res.res || {},
        res: res || {},
        data_clients_list_cafe: res.res_cafe || {},
        data_clients_list_kc: res.res_kc || {},
        data_clients_list_site: res.res_site || {},
        yearly_totals: res.yearly_totals || null,
        yearly_totals_cafe: res.yearly_totals_cafe || null,
        yearly_totals_kc: res.yearly_totals_kc || null,
        yearly_totals_site: res.yearly_totals_site || null,
      });
    } else {
      this.props.openAlert(res.st, res.text);
    }
  };

  changePoints(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  objectToSortedArray = (obj) => {
    if (!obj || typeof obj !== "object") return [];

    return Object.entries(obj)
      .map(([key, value]) => {
        // Ключ в формате "2025-1" или "2025-12"
        const parts = key.split("-");
        const yearFromKey = parts[0];
        const monthFromKey = parseInt(parts[1]);

        return {
          ...value,
          // Если year уже есть в данных — используем его, иначе берем из ключа
          year: value.year || yearFromKey,
          // Если month уже есть — используем его, иначе из ключа
          month: value.month || monthFromKey,
        };
      })
      .sort((a, b) => {
        if (parseInt(a.year) !== parseInt(b.year)) {
          return parseInt(a.year) - parseInt(b.year);
        }
        return a.month - b.month;
      });
  };

  renderTable = () => {
    const { data_clients_list, yearly_totals } = this.state;

    // ✅ Конвертируем объект в отсортированный массив
    const monthsArray = this.objectToSortedArray(data_clients_list);

    if (!monthsArray.length) return null;

    // ✅ Показываем ВСЕ месяцы диапазона (убрали фильтрацию по нулям)
    const monthsWithData = monthsArray;

    // ✅ Ищем текущий месяц по году и месяцу
    const now = new Date();
    const currentMonth = monthsArray.find(
      (m) => m.month === now.getMonth() + 1 && parseInt(m.year) === now.getFullYear(),
    );

    const totalCols = 5 + monthsWithData.length * 3;
    const totalDataRows = 3 + 1 + 4 + 1;

    const renderMonthCells = (month, metricKey) => {
      const planValue = month[`${metricKey}_plan`];
      const factValue = month[metricKey];
      const dynamicsValue = month[`${metricKey}_dynamics`];

      return (
        <React.Fragment key={`cell-${month.year}-${month.month}-${metricKey}`}>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "4px",
              textAlign: "right",
              backgroundColor: "#fff",
            }}
          >
            {planValue !== null && planValue !== undefined
              ? planValue.toLocaleString("ru-RU")
              : "-"}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "4px",
              textAlign: "right",
              backgroundColor: "#fff",
            }}
          >
            {factValue !== null && factValue !== undefined
              ? factValue.toLocaleString("ru-RU")
              : "-"}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "4px",
              textAlign: "center",
              backgroundColor: "#fff",
              borderRight: "2px solid #ccc",
            }}
          >
            {dynamicsValue !== null && dynamicsValue !== undefined
              ? `${dynamicsValue.toFixed(2)}%`
              : "-"}
          </td>
        </React.Fragment>
      );
    };

    const renderPercentCell = (value, isBold = false, customStyle = {}) => {
      const baseStyle = {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "center",
        fontWeight: isBold ? "bold" : "normal",
        boxSizing: "border-box",
      };
      const mergedStyle = { ...baseStyle, ...customStyle };
      return (
        <td style={mergedStyle}>
          {value !== null && value !== undefined && value !== "-"
            ? `${typeof value === "number" ? value.toFixed(2) : value}%`
            : "-"}
        </td>
      );
    };

    const renderDashCell = (customStyle = {}) => (
      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", ...customStyle }}>
        -
      </td>
    );

    return (
      <div
        style={{
          overflowX: "auto",
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "1200px",
            borderCollapse: "collapse",
            fontFamily: "Arial, sans-serif",
            tableLayout: "fixed",
          }}
          className="medium-table"
        >
          <colgroup>
            <col style={{ width: "120px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "70px" }} />
            {monthsWithData.map((_, idx) => (
              <React.Fragment key={`col-${idx}`}>
                <col style={{ width: "70px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "70px" }} />
              </React.Fragment>
            ))}
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Источник
              </th>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Метрика
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                План год
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                Факт год
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                Факт по тек.мес
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                Динамика
              </th>
              {monthsWithData.map((month, idx) => (
                <th
                  key={`header-${month.year}-${month.month}`}
                  colSpan={3}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                    backgroundColor: `hsl(${idx * 45}, 75%, 92%)`,
                    fontWeight: "600",
                  }}
                >
                  {month.month_name + " " + month.year}
                </th>
              ))}
            </tr>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              {monthsWithData.map((month) => (
                <React.Fragment key={`subheader-${month.year}-${month.month}`}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    План
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Факт
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Δ%
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Роллы */}
            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                rowSpan={totalDataRows}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  textAlign: "center",
                  verticalAlign: "middle",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#e3f2fd",
                  zIndex: 2,
                }}
              >
                Все источники
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Роллы
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.rolly_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.rolly?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.rolly_dynamics)}
              {renderPercentCell(yearly_totals?.rolly_dynamics_avg, false, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "rolly"))}
            </tr>

            <tr style={{ backgroundColor: "#fff" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fff",
                  zIndex: 2,
                }}
              >
                Пицца
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.pizza_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.pizza?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.pizza_dynamics)}
              {renderPercentCell(yearly_totals?.pizza_dynamics_avg, false, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "pizza"))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Заказы
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.order_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.order?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.order_dynamics)}
              {renderPercentCell(yearly_totals?.order_dynamics_avg, false, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "order"))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Эфф-ть/Загрузка
              </td>
              {renderPercentCell(100)}
              {renderPercentCell(yearly_totals?.effect_avg)}
              {renderPercentCell(currentMonth?.effect)}
              {renderDashCell({ borderRight: "2px solid #ccc" })}
              {monthsWithData.map((month) => (
                <React.Fragment key={`eff-${month.year}-${month.month}`}>
                  {renderPercentCell(100)}
                  {renderPercentCell(month.effect)}
                  {renderDashCell({ borderRight: "2px solid #ccc" })}
                </React.Fragment>
              ))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Аккаунтов
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                {yearly_totals?.register_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                {currentMonth?.active?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.active_dynamics)}
              {renderPercentCell(currentMonth?.active_dynamics, false, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "active"))}
            </tr>

            <tr style={{ backgroundColor: "#fff" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  paddingLeft: "24px",
                  fontStyle: "italic",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fff",
                  zIndex: 2,
                }}
              >
                └─ Доля аккаунтов
              </td>
              {renderDashCell()}
              {renderDashCell()}
              {renderDashCell()}
              {renderDashCell({ borderRight: "2px solid #ccc" })}
              {monthsWithData.map((month) => (
                <React.Fragment key={`share-active-${month.year}-${month.month}`}>
                  {renderDashCell()}
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "#666",
                    }}
                  >
                    {month.active && yearly_totals?.residents
                      ? ((month.active / month.residents) * 100).toFixed(2) + "%"
                      : "-"}
                  </td>
                  {renderDashCell({ borderRight: "2px solid #ccc" })}
                </React.Fragment>
              ))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Активные аккаунты
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                {yearly_totals?.active_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                {currentMonth?.register?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.register_dynamics)}
              {renderPercentCell(currentMonth?.register_dynamics, false, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "register"))}
            </tr>

            <tr style={{ backgroundColor: "#fff" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  paddingLeft: "24px",
                  fontStyle: "italic",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fff",
                  zIndex: 2,
                }}
              >
                └─ Доля активных аккаунтов
              </td>
              {renderDashCell()}
              {renderDashCell()}
              {renderDashCell()}
              {renderDashCell({ borderRight: "2px solid #ccc" })}
              {monthsWithData.map((month) => (
                <React.Fragment key={`share-reg-${month.year}-${month.month}`}>
                  {renderDashCell()}
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "#666",
                    }}
                  >
                    {month.register && month.residents
                      ? ((month.register / month.residents) * 100).toFixed(2) + "%"
                      : "-"}
                  </td>
                  {renderDashCell({ borderRight: "2px solid #ccc" })}
                </React.Fragment>
              ))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                  borderBottom: "2px solid #ccc",
                }}
              >
                Жителей
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                  borderBottom: "2px solid #ccc",
                }}
              >
                {yearly_totals?.residents?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  borderBottom: "2px solid #ccc",
                }}
              >
                {currentMonth?.residents?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(100, false, { borderBottom: "2px solid #ccc" })}
              {renderDashCell({ borderBottom: "2px solid #ccc", borderRight: "2px solid #ccc" })}
              {monthsWithData.map((month) => (
                <React.Fragment key={`residents-${month.year}-${month.month}`}>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "right",
                      borderBottom: "2px solid #ccc",
                    }}
                  >
                    {month.residents?.toLocaleString("ru-RU") || "-"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "right",
                      borderBottom: "2px solid #ccc",
                    }}
                  >
                    {month.residents?.toLocaleString("ru-RU") || "-"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      borderBottom: "2px solid #ccc",
                      borderRight: "2px solid #ccc",
                    }}
                  >
                    100%
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  renderTableMini = (title, dataObj, yearly_totals) => {
    // ✅ Конвертируем объект в массив
    const monthsArray = this.objectToSortedArray(dataObj);

    if (!monthsArray.length) return null;

    const monthsWithData = monthsArray; // Показываем все месяцы

    const now = new Date();
    const currentMonth = monthsArray.find(
      (m) => m.month === now.getMonth() + 1 && parseInt(m.year) === now.getFullYear(),
    );

    const totalDataRows = 3 + 1;

    const renderMonthCells = (month, metricKey) => {
      const planValue = month[`${metricKey}_plan`];
      const factValue = month[metricKey];
      const dynamicsValue = month[`${metricKey}_dynamics`];

      return (
        <React.Fragment key={`cell-${month.year}-${month.month}-${metricKey}`}>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "4px",
              textAlign: "right",
              backgroundColor: "#fff",
            }}
          >
            {planValue !== null && planValue !== undefined
              ? planValue.toLocaleString("ru-RU")
              : "-"}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "4px",
              textAlign: "right",
              backgroundColor: "#fff",
            }}
          >
            {factValue !== null && factValue !== undefined
              ? factValue.toLocaleString("ru-RU")
              : "-"}
          </td>
          <td
            style={{
              border: "1px solid #ddd",
              padding: "4px",
              textAlign: "center",
              backgroundColor: "#fff",
              borderRight: "2px solid #ccc",
            }}
          >
            {dynamicsValue !== null && dynamicsValue !== undefined
              ? `${dynamicsValue.toFixed(2)}%`
              : "-"}
          </td>
        </React.Fragment>
      );
    };

    const renderPercentCell = (value, customStyle = {}) => (
      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", ...customStyle }}>
        {value !== null && value !== undefined && value !== "-"
          ? `${typeof value === "number" ? value.toFixed(2) : value}%`
          : "-"}
      </td>
    );

    const renderDashCell = (customStyle = {}) => (
      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", ...customStyle }}>
        -
      </td>
    );

    return (
      <div
        style={{
          overflowX: "auto",
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "800px",
            borderCollapse: "collapse",
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            tableLayout: "fixed",
          }}
          className="medium-table"
        >
          <colgroup>
            <col style={{ width: "120px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "70px" }} />
            {monthsWithData.map((_, idx) => (
              <React.Fragment key={`col-mini-${idx}`}>
                <col style={{ width: "70px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "70px" }} />
              </React.Fragment>
            ))}
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Источник
              </th>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Метрика
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                План год
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                Факт год
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                Факт по тек.мес
              </th>
              <th
                rowSpan={2}
                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
              >
                Динамика
              </th>
              {monthsWithData.map((month, idx) => {
                // ✅ Для мини-таблиц month_name не содержит год — добавляем вручную
                const hasYearInName = month.month_name && /\d{4}$/.test(month.month_name);
                const displayName = hasYearInName
                  ? month.month_name
                  : `${month.month_name} ${month.year}`;

                return (
                  <th
                    key={`header-mini-${month.year}-${month.month}`}
                    colSpan={3}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                      backgroundColor: `hsl(${idx * 45}, 75%, 92%)`,
                      fontWeight: "600",
                    }}
                  >
                    {displayName ? displayName.charAt(0).toUpperCase() + displayName.slice(1) : ""}
                  </th>
                );
              })}
            </tr>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              {monthsWithData.map((month) => (
                <React.Fragment key={`subheader-mini-${month.year}-${month.month}`}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    План
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Факт
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Δ%
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                rowSpan={totalDataRows}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  textAlign: "center",
                  verticalAlign: "middle",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#e3f2fd",
                  zIndex: 2,
                }}
              >
                {title}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Роллы
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.rolly_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.rolly?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.rolly_dynamics)}
              {renderPercentCell(yearly_totals?.rolly_dynamics_avg, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "rolly"))}
            </tr>

            <tr style={{ backgroundColor: "#fff" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fff",
                  zIndex: 2,
                }}
              >
                Пицца
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.pizza_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.pizza?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.pizza_dynamics)}
              {renderPercentCell(yearly_totals?.pizza_dynamics_avg, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "pizza"))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Заказы
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.order_plan?.toLocaleString("ru-RU") || "-"}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {yearly_totals?.order?.toLocaleString("ru-RU") || "-"}
              </td>
              {renderPercentCell(currentMonth?.order_dynamics)}
              {renderPercentCell(yearly_totals?.order_dynamics_avg, {
                borderRight: "2px solid #ccc",
              })}
              {monthsWithData.map((month) => renderMonthCells(month, "order"))}
            </tr>

            <tr style={{ backgroundColor: "#fafafa" }}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "600",
                  position: "sticky",
                  left: 120,
                  backgroundColor: "#fafafa",
                  zIndex: 2,
                }}
              >
                Эфф-ть/Загрузка
              </td>
              {renderPercentCell(100)}
              {renderPercentCell(yearly_totals?.effect_avg)}
              {renderPercentCell(currentMonth?.effect)}
              {renderDashCell({ borderRight: "2px solid #ccc" })}
              {monthsWithData.map((month) => (
                <React.Fragment key={`eff-mini-${month.year}-${month.month}`}>
                  {renderPercentCell(100)}
                  {renderPercentCell(month.effect)}
                  {renderDashCell({ borderRight: "2px solid #ccc" })}
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  render() {
    const { activeTab } = this.props;
    const {
      data_clients_list,
      loading,
      data_clients_list_cafe,
      yearly_totals_cafe,
      data_clients_list_kc,
      yearly_totals_kc,
      data_clients_list_site,
      yearly_totals_site,
    } = this.state;

    return (
      <Grid
        style={{ paddingTop: 0 }}
        size={{ xs: 12, sm: 12 }}
      >
        <TabPanel
          value={activeTab}
          index={2}
          id="dynamics"
        >
          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <CityCafeAutocomplete2
                label="Кафе"
                withAll
                withAllSelected
                points={this.props.points}
                value={this.state.point}
                onChange={(value) => this.changePoints("point", null, value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNewViews
                label="Дата от"
                views={["month", "year"]}
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNewViews
                label="Дата до"
                views={["month", "year"]}
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                onClick={() => this.get_data_clients()}
                disabled={loading}
              >
                {loading ? "Загрузка..." : "Показать"}
              </Button>
              {this.props.canExport && this.objectToSortedArray(data_clients_list).length > 0 && (
                <DownloadButton
                  variant="contained"
                  color="success"
                  button={true}
                  url={async () => await this.get_data_clients(true)}
                  sx={{ ml: { sm: 2, xs: 0 } }}
                >
                  <Download />
                </DownloadButton>
              )}
            </Grid>

            {this.objectToSortedArray(data_clients_list).length > 0 && (
              <Grid
                size={{ xs: 12, sm: 12 }}
                sx={{ mt: 3, mb: 5, position: "relative", overflow: "hidden" }}
              >
                {this.renderTable()}
              </Grid>
            )}

            {this.objectToSortedArray(data_clients_list_cafe).length > 0 && (
              <Grid
                size={{ xs: 12, sm: 12 }}
                sx={{ mt: 3, mb: 5, position: "relative", overflow: "hidden" }}
              >
                {this.renderTableMini("Кафе", data_clients_list_cafe, yearly_totals_cafe)}
              </Grid>
            )}

            {this.objectToSortedArray(data_clients_list_kc).length > 0 && (
              <Grid
                size={{ xs: 12, sm: 12 }}
                sx={{ mt: 3, mb: 5, position: "relative", overflow: "hidden" }}
              >
                {this.renderTableMini("Контакт-центр", data_clients_list_kc, yearly_totals_kc)}
              </Grid>
            )}

            {this.objectToSortedArray(data_clients_list_site).length > 0 && (
              <Grid
                size={{ xs: 12, sm: 12 }}
                sx={{ mt: 3, mb: 5, position: "relative", overflow: "hidden" }}
              >
                {this.renderTableMini("Сайт", data_clients_list_site, yearly_totals_site)}
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

export default StatSale_Tab_Dynamic;
