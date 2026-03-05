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
import { useRouter } from "next/router";

import dayjs from "dayjs";
import moment from "moment";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import AddIcon from "@mui/icons-material/Add";
import { NumericTextField } from "@/ui/Forms/MyNumericFormat";
import { Box, Chip } from "@mui/material";
import WriteOffReasons from "@/ui/Forms/WriteOffReasons";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export class Write_off_journal_View extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
      itemHist: [],
      isMobile: window.innerWidth <= 600,
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
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({
      isMobile: window.innerWidth <= 600,
    });
  };

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
        sx={{
          marginTop: this.state.isMobile ? "0" : "60px",
          ".MuiDialog-backdrop": {
            backgroundColor: "transparent !important",
          },
        }}
        onClose={this.onClose.bind(this)}
        fullScreen={true}
      >
        {this.state.isMobile ? (
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
        ) : (
          <DialogTitle
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#E5E5E5",
            }}
          >
            <div>
              <span
                className="text-14px"
                style={{ color: "#A6A6A6", cursor: "pointer" }}
                onClick={this.onClose.bind(this)}
              >
                Журнал списания &#8193;/&#8193;{" "}
              </span>
              <span className="text-14px">Списание от {this.state.itemView?.date}</span>
            </div>
          </DialogTitle>
        )}
        <DialogContent
          style={{ padding: 12, backgroundColor: this.state.isMobile ? "#F2F2F2" : "#E5E5E5" }}
        >
          <Grid
            container
            rowSpacing={1}
            spacing={3}
          >
            {!this.state.isMobile ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "8px",
                  }}
                >
                  <h2 style={{ color: "#3C3B3B" }}>Списание от {this.state.itemView?.date}</h2>
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
                      onClick={() =>
                        this.props.openItem(this.state.itemView?.id, "Редактрование списания")
                      }
                    >
                      Редактирование
                    </Button>
                  ) : null}
                </div>
              </Grid>
            ) : null}
            {this.state.isMobile ? (
              this.state.itemView?.items.map((it) => {
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ color: "#666666", fontWeight: "500" }}>
                          Причина списания
                        </span>
                        <span
                          style={{
                            color: "#666666",
                            fontWeight: "400",
                          }}
                        >
                          {this.state.itemView.coment}
                        </span>
                      </div>
                    </div>
                  </Grid>
                );
              })
            ) : (
              <Table
                sx={{
                  margin: "8px",
                }}
              >
                <TableHead sx={{ backgroundColor: "#F3F3F3 !important" }}>
                  <TableRow sx={{ backgroundColor: "#F3F3F3 !important" }}>
                    <TableCell
                      sx={{
                        backgroundColor: "#F3F3F3 !important",
                        borderRadius: "8px 0 0 0",
                        padding: "12px",
                      }}
                    >
                      Номер
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Тип
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Наименование
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Количество
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#F3F3F3 !important",
                        borderRadius: "0 8px 0 0",
                        padding: "12px",
                      }}
                    >
                      Причина списания
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.itemView?.items.map((it, k) => (
                    <TableRow
                      hover
                      key={k}
                    >
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {k + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {it.type_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {it.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {this.state.itemView.coment}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {this.state.isMobile ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "8px",
                  }}
                >
                  {this.props.acces?.edit_write_off_access ? (
                    <Button
                      style={{
                        backgroundColor: "#2F7D33",
                        borderRadius: "12px",
                        height: "48px",
                        textTransform: "capitalize",
                        color: "#2FFF",
                        boxShadow: "none",
                        width: "100%",
                      }}
                      variant="contained"
                      onClick={() =>
                        this.props.openItem(this.state.itemView?.id, "Редактрование списания")
                      }
                    >
                      Посмотреть
                    </Button>
                  ) : null}
                </div>
              </Grid>
            ) : null}
          </Grid>
          <Accordion
            sx={{
              color: "#666666",
              borderRadius: "12px !important",
              margin: "7px",
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
            <AccordionDetails
              style={{
                backgroundColor: this.state.isMobile ? "#F2F2F2" : "#E5E5E5",
                padding: "12px 0 0 0",
              }}
            >
              <Grid
                container
                spacing={3}
              >
                {this.state.isMobile ? (
                  this.state.itemHist?.map((it, key) => {
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
                              <span style={{ color: "#666666", fontWeight: "500" }}>
                                № {key + 1}
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
                  })
                ) : (
                  <Table
                    sx={{
                      margin: "20px",
                    }}
                  >
                    <TableHead sx={{ backgroundColor: "#F3F3F3 !important" }}>
                      <TableRow sx={{ backgroundColor: "#F3F3F3 !important" }}>
                        <TableCell
                          sx={{
                            backgroundColor: "#F3F3F3 !important",
                            borderRadius: "8px 0 0 0",
                            padding: "12px",
                          }}
                        >
                          Номер
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#F3F3F3 !important",
                            borderRadius: "8px 0 0 0",
                            padding: "12px",
                          }}
                        >
                          Дата создания
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                          Дата редактирования / удаления
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                          Время редактирования / удаления
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                          Редактор
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#F3F3F3 !important",
                            borderRadius: "0 8px 0 0",
                            padding: "12px",
                          }}
                        >
                          Просмотр
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.itemHist.map((it, k) => (
                        <TableRow
                          hover
                          key={k}
                          sx={{ borderTop: "8px solid #E5E5E5" }}
                        >
                          <TableCell
                            sx={{
                              backgroundColor: "#FFF !important",
                              marginTop: "8px",
                              padding: "12px",
                            }}
                          >
                            {k + 1}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#FFF !important",
                              marginTop: "8px",
                              padding: "12px",
                            }}
                          >
                            {it.date_create}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#FFF !important",
                              marginTop: "8px",
                              padding: "12px",
                            }}
                          >
                            {it.date_update === "0000-00-00" ? "" : it.date_update}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#FFF !important",
                              marginTop: "8px",
                              padding: "12px",
                            }}
                          >
                            {parseInt(it.time_update) ? it.time_update : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#FFF !important",
                              marginTop: "8px",
                              padding: "12px",
                            }}
                          >
                            {it.user_update ?? it.user_create}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#FFF !important",
                              marginTop: "8px",
                              padding: "12px",
                            }}
                          >
                            <Button
                              onClick={this.props.openModalHistoryView.bind(
                                this,
                                k,
                                this.state.itemHist,
                              )}
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: "12px",
                                height: "48px",
                                border: "1px solid #F3F3F3",
                                color: "#5E5E5E",
                              }}
                            >
                              Посмотреть
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions
          style={{ backgroundColor: this.state.isMobile ? "#F2F2F2" : "#E5E5E5" }}
        ></DialogActions>
      </Dialog>
    );
  }
}

export class WriteOffJournalEdit extends React.Component {
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
      isMobile: false,
      openAccept: false,
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

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    if (this.props.itemEdit) {
      const point =
        this.props.points?.find((point) => parseInt(point.id) === parseInt(this.props.point?.id)) ||
        "";
      console.log(this.props.itemEdit);
      this.setState({
        point,
        points: this.props.points || [],
        types: this.props.itemEdit.types || [
          { id: "1", name: "Товар" },
          { id: "2", name: "Заготовка" },
          { id: "3", name: "Сайт" },
        ],
        writeOffItems: this.props.itemEdit?.woj_items || [],
        comment: this.props.itemEdit?.woj?.coment || "",
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.itemEdit) {
      return;
    }

    if (this.props.itemEdit !== prevProps.itemEdit) {
      const point =
        this.props.points?.find((point) => parseInt(point.id) === parseInt(this.props.point?.id)) ||
        "";

      this.setState({
        point,
        points: this.props.points || [],
        types: this.props.itemEdit.types || [],
        writeOffItems: this.props.itemEdit?.woj_items || [],
        comment: this.props.itemEdit?.woj?.coment || "",
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({ isMobile: window.innerWidth <= 600 });
  };

  changePoint = (data, event) => {
    this.setState({
      [data]: event.target.value,
    });
  };

  changeItem = (data, event) => {
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
  };

  changeType = (data, event) => {
    const items =
      this.props.itemEdit?.items?.items?.filter((it) => {
        if (parseInt(event.target.value) === 1) {
          return it.type === "item" || it.type === "set";
        }
        if (parseInt(event.target.value) === 2) {
          return it.type === "rec" || it.type === "pf";
        }
        if (parseInt(event.target.value) === 3) {
          return it.type === "pos";
        }
        return false;
      }) || [];

    this.setState({
      [data]: event.target.value,
      items,
      item: "",
    });
  };

  changeItemData = (data, event, value) => {
    this.setState({
      [data]: value,
      ed_izmer: value?.ei_name || "",
    });
  };

  addItem = () => {
    const { type, types, item, count, writeOffItems } = this.state;

    if (!type || !item || !parseInt(count)) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо указать все данные для списания",
      });
      return;
    }

    const typeObj = types.find((t) => parseInt(t.id) === parseInt(type));

    const newItem = {
      id: item.id,
      ei_name: item.ei_name,
      name: item.name,
      type: item.type,
      type_name: typeObj?.name || "",
      type_s: "1",
      value: count,
    };

    writeOffItems.push(newItem);

    this.setState({
      writeOffItems,
      items: [],
      type: "",
      item: "",
      count: "",
      ed_izmer: "",
    });
  };

  deleteItem = (index) => {
    const writeOffItems = [...this.state.writeOffItems];
    writeOffItems.splice(index, 1);
    this.setState({ writeOffItems });
  };

  delete = () => {
    const point = this.state.point;
    this.props.deleteItem?.(this.props.itemEdit?.woj?.id, point);
    this.setState({ confirmDialog: false });
  };

  createTags = async (reason, tag) => {
    try {
      const res = await api_laravel("write_off_journal_2", "save_tag", {
        name: reason,
        tag_id: tag.id,
      });

      if (res.data.st) {
        this.setState({ openTags: false, reason, confirmDialogTag: true });
        this.props.update?.();
      } else {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: res.data.text,
        });
      }
    } catch (error) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Ошибка создания тега",
      });
    }
  };

  save = async () => {
    const { writeOffItems, comment } = this.state;
    const { point, writeOffId, onSave, onClose } = this.props;

    const cleanComment = comment.replace(/\s/g, "");

    if (!writeOffItems.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Позиции для списания отсутствуют!",
      });
      return;
    }

    if (!comment.trim()) {
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

    try {
      const res = await api_laravel("write_off_journal_2", "save_edit", {
        items: writeOffItems,
        comment,
        j_id: writeOffId,
        point: point,
      });

      if (res.data.st) {
        this.setState({
          openAlert: true,
          err_status: true,
          err_text: res.data.text,
          openAccept: false,
        });
        setTimeout(() => {
          onSave?.();
          onClose?.();
        }, 1000);
      } else {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: res.data.text,
        });
      }
    } catch (error) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Ошибка сохранения",
      });
    }
  };

  onClose = () => {
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
      openAccept: false,
    });
    this.props.onClose?.();
  };

  render() {
    const { open, method = "Редактирование списания", itemEdit } = this.props;
    const {
      type,
      item,
      count,
      ed_izmer,
      writeOffItems,
      comment,
      isMobile,
      openAccept,
      confirmDialog,
      confirmDialogTag,
      reason,
      openTags,
    } = this.state;

    const types = this.state.types || [];

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

        {/* Диалог подтверждения */}
        {openAccept && (
          <Dialog
            sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435, borderRadius: "12px" } }}
            maxWidth="xs"
            open={openAccept}
            onClose={() => this.setState({ openAccept: false })}
          >
            <DialogTitle
              sx={{
                backgroundColor: "#F2F2F2",
                borderBottom: "1px solid #E5E5E5",
                display: "flex",
                padding: "12px 14px",
                height: "20px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ color: "#666666" }}>Подтверждение</Typography>
              <IconButton
                onClick={() => this.setState({ openAccept: false })}
                style={{ cursor: "pointer", color: "#666666" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              align="center"
              sx={{ fontWeight: "400", color: "#5E5E5E", margin: "20px 32px", padding: 0 }}
            >
              Вы подтверждаете сохранение изменений?
            </DialogContent>
            <DialogActions>
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <Button
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 49px",
                    width: "100%",
                    backgroundColor: "#2F7D33",
                    color: "#fff",
                  }}
                  onClick={this.save}
                >
                  Да
                </Button>
                <Button
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 49px",
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    color: "#F43331",
                  }}
                  autoFocus
                  onClick={() => this.setState({ openAccept: false })}
                >
                  Нет
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        )}

        <Dialog
          sx={{
            "& .MuiDialog-paper": {
              width: "80%",
              maxHeight: 435,
              borderRadius: "12px",
            },
          }}
          maxWidth="xs"
          open={confirmDialog}
          fullScreen={false}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#F2F2F2",
              borderBottom: "1px solid #E5E5E5",
              display: "flex",
              padding: "12px 14px",
              height: "20px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ color: "#666666" }}>Подтверждение</Typography>
            <IconButton
              onClick={() => this.setState({ confirmDialog: false })}
              style={{ cursor: "pointer", color: "#666666" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            align="center"
            sx={{
              fontWeight: "400",
              color: "#5E5E5E",
              margin: "20px 32px",
              padding: 0,
              height: "100px",
            }}
          >
            Вы подтверждаете удаление?
          </DialogContent>
          <DialogActions>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
              <Button
                sx={{
                  borderRadius: "12px",
                  padding: "12px 49px",
                  width: "100%",
                  backgroundColor: "#2F7D33",
                  color: "#fff",
                }}
                onClick={this.delete}
              >
                Да
              </Button>
              <Button
                sx={{
                  borderRadius: "12px",
                  padding: "12px 49px",
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  color: "#F43331",
                }}
                autoFocus
                onClick={() => this.setState({ openAccept: false })}
              >
                Нет
              </Button>
            </div>
          </DialogActions>
        </Dialog>

        {/* Диалог успешного создания тега */}
        <Dialog
          sx={{
            "&& .MuiDialog-paper": {
              width: "382px !important",
              borderRadius: "12px !important",
              maxHeight: 210,
            },
          }}
          maxWidth="sm"
          open={confirmDialogTag}
          fullScreen={isMobile}
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
              {reason}
            </Typography>
          </DialogContent>
        </Dialog>

        {/* Основной диалог */}
        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={"xl"}
          onClose={this.onClose}
          sx={{
            marginTop: isMobile ? "0" : "60px",
            ".MuiDialog-backdrop": {
              backgroundColor: "transparent",
            },
          }}
          fullScreen={true}
        >
          {isMobile ? (
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
                onClick={this.onClose}
                style={{ cursor: "pointer", float: "right" }}
              >
                <KeyboardArrowDownIcon style={{ color: "#3C3B3B", rotate: "90deg" }} />
              </IconButton>
            </DialogTitle>
          ) : (
            <DialogTitle
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#E5E5E5",
              }}
            >
              <div>
                <span
                  className="text-14px"
                  style={{ color: "#A6A6A6", cursor: "pointer" }}
                  onClick={this.onClose}
                >
                  Списание &#8193;/&#8193;{" "}
                </span>
                <span className="text-14px">{method}</span>
              </div>
            </DialogTitle>
          )}

          <DialogContent style={{ padding: 12, backgroundColor: isMobile ? "#F3F3F3" : "#E5E5E5" }}>
            <Grid
              container
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyTextInput
                  label="Точка"
                  value={this.state.point?.name || ""}
                  disabled={true}
                  customRI="journal"
                  className="disabled_input"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <MySelect
                  is_none={false}
                  data={types}
                  value={type}
                  customRI="journal"
                  func={this.changeType.bind(this, "type")}
                  label="Тип"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Наименование"
                  multiple={false}
                  data={this.state.items}
                  value={item}
                  customRI="journal"
                  func={this.changeItemData.bind(this, "item")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <NumericTextField
                  label="Количество"
                  value={count}
                  customRI="journal"
                  onChange={this.changeItem.bind(this, "count")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <MyTextInput
                  label="Ед измерения"
                  value={ed_izmer}
                  disabled={true}
                  customRI="journal"
                  className="disabled_input"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }} />
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button
                  onClick={this.addItem}
                  variant="contained"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    height: "48px",
                    textTransform: "capitalize",
                    color: "#2F7D33",
                    width: "100%",
                    border: "1px solid #2F7D33",
                    boxShadow: "none",
                  }}
                >
                  Добавить позицию
                </Button>
              </Grid>
              <Grid
                size={{ xs: 12, sm: 2 }}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  onClick={() => {
                    this.setState({
                      type: "",
                      item: "",
                      count: "",
                      ed_izmer: "",
                    });
                  }}
                  variant="contained"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    height: "48px",
                    width: "100%",
                    textTransform: "capitalize",
                    color: "#F43331",
                    boxShadow: "none",
                  }}
                >
                  Сбросить фильтры
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <WriteOffReasons
                    value={comment}
                    onChange={(e) => this.setState({ comment: e })}
                    list={itemEdit?.tags_journal || []}
                  />
                  <IconButton
                    size="small"
                    onClick={() => this.setState({ openTags: true })}
                    sx={{
                      color: "#2F7D33",
                      borderRadius: isMobile ? "50%" : "12px",
                      border: "1px solid #2F7D33",
                      padding: isMobile ? "inherit" : "9px 40px",
                      ml: 0.5,
                      backgroundColor: "white",
                    }}
                  >
                    <AddIcon fontSize="small" />{" "}
                    {isMobile ? "" : <span className="text-14px">Новая причина</span>}
                  </IconButton>
                </div>
              </Grid>
            </Grid>

            {!isMobile ? (
              <Table>
                <TableHead sx={{ backgroundColor: "#F3F3F3 !important" }}>
                  <TableRow sx={{ backgroundColor: "#F3F3F3 !important" }}>
                    <TableCell
                      sx={{
                        backgroundColor: "#F3F3F3 !important",
                        borderRadius: "8px 0 0 0",
                        padding: "12px",
                      }}
                    >
                      Номер
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Тип
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Наименование
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Количество
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#F3F3F3 !important",
                        borderRadius: "0 8px 0 0",
                        padding: "12px",
                      }}
                    >
                      Удалить
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {writeOffItems.map((it, k) => (
                    <TableRow
                      hover
                      key={k}
                      sx={{ borderTop: "8px solid #E5E5E5" }}
                    >
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {k + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {it.type_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {it.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => this.deleteItem(k)}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              writeOffItems.map((it, key) => (
                <div
                  key={key}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #E5E5E5",
                    marginBottom: "4px",
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
                        onClick={() => this.deleteItem(key)}
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
                </div>
              ))
            )}
          </DialogContent>

          <DialogActions
            style={{
              paddingBottom: 10,
              paddingTop: 10,
              backgroundColor: isMobile ? "#F3F3F3" : "#E5E5E5",
            }}
          >
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
              Удалить
            </Button>
            <Button
              onClick={() => this.setState({ openAccept: true })}
              variant="contained"
              style={{
                backgroundColor: "#2F7D33",
                borderRadius: "12px",
                height: "48px",
                textTransform: "capitalize",
              }}
            >
              Сохранить
            </Button>
            <Button
              onClick={this.onClose}
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
          </DialogActions>
        </Dialog>
      </>
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
      touchStartY: 0,
      touchEndY: 0,
      swipeOffset: 0,
      isSwiping: false,
      maxSwipeOffset: 600,
      openAccept: false,
      isMobile: window.innerWidth <= 600,
    };
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({
      isMobile: window.innerWidth <= 600,
    });
  };

  handleTouchStart = (e) => {
    this.setState({
      touchStartY: e.touches[0].clientY,
      isSwiping: true,
      swipeOffset: 0,
    });
    e.stopPropagation();
  };

  handleTouchMove = (e) => {
    if (!this.state.isSwiping) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - this.state.touchStartY;

    // Разрешаем движение только вниз и ограничиваем максимальное смещение
    if (deltaY > 0) {
      const newOffset = Math.min(deltaY, this.state.maxSwipeOffset);
      this.setState({ swipeOffset: newOffset });
    }

    e.stopPropagation();
    e.preventDefault(); // Важно! Предотвращает скролл страницы
  };

  handleTouchEnd = (e) => {
    const { swipeOffset, isSwiping } = this.state;

    if (isSwiping) {
      // Если свайпнули достаточно далеко (больше 30% от максимума) - закрываем
      if (swipeOffset > this.state.maxSwipeOffset * 0.3) {
        this.onClose();
      } else {
        // Иначе возвращаем в исходное положение
        this.setState({ swipeOffset: 0 });
      }
    }

    this.setState({
      isSwiping: false,
      touchStartY: 0,
    });

    e.stopPropagation();
  };

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
            position: this.state.isMobile ? "absolute" : "initial",
            bottom: 0,
            width: "100%",
            borderRadius: this.state.isMobile ? "40px 40px 0 0" : "12px",
            height: "auto",
            maxHeight: "90vh",
            overflow: "hidden",
            // Добавляем трансформацию для свайпа
            transform:
              this.state.isMobile && this.state.swipeOffset > 0
                ? `translateY(${this.state.swipeOffset}px)`
                : "none",
            transition: this.state.isSwiping ? "none" : "transform 0.3s ease-out",
            // Добавляем тень при свайпе для лучшего визуального эффекта
            boxShadow:
              this.state.swipeOffset > 0
                ? "0px -4px 20px rgba(0, 0, 0, 0.2)"
                : "0px -4px 10px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        {this.state.openAccept ? (
          <Dialog
            sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435, borderRadius: "12px" } }}
            maxWidth="xs"
            open={this.state.openAccept}
            onClose={() => this.setState({ openAccept: false })}
          >
            <DialogTitle
              sx={{
                backgroundColor: "#F2F2F2",
                borderBottom: "1px solid #E5E5E5",
                display: "flex",
                padding: "12px 14px",
                height: "20px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ color: "#666666" }}>Подтверждение</Typography>
              <IconButton
                onClick={() => this.setState({ openAccept: false })}
                style={{ cursor: "pointer", color: "#666666" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              align="center"
              sx={{ fontWeight: "400", color: "#5E5E5E", margin: "20px 32px", padding: 0 }}
            >
              Вы подтверждаете создание нового списания?
            </DialogContent>
            <DialogActions>
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <Button
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 49px",
                    width: "100%",
                    backgroundColor: "#2F7D33",
                    color: "#fff",
                  }}
                  onClick={() => this.props.createTags(this.state.reason, this.state.tag)}
                >
                  Да
                </Button>
                <Button
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 49px",
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    color: "#F43331",
                  }}
                  autoFocus
                  onClick={() => this.setState({ openAccept: false })}
                >
                  Нет
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        ) : null}
        <Box
          sx={{
            width: "100%",
            display: this.state.isMobile ? "flex" : "none",
            justifyContent: "center",
            paddingTop: 1,
            paddingBottom: 2,
            position: "relative",
            cursor: "pointer",
            flexShrink: 0, // Не даем сжиматься
            backgroundColor: this.state.isMobile ? "#fff" : "transparent", // Цвет как у заголовка
            borderTopLeftRadius: "40px",
            borderTopRightRadius: "40px",
            zIndex: 10,
            "&:active": {
              "& .drag-indicator": {
                backgroundColor: "#888",
              },
            },
          }}
          onClick={this.onClose.bind(this)}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
        >
          {this.state.isMobile ? (
            <Box
              className="drag-indicator"
              sx={{
                width: 36,
                height: 5,
                backgroundColor: "#BABABA",
                borderRadius: 2,
                transition: "background-color 0.2s",
                marginTop: 1,
              }}
            />
          ) : null}
        </Box>

        <Box
          sx={{
            overflow: "auto",
            height: "100%",
            maxHeight: "calc(90vh - 60px)",
          }}
        >
          <DialogTitle
            sx={{
              textAlign: this.state.isMobile ? "center" : "start",
              padding: this.state.isMobile ? "0px 12px" : "12px 14px",
              color: this.state.isMobile ? "black" : "#5E5E5E",
              backgroundColor: this.state.isMobile ? "#fff" : "#F3F3F3",
            }}
          >
            <span>Создание новой причины</span>
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer", float: "right" }}
            >
              <CloseIcon style={{ color: "#A6A6A6" }} />
            </IconButton>
          </DialogTitle>
          <DialogContent
            style={{
              padding: "16px 0 360px 0",
              backgroundColor: this.state.isMobile ? "#f5f5f5" : "#FFF",
              width: "100%",
            }}
          >
            <Grid
              container
              spacing={3}
              sx={{ padding: "16px" }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
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
                  sm: 12,
                }}
              >
                <MyAutocomplite
                  label="Тег"
                  multiple={false}
                  renderOption={(params, option) => (
                    <Chip
                      {...params}
                      key={option.id}
                      label={option.name}
                      size="small"
                      sx={{
                        backgroundColor: "#F3F3F3",
                        borderRadius: "12px",
                        border: "1px solid #E5E5E5",
                        margin: "2px",
                        height: "22px",
                        lineHeight: "14px",
                        flexShrink: 0,
                        "& .MuiChip-label": {
                          padding: "0 8px",
                          fontSize: "12px",
                        },
                      }}
                    />
                  )}
                  ListboxProps={{
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: "4px",
                      padding: "8px",
                      overflowX: this.state.isMobile ? "auto" : "visible",
                      WebkitOverflowScrolling: "touch",
                    },
                  }}
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
                    backgroundColor: this.state.isMobile ? "#2F7D33" : "#FFF",
                    borderRadius: "12px",
                    height: "48px",
                    textTransform: "capitalize",
                    border: this.state.isMobile ? "none" : "1px solid #2F7D33",
                    color: this.state.isMobile ? "#FFF" : "#2F7D33",
                    width: "100%",
                  }}
                  onClick={() => this.setState({ openAccept: true })}
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
                    border: this.state.isMobile ? "none" : "1px solid #E5E5E5",
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

export class Write_off_journal_View_Disabled extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth <= 600, // добавили
      touchStartY: 0,
      touchEndY: 0,
      swipeOffset: 0,
      isSwiping: false,
      maxSwipeOffset: 600, // уменьшили
    };

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.containerRef = React.createRef();
  }

  handleTouchStart = (e) => {
    this.setState({
      touchStartY: e.touches[0].clientY,
      isSwiping: true,
      swipeOffset: 0,
    });
    e.stopPropagation();
  };

  handleTouchMove = (e) => {
    if (!this.state.isSwiping) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - this.state.touchStartY;

    // Разрешаем движение только вниз и ограничиваем максимальное смещение
    if (deltaY > 0) {
      const newOffset = Math.min(deltaY, this.state.maxSwipeOffset);
      this.setState({ swipeOffset: newOffset });
    }

    e.stopPropagation();
    e.preventDefault();
  };

  handleTouchEnd = (e) => {
    const { swipeOffset, isSwiping, maxSwipeOffset } = this.state;

    if (isSwiping) {
      if (swipeOffset > maxSwipeOffset * 0.3) {
        this.onClose();
      } else {
        this.setState({ swipeOffset: 0 });
      }
    }

    this.setState({
      isSwiping: false,
      touchStartY: 0,
    });

    e.stopPropagation();
  };

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth <= 600, // обновляем isMobile
    });
  };

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView,
      });
    }
  }

  onClose = () => {
    this.setState({
      itemView: null,
      swipeOffset: 0,
    });
    this.props.onClose();
  };

  render() {
    const { open, fullScreen } = this.props;
    const { width, height, isMobile, swipeOffset, isSwiping } = this.state;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={this.onClose}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            margin: 0,
            position: isMobile ? "absolute" : "initial",
            bottom: 0,
            width: "100%",
            borderRadius: isMobile ? "40px 40px 0 0" : "12px",
            height: "auto",
            maxHeight: "90vh",
            overflow: "hidden",
            transform: isMobile && swipeOffset > 0 ? `translateY(${swipeOffset}px)` : "none",
            transition: isSwiping ? "none" : "transform 0.3s ease-out",
            boxShadow:
              swipeOffset > 0 ? "0px -4px 20px rgba(0,0,0,0.2)" : "0px -4px 10px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Индикатор свайпа (только для мобильных) */}
        {isMobile && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              paddingTop: 1,
              paddingBottom: 2,
              position: "relative",
              cursor: "pointer",
              flexShrink: 0,
              backgroundColor: "#fff",
              borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
              zIndex: 10,
              "&:active .drag-indicator": {
                backgroundColor: "#888",
              },
            }}
            onClick={this.onClose}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
          >
            <Box
              className="drag-indicator"
              sx={{
                width: 36,
                height: 5,
                backgroundColor: "#BABABA",
                borderRadius: 2,
                transition: "background-color 0.2s",
                marginTop: 1,
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            overflow: "auto",
            maxHeight: isMobile ? "calc(90vh - 60px)" : "calc(90vh - 20px)",
          }}
        >
          <DialogTitle sx={{ textAlign: "center", padding: "0 12px" }}>
            История изменений
            <IconButton
              onClick={this.onClose}
              style={{ float: "right" }}
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
                  width: "98%",
                }}
              >
                <span style={{ color: "#666666" }}>Изменение №1</span>
                <span style={{ color: "#666666" }}>Дата создания 2025-12-01</span>
              </div>
              <Grid
                container
                spacing={3}
              >
                {this.props.itemView?.items?.map((it, key) => (
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    key={key}
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
                                ? "#2F7D33"
                                : it.color === "delete"
                                  ? "#F43331"
                                  : "#FFA500",
                          }}
                        >
                          {it.color === "add"
                            ? "Добавлен"
                            : it.color === "delete"
                              ? "Удалён"
                              : "Изменён"}
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
                          {it.value} {it.ei_name}
                        </span>
                      </div>
                    </div>
                  </Grid>
                ))}
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
      isMobile: false,
      openAccept: false,

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

  componentDidMount() {
    this.setState({
      isMobile: window.innerWidth <= 600,
    });
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({
      isMobile: window.innerWidth <= 600,
    });
  };

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
      openAccept: false,
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
        {this.state.openAccept ? (
          <Dialog
            sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435, borderRadius: "12px" } }}
            maxWidth="xs"
            open={this.state.openAccept}
            onClose={() => this.setState({ openAccept: false })}
          >
            <DialogTitle
              sx={{
                backgroundColor: "#F2F2F2",
                borderBottom: "1px solid #E5E5E5",
                display: "flex",
                padding: "12px 14px",
                height: "20px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ color: "#666666" }}>Подтверждение</Typography>
              <IconButton
                onClick={() => this.setState({ openAccept: false })}
                style={{ cursor: "pointer", color: "#666666" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              align="center"
              sx={{ fontWeight: "400", color: "#5E5E5E", margin: "20px 32px", padding: 0 }}
            >
              Вы подтверждаете создание нового списания?
            </DialogContent>
            <DialogActions>
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <Button
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 49px",
                    width: "100%",
                    backgroundColor: "#2F7D33",
                    color: "#fff",
                  }}
                  onClick={this.save.bind(this)}
                >
                  Да
                </Button>
                <Button
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 49px",
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    color: "#F43331",
                  }}
                  autoFocus
                  onClick={() => this.setState({ openAccept: false })}
                >
                  Нет
                </Button>
              </div>
            </DialogActions>
          </Dialog>
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
          fullScreen={this.state.isMobile}
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
          fullScreen={this.state.isMobile}
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
          sx={{
            marginTop: this.state.isMobile ? "0" : "60px",
            ".MuiDialog-backdrop": {
              backgroundColor: "transparent",
            },
          }}
          fullScreen={true}
        >
          {this.state.isMobile ? (
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
          ) : (
            <DialogTitle
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#E5E5E5",
              }}
            >
              <div>
                <span
                  className="text-14px"
                  style={{ color: "#A6A6A6", cursor: "pointer" }}
                  onClick={this.onClose.bind(this)}
                >
                  Журнал списания &#8193;/&#8193;{" "}
                </span>
                <span className="text-14px">{method}</span>
              </div>
            </DialogTitle>
          )}

          <DialogContent
            style={{ padding: 12, backgroundColor: this.state.isMobile ? "#F3F3F3" : "#E5E5E5" }}
          >
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
                  sm: 3,
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
                    customRI="journal"
                    className="disabled_input"
                  />
                )}
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 2,
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
                  sm: 3,
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
                  sm: 2,
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
                  sm: 8,
                }}
              />
              <Grid
                size={{
                  xs: 12,
                  sm: 2,
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
                    width: "100%",
                    border: "1px solid #2F7D33",
                    boxShadow: "none",
                  }}
                >
                  Добавить позицию
                </Button>
              </Grid>
              <Grid
                style={{ display: "flex", justifyContent: "flex-end" }}
                size={{
                  xs: 12,
                  sm: 2,
                }}
              >
                <Button
                  onClick={() => {
                    this.setState({
                      type: "",
                      item: "",
                      count: "",
                      ed_izmer: "",
                    });
                  }}
                  variant="contained"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    height: "48px",
                    width: "100%",
                    textTransform: "capitalize",
                    color: "#F43331",
                    boxShadow: "none",
                  }}
                >
                  Сбросить фильтры
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
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
                      borderRadius: this.state.isMobile ? "50%" : "12px",
                      border: "1px solid #2F7D33",
                      padding: this.state.isMobile ? "inherit" : "9px 40px",
                      ml: 0.5,
                      backgroundColor: "white",
                    }}
                  >
                    <AddIcon fontSize="small" />{" "}
                    {this.state.isMobile ? "" : <span className="text-14px">Новая причина</span>}
                  </IconButton>
                </div>
              </Grid>
            </Grid>
            {!this.state.isMobile ? (
              <Table>
                <TableHead sx={{ backgroundColor: "#F3F3F3 !important" }}>
                  <TableRow sx={{ backgroundColor: "#F3F3F3 !important" }}>
                    <TableCell
                      sx={{
                        backgroundColor: "#F3F3F3 !important",
                        borderRadius: "8px 0 0 0",
                        padding: "12px",
                      }}
                    >
                      Номер
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Тип
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Наименование
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "#F3F3F3 !important", padding: "12px" }}>
                      Количество
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#F3F3F3 !important",
                        borderRadius: "0 8px 0 0",
                        padding: "12px",
                      }}
                    >
                      "Удалить"
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.writeOffItems.map((it, k) => (
                    <TableRow
                      hover
                      key={k}
                      sx={{ borderTop: "8px solid #E5E5E5" }}
                    >
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {k + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {it.type_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {it.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#FFF !important",
                          marginTop: "8px",
                          padding: "12px",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={this.deleteItem.bind(this, k)}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
            {this.state.isMobile
              ? this.state.writeOffItems.map((it, key) => {
                  return (
                    <div
                      style={{
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #E5E5E5",
                        marginBottom: "4px",
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
                    </div>
                  );
                })
              : null}
          </DialogContent>
          <DialogActions
            style={{
              paddingBottom: 10,
              paddingTop: 10,
              backgroundColor: this.state.isMobile ? "#F3F3F3" : "#E5E5E5",
            }}
          >
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
                Удалить
              </Button>
            ) : null}
            <Button
              onClick={() => this.setState({ openAccept: true })}
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
            <Button
              onClick={this.onClose.bind(this)}
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
          <Grid
            size={{
              xs: 12,
              sm: 10,
            }}
          />
          <Grid
            size={{
              xs: 12,
              sm: 10,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>
          {parseInt(this.state.acces?.create_write_off_access) == 1 && (
            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
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
                  width: "100%",
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
              sm: 4,
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
              sm: 4,
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
              sm: 8,
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
              sm: 4,
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
                  width: "100%",
                }}
              >
                Посмотреть
              </Button>
              <Button
                onClick={() => {
                  this.setState({
                    date_start: null,
                    date_end: null,
                    item: [],
                    point: {},
                  });
                }}
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
                  width: "100%",
                }}
              >
                Сбросить
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
                          onClick={() => {
                            window.location.href = `/write_off_journal_2/${this.state.point?.id}/${item.id}`;
                          }}
                          key={key}
                          sx={{
                            "&:last-of-type": {
                              "& td:first-of-type": {
                                borderBottomLeftRadius: "12px",
                              },
                              cursor: "pointer",
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
                            {item.date}
                            <br />
                            {item.time}
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
