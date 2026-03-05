import React from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { api_laravel } from "@/src/api_new";
import MyAlert from "@/ui/MyAlert";
import { Box } from "@mui/material";
import {
  Write_off_journal_View,
  Write_off_journal_View_Disabled,
  WriteOffJournalEdit,
} from "@/pages/write_off_journal_2";

class WriteOffJournalViewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemView: null,
      itemHist: [],
      isMobile: false,
      isLoad: false,
      openAlert: false,
      err_status: true,
      err_text: "",
      openEditModal: false,
      editData: null,
      points: [],
      point: null,
      // Добавляем состояние для модалки просмотра истории
      modalHistoryView: false,
      historyViewItem: null,
    };
  }

  async componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    const { cityId, writeOffId } = this.props.router.query;
    if (cityId && writeOffId) {
      await this.loadWriteOffData(cityId, writeOffId);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({
      isMobile: window.innerWidth <= 600,
    });
  };

  loadWriteOffData = async (pointId, writeOffId) => {
    this.setState({ isLoad: true });

    try {
      // Загружаем данные точки
      const pointsRes = await api_laravel("write_off_journal_2", "get_all");
      const points = pointsRes.data.points;

      const point = points.find((p) => parseInt(p.id) === parseInt(pointId));

      // Загружаем данные списания
      const data = {
        id: writeOffId,
        point,
      };

      const res = await api_laravel("write_off_journal_2", "get_one_hist", data);

      // Загружаем данные для редактирования
      const editRes = await api_laravel("write_off_journal_2", "get_one", {
        ...data,
        woj_id: writeOffId,
      });

      const formattedHist = res.data.hist.map((item) => {
        item.items = item.items.map((it) => {
          if (it.type === "pos") it.type_name = "Сайт";
          if (it.type === "rec" || it.type === "pf") it.type_name = "Заготовка";
          if (it.type === "set" || it.type === "item") it.type_name = "Товар";
          return it;
        });
        return item;
      });

      const currentItem = formattedHist[0] || { items: [], coment: "" };

      this.setState({
        itemView: currentItem,
        itemHist: formattedHist,
        points,
        point,
        editData: editRes.data,
        isLoad: false,
      });
    } catch (error) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Ошибка загрузки данных",
        isLoad: false,
      });
    }
  };

  handleBack = () => {
    this.props.router.push(`/write_off_journal_2`);
  };

  handleEdit = () => {
    if (this.state.editData) {
      this.setState({ openEditModal: true });
    }
  };

  handleEditClose = () => {
    this.setState({ openEditModal: false });
  };

  handleEditSave = async () => {
    const { cityId, writeOffId } = this.props.router.query;
    await this.loadWriteOffData(cityId, writeOffId);
    this.setState({ openEditModal: false });
  };

  // Обновленный метод для открытия истории
  key;
  openModalHistoryView = (index, itemHist) => {
    let itemView = JSON.parse(JSON.stringify(itemHist[index]));

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(itemHist[index - 1]));

      for (let key in itemView) {
        if (itemView[key] !== itemView_old[key] && key !== "items" && key !== "status") {
          itemView[key] = { value: itemView[key], color: "changed" };
        }
      }

      if (this.key === "items") {
        const processedItems = itemView.items.reduce((newList, it) => {
          const oldItem = itemView_old.items.find(
            (item) => item.type === it.type && parseInt(item.item_id) === parseInt(it.item_id),
          );

          if (!oldItem) {
            newList.push({
              ...it,
              color: "add",
              changeType: "Добавлен",
            });
          } else {
            const fieldsToCompare = [
              "name",
              "price",
              "quantity",
              "value",
              "status",
              "weight",
              "size",
              "category",
              "art",
              "is_show",
              "is_hit",
              "is_new",
              "ei_name",
              "item_name",
            ];

            const hasChanges = fieldsToCompare.some((field) => {
              if (field in oldItem || field in it) {
                const oldValue = oldItem[field];
                const newValue = it[field];
                return String(oldValue) !== String(newValue);
              }
              return false;
            });

            if (hasChanges) {
              newList.push({
                ...it,
                color: "edit",
                changeType: "Изменен",
              });
            } else {
              newList.push({
                ...it,
                color: "unchanged",
                changeType: "Без изменений",
              });
            }
          }
          return newList;
        }, []);

        const deletedItems = itemView_old.items
          .filter((oldIt) => {
            return !itemView.items.find(
              (item) =>
                item.type === oldIt.type && parseInt(item.item_id) === parseInt(oldIt.item_id),
            );
          })
          .map((oldIt) => ({
            ...oldIt,
            color: "delete",
            changeType: "Удален",
          }));

        itemView.items = [...processedItems, ...deletedItems];
      }
    } else {
      itemView.items = itemView.items.map((it) => ({
        ...it,
        color: "add",
        changeType: "Добавлен",
      }));
    }

    this.setState({
      modalHistoryView: true,
      historyViewItem: itemView,
      isHistoryViewWithChanges: true,
    });
  };

  // Метод для закрытия модалки истории
  closeModalHistoryView = () => {
    this.setState({
      modalHistoryView: false,
      historyViewItem: null,
    });
  };

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel("write_off_journal_2", method, data)
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
        openEditModal: false,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  render() {
    const {
      itemView,
      itemHist,
      isMobile,
      isLoad,
      openEditModal,
      editData,
      points,
      point,
      modalHistoryView,
      historyViewItem,
    } = this.state;
    const { cityId, writeOffId } = this.props.router.query;

    if (isLoad) {
      return (
        <Backdrop
          open={true}
          style={{ zIndex: 99 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      );
    }

    return (
      <div
        style={{
          padding: isMobile ? "0" : "12px",
          backgroundColor: isMobile ? "#F2F2F2" : "#E5E5E5",
        }}
      >
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        {/* Модалка для просмотра истории */}
        {modalHistoryView && historyViewItem && (
          <Write_off_journal_View_Disabled
            open={modalHistoryView}
            onClose={this.closeModalHistoryView}
            itemView={historyViewItem}
            fullScreen={isMobile}
            acces={this.props.acces || {}}
            openItem={this.handleEdit}
            point={point}
            points={points}
            getData={this.getData}
            openModalHistoryView={this.openModalHistoryView}
          />
        )}

        {/* Модалка редактирования */}
        {openEditModal && editData && (
          <WriteOffJournalEdit
            open={openEditModal}
            onClose={this.handleEditClose}
            onSave={this.handleEditSave}
            itemEdit={editData}
            deleteItem={this.deleteItem.bind(this)}
            points={points}
            point={point}
            method={`Редактирование ${itemView?.date_create}`}
            cityId={cityId}
            writeOffId={writeOffId}
          />
        )}

        <Box
          sx={{
            backgroundColor: isMobile ? "#F2F2F2" : "#E5E5E5",
            minHeight: "100vh",
            mt: isMobile ? 0 : "60px",
          }}
        >
          {isMobile ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "84px",
                paddingLeft: "16px",
                paddingRight: "16px",
                paddingBottom: "16px",
                backgroundColor: "#fff",
              }}
            >
              <Box></Box>
              <Typography variant="h6">Списание</Typography>
              <IconButton onClick={this.handleBack}>
                <KeyboardArrowDownIcon sx={{ color: "#3C3B3B", transform: "rotate(90deg)" }} />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#E5E5E5",
                p: 2,
              }}
            >
              <Box>
                <span
                  style={{ color: "#A6A6A6", cursor: "pointer", fontSize: "14px" }}
                  onClick={this.handleBack}
                >
                  Журнал списания &#8193;/&#8193;{" "}
                </span>
                <span style={{ fontSize: "14px" }}>Списание от {itemView?.date_create}</span>
              </Box>
            </Box>
          )}

          {/* Контент как в DialogContent */}
          <Box sx={{ p: 1.5 }}>
            <Grid
              container
              rowSpacing={1}
              spacing={3}
            >
              {!isMobile && (
                <Grid size={{ xs: 12, sm: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      m: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: "#3C3B3B" }}
                    >
                      Списание от {itemView?.date_create}
                    </Typography>
                    <Button
                      sx={{
                        backgroundColor: "#2F7D33",
                        borderRadius: "12px",
                        height: "48px",
                        textTransform: "capitalize",
                        color: "#fff",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: "#1e5f22",
                        },
                      }}
                      variant="contained"
                      onClick={this.handleEdit}
                      startIcon={<EditIcon />}
                    >
                      Редактирование
                    </Button>
                  </Box>
                </Grid>
              )}

              {/* Таблица/карточки товаров */}
              {isMobile ? (
                itemView?.items?.map((it, idx) => (
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    key={idx}
                  >
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "12px",
                        p: "8px 12px",
                        mb: "12px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: "10px",
                        }}
                      >
                        <span style={{ color: "#666666", fontWeight: "500" }}>Тип</span>
                        <span style={{ color: "#666666", fontWeight: "400" }}>{it.type_name}</span>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: "10px",
                        }}
                      >
                        <span style={{ color: "#666666", fontWeight: "500" }}>Наименование</span>
                        <span style={{ color: "#666666", fontWeight: "400" }}>
                          {it.item_name || it.name}
                        </span>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: "10px",
                        }}
                      >
                        <span style={{ color: "#666666", fontWeight: "500" }}>Количество</span>
                        <span style={{ color: "#666666", fontWeight: "400" }}>
                          {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                        </span>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: "10px",
                        }}
                      >
                        <span style={{ color: "#666666", fontWeight: "500" }}>
                          Причина списания
                        </span>
                        <span style={{ color: "#666666", fontWeight: "400" }}>
                          {itemView.coment}
                        </span>
                      </Box>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12, sm: 12 }}>
                  <Table sx={{ p: 2 }}>
                    <TableHead sx={{ backgroundColor: "#F3F3F3 !important" }}>
                      <TableRow sx={{ backgroundColor: "#F3F3F3 !important" }}>
                        <TableCell
                          sx={{
                            backgroundColor: "#F3F3F3 !important",
                            borderRadius: "8px 0 0 0",
                            p: "12px",
                          }}
                        >
                          Номер
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#F3F3F3 !important", p: "12px" }}>
                          Тип
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#F3F3F3 !important", p: "12px" }}>
                          Наименование
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#F3F3F3 !important", p: "12px" }}>
                          Количество
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#F3F3F3 !important",
                            borderRadius: "0 8px 0 0",
                            p: "12px",
                          }}
                        >
                          Причина списания
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemView?.items?.map((it, k) => (
                        <TableRow
                          hover
                          key={k}
                        >
                          <TableCell
                            sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                          >
                            {k + 1}
                          </TableCell>
                          <TableCell
                            sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                          >
                            {it.type_name}
                          </TableCell>
                          <TableCell
                            sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                          >
                            {it.name}
                          </TableCell>
                          <TableCell
                            sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                          >
                            {String(it.value)?.replace(/\./g, ",") + " " + it.ei_name}
                          </TableCell>
                          <TableCell
                            sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                          >
                            {itemView.coment}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}

              {/* Кнопка для мобильной версии */}
              {isMobile && (
                <Grid size={{ xs: 12, sm: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      m: 1,
                    }}
                  >
                    <Button
                      sx={{
                        backgroundColor: "#2F7D33",
                        borderRadius: "12px",
                        height: "48px",
                        textTransform: "capitalize",
                        color: "#fff",
                        boxShadow: "none",
                        width: "100%",
                      }}
                      variant="contained"
                      onClick={this.handleEdit}
                      startIcon={<EditIcon />}
                    >
                      Редактировать
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Аккордеон истории */}
            <Accordion
              sx={{
                color: "#666666",
                borderRadius: "12px !important",
                m: "7px",
                boxShadow: "none",
                "&::before": {
                  display: "none",
                },
                "&.MuiAccordion-root::before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#A6A6A6" }} />}>
                <Typography sx={{ fontWeight: "400" }}>История изменений</Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: isMobile ? "#F2F2F2" : "#E5E5E5",
                  p: "12px 0 0 0",
                }}
              >
                <Grid
                  container
                  spacing={3}
                >
                  {isMobile ? (
                    itemHist?.map((it, key) => (
                      <Grid
                        size={{ xs: 12, sm: 6 }}
                        key={key}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", mb: "12px" }}>
                          <Box
                            sx={{
                              backgroundColor: "#fff",
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: "12px",
                              mb: "12px",
                              border: "1px solid #E5E5E5",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: "8px 12px",
                                borderBottom: "1px solid #E5E5E5",
                              }}
                            >
                              <span style={{ color: "#666666", fontWeight: "500" }}>
                                № {key + 1}
                              </span>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: "8px 12px",
                              }}
                            >
                              <span style={{ color: "#666666", fontWeight: "500" }}>
                                Дата создания
                              </span>
                              <span style={{ color: "#666666", fontWeight: "400" }}>
                                {it.date_create}
                              </span>
                            </Box>
                            <Box
                              sx={{
                                display: it.date_update !== "0000-00-00" ? "flex" : "none",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: "8px 12px",
                              }}
                            >
                              <span style={{ color: "#666666", fontWeight: "500" }}>
                                Дата редактирования/удаления
                              </span>
                              <span style={{ color: "#666666", fontWeight: "400" }}>
                                {it.date_update === "0000-00-00" ? "" : it.date_update}
                              </span>
                            </Box>
                            <Box
                              sx={{
                                display: parseInt(it.time_update) ? "flex" : "none",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: "8px 12px",
                              }}
                            >
                              <span style={{ color: "#666666", fontWeight: "500" }}>
                                Время редактирования/удаления
                              </span>
                              <span style={{ color: "#666666", fontWeight: "400" }}>
                                {parseInt(it.time_update) ? it.time_update : ""}
                              </span>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: "8px 12px",
                              }}
                            >
                              <span style={{ color: "#666666", fontWeight: "500" }}>Редактор</span>
                              <span style={{ color: "#666666", fontWeight: "400" }}>
                                {it.user_update ?? it.user_create}
                              </span>
                            </Box>
                          </Box>
                          <Button
                            onClick={() => this.openModalHistoryView(key, itemHist)}
                            sx={{
                              backgroundColor: "#fff",
                              borderRadius: "12px",
                              height: "48px",
                              border: "1px solid #2F7D33",
                              color: "#2F7D33",
                            }}
                          >
                            Посмотреть
                          </Button>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: "#F3F3F3 !important" }}>
                          <TableRow sx={{ backgroundColor: "#F3F3F3 !important" }}>
                            <TableCell
                              sx={{
                                backgroundColor: "#F3F3F3 !important",
                                borderRadius: "8px 0 0 0",
                                p: "12px",
                              }}
                            >
                              Номер
                            </TableCell>
                            <TableCell
                              sx={{
                                backgroundColor: "#F3F3F3 !important",
                                borderRadius: "8px 0 0 0",
                                p: "12px",
                              }}
                            >
                              Дата создания
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F3F3F3 !important", p: "12px" }}>
                              Дата редактирования / удаления
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F3F3F3 !important", p: "12px" }}>
                              Время редактирования / удаления
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F3F3F3 !important", p: "12px" }}>
                              Редактор
                            </TableCell>
                            <TableCell
                              sx={{
                                backgroundColor: "#F3F3F3 !important",
                                borderRadius: "0 8px 0 0",
                                p: "12px",
                              }}
                            >
                              Просмотр
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {itemHist.map((it, k) => (
                            <TableRow
                              hover
                              key={k}
                              sx={{ borderTop: "8px solid #E5E5E5" }}
                            >
                              <TableCell
                                sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                              >
                                {k + 1}
                              </TableCell>
                              <TableCell
                                sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                              >
                                {it.date_create}
                              </TableCell>
                              <TableCell
                                sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                              >
                                {it.date_update === "0000-00-00" ? "" : it.date_update}
                              </TableCell>
                              <TableCell
                                sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                              >
                                {parseInt(it.time_update) ? it.time_update : ""}
                              </TableCell>
                              <TableCell
                                sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                              >
                                {it.user_update ?? it.user_create}
                              </TableCell>
                              <TableCell
                                sx={{ backgroundColor: "#FFF !important", mt: "8px", p: "12px" }}
                              >
                                <Button
                                  onClick={() => this.openModalHistoryView(k, itemHist)}
                                  sx={{
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
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </div>
    );
  }
}

export default function WriteOffJournalView(props) {
  const router = useRouter();
  return (
    <WriteOffJournalViewPage
      {...props}
      router={router}
    />
  );
}

export async function getServerSideProps({ req, res, params }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");

  return {
    props: {
      cityId: params.cityId,
      writeOffId: params.writeOffId,
    },
  };
}
