import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Divider from "@mui/material/Divider";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyCheckBox, MyAutocomplite, MyTextInput } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import Box from "@mui/material/Box";
import MyAlert from "@/ui/MyAlert";
import { ModalAccept } from "@/components/general/ModalAccept";

class SkladItemsModule_Modal_History_View extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView,
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={"xl"}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: "center" }}>
            Изменения в{this.props.itemName ? `: ${this.props.itemName}` : ""}
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Название товара"
                value={
                  this.state.itemView
                    ? this.state.itemView.name?.color
                      ? this.state.itemView.name.key
                      : this.state.itemView.name
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.name?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Категория"
                value={
                  this.state.itemView
                    ? this.state.itemView.cat_id?.color
                      ? this.state.itemView.cat_id.key
                      : this.state.itemView.cat_id
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.cat_id?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 1.5,
              }}
            >
              <MyTextInput
                label="Ед измер"
                value={
                  this.state.itemView
                    ? this.state.itemView.ed_izmer_id?.color
                      ? this.state.itemView.ed_izmer_id.key
                      : this.state.itemView.ed_izmer_id
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.ed_izmer_id?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Максимальное количество заказов в месяц (0 - без ограничений)"
                value={
                  this.state.itemView
                    ? this.state.itemView.max_count_in_m?.color
                      ? this.state.itemView.max_count_in_m.key
                      : this.state.itemView.max_count_in_m
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.max_count_in_m?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Маркетинговое название"
                value={
                  this.state.itemView
                    ? this.state.itemView.mark_name?.color
                      ? this.state.itemView.mark_name.key
                      : this.state.itemView.mark_name
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.mark_name?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Название товара для поставщика"
                value={
                  this.state.itemView
                    ? this.state.itemView.name_for_vendor?.color
                      ? this.state.itemView.name_for_vendor.key
                      : this.state.itemView.name_for_vendor
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.name_for_vendor?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Количество в упаковке"
                value={
                  this.state.itemView
                    ? this.state.itemView.pq?.color
                      ? this.state.itemView.pq.key
                      : this.state.itemView.pq
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.pq?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 1.5,
              }}
            >
              <MyTextInput
                label="% заявки"
                value={
                  this.state.itemView
                    ? this.state.itemView.percent?.color
                      ? this.state.itemView.percent.key
                      : this.state.itemView.percent
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.percent?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Разрешенный % повышения ценника"
                value={
                  this.state.itemView
                    ? this.state.itemView.vend_percent?.color
                      ? this.state.itemView.vend_percent.key
                      : this.state.itemView.vend_percent
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.vend_percent?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Код для 1с"
                value={
                  this.state.itemView
                    ? this.state.itemView.art?.color
                      ? this.state.itemView.art.key
                      : this.state.itemView.art
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.art?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Минимальный остаток"
                value={
                  this.state.itemView
                    ? this.state.itemView.min_count?.color
                      ? this.state.itemView.min_count.key
                      : this.state.itemView.min_count
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.min_count?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Аллергены"
                value={
                  this.state.itemView
                    ? this.state.itemView.my_allergens?.color
                      ? this.state.itemView.my_allergens.key
                      : this.state.itemView.my_allergens
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.my_allergens?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Возможные аллергены"
                value={
                  this.state.itemView
                    ? this.state.itemView.my_allergens_other?.color
                      ? this.state.itemView.my_allergens_other.key
                      : this.state.itemView.my_allergens_other
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.my_allergens_other?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <h4>Места хранения</h4>
              <Divider />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Места хранения"
                value={
                  this.state.itemView
                    ? this.state.itemView.this_storages?.color
                      ? this.state.itemView.this_storages.key
                      : this.state.itemView.this_storages
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.this_storages?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Активность"
                value={
                  this.state.itemView
                    ? this.state.itemView.is_show?.color
                      ? this.state.itemView.is_show.key
                      : this.state.itemView.is_show
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.is_show?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Заявка"
                value={
                  this.state.itemView
                    ? this.state.itemView.show_in_order?.color
                      ? this.state.itemView.show_in_order.key
                      : this.state.itemView.show_in_order
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.show_in_order?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Ревизия"
                value={
                  this.state.itemView
                    ? this.state.itemView.show_in_rev?.color
                      ? this.state.itemView.show_in_rev.key
                      : this.state.itemView.show_in_rev
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.show_in_rev?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Честный знак"
                value={
                  this.state.itemView
                    ? this.state.itemView.acc_sys?.color
                      ? this.state.itemView.acc_sys.key
                      : this.state.itemView.acc_sys
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.acc_sys?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <h4>Разгрузка</h4>
              <Divider />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Должность в кафе"
                value={
                  this.state.itemView
                    ? this.state.itemView.app_id?.color
                      ? this.state.itemView.app_id.key
                      : this.state.itemView.app_id
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.app_id?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3.5,
              }}
            >
              <MyTextInput
                label="Время ММ:SS за 1кг / 1шт / 1л (15:20)"
                value={
                  this.state.itemView
                    ? this.state.itemView.time_min_other?.color
                      ? this.state.itemView.time_min_other.key
                      : this.state.itemView.time_min_other
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.time_min_other?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.onClose.bind(this)}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladItemsModule_Modal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log(nextProps.item);

    if (!nextProps.item) {
      return null;
    }

    if (nextProps.item !== prevState.item) {
      return { item: nextProps.item };
    }
    return null;
  }

  onClose() {
    this.setState({
      item: [],
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={"md"}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: "center" }}>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ""}
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              aria-label="sticky table"
            >
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                  <TableCell style={{ width: "3%" }}>#</TableCell>
                  <TableCell style={{ width: "25%" }}>Наименование</TableCell>
                  <TableCell style={{ width: "20%" }}>Действует с</TableCell>
                  <TableCell style={{ width: "17%" }}>по</TableCell>
                  <TableCell style={{ width: "25%" }}>Редактор</TableCell>
                  <TableCell style={{ width: "10%" }}>Просмотр</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow
                    key={key}
                    hover
                  >
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.date_start}</TableCell>
                    <TableCell>{it?.date_end ?? ""}</TableCell>
                    <TableCell>{it.user}</TableCell>
                    <TableCell
                      style={{ cursor: "pointer" }}
                      onClick={this.props.openModalHistoryView.bind(this, key)}
                    >
                      <TextSnippetOutlinedIcon />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.onClose.bind(this)}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladItemsModule_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemEdit: null,
      condition: "new",
      rules_save: true,
      openDelete: false,
    };
  }

  componentDidMount() {
    this.setState({
      condition: this.props.method === "Редактирование товара" ? "edit" : "new",
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      const currentStorages = this.state.itemEdit ? this.state.itemEdit.this_storages : [];

      if (this.props.event) {
        const newItemEdit = {
          ...this.props.event,
          this_storages: this.props.event.this_storages || currentStorages,
        };

        this.setState({
          itemEdit: newItemEdit,
          openAlert: false,
          err_status: false,
          err_text: "",
        });
      }
      if (
        this.props.acces?.name_edit === 0 &&
        this.props.acces?.cats_edit === 0 &&
        this.props.acces?.ed_izmer_edit === 0 &&
        this.props.acces?.max_count_in_m_edit === 0 &&
        this.props.acces?.mark_name_edit === 0 &&
        this.props.acces?.name_for_vendor_edit === 0 &&
        this.props.acces?.pq_edit === 0 &&
        this.props.acces?.percent_edit === 0 &&
        this.props.acces?.vend_percent_edit === 0 &&
        this.props.acces?.art_edit === 0 &&
        this.props.acces?.min_count_edit === 0 &&
        this.props.acces?.allergens_edit === 0 &&
        this.props.acces?.my_allergens_other_edit === 0 &&
        this.props.acces?.is_show_edit === 0 &&
        this.props.acces?.show_in_order_edit === 0 &&
        this.props.acces?.show_in_rev_edit === 0 &&
        this.props.acces?.honest_sign_edit === 0 &&
        this.props.acces?.mercury_edit === 0 &&
        this.props.acces?.this_storages_edit === 0 &&
        this.props.acces?.apps_edit === 0 &&
        this.props.acces?.time_min_other_edit === 0
      ) {
        this.setState({
          rules_save: false,
        });
      }
    }
  }

  changeItem(data, event) {
    let value = this.state.itemEdit;
    value.item[data] = event.target.value;

    this.setState({
      itemEdit: value,
    });
  }

  save() {
    let item = this.state.itemEdit;

    let {
      name,
      cat_id,
      ed_izmer_id,
      name_for_vendor,
      pq,
      art,
      pf_id,
      my_allergens,
      my_allergens_other,
      app_id,
    } = item.item;
    let { this_storages } = item;
    if (
      (!name && this.props.acces?.name_edit) ||
      (!cat_id && this.props.acces?.cats_edit) ||
      (!ed_izmer_id && this.props.acces?.ed_izmer_edit) ||
      (!name_for_vendor && this.props.acces?.name_for_vendor_edit) ||
      (!pq && this.props.acces?.pq_edit) ||
      (!art && this.props.acces?.art_edit) ||
      (!my_allergens.length && this.props.acces?.allergens_edit) ||
      (!my_allergens_other.length && this.props.acces?.my_allergens_other_edit) ||
      (!this_storages.length && this.props.acces?.this_storages_edit)
    ) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Все поля формы должны быть заполнены",
      });

      return;
    } else {
      if (!name) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Название должно быть заполнено",
        });

        return;
      }
    }

    this.props.method === "Редактирование товара"
      ? this.props.checkArt(item)
      : this.props.checkArtNew(item);
  }

  async delete() {
    const res = await this.props.getData("delete_item", { id: this.state.itemEdit?.item?.id });
    this.setState(
      {
        openDelete: false,
      },
      () => {
        this.props.onClose();
        this.props.update();
      },
    );
  }

  onClose() {
    this.setState({
      itemEdit: this.props.event ? this.props.event : null,
      openAlert: false,
      err_status: false,
      err_text: "",
    });

    this.props.onClose();
  }

  render() {
    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {this.state.openDelete && (
          <ModalAccept
            open={this.state.openDelete}
            onClose={() => this.setState({ openDelete: false })}
            title="Удалить товар?"
            save={() => {
              this.delete();
              this.setState({ openDelete: false });
            }}
          />
        )}
        <Dialog
          open={this.props.open}
          fullWidth={true}
          maxWidth={"xl"}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
        >
          <DialogTitle className="button">
            <Typography style={{ alignSelf: "center" }}>
              {this.props.method}
              {this.props.itemName ? `: ${this.props.itemName}` : ""}
            </Typography>
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.name_edit && !this.props.acces?.name_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Название товара"
                  value={this.state.itemEdit ? this.state.itemEdit.item.name : ""}
                  disabled={!this.props.acces?.name_edit}
                  func={this.changeItem.bind(this, "name")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.cats_edit && !this.props.acces?.cats_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyAutocomplite
                  label="Категория"
                  multiple={false}
                  data={this.state.itemEdit ? this.state.itemEdit.cats : []}
                  value={
                    this.state.itemEdit
                      ? this.state.itemEdit.item.cat_id === "0"
                        ? ""
                        : this.state.itemEdit.item.cat_id
                      : ""
                  }
                  disabled={!this.props.acces?.cats_edit}
                  func={(event, value) => {
                    let this_storages = this.state.itemEdit;
                    this_storages.item.cat_id = value;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 1.5,
                }}
                style={
                  !this.props.acces?.ed_izmer_edit && !this.props.acces?.ed_izmer_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MySelect
                  data={this.state.itemEdit ? this.state.itemEdit.ed_izmer : []}
                  value={
                    this.state.itemEdit
                      ? this.state.itemEdit.item.ed_izmer_id === "0"
                        ? ""
                        : this.state.itemEdit.item.ed_izmer_id
                      : ""
                  }
                  func={this.changeItem.bind(this, "ed_izmer_id")}
                  disabled={!this.props.acces?.ed_izmer_edit}
                  label="Ед измер"
                  is_none={false}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.max_count_in_m_edit && !this.props.acces?.max_count_in_m_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Максимальное количество заказов в месяц (0 - без ограничений)"
                  value={this.state.itemEdit ? this.state.itemEdit.item.max_count_in_m : ""}
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  disabled={!this.props.acces?.max_count_in_m_edit}
                  func={this.changeItem.bind(this, "max_count_in_m")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.mark_name_edit && !this.props.acces?.mark_name_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Маркетинговое название"
                  value={this.state.itemEdit ? this.state.itemEdit.item.mark_name : ""}
                  disabled={!this.props.acces?.mark_name_edit}
                  func={this.changeItem.bind(this, "mark_name")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.name_for_vendor_edit && !this.props.acces?.name_for_vendor_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Название товара для поставщика"
                  value={this.state.itemEdit ? this.state.itemEdit.item.name_for_vendor : ""}
                  disabled={!this.props.acces?.name_for_vendor_edit}
                  func={this.changeItem.bind(this, "name_for_vendor")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.pq_edit && !this.props.acces?.pq_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Количество в упаковке"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={this.state.itemEdit ? this.state.itemEdit.item.pq : ""}
                  disabled={!this.props.acces?.pq_edit}
                  func={this.changeItem.bind(this, "pq")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 1.5,
                }}
                style={
                  !this.props.acces?.percent_edit && !this.props.acces?.percent_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="% заявки"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={this.state.itemEdit ? this.state.itemEdit.item.percent : ""}
                  disabled={!this.props.acces?.percent_edit}
                  func={this.changeItem.bind(this, "percent")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.vend_percent_edit && !this.props.acces?.vend_percent_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Разрешенный % повышения ценника"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={this.state.itemEdit ? this.state.itemEdit.item.vend_percent : ""}
                  disabled={!this.props.acces?.vend_percent_edit}
                  func={this.changeItem.bind(this, "vend_percent")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.art_edit && !this.props.acces?.art_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Код для 1с"
                  value={this.state.itemEdit ? this.state.itemEdit.item.art : ""}
                  disabled={!this.props.acces?.art_edit}
                  func={this.changeItem.bind(this, "art")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3.5,
                }}
                style={
                  !this.props.acces?.min_count_edit && !this.props.acces?.min_count_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Минимальный остаток"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={this.state.itemEdit ? this.state.itemEdit.item.min_count : ""}
                  disabled={!this.props.acces?.min_count_edit}
                  func={this.changeItem.bind(this, "min_count")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                style={
                  !this.props.acces?.allergens_edit && !this.props.acces?.allergens_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyAutocomplite
                  label="Аллергены"
                  multiple={true}
                  data={this.state.itemEdit ? this.state.itemEdit.allergens : []}
                  value={this.state.itemEdit ? this.state.itemEdit.item.my_allergens : ""}
                  disabled={!this.props.acces?.allergens_edit}
                  func={(event, value) => {
                    let this_storages = this.state.itemEdit;
                    this_storages.item.my_allergens = value;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                style={
                  !this.props.acces?.my_allergens_other_edit &&
                  !this.props.acces?.my_allergens_other_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyAutocomplite
                  label="Возможные аллергены"
                  multiple={true}
                  data={this.state.itemEdit ? this.state.itemEdit.allergens : []}
                  value={this.state.itemEdit ? this.state.itemEdit.item.my_allergens_other : ""}
                  disabled={!this.props.acces?.my_allergens_other_edit}
                  func={(event, value) => {
                    let this_storages = this.state.itemEdit;
                    this_storages.item.my_allergens_other = value;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
                style={
                  !this.props.acces?.is_show_edit && !this.props.acces?.is_show_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyCheckBox
                  label="Активность"
                  disabled={!this.props.acces?.is_show_edit}
                  value={parseInt(this.state.itemEdit?.item?.is_show) == 1 ? true : false}
                  func={(e) => {
                    let this_storages = this.state.itemEdit;
                    this_storages.item.is_show = e.target.checked === true ? 1 : 0;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
                style={
                  !this.props.acces?.show_in_order_edit && !this.props.acces?.show_in_order_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyCheckBox
                  label="Заявка"
                  disabled={!this.props.acces?.show_in_order_edit}
                  value={parseInt(this.state.itemEdit?.item?.show_in_order) == 1 ? true : false}
                  func={(e) => {
                    let this_storages = this.state.itemEdit;
                    this_storages.item.show_in_order = e.target.checked === true ? 1 : 0;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
                style={
                  !this.props.acces?.show_in_rev_edit && !this.props.acces?.show_in_rev_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyCheckBox
                  label="Ревизия"
                  disabled={!this.props.acces?.show_in_rev_edit}
                  value={parseInt(this.state.itemEdit?.item?.show_in_rev) == 1 ? true : false}
                  func={(e) => {
                    let this_storages = this.state.itemEdit;
                    this_storages.item.show_in_rev = e.target.checked === true ? 1 : 0;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
                style={
                  !this.props.acces?.honest_sign_edit && !this.props.acces?.honest_sign_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyAutocomplite
                  label="Системы учета"
                  multiple={true}
                  data={this.state.itemEdit ? this.state.itemEdit.acc_sys : []}
                  value={this.state.itemEdit ? this.state.itemEdit?.item?.acc_sys : ""}
                  disabled={!this.props.acces?.honest_sign_edit}
                  func={(event, value) => {
                    let this_storages = { ...this.state.itemEdit };
                    this_storages.item.acc_sys = value;
                    this.setState({ itemEdit: this_storages });
                  }}
                />
              </Grid>
              <Grid
                container
                spacing={2}
                sx={{ marginTop: 2 }}
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                  style={
                    !this.props.acces?.this_storages_edit && !this.props.acces?.this_storages_view
                      ? { display: "none" }
                      : {}
                  }
                >
                  <Box>
                    <Typography variant="h6">Места хранения</Typography>
                    <Divider sx={{ my: 1 }} />
                    <MyAutocomplite
                      label="Места хранения"
                      multiple={true}
                      data={this.state.itemEdit ? this.state.itemEdit.storages : []}
                      value={this.state.itemEdit ? this.state.itemEdit.this_storages : ""}
                      disabled={!this.props.acces?.this_storages_edit}
                      func={(event, value) => {
                        let this_storages = { ...this.state.itemEdit };
                        this_storages.this_storages = value;
                        this.setState({ itemEdit: this_storages });
                      }}
                    />
                  </Box>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Box>
                    <Typography variant="h6">Разгрузка</Typography>
                    <Divider sx={{ my: 1 }} />

                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                        style={
                          !this.props.acces?.apps_edit && !this.props.acces?.apps_view
                            ? { display: "none" }
                            : {}
                        }
                      >
                        <MySelect
                          label="Должность в кафе"
                          data={this.state.itemEdit ? this.state.itemEdit.apps : []}
                          value={this.state.itemEdit ? this.state.itemEdit.item.app_id : ""}
                          disabled={!this.props.acces?.apps_edit}
                          func={this.changeItem.bind(this, "app_id")}
                          is_none={false}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                        style={
                          !this.props.acces?.time_min_other_edit &&
                          !this.props.acces?.time_min_other_view
                            ? { display: "none" }
                            : {}
                        }
                      >
                        <MyTextInput
                          label="Время ММ:SS за 1кг / 1шт / 1л (15:20)"
                          isTimeMask
                          value={this.state.itemEdit ? this.state.itemEdit.item.time_min_other : ""}
                          disabled={!this.props.acces?.time_min_other_edit}
                          func={this.changeItem.bind(this, "time_min_other")}
                          placeholder="00:00"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent:
                  this.props.acces?.delete_item_access &&
                  this.props.method === "Редактирование товара"
                    ? "space-between"
                    : "flex-end",
              }}
            >
              {this.props.acces?.delete_item_access &&
              this.props.method === "Редактирование товара" ? (
                <Button
                  color="primary"
                  onClick={() => this.setState({ openDelete: true })}
                  variant="contained"
                >
                  Удалить
                </Button>
              ) : null}
              <Button
                color="success"
                disabled={!this.state.rules_save}
                onClick={this.save.bind(this)}
                variant="contained"
              >
                Сохранить
              </Button>
            </div>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class SkladItemsModule_input_search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: this.props.data,
    };

    this.timeoutId = null;
  }

  changeItem(event) {
    const value = event.target.value;

    this.setState({
      item: value,
    });

    // Очищаем предыдущий таймер
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Устанавливаем новый таймер
    this.timeoutId = setTimeout(() => {
      this.props.search(value);
    }, 550);
  }

  componentWillUnmount() {
    // Очищаем таймер при размонтировании компонента
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  render() {
    const { label } = this.props;

    return (
      <Grid
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <MyTextInput
          label={label}
          value={this.state.item}
          func={this.changeItem.bind(this)}
        />
      </Grid>
    );
  }
}

class SkladItemsModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "sklad_items_module_new",
      module_name: "",
      is_load: false,

      cats: [],
      allItems: [],

      modalDialog: false,
      modalDialogHistory: false,

      method: null,
      itemEdit: null,
      itemName: "",
      item: [],
      acces: {},

      checkArtDialog: false,
      checkArtList: [],

      freeItems: [],
      unusedItems: [],

      searchItem: "",

      fullScreen: false,

      operAlert: false,
      err_status: false,
      err_text: "",

      allergens: [],

      modalDialogView: false,
      itemView: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      freeItems: data.items_free,
      unusedItems: data.unused_items,
      acces: data.acces,
    });

    document.title = data.module_info.name;
  }

  async update() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      freeItems: data.items_free,
      unusedItems: data.unused_items,
      acces: data.acces,
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

  async showEditItem(id, method) {
    this.handleResize();

    const data = {
      item_id: id,
    };

    const res = await this.getData("get_one", data);

    res.item.cat_id = res.cats.find((item) => item.id === res.item.cat_id);
    if (this.state.itemEdit && this.state.itemEdit.this_storages) {
      res.this_storages = this.state.itemEdit.this_storages;
    }

    this.setState({
      modalDialog: true,
      method,
      itemEdit: res,
      itemName: res.item.name,
      allergens: res.allergens,
    });
  }

  async openHistoryItem(id, method) {
    this.handleResize();

    const data = {
      item_id: id,
    };

    let res = await this.getData("get_one_hist", data);

    if (res.hist.length) {
      if (res.hist.length > 1) {
        res.hist.map((hist, index) => {
          hist.date_end = res?.hist[index + 1]?.date_start ?? "";
          return hist;
        });
      }

      this.setState({
        modalDialogHistory: true,
        item: res.hist,
        itemName: res.hist[0].name,
        method,
      });
    } else {
      res = await this.getData("get_one", data);

      res.item.date_start = res.item.date_update;
      res.item.this_storages = res.this_storages;
      res.item.pf_list = res.pf_list;
      res.item.cats = res.cats;
      res.item.apps = res.apps;
      res.item.ed_izmer = res.ed_izmer;

      res.item.my_allergens = res.item.my_allergens
        .map((allergen) => {
          allergen = allergen.name;
          return allergen;
        })
        .join(", ");

      res.item.my_allergens_other = res.item.my_allergens_other
        .map((allergen) => {
          allergen = allergen.name;
          return allergen;
        })
        .join(", ");

      res.item.this_storages = res.item.this_storages
        .map((storage) => {
          storage = storage.name;
          return storage;
        })
        .join(", ");

      this.setState({
        modalDialogHistory: true,
        item: [res.item],
        itemName: res.item.name,
        method,
      });
    }
  }

  async saveEditItem(itemEdit, main_item_id = 0) {
    let pf_id = itemEdit.item.pf_id;
    let cat_id = itemEdit.item.cat_id.id;

    const data = {
      pf_id,
      cat_id,
      id: itemEdit.item.id,
      item: itemEdit.item,
      storages: itemEdit.this_storages,
      my_allergens: itemEdit.item.my_allergens,
      my_allergens_other: itemEdit.item.my_allergens_other,
      main_item_id: parseInt(main_item_id) == 0 ? itemEdit.item.id : parseInt(main_item_id),
    };

    let res = await this.getData("save_edit", data);

    if (res.st) {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      res = await this.getData("get_all");

      this.setState({
        cats: res.cats,
        freeItems: res.items_free,
        unusedItems: res.unused_items,
      });
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveNewItem(itemEdit, main_item_id = 0) {
    const cat_id = itemEdit.item.cat_id.id;

    const data = {
      cat_id,
      id: itemEdit.item.id,
      item: itemEdit.item,
      storages: itemEdit.this_storages,
      my_allergens: itemEdit.item.my_allergens,
      my_allergens_other: itemEdit.item.my_allergens_other,
      main_item_id: parseInt(main_item_id) == 0 ? itemEdit.item.id : parseInt(main_item_id),
    };

    let res = await this.getData("save_new", data);

    if (res.st) {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      res = await this.getData("get_all");

      this.setState({
        cats: res.cats,
        freeItems: res.items_free,
        unusedItems: res.unused_items,
      });
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
        itemEdit: itemEdit,
      });
    }
  }

  async checkArt(itemEdit) {
    const data = {
      id: itemEdit.item.id,
      art: itemEdit.item.art,
    };
    if (this.state.acces?.art_edit) {
      const res = await this.getData("check_art", data);

      if (res.st === false) {
        this.setState({
          checkArtDialog: true,
          checkArtList: res.arts,
          itemEdit: itemEdit,
        });
      } else {
        this.saveEditItem(itemEdit);
      }
    } else {
      this.saveEditItem(itemEdit);
    }
  }

  async checkArtNew(itemEdit) {
    let data = {
      id: itemEdit.item.id,
      art: itemEdit.item.art,
    };

    if (this.state.acces?.art_edit) {
      let res = await this.getData("check_art", data);

      if (res.st === false) {
        res.arts.push({ id: -1, name: this.state.itemEdit.item.name });

        this.setState({
          checkArtDialog: true,
          checkArtList: res.arts,
          itemEdit: itemEdit,
        });
      } else {
        this.saveNewItem(itemEdit);
      }
    } else {
      this.saveNewItem(itemEdit);
    }
  }

  chooseArt(item_id) {
    if (this.state.method === "Редактирование товара") {
      this.saveEditItem(this.state.itemEdit, item_id);
    } else {
      this.saveNewItem(this.state.itemEdit, item_id);
    }
  }

  async openModalItemNew(method) {
    this.handleResize();

    const res = await this.getData("get_all_for_new");

    this.setState({
      modalDialog: true,
      itemEdit: res,
      itemName: "",
      method,
    });
  }

  async saveCheckItem(item_id, type, event) {
    const data = {
      item_id,
      type,
      value: event.target.checked === true ? 1 : 0,
    };

    let res = await this.getData("save_check", data);

    if (res.st) {
      this.setState({
        operAlert: true,
        err_status: true,
        err_text: res.text,
      });

      res = await this.getData("get_all");

      this.setState({
        cats: res.cats,
        freeItems: res.items_free,
        unusedItems: res.unused_items,
      });
    } else {
      this.setState({
        operAlert: true,
        err_status: false,
        err_text: res.text,
      });
    }
  }

  async search(value) {
    const data = {
      item: value ? value : this.state.searchItem,
    };

    const res = await this.getData("get_search", data);

    this.setState({
      cats: res.cats,
      freeItems: res.items_free,
      unusedItems: res.unused_items,
    });
  }

  openModalHistoryView(index) {
    const item = this.state.item;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.show_in_rev = parseInt(itemView.show_in_rev) ? "Да" : "Нет";
    itemView.is_show = parseInt(itemView.is_show) ? "Да" : "Нет";
    itemView.show_in_order = parseInt(itemView.show_in_order) ? "Да" : "Нет";
    itemView.honest_sign = parseInt(itemView.honest_sign) ? "Да" : "Нет";
    itemView.mercury = parseInt(itemView.mercury) ? "Да" : "Нет";

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      itemView_old.show_in_rev = parseInt(itemView_old.show_in_rev) ? "Да" : "Нет";
      itemView_old.is_show = parseInt(itemView_old.is_show) ? "Да" : "Нет";
      itemView_old.show_in_order = parseInt(itemView_old.show_in_order) ? "Да" : "Нет";
      itemView_old.honest_sign = parseInt(itemView_old.honest_sign) ? "Да" : "Нет";
      itemView_old.mercury = parseInt(itemView_old.mercury) ? "Да" : "Нет";

      for (let key in itemView) {
        if (itemView[key] !== itemView_old[key]) {
          if (key === "pf_id") {
            const name = (itemView.pf_id = itemView.pf_list.find(
              (item) => item.id === itemView.pf_id,
            )?.name);
            itemView[key] = { key: name, color: "true" };
          } else if (key === "cat_id") {
            const name = (itemView.cat_id = itemView.cats.find(
              (item) => item.id === itemView.cat_id,
            )?.name);
            itemView[key] = { key: name, color: "true" };
          } else if (key === "app_id") {
            const name = itemView.apps.find((item) => item.id === itemView.app_id)?.name;
            itemView[key] = { key: name, color: "true" };
          } else if (key === "ed_izmer_id") {
            const name = (itemView.ed_izmer_id = itemView.ed_izmer.find(
              (item) => item.id === itemView.ed_izmer_id,
            )?.name);
            itemView[key] = { key: name, color: "true" };
          } else {
            itemView[key] = { key: itemView[key], color: "true" };
          }
        } else {
          if (key === "cat_id") {
            itemView.cat_id = itemView.cats.find((item) => item.id === itemView.cat_id)?.name ?? "";
          } else if (key === "app_id") {
            itemView.app_id = itemView.apps.find((item) => item.id === itemView.app_id)?.name ?? "";
          } else if (key === "ed_izmer_id") {
            itemView.ed_izmer_id =
              itemView.ed_izmer.find((item) => item.id === itemView.ed_izmer_id)?.name ?? "";
          }
        }
      }
    } else {
      itemView.cat_id = itemView.cats.find((item) => item.id === itemView.cat_id)?.name ?? "";
      itemView.app_id = itemView.apps.find((item) => item.id === itemView.app_id)?.name ?? "";
      itemView.ed_izmer_id =
        itemView.ed_izmer.find((item) => item.id === itemView.ed_izmer_id)?.name ?? "";
    }

    this.setState({
      modalDialogView: true,
      itemView,
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
        <Dialog
          onClose={() => this.setState({ checkArtDialog: false, checkArtList: [] })}
          open={this.state.checkArtDialog}
        >
          <DialogTitle className="button">
            <Typography>Такой код 1с уже задан у следующих позиций:</Typography>
            <IconButton onClick={() => this.setState({ checkArtDialog: false, checkArtList: [] })}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <List sx={{ pt: 0 }}>
              {this.state.checkArtList.map((item, key) => (
                <ListItemButton
                  onClick={this.chooseArt.bind(this, item.id)}
                  key={key}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              ))}
            </List>
          </DialogContent>
        </Dialog>
        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <SkladItemsModule_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemEdit: null })}
          checkArtNew={this.checkArtNew.bind(this)}
          checkArt={this.checkArt.bind(this)}
          getData={this.getData.bind(this)}
          update={this.update.bind(this)}
          method={this.state.method}
          event={this.state.itemEdit}
          acces={this.state.acces}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />
        <SkladItemsModule_Modal_History
          open={this.state.modalDialogHistory}
          onClose={() => this.setState({ modalDialogHistory: false })}
          item={this.state.item}
          method={this.state.method}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
          openModalHistoryView={this.openModalHistoryView.bind(this)}
        />
        <SkladItemsModule_Modal_History_View
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null })}
          itemView={this.state.itemView}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />
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
          {this.state.acces?.create_new_access ? (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <Button
                onClick={this.openModalItemNew.bind(this, "Новый товар")}
                variant="contained"
              >
                Добавить товар
              </Button>
            </Grid>
          ) : null}

          <SkladItemsModule_input_search
            data={this.state.searchItem}
            search={this.search.bind(this)}
            label="Поиск"
          />

          <Grid
            style={{ paddingBottom: "50px" }}
            size={{
              xs: 12,
            }}
          >
            {this.state.cats?.length > 0 && (
              <>
                {this.state.cats.map((item, key) => (
                  <Accordion key={key}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{item.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {item.cats?.length > 0 && (
                        <>
                          {item.cats.map((category, key_cat) => (
                            <Accordion key={key_cat}>
                              <AccordionSummary
                                style={{ backgroundColor: "#ffff" }}
                                expandIcon={<ExpandMoreIcon />}
                              >
                                <Typography>{category.name}</Typography>
                              </AccordionSummary>
                              <AccordionDetails className="accordion_details">
                                <TableContainer
                                  component={Paper}
                                  sx={{ maxHeight: { xs: "none", sm: 500 } }}
                                >
                                  <Table
                                    stickyHeader
                                    aria-label="sticky table"
                                  >
                                    <TableHead>
                                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                                        <TableCell style={{ width: "5%" }}>№</TableCell>
                                        {this.state.acces?.active_edit ||
                                        this.state.acces?.active_view ? (
                                          <TableCell style={{ width: "10%" }}>Активность</TableCell>
                                        ) : null}
                                        {this.state.acces?.ord_edit ||
                                        this.state.acces?.ord_view ? (
                                          <TableCell style={{ width: "10%" }}>Заявка</TableCell>
                                        ) : null}
                                        {this.state.acces?.rev_edit ||
                                        this.state.acces?.rev_view ? (
                                          <TableCell style={{ width: "10%" }}>Ревизия</TableCell>
                                        ) : null}
                                        <TableCell style={{ width: "20%" }}>Товар</TableCell>
                                        <TableCell style={{ width: "15%" }}>Код для 1С</TableCell>
                                        <TableCell style={{ width: "15%" }}>
                                          Редактирование
                                        </TableCell>
                                        <TableCell style={{ width: "15%" }}>
                                          История изменений
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>

                                    <TableBody>
                                      {category.items.map((it, k) => (
                                        <TableRow key={k}>
                                          <TableCell>{k + 1}</TableCell>
                                          {this.state.acces?.active_edit ||
                                          this.state.acces?.active_view ? (
                                            <TableCell>
                                              <MyCheckBox
                                                label=""
                                                disabled={!this.state.acces?.active_edit}
                                                value={parseInt(it.is_show) == 1 ? true : false}
                                                func={this.saveCheckItem.bind(
                                                  this,
                                                  it.id,
                                                  "is_show",
                                                )}
                                              />
                                            </TableCell>
                                          ) : null}
                                          {this.state.acces?.ord_edit ||
                                          this.state.acces?.ord_view ? (
                                            <TableCell>
                                              <MyCheckBox
                                                label=""
                                                disabled={!this.state.acces?.ord_edit}
                                                value={
                                                  parseInt(it.show_in_order) == 1 ? true : false
                                                }
                                                func={this.saveCheckItem.bind(
                                                  this,
                                                  it.id,
                                                  "show_in_order",
                                                )}
                                              />
                                            </TableCell>
                                          ) : null}
                                          {this.state.acces?.rev_edit ||
                                          this.state.acces?.rev_view ? (
                                            <TableCell>
                                              <MyCheckBox
                                                label=""
                                                disabled={!this.state.acces?.rev_edit}
                                                value={parseInt(it.show_in_rev) == 1 ? true : false}
                                                func={this.saveCheckItem.bind(
                                                  this,
                                                  it.id,
                                                  "show_in_rev",
                                                )}
                                              />
                                            </TableCell>
                                          ) : null}
                                          <TableCell>{it.name}</TableCell>
                                          <TableCell>{it.art}</TableCell>
                                          <TableCell
                                            style={{ cursor: "pointer" }}
                                            onClick={this.showEditItem.bind(
                                              this,
                                              it.id,
                                              "Редактирование товара",
                                            )}
                                          >
                                            <EditIcon />
                                          </TableCell>
                                          <TableCell
                                            style={{ cursor: "pointer" }}
                                            onClick={this.openHistoryItem.bind(
                                              this,
                                              it.id,
                                              "История изменений",
                                            )}
                                          >
                                            <EditNoteIcon />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
            {this.state.freeItems.length == 0 ? null : (
              <Accordion>
                <AccordionSummary
                  style={{ backgroundColor: "#ffff" }}
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>Без категории</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion_details">
                  <TableContainer component={Paper}>
                    <Table
                      stickyHeader
                      aria-label="sticky table"
                    >
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "5%" }}>№</TableCell>
                          {this.state.acces?.active_access ? (
                            <TableCell style={{ width: "10%" }}>Активность</TableCell>
                          ) : null}
                          {this.state.acces?.ord_access ? (
                            <TableCell style={{ width: "10%" }}>Заявка</TableCell>
                          ) : null}
                          {this.state.acces?.rev_access ? (
                            <TableCell style={{ width: "10%" }}>Ревизия</TableCell>
                          ) : null}
                          <TableCell style={{ width: "20%" }}>Товар</TableCell>
                          <TableCell style={{ width: "15%" }}>Код для 1С</TableCell>
                          <TableCell style={{ width: "15%" }}>Редактирование</TableCell>
                          <TableCell style={{ width: "15%" }}>История изменений</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.freeItems.map((it, key) => (
                          <TableRow key={key}>
                            <TableCell>{key + 1}</TableCell>
                            {this.state.acces?.active_access ? (
                              <TableCell>
                                <MyCheckBox
                                  label=""
                                  value={parseInt(it.is_show) == 1 ? true : false}
                                  func={this.saveCheckItem.bind(this, it.id, "is_show")}
                                />
                              </TableCell>
                            ) : null}
                            {this.state.acces?.ord_access ? (
                              <TableCell>
                                <MyCheckBox
                                  label=""
                                  value={parseInt(it.show_in_order) == 1 ? true : false}
                                  func={this.saveCheckItem.bind(this, it.id, "show_in_order")}
                                />
                              </TableCell>
                            ) : null}
                            {this.state.acces?.rev_access ? (
                              <TableCell>
                                <MyCheckBox
                                  label=""
                                  value={parseInt(it.show_in_rev) == 1 ? true : false}
                                  func={this.saveCheckItem.bind(this, it.id, "show_in_rev")}
                                />
                              </TableCell>
                            ) : null}
                            <TableCell>{it.name}</TableCell>
                            <TableCell>{it.art}</TableCell>
                            <TableCell
                              style={{ cursor: "pointer" }}
                              onClick={this.showEditItem.bind(this, it.id, "Редактирование товара")}
                            >
                              <EditIcon />
                            </TableCell>
                            <TableCell
                              style={{ cursor: "pointer" }}
                              onClick={this.openHistoryItem.bind(this, it.id, "История изменений")}
                            >
                              <EditNoteIcon />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
            {this.state.unusedItems.length == 0 ? null : (
              <Accordion>
                <AccordionSummary
                  style={{ backgroundColor: "#ffff" }}
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>Неиспользуемое</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion_details">
                  <TableContainer component={Paper}>
                    <Table
                      stickyHeader
                      aria-label="sticky table"
                    >
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "5%" }}>№</TableCell>
                          <TableCell style={{ width: "10%" }}>Активность</TableCell>
                          <TableCell style={{ width: "10%" }}>Заявка</TableCell>
                          <TableCell style={{ width: "10%" }}>Ревизия</TableCell>
                          <TableCell style={{ width: "20%" }}>Товар</TableCell>
                          <TableCell style={{ width: "15%" }}>Код для 1С</TableCell>
                          <TableCell style={{ width: "15%" }}>Редактирование</TableCell>
                          <TableCell style={{ width: "15%" }}>История изменений</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.unusedItems.map((it, key) => (
                          <TableRow key={key}>
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={parseInt(it.is_show) == 1 ? true : false}
                                func={this.saveCheckItem.bind(this, it.id, "is_show")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={parseInt(it.show_in_order) == 1 ? true : false}
                                func={this.saveCheckItem.bind(this, it.id, "show_in_order")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={parseInt(it.show_in_rev) == 1 ? true : false}
                                func={this.saveCheckItem.bind(this, it.id, "show_in_rev")}
                              />
                            </TableCell>
                            <TableCell>{it.name}</TableCell>
                            <TableCell>{it.art}</TableCell>
                            <TableCell
                              style={{ cursor: "pointer" }}
                              onClick={this.showEditItem.bind(this, it.id, "Редактирование товара")}
                            >
                              <EditIcon />
                            </TableCell>
                            <TableCell
                              style={{ cursor: "pointer" }}
                              onClick={this.openHistoryItem.bind(this, it.id, "История изменений")}
                            >
                              <EditNoteIcon />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SkladItemsModule() {
  return <SkladItemsModule_ />;
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
