import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import MenuIcon from "@mui/icons-material/Menu";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import TextField from "@mui/material/TextField";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyAutocomplite } from "@/ui/Forms";
import Typography from "@mui/material/Typography";

import queryString from "query-string";
import { api_laravel, api_laravel_local } from "@/src/api_new";

class ModalCategoryItems extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newMainCatMy: "",
      editMainCatMy: "",
      newMainNameMy: "",
      editMainNameMy: "",
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.event) {
      return;
    }

    if (this.props.event !== prevProps.event) {
      this.setState({
        editMainCatMy: this.props.event.parent_id,
        editMainNameMy: this.props.event.name,
      });
    }
  }

  changeNameMain(event) {
    let data = event.target.value;

    this.setState({
      newMainNameMy: data,
    });
  }

  changeCatMain(event) {
    let data = event.target.value;

    this.setState({
      newMainCatMy: data,
    });
  }

  changeCatMainEdit(event) {
    let data = event.target.value;

    this.setState({
      editMainCatMy: data,
    });
  }

  changeNameMainEdit(event) {
    let data = event.target.value;

    this.setState({
      editMainNameMy: data,
    });
  }

  onClose() {
    this.setState({
      newMainCatMy: "",
      editMainCatMy: this.props.event ? this.props.event.parent_id : "",
      newMainNameMy: "",
      editMainNameMy: this.props.event ? this.props.event.name : "",
    });
    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{this.props.method}</DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MySelect
                label="Главная категория"
                data={this.props.data}
                value={
                  this.props.method === "Редактирование категории"
                    ? this.state.editMainCatMy
                    : this.state.newMainCatMy
                }
                func={
                  this.props.method === "Редактирование категории"
                    ? this.changeCatMainEdit.bind(this)
                    : this.changeCatMain.bind(this)
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TextField
                label="Название категории"
                size="small"
                variant="outlined"
                style={{ width: "100%" }}
                color="primary"
                value={
                  this.props.method === "Редактирование категории"
                    ? this.state.editMainNameMy
                    : this.state.newMainNameMy
                }
                onChange={
                  this.props.method === "Редактирование категории"
                    ? this.changeNameMainEdit.bind(this)
                    : this.changeNameMain.bind(this)
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={
              this.props.method === "Редактирование категории"
                ? this.props.saveEditCat.bind(
                    this,
                    this.state.editMainNameMy,
                    this.state.editMainCatMy,
                  )
                : this.props.saveCat.bind(this, this.state.newMainNameMy, this.state.newMainCatMy)
            }
            color="primary"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CategoryItems_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "category_items",
      module_name: "",
      is_load: false,

      modalDialog: false,
      modalDialog2: false,

      method: null,
      data: null,

      allCats: [],
      allItems: [],

      thisValItems: [],
      thisDataItems: [],
      thisCatId: 0,
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      allCats: data.cats,
      allItems: data.items,
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

  onOpen(method, data, event) {
    event.stopPropagation();

    this.setState({
      modalDialog: true,
      method,
      data,
    });
  }

  addItems(cat_id) {
    let myVal = this.state.allItems.filter((item) => parseInt(item.cat_id) == parseInt(cat_id));
    let data = this.state.allItems.filter((item) => parseInt(item.cat_id) == 0);

    this.setState({
      modalDialog2: true,
      thisValItems: myVal,
      thisDataItems: data,
      thisCatId: cat_id,
    });
  }

  async saveItems() {
    let data = {
      cat_id: this.state.thisCatId,
      items: this.state.thisValItems,
    };

    let res = await this.getData("save_items_cat", data);

    this.setState({
      allCats: res.cats,
      allItems: res.items,
      modalDialog2: false,

      thisValItems: [],
      thisDataItems: [],
      thisCatId: 0,
    });
  }

  async saveCat(newMainNameMy, newMainCatMy) {
    let data = {
      name: newMainNameMy,
      cat_id: newMainCatMy,
    };

    let res = await this.getData("save_cat", data);

    if (res.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      allCats: res.cats,
      modalDialog: false,
    });
  }

  async saveEditCat(editMainNameMy, editMainCatMy) {
    let data = {
      name: editMainNameMy,
      cat_id: editMainCatMy,
      id: this.state.data.id,
    };

    let res = await this.getData("edit_cat", data);

    if (res.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      allCats: res.cats,
      modalDialog: false,
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
        <ModalCategoryItems
          open={this.state.modalDialog}
          onClose={() => {
            this.setState({ modalDialog: false });
          }}
          data={this.state.allCats.filter(
            (item) => parseInt(item.parent_id) == -1 || !item.parent_id,
          )}
          saveCat={this.saveCat.bind(this)}
          saveEditCat={this.saveEditCat.bind(this)}
          method={this.state.method}
          event={this.state.data}
        />
        <Dialog
          open={this.state.modalDialog2}
          onClose={() => {
            this.setState({ modalDialog2: false });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>Позиции категории</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyAutocomplite
                  label="Выбранные позиции"
                  multiple={true}
                  func={(event, val) => {
                    this.setState({ thisValItems: val });
                  }}
                  data={this.state.thisDataItems}
                  value={this.state.thisValItems}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.saveItems.bind(this)}
              color="primary"
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
              sm: 12,
            }}
          >
            <Button
              onClick={() =>
                this.setState({
                  modalDialog: true,
                  method: "Новая категория",
                })
              }
            >
              Создать категорию
            </Button>
          </Grid>

          <Grid
            style={{ paddingBottom: "10px" }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            {this.state.allCats.map((main_cat, main_key) =>
              parseInt(main_cat.parent_id) != -1 ? null : (
                <Accordion key={main_key}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                  >
                    <MenuIcon
                      style={{ marginRight: 10 }}
                      onClick={this.onOpen.bind(this, "Редактирование категории", main_cat)}
                    />
                    <Typography>{main_cat.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {this.state.allCats.map((parent_cat, parent_key) =>
                      parseInt(main_cat.id) != parseInt(parent_cat.parent_id) ? null : (
                        <Accordion key={main_key + "_" + parent_key}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                          >
                            <MenuIcon
                              style={{ marginRight: 10 }}
                              onClick={this.onOpen.bind(
                                this,
                                "Редактирование категории",
                                parent_cat,
                              )}
                            />
                            <Typography>{parent_cat.name}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell>
                                    <Button
                                      onClick={this.addItems.bind(this, parseInt(parent_cat.id))}
                                    >
                                      Добавить
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                {this.state.allItems
                                  .filter(
                                    (item) => parseInt(item.cat_id) == parseInt(parent_cat.id),
                                  )
                                  .map((item, key) => (
                                    <TableRow key={main_key + "_" + parent_key + "_" + key}>
                                      <TableCell>{item.name}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </AccordionDetails>
                        </Accordion>
                      ),
                    )}
                  </AccordionDetails>
                </Accordion>
              ),
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function CategoryItems() {
  return <CategoryItems_ />;
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
