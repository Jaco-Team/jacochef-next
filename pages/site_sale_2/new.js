import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";

import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import {
  MySelect,
  MyCheckBox,
  MyTimePicker,
  MyTextInput,
  MyAutocomplite,
  MyDatePickerNew,
} from "@/ui/Forms";
import Typography from "@mui/material/Typography";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import DatePicker from "react-multi-date-picker";

import dayjs from "dayjs";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

class MyDatePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <>
        <Typography>{this.props.label}</Typography>
        <DatePicker
          format="YYYY-MM-DD"
          multiple
          sort
          //mask="____/__/__"
          //multiple={ this.props.multiple && this.props.multiple === true ? true : false }
          //disableCloseOnSelect={true}
          //inputFormat="yyyy-MM-dd"
          style={{ width: "100%" }}
          label={this.props.label}
          value={this.props.value}
          onChange={this.props.func}
        />
      </>
    );
  }
}

function formatDateDot(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join(".");
}

function formatDateName(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  //if (month.length < 2)
  //    month = '0' + month;
  if (day.length < 2) day = "0" + day;

  let m = "";

  switch (parseInt(month)) {
    case 1: {
      m = "Января";
      break;
    }
    case 2: {
      m = "Февраля";
      break;
    }
    case 3: {
      m = "Марта";
      break;
    }
    case 4: {
      m = "Апреля";
      break;
    }
    case 5: {
      m = "Мая";
      break;
    }
    case 6: {
      m = "Июня";
      break;
    }
    case 7: {
      m = "Июля";
      break;
    }
    case 8: {
      m = "Августа";
      break;
    }
    case 9: {
      m = "Сентября";
      break;
    }
    case 10: {
      m = "Октября";
      break;
    }
    case 11: {
      m = "Ноября";
      break;
    }
    case 12: {
      m = "Декабря";
      break;
    }
  }

  return [day, m].join(" ");
}

class SiteSale2_new_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: "site_sale_2",
      module_name: "",
      is_load: false,
      modalText: "",

      points: [],
      point: 0,
      cities: [],
      city: 0,

      modalDialog: false,
      modalLink: "",

      where_promo_list: [
        { id: 1, name: "Создать" },
        { id: 2, name: "Создать и показать" },
        { id: 3, name: "Отправить на почту" },
        { id: 4, name: "Отправить в смс" },
        { id: 5, name: "Рассылка смс" },
        { id: 6, name: "Отправить в ЛК (через 8)" },
        { id: 7, name: "Создать открытый сертификат(ы)" },
        { id: 9, name: "Создать скрытый сертификат(ы)" },
        { id: 8, name: "Отправить через бота ВК" },
      ],
      promo_action_list: [],
      sale_list: [
        { id: 1, name: "На товары" },
        { id: 2, name: "На категории" },
        { id: 3, name: "На все меню (кроме допов и закусок)" },
        //{id: 4, name: 'Самый дешевый товар (кроме допов и закусок)'},
        { id: 7, name: "На все меню" },
      ],
      promo_conditions_list: [
        { id: 1, name: "В корзине есть определенные товар(ы)" },
        //{id: 3, name: 'В корзине есть определенные категория'},
        { id: 2, name: "В корзине набрана определенная сумма" },
      ],
      promo_sale_list: [],
      type_sale_list: [
        { id: 1, name: "В рублях" },
        { id: 2, name: "В процентах" },
      ],
      date_promo_list: [
        { id: 1, name: "В определенные даты" },
        { id: 2, name: "14 дней с 10:00 до 21:40" },
        { id: 3, name: "14 дней с 00:00 до 23:59" },
        { id: 4, name: "30 дней с 10:00 до 21:40" },
        { id: 5, name: "30 дней с 00:00 до 23:59" },
      ],
      type_order_list: [
        { id: 1, name: "Все" },
        { id: 3, name: "Доставка" },
        { id: 2, name: "Самовывоз" },
        { id: 4, name: "Зал" },
      ],
      where_order_list: [
        { id: 1, name: "В городе" },
        { id: 2, name: "На точке" },
      ],

      promo_prizw_vk:
        "Привет!\r\n" +
        "Поздравляем 🎉\r\n" +
        "Промокод --promo-- на --position--, действует до --endDate--. Активировать можно при заказе на доставку, самовывоз и в кафе.\r\n\r\n" +
        "Обратите внимание, что за подарочную позицию надо будет заплатить 1 руб, это необходимое условие для получения приза. В промокод не входят соевый соус, имбирь и васаби.\r\n\r\n" +
        "Заказы принимаем на сайте --site--\r\n\r\n" +
        "Режим работы: с 10:00 до 21:30\r\n" +
        "Адреса наших кафе:\r\n" +
        "--addrCity--",

      spamNameSMS: "",

      for_new: false,
      once_number: false,
      for_registred: false,

      auto_text: true,
      where_promo: 1,
      promo_name: "",
      generate_new: false,
      count_action: 1,
      promo_action: 1,
      type_sale: 3,
      promo_sale: 1,
      sale_type: 2,
      promo_conditions: 2,

      price_start: 0,
      price_end: 0,
      date_promo: 1,

      date_start: formatDate(Date.now()),
      date_end: formatDate(Date.now()),
      rangeDate: [formatDate(Date.now()), formatDate(Date.now())],
      time_start: "10:00",
      time_end: "21:30",

      promo_length: 5,
      promo_count: 1,

      day_1: true,
      day_2: true,
      day_3: true,
      day_4: true,
      day_5: true,
      day_6: true,
      day_7: true,

      type_order: 1,
      where_order: 1,

      numberList: "",
      promo_desc_true: "",
      promo_desc_false: "",
      textSMS: "",

      addItem: null,
      addItemCount: 1,
      addItemPrice: 1,
      addItemAllPrice: 0,

      itemsAdd: [],
      itemsAddPrice: [],
      items: [],
      cats: [],
      saleCat: [],
      saleItem: [],

      priceItem: null,

      conditionItems: [],
      conditionCat: [],

      testDate: [],
      createdPromo: [],

      openAlert: false,
      err_status: true,
      err_text: "",

      cert_text: "",
      phoneInput: "",
      cleanPhone: "",

      for_number: false,
      for_number_text: "",
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all_for_new");

    let date = new Date();
    let fullDate = "";

    let Y = date.getFullYear();
    let M = date.getMonth() + 1;
    let D = date.getDate();

    fullDate = Y + "-" + (parseInt(M) > 9 ? M : "0" + M) + "-" + (parseInt(D) > 9 ? D : "0" + D);

    this.setState({
      points: data.points,
      cities: data.cities,
      module_name: data.module_info.name,
      promo_action_list: data.promo_action_list,
      promo_sale_list: data.promo_sale_list,

      //date_start: fullDate,
      //date_end: fullDate,

      items: data.items,
      cats: data.cats,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  async save() {
    if (!this.click) {
      this.click = true;

      this.setState({
        createdPromo: [],
      });

      let count_promo = 0;

      if (parseInt(this.state.sale_type) == 2) {
        count_promo = this.state.promo_sale_list.find(
          (item) => parseInt(item.id) == parseInt(this.state.promo_sale),
        )["name"];
      } else {
        count_promo = parseInt(this.state.promo_sale);
      }

      if (this.state.generate_new === false && this.state.promo_name.length < 3) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Название промокода должно содержать не менее 3 символов",
        });

        this.click = false;

        return;
      }

      if (this.state.for_number === true && this.state.for_number_text.length != 11) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Номер телефона обязателен, через 8 и без спец символов",
        });

        this.click = false;

        return;
      }

      let conditionItems = [];

      this.state.conditionItems.map((item) => {
        conditionItems.push(item.id);
      });

      let promo_items = [];

      this.state.saleItem.map((item) => {
        promo_items.push(item.id);
      });

      let promo_cat = [];

      this.state.saleCat.map((item) => {
        promo_cat.push(item.id);
      });

      let dateList = [];

      this.state.testDate.map((item) => {
        dateList.push(new Date(item).toISOString().split("T")[0]);
      });

      dateList = dateList.join(",");

      let { for_new, promo_prizw_vk, cert_text, promo_desc_true, promo_desc_false, textSMS } =
        this.state;

      let data = {
        spamNameSMS: this.state.spamNameSMS,
        promo_vk_prize: promo_prizw_vk,
        cert_text: cert_text,
        addr: this.state.numberList,
        where_promo: this.state.where_promo,
        promo_count: this.state.promo_count,
        promo_len: this.state.promo_length,
        promo_name: this.state.promo_name,
        generate: this.state.generate_new ? 1 : 0,
        promo_in_count: this.state.count_action,
        promo_action: this.state.promo_action,
        promo_type_sale: this.state.type_sale,
        count_promo: count_promo,
        promo_type: this.state.sale_type,
        promo_conditions: this.state.promo_conditions,

        promo_summ: this.state.price_start,
        promo_summ_to: this.state.price_end,
        promo_when: this.state.date_promo,

        date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
        date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
        time_start: this.state.time_start,
        time_end: this.state.time_end,

        day_1: this.state.day_1 ? 1 : 0,
        day_2: this.state.day_2 ? 1 : 0,
        day_3: this.state.day_3 ? 1 : 0,
        day_4: this.state.day_4 ? 1 : 0,
        day_5: this.state.day_5 ? 1 : 0,
        day_6: this.state.day_6 ? 1 : 0,
        day_7: this.state.day_7 ? 1 : 0,

        promo_type_order: this.state.type_order,
        promo_where: this.state.where_order,

        numberList: this.state.numberList,

        promo_city: this.state.city,
        promo_point: this.state.point,

        about_promo_text: promo_desc_true,
        condition_promo_text: promo_desc_false,
        textSMS: textSMS,

        promo_items: JSON.stringify(promo_items),
        promo_cat: JSON.stringify(promo_cat),
        promo_items_add: JSON.stringify(this.state.itemsAdd),
        promo_items_sale: JSON.stringify(this.state.itemsAddPrice),
        promo_conditions_items: JSON.stringify(conditionItems),

        date_between: dateList,
        for_new: for_new ? 1 : 0,
        once_number: this.state.once_number ? 1 : 0,
        for_registred: this.state.for_registred ? 1 : 0,

        for_number: this.state.for_number ? 1 : 0,
        for_number_text: this.state.for_number_text,
      };

      let res = await this.getData("save_new_promo", data);

      console.log(res);

      if (res["st"] == false) {
        this.setState({
          modalDialog: true,
          modalText: res.text_err,
        });

        setTimeout(() => {
          this.click = false;
        }, 300);

        return;
      }

      this.setState({
        createdPromo: res.promo_text,
      });

      //создать
      if (parseInt(this.state.where_promo) == 1 || parseInt(this.state.where_promo) == 8) {
        this.setState({
          modalDialog: true,
          modalText: "Создано",
        });
      }

      //создать и показать
      if (parseInt(this.state.where_promo) == 2) {
        this.setState({
          modalDialog: true,
          modalText: "Промокоды: " + res.promo_text.join(", "),
        });
      }

      //почта
      if (parseInt(this.state.where_promo) == 3) {
        this.setState({
          modalDialog: true,
          modalText: res.text,
        });
      }

      //смс / смс рассылка / ЛК
      if (
        parseInt(this.state.where_promo) == 4 ||
        parseInt(this.state.where_promo) == 5 ||
        parseInt(this.state.where_promo) == 6
      ) {
        this.setState({
          modalDialog: true,
          modalText: res.text,
        });
      }

      //сертификаты
      if (parseInt(this.state.where_promo) == 7 || parseInt(this.state.where_promo) == 9) {
        this.setState({
          modalDialog: true,
          modalText: res.text,
          modalLink: res.link,
        });
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

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

  changeData(type, event) {
    this.setState({
      [type]: event.target.value,
    });

    if (type == "date_promo" && (event.target.value == 2 || event.target.value == 3)) {
      let thisDay = new Date();
      let nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 14);

      this.setState({
        rangeDate: [formatDate(thisDay), formatDate(nextDay)],
        date_start: formatDate(thisDay),
        date_end: formatDate(nextDay),

        time_start: event.target.value == 2 ? "10:00" : "00:00",
        time_end: event.target.value == 2 ? "21:40" : "23:59",
      });
    }

    if (type == "date_promo" && (event.target.value == 4 || event.target.value == 5)) {
      let thisDay = new Date();
      let nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 30);

      this.setState({
        rangeDate: [formatDate(thisDay), formatDate(nextDay)],
        date_start: formatDate(thisDay),
        date_end: formatDate(nextDay),

        time_start: event.target.value == 4 ? "10:00" : "00:00",
        time_end: event.target.value == 4 ? "21:40" : "23:59",
      });
    }

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  changeDataCheck(type, event) {
    this.setState({
      [type]: event.target.checked,
    });

    if (type == "once_number" || type == "for_new" || type == "for_registred") {
      if (type == "once_number" && event.target.checked === true) {
        this.setState({
          for_new: false,
        });
      }
      if (type == "for_new" && event.target.checked === true) {
        this.setState({
          once_number: false,
          for_registred: false,
        });
      }
      if (type == "for_registred" && event.target.checked === true) {
        this.setState({
          for_new: false,
        });
      }
    }

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  changeDataData(type, data) {
    this.setState({
      [type]: data,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  generateTextDescTrue() {
    if (!this.state.auto_text) {
      return;
    }

    let promo_action = this.state.promo_action;
    let textTrue = "";
    let for_new = this.state.for_new;

    if (parseInt(promo_action) == 1) {
      //скидка
      var promo_type_sale = this.state.type_sale,
        //count_promo = this.state.promo_sale_list.find( (item) => parseInt(item.id) == parseInt(this.state.promo_sale) )['name'],//размер скидки
        promo_type = this.state.sale_type; //1 - рубли 2 %

      let count_promo = 0;

      if (parseInt(this.state.sale_type) == 2) {
        count_promo = count_promo = this.state.promo_sale_list.find(
          (item) => parseInt(item.id) == parseInt(this.state.promo_sale),
        )["name"]; //размер скидки
      } else {
        count_promo = parseInt(this.state.promo_sale);
      }

      if (parseInt(promo_type_sale) == 1) {
        //товары
        var promo_items = this.state.saleItem,
          items = "";

        promo_items.map(function (item, key) {
          items += item.name + ", ";
        });

        items = items.substring(0, items.length - 2);

        textTrue =
          "скидку на " +
          items +
          " в размере " +
          count_promo +
          (parseInt(promo_type) == 1 ? "руб." : "%");
      }
      if (parseInt(promo_type_sale) == 2) {
        //категории
        var promo_items = this.state.saleCat,
          items = "";

        promo_items.map(function (item, key) {
          items += item.name + ", ";
        });

        items = items.substring(0, items.length - 2);

        textTrue =
          "скидку на " +
          items +
          " в размере " +
          count_promo +
          (parseInt(promo_type) == 1 ? "руб." : "%");
      }
      if (parseInt(promo_type_sale) == 3) {
        //все
        textTrue =
          "скидку на всё меню, кроме напитков, соусов, приправ и палочек, в размере " +
          count_promo +
          (parseInt(promo_type) == 1 ? "руб." : "%");
      }
      if (parseInt(promo_type_sale) == 7) {
        //все
        textTrue =
          "скидку на всё меню, в размере " +
          count_promo +
          (parseInt(promo_type) == 1 ? "руб." : "%");
      }
    }

    if (parseInt(promo_action) == 2) {
      //добавляет товар
      var itemText = "";

      this.state.itemsAdd.map((item, key) => {
        if (parseInt(item["price"]) == 0) {
          itemText +=
            "бесплатную " +
            item["name"] +
            " " +
            item["count"] +
            "шт. " +
            "за " +
            item["price"] +
            "руб., ";
        } else {
          itemText +=
            item["name"] + " " + item["count"] + "шт. " + "за " + item["price"] + "руб., ";
        }
      });

      itemText = itemText.substring(0, itemText.length - 2);

      textTrue = this.state.itemsAdd.length == 1 ? "позицию " + itemText : "позиции " + itemText;
    }

    if (parseInt(promo_action) == 3) {
      //товар за цену
      var itemText = "";

      this.state.itemsAddPrice.map((item, key) => {
        itemText += item["name"] + " по " + item["price"] + "руб., ";
      });

      itemText = itemText.substring(0, itemText.length - 2);

      textTrue =
        this.state.itemsAddPrice.length - 1 == 1 ? "позицию " + itemText : "позиции " + itemText;
    }

    let textSMS =
      "Промокод --promo_name--, действует до " +
      formatDateName(this.state.date_end) +
      ". Заказывай на jacofood.ru!";

    // if( for_new === true ){
    //   textTrue += ". Только на первый заказ.";
    // }

    this.setState({
      promo_desc_true: textTrue,
      textSMS: textSMS,
      cert_text: textTrue,
    });
  }

  generateTextDescFalse() {
    if (!this.state.auto_text) {
      return;
    }

    var dop_text = "";
    let for_new = this.state.for_new;
    let once_number = this.state.once_number;
    let for_registred = this.state.for_registred;
    let for_number = this.state.for_number;
    let text = "";

    if (this.state.testDate.length > 0) {
      let dateList = [];

      this.state.testDate.map((item) => {
        dateList.push(new Date(item).toISOString().split("T")[0]);
      });

      text = "(кроме ";

      dateList.map(function (item) {
        text += formatDateName(item) + ", ";
      });

      text = text.slice(0, -1);
      text = text.slice(0, -1);

      text += ")";

      console.log("text", text);
    }

    if (parseInt(this.state.where_order) == 1) {
      //город
      if (parseInt(this.state.city) != 0) {
        let city_name = this.state.cities.find(
          (item) => parseInt(item.id) == parseInt(this.state.city),
        )["name"];

        dop_text = " в г. " + city_name;
      }
    }

    if (parseInt(this.state.where_order) == 2) {
      //точка
      if (parseInt(this.state.point) != 0) {
        let point_name = this.state.points.find(
          (item) => parseInt(item.id) == parseInt(this.state.point),
        )["name"];

        dop_text = " в г. " + point_name;
      }
    }

    let dateStart = formatDateDot(this.state.date_start);
    let dateEnd = formatDateDot(this.state.date_end);

    let textFalse =
      "Промокод действует c " +
      dateStart +
      " до " +
      dateEnd +
      " с " +
      this.state.time_start +
      " до " +
      this.state.time_end +
      " " +
      text +
      dop_text;

    if (for_new === true) {
      textFalse += ". Только на первый заказ.";
    }

    if (for_registred === true) {
      textFalse += ". Только для зарегистрированных.";
    }

    if (once_number === true) {
      textFalse += " Можно применить 1 раз.";
    }

    if (for_number === true) {
      textFalse += " Привязан к номеру телефона.";
    }

    this.setState({
      promo_desc_false: textFalse,
    });
  }

  addItemAdd() {
    let thisItems = this.state.itemsAdd;

    let check = thisItems.find((item) => parseInt(item.item_id) == parseInt(this.state.addItem.id));

    if (!check) {
      let thisItem = this.state.items.find(
        (item) => parseInt(item.id) == parseInt(this.state.addItem.id),
      );

      thisItems.push({
        item_id: this.state.addItem.id,
        name: thisItem.name,
        count: this.state.addItemCount,
        price: this.state.addItemPrice,
      });

      let addItemAllPrice = 0;

      thisItems.map((item) => {
        addItemAllPrice += parseInt(item.price);
      });

      this.setState({
        itemsAdd: thisItems,
        addItemAllPrice: addItemAllPrice,
      });
    }

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  delItemAdd(item) {
    let thisItems = this.state.itemsAdd;

    let newItems = thisItems.filter((it) => parseInt(it.item_id) != parseInt(item.item_id));

    let addItemAllPrice = 0;

    newItems.map((item) => {
      addItemAllPrice += parseInt(item.price);
    });

    this.setState({
      itemsAdd: newItems,
      addItemAllPrice: addItemAllPrice,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  priceItemAdd() {
    let thisItems = this.state.itemsAddPrice;

    let check = thisItems.find(
      (item) => parseInt(item.item_id) == parseInt(this.state.priceItem.id),
    );

    if (!check) {
      let thisItem = this.state.items.find(
        (item) => parseInt(item.id) == parseInt(this.state.priceItem.id),
      );

      thisItems.push({
        id: this.state.priceItem.id,
        name: thisItem.name,
        price: this.state.addItemCount,
      });

      this.setState({
        itemsAddPrice: thisItems,
      });
    }

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  delItemPrice(item) {
    let thisItems = this.state.itemsAddPrice;

    let newItems = thisItems.filter((it) => parseInt(it.id) != parseInt(item.id));

    let addItemAllPrice = 0;

    newItems.map((item) => {
      addItemAllPrice += parseInt(item.price);
    });

    this.setState({
      itemsAddPrice: newItems,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  changeItemPrice(item, event) {
    let thisItems = this.state.itemsAddPrice;

    let newItems = thisItems.map((it) => {
      if (parseInt(it.id) == parseInt(item.id)) {
        it.price = event.target.value;
      }

      return it;
    });

    this.setState({
      itemsAddPrice: newItems,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
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
        <Dialog
          open={this.state.modalDialog}
          onClose={() => {
            this.setState({ modalDialog: false, modalLink: "" });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            className="button"
          >
            Результат операции
            <IconButton onClick={() => this.setState({ modalDialog: false, modalLink: "" })}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Typography>{this.state.modalText}</Typography>

            <br />

            <Typography>Созданные промокоды: {this.state.createdPromo?.join(", ")}</Typography>

            <br />
            {!this.state.modalLink ? null : (
              <a
                href={this.state.modalLink}
                style={{ color: "red" }}
              >
                Скачать
              </a>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                this.setState({ modalDialog: false });
              }}
            >
              Хорошо
            </Button>
          </DialogActions>
        </Dialog>
        <Grid
          container
          style={{
            marginTop: "80px",
            paddingLeft: "24px",
            paddingRight: "24px",
            marginBottom: "24px",
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            {this.state.generate_new === true ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={this.state.promo_name}
                  func={this.changeData.bind(this, "promo_name")}
                  label="Название промокода"
                />
              </Grid>
            )}
            {this.state.generate_new === false ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={this.state.promo_length}
                  func={this.changeData.bind(this, "promo_length")}
                  label="Длина промокода"
                />
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyCheckBox
                value={this.state.generate_new}
                func={this.changeDataCheck.bind(this, "generate_new")}
                label="Сгенерировать"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  value={this.state.for_new}
                  func={this.changeDataCheck.bind(this, "for_new")}
                  label="Для новых клиентов ( на первый заказ )"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  value={this.state.once_number}
                  func={this.changeDataCheck.bind(this, "once_number")}
                  label="1 раз на номер телефона"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  value={this.state.for_registred}
                  func={this.changeDataCheck.bind(this, "for_registred")}
                  label="Только для зарегистрированных клиентов"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  value={this.state.for_number}
                  func={this.changeDataCheck.bind(this, "for_number")}
                  label="Привязан к номеру телефона"
                />
              </Grid>
            </Grid>

            {this.state.for_number && (
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={this.state.for_number_text}
                  func={this.changeData.bind(this, "for_number_text")}
                  label="Номер телефона"
                />
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                value={this.state.count_action}
                func={this.changeData.bind(this, "count_action")}
                label="Количество активаций"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                value={this.state.promo_count}
                func={this.changeData.bind(this, "promo_count")}
                label="Количество промокодов"
              />
            </Grid>
          </Grid>

          <Divider style={{ width: "100%", marginTop: 20 }} />

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MySelect
                data={this.state.promo_action_list}
                value={this.state.promo_action}
                func={this.changeData.bind(this, "promo_action")}
                label="Промокод дает:"
              />
            </Grid>
          </Grid>

          {parseInt(this.state.promo_action) !== 1 ? null : (
            <Grid
              container
              direction="row"
              style={{ paddingTop: 20 }}
              spacing={3}
              sx={{
                justifyContent: "center",
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MySelect
                  data={this.state.sale_list}
                  value={this.state.type_sale}
                  func={this.changeData.bind(this, "type_sale")}
                  label="Скидка"
                />
              </Grid>

              {parseInt(this.state.type_sale) !== 1 ? null : (
                <Grid
                  size={{
                    xs: 12,
                    sm: 9,
                  }}
                >
                  <MyAutocomplite
                    data={this.state.items}
                    value={this.state.saleItem}
                    func={(event, data) => {
                      this.changeDataData("saleItem", data);
                    }}
                    multiple={true}
                    label="Товары"
                  />
                </Grid>
              )}

              {parseInt(this.state.type_sale) !== 2 ? null : (
                <Grid
                  size={{
                    xs: 12,
                    sm: 9,
                  }}
                >
                  <MyAutocomplite
                    data={this.state.cats}
                    value={this.state.saleCat}
                    func={(event, data) => {
                      this.changeDataData("saleCat", data);
                    }}
                    multiple={true}
                    label="Категории"
                  />
                </Grid>
              )}

              {parseInt(this.state.sale_type) == 1 ? (
                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <MyTextInput
                    value={this.state.promo_sale}
                    func={this.changeData.bind(this, "promo_sale")}
                    label="Размер скидки"
                  />
                </Grid>
              ) : (
                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <MySelect
                    data={this.state.promo_sale_list}
                    value={this.state.promo_sale}
                    func={this.changeData.bind(this, "promo_sale")}
                    label="Размер скидки"
                  />
                </Grid>
              )}

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MySelect
                  data={this.state.type_sale_list}
                  value={this.state.sale_type}
                  func={this.changeData.bind(this, "sale_type")}
                  label="Какая скидка"
                />
              </Grid>
            </Grid>
          )}

          {parseInt(this.state.promo_action) !== 2 ? null : (
            <Grid
              container
              direction="row"
              style={{ paddingTop: 20 }}
              spacing={3}
              sx={{
                justifyContent: "center",
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyAutocomplite
                  data={this.state.items}
                  value={this.state.addItem}
                  func={(event, data) => {
                    this.changeDataData("addItem", data);
                  }}
                  label="Позиция"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={this.state.addItemCount}
                  func={this.changeData.bind(this, "addItemCount")}
                  label="Количество"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={this.state.addItemPrice}
                  func={this.changeData.bind(this, "addItemPrice")}
                  label="Цена за все"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Button
                  variant="contained"
                  onClick={this.addItemAdd.bind(this)}
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>
          )}

          {parseInt(this.state.promo_action) !== 2 ? null : (
            <Grid
              container
              direction="row"
              style={{ paddingTop: 20 }}
              spacing={3}
              sx={{
                justifyContent: "center",
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Позиция</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Цена за все</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.itemsAdd.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>{item.price}</TableCell>
                        <TableCell>
                          {" "}
                          <CloseIcon
                            onClick={this.delItemAdd.bind(this, item)}
                            style={{ cursor: "pointer" }}
                          />{" "}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                  <TableFooter>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{this.state.addItemAllPrice}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </Grid>
            </Grid>
          )}

          {parseInt(this.state.promo_action) !== 3 ? null : (
            <Grid
              container
              direction="row"
              style={{ paddingTop: 20 }}
              spacing={3}
              sx={{
                justifyContent: "center",
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyAutocomplite
                  data={this.state.items}
                  value={this.state.priceItem}
                  func={(event, data) => {
                    this.changeDataData("priceItem", data);
                  }}
                  label="Позиция"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={this.state.addItemCount}
                  func={this.changeData.bind(this, "addItemCount")}
                  label="Цена за 1 ед"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Button
                  variant="contained"
                  onClick={this.priceItemAdd.bind(this)}
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>
          )}

          {parseInt(this.state.promo_action) !== 3 ? null : (
            <Grid
              container
              direction="row"
              style={{ paddingTop: 20 }}
              spacing={3}
              sx={{
                justifyContent: "center",
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Позиция</TableCell>
                      <TableCell>Цена за 1 ед</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.itemsAddPrice.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.price}
                            func={this.changeItemPrice.bind(this, item)}
                          />
                        </TableCell>
                        <TableCell>
                          {" "}
                          <CloseIcon
                            onClick={this.delItemPrice.bind(this, item)}
                            style={{ cursor: "pointer" }}
                          />{" "}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          )}

          <Divider style={{ width: "100%", marginTop: 20 }} />

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                data={this.state.promo_conditions_list}
                value={this.state.promo_conditions}
                func={this.changeData.bind(this, "promo_conditions")}
                label="Условие"
              />
            </Grid>

            {parseInt(this.state.promo_conditions) == 1 && (
              <Grid
                size={{
                  xs: 12,
                  sm: 8,
                }}
              >
                <MyAutocomplite
                  data={this.state.items}
                  value={this.state.conditionItems}
                  func={(event, data) => {
                    this.changeDataData("conditionItems", data);
                  }}
                  multiple={true}
                  label="Товары"
                />
              </Grid>
            )}

            {parseInt(this.state.promo_conditions) == 3 && (
              <Grid
                size={{
                  xs: 12,
                  sm: 9,
                }}
              >
                <MyAutocomplite
                  data={this.state.cats}
                  value={this.state.conditionCat}
                  func={(event, data) => {
                    this.changeDataData("conditionCat", data);
                  }}
                  multiple={true}
                  label="Категории"
                />
              </Grid>
            )}

            {parseInt(this.state.promo_conditions) == 2 && (
              <>
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    value={this.state.price_start}
                    func={this.changeData.bind(this, "price_start")}
                    label="Сумма от"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    value={this.state.price_end}
                    func={this.changeData.bind(this, "price_end")}
                    label="Сумма до"
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Divider style={{ width: "100%", marginTop: 20 }} />

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MySelect
                data={this.state.date_promo_list}
                value={this.state.date_promo}
                func={this.changeData.bind(this, "date_promo")}
                label="Когда работает промокод"
              />
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyDatePickerNew
                label="Дата от"
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyDatePickerNew
                label="Дата до"
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTimePicker
                label="Время от"
                value={this.state.time_start}
                func={this.changeData.bind(this, "time_start")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTimePicker
                label="Время до"
                value={this.state.time_end}
                func={this.changeData.bind(this, "time_end")}
              />
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 11,
                sm: 11,
              }}
            >
              <MyDatePicker
                multiple={false}
                label={"Кроме дат"}
                value={this.state.testDate}
                func={this.changeDataData.bind(this, "testDate")}
              />
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ marginTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <MyCheckBox
              value={this.state.day_1}
              func={this.changeDataCheck.bind(this, "day_1")}
              label="Понедельник"
            />

            <MyCheckBox
              value={this.state.day_2}
              func={this.changeDataCheck.bind(this, "day_2")}
              label="Вторник"
            />

            <MyCheckBox
              value={this.state.day_3}
              func={this.changeDataCheck.bind(this, "day_3")}
              label="Среда"
            />

            <MyCheckBox
              value={this.state.day_4}
              func={this.changeDataCheck.bind(this, "day_4")}
              label="Четверг"
            />

            <MyCheckBox
              value={this.state.day_5}
              func={this.changeDataCheck.bind(this, "day_5")}
              label="Пятница"
            />

            <MyCheckBox
              value={this.state.day_6}
              func={this.changeDataCheck.bind(this, "day_6")}
              label="Суббота"
            />

            <MyCheckBox
              value={this.state.day_7}
              func={this.changeDataCheck.bind(this, "day_7")}
              label="Воскресенье"
            />
          </Grid>

          <Divider style={{ width: "100%", marginTop: 20 }} />

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                data={this.state.type_order_list}
                value={this.state.type_order}
                func={this.changeData.bind(this, "type_order")}
                label="Тип заказа"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                data={this.state.where_order_list}
                value={this.state.where_order}
                func={this.changeData.bind(this, "where_order")}
                label="Где работает"
              />
            </Grid>
            {parseInt(this.state.where_order) !== 1 ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MySelect
                  data={this.state.cities}
                  value={this.state.city}
                  func={this.changeData.bind(this, "city")}
                  label="Город"
                />
              </Grid>
            )}
            {parseInt(this.state.where_order) !== 2 ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MySelect
                  data={this.state.points}
                  value={this.state.point}
                  func={this.changeData.bind(this, "point")}
                  label="Точка"
                />
              </Grid>
            )}
          </Grid>

          <Divider style={{ width: "100%", marginTop: 20 }} />

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                data={this.state.where_promo_list}
                value={this.state.where_promo}
                func={this.changeData.bind(this, "where_promo")}
                label="Что сделать с промокодом"
              />
            </Grid>

            {parseInt(this.state.where_promo) == 1 ||
            parseInt(this.state.where_promo) == 2 ||
            parseInt(this.state.where_promo) == 7 ||
            parseInt(this.state.where_promo) == 9 ? null : parseInt(this.state.where_promo) == 5 ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <span>Список номеров для рассылки</span>
                <TextareaAutosize
                  aria-label="empty textarea"
                  // placeholder=""
                  minRows={3}
                  value={this.state.numberList}
                  onChange={this.changeData.bind(this, "numberList")}
                  label="Куда отправить"
                  style={{ width: "100%" }}
                  placeholder={"89999999999,89999999999"}
                />
              </Grid>
            ) : (
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyTextInput
                  value={this.state.numberList}
                  func={(event) => {
                    this.changeData("numberList", event);
                  }}
                  placeholder={
                    this.state.where_promo == 4
                      ? "89999999999"
                      : this.state.where_promo == 8
                        ? `id юзера ВК`
                        : "example@mail.ru"
                  }
                  label="Куда отправить"
                />
              </Grid>
            )}
          </Grid>

          <Divider style={{ width: "100%", marginTop: 20 }} />

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            {parseInt(this.state.where_promo) !== 8 ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <span>Текст расссылки</span>
                <TextareaAutosize
                  aria-label="empty textarea"
                  placeholder=""
                  minRows={3}
                  value={this.state.promo_prizw_vk}
                  onChange={this.changeData.bind(this, "promo_prizw_vk")}
                  style={{ width: "100%" }}
                />
              </Grid>
            )}

            {parseInt(this.state.where_promo) == 5 ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  value={this.state.spamNameSMS}
                  func={this.changeData.bind(this, "spamNameSMS")}
                  label="Наименование рассылки"
                />
              </Grid>
            ) : null}

            {parseInt(this.state.where_promo) == 4 || parseInt(this.state.where_promo) == 5 ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  value={this.state.textSMS}
                  func={this.changeData.bind(this, "textSMS")}
                  label="Текст СМС ( --promo_name-- )"
                />
              </Grid>
            ) : null}

            {parseInt(this.state.where_promo) == 7 || parseInt(this.state.where_promo) == 9 ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  value={this.state.cert_text}
                  func={this.changeData.bind(this, "cert_text")}
                  label="Текст для описания сертификата"
                />
              </Grid>
            ) : null}

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyCheckBox
                value={this.state.auto_text}
                func={this.changeDataCheck.bind(this, "auto_text")}
                label="Авто-текст"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                value={this.state.promo_desc_true}
                func={this.changeData.bind(this, "promo_desc_true")}
                label="Описание промокода после активации (Промокод дает: )"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                value={this.state.promo_desc_false}
                func={this.changeData.bind(this, "promo_desc_false")}
                label="Условие промокода, когда условия не соблюдены"
              />
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ paddingTop: 50 }}
            spacing={3}
            sx={{
              justifyContent: "end",
            }}
          >
            <Button
              variant="contained"
              onClick={this.save.bind(this)}
            >
              Сохранить
            </Button>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SiteSale2_New() {
  return <SiteSale2_new_ />;
}
