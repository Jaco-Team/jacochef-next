import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyTextInput, MyAutocomplite, MyCheckBox } from "@/ui/Forms";

import { api, api_laravel, api_laravel_local } from "@/src/api_new";
import ErrCats from "@/components/option_to_win/ErrCats";
import OptionToWin_Modal from "@/components/option_to_win/OptionToWin_Modal";
import CatsModal from "@/components/option_to_win/CatsModal";

const toCsv = (v) =>
  !v
    ? ""
    : Array.isArray(v)
      ? v
          .map((x) => (typeof x === "object" ? x.id : x))
          .filter(Boolean)
          .join(",")
      : String(v)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(",");

class OptionToWin_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "option_to_win",
      module_name: "",
      is_load: false,

      err_cats: [],
      site_cats: [],

      modalCats: false,
      modalCatsTitle: "",
      catItem: null,
      catName: "",
      solutions: [],

      items: [],

      fullScreen: false,

      modalDialog: false,
      method: "",
      mark: "",
      item: null,
      itemName: "",

      itemNew: {
        stage_err_1: [],
        stage_err_2: [],
        stage_err_3: [],
        id_win: [],
        name: "",
        need_photo: 0,
      },
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      items: data.items,
      err_cats: data.err_cats,
      site_cats: data.site_cats,
      solutions: data.solutions,
      all_stages: data.all_stages,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
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

  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  async changeItemChecked(id, is_active, mark) {
    const is_active_edit = parseInt(is_active) == 1 ? 0 : 1;

    const items = this.state.items;

    items.map((item) => {
      if (item.id === id) {
        item.is_active = is_active_edit;
      }
    });

    this.setState({
      items,
      mark,
    });

    const data = {
      id,
      is_active: is_active_edit,
    };

    console.log(data);

    await this.getData("change_active", data);

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async saveActiveCat(id, is_active) {
    try {
      this.setState({ is_load: true });
      const data = {
        id,
        is_active,
      };
      await this.getData("set_active_cat", data);
    } catch (e) {
      console.error(e.message || "Ошибка");
    } finally {
      this.setState({ is_load: false });
      this.update();
    }
  }

  async save(item) {
    try {
      // LEGACY
      this.setState({ is_load: true });
      if (this.state.mark === "newItem") {
        const data = item;

        // console.log(data);

        await this.getData("save_new", data);
        return;
      }

      if (this.state.mark === "editItem") {
        const data = {
          id: item.err.id,
          name: item.err.name,
          is_active: item.err.is_active,
          need_photo: item.err.need_photo,
          id_win: item.this_wins,
          stage_err_1: item.this_stages_1,
          stage_err_2: item.this_stages_2,
          stage_err_3: item.this_stages_3,
        };

        await this.getData("save_edit", data);
        return;
      }
      // CATS
      const type = item.id ? "editCat" : "addCat";
      const properSiteCats = Array.isArray(item?.site_cats)
        ? item?.site_cats?.map((c) => c.id).join(",") || null
        : item?.site_cats;
      const request = {
        cat: {
          ...item,
          site_cats: properSiteCats,
          stage_1: toCsv(item.stage_1),
          stage_2: toCsv(item.stage_2),
          stage_3: toCsv(item.stage_3),
          solutions: toCsv(item.solutions),
        },
      };
      if (type === "editCat") {
        const res = await this.getData("update_cat", request);
        if (!res?.st) throw new Error(res?.text || "Ошибка сохранения категории");
      }
      if (type === "addCat") {
        const res = await this.getData("add_cat", request);
        if (!res?.st) throw new Error(res?.text || "Ошибка добавления категории");
      }
    } catch (e) {
      console.error(e?.message || "ERROOORRR");
    } finally {
      this.setState({ is_load: false, catItem: null });
      this.update();
    }
  }

  async changeCatActive(cat) {
    // const alterCat = { ...cat, is_active: !cat.is_active };
    // await this.save(alterCat);
    await this.saveActiveCat(cat.id, !cat.is_active);
  }

  async update() {
    const data = await this.getData("get_all");

    this.setState({
      items: data.items,
      err_cats: data.err_cats,
      site_cats: data.site_cats,
    });
  }

  async openCatsModal(title, mark, id = null) {
    const catItem = this.state.err_cats?.find((c) => +c.id === +id) || null;
    const itemName = catItem?.name || "";
    this.setState({
      mark,
      modalCats: true,
      modalCatsTitle: title,
      itemName,
      catItem,
    });
  }

  async removeErrCat(id) {
    if (!id) return;
    try {
      this.setState({ is_load: true });
      const res = await this.getData("delete_cat", { id });
      if (!res?.st) {
        throw new Error(res?.text || "Ошибка удаления");
      }
      this.update();
    } catch (e) {
      console.error(e.message || "Ошибка");
    } finally {
      this.setState({ is_load: false });
    }
  }

  async openModal(mark, method, id) {
    this.handleResize();

    if (mark === "newItem") {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData("get_all_for_new");

      item.err = itemNew;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === "editItem") {
      const data = {
        id,
      };

      //const item = await this.getData('get_one', data);
      const item = await this.getData("get_one", data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.err.name,
      });
    }
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

        <OptionToWin_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: "" })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <CatsModal
          open={this.state.modalCats}
          title={this.state.modalCatsTitle}
          catName={this.state.catName}
          errCats={this.state.err_cats}
          siteCats={this.state.site_cats}
          solutions={this.state.solutions}
          allStages={this.state.all_stages}
          item={this.state.catItem}
          onClose={() => this.setState({ modalCats: false, catName: "" })}
          save={this.save.bind(this)}
          remove={this.removeErrCat.bind(this)}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid size={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4.7,
            }}
          >
            Дерево категорий
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              onClick={this.openCatsModal.bind(this, "Новая категория", "addCat")}
              variant="contained"
            >
              Добавить категорию
            </Button>
          </Grid>

          <Grid size={12}>
            <ErrCats
              errCats={this.state.err_cats}
              siteCats={this.state.site_cats}
              openModal={this.openCatsModal.bind(this, "Редактировать", "editCat")}
              changeActive={this.changeCatActive.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              onClick={this.openModal.bind(this, "newItem", "Новый вариант жалобы")}
              variant="contained"
            >
              Новая жалоба
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "5%" }}>#</TableCell>
                    <TableCell style={{ width: "55%" }}>Наименование</TableCell>
                    <TableCell style={{ width: "40%" }}>Активность</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.items.map((item, key) => (
                    <TableRow
                      key={key}
                      hover
                    >
                      <TableCell>{key + 1}</TableCell>
                      <TableCell
                        onClick={this.openModal.bind(
                          this,
                          "editItem",
                          "Редактирование жалобы",
                          item.id,
                        )}
                        style={{ fontWeight: 700, cursor: "pointer" }}
                      >
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <MyCheckBox
                          label=""
                          value={parseInt(item.is_active) == 1 ? true : false}
                          func={this.changeItemChecked.bind(
                            this,
                            item.id,
                            item.is_active,
                            "editItem",
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function OptionToWin() {
  return <OptionToWin_ />;
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
