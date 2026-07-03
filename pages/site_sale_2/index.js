import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyTextInput } from "@/ui/Forms";

import { api_laravel, api_laravel_local } from "@/src/api_new";
import { PromoEdit } from "@/components/site_sale_2/PromoEdit";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  SiteSale2DeleteDialog,
  SiteSale2Nav,
  SiteSale2Page,
  SiteSale2PromoTable,
  SiteSale2SearchBar,
} from "@/components/site_sale_2/siteSale2Ui";

class SiteSale2_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: "site_sale_2",
      module_name: "",
      is_load: false,
      modalText: "",
      modalDialogEdit: false,

      modalDialog: false,
      modalLink: "",

      city_list: [],
      city_id: 0,
      promoName: "",
      promo_id: 0,

      findPromoList: [],

      deleteDialogOpen: false,
      deletePromoId: 0,
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      city_list: data.all_city_list,
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

  async showPromoList() {
    let data = {
      city_id: this.state.city_id,
      promo_name: this.state.promoName,
    };

    let res = await this.getData("search_promo", data);

    this.setState({
      findPromoList: res,
    });
  }

  openDeleteDialog(promo_id) {
    this.setState({
      deleteDialogOpen: true,
      deletePromoId: promo_id,
    });
  }

  closeDeleteDialog() {
    this.setState({
      deleteDialogOpen: false,
      deletePromoId: 0,
    });
  }

  async confirmDeletePromo() {
    const promo_id = this.state.deletePromoId;

    this.closeDeleteDialog();

    let data = {
      promo_id: promo_id,
    };

    await this.getData("remove_promo", data);

    setTimeout(() => {
      this.showPromoList();
    }, 300);
  }

  editPromo(promo_id) {
    this.setState(
      {
        promo_id: promo_id,
        modalDialogEdit: true,
      },
      () => {
        this.setState({ modalDialogEdit: true });
      },
    );
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
        {this.state.modalDialogEdit ? (
          <PromoEdit
            modalDialogEdit={this.state.modalDialogEdit}
            promo_id={this.state.promo_id}
            promoName={this.state.promoName}
            onClose={() => {
              this.setState({ modalDialogEdit: false });
            }}
          />
        ) : null}
        <SiteSale2DeleteDialog
          open={this.state.deleteDialogOpen}
          onClose={this.closeDeleteDialog.bind(this)}
          onConfirm={this.confirmDeletePromo.bind(this)}
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
            <IconButton
              onClick={() => {
                this.setState({ modalDialog: false, modalLink: "" });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Typography>{this.state.modalText}</Typography>
            <br />
            {this.state.modalLink == "" ? null : (
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
        <SiteSale2Page
          title={this.state.module_name}
          subtitle="Управление промокодами"
        >
          <SiteSale2Nav />

          <SiteSale2SearchBar onSearch={this.showPromoList.bind(this)}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MySelect
                data={this.state.city_list}
                value={this.state.city_id}
                func={(event) => {
                  this.setState({ city_id: event.target.value });
                }}
                label="Город"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                value={this.state.promoName}
                func={(event) => {
                  this.setState({ promoName: event.target.value });
                }}
                label="Промокод"
              />
            </Grid>
          </SiteSale2SearchBar>

          <SiteSale2PromoTable
            rows={this.state.findPromoList}
            onDelete={this.openDeleteDialog.bind(this)}
          />
        </SiteSale2Page>
      </>
    );
  }
}

export default function SiteSale2() {
  return <SiteSale2_ />;
}
