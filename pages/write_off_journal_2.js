import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { MySelect, MyDatePickerNew, MyTextInput, MyAutocomplite } from "@/ui/Forms";

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import { api_laravel, api_laravel_local } from "@/src/api_new";

import dayjs from "dayjs";
import moment from "moment";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { NumericTextField } from "@/ui/Forms/MyNumericFormat";
import { Box } from "@mui/material";
import WriteOffReasons from "@/ui/Forms/WriteOffReasons";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

class Write_off_journal_View extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
      itemHist: [],
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

  componentDidMount() {
    if (this.props.point) {
      this.openHistoryItem();
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  async openHistoryItem() {
    const point = this.props.points.find(
      (point) => parseInt(point.id) === parseInt(this.props.point.id),
    );

    const data = {
      id: this.props.itemView?.id,
      point,
    };

    const res = await this.props.getData("get_one_hist", data);

    res.hist = res.hist.map((item) => {
      item.items = item.items.map((it) => {
        if (it.type === "pos") {
          it.type_name = "Сайт";
        }

        if (it.type === "rec" || it.type === "pf") {
          it.type_name = "Заготовка";
        }

        if (it.type === "set" || it.type === "item") {
          it.type_name = "Товар";
        }

        return it;
      });

      return item;
    });

    this.setState({
      itemHist: res.hist,
    });
  }

  render() {
    const { open, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"xl"}
        onClose={this.onClose.bind(this)}
        fullScreen={true}
      >
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div></div>
          Списание
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer", float: "right" }}
          >
            <KeyboardArrowDownIcon style={{ color: "#3C3B3B", rotate: "90deg" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: 12, backgroundColor: "#F2F2F2" }}>
          <Grid
            container
            spacing={3}
          >
            {this.state.itemView?.items.map((it) => {
              return (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "12px",
                      padding: "8px 12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ color: "#666666", fontWeight: "500" }}>Тип</span>
                      <span style={{ color: "#666666", fontWeight: "400" }}>{it.type_name}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ color: "#666666", fontWeight: "500" }}>Наименование</span>
                      <span style={{ color: "#666666", fontWeight: "400" }}>{it.item_name}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ color: "#666666", fontWeight: "500" }}>Количество</span>
                      <span
                        style={{
                          color: "#666666",
                          fontWeight: "400",
                        }}
                      >
                        {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                      </span>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
          <Accordion
            sx={{
              color: "#666666",
              borderRadius: "12px !important",
              boxShadow: "none",
              "&::before": {
                display: "none",
              },
              "&.MuiAccordion-root::before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: "#A6A6A6" }} />}>
              <Typography style={{ fontWeight: "400" }}>История изменений</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ backgroundColor: "#F2F2F2", padding: "12px 0 0 0" }}>
              <Grid
                container
                spacing={3}
              >
                {this.state.itemHist?.map((it, key) => {
                  return (
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <div
                        style={{ display: "flex", flexDirection: "column", marginBottom: "12px" }}
                      >
                        <div
                          style={{
                            backgroundColor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "12px",
                            marginBottom: "12px",
                            border: "1px solid #E5E5E5",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              borderBottom: "1px solid #E5E5E5",
                            }}
                          >
                            <span style={{ color: "#666666", fontWeight: "500" }}>№ {key + 1}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                            }}
                          >
                            <span style={{ color: "#666666", fontWeight: "500" }}>
                              Дата создания
                            </span>
                            <span style={{ color: "#666666", fontWeight: "400" }}>
                              {it.date_create}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                            }}
                          >
                            <span style={{ color: "#666666", fontWeight: "500" }}>
                              Дата редактирования/удаления
                            </span>
                            <span
                              style={{
                                color: "#666666",
                                fontWeight: "400",
                              }}
                            >
                              {it.date_update === "0000-00-00" ? "" : it.date_update}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                            }}
                          >
                            <span style={{ color: "#666666", fontWeight: "500" }}>
                              Время редактирования/удаления
                            </span>
                            <span
                              style={{
                                color: "#666666",
                                fontWeight: "400",
                              }}
                            >
                              {parseInt(it.time_update) ? it.time_update : ""}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                            }}
                          >
                            <span style={{ color: "#666666", fontWeight: "500" }}>Редактор</span>
                            <span
                              style={{
                                color: "#666666",
                                fontWeight: "400",
                              }}
                            >
                              {it.user_update ?? it.user_create}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={this.props.openModalHistoryView.bind(
                            this,
                            key,
                            this.state.itemHist,
                          )}
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            height: "48px",
                            border: "1px solid #2F7D33",
                            color: "#2F7D33",
                          }}
                        >
                          Посмотреть
                        </Button>
                      </div>
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#F2F2F2" }}>
          {this.props.acces?.edit_write_off_access ? (
            <Button
              style={{
                backgroundColor: "#2F7D33",
                borderRadius: "12px",
                height: "48px",
                textTransform: "capitalize",
                color: "#2FFF",
                boxShadow: "none",
              }}
              variant="contained"
              onClick={() => this.props.openItem(this.state.itemView?.id, "Редактрование списания")}
            >
              Редактирование
            </Button>
          ) : null}
          <Button
            variant="contained"
            style={{
              backgroundColor: "#DD1A32",
              borderRadius: "12px",
              height: "48px",
              textTransform: "capitalize",
              color: "#2FFF",
              boxShadow: "none",
            }}
            onClick={this.onClose.bind(this)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Write_off_journal_View_Tags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reason: "",
      tags: [],
      tag: {},
    };
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            margin: 0,
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderRadius: "40px 40px 0 0",
            height: "auto",
            maxHeight: "90vh",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            paddingTop: 1,
            paddingBottom: 2,
            position: "relative",
            cursor: "pointer",
            "&:active": {
              "& .drag-indicator": {
                backgroundColor: "#888",
              },
            },
          }}
          onClick={this.onClose.bind(this)}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Box
            className="drag-indicator"
            sx={{
              width: 36,
              height: 5,
              backgroundColor: "#BABABA",
              borderRadius: 2,
              transition: "background-color 0.2s",
            }}
          />
        </Box>

        <Box
          sx={{
            overflow: "auto",
            height: "100%",
            maxHeight: "calc(90vh - 60px)",
          }}
        >
          <DialogTitle sx={{ textAlign: "center", padding: "0 12px" }}>
            Создание новой причины
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer", float: "right" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            style={{ padding: "16px 0 360px 0", backgroundColor: "#f5f5f5", width: "100%" }}
          >
            <Grid
              container
              spacing={3}
              sx={{ padding: "16px" }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <MyTextInput
                  value={this.state.reason}
                  func={(e) => this.setState({ reason: e.target.value })}
                  customRI="journal"
                  label="Причина списания"
                />
                {this.state.reason &&
                this.props.tags_journal.filter((it) => it.name.includes(this.state.reason))
                  ?.length !== 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#fff",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: "14px !important", color: "#DD1A32" }}>
                          Найдено несколько совпадений.
                        </Typography>
                        <Typography
                          sx={{ fontSize: "14px !important", color: "#666666", marginTop: "4px" }}
                        >
                          Вернуться к выбору по списку?
                        </Typography>
                      </div>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Button
                          style={{
                            backgroundColor: "#FFF",
                            borderRadius: "12px",
                            height: "40px",
                            textTransform: "capitalize",
                            color: "#2F7D33",
                            border: "1px solid #2F7D33",
                            marginRight: "12px",
                          }}
                          onClick={this.onClose.bind(this)}
                        >
                          Да
                        </Button>
                        <Button
                          style={{
                            backgroundColor: "#FFF",
                            borderRadius: "12px",
                            height: "40px",
                            textTransform: "capitalize",
                            color: "#F43331",
                            border: "1px solid #E5E5E5",
                          }}
                        >
                          Нет
                        </Button>
                      </div>
                    </div>
                    {this.props.tags_journal?.length ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: "12px",
                        }}
                      >
                        <Typography sx={{ fontSize: "14px !important", color: "#625B71" }}>
                          {this.props.tags_journal
                            .filter((it) => it.name.includes(this.state.reason))
                            .map((it) => it.name)
                            .join(", ")}
                        </Typography>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <MyAutocomplite
                  label="Тег"
                  multiple={false}
                  customRI="journal"
                  data={this.props.tags}
                  value={this.state.tag}
                  func={(event, value) => this.setState({ tag: value })}
                />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 6,
                }}
              >
                <Button
                  style={{
                    backgroundColor: "#2F7D33",
                    borderRadius: "12px",
                    height: "48px",
                    textTransform: "capitalize",
                    color: "#FFF",
                    width: "100%",
                  }}
                  onClick={() => this.props.createTags(this.state.reason, this.state.tag)}
                >
                  Создать причину
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 6,
                }}
              >
                <Button
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    height: "48px",
                    textTransform: "capitalize",
                    color: "#F43331",
                    width: "100%",
                  }}
                  onClick={this.onClose.bind(this)}
                >
                  Отменть
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Box>
      </Dialog>
    );
  }
}

class Write_off_journal_View_Disabled extends React.Component {
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
    const { open, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            margin: 0,
            position: "absolute",
            bottom: 0,
            borderRadius: "40px 40px 0 0",
            height: "auto",
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            paddingTop: 1,
            paddingBottom: 2,
            position: "relative",
            cursor: "pointer",
            "&:active": {
              "& .drag-indicator": {
                backgroundColor: "#888",
              },
            },
          }}
          onClick={this.onClose.bind(this)}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Box
            className="drag-indicator"
            sx={{
              width: 36,
              height: 5,
              backgroundColor: "#BABABA",
              borderRadius: 2,
              transition: "background-color 0.2s",
            }}
          />
        </Box>

        <Box
          sx={{
            overflow: "auto",
            maxHeight: "calc(90vh - 60px)",
          }}
        >
          <DialogTitle sx={{ textAlign: "center", padding: "0 12px" }}>
            История изменений
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer", float: "right" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            style={{ backgroundColor: "#f5f5f5", width: "100%", padding: "0 0 120px 0" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  justifyContent: "space-between",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  width: "95%",
                }}
              >
                <span style={{ color: "#666666" }}>Изменение №1</span>
                <span style={{ color: "#666666" }}>Дата создания 2025-12-01</span>
              </div>
              <Grid
                container
                spacing={3}
              >
                {this.props.itemView?.items?.map((it, key) => {
                  return (
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: "12px",
                          border: "1px solid #E5E5E5",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 8px",
                            borderRadius: "12px 12px 0 0",
                            borderBottom: "1px solid #E5E5E5",
                          }}
                        >
                          <span style={{ color: "#666" }}>#{key + 1}</span>
                          <span
                            style={{
                              color:
                                it.color === "add"
                                  ? it.color === "edit"
                                    ? "yellow"
                                    : "#2F7D33"
                                  : "#F43331",
                            }}
                          >
                            {it.color === "add"
                              ? it.color === "edit"
                                ? "Изменён"
                                : "Добавлен"
                              : "Удалён"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                          }}
                        >
                          <span style={{ color: "#666", fontWeight: "500" }}>Тип</span>
                          <span style={{ color: "#666", fontWeight: "400" }}>{it.type_name}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                          }}
                        >
                          <span style={{ color: "#666", fontWeight: "500" }}>Наименование</span>
                          <span style={{ color: "#666", fontWeight: "400" }}>{it.item_name}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                          }}
                        >
                          <span style={{ color: "#666", fontWeight: "500" }}>Количество</span>
                          <span style={{ color: "#666", fontWeight: "400" }}>
                            {it.value + " " + it.ei_name}
                          </span>
                        </div>
                      </div>
                    </Grid>
                  );
                })}
                <div
                  style={{
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    justifyContent: "space-between",
                    borderRadius: "12px",
                    marginTop: "12px",
                    width: "100%",
                  }}
                >
                  <span style={{ color: "#666666", fontWeight: "500" }}>Комментарий</span>
                  <span style={{ color: "#666666", fontWeight: "400", marginTop: "8px" }}>
                    {this.props.itemView?.coment}
                  </span>
                </div>
              </Grid>
            </div>
          </DialogContent>
        </Box>
      </Dialog>
    );
  }
}

class Write_off_journal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
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
        maxWidth={"xl"}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: "center" }}>{this.props.method}</Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ padding: 10 }}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              aria-label="sticky table"
            >
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                  <TableCell style={{ width: "5%" }}>#</TableCell>
                  <TableCell style={{ width: "20%" }}>Дата создания</TableCell>
                  <TableCell style={{ width: "25%" }}>Дата редактирования/удаления</TableCell>
                  <TableCell style={{ width: "25%" }}>Время редактирования/удаления</TableCell>
                  <TableCell style={{ width: "20%" }}>Редактор</TableCell>
                  <TableCell style={{ width: "5%" }}>Просмотр</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow
                    key={key}
                    hover
                  >
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.date_create}</TableCell>
                    <TableCell>{it.date_update === "0000-00-00" ? "" : it.date_update}</TableCell>
                    <TableCell>{parseInt(it.time_update) ? it.time_update : ""}</TableCell>
                    <TableCell>{it.user_update ?? it.user_create}</TableCell>
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

class Write_off_journal_modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      points: [],
      point: "",

      types: [],
      type: "",
      openTags: false,

      items: [],
      item: "",

      ed_izmer: "",

      count: "",
      writeOffItems: [],

      comment: "",

      openAlert: false,
      err_status: true,
      err_text: "",
      confirmDialogTag: false,
      reason: "",
      confirmDialog: false,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.itemEdit);

    if (!this.props.itemEdit) {
      return;
    }

    if (this.props.itemEdit !== prevProps.itemEdit) {
      const point =
        this.props.points.find((point) => parseInt(point.id) === parseInt(this.props.point.id)) ??
        "";

      this.setState({
        point,
        points: this.props.points,
        types: this.props.itemEdit.types,
        writeOffItems: this.props.itemEdit?.woj_items ?? [],
        comment: this.props.itemEdit?.woj?.coment ?? "",
      });
    }
  }

  changePoint(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeItem(data, event) {
    let value = event.target.value;

    if (value === "") {
      value = null;
    }

    if (value < 0 && data === "count") {
      this.setState({
        [data]: 0,
      });
    } else {
      this.setState({
        [data]: value,
      });
    }
  }

  changeType(data, event) {
    const items = this.props.itemEdit.items.filter((it) => {
      if (parseInt(event.target.value) === 1) {
        return it.type === "item" || it.type === "set";
      }
      if (parseInt(event.target.value) === 2) {
        return it.type === "rec" || it.type === "pf";
      }
      if (parseInt(event.target.value) === 3) {
        return it.type === "pos";
      }
    });

    this.setState({
      [data]: event.target.value,
      items,
      item: "",
    });
  }

  changeItemData(data, event, value) {
    this.setState({
      [data]: value,
      ed_izmer: value ? (value?.ei_name ?? "") : "",
    });
  }

  addItems() {
    let { type, types, item, count, writeOffItems } = this.state;

    if (!type || !item || !parseInt(count)) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо указать все данные для списания",
      });

      return;
    }

    const type_ = types.find((it) => parseInt(it.id) === parseInt(type));

    const data = {
      id: item.id,
      ei_name: item.ei_name,
      name: item.name,
      type: item.type,
      type_name: type_.name,
      type_s: "1",
      value: count,
    };

    writeOffItems.push(data);

    this.setState({
      writeOffItems,
      items: [],
      type: "",
      item: "",
      count: "",
      ed_izmer: "",
    });
  }

  deleteItem(index) {
    let writeOffItems = this.state.writeOffItems;

    writeOffItems.splice(index, 1);

    this.setState({
      writeOffItems,
    });
  }

  delete() {
    const point = this.state.point;

    this.props.deleteItem(this.props.itemEdit?.woj?.id, point);
    this.setState({ confirmDialog: false });
  }

  createTags = (reason, tag) => {
    this.props.getData("save_tag", { name: reason, tag_id: tag.id }).then((res) => {
      if (res.st) {
        this.setState({ openTags: false, reason, confirmDialogTag: true });
        this.props.update();
      } else {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: res.text,
        });
      }
    });
  };

  save() {
    const writeOffItems = this.state.writeOffItems;
    const cleanComment = this.state.comment.replace(/\s/g, "");
    if (!writeOffItems.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Позиции для списания отсутствуют!",
      });

      return;
    }

    if (!this.state.comment.trim()) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Комментарий обязателен для заполнения!",
      });

      return;
    }

    if (cleanComment.length < 3) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Комментарий должен содержать минимум 3 символа (без пробелов)",
      });

      return;
    }

    const id = this.props.itemEdit?.woj?.id ?? 0;

    const comment = this.state.comment;
    const point =
      this.props.method === "Новое списание"
        ? this.state.points.find((value) => value.id === this.state.point.id)
        : this.state.point;

    this.props.save(writeOffItems, comment, point, id);

    this.onClose();
  }

  onClose() {
    this.setState({
      point: "",
      points: [],
      type: "",
      types: [],
      item: "",
      items: [],
      count: "",
      ed_izmer: "",
      comment: "",
      writeOffItems: [],
      openAlert: false,
      err_status: true,
      err_text: "",
      confirmDialog: false,
    });

    this.props.onClose();
  }

  render() {
    const { open, method, fullScreen } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {this.state.openTags ? (
          <Write_off_journal_View_Tags
            open={this.state.openTags}
            onClose={() => this.setState({ openTags: false })}
            tags={this.props.itemEdit?.tags}
            tags_journal={this.props.itemEdit?.tags_journal}
            createTags={this.createTags}
          />
        ) : null}
        <Dialog
          sx={{
            "& .MuiDialog-paper": {
              width: "80%",
              maxHeight: 435,
            },
          }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          fullScreen={true}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Точно удалить данное списание ?
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button onClick={this.delete.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          sx={{
            "&& .MuiDialog-paper": {
              width: "382px !important",
              borderRadius: "12px !important",
              maxHeight: 210,
            },
          }}
          maxWidth="sm"
          open={this.state.confirmDialogTag}
          fullScreen={true}
          onClose={() => this.setState({ confirmDialogTag: false })}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#F2F2F2",
              borderBottom: "1px solid #E5E5E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ color: "#666666" }}>Добавлена новая причина списания</Typography>
            <IconButton
              onClick={() => this.setState({ confirmDialogTag: false })}
              style={{ cursor: "pointer", color: "#666666" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#666666", fontSize: "16px", marginBottom: "8px" }}>
              В список добавлена новая причина
            </Typography>
            <Typography
              sx={{
                color: "#666666",
                fontSize: "20px !important",
                marginBottom: "8px",
                marginTop: "8px",
              }}
            >
              {this.state.reason}
            </Typography>
          </DialogContent>
        </Dialog>
        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={"xl"}
          onClose={this.onClose.bind(this)}
          fullScreen={true}
        >
          <DialogTitle
            sx={{
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div></div>
            {method}
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer", float: "right" }}
            >
              <KeyboardArrowDownIcon style={{ color: "#3C3B3B", rotate: "90deg" }} />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ padding: 12, backgroundColor: "#F2F2F2" }}>
            <Grid
              container
              spacing={3}
              sx={{
                mb: 3,
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                {method === "Новое списание" ? (
                  <MySelect
                    is_none={false}
                    disabled={true}
                    data={this.state.points}
                    customRI="journal"
                    value={this.state.point?.id}
                    func={this.changePoint.bind(this, "point")}
                    label="Точка"
                  />
                ) : (
                  <MyTextInput
                    label="Точка"
                    value={this.state.point.name}
                    disabled={true}
                    className="disabled_input"
                  />
                )}
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 8,
                }}
              />
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MySelect
                  is_none={false}
                  data={this.state.types}
                  value={this.state.type}
                  customRI="journal"
                  func={this.changeType.bind(this, "type")}
                  label="Тип"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyAutocomplite
                  label="Наименование"
                  multiple={false}
                  data={this.state.items}
                  value={this.state.item}
                  customRI="journal"
                  func={this.changeItemData.bind(this, "item")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <NumericTextField
                  label="Количество"
                  value={this.state.count}
                  customRI="journal"
                  onChange={this.changeItem.bind(this, "count")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 2,
                }}
              >
                <MyTextInput
                  label="Ед измерения"
                  value={this.state.ed_izmer}
                  disabled={true}
                  customRI="journal"
                  className="disabled_input"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 9,
                }}
              />
              <Grid
                style={{ display: "flex", justifyContent: "flex-end" }}
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Button
                  onClick={this.addItems.bind(this)}
                  variant="contained"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    height: "48px",
                    textTransform: "capitalize",
                    color: "#2F7D33",
                    border: "1px solid #2F7D33",
                    boxShadow: "none",
                  }}
                >
                  Добавить
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 9,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <WriteOffReasons
                    value={this.state.comment}
                    onChange={(e) => this.setState({ comment: e })}
                    list={
                      this.props.itemEdit?.tags_journal?.length
                        ? this.props.itemEdit?.tags_journal
                        : []
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={() => this.setState({ openTags: true })}
                    sx={{
                      color: "#2F7D33",
                      borderRadius: "50%",
                      border: "1px solid #2F7D33",
                      ml: 0.5,
                      backgroundColor: "white",
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </div>
              </Grid>
            </Grid>
            {this.state.writeOffItems.map((it, key) => {
              return (
                <div
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #E5E5E5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 10px",
                      justifyContent: "space-between",
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    <span style={{ color: "#666", fontWeight: "500" }}>Тип</span>
                    <span style={{ color: "#666", fontWeight: "400" }}>
                      {it.type_name}
                      <IconButton
                        size="small"
                        onClick={this.deleteItem.bind(this, key)}
                        sx={{
                          cursor: "pointer",
                          padding: { xs: "4px", sm: "8px" },
                          "& svg": {
                            fontSize: { xs: "18px", sm: "24px" },
                          },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "#666", fontWeight: "500" }}>Наименование</span>
                    <span style={{ color: "#666", fontWeight: "400" }}>{it.name}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "#666", fontWeight: "500" }}>Количество</span>
                    <span style={{ color: "#666", fontWeight: "400" }}>
                      {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      flexDirection: "column",
                      padding: "12px 10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "#666", fontWeight: "500" }}>Причина списания</span>
                    <span style={{ color: "#666", fontWeight: "400" }}>{this.state.comment}</span>
                  </div>
                </div>
              );
            })}
          </DialogContent>
          <DialogActions style={{ paddingBottom: 10, paddingTop: 10, backgroundColor: "#F2F2F2" }}>
            {method !== "Новое списание" &&
            parseInt(this.props.acces?.delete_write_off_access) == 1 ? (
              <Button
                onClick={() => this.setState({ confirmDialog: true })}
                variant="contained"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  color: "#F43331",
                  height: "48px",
                  textTransform: "capitalize",
                }}
              >
                Отменить
              </Button>
            ) : null}
            <Button
              onClick={this.save.bind(this)}
              variant="contained"
              style={{
                backgroundColor: "#2F7D33",
                borderRadius: "12px",
                height: "48px",
                textTransform: "capitalize",
              }}
            >
              {method !== "Новое списание" ? "Сохранить" : "Создать списание"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class Write_off_journal_modal_view extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  onClose() {
    setTimeout(async () => {
      this.setState({
        item: [],
      });
    }, 100);

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
        <DialogTitle>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer", float: "right" }}
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
                  <TableCell style={{ width: "5%" }}>№</TableCell>
                  <TableCell style={{ width: "35%" }}>Позиция</TableCell>
                  <TableCell style={{ width: "30%" }}>Количество</TableCell>
                  <TableCell style={{ width: "30%" }}>Себестоимость</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key}>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.value + " " + it.ei_name}</TableCell>
                    <TableCell>
                      {" "}
                      {new Intl.NumberFormat("ru-RU").format(it?.price ?? 0)} ₽
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4}>
                    <span style={{ fontWeight: "bold" }}>Комментарий: </span>
                    <span>{this.state.item.comment}</span>
                  </TableCell>
                </TableRow>
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

class Write_off_journal_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "write_off_journal_2",
      module_name: "",
      is_load: false,

      points: [],
      point: "",

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      items: [],
      item: [],

      openAlert: false,
      err_status: true,
      err_text: "",

      list: [],
      all_items_pf: [],
      all_items_pos: [],
      all_users: [],

      all_sum_pf: 0,
      all_sum_pos: 0,

      fullScreen: false,
      acces: {},

      modalDialogView: false,
      itemView: null,

      modalDialog: false,
      itemEdit: null,

      method: "",

      modalDialogHist: false,
      itemHist: null,

      modalDialogViewHist: false,
      modalDialogViewHistDisabled: false,
      itemViewHist: null,
      itemViewHistDisabled: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    // для тестов
    //const points = [{base: "jaco_rolls_0", id: "0", id_2: "1_0", manager_id: "0", name: "Тольятти, Тестовая", name2: "Тольятти, Тестовая"}]
    const result = Object.keys(data.acces).reduce((acc, key) => {
      acc[key] = parseInt(data.acces[key], 10);
      return acc;
    }, {});

    this.setState({
      points: data.points,
      point: data.points[0],
      acces: result,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    // для тестов
    setTimeout(async () => {
      this.getPointData(data.points[0]);
    }, 100);

    // setTimeout(async () => {
    //	 this.getPointData(data.points[0]);
    // }, 100);
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

  async getPointData() {
    const point = this.state.points.find(
      (point) => parseInt(point.id) === parseInt(this.state.point.id),
    );
    const date_start = this.state.date_start
      ? dayjs(this.state.date_start).format("YYYY-MM-DD")
      : "";
    const date_end = this.state.date_end ? dayjs(this.state.date_end).format("YYYY-MM-DD") : "";
    const items = this.state.item;

    const data = {
      point,
      date_start,
      date_end,
      items,
    };

    const res = await this.getData("get_items", data);

    const all_sum_pf = res.all_items_pf.reduce((all, item) => all + Number(item?.price ?? 0), 0);
    const all_sum_pos = res.all_items_pos.reduce((all, item) => all + Number(item?.price ?? 0), 0);

    const list_dop = res.list.map((li) => {
      li.items = li.items.map((it) => {
        if (it.type === "pos") {
          it.type_name = "Сайт";
        }

        if (it.type === "rec" || it.type === "pf") {
          it.type_name = "Заготовка";
        }

        if (it.type === "set" || it.type === "item") {
          it.type_name = "Товар";
        }

        return it;
      });

      return li;
    });

    const all_users = res.list.reduce((users, item) => {
      if (parseInt(item.user_id) === parseInt(item.user_id)) {
        const user = users.find((user) => parseInt(user.id) === parseInt(item.user_id));

        if (user) {
          user.price += Number(item?.price ?? 0);
        } else {
          users.push({ id: item.user_id, name: item.user_name, price: Number(item?.price ?? 0) });
        }
      }

      return users;
    }, []);

    this.setState({
      searchItem: "",
      items: res?.items?.items ?? [],
      list: list_dop,
      all_items_pf: res.all_items_pf,
      all_items_pos: res.all_items_pos,
      all_sum_pf,
      all_sum_pos,
      all_users,
    });
  }

  changePoint(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeComplite(event, value) {
    this.setState({
      item: value,
    });
  }

  openViewItem(itemView, comment) {
    this.handleResize();

    itemView.comment = comment;

    this.setState({
      modalDialogView: true,
      itemView,
    });
  }

  async openNewItem(method) {
    this.handleResize();

    let res = await this.getData("get_all_for_new");

    res.types = [
      { id: "1", name: "Товар" },
      { id: "2", name: "Заготовка" },
      { id: "3", name: "Сайт" },
    ];

    this.setState({
      modalDialog: true,
      itemEdit: res,
      method,
    });
  }

  updateNew = async () => {
    let res = await this.getData("get_all_for_new");

    res.types = [
      { id: "1", name: "Товар" },
      { id: "2", name: "Заготовка" },
      { id: "3", name: "Сайт" },
    ];

    this.setState({
      itemEdit: res,
    });
  };

  async openItem(woj_id, method, list) {
    const open_item = list.find((item) => parseInt(item.id) === parseInt(woj_id));

    let change = null;

    if (open_item) {
      // Для редактирования и удаления давать 2 недели с даты создания
      if (parseInt(open_item?.status) === 2) {
        change = "del";
      } else if (!(moment(open_item?.date).diff(moment(), "days") > -15)) {
        change = "day";
      }
    }

    if (change === "del" || change === "day") {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text:
          change === "del"
            ? "Удален"
            : "Изменения недоступны - с даты создания прошло болеее 2-х недель",
      });

      return;
    }

    const point = this.state.points.find(
      (point) => parseInt(point.id) === parseInt(this.state.point.id),
    );

    const data = {
      point,
      woj_id,
    };

    let res = await this.getData("get_one", data);

    res.woj_items = res.woj_items.map((item) => {
      if (item.type === "pos") {
        item.type_name = "Сайт";
      }

      if (item.type === "rec" || item.type === "pf") {
        item.type_name = "Заготовка";
      }

      if (item.type === "set" || item.type === "item") {
        item.type_name = "Товар";
      }

      return item;
    });

    res.types = [
      { id: "1", name: "Товар" },
      { id: "2", name: "Заготовка" },
      { id: "3", name: "Сайт" },
    ];

    res.items = res.items.items;

    this.setState({
      modalDialog: true,
      itemEdit: res,
      method,
    });
  }

  async saveItem(items, comment, point, j_id) {
    const method = this.state.method;

    const data = {
      items,
      comment,
      point,
      j_id,
    };

    let res;

    if (method === "Новое списание") {
      res = await this.getData("save_new", data);
    } else {
      res = await this.getData("save_edit", data);
    }

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
      });

      setTimeout(async () => {
        this.getPointData();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async deleteItem(j_id, point) {
    const data = {
      j_id,
      point,
    };

    const res = await this.getData("delete_item", data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
      });

      setTimeout(async () => {
        this.getPointData();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async openHistoryItem(id, method) {
    this.handleResize();

    const point = this.state.points.find(
      (point) => parseInt(point.id) === parseInt(this.state.point.id),
    );

    const data = {
      id,
      point,
    };

    const res = await this.getData("get_one_hist", data);

    res.hist = res.hist.map((item) => {
      item.items = item.items.map((it) => {
        if (it.type === "pos") {
          it.type_name = "Сайт";
        }

        if (it.type === "rec" || it.type === "pf") {
          it.type_name = "Заготовка";
        }

        if (it.type === "set" || it.type === "item") {
          it.type_name = "Товар";
        }

        return it;
      });

      return item;
    });

    this.setState({
      modalDialogHist: true,
      itemHist: res.hist,
      method,
    });
  }

  openModalHistoryView(item) {
    this.setState({
      modalDialogViewHist: true,
      itemViewHist: item,
    });
  }

  openModalHistoryViewDisabled(index, itemHist) {
    let itemView = JSON.parse(JSON.stringify(itemHist[index]));

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(itemHist[index - 1]));

      for (let key in itemView) {
        if (itemView[key] !== itemView_old[key] && key !== "items" && key !== "status") {
          itemView[key] = { key: itemView[key], color: "true" };
        }

        if (key === "items") {
          itemView.items = itemView.items
            .reduce((newList, it) => {
              // Находим старую запись
              const oldItem = itemView_old.items.find(
                (item) => item.type === it.type && parseInt(item.item_id) === parseInt(it.item_id),
              );

              if (!oldItem) {
                // Новый элемент
                it.color = "add";
              } else {
                // Сравниваем все важные поля
                const fieldsToCompare = [
                  "name",
                  "price",
                  "quantity",
                  "status",
                  "weight",
                  "size",
                  "category",
                  "art",
                  "is_show",
                  "is_hit",
                  "is_new",
                  // добавьте другие поля, которые нужно отслеживать
                ];

                const hasChanges = fieldsToCompare.some((field) => {
                  // Проверяем наличие поля в обоих объектах
                  if (field in oldItem || field in it) {
                    const oldValue = oldItem[field];
                    const newValue = it[field];

                    // Сравниваем с учетом типов
                    return String(oldValue) !== String(newValue);
                  }
                  return false;
                });

                if (hasChanges) {
                  it.color = "edit";
                }
                // Если нет изменений, цвет не меняем
              }

              return [...newList, it];
            }, [])
            .concat(
              itemView_old.items.filter((it) => {
                if (
                  !itemView.items.find(
                    (item) =>
                      item.type === it.type && parseInt(item.item_id) === parseInt(it.item_id),
                  )
                ) {
                  it.color = "delete";
                  return it;
                }
              }),
            );
        }
      }
    }

    this.setState({
      modalDialogViewHistDisabled: true,
      itemViewHistDisabled: itemView,
    });
  }

  render() {
    return (
      <div style={{ backgroundColor: "#F2F2F2", height: "100vh" }}>
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
        <Write_off_journal_modal_view
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null })}
          item={this.state.itemView}
          fullScreen={this.state.fullScreen}
        />
        <Write_off_journal_modal
          open={this.state.modalDialog}
          getData={this.getData}
          update={this.updateNew}
          onClose={() =>
            this.setState({
              modalDialog: false,
              modalDialogView: false,
              modalDialogHist: false,
              modalDialogViewHist: false,
              itemEdit: null,
            })
          }
          itemEdit={this.state.itemEdit}
          points={this.state.points}
          point={this.state.point}
          acces={this.state.acces}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          save={this.saveItem.bind(this)}
          deleteItem={this.deleteItem.bind(this)}
        />
        <Write_off_journal_History
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false, itemHist: null })}
          item={this.state.itemHist}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          openModalHistoryView={this.openModalHistoryView.bind(this)}
        />
        {this.state.modalDialogViewHist && (
          <Write_off_journal_View
            open={this.state.modalDialogViewHist}
            onClose={() => this.setState({ modalDialogViewHist: false, itemViewHist: null })}
            itemView={this.state.itemViewHist}
            fullScreen={this.state.fullScreen}
            itemHist={this.state.itemHist}
            acces={this.state.acces}
            openModalHistoryView={this.openModalHistoryViewDisabled.bind(this)}
            getData={this.getData}
            openItem={(id, method) => this.openItem(id, method, this.state.list)}
            point={this.state.point}
            points={this.state.points}
          />
        )}
        {this.state.modalDialogViewHistDisabled && (
          <Write_off_journal_View_Disabled
            open={this.state.modalDialogViewHistDisabled}
            onClose={() =>
              this.setState({ modalDialogViewHistDisabled: false, itemViewHistDisabled: null })
            }
            itemView={this.state.itemViewHistDisabled}
            fullScreen={this.state.fullScreen}
            openModalHistoryView={this.openModalHistoryViewDisabled.bind(this)}
            getData={this.getData}
            openItem={(id, method) => this.openItem(id, method, this.state.list)}
            point={this.state.point}
            points={this.state.points}
          />
        )}
        <Grid
          container
          spacing={3}
          style={{ padding: "88px 24px 24px 24px", backgroundColor: "#f2f2f2" }}
        >
          <Grid size={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 10,
            }}
          />
          {parseInt(this.state.acces?.create_write_off_access) == 1 && (
            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
              style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
            >
              <Button
                onClick={this.openNewItem.bind(this, "Новое списание")}
                style={{
                  color: "#2F7D33",
                  border: "1px solid #2F7D33",
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  textTransform: "math-auto",
                  padding: "12px 20px",
                  fontWeight: "400",
                  height: "40px",
                }}
              >
                <AddIcon
                  style={{ width: "20px", height: "20px", marginRight: "4px", marginBottom: "1px" }}
                />{" "}
                Новое списание
              </Button>
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MyAutocomplite
              label="Кафе"
              customRI="journal"
              clearable={true}
              multiple={false}
              data={this.state.points}
              value={this.state.point}
              func={(event, value) => this.setState({ point: value })}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 8,
            }}
          />

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <MyDatePickerNew
              label="Дата от"
              customRI="journal"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, "date_start")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              customRI="journal"
              func={this.changeDateRange.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Поиск позиции списания"
              multiple={true}
              data={this.state.items}
              customRI="journal"
              value={this.state.item}
              func={this.changeComplite.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 5,
            }}
          >
            <div style={{ display: "flex" }}>
              <Button
                onClick={this.getPointData.bind(this)}
                variant="contained"
                style={{
                  backgroundColor: "#2F7D33",
                  borderRadius: "12px",
                  textTransform: "math-auto",
                  padding: "8px 46px",
                  fontWeight: "400",
                  height: "40px",
                  marginRight: "12px",
                }}
              >
                Посмотреть
              </Button>
              <Button
                onClick={this.getPointData.bind(this)}
                variant="contained"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#F43331",
                  borderRadius: "12px",
                  textTransform: "math-auto",
                  padding: "8px 46px",
                  fontWeight: "400",
                  height: "40px",
                  boxShadow: "none",
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Accordion
              sx={{
                color: "#666666",
                borderRadius: "12px !important",
                boxShadow: "none",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: "#A6A6A6" }} />}>
                <Typography>Количество по материалам</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table
                    stickyHeader
                    aria-label="sticky table"
                  >
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell style={{ width: "35%" }}>Позиция</TableCell>
                        <TableCell style={{ width: "35%" }}>Количество</TableCell>
                        <TableCell style={{ width: "30%" }}></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_items_pf.map((it, k) => (
                        <TableRow key={k}>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.value + " " + it.ei_name}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("ru-RU").format(it?.price ?? "")} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                        <TableCell colSpan={2}>Общая</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("ru-RU").format(this.state.all_sum_pf)} ₽
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Accordion
              sx={{
                color: "#666666",
                borderRadius: "12px !important",
                boxShadow: "none",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: "#A6A6A6" }} />}>
                <Typography>Количество по блюдам</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table
                    stickyHeader
                    aria-label="sticky table"
                  >
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell style={{ width: "35%" }}>Позиция</TableCell>
                        <TableCell style={{ width: "35%" }}>Количество</TableCell>
                        <TableCell style={{ width: "30%" }}></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_items_pos.map((it, k) => (
                        <TableRow key={k}>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.value + " " + it.ei_name}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("ru-RU").format(it?.price ?? "")} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                        <TableCell colSpan={2}>Общая</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("ru-RU").format(this.state.all_sum_pos)} ₽
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Accordion
              sx={{
                color: "#666666",
                borderRadius: "12px !important",
                boxShadow: "none",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: "#A6A6A6" }} />}>
                <Typography>Количество по создателям</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table
                    stickyHeader
                    aria-label="sticky table"
                  >
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell>Создатель</TableCell>
                        <TableCell>Сумма</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_users.map((it, k) => (
                        <TableRow key={k}>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("ru-RU").format(it?.price ?? "")} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            sx={{
              mb: 5,
            }}
          >
            {this.state.list?.length ? (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 500,
                  overflow: "auto",
                  borderRadius: "12px",
                  border: "1px solid #E5E5E5",
                  boxShadow: "none",
                  "& .MuiPaper-root": {
                    borderRadius: "12px",
                  },
                }}
              >
                <div style={{ maxHeight: 500, overflow: "auto" }}>
                  <Table
                    stickyHeader
                    aria-label="sticky table"
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: "#F5F5F5",
                          "& th": {
                            fontWeight: 500,
                            fontSize: "14px",
                            border: "none",
                            padding: "9px",
                            color: "#3C3B3B",
                            "&:first-of-type": {
                              borderTopLeftRadius: "12px",
                            },
                            "&:last-of-type": {
                              borderTopRightRadius: "12px",
                            },
                            borderBottom: "1px solid #E5E5E5",
                          },
                          borderBottom: "1px solid #E5E5E5",
                        }}
                      >
                        <TableCell
                          style={{ width: "5%" }}
                          className="text-14px"
                        >
                          №
                        </TableCell>
                        <TableCell
                          style={{ width: "17%" }}
                          className="text-14px"
                        >
                          Дата/Время
                        </TableCell>
                        <TableCell
                          style={{ width: "15%" }}
                          className="text-14px"
                        >
                          Себестоимость
                        </TableCell>
                        <TableCell
                          style={{ width: "17%" }}
                          className="text-14px"
                        >
                          Создатель
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.list.map((item, key) => (
                        <TableRow
                          hover
                          key={key}
                          sx={{
                            "&:last-of-type": {
                              "& td:first-of-type": {
                                borderBottomLeftRadius: "12px",
                              },
                              "& td:last-of-type": {
                                borderBottomRightRadius: "12px",
                              },
                            },
                            "& td": {
                              color: "#666666",
                              padding: "9px",
                            },
                            backgroundColor:
                              parseInt(item?.status) === 2
                                ? "rgba(244,51,49,0.66)"
                                : item?.date_update
                                  ? "rgba(255,204,0,0.66)"
                                  : key % 2 === 0
                                    ? "#fff"
                                    : "#F2F2F2",
                          }}
                        >
                          <TableCell
                            style={{
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "14px !important",
                            }}
                            className="text-14px"
                            onClick={this.openViewItem.bind(this, item?.items, item.coment)}
                          >
                            {key + 1}.
                          </TableCell>
                          <TableCell className="text-14px">
                            <Button
                              variant="text"
                              sx={{
                                textTransform: "none",
                                padding: 0,
                                fontWeight: 400,
                              }}
                              onClick={this.openModalHistoryView.bind(this, item)}
                            >
                              {item.date}
                              <br />
                              {item.time}
                            </Button>
                          </TableCell>
                          <TableCell className="text-14px">
                            {new Intl.NumberFormat("ru-RU").format(item?.price ?? "")} ₽
                          </TableCell>
                          <TableCell className="text-14px">{item.user_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TableContainer>
            ) : null}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default function WriteOffJournal() {
  return <Write_off_journal_ />;
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
