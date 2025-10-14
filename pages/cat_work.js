import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { MyTextInput, TextEditor } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import MyAlert from "@/ui/MyAlert";

class CatWork_Modal extends React.PureComponent {
  render() {
    const { open, title, name, text, onNameChange, onTextChange, onSave, onClose } = this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent style={{ paddingTop: 10 }}>
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
                value={name}
                func={(e) => onNameChange(e.target.value)}
                label="Название категории"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextEditor
                value={text}
                func={onTextChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onSave}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CatWork_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "cat_work",
      module_name: "",
      is_load: false,

      cats: [],
      modalDialog: false,
      modalDialogNew: false,

      nameCat: "",
      editText: "",

      nameCatNew: "",
      editTextNew: "",

      showCat: null,

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
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

  openCat(item) {
    this.setState({
      modalDialog: true,
      showCat: item,
      nameCat: item.name,
      editText: item.text,
    });
  }

  async save() {
    const data = {
      cat_id: this.state.showCat.id,
      name: this.state.nameCat,
      text: this.state.showCat.text,
    };

    let res = await this.getData("save_edit", data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.setState({
        modalDialog: false,
      });

      setTimeout(() => {
        this.setState({
          showCat: null,
          nameCat: "",
          editText: "",
        });
      }, 100);

      res = await this.getData("get_all");

      this.setState({
        cats: res.cats,
      });
    }
  }

  async saveNew() {
    const data = {
      name: this.state.nameCatNew,
      text: this.state.editTextNew,
    };

    let res = await this.getData("save_new", data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.setState({
        modalDialogNew: false,
      });

      setTimeout(() => {
        this.setState({
          nameCatNew: "",
          editTextNew: "",
        });
      }, 100);

      res = await this.getData("get_all");

      this.setState({
        cats: res.cats,
      });
    }
  }

  changeText(type, value) {
    if (type === "edit") {
      this.setState((prevState) => ({
        showCat: {
          ...prevState.showCat,
          text: value,
        },
      }));
    } else if (type === "new") {
      this.setState({
        editTextNew: value,
      });
    }
  }

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

  сhangeName(type, value) {
    if (type === "edit") {
      this.setState({ nameCat: value });
    } else if (type === "new") {
      this.setState({ nameCatNew: value });
    }
  }

  closeEdit() {
    this.setState({
      modalDialog: false,
    });

    setTimeout(() => {
      this.setState({
        showCat: null,
        nameCat: "",
        editText: "",
      });
    }, 100);
  }

  closeNew() {
    this.setState({
      modalDialogNew: false,
    });

    setTimeout(() => {
      this.setState({
        nameCatNew: "",
        editTextNew: "",
      });
    }, 100);
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
        <CatWork_Modal
          open={this.state.modalDialog}
          title={`Категория уборки "${this.state.showCat?.name}"`}
          name={this.state.nameCat}
          text={this.state.showCat?.text ?? ""}
          onNameChange={this.сhangeName.bind(this, "edit")}
          onTextChange={this.changeText.bind(this, "edit")}
          onSave={this.save.bind(this)}
          onClose={this.closeEdit.bind(this)}
        />
        <CatWork_Modal
          open={this.state.modalDialogNew}
          title="Новая категория уборки"
          name={this.state.nameCatNew}
          text={this.state.editTextNew}
          onNameChange={this.сhangeName.bind(this, "new")}
          onTextChange={this.changeText.bind(this, "new")}
          onSave={this.saveNew.bind(this)}
          onClose={this.closeNew.bind(this)}
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

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({ modalDialogNew: true });
              }}
            >
              Добавить категорию
            </Button>
          </Grid>

          <Grid
            mb={5}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <List style={{ width: "100%" }}>
              {this.state.cats.map((item, key) => (
                <ListItemButton
                  key={key}
                  onClick={this.openCat.bind(this, item)}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              ))}
            </List>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function CatWork() {
  return <CatWork_ />;
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
