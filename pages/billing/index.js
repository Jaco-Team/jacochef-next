import React from "react";
import Link from "next/link";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import ErrorIcon from "@mui/icons-material/Error";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

import {
  MySelect,
  MyAutocomplite,
  MyAutocomplite2,
  MyDatePickerNew,
  MyTextInput,
} from "@/ui/Forms";

import queryString from "query-string";
import dayjs from "dayjs";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { formatDateReverse, formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { billingPageFieldSx } from "@/components/billing/BillingPageCommon";
import ContrastIcon from "@mui/icons-material/Contrast";

const bill_status = [
  {
    id: "0",
    name: "Все",
    sum_w_nds: "0",
    count: "0",
    clr: "rgba(0, 0, 0, 0.04)",
  },
  {
    id: "5",
    name: "Шаблон",
    sum_w_nds: "0",
    count: "0",
    clr: "#dcdcdc",
  },
  {
    id: "2",
    name: "Заведенная",
    sum_w_nds: "0",
    count: "0",
    clr: "#ffcc00",
  },
  {
    id: "7",
    name: "Отправленная бухгалтеру",
    sum_w_nds: "0",
    count: "0",
    clr: "#f5770a",
  },
  {
    id: "8",
    name: "Отправленная в 1с",
    sum_w_nds: "0",
    count: "0",
    clr: "#1faee9",
  },
  {
    id: "9",
    name: "Вернулась из 1с",
    sum_w_nds: "0",
    count: "0",
    clr: "#baacc7",
  },
  {
    id: "1",
    name: "Оплаченная",
    sum_w_nds: "0",
    count: "0",
    clr: "#008000",
  },
  {
    id: "10",
    name: "Отдел закупки",
    sum_w_nds: "0",
    count: "0",
    clr: "#942f3d",
  },
  {
    id: "3",
    name: "Удаленная",
    sum_w_nds: "0",
    count: "0",
    clr: "#000000",
  },
];

const types = [
  {
    name: "Все",
    id: "-1",
  },
  {
    name: "Счет",
    id: "1",
  },
  {
    name: "Поступление",
    id: "2",
  },
  {
    name: "Коррекция",
    id: "3",
  },
  {
    name: "Возврат",
    id: "4",
  },
];

function MyTooltip(props) {
  const { children, name, ...other } = props;

  return (
    <Tooltip
      title={name}
      arrow
      placement="bottom-start"
      {...other}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "#fff",
            color: "#000",
            fontSize: 16,
            border: "0.5px solid rgba(0, 0, 0, 0.87)",
            "& .MuiTooltip-arrow": {
              color: "#fff",
              "&::before": {
                backgroundColor: "white",
                border: "0.5px solid black",
              },
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}

const billingTypeNameMap = types.reduce((acc, item) => {
  acc[String(item.id)] = item.name;
  return acc;
}, {});

const billingStatusNameMap = bill_status.reduce((acc, item) => {
  acc[String(item.id)] = item.name;
  return acc;
}, {});

function formatBillingMoney(value) {
  const normalized = Number(
    String(value ?? 0)
      .replace(/\s+/g, "")
      .replace(",", "."),
  );

  if (!Number.isFinite(normalized)) {
    return "0,00 ₽";
  }

  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized)} ₽`;
}

function getBillingTypeName(typeId) {
  return billingTypeNameMap[String(typeId)] || "Приход";
}

function getBillingStatusName(statusId) {
  return billingStatusNameMap[String(statusId)] || "Статус";
}

class Billing_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "billing",
      module_name: "",
      is_load: false,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      bill_list: [],
      status: "",

      types: [],
      type: "",

      vendors: [],
      vendorsCopy: [],
      search_vendor: "",

      points: [],
      point: [],

      number: "",

      all_items: [],
      items: [],

      billings: [],
      bills: [],

      operAlert: false,
      err_status: true,
      err_text: "",

      arrPay: {},
      count_true: 0,

      modelCheckPay: false,
      acces_bux_pay: false,
      acces: {},
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    // console.log('componentDidMount data', data)

    this.setState({
      module_name: "Накладные",
      points: data.points,
      bill_list: bill_status,
      billings: bill_status,
      status: bill_status[0].id,
      types: types,
      acces: data.acces,
      acces_bux_pay: parseInt(data.acces_bux_pay) == 1 ? true : false,
    });

    document.title = "Накладные";

    setTimeout(() => {
      this.getLocalStorage();
    }, 300);
  }

  getData_old = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch("https://jacochef.ru/api/index_new.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem("token"),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == "redir") {
          window.location.pathname = "/";
          return;
        }

        if (json.st === false && json.type == "auth") {
          window.location.pathname = "/auth";
          return;
        }

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : null,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  async changeSelect(data, event) {
    const value = event.target.value;

    if (data === "type") {
      const data = {
        type: value,
      };

      const res = await this.getData("get_vendors_items_list", data);

      this.setState({
        vendors: res.vendors,
        vendorsCopy: res.vendors,
        all_items: res.items,
        search_vendor: "",
        items: [],
      });
    }

    this.setState({
      [data]: value,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  changeAutocomplite(type, event, data) {
    this.setState({
      [type]: data,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  changeInput(event) {
    this.setState({
      number: event.target.value,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  setLocalStorage() {
    const { date_start, date_end, status, type, point, number } = this.state;

    const dateStart = date_start ? dayjs(date_start).format("YYYY-MM-DD") : null;
    const dateEnd = date_end ? dayjs(date_end).format("YYYY-MM-DD") : null;

    const data = {
      dateStart,
      dateEnd,
      status,
      type,
      point,
      number,
    };

    localStorage.setItem("main_page_bill", JSON.stringify(data));
  }

  async getLocalStorage() {
    const res = JSON.parse(localStorage.getItem("main_page_bill"));

    if (res) {
      const { dateStart, dateEnd, status, type, point, number } = res;

      const date_start = dateStart ? dayjs(dateStart) : null;
      const date_end = dateEnd ? dayjs(dateEnd) : null;

      this.setState({
        date_start,
        date_end,
        status,
        type,
        point,
        number,
      });

      if (type && type.length) {
        const data = {
          type,
        };

        const res = await this.getData("get_vendors_items_list", data);

        this.setState({
          vendors: res.vendors,
          vendorsCopy: res.vendors,
          all_items: res.items,
          search_vendor: "",
          items: [],
        });
      }

      //this.getBillingList();
    }
  }

  getOneBill(item) {
    const link = document.createElement("a");
    link.href = `/billing/${item?.my_type_bill}/${item?.id}/${item?.point_id}`;
    //link.target = '_blank'
    link.click();

    const data = {
      type: item?.my_type_bill,
      id: item?.id,
      point_id: item?.point_id,
    };

    localStorage.setItem("one_bill", JSON.stringify(data));
  }

  // поиск/выбор поставщика
  search(event, value) {
    const search = event.target.value ? event.target.value : value ? value : "";

    const vendorsCopy = this.state.vendorsCopy;

    const vendors = vendorsCopy.filter((value) =>
      search ? value.name.toLowerCase() === search.toLowerCase() : value,
    );

    this.setState({
      search_vendor: search,
      vendors,
    });
  }

  // получение накладных по указанным фильтрам
  async getBillingList() {
    const { type, point } = this.state;

    if (type && point.length) {
      const { status, number, items, vendors, date_end, date_start } = this.state;

      const dateStart = date_start ? dayjs(date_start).format("YYYY-MM-DD") : "";
      const dateEnd = date_end ? dayjs(date_end).format("YYYY-MM-DD") : "";
      const vendor_id = vendors.length === 1 ? vendors[0].id : "";

      const point_id = point.reduce((points, point) => {
        point = { id: point.id };
        points = [...points, ...[point]];
        return points;
      }, []);

      const items_id = items.reduce((items, it) => {
        it = { id: it.id };
        items = [...items, ...[it]];
        return items;
      }, []);

      const data = {
        date_start: dateStart,
        date_end: dateEnd,
        items: items_id,
        vendor_id,
        point_id,
        number,
        status,
        type,
      };

      const res = await this.getData("get_billing_list", data);

      let billings = this.state.billings;

      billings = billings.map((status) => {
        if (res.svod[status.id]) {
          status.count = res.svod[status.id].count;
          status.sum_w_nds = res.svod[status.id].sum_w_nds;
        } else {
          status.count = 0;
          status.sum_w_nds = 0;
        }

        return status;
      });

      const bills = res.res
        .map((bill) => {
          bill_status.map((item) => {
            if (parseInt(item.id) === parseInt(bill.status) && parseInt(bill.status) !== 0) {
              bill.color = item.clr;
            }
          });

          return bill;
        })
        .sort((a, b) => {
          const sortA = Number.isFinite(Number(a?.sort)) ? Number(a.sort) : Number.MAX_SAFE_INTEGER;
          const sortB = Number.isFinite(Number(b?.sort)) ? Number(b.sort) : Number.MAX_SAFE_INTEGER;

          return sortA - sortB;
        });

      this.setState({
        bills,
        billings,
      });
    } else {
      this.setState({
        operAlert: true,
        err_status: false,
        err_text: "Необходимо выбрать Тип / Точку",
      });
    }
  }

  actionCheckBox(bill_id, point_id, bill_type, event) {
    let arr_Pay = this.state.arrPay;

    arr_Pay[bill_type + "_" + bill_id + "_" + point_id] = {
      bill_id: bill_id,
      point_id: point_id,
      bill_type: bill_type,
      status: event.target.checked,
    };

    let count_true = Object.keys(arr_Pay).filter((it) => arr_Pay[it]?.status === true).length;

    this.setState({ arrPay: arr_Pay, count_true });
  }

  async multiPayBill() {
    let arr_Pay = this.state.arrPay;

    let arr_true = Object.keys(arr_Pay).filter((it) => arr_Pay[it].status === true);
    let arr_true_full = [];

    arr_true.map((item) => {
      arr_true_full.push(arr_Pay[item]);
    });

    const data = {
      arr_Pay: arr_true_full,
    };

    const res = await this.getData("multi_pay_bill", data);

    if (res.st === true) {
      this.getBillingList();

      this.setState({ arrPay: {}, count_true: 0, modelCheckPay: false });
    }
  }

  //onClick={this.getOneBill.bind(this, item)}

  check_all_bill_pay(event) {
    let arr_Pay = this.state.arrPay;

    let bills = this.state.bills;
    const checked = event?.target?.checked ?? true;

    let count_true = 0;

    bills.map((bill) => {
      if (parseInt(bill?.status) == 9) {
        arr_Pay[bill.my_type_bill + "_" + bill.id + "_" + bill.point_id] = {
          bill_id: bill.id,
          point_id: bill.point_id,
          bill_type: bill.my_type_bill,
          status: checked,
        };

        if (checked) {
          count_true++;
        }
      }
    });

    this.setState({ arrPay: arr_Pay, count_true });
  }

  render() {
    const warningBillsCount = this.state.bills.filter(
      (item) => parseInt(item.check_day) === 1 || parseInt(item.check_price) === 1,
    ).length;
    const payableBillsCount = this.state.bills.filter(
      (item) => parseInt(item?.status) === 9,
    ).length;
    const hasBills = this.state.bills.length > 0;
    const statusSummaryItems = hasBills
      ? this.state.billings.filter(
          (item) => Number(item.count) > 0 || String(item.id) === String(this.state.status || "0"),
        )
      : this.state.billings.slice(0, 1);
    const tabularNumericSx = {
      fontVariantNumeric: "tabular-nums",
      fontFeatureSettings: '"tnum"',
      whiteSpace: "nowrap",
    };
    const riskCellSx = {
      width: 72,
      px: 1,
      textAlign: "center",
    };
    const headerMetricSx = {
      px: 1.25,
      py: 0.75,
      borderRadius: "999px",
      border: "1px solid #ece3dc",
      backgroundColor: "#fcfaf8",
      fontSize: 13,
      color: "#5b6472",
      fontWeight: 500,
      ...tabularNumericSx,
    };
    const actionButtonSx = {
      minHeight: 42,
      px: 1.75,
      borderRadius: "12px",
      textTransform: "none",
      fontSize: 14,
      fontWeight: 700,
      boxShadow: "none",
      whiteSpace: "nowrap",
    };
    const unifiedDropdownSlotProps = {
      popper: {
        allowAdaptivePlacement: true,
      },
      listbox: {
        sx: {
          maxHeight: { xs: "min(220px, 40dvh)", sm: 320 },
        },
      },
    };
    const filterPaperSx = {
      ...billingPageFieldSx,
      p: { xs: 2, md: 2.5 },
      borderRadius: "22px",
      border: "1px solid rgba(226, 232, 240, 0.9)",
      background: "linear-gradient(180deg, #ffffff 0%, #fdfaf7 100%)",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.04)",
      "& .MuiAutocomplete-tag, & .MuiChip-root": {
        height: 30,
        borderRadius: "999px",
        border: "1px solid rgba(222, 226, 231, 0.92)",
        backgroundColor: "#f6f4f1",
        color: "#374151",
        fontWeight: 600,
      },
      "& .MuiChip-label": {
        px: 1.25,
      },
      "& .MuiChip-deleteIcon": {
        color: "#9ca3af",
      },
      "& .MuiAutocomplete-input::placeholder": {
        color: "#9ca3af",
        opacity: 1,
      },
      "& .MuiInputLabel-root": {
        color: "#6b7280",
        "&.Mui-focused": {
          color: "#9f1239",
        },
        "&.MuiInputLabel-shrink": {
          backgroundColor: "rgba(255, 252, 249, 0.98)",
        },
      },
      "& .MuiTextField-root .MuiOutlinedInput-root:not(.MuiAutocomplete-inputRoot), & .MuiPickersOutlinedInput-root":
        {
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
          "& fieldset": {
            borderColor: "rgba(209, 213, 219, 0.96)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(186, 193, 202, 0.98)",
          },
          "&.Mui-focused": {
            backgroundColor: "#ffffff",
            boxShadow: "0 12px 22px rgba(15, 23, 42, 0.05)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "rgba(217, 4, 61, 0.38)",
            borderWidth: "1px",
          },
        },
      "& .MuiAutocomplete-root .MuiOutlinedInput-root": {
        backgroundColor: "#ffffff",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
        "& fieldset": {
          borderColor: "rgba(209, 213, 219, 0.96)",
        },
        "&:hover fieldset": {
          borderColor: "rgba(186, 193, 202, 0.98)",
        },
        "&.Mui-focused": {
          backgroundColor: "#ffffff",
          boxShadow: "0 12px 22px rgba(15, 23, 42, 0.05)",
        },
        "&.Mui-focused fieldset": {
          borderColor: "rgba(217, 4, 61, 0.38)",
          borderWidth: "1px",
        },
      },
      "& .MuiAutocomplete-popupIndicator .MuiSvgIcon-root, & .MuiSelect-icon, & .MuiInputAdornment-root .MuiSvgIcon-root":
        {
          color: "#94a3b8",
        },
    };
    const filterTextInputSx = {
      "& .MuiOutlinedInput-root": {
        minHeight: "44px !important",
        height: "44px !important",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
        "& fieldset": {
          borderColor: "rgba(209, 213, 219, 0.96)",
        },
        "&:hover fieldset": {
          borderColor: "rgba(186, 193, 202, 0.98)",
        },
        "&.Mui-focused": {
          boxShadow: "0 12px 22px rgba(15, 23, 42, 0.05)",
        },
        "&.Mui-focused fieldset": {
          borderColor: "rgba(217, 4, 61, 0.38)",
          borderWidth: "1px",
        },
      },
      "& .MuiOutlinedInput-input": {
        boxSizing: "border-box",
        minHeight: "24px",
        padding: "10px 16px",
      },
      "& .MuiInputLabel-root": {
        color: "#6b7280",
        "&.Mui-focused": {
          color: "#9f1239",
        },
      },
    };
    const filterDateInputSx = {
      "&.MuiFormControl-root": {
        minHeight: 44,
      },
      "& .MuiPickersOutlinedInput-root": {
        minHeight: "44px !important",
        height: "44px !important",
        paddingLeft: "0px",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
        "& fieldset": {
          borderColor: "rgba(209, 213, 219, 0.96)",
          borderRadius: "18px",
        },
        "&:hover fieldset": {
          borderColor: "rgba(186, 193, 202, 0.98)",
        },
        "&.Mui-focused": {
          boxShadow: "0 12px 22px rgba(15, 23, 42, 0.05)",
        },
        "&.Mui-focused fieldset": {
          borderColor: "rgba(217, 4, 61, 0.38)",
          borderWidth: "1px",
        },
      },
      "& .MuiPickersInputBase-sectionsContainer": {
        minHeight: "24px",
        paddingTop: "10px",
        paddingRight: "8px",
        paddingBottom: "10px",
        paddingLeft: "16px",
        alignItems: "center",
      },
      "& .MuiPickersInputBase-sectionContent, & .MuiPickersInputBase-sectionSeparator": {
        color: "#1f2937",
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: "24px",
      },
      "& .MuiInputAdornment-root": {
        marginRight: "8px",
      },
      "& .MuiIconButton-root": {
        padding: "5px",
        color: "#9ca3af",
      },
      "& .MuiInputLabel-root": {
        color: "#6b7280",
        backgroundColor: "rgba(255, 252, 249, 0.98)",
        px: 0.5,
        borderRadius: "999px",
        "&.Mui-focused": {
          color: "#9f1239",
        },
      },
    };
    const filterAutocompleteSx = {
      "& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root": {
        minHeight: "44px",
        alignItems: "center",
        paddingTop: "6px !important",
        paddingBottom: "6px !important",
        paddingLeft: "16px !important",
        paddingRight: "44px !important",
      },
      "& .MuiAutocomplete-input": {
        minHeight: "24px !important",
        height: "24px",
        lineHeight: "24px !important",
        alignSelf: "center",
        paddingTop: "0 !important",
        paddingBottom: "0 !important",
        margin: "0 !important",
      },
      "& .MuiAutocomplete-endAdornment": {
        top: "50%",
        transform: "translateY(-50%)",
      },
      "& .MuiAutocomplete-tag": {
        marginTop: "3px",
        marginBottom: "3px",
      },
      "& .MuiAutocomplete-input::placeholder": {
        lineHeight: "24px",
      },
    };

    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <Dialog
          open={this.state.modelCheckPay}
          onClose={() => {
            this.setState({ modelCheckPay: false });
          }}
          PaperProps={{
            sx: {
              width: "100%",
              maxWidth: 520,
              borderRadius: "16px",
            },
          }}
        >
          <DialogTitle>Подтверждение оплаты</DialogTitle>
          <DialogContent sx={{ pb: 0 }}>
            <DialogContentText sx={{ mb: 2 }}>Оплатить выбранные документы ?</DialogContentText>
            <Typography sx={{ fontWeight: 700 }}>
              Отмечено документов: {new Intl.NumberFormat("ru-RU").format(this.state.count_true)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ modelCheckPay: false });
              }}
              color="error"
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={this.multiPayBill.bind(this)}
              color="success"
            >
              Оплатить
            </Button>
          </DialogActions>
        </Dialog>
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 28, md: 32 },
                lineHeight: 1.15,
                fontWeight: 700,
                color: "#1f2937",
                mb: 0.25,
              }}
            >
              {this.state.module_name || "Накладные"}
            </Typography>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              alignItems: "center",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent={{ xs: "stretch", md: "flex-end" }}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <Button
                component={Link}
                href="/billing/pages"
                variant="contained"
                startIcon={<ContrastIcon />}
                sx={{
                  ...actionButtonSx,
                  flexShrink: 0,
                  maxWidth: 190,
                  backgroundColor: "#A8E4A0",
                  display: this.state.acces?.pages_access ? "flex" : "none",
                  color: "#1f2937",
                  "&:hover": {
                    backgroundColor: "#BDECB6",
                    boxShadow: "none",
                    color: "#111827",
                  },
                }}
              >
                Сверка наименований
              </Button>
              <Button
                component={Link}
                href="/billing/new"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{
                  ...actionButtonSx,
                  flexShrink: 0,
                  maxWidth: 190,
                  backgroundColor: "#1f2937",
                  "&:hover": {
                    backgroundColor: "#111827",
                    boxShadow: "none",
                  },
                }}
              >
                Новый документ
              </Button>
              {this.state.acces_bux_pay === true ? (
                <Button
                  variant="outlined"
                  startIcon={<PaymentsRoundedIcon />}
                  disabled={this.state.count_true === 0}
                  onClick={() => {
                    this.setState({ modelCheckPay: true });
                  }}
                  sx={{
                    ...actionButtonSx,
                    flexShrink: 0,
                    minWidth: 190,
                    borderColor: this.state.count_true > 0 ? "#16a34a" : "#d1d5db",
                    color: this.state.count_true > 0 ? "#166534" : "#6b7280",
                    backgroundColor: this.state.count_true > 0 ? "#f0fdf4" : "#fff",
                    "&:hover": {
                      borderColor: this.state.count_true > 0 ? "#16a34a" : "#d1d5db",
                      backgroundColor: this.state.count_true > 0 ? "#dcfce7" : "#fff",
                    },
                  }}
                >
                  Оплатить выбранные
                </Button>
              ) : null}
            </Stack>
          </Grid>

          <Grid size={12}>
            <Paper
              elevation={0}
              sx={filterPaperSx}
            >
              <Grid
                container
                spacing={2}
                alignItems="flex-end"
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 9,
                  }}
                >
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1f2937" }}>
                    Фильтр
                  </Typography>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                  sx={{
                    display: { xs: "none", md: "flex" },
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={this.getBillingList.bind(this)}
                    sx={{
                      ...actionButtonSx,
                      maxWidth: { md: 180 },
                      backgroundColor: "#d9043d",
                      "&:hover": {
                        backgroundColor: "#b80035",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Показать
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyDatePickerNew
                    label="Дата от"
                    format="DD-MM-YYYY"
                    value={this.state.date_start}
                    func={this.changeDateRange.bind(this, "date_start")}
                    clearable={true}
                    customActions={true}
                    sx={filterDateInputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyDatePickerNew
                    label="Дата до"
                    format="DD-MM-YYYY"
                    value={this.state.date_end}
                    func={this.changeDateRange.bind(this, "date_end")}
                    clearable={true}
                    customActions={true}
                    sx={filterDateInputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MySelect
                    data={this.state.types}
                    value={this.state.type}
                    multiple={false}
                    is_none={false}
                    unifiedPopup
                    func={this.changeSelect.bind(this, "type")}
                    label="Тип"
                    slotProps={unifiedDropdownSlotProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyAutocomplite2
                    label="Поставщик"
                    freeSolo={true}
                    multiple={false}
                    data={this.state.vendors}
                    unifiedPopup
                    value={this.state.search_vendor}
                    func={this.search.bind(this)}
                    onBlur={this.search.bind(this)}
                    slotProps={unifiedDropdownSlotProps}
                    sx={filterAutocompleteSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MySelect
                    data={this.state.bill_list}
                    value={this.state.status}
                    multiple={false}
                    is_none={false}
                    unifiedPopup
                    func={this.changeSelect.bind(this, "status")}
                    label="Статус"
                    slotProps={unifiedDropdownSlotProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyTextInput
                    label="Номер накладной"
                    value={this.state.number}
                    func={this.changeInput.bind(this)}
                    sx={filterTextInputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <MyAutocomplite
                    data={this.state.points}
                    multiple={true}
                    unifiedPopup
                    value={this.state.point}
                    func={this.changeAutocomplite.bind(this, "point")}
                    label="Кафе"
                    slotProps={unifiedDropdownSlotProps}
                    sx={filterAutocompleteSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <MyAutocomplite
                    data={this.state.all_items}
                    multiple={true}
                    unifiedPopup
                    value={this.state.items}
                    func={this.changeAutocomplite.bind(this, "items")}
                    label="Товары"
                    slotProps={unifiedDropdownSlotProps}
                    sx={filterAutocompleteSx}
                  />
                </Grid>

                <Grid
                  size={12}
                  sx={{ display: { xs: "flex", md: "none" } }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={this.getBillingList.bind(this)}
                    sx={{
                      ...actionButtonSx,
                      backgroundColor: "#d9043d",
                      "&:hover": {
                        backgroundColor: "#b80035",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Показать
                  </Button>
                </Grid>

                <Grid size={12}>
                  <Box
                    sx={{
                      mt: 0.5,
                      pt: 2,
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1}
                      alignItems={{ xs: "flex-start", md: "center" }}
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                        Короткая сводка
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                        Всего документов:{" "}
                        {new Intl.NumberFormat("ru-RU").format(this.state.bills.length)}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.25,
                        display: { xs: "grid", sm: "flex" },
                        gridTemplateColumns: {
                          xs: "1fr",
                        },
                        gap: 1,
                        alignItems: "stretch",
                        flexWrap: { sm: "wrap" },
                      }}
                    >
                      {statusSummaryItems.map((item) => (
                        <Paper
                          key={item.id}
                          elevation={0}
                          sx={{
                            px: { xs: 1.25, sm: 1.5 },
                            py: { xs: 0.95, sm: 1 },
                            borderRadius: { xs: "14px", sm: "14px" },
                            border: "1px solid #e5e7eb",
                            width: { xs: "100%", sm: "auto" },
                            minWidth: { sm: 180 },
                            maxWidth: "100%",
                            boxSizing: "border-box",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "minmax(0, 1fr) auto",
                              columnGap: 1,
                              rowGap: 0.5,
                              alignItems: "start",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ minWidth: 0 }}
                            >
                              <Box
                                sx={{
                                  width: 9,
                                  height: 9,
                                  borderRadius: "999px",
                                  backgroundColor: item.clr,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: { xs: 14, sm: 13 },
                                  fontWeight: 600,
                                  color: "#1f2937",
                                  minWidth: 0,
                                  lineHeight: 1.25,
                                  whiteSpace: { xs: "normal", sm: "nowrap" },
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Stack>
                            <Box
                              sx={{
                                px: 0.75,
                                py: 0.25,
                                borderRadius: "999px",
                                backgroundColor: "#f3f4f6",
                                color: "#4b5563",
                                fontSize: { xs: 12.5, sm: 12 },
                                fontWeight: 600,
                                lineHeight: 1.2,
                                ...tabularNumericSx,
                              }}
                            >
                              {new Intl.NumberFormat("ru-RU").format(Number(item.count) || 0)}
                            </Box>
                            <Typography
                              sx={{
                                gridColumn: "1 / -1",
                                fontSize: { xs: 13, sm: 12 },
                                color: "#6b7280",
                                textAlign: { xs: "left", sm: "right" },
                                pl: { xs: 2.25, sm: 0 },
                                ...tabularNumericSx,
                              }}
                            >
                              {formatBillingMoney(item.sum_w_nds)}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={12}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, md: 2.5 },
                  py: 2,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.25}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1f2937" }}>
                      Список накладных
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Box sx={headerMetricSx}>
                      Всего: {new Intl.NumberFormat("ru-RU").format(this.state.bills.length)}
                    </Box>
                    <Box sx={headerMetricSx}>
                      Риски: {new Intl.NumberFormat("ru-RU").format(warningBillsCount)}
                    </Box>
                    {this.state.acces_bux_pay === true ? (
                      <Box sx={headerMetricSx}>
                        К оплате: {new Intl.NumberFormat("ru-RU").format(this.state.count_true)}
                      </Box>
                    ) : null}
                  </Stack>
                </Stack>
              </Box>
              <TableContainer>
                <Table
                  aria-label="billing documents table"
                  size="small"
                  sx={{
                    "& .MuiTableHead-root .MuiTableCell-root": {
                      fontWeight: 700,
                      backgroundColor: "#f8fafc",
                      whiteSpace: "nowrap",
                    },
                    "& .MuiTableBody-root .MuiTableRow-root:hover": {
                      backgroundColor: "#f9fafb",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell
                        sx={{
                          width: 60,
                          px: 1,
                          textAlign: "center",
                        }}
                      >
                        {this.state.acces_bux_pay === true ? (
                          <Tooltip title="Выбрать все к оплате">
                            <Checkbox
                              size="small"
                              checked={
                                payableBillsCount > 0 && this.state.count_true === payableBillsCount
                              }
                              indeterminate={
                                this.state.count_true > 0 &&
                                this.state.count_true < payableBillsCount
                              }
                              onChange={this.check_all_bill_pay.bind(this)}
                              sx={{ p: 0.5 }}
                            />
                          </Tooltip>
                        ) : (
                          ""
                        )}
                      </TableCell>
                      <TableCell sx={riskCellSx}>Риск</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Номер</TableCell>
                      <TableCell>Дата накладной</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>Поставщик</TableCell>
                      <TableCell
                        align="right"
                        sx={{ minWidth: 160, pr: 3 }}
                      >
                        Сумма с НДС
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hasBills ? (
                      this.state.bills.map((item, key) => (
                        <TableRow
                          key={`${item.id}-${item.point_id}-${item.my_type_bill}`}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell
                            onClick={this.getOneBill.bind(this, item)}
                            sx={{ pl: 1.5 }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Tooltip title={getBillingStatusName(item.status)}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 24,
                                    borderRadius: "999px",
                                    backgroundColor: item.color || "#d1d5db",
                                    flexShrink: 0,
                                  }}
                                />
                              </Tooltip>
                              <Box sx={tabularNumericSx}>{key + 1}</Box>
                            </Stack>
                          </TableCell>
                          <TableCell
                            sx={
                              this.state.acces_bux_pay === true && parseInt(item?.status) == 9
                                ? { textAlign: "center", px: 1 }
                                : { px: 1 }
                            }
                          >
                            {this.state.acces_bux_pay === true && parseInt(item?.status) == 9 ? (
                              <Checkbox
                                size="small"
                                onChange={this.actionCheckBox.bind(
                                  this,
                                  item.id,
                                  item.point_id,
                                  item.my_type_bill,
                                )}
                                checked={
                                  this.state.arrPay[
                                    item.my_type_bill + "_" + item.id + "_" + item.point_id
                                  ]?.status ?? false
                                }
                                sx={{ p: 0.5 }}
                              />
                            ) : (
                              ""
                            )}
                          </TableCell>
                          <TableCell
                            onClick={this.getOneBill.bind(this, item)}
                            sx={riskCellSx}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {parseInt(item.check_day) === 1 ||
                              parseInt(item.check_price) === 1 ? (
                                <MyTooltip name={item.err_items ? item.err_items : item.err_date}>
                                  <ErrorIcon sx={{ color: "#d97706" }} />
                                </MyTooltip>
                              ) : (
                                "—"
                              )}
                            </Box>
                          </TableCell>
                          <TableCell onClick={this.getOneBill.bind(this, item)}>
                            {getBillingTypeName(item.my_type_bill)}
                          </TableCell>
                          <TableCell
                            onClick={this.getOneBill.bind(this, item)}
                            sx={{ fontWeight: 600 }}
                          >
                            {item.number}
                          </TableCell>
                          <TableCell
                            onClick={this.getOneBill.bind(this, item)}
                            sx={{
                              color: parseInt(item.check_day) === 1 ? "rgb(204, 0, 51)" : "inherit",
                              fontWeight: parseInt(item.check_day) === 1 ? 700 : 400,
                              ...tabularNumericSx,
                            }}
                          >
                            {formatDateReverse(item.date)}
                          </TableCell>
                          <TableCell onClick={this.getOneBill.bind(this, item)}>
                            {item.vendor_name}
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={this.getOneBill.bind(this, item)}
                            sx={{
                              pr: 3,
                              color:
                                parseInt(item.check_price) === 1 ? "rgb(204, 0, 51)" : "inherit",
                              fontWeight: parseInt(item.check_price) === 1 ? 700 : 500,
                              ...tabularNumericSx,
                            }}
                          >
                            {formatBillingMoney(item.sum_w_nds)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{ py: 5, textAlign: "center", color: "#6b7280" }}
                        >
                          Выбери тип и точки, затем нажми «Показать».
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Billing() {
  return <Billing_ />;
}
