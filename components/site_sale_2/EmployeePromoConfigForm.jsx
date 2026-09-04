import React from "react";
import dayjs from "dayjs";
import PromoNewFormContent from "@/components/site_sale_2/PromoNewFormContent";
import {
  buildEmployeePromoConfigPayload,
  getEmptyEmployeePromoForm,
} from "@/components/site_sale_2/employeePromoConfig";

const STATIC_LISTS = {
  sale_list: [
    { id: 1, name: "На товары" },
    { id: 2, name: "На категории" },
    { id: 3, name: "На все меню (кроме допов и закусок)" },
    { id: 7, name: "На все меню" },
  ],
  promo_conditions_list: [
    { id: 1, name: "В корзине есть определенные товар(ы)" },
    { id: 2, name: "В корзине набрана определенная сумма" },
  ],
  type_sale_list: [
    { id: 1, name: "В рублях" },
    { id: 2, name: "В процентах" },
  ],
  type_order_list: [
    { id: 1, name: "Все" },
    { id: 3, name: "Доставка" },
    { id: 2, name: "Самовывоз" },
    { id: 4, name: "Зал" },
  ],
  where_order_list: [
    { id: 1, name: "В городе" },
    { id: 2, name: "В кафе" },
  ],
};

export class EmployeePromoConfigForm extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    const catalogs = props.catalogs || {};

    this.state = {
      ...getEmptyEmployeePromoForm(),
      ...(props.initialData || {}),
      ...STATIC_LISTS,
      promo_action_list: catalogs.promo_action_list || [],
      promo_sale_list: catalogs.promo_sale_list || [],
      items: catalogs.items || [],
      cats: catalogs.cats || [],
      points: catalogs.points || [],
      cities: catalogs.cities || [],
    };
  }

  componentDidMount() {
    if (this.state.auto_text) {
      setTimeout(() => {
        this.generateTextDescFalse();
        this.generateTextDescTrue();
      }, 300);
    }
  }

  async save() {
    if (this.click) {
      return;
    }

    this.click = true;

    const effectiveDate = dayjs(this.state.effective_date);

    if (!this.state.effective_date || !effectiveDate.isValid()) {
      if (this.props.onError) {
        this.props.onError("Укажите корректную дату вступления изменений");
      }

      this.click = false;
      return;
    }

    if (effectiveDate.startOf("day").isBefore(dayjs().startOf("day"))) {
      if (this.props.onError) {
        this.props.onError("Дата вступления изменений не может быть раньше сегодняшнего дня");
      }

      this.click = false;
      return;
    }

    const data = buildEmployeePromoConfigPayload(this.state);

    try {
      await this.props.onSave(data);
    } finally {
      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  changeData(type, event) {
    this.setState({
      [type]: event.target.value,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  changeDataCheck(type, event) {
    this.setState({
      [type]: event.target.checked,
    });

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

    if (parseInt(promo_action) == 1) {
      var promo_type_sale = this.state.type_sale,
        promo_type = this.state.sale_type;

      let count_promo = 0;

      if (parseInt(this.state.sale_type) == 2) {
        const found = (this.state.promo_sale_list || []).find(
          (item) => parseInt(item.id) == parseInt(this.state.promo_sale),
        );
        count_promo = found ? found.name : this.state.promo_sale;
      } else {
        count_promo = parseInt(this.state.promo_sale);
      }

      if (parseInt(promo_type_sale) == 1) {
        var promo_items = this.state.saleItem || [],
          items = "";

        promo_items.map(function (item) {
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
        var promo_items = this.state.saleCat || [],
          items = "";

        promo_items.map(function (item) {
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
        textTrue =
          "скидку на всё меню, кроме напитков, соусов, приправ и палочек, в размере " +
          count_promo +
          (parseInt(promo_type) == 1 ? "руб." : "%");
      }
      if (parseInt(promo_type_sale) == 7) {
        textTrue =
          "скидку на всё меню, в размере " +
          count_promo +
          (parseInt(promo_type) == 1 ? "руб." : "%");
      }
    }

    if (parseInt(promo_action) == 2) {
      var itemText = "";

      (this.state.itemsAdd || []).map((item) => {
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

      textTrue =
        (this.state.itemsAdd || []).length == 1 ? "позицию " + itemText : "позиции " + itemText;
    }

    if (parseInt(promo_action) == 3) {
      var itemText = "";

      (this.state.itemsAddPrice || []).map((item) => {
        itemText += item["name"] + " по " + item["price"] + "руб., ";
      });

      itemText = itemText.substring(0, itemText.length - 2);

      textTrue =
        (this.state.itemsAddPrice || []).length == 1
          ? "позицию " + itemText
          : "позиции " + itemText;
    }

    this.setState({
      promo_desc_true: textTrue,
    });
  }

  generateTextDescFalse() {
    if (!this.state.auto_text) {
      return;
    }

    let dop_text = "";

    if (parseInt(this.state.where_order) == 1) {
      if (parseInt(this.state.city) != 0) {
        const city = (this.state.cities || []).find(
          (item) => parseInt(item.id) == parseInt(this.state.city),
        );
        if (city) {
          dop_text = " в г. " + city.name;
        }
      }
    }

    if (parseInt(this.state.where_order) == 2) {
      if (parseInt(this.state.point) != 0) {
        const point = (this.state.points || []).find(
          (item) => parseInt(item.id) == parseInt(this.state.point),
        );
        if (point) {
          dop_text = " в г. " + point.name;
        }
      }
    }

    const timeStart = this.state.time_start || "10:00";
    const timeEnd = this.state.time_end || "21:30";

    this.setState({
      promo_desc_false:
        "Промокод действует для сотрудников с " + timeStart + " до " + timeEnd + dop_text,
    });
  }

  addItemAdd() {
    if (!this.state.addItem) {
      return;
    }

    let thisItems = this.state.itemsAdd || [];

    let check = thisItems.find((item) => parseInt(item.item_id) == parseInt(this.state.addItem.id));

    if (!check) {
      let thisItem = (this.state.items || []).find(
        (item) => parseInt(item.id) == parseInt(this.state.addItem.id),
      );

      if (!thisItem) {
        return;
      }

      thisItems.push({
        item_id: this.state.addItem.id,
        name: thisItem.name,
        count: this.state.addItemCount,
        price: this.state.addItemPrice,
      });

      let addItemAllPrice = 0;

      thisItems.map((item) => {
        addItemAllPrice += parseInt(item.price) || 0;
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
    let thisItems = this.state.itemsAdd || [];
    let newItems = thisItems.filter((it) => parseInt(it.item_id) != parseInt(item.item_id));
    let addItemAllPrice = 0;

    newItems.map((row) => {
      addItemAllPrice += parseInt(row.price) || 0;
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
    if (!this.state.priceItem) {
      return;
    }

    let thisItems = this.state.itemsAddPrice || [];

    let check = thisItems.find((item) => parseInt(item.id) == parseInt(this.state.priceItem.id));

    if (!check) {
      let thisItem = (this.state.items || []).find(
        (item) => parseInt(item.id) == parseInt(this.state.priceItem.id),
      );

      if (!thisItem) {
        return;
      }

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
    let thisItems = this.state.itemsAddPrice || [];
    let newItems = thisItems.filter((it) => parseInt(it.id) != parseInt(item.id));

    this.setState({
      itemsAddPrice: newItems,
    });

    setTimeout(() => {
      this.generateTextDescFalse();
      this.generateTextDescTrue();
    }, 300);
  }

  changeItemPrice(item, event) {
    let thisItems = this.state.itemsAddPrice || [];

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
      <PromoNewFormContent
        state={this.state}
        moduleName="Конфиг промокода"
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
        mode="employee_config"
        embedded
        saveLabel={this.props.saveLabel || "Сохранить изменения"}
      />
    );
  }
}
