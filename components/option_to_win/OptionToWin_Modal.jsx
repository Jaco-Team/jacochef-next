import { MyCheckBox, MyAutocomplite, MyTextInput } from "@/ui/Forms";
import { Close } from "@mui/icons-material";
import {
  DialogActions,
  Button,
  Grid,
  DialogContent,
  DialogTitle,
  Dialog,
  IconButton,
} from "@mui/material";
import { Component } from "react";

export default class OptionToWin_Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.err[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemAutocomplite(data, event, value) {
    const item = this.state.item;

    if (this.props.mark === "newItem") {
      item.err[data] = value;

      this.setState({
        item,
      });
    }

    if (this.props.mark === "editItem") {
      item[data] = value;

      this.setState({
        item,
      });
    }
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.err[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    if (this.props.mark === "newItem") {
      this.props.save(item.err);
    }

    if (this.props.mark === "editItem") {
      this.props.save(item);
    }

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth={true}
        maxWidth={"lg"}
      >
        <DialogTitle className="button">
          {this.props.method}
          {this.props.itemName ? `: ${this.props.itemName}` : null}
          {this.props.fullScreen ? (
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
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
                label="Наименование"
                value={this.state.item ? this.state.item.err.name : ""}
                func={this.changeItem.bind(this, "name")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyAutocomplite
                label="Варианты решения"
                multiple={true}
                data={
                  this.state.item
                    ? this.state.item.err_to_win
                      ? this.state.item.err_to_win
                      : this.state.item.all_wins
                    : []
                }
                value={
                  this.state.item
                    ? this.state.item.this_wins
                      ? this.state.item.this_wins
                      : this.state.item.err.id_win
                    : []
                }
                func={this.changeItemAutocomplite.bind(
                  this,
                  this.props.mark === "newItem" ? "id_win" : "this_wins",
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyAutocomplite
                label="Этапы ошибки роллы"
                multiple={true}
                data={
                  this.state.item
                    ? this.state.item.all_stages
                      ? this.state.item.all_stages
                      : this.state.item.stages
                    : []
                }
                value={
                  this.state.item
                    ? this.state.item.this_stages_1
                      ? this.state.item.this_stages_1
                      : this.state.item.err.stage_err_1
                    : []
                }
                func={this.changeItemAutocomplite.bind(
                  this,
                  this.props.mark === "newItem" ? "stage_err_1" : "this_stages_1",
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyAutocomplite
                label="Этапы ошибки пицца"
                multiple={true}
                data={
                  this.state.item
                    ? this.state.item.all_stages
                      ? this.state.item.all_stages
                      : this.state.item.stages
                    : []
                }
                value={
                  this.state.item
                    ? this.state.item.this_stages_2
                      ? this.state.item.this_stages_2
                      : this.state.item.err.stage_err_2
                    : []
                }
                func={this.changeItemAutocomplite.bind(
                  this,
                  this.props.mark === "newItem" ? "stage_err_2" : "this_stages_2",
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyAutocomplite
                label="Этапы ошибки напитки / допы"
                multiple={true}
                data={
                  this.state.item
                    ? this.state.item.all_stages
                      ? this.state.item.all_stages
                      : this.state.item.stages
                    : []
                }
                value={
                  this.state.item
                    ? this.state.item.this_stages_3
                      ? this.state.item.this_stages_3
                      : this.state.item.err.stage_err_3
                    : []
                }
                func={this.changeItemAutocomplite.bind(
                  this,
                  this.props.mark === "newItem" ? "stage_err_3" : "this_stages_3",
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyCheckBox
                label="Картинка"
                value={
                  this.state.item
                    ? parseInt(this.state.item.err.need_photo) == 1
                      ? true
                      : false
                    : false
                }
                func={this.changeItemChecked.bind(this, "need_photo")}
              />
            </Grid>

            {this.props.mark === "editItem" ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  label="Активность"
                  value={
                    this.state.item
                      ? parseInt(this.state.item.err.is_active) == 1
                        ? true
                        : false
                      : false
                  }
                  func={this.changeItemChecked.bind(this, "is_active")}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={this.save.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
