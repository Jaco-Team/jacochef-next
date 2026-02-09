import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DehazeIcon from "@mui/icons-material/Dehaze";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyCheckBox, MyTextInput, MyDatePickerNew, MyAutocomplite } from "@/ui/Forms";

import Dropzone from "dropzone";

import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";

import queryString from "query-string";

import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";

class TableStages extends React.Component {
  render() {
    return (
      <Table
        size="small"
        style={{ marginBottom: 50 }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              colSpan={5}
              style={{ textAlign: "center" }}
            >
              {this.props.title}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Количество</TableCell>
            <TableCell></TableCell>
            <TableCell>Сортировка</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.data.map((item, key) => (
            <TableRow key={key}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <MyTextInput
                  label=""
                  value={item.count}
                  disabled={!this.props.acces_edit}
                  func={this.props.changeData.bind(
                    this,
                    this.props.type,
                    this.props.arr,
                    "count",
                    key,
                  )}
                />
              </TableCell>
              <TableCell>{item.ei_name}</TableCell>
              <TableCell style={{ maxWidth: 100 }}>
                <MyTextInput
                  label=""
                  value={item.sort}
                  disabled={!this.props.acces_edit}
                  func={this.props.changeData.bind(
                    this,
                    this.props.type,
                    this.props.arr,
                    "sort",
                    key,
                  )}
                />
              </TableCell>
              <TableCell>
                <CloseIcon
                  onClick={this.props.delItem.bind(this, this.props.type, this.props.arr, key)}
                  style={{ cursor: !this.props.acces_edit ? "not-allowed" : "pointer" }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

class SiteItemsTable extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.timeUpdate;
    var array2 = this.props.timeUpdate;

    //var is_same = (array1.length == array2.length) && array1.every(function(element, index) {
    //    return element === array2[index];
    //});

    return array1 != array2;
  }

  render() {
    return (
      <Grid size={12}>
        {this.props.cats.map((cat, key) => (
          <Accordion key={key}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{cat.name}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ width: "100%", overflow: "scroll" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "2%" }}>id</TableCell>

                    <TableCell style={{ width: "23%" }}>Название</TableCell>
                    <TableCell style={{ width: "15%" }}>Ближайшее обновление</TableCell>
                    <TableCell style={{ width: "15%" }}>Сортировка</TableCell>

                    <TableCell style={{ width: "15%" }}>Активность</TableCell>
                    <TableCell style={{ width: "15%" }}>Сайт</TableCell>
                    <TableCell style={{ width: "15%" }}>Склад</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cat.items.map((it, k) => (
                    <TableRow key={k}>
                      <TableCell>{it.id}</TableCell>
                      <TableCell
                        onClick={this.props.openItem.bind(
                          this,
                          it,
                          it.date_update ? "hist" : "origin",
                          true,
                        )}
                      >
                        {it.name}
                      </TableCell>
                      {it.date_update ? (
                        <TableCell>
                          <MyDatePickerNew
                            label=""
                            value={dayjs(it.date_update)}
                            disabled={!this.props.acces_edit}
                            func={this.props.changeDateUpdate.bind(this, key, k, it.date_update_id)}
                          />
                        </TableCell>
                      ) : (
                        <TableCell></TableCell>
                      )}
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={it.sort}
                          func={this.props.changeSort.bind(this, key, k)}
                          disabled={!this.props.acces_edit}
                          onBlur={this.props.saveSort.bind(this, it.id)}
                        />
                      </TableCell>

                      <TableCell>
                        {parseInt(it.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </TableCell>
                      <TableCell>
                        {parseInt(it.show_site) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </TableCell>
                      <TableCell>
                        {parseInt(it.show_program) == 1 ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    );
  }
}

class SiteItems_ extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: "image/jpeg,image/png",
    addRemoveLinks: true,
    url: "https://jacochef.ru/src/img/site_img/upload_img_new.php",
  };
  myDropzoneNew = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "site_items",
      module_name: "",
      is_load: false,

      allItems: [],
      vendor_items: [],

      modalItemEdit: false,
      modalItemNew: false,

      itemEdit: null,
      itemName: "",

      checkArtDialog: false,
      checkArtList: [],

      freeItems: [],

      date_update: formatDate(new Date()),

      point_list: [],
      point_list_render: [],
      point_id: 0,

      app_list: [],
      app_id: -1,

      users: [],
      //editItem: null,
      modalUserEdit: false,
      modalUserNew: false,

      textDel: "",
      delModal: false,

      graphModal: false,
      graphType: 0,

      editItem: null,
      item_rec: null,
      item_pf: null,
      item_items_all: [],
      modalEdit: false,
      modalNew: false,
      types: [
        { id: 1, name: "Позиция (ролл)" },
        { id: 2, name: "Набор (сет)" },
        { id: 3, name: "Доп (палочки / соевый / ...)" },
        { id: 4, name: "Напиток" },
      ],
      cats: [],
      cat_list: [],
      cat_list_new: [],

      ItemTab: "1",
      ItemTab1: "0",

      anchorEl: null,
      openMenu: false,
      openMenuType: null,
      openMenuitem: null,

      pf_stage_1: [],
      pf_stage_2: [],
      pf_stage_3: [],

      item_items: [],

      myDropzoneNew: null,

      is_snack: false,
      textSnack: "",

      searchPf: "",
      item_pf_render: [],

      searchItems: "",
      item_items_render: [],
      acces_edit: false,

      openHist: [],
      timeUpdate: new Date(),

      tags_all: [],
      tags_my: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");
    const acces = data.acces?.find((i) => i.param === "form");
    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      cat_list: data.cat_list,
      acces_edit: acces?.edit === "1",
      cat_list_new: data.cat_list_new,
      timeUpdate: new Date(),
    });

    document.title = data.module_info.name;
  }

  async getItems() {
    let data = await this.getData("get_all");

    this.setState({
      cats: data.cats,
      cat_list: data.cat_list,
      timeUpdate: new Date(),
    });
  }

  getData = (method, data = {}, is_load = true) => {
    if (is_load == true) {
      this.setState({
        is_load: true,
      });
    }

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
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);
        console.log(err);
      });
  };

  async openItem(item, type = "origin", open_first = false) {
    let data = {
      id: item.id,
      type: type,
      hist_id: parseInt(this.state.ItemTab1),
    };

    let res = await this.getData("get_one", data);

    console.log("get_one", res);

    var items_pf_stages_1 = [],
      items_pf_stages_2 = [],
      items_pf_stages_3 = [],
      items_items = [];

    // todo
    if (res.item_pf.stage_1) {
      res.item_pf.stage_1.map(function (item) {
        console.log("open_type=" + item["type"]);

        // правка от 30.09.22
        if (item["type"] == "rec") {
          items_pf_stages_1.push({
            item_id: item["rec_id"],
            name: item["name"],
            count: item["count"],
            sort: item["sort"],
            ei_name: item["ei_name"],
            type: item["type"],
          });
        } else {
          items_pf_stages_1.push({
            item_id: item["pf_id"],
            name: item["name"],
            count: item["count"],
            sort: item["sort"],
            ei_name: item["ei_name"],
            type: item["type"],
          });
        }
      });
    }

    if (res.item_pf.stage_2) {
      res.item_pf.stage_2.map(function (item) {
        // правка от 30.09.22
        if (item["type"] == "rec") {
          items_pf_stages_2.push({
            item_id: item["rec_id"],
            name: item["name"],
            count: item["count"],
            sort: item["sort"],
            ei_name: item["ei_name"],
            type: item["type"],
          });
        } else {
          items_pf_stages_2.push({
            item_id: item["pf_id"],
            name: item["name"],
            count: item["count"],
            sort: item["sort"],
            ei_name: item["ei_name"],
            type: item["type"],
          });
        }
      });
    }
    if (res.item_pf.stage_3) {
      res.item_pf.stage_3.map(function (item) {
        // правка от 30.09.22
        if (item["type"] == "rec") {
          items_pf_stages_3.push({
            item_id: item["rec_id"],
            name: item["name"],
            count: item["count"],
            sort: item["sort"],
            ei_name: item["ei_name"],
            type: item["type"],
          });
        } else {
          items_pf_stages_3.push({
            item_id: item["pf_id"],
            name: item["name"],
            count: item["count"],
            sort: item["sort"],
            ei_name: item["ei_name"],
            type: item["type"],
          });
        }
      });
    }

    if (res.item_items.this_items) {
      res.item_items.this_items.map(function (item) {
        items_items.push({
          item_id: item["item_id"],
          name: item["name"],
          count: item["count"],
          is_add: parseInt(item["is_add"]),
        });
      });
    }

    //todo
    console.log("open_first=" + open_first);
    let ItemTab1 =
      res.hist.length > 0 && open_first && type == "hist" ? res.hist[0].id : this.state.ItemTab1;

    this.setState({
      editItem: res.item,
      item_rec: res.item_rec,
      item_pf: res.item_pf,
      item_pf_render: res.item_pf.all,
      item_items_all: res.item_items.all_items,
      item_items_render: res.item_items.all_items,

      pf_stage_1: items_pf_stages_1,
      pf_stage_2: items_pf_stages_2,
      pf_stage_3: items_pf_stages_3,

      item_items: items_items,

      openHist: res.hist,
      //правка
      ItemTab1: ItemTab1,
      modalEdit: true,

      date_update: dayjs(res.item.date_start) ?? dayjs(new Date()),

      tags_all: res.tags_all,
      tags_my: res.tags_my,
    });

    // правка от 18.07.2023
    // вызывало ошибку в модальном окне Редактирование товара,
    // т.к. dropzone уже создан, а при переключении между Tabs создавался еще один экзмемпляр dropzone, который уже есть в модальном окне Редактирование товара

    if (open_first) {
      setTimeout(() => {
        this.myDropzoneNew = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
      }, 300);
    }
  }

  async openNew() {
    let res = await this.getData("get_all_for_new");

    console.log("it", res.item);

    var items_pf_stages_1 = [],
      items_pf_stages_2 = [],
      items_pf_stages_3 = [],
      items_items = [];

    this.setState({
      editItem: res.item,
      item_rec: res.item_rec,
      item_pf: res.item_pf,
      item_pf_render: res.item_pf.all,
      item_items_all: res.item_items.all_items,
      item_items_render: res.item_items.all_items,

      pf_stage_1: items_pf_stages_1,
      pf_stage_2: items_pf_stages_2,
      pf_stage_3: items_pf_stages_3,

      item_items: items_items,

      tags_all: res.tags_all,
      tags_my: [],
      tag_name_new: "",
      modalNewTag: false,

      modalNew: true,
    });

    setTimeout(() => {
      this.myDropzoneNew = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
    }, 300);
  }

  changeItem(data, event) {
    let vendor = this.state.editItem;

    if (data == "category_id") {
      let val = event.target.value;
      let type = 1;
      let stol = vendor.stol;

      //сеты
      if (parseInt(val) == 4 || parseInt(val) == 21) {
        type = 2;
        stol = -1;
      }

      //напитки
      if (parseInt(val) == 6) {
        type = 4;
        stol = 0;
      }

      //соуса
      if (parseInt(val) == 7) {
        type = 3;
        stol = 0;
      }

      vendor["type"] = type;
      vendor["stol"] = stol;
    }

    if (
      data == "is_show" ||
      data == "show_site" ||
      data == "show_program" ||
      data == "is_new" ||
      data == "is_hit" ||
      data == "is_updated"
    ) {
      vendor[data] = event.target.checked === true ? 1 : 0;
    } else {
      vendor[data] = event.target.value;
    }

    this.setState({
      editItem: vendor,
    });
  }

  changeItem_(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  closeMenu() {
    this.setState({
      anchorEl: null,
      openMenu: false,
      openMenuType: null,
      openMenuitem: null,
    });
  }

  openMenu(type, item, event) {
    this.setState({
      anchorEl: event.currentTarget,
      openMenu: true,
      openMenuType: type,
      openMenuitem: item,
    });

    console.log(item);
  }

  chooseStage(stage) {
    let type = this.state.openMenuitem.storage_id ? "pf" : "rec";

    // правка от 13.11.22, убрал if this.state.openMenuitem.type == 'pf'
    //if( this.state.openMenuitem.type == 'pf' ){
    //if( type == 'pf' ){
    let check = false;

    let rec =
      stage == 1
        ? this.state.pf_stage_1
        : stage == 2
          ? this.state.pf_stage_2
          : stage == 3
            ? this.state.pf_stage_3
            : [];

    rec = rec ? rec : [];
    // проверка на добавленнный
    rec.map((this_item) => {
      if (parseInt(this.state.openMenuitem.id) == parseInt(this_item.item_id)) {
        check = true;
      }
    });

    if (!check) {
      //rec.push({item_id: this.state.openMenuitem.id, name: this.state.openMenuitem.name, count: 0, sort: 0, ei_name: this.state.openMenuitem.ei_name});
      rec.push({
        item_id: this.state.openMenuitem.id,
        name: this.state.openMenuitem.name,
        count: 0,
        sort: 0,
        ei_name: this.state.openMenuitem.ei_name,
        type: this.state.openMenuitem.type,
      });

      if (stage == 1) {
        this.setState({
          pf_stage_1: rec,
        });
      }

      if (stage == 2) {
        this.setState({
          pf_stage_2: rec,
        });
      }

      if (stage == 3) {
        this.setState({
          pf_stage_3: rec,
        });
      }
    }
    // }

    this.closeMenu();
  }

  chooseStage_old(stage) {
    let type = this.state.openMenuitem.storage_id ? "pf" : "rec";

    // if( this.state.openMenuType == 'pf' ){
    if (type == "pf") {
      let check = false;

      let rec =
        stage == 1
          ? this.state.pf_stage_1
          : stage == 2
            ? this.state.pf_stage_2
            : stage == 3
              ? this.state.pf_stage_3
              : [];

      rec = rec ? rec : [];

      rec.map((this_item) => {
        if (parseInt(this.state.openMenuitem.id) == parseInt(this_item.item_id)) {
          check = true;
        }
      });

      if (!check) {
        rec.push({
          item_id: this.state.openMenuitem.id,
          name: this.state.openMenuitem.name,
          count: 0,
          sort: 0,
          ei_name: this.state.openMenuitem.ei_name,
        });

        if (stage == 1) {
          this.setState({
            pf_stage_1: rec,
          });
        }

        if (stage == 2) {
          this.setState({
            pf_stage_2: rec,
          });
        }

        if (stage == 3) {
          this.setState({
            pf_stage_3: rec,
          });
        }
      }
    }

    this.closeMenu();
  }

  forwardItem(item) {
    let check = false;

    let rec = this.state.item_items;

    rec = rec ? rec : [];

    rec.map((this_item) => {
      if (parseInt(item.id) == parseInt(this_item.item_id)) {
        check = true;
      }
    });

    if (!check) {
      rec.push({ item_id: item.id, name: item.name, count: 1, is_add: 0 });

      this.setState({
        item_items: rec,
      });
    }
  }

  // todo rec pf
  changeData(type, arr, data, key, event) {
    if (type == "pf") {
      let rec =
        arr == "pf_stage_1"
          ? this.state.pf_stage_1
          : arr == "pf_stage_2"
            ? this.state.pf_stage_2
            : arr == "pf_stage_3"
              ? this.state.pf_stage_3
              : [];

      rec[key][data] = event.target.value;

      if (arr == "pf_stage_1") {
        this.setState({
          pf_stage_1: rec,
        });
      }

      if (arr == "pf_stage_2") {
        this.setState({
          pf_stage_2: rec,
        });
      }

      if (arr == "pf_stage_3") {
        this.setState({
          pf_stage_3: rec,
        });
      }
    }

    if (type == "item") {
      let rec = this.state.item_items;

      if (data == "is_add") {
        rec[key][data] = event.target.checked === true ? 1 : 0;
      } else {
        rec[key][data] = event.target.value;
      }

      this.setState({
        item_items: rec,
      });
    }
  }

  // todo rec pf
  delItem(type, arr, key) {
    if (type == "pf") {
      let rec =
        arr == "pf_stage_1"
          ? this.state.pf_stage_1
          : arr == "pf_stage_2"
            ? this.state.pf_stage_2
            : arr == "pf_stage_3"
              ? this.state.pf_stage_3
              : [];

      rec.splice(key, 1);

      rec = rec ? rec : [];

      if (arr == "pf_stage_1") {
        this.setState({
          pf_stage_1: rec,
        });

        console.log(rec);
      }

      if (arr == "pf_stage_2") {
        this.setState({
          pf_stage_2: rec,
        });
      }

      if (arr == "pf_stage_3") {
        this.setState({
          pf_stage_3: rec,
        });
      }
    }

    if (type == "item") {
      let rec = this.state.item_items;

      rec.splice(key, 1);

      rec = rec ? rec : [];

      this.setState({
        item_items: rec,
      });
    }
  }

  saveImg(dropzone, name, id, type) {
    dropzone.on("sending", (file, xhr, data) => {
      let file_type = file.name.split(".");
      file_type = file_type[file_type.length - 1];
      file_type = file_type.toLowerCase();

      data.append("filetype", "user_" + id + "." + file_type);
      data.append("filename", "user_" + id);
      data.append("typeFile", type);
      data.append("name", name);
    });

    dropzone.on("queuecomplete", (data) => {
      var check_img = false;

      dropzone["files"].map(function (item, key) {
        if (item["status"] == "error") {
          check_img = true;
        }
      });

      if (check_img) {
        alert("Ошибка при загрузке фотографии " + type);
      }
    });
  }

  async saveEditItem() {
    if (this.myDropzoneNew["files"].length > 0) {
      let name = this.state.editItem.name,
        id = this.state.editItem.id,
        type = "new";

      this.myDropzoneNew.on("sending", (file, xhr, data) => {
        let file_type = file.name.split(".");
        file_type = file_type[file_type.length - 1];
        file_type = file_type.toLowerCase();

        data.append("typeFile", type);
        data.append("name", name);
        data.append("id", id);
      });

      this.myDropzoneNew.on("queuecomplete", (data) => {
        var check_img = false;

        this.myDropzoneNew["files"].map((item, key) => {
          if (item["status"] == "error") {
            check_img = true;
          }

          if (item["status"] == "success") {
            this.setState({
              modalEdit: false,
              editItem: null,
              ItemTab: "1",
            });

            this.getItems();
          }
        });

        if (check_img) {
          alert("Ошибка при загрузке фотографии " + type);
        }
      });
    }

    // запихиваем рецепы в другой массив
    let rec_1 = [],
      pf_1 = [],
      item_1 = [];
    item_1 = this.state.pf_stage_1;

    item_1.map((this_item) => {
      if (this_item.type == "pf") {
        pf_1.push(this_item);
      } else {
        rec_1.push(this_item);
      }
    });

    let rec_2 = [],
      pf_2 = [],
      item_2 = [];
    item_2 = this.state.pf_stage_2;
    item_2.map((this_item) => {
      if (this_item.type == "pf") {
        pf_2.push(this_item);
      } else {
        rec_2.push(this_item);
      }
    });

    let rec_3 = [],
      pf_3 = [],
      item_3 = [];
    item_3 = this.state.pf_stage_3;
    item_3.map((this_item) => {
      if (this_item.type == "pf") {
        pf_3.push(this_item);
      } else {
        rec_3.push(this_item);
      }
    });

    let data = {
      item: this.state.editItem,
      rec_stage_1: rec_1,
      rec_stage_2: rec_2,
      rec_stage_3: rec_3,

      pf_stage_1: pf_1,
      pf_stage_2: pf_2,
      pf_stage_3: pf_3,

      item_items: this.state.item_items,

      tags_my: this.state.tags_my,
    };

    console.log(data);

    let res = await this.getData("saveEditItem", data);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.openSnack("Данные обновлены");

      if (this.myDropzoneNew["files"].length > 0) {
        this.myDropzoneNew.processQueue();
      } else {
        this.setState({
          modalEdit: false,
          editItem: null,
          ItemTab: "1",
        });

        this.getItems();
      }
    }
  }

  async saveEditItemHist() {
    if (this.myDropzoneNew["files"].length > 0) {
      let name = this.state.editItem.name,
        id = this.state.editItem.id,
        date_update = dayjs(this.state.date_update).format("YYYY-MM-DD"),
        hist_id = this.state.editItem.hist_id,
        type = "new";

      this.myDropzoneNew.on("sending", (file, xhr, data) => {
        let file_type = file.name.split(".");
        file_type = file_type[file_type.length - 1];
        file_type = file_type.toLowerCase();

        data.append("typeFile", type);
        data.append("name", name);
        data.append("id", id);
        data.append("hist_id", hist_id);
        data.append("date_update", date_update);
      });

      this.myDropzoneNew.on("queuecomplete", (data) => {
        var check_img = false;

        this.myDropzoneNew["files"].map((item, key) => {
          if (item["status"] == "error") {
            check_img = true;
          }

          if (item["status"] == "success") {
            this.setState({
              modalEdit: false,
              editItem: null,
              ItemTab1: "0",
              ItemTab: "1",
            });

            this.getItems();
          }
        });

        if (check_img) {
          alert("Ошибка при загрузке фотографии " + type);
        }
      });
    }

    // запихиваем рецепы в другой массив
    let rec_1 = [],
      pf_1 = [],
      item_1 = [];
    item_1 = this.state.pf_stage_1;
    item_1.map((this_item) => {
      if (this_item.type == "pf") {
        pf_1.push(this_item);
      } else {
        rec_1.push(this_item);
      }
    });

    let rec_2 = [],
      pf_2 = [],
      item_2 = [];
    item_2 = this.state.pf_stage_2;
    item_2.map((this_item) => {
      if (this_item.type == "pf") {
        pf_2.push(this_item);
      } else {
        rec_2.push(this_item);
      }
    });

    let rec_3 = [],
      pf_3 = [],
      item_3 = [];
    item_3 = this.state.pf_stage_3;
    item_3.map((this_item) => {
      if (this_item.type == "pf") {
        pf_3.push(this_item);
      } else {
        rec_3.push(this_item);
      }
    });

    let data = {
      dateUpdate: dayjs(this.state.date_update).format("YYYY-MM-DD"),
      item: this.state.editItem,
      rec_stage_1: rec_1,
      rec_stage_2: rec_2,
      rec_stage_3: rec_3,

      pf_stage_1: pf_1,
      pf_stage_2: pf_2,
      pf_stage_3: pf_3,

      item_items: this.state.item_items,

      tags_my: this.state.tags_my,
    };

    let res = await this.getData("saveEditItemHist", data);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.openSnack("Данные обновлены");

      if (this.myDropzoneNew["files"].length > 0) {
        this.myDropzoneNew.processQueue();
      } else {
        this.setState({
          modalEdit: false,
          editItem: null,
          ItemTab1: "0",
          ItemTab: "1",
        });

        this.getItems();
      }
    }
  }

  async saveNewItemHist() {
    //  правка от 13.12.22 запихиваем рецепы в другой массив
    let rec_1 = [],
      pf_1 = [],
      item_1 = [];
    item_1 = this.state.pf_stage_1;

    item_1.map((this_item) => {
      if (this_item.type == "pf") {
        pf_1.push(this_item);
      } else {
        rec_1.push(this_item);
      }
    });

    let rec_2 = [],
      pf_2 = [],
      item_2 = [];
    item_2 = this.state.pf_stage_2;
    item_2.map((this_item) => {
      if (this_item.type == "pf") {
        pf_2.push(this_item);
      } else {
        rec_2.push(this_item);
      }
    });

    let rec_3 = [],
      pf_3 = [],
      item_3 = [];
    item_3 = this.state.pf_stage_3;
    item_3.map((this_item) => {
      if (this_item.type == "pf") {
        pf_3.push(this_item);
      } else {
        rec_3.push(this_item);
      }
    });

    let data = {
      dateUpdate: dayjs(this.state.date_update).format("YYYY-MM-DD"),
      item: this.state.editItem,
      rec_stage_1: rec_1,
      rec_stage_2: rec_2,
      rec_stage_3: rec_3,

      pf_stage_1: pf_1,
      pf_stage_2: pf_2,
      pf_stage_3: pf_3,

      item_items: this.state.item_items,

      tags_my: this.state.tags_my,
    };

    let res = await this.getData("saveNewItemHist", data);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.openSnack("Данные обновлены");

      if (this.myDropzoneNew["files"].length > 0) {
        let name = this.state.editItem.name,
          id = this.state.editItem.id,
          date_update = this.state.date_update,
          hist_id = res.hist_id,
          type = "new";

        this.myDropzoneNew.on("sending", (file, xhr, data) => {
          let file_type = file.name.split(".");
          file_type = file_type[file_type.length - 1];
          file_type = file_type.toLowerCase();

          data.append("typeFile", type);
          data.append("name", name);
          data.append("id", id);
          data.append("hist_id", hist_id);
          data.append("date_update", date_update);
        });

        this.myDropzoneNew.on("queuecomplete", (data) => {
          var check_img = false;

          this.myDropzoneNew["files"].map((item, key) => {
            if (item["status"] == "error") {
              check_img = true;
            }

            if (item["status"] == "success") {
              this.setState({
                modalNew: false,
                editItem: null,
                ItemTab: "1",
                ItemTab1: "0",
              });

              this.getItems();
            }
          });

          if (check_img) {
            alert("Ошибка при загрузке фотографии " + type);
          }
        });
      }

      if (this.myDropzoneNew["files"].length > 0) {
        this.myDropzoneNew.processQueue();
      } else {
        this.setState({
          modalNew: false,
          editItem: null,
          ItemTab: "1",
          ItemTab1: "0",
        });

        this.getItems();
      }
    }
  }

  async saveNewItem() {
    // правка от 13.11.22 запихиваем рецепы в другой массив
    let rec_1 = [],
      pf_1 = [],
      item_1 = [];
    item_1 = this.state.pf_stage_1;

    item_1.map((this_item) => {
      if (this_item.type == "pf") {
        pf_1.push(this_item);
      } else {
        rec_1.push(this_item);
      }
    });

    let rec_2 = [],
      pf_2 = [],
      item_2 = [];
    item_2 = this.state.pf_stage_2;
    item_2.map((this_item) => {
      if (this_item.type == "pf") {
        pf_2.push(this_item);
      } else {
        rec_2.push(this_item);
      }
    });

    let rec_3 = [],
      pf_3 = [],
      item_3 = [];
    item_3 = this.state.pf_stage_3;
    item_3.map((this_item) => {
      if (this_item.type == "pf") {
        pf_3.push(this_item);
      } else {
        rec_3.push(this_item);
      }
    });

    console.log("pf_1", pf_1);
    console.log("pf_2", pf_2);
    console.log("pf_3", pf_3);
    console.log("rec_1", rec_1);
    console.log("rec_2", rec_2);
    console.log("rec_3", rec_3);

    let data = {
      item: this.state.editItem,
      rec_stage_1: rec_1,
      rec_stage_2: rec_2,
      rec_stage_3: rec_3,

      pf_stage_1: pf_1,
      pf_stage_2: pf_2,
      pf_stage_3: pf_3,

      item_items: this.state.item_items,

      tags_my: this.state.tags_my,
    };

    let res = await this.getData("saveNewItem", data);

    console.log(res);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.openSnack("Данные обновлены");

      if (this.myDropzoneNew["files"].length > 0) {
        let name = this.state.editItem.name,
          id = res.id,
          type = "new";

        this.myDropzoneNew.on("sending", (file, xhr, data) => {
          let file_type = file.name.split(".");
          file_type = file_type[file_type.length - 1];
          file_type = file_type.toLowerCase();

          data.append("typeFile", type);
          data.append("name", name);
          data.append("id", id);
        });

        this.myDropzoneNew.on("queuecomplete", (data) => {
          var check_img = false;

          this.myDropzoneNew["files"].map((item, key) => {
            if (item["status"] == "error") {
              check_img = true;
            }

            if (item["status"] == "success") {
              this.setState({
                modalNew: false,
                editItem: null,
                ItemTab: "1",
              });

              this.getItems();
            }
          });

          if (check_img) {
            alert("Ошибка при загрузке фотографии " + type);
          }
        });
      }

      if (this.myDropzoneNew["files"].length > 0) {
        this.myDropzoneNew.processQueue();
      } else {
        this.setState({
          modalNew: false,
          editItem: null,
          ItemTab: "1",
        });

        this.getItems();
      }
    }
  }

  async delUpdateItemTrue() {
    let data = {
      item: this.state.editItem,
    };

    let res = await this.getData("delUpdateItem", data);

    this.setState({
      ItemTab1: "0",
    });

    setTimeout(() => {
      //if( parseInt(this.state.ItemTab1) == -1 || parseInt(this.state.ItemTab1) == 0 ){
      this.openItem(this.state.editItem, "origin");
      //}else{
      //  this.openItem(this.state.editItem, 'hist');
      //}
    }, 300);
  }

  delUpdateItem() {
    const result = confirm("Точно удалить ?");
    if (result) {
      this.delUpdateItemTrue();
      //document.querySelector('#result').textContent = 'Вы ответили, что Вам нравится JavaScript';
    } else {
      //document.querySelector('#result').textContent = 'Вы ответили, что Вам не нравится JavaScript';
    }
  }

  changeTab(event, value) {
    this.setState({
      myDropzoneNew: this.myDropzoneNew["files"],
    });

    this.setState({
      ItemTab: value,
    });

    if (parseInt(value) == 1) {
      setTimeout(() => {
        this.myDropzoneNew = new Dropzone("#for_img_edit_new", this.dropzoneOptions);

        if (this.state.myDropzoneNew[0]) {
          var mockFileNew = {
            name: this.state.myDropzoneNew[0].name,
            size: this.state.myDropzoneNew[0].size,
            type: this.state.myDropzoneNew[0].type,
            status: this.state.myDropzoneNew[0].status,
            url: this.state.myDropzoneNew[0].dataURL,
            dataURL: this.state.myDropzoneNew[0].dataURL,
          };

          this.myDropzoneNew.emit("addedfile", mockFileNew);
          this.myDropzoneNew.emit("thumbnail", mockFileNew, this.state.myDropzoneNew[0].dataURL);
          this.myDropzoneNew.files.push(this.state.myDropzoneNew[0]);
        }
      }, 300);
    }
  }

  changeTab1(event, value) {
    this.setState({
      ItemTab1: value,
    });

    setTimeout(() => {
      console.log("v=" + value);
      // правка от 11.09.22
      if (parseInt(value) == -1 || parseInt(value) == 0) {
        // if(  parseInt(value) == 0 ){
        this.openItem(this.state.editItem, "origin");
      } else {
        this.openItem(this.state.editItem, "hist");
      }
    }, 300);
  }

  closeSnack() {
    this.setState({
      is_snack: false,
      textSnack: "",
    });
  }

  openSnack(text) {
    this.setState({
      is_snack: true,
      textSnack: text,
    });
  }

  searchPf(event) {
    let all_data = this.state.item_pf.all;
    let name = event.target.value;

    this.setState({
      searchPf: name,
    });

    let data_to_render = [];

    all_data.map((item) => {
      if (item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) {
        data_to_render.push(item);
      }
    });

    this.setState({
      item_pf_render: data_to_render,
    });
  }

  searchItems(event) {
    let all_data = this.state.item_items_all;
    let name = event.target.value;

    this.setState({
      searchItems: name,
    });

    let data_to_render = [];

    all_data.map((item) => {
      if (item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) {
        data_to_render.push(item);
      }
    });

    this.setState({
      item_items_render: data_to_render,
    });
  }

  closeEdit() {
    this.setState({
      modalEdit: false,
      editItem: null,
      ItemTab: "1",
      ItemTab1: "0",
      date_update: formatDate(new Date()),
    });

    this.getItems();
  }

  closeNew() {
    this.setState({
      modalNew: false,
      editItem: null,
      ItemTab: "1",
    });

    this.getItems();
  }

  changeSort(key_cat, key_item, event) {
    let value = event.target.value;
    let data = this.state.cats;

    data[key_cat]["items"][key_item]["sort"] = value;

    this.setState({
      cats: data,
      timeUpdate: new Date(),
    });
  }

  async changeDateUpdate(key_cat, key_item, update_id, event) {
    let value = event;
    let cats = this.state.cats;

    cats[key_cat]["items"][key_item]["date_update"] = dayjs(value).format("YYYY-MM-DD");

    this.setState({
      cats: cats,
      timeUpdate: new Date(),
    });

    let data = {
      update_id: update_id,
      dateUpdate: dayjs(value).format("YYYY-MM-DD"),
    };

    let res = await this.getData("saveUpdateDate", data);
  }

  async saveSort(item_id, event) {
    let data = {
      id: item_id,
      sort: event.target.value,
    };

    let res = await this.getData("saveSort", data);
  }

  async saveUpdateDate(item_id, update_id, event) {
    let data = {
      id: item_id,
      update_id: update_id,
      dateUpdate: dayjs(event).format("YYYY-MM-DD"),
    };

    console.log(data);

    let res = await this.getData("saveUpdateDate", data);
  }

  async trueUpdateVK() {
    let res = await this.getData("updateVK", {});
  }

  updateVK() {
    const result = confirm("Точно обновить товары в VK ?");
    if (result) {
      //true

      this.trueUpdateVK();
    } else {
      //false
    }
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event,
    });
  }

  changeAutocomplite(data, event, value) {
    let check = value.find((item) => parseInt(item.id) === -1);

    console.log(check);

    if (check) {
      this.openNewTag();

      return;
    } else {
      this.setState({
        [data]: value,
      });
    }
  }

  closeNewTag() {
    this.setState({
      modalNewTag: false,
      tag_name_new: "",
    });
  }

  openNewTag() {
    this.setState({
      modalNewTag: true,
      tag_name_new: "",
    });
  }

  async saveNewTag() {
    let data = {
      name: this.state.tag_name_new,
    };

    let res = await this.getData("saveNewTag", data);

    if (res.st === true) {
      this.setState({
        tags_all: res.tags,
      });

      this.closeNewTag();
    } else {
      this.openSnack(res.text);
    }
  }

  render() {
    const action = (
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={this.closeSnack.bind(this)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    );

    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 99999 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.is_snack}
          autoHideDuration={6000}
          onClose={this.closeSnack.bind(this)}
          message={this.state.textSnack}
          action={action}
        />
        <Dialog
          maxWidth={"sm"}
          fullWidth={true}
          open={this.state.modalNewTag}
          onClose={this.closeNewTag.bind(this)}
        >
          <DialogTitle className="button">
            <Typography>Новый тег</Typography>
            <IconButton onClick={this.closeNewTag.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <MyTextInput
                  label=""
                  value={this.state.tag_name_new}
                  func={this.changeItem_.bind(this, "tag_name_new")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeNewTag.bind(this)}>Отмена</Button>
            <Button
              type="submit"
              onClick={this.saveNewTag.bind(this)}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modalEdit}
          fullWidth={true}
          maxWidth={"md"}
          onClose={this.closeEdit.bind(this)}
        >
          <DialogTitle className="button">
            <Typography>Редактирование товара</Typography>
            <IconButton onClick={this.closeEdit.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              {this.state.editItem && this.state.modalEdit ? (
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <TabContext value={this.state.ItemTab1}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <TabList
                        onChange={this.changeTab1.bind(this)}
                        variant="fullWidth"
                      >
                        {this.state.openHist.map((item, key) => (
                          <Tab
                            key={key}
                            label={item.date_start}
                            value={item.id}
                          />
                        ))}
                        <Tab
                          label="Текущая"
                          value="0"
                        />
                        <Tab
                          label="Добавить"
                          value="-1"
                        />
                      </TabList>
                    </Box>
                  </TabContext>

                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <TabContext value={this.state.ItemTab}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                          <TabList
                            onChange={this.changeTab.bind(this)}
                            variant="fullWidth"
                          >
                            <Tab
                              label="Основные"
                              value="1"
                            />
                            <Tab
                              label="Заготовки"
                              value="3"
                            />
                            <Tab
                              label="Позиции"
                              value="4"
                            />
                          </TabList>
                        </Box>
                        <TabPanel value="1">
                          <Grid
                            container
                            spacing={3}
                          >
                            {parseInt(this.state.ItemTab1) == -1 ||
                            parseInt(this.state.ItemTab1) > 0 ? (
                              <Grid
                                size={{
                                  xs: 12,
                                }}
                              >
                                <Grid
                                  container
                                  spacing={3}
                                  sx={{
                                    justifyContent: "center",
                                  }}
                                >
                                  <Grid
                                    size={{
                                      xs: 4,
                                    }}
                                  >
                                    <MyDatePickerNew
                                      label="Дата обновления"
                                      value={this.state.date_update}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeDateRange.bind(this, "date_update")}
                                    />
                                  </Grid>

                                  {parseInt(this.state.ItemTab1) > 0 ? (
                                    <Grid
                                      size={{
                                        xs: 4,
                                      }}
                                    >
                                      <Button
                                        onClick={this.delUpdateItem.bind(this)}
                                        disabled={!this.state.acces_edit}
                                        style={{
                                          backgroundColor: "#c03",
                                          color: "#fff",
                                          height: "100%",
                                        }}
                                      >
                                        <CloseIcon />
                                      </Button>
                                    </Grid>
                                  ) : null}
                                </Grid>
                              </Grid>
                            ) : null}

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyTextInput
                                    label="Название"
                                    value={this.state.editItem.name}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "name")}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyTextInput
                                    label="Короткое название (20 сим.)"
                                    value={this.state.editItem.short_name}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "short_name")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MySelect
                                    data={this.state.types}
                                    value={this.state.editItem.type}
                                    func={this.changeItem.bind(this, "type")}
                                    disabled={true}
                                    label="Тип"
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MySelect
                                    data={this.state.cat_list}
                                    value={this.state.editItem.category_id}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "category_id")}
                                    label="Категория"
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyTextInput
                                    label="Код из 1с"
                                    value={this.state.editItem.art}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "art")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MySelect
                                    data={this.state.cat_list_new}
                                    value={this.state.editItem.category_id2}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "category_id2")}
                                    label="Категория для нового сайта"
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 3,
                                  }}
                                >
                                  <MyTextInput
                                    label="Стол"
                                    disabled={!this.state.acces_edit}
                                    value={this.state.editItem.stol}
                                    func={this.changeItem.bind(this, "stol")}
                                  />
                                </Grid>

                                {parseInt(this.state.editItem.category_id) == 6 ? (
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 3,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Объем"
                                      disabled={!this.state.acces_edit}
                                      value={this.state.editItem.weight}
                                      func={this.changeItem.bind(this, "weight")}
                                    />
                                  </Grid>
                                ) : (
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 3,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Вес"
                                      disabled={!this.state.acces_edit}
                                      value={this.state.editItem.weight}
                                      func={this.changeItem.bind(this, "weight")}
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
                                    label="Кол-во кусочков"
                                    value={this.state.editItem.count_part}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "count_part")}
                                  />
                                </Grid>

                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 3,
                                  }}
                                >
                                  <MyTextInput
                                    label="Размер"
                                    value={this.state.editItem.size_pizza}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "size_pizza")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            {parseInt(this.state.editItem.type) != 2 ? (
                              <Grid
                                size={{
                                  xs: 12,
                                }}
                              >
                                <Grid
                                  container
                                  spacing={3}
                                >
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Белки"
                                      value={this.state.editItem.protein}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "protein")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Жиры"
                                      value={this.state.editItem.fat}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "fat")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Углеводы"
                                      value={this.state.editItem.carbohydrates}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "carbohydrates")}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            ) : null}

                            {parseInt(this.state.editItem.type) != 2 ? (
                              <Grid
                                size={{
                                  xs: 12,
                                }}
                              >
                                <Grid
                                  container
                                  spacing={3}
                                >
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Время на 1 этап (ММ:СС)"
                                      value={this.state.editItem.time_stage_1}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "time_stage_1")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Время на 2 этап (ММ:СС)"
                                      value={this.state.editItem.time_stage_2}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "time_stage_2")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Время на 3 этап (ММ:СС)"
                                      value={this.state.editItem.time_stage_3}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "time_stage_3")}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            ) : null}

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <Typography>
                                    Картинка соотношением сторон (1:1) (пример: 2000х2000) только
                                    JPG
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  {this.state.editItem.img_app.length > 0 ? (
                                    <img
                                      src={
                                        "https://cdnimg.jacofood.ru/" +
                                        this.state.editItem.img_app +
                                        "_732x732.jpg"
                                      }
                                      style={{ width: "100%", height: "auto" }}
                                    />
                                  ) : (
                                    <div style={{ maxWidth: 300, maxHeight: 300 }} />
                                  )}
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <div
                                    className="dropzone"
                                    id="for_img_edit_new"
                                    onClick={(e) => {
                                      if (!this.state.acces_edit) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return;
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (
                                        !this.state.acces_edit &&
                                        (e.key === "Enter" || e.key === " ")
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      minHeight: 150,
                                      backgroundColor: !this.state.acces_edit
                                        ? "#f5f5f5"
                                        : "transparent",
                                      cursor: !this.state.acces_edit ? "not-allowed" : "pointer",
                                      opacity: !this.state.acces_edit ? 0.6 : 1,
                                      pointerEvents: !this.state.acces_edit ? "none" : "auto",
                                    }}
                                    role="button"
                                    tabIndex={this.state.acces_edit ? 0 : -1}
                                    aria-disabled={!this.state.acces_edit}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <MyTextInput
                                    label="Состав"
                                    value={this.state.editItem.tmp_desc}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "tmp_desc")}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <MyTextInput
                                    label="Короткое описание (в списке)"
                                    value={this.state.editItem.marc_desc}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "marc_desc")}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <MyTextInput
                                    label="Полное описание (в карточке)"
                                    value={this.state.editItem.marc_desc_full}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "marc_desc_full")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <MyAutocomplite
                                label="Теги"
                                multiple={true}
                                data={this.state.tags_all}
                                value={this.state.tags_my}
                                disabled={!this.state.acces_edit}
                                func={this.changeAutocomplite.bind(this, "tags_my")}
                              />
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Новинка"
                                    value={parseInt(this.state.editItem.is_new) == 1 ? true : false}
                                    func={this.changeItem.bind(this, "is_new")}
                                    disabled={!this.state.acces_edit}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Хит"
                                    value={parseInt(this.state.editItem.is_hit) == 1 ? true : false}
                                    func={this.changeItem.bind(this, "is_hit")}
                                    disabled={!this.state.acces_edit}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Обновлено"
                                    value={
                                      parseInt(this.state.editItem.is_updated) == 1 ? true : false
                                    }
                                    func={this.changeItem.bind(this, "is_updated")}
                                    disabled={!this.state.acces_edit}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Активность"
                                    value={
                                      parseInt(this.state.editItem.is_show) == 1 ? true : false
                                    }
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "is_show")}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Сайт и контакт-центр"
                                    value={
                                      parseInt(this.state.editItem.show_site) == 1 ? true : false
                                    }
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "show_site")}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyCheckBox
                                    label="На кассе"
                                    value={
                                      parseInt(this.state.editItem.show_program) == 1 ? true : false
                                    }
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "show_program")}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </TabPanel>

                        <TabPanel value="3">
                          <Grid
                            container
                            spacing={3}
                          >
                            {!this.state.item_pf ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Название</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell colSpan={2}>
                                        <MyTextInput
                                          label="Поиск"
                                          value={this.state.searchPf}
                                          func={this.searchPf.bind(this)}
                                        />
                                      </TableCell>
                                    </TableRow>

                                    {this.state.item_pf_render.map((item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                          <DehazeIcon
                                            onClick={this.openMenu.bind(this, "pf", item)}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Grid>
                            )}

                            {!this.state.item_rec ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 8,
                                }}
                                disabled={!this.state.acces_edit}
                              >
                                <TableStages
                                  title={"1 этап"}
                                  type={"pf"}
                                  arr={"pf_stage_1"}
                                  acces_edit={this.state.acces_edit}
                                  data={this.state.pf_stage_1}
                                  changeData={this.changeData.bind(this)}
                                  delItem={this.delItem.bind(this)}
                                />
                                <TableStages
                                  title={"2 этап"}
                                  type={"pf"}
                                  acces_edit={this.state.acces_edit}
                                  arr={"pf_stage_2"}
                                  data={this.state.pf_stage_2}
                                  changeData={this.changeData.bind(this)}
                                  delItem={this.delItem.bind(this)}
                                />
                                <TableStages
                                  title={"3 этап"}
                                  type={"pf"}
                                  arr={"pf_stage_3"}
                                  data={this.state.pf_stage_3}
                                  acces_edit={this.state.acces_edit}
                                  changeData={this.changeData.bind(this)}
                                  delItem={this.delItem.bind(this)}
                                />
                              </Grid>
                            )}
                          </Grid>
                        </TabPanel>

                        <TabPanel value="4">
                          <Grid
                            container
                            spacing={3}
                            disabled={!this.state.acces_edit}
                          >
                            {!this.state.item_pf ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Название</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell colSpan={2}>
                                        <MyTextInput
                                          label="Поиск"
                                          value={this.state.searchItems}
                                          func={this.searchItems.bind(this)}
                                        />
                                      </TableCell>
                                    </TableRow>

                                    {this.state.item_items_render.map((item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                          <AddIcon
                                            onClick={this.forwardItem.bind(this, item)}
                                            style={{ cursor: "pointer" }}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Grid>
                            )}

                            {!this.state.item_rec ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 8,
                                }}
                                disabled={!this.state.acces_edit}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        colSpan={5}
                                        style={{ textAlign: "center" }}
                                      >
                                        {this.props.title}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Название</TableCell>
                                      <TableCell>Количество</TableCell>
                                      <TableCell>Авт. добавление</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {this.state.item_items.map((item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                          <MyTextInput
                                            label=""
                                            value={item.count}
                                            func={this.changeData.bind(
                                              this,
                                              "item",
                                              "item_items",
                                              "count",
                                              key,
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <MyCheckBox
                                            label=""
                                            value={parseInt(item.is_add) == 1 ? true : false}
                                            func={this.changeData.bind(
                                              this,
                                              "item",
                                              "item_items",
                                              "is_add",
                                              key,
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <CloseIcon
                                            onClick={this.delItem.bind(this, "item", "", key)}
                                            style={{ cursor: "pointer" }}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Grid>
                            )}
                          </Grid>
                        </TabPanel>
                      </TabContext>
                    </Grid>
                  </Grid>

                  <Menu
                    anchorEl={this.state.anchorEl}
                    open={this.state.openMenu}
                    onClose={this.closeMenu.bind(this)}
                  >
                    <MenuItem onClick={this.chooseStage.bind(this, 1)}>1 этап</MenuItem>
                    <MenuItem onClick={this.chooseStage.bind(this, 2)}>2 этап</MenuItem>
                    <MenuItem onClick={this.chooseStage.bind(this, 3)}>3 этап</MenuItem>
                  </Menu>
                </Grid>
              ) : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            {parseInt(this.state.ItemTab1) == -1 ? (
              <Button
                onClick={this.saveNewItemHist.bind(this)}
                color="primary"
                disabled={!this.state.acces_edit}
              >
                Сохранить
              </Button>
            ) : parseInt(this.state.ItemTab1) == 0 ? (
              <Button
                onClick={this.saveEditItem.bind(this)}
                disabled={!this.state.acces_edit}
                color="primary"
              >
                Сохранить
              </Button>
            ) : (
              <Button
                onClick={this.saveEditItemHist.bind(this)}
                color="primary"
                disabled={!this.state.acces_edit}
              >
                Сохранить
              </Button>
            )}
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modalNew}
          fullWidth={true}
          maxWidth={"md"}
          onClose={this.closeNew.bind(this)}
        >
          <DialogTitle className="button">
            <Typography>Новый товар</Typography>
            <IconButton onClick={this.closeNew.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              {this.state.editItem && this.state.modalNew ? (
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <TabContext value={this.state.ItemTab}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                          <TabList
                            onChange={this.changeTab.bind(this)}
                            variant="fullWidth"
                          >
                            <Tab
                              label="Основные"
                              value="1"
                            />

                            <Tab
                              label="Заготовки"
                              value="3"
                            />
                            <Tab
                              label="Позиции"
                              value="4"
                            />
                          </TabList>
                        </Box>
                        <TabPanel value="1">
                          <Grid
                            container
                            spacing={3}
                          >
                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyTextInput
                                    label="Название"
                                    value={this.state.editItem.name}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "name")}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyTextInput
                                    label="Короткое название (20 сим.)"
                                    value={this.state.editItem.short_name}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "short_name")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MySelect
                                    data={this.state.types}
                                    value={this.state.editItem.type}
                                    func={this.changeItem.bind(this, "type")}
                                    disabled={!this.state.acces_edit}
                                    label="Тип"
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MySelect
                                    data={this.state.cat_list}
                                    value={this.state.editItem.category_id}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "category_id")}
                                    label="Категория"
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyTextInput
                                    label="Код из 1с"
                                    value={this.state.editItem.art}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "art")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MySelect
                                    data={this.state.cat_list_new}
                                    value={this.state.editItem.category_id2}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "category_id2")}
                                    label="Категория для нового сайта"
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 3,
                                  }}
                                >
                                  <MyTextInput
                                    label="Стол"
                                    value={this.state.editItem.stol}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "stol")}
                                  />
                                </Grid>

                                {parseInt(this.state.editItem.category_id) == 6 ? (
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 3,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Объем"
                                      value={this.state.editItem.weight}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "weight")}
                                    />
                                  </Grid>
                                ) : (
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 3,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Вес"
                                      value={this.state.editItem.weight}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "weight")}
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
                                    label="Кол-во кусочков"
                                    value={this.state.editItem.count_part}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "count_part")}
                                  />
                                </Grid>

                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 3,
                                  }}
                                >
                                  <MyTextInput
                                    label="Размер"
                                    value={this.state.editItem.size_pizza}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "size_pizza")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            {parseInt(this.state.editItem.type) != 2 ? (
                              <Grid
                                size={{
                                  xs: 12,
                                }}
                              >
                                <Grid
                                  container
                                  spacing={3}
                                >
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Белки"
                                      value={this.state.editItem.protein}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "protein")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Жиры"
                                      value={this.state.editItem.fat}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "fat")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Углеводы"
                                      value={this.state.editItem.carbohydrates}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "carbohydrates")}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            ) : null}

                            {parseInt(this.state.editItem.type) != 2 ? (
                              <Grid
                                size={{
                                  xs: 12,
                                }}
                              >
                                <Grid
                                  container
                                  spacing={3}
                                >
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Время на 1 этап (ММ:СС)"
                                      value={this.state.editItem.time_stage_1}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "time_stage_1")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Время на 2 этап (ММ:СС)"
                                      value={this.state.editItem.time_stage_2}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "time_stage_2")}
                                    />
                                  </Grid>
                                  <Grid
                                    size={{
                                      xs: 12,
                                      sm: 4,
                                    }}
                                  >
                                    <MyTextInput
                                      label="Время на 3 этап (ММ:СС)"
                                      value={this.state.editItem.time_stage_3}
                                      disabled={!this.state.acces_edit}
                                      func={this.changeItem.bind(this, "time_stage_3")}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            ) : null}

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <Typography>
                                    Картинка соотношением сторон (1:1) (пример: 2000х2000) только
                                    JPG
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  {this.state.editItem.img_app.length > 0 ? (
                                    <picture>
                                      <source
                                        srcSet={`
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_276x276.jpg 138w, 
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_292x292.jpg 146w,
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_366x366.jpg 183w,
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_466x466.jpg 233w,
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_585x585.jpg 292w
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_732x732.jpg 366w,
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_1168x1168.jpg 584w,
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_1420x1420.jpg 760w,
                                            https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_2000x2000.jpg 1875w`}
                                        sizes="(max-width=1439px) 233px, (max-width=1279px) 218px, 292px"
                                      />
                                      <img
                                        style={{ maxHeight: 300 }}
                                        src={`https://storage.yandexcloud.net/site-img/${this.state.editItem.img_app}_276x276.jpg`}
                                      />
                                    </picture>
                                  ) : (
                                    <div style={{ maxWidth: 300, maxHeight: 300 }} />
                                  )}
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <div
                                    className="dropzone"
                                    id="for_img_edit_new"
                                    onClick={(e) => {
                                      if (!this.state.acces_edit) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return;
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (
                                        !this.state.acces_edit &&
                                        (e.key === "Enter" || e.key === " ")
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      minHeight: 150,
                                      backgroundColor: !this.state.acces_edit
                                        ? "#f5f5f5"
                                        : "transparent",
                                      cursor: !this.state.acces_edit ? "not-allowed" : "pointer",
                                      opacity: !this.state.acces_edit ? 0.6 : 1,
                                      pointerEvents: !this.state.acces_edit ? "none" : "auto",
                                    }}
                                    role="button"
                                    tabIndex={this.state.acces_edit ? 0 : -1}
                                    aria-disabled={!this.state.acces_edit}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <MyTextInput
                                    label="Состав"
                                    value={this.state.editItem.tmp_desc}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "tmp_desc")}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <MyTextInput
                                    label="Короткое описание (в карточке)"
                                    value={this.state.editItem.marc_desc}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "marc_desc")}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                  }}
                                >
                                  <MyTextInput
                                    label="Полное описание (в карточке)"
                                    value={this.state.editItem.marc_desc_full}
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "marc_desc_full")}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <MyAutocomplite
                                label="Теги"
                                multiple={true}
                                data={this.state.tags_all}
                                value={this.state.tags_my}
                                disabled={!this.state.acces_edit}
                                func={this.changeAutocomplite.bind(this, "tags_my")}
                              />
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Новинка"
                                    value={parseInt(this.state.editItem.is_new) == 1 ? true : false}
                                    func={this.changeItem.bind(this, "is_new")}
                                    disabled={!this.state.acces_edit}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Хит"
                                    value={parseInt(this.state.editItem.is_hit) == 1 ? true : false}
                                    func={this.changeItem.bind(this, "is_hit")}
                                    disabled={!this.state.acces_edit}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Обновлено"
                                    value={
                                      parseInt(this.state.editItem.is_updated) == 1 ? true : false
                                    }
                                    func={this.changeItem.bind(this, "is_updated")}
                                    disabled={!this.state.acces_edit}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                              }}
                            >
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyCheckBox
                                    label="Активность"
                                    value={
                                      parseInt(this.state.editItem.is_show) == 1 ? true : false
                                    }
                                    disabled={!this.state.acces_edit}
                                    func={this.changeItem.bind(this, "is_show")}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyCheckBox
                                    label="На сайте"
                                    disabled={!this.state.acces_edit}
                                    value={
                                      parseInt(this.state.editItem.show_site) == 1 ? true : false
                                    }
                                    func={this.changeItem.bind(this, "show_site")}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    sm: 4,
                                  }}
                                >
                                  <MyCheckBox
                                    label="На складе"
                                    disabled={!this.state.acces_edit}
                                    value={
                                      parseInt(this.state.editItem.show_program) == 1 ? true : false
                                    }
                                    func={this.changeItem.bind(this, "show_program")}
                                    style={{ justifyContent: "center" }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </TabPanel>
                        <TabPanel value="3">
                          <Grid
                            container
                            spacing={3}
                          >
                            {!this.state.item_pf ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Название</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell colSpan={2}>
                                        <MyTextInput
                                          label="Поиск"
                                          value={this.state.searchPf}
                                          func={this.searchPf.bind(this)}
                                        />
                                      </TableCell>
                                    </TableRow>

                                    {this.state.item_pf_render.map((item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                          <DehazeIcon
                                            onClick={this.openMenu.bind(this, "pf", item)}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Grid>
                            )}

                            {!this.state.item_rec ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 8,
                                }}
                                disabled={!this.state.acces_edit}
                              >
                                <TableStages
                                  title={"1 этап"}
                                  type={"pf"}
                                  arr={"pf_stage_1"}
                                  acces_edit={this.state.acces_edit}
                                  data={this.state.pf_stage_1}
                                  changeData={this.changeData.bind(this)}
                                  delItem={this.delItem.bind(this)}
                                />
                                <TableStages
                                  title={"2 этап"}
                                  type={"pf"}
                                  arr={"pf_stage_2"}
                                  acces_edit={this.state.acces_edit}
                                  data={this.state.pf_stage_2}
                                  changeData={this.changeData.bind(this)}
                                  delItem={this.delItem.bind(this)}
                                />
                                <TableStages
                                  title={"3 этап"}
                                  type={"pf"}
                                  arr={"pf_stage_3"}
                                  data={this.state.pf_stage_3}
                                  acces_edit={this.state.acces_edit}
                                  changeData={this.changeData.bind(this)}
                                  delItem={this.delItem.bind(this)}
                                />
                              </Grid>
                            )}
                          </Grid>
                        </TabPanel>
                        <TabPanel value="4">
                          <Grid
                            container
                            spacing={3}
                          >
                            {!this.state.item_pf ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Название</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell colSpan={2}>
                                        <MyTextInput
                                          label="Поиск"
                                          value={this.state.searchItems}
                                          func={this.searchItems.bind(this)}
                                        />
                                      </TableCell>
                                    </TableRow>

                                    {this.state.item_items_render.map((item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                          <AddIcon
                                            onClick={this.forwardItem.bind(this, item)}
                                            style={{ cursor: "pointer" }}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Grid>
                            )}

                            {!this.state.item_rec ? null : (
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 8,
                                }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        colSpan={5}
                                        style={{ textAlign: "center" }}
                                      >
                                        {this.props.title}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Название</TableCell>
                                      <TableCell>Количество</TableCell>
                                      <TableCell>Авт. добавление</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {this.state.item_items.map((item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                          <MyTextInput
                                            label=""
                                            value={item.count}
                                            disabled={!this.state.acces_edit}
                                            func={this.changeData.bind(
                                              this,
                                              "item",
                                              "item_items",
                                              "count",
                                              key,
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <MyCheckBox
                                            disabled={!this.state.acces_edit}
                                            label=""
                                            value={parseInt(item.is_add) == 1 ? true : false}
                                            func={this.changeData.bind(
                                              this,
                                              "item",
                                              "item_items",
                                              "is_add",
                                              key,
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell disabled={!this.state.acces_edit}>
                                          <CloseIcon
                                            onClick={this.delItem.bind(this, "item", "", key)}
                                            style={{ cursor: "pointer" }}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Grid>
                            )}
                          </Grid>
                        </TabPanel>
                      </TabContext>
                    </Grid>
                  </Grid>

                  <Menu
                    anchorEl={this.state.anchorEl}
                    open={this.state.openMenu}
                    onClose={this.closeMenu.bind(this)}
                  >
                    <MenuItem onClick={this.chooseStage.bind(this, 1)}>1 этап</MenuItem>
                    <MenuItem onClick={this.chooseStage.bind(this, 2)}>2 этап</MenuItem>
                    <MenuItem onClick={this.chooseStage.bind(this, 3)}>3 этап</MenuItem>
                  </Menu>
                </Grid>
              ) : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.saveNewItem.bind(this)}
              color="primary"
              disabled={!this.state.acces_edit}
            >
              Сохранить
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
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              onClick={this.openNew.bind(this)}
              color="primary"
              variant="contained"
              disabled={!this.state.acces_edit}
            >
              Новый товар
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              onClick={this.updateVK.bind(this)}
              color="primary"
              variant="contained"
              disabled={!this.state.acces_edit}
            >
              Обновить товары VK
            </Button>
          </Grid>

          {this.state.cats.length == 0 ? null : (
            <SiteItemsTable
              timeUpdate={this.state.timeUpdate}
              cats={this.state.cats}
              changeSort={this.changeSort.bind(this)}
              acces_edit={this.state.acces_edit}
              saveSort={this.saveSort.bind(this)}
              changeDateUpdate={this.changeDateUpdate.bind(this)}
              openItem={this.openItem.bind(this)}
            />
          )}
        </Grid>
      </>
    );
  }
}

export default function SiteItems() {
  return <SiteItems_ />;
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
