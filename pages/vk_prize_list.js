import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import PropTypes from "prop-types";
import Box from "@mui/material/Box";

import { MyDatePickerNew, MyTextInput } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import Button from "@mui/material/Button";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import Stack from "@mui/material/Stack";
import { Pagination } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const DebouncedInput = ({ onChange, delay = 300, ...props }) => {
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  // <TextField
  //     {...props}
  //     value={inputValue}
  //     onChange={handleChange}
  //   />

  return (
    <Grid
      size={{
        xs: 12,
        sm: 4,
      }}
    >
      <MyTextInput
        {...props}
        label={props.label}
        value={inputValue}
        func={handleChange}
      />
    </Grid>
  );
};

class VkPrizeList_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "vk_prize_list",
      module_name: "",
      is_load: false,
      dateFrom: formatDate(new Date()),
      dateTo: formatDate(new Date()),
      items: [],
      item: {},
      points: [],
      point_id: "",
      currentPage: 1,
      itemsPerPage: 10,
      openAlert: false,
      err_status: true,
      err_text: "",
      confirmDialog: false,
    };
  }

  async componentDidMount() {
    let res = await this.getData("get_all");

    this.setState({
      module_name: res.module_info.name,
      points: res.points,
      point_id: res.points[0]["id"],
    });

    document.title = res.module_info.name;
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

  getList = async () => {
    const { dateFrom, dateTo } = this.state;
    const data = {
      start_date: dateFrom.toISOString().split("T")[0],
      end_date: dateTo.toISOString().split("T")[0],
    };
    let res = await this.getData("get_data", data);
    this.setState({
      items: res.all_items,
    });
  };

  getListBySearch = async (search) => {
    const { dateFrom, dateTo } = this.state;
    const data = {
      start_date: dateFrom.toISOString().split("T")[0],
      end_date: dateTo.toISOString().split("T")[0],
      search,
    };
    let res = await this.getData("get_data", data);
    this.setState({
      items: res.all_items,
    });
  };

  changeDate = async (e, state) => {
    this.setState({
      [state]: formatDate(e),
    });
  };

  handlePageChange = (event, page) => {
    this.setState({
      currentPage: page,
    });
  };

  CopyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    this.setState({
      openAlert: true,
      err_status: true,
      err_text: "Текст скопирован",
    });
  };

  delete = async (item) => {
    const data = {
      itemId: item.id,
    };
    let res = await this.getData("del", data);
    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        confirmDialog: false,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        confirmDialog: false,
      });
    }
  };

  openDeleteDialog = (item) => {
    this.setState({
      item,
      confirmDialog: true,
    });
  };

  render() {
    const { items, currentPage, itemsPerPage, item } = this.state;

    // Вычисляем элементы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
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
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Точно удалить данный приз?
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button onClick={() => this.delete(item)}>Ok</Button>
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
            <MyDatePickerNew
              label="Дата от"
              value={this.state.dateFrom}
              func={(e) => this.changeDate(e, "dateFrom")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Дата до"
              value={this.state.dateTo}
              func={(e) => this.changeDate(e, "dateTo")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Button
              variant="contained"
              onClick={this.getList}
            >
              Показать
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <DebouncedInput
              label="Поиск по имени"
              variant="outlined"
              onChange={this.getListBySearch}
              delay={500}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "20%" }}>Имя</TableCell>
                  <TableCell style={{ width: "65%" }}>Текстовка приза</TableCell>
                  <TableCell style={{ width: "5%" }}>Статус</TableCell>
                  <TableCell style={{ width: "5%" }}></TableCell>
                  <TableCell style={{ width: "5%" }}></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {currentItems.map((value, key) => (
                  <TableRow key={value.id}>
                    <TableCell>{value.first_name}</TableCell>
                    <TableCell>
                      <pre style={{ maxWidth: "700px", whiteSpace: "break-spaces" }}>
                        {value.prize}
                      </pre>
                    </TableCell>
                    <TableCell>
                      {value.status ? (
                        <CheckIcon style={{ color: "green" }} />
                      ) : (
                        <ClearIcon style={{ color: "red" }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => this.CopyToClipboard(value.prize)}>
                        <ContentCopyIcon style={{ color: "blue" }} />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {!value.status ? (
                        <IconButton onClick={() => this.openDeleteDialog(value)}>
                          <DeleteIcon style={{ color: "red" }} />
                        </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {items.length > itemsPerPage && (
              <Stack
                spacing={3}
                sx={{
                  mt: 3,
                  mb: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pagination
                  count={Math.ceil(items.length / itemsPerPage)}
                  page={currentPage}
                  onChange={this.handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function VkPrizeList() {
  return <VkPrizeList_ />;
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
