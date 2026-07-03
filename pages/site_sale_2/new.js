import React from "react";

import Button from "@mui/material/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Typography from "@mui/material/Typography";

import dayjs from "dayjs";
import { api_laravel } from "@/src/api_new";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import PromoNewFormContent from "@/components/site_sale_2/PromoNewFormContent";
import { formatDateName } from "@/components/site_sale_2/promoNewShared";
import { getPresetPatch } from "@/components/site_sale_2/promoNewPresets";

function formatDateDot(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join(".");
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
        "Здравствуйте!\r\n" +
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

      activePresetId: "",
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

  applyPreset(presetId) {
    const patch = getPresetPatch(presetId, this.state);
    if (!patch) {
      return;
    }

    this.setState(patch, () => {
      setTimeout(() => {
        this.generateTextDescFalse();
        this.generateTextDescTrue();
      }, 300);
    });
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
        <PromoNewFormContent
          state={this.state}
          moduleName={this.state.module_name}
          changeData={this.changeData.bind(this)}
          changeDataCheck={this.changeDataCheck.bind(this)}
          changeDataData={this.changeDataData.bind(this)}
          changeDateRange={this.changeDateRange.bind(this)}
          addItemAdd={this.addItemAdd.bind(this)}
          delItemAdd={this.delItemAdd.bind(this)}
          priceItemAdd={this.priceItemAdd.bind(this)}
          delItemPrice={this.delItemPrice.bind(this)}
          changeItemPrice={this.changeItemPrice.bind(this)}
          onSave={this.save.bind(this)}
          onApplyPreset={this.applyPreset.bind(this)}
          activePresetId={this.state.activePresetId}
        />
      </>
    );
  }
}

export default function SiteSale2_New() {
  return <SiteSale2_new_ />;
}
