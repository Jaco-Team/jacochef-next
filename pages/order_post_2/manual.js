import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyAutocomplite2, MyTextInput } from "@/ui/Forms";

import queryString from "query-string";
import MyAlert from "@/ui/MyAlert";

// Модальные окна
class OrderPost2Manual_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.items) {
      return;
    }

    if (this.props.items !== prevProps.items) {
      this.setState({
        items: this.props.items,
      });
    }
  }

  changeItem(id, event) {
    const items = this.state.items;

    items.forEach((item) => {
      if (item.vendor_id === id) {
        item.comment = event.target.value;
      }
    });

    this.setState({
      items,
    });
  }

  saveOrderPost() {
    const items = this.state.items;

    const vendors = items.reduce(
      (newVendors, vendor) =>
        (newVendors = [
          ...newVendors,
          ...[{ vendor_id: vendor.vendor_id, comment: vendor.comment }],
        ]),
      [],
    );

    this.props.saveOrderPost(vendors);

    this.onClose();
  }

  onClose() {
    this.setState({
      items: [],
    });

    this.props.onClose();
  }

  render() {
    return (
      <>
        <Dialog
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={"xl"}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: "bold" }}>{this.props.method}</Typography>
            {this.props.fullScreen ? (
              <IconButton
                onClick={this.onClose.bind(this)}
                style={{ cursor: "pointer" }}
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>

          <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TableContainer>
                <Table>
                  <TableBody>
                    {this.state.items.map((vendor, key) => (
                      <React.Fragment key={key}>
                        <TableRow sx={{ "& td": { border: 0 } }}>
                          <TableCell
                            colSpan={5}
                            sx={{ fontWeight: 700 }}
                          >
                            {vendor.vendor_name}
                          </TableCell>
                        </TableRow>

                        <TableRow sx={{ "& td": { border: 0 } }}>
                          {this.props.type === "min" ? (
                            <TableCell colSpan={5}>
                              Минимальная сумма заявки:{" "}
                              <span style={{ color: "#DC143C" }}>{vendor.min_price}</span>. Cумма
                              заявки: <span style={{ color: "#DC143C" }}>{vendor.allPrice}</span>
                            </TableCell>
                          ) : null}
                        </TableRow>

                        <TableRow>
                          <TableCell style={{ width: "40%" }}>Позиция</TableCell>
                          <TableCell style={{ width: "15%" }}>Объем упаковки</TableCell>
                          <TableCell style={{ width: "15%" }}>Количество упаковок</TableCell>
                          <TableCell style={{ width: "15%" }}>Количество</TableCell>
                          <TableCell style={{ width: "15%" }}>Сумма</TableCell>
                        </TableRow>
                        {vendor.items.map((item, key_item) => (
                          <TableRow
                            key={key_item}
                            style={{
                              backgroundColor: this.props.type === "max" ? "#ffc107" : "#f5f5f5",
                            }}
                          >
                            <TableCell>{item?.choose_item_name ?? item.rec_item_name}</TableCell>
                            <TableCell>
                              {item.rec_pq} {item.ei_name}
                            </TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>{item.all_count}</TableCell>
                            <TableCell>{item.price}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ "& td": { border: 0 } }}>
                          <TableCell
                            colSpan={4}
                            sx={{ fontWeight: 700 }}
                          >
                            Примерная сумма
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{vendor.allPrice}</TableCell>
                        </TableRow>
                        <TableRow sx={{ "& td": { border: 0 } }}>
                          {this.props.type === "max" ? (
                            <TableCell colSpan={5}>
                              <MyTextInput
                                label="Комментарий поставщику"
                                multiline={true}
                                maxRows={5}
                                value={vendor.comment}
                                func={this.changeItem.bind(this, vendor.vendor_id)}
                              />
                            </TableCell>
                          ) : null}
                        </TableRow>
                        {this.state.items.at(-1) === vendor ? null : (
                          <TableRow sx={{ "& td": { border: 0 } }}>
                            <TableCell colSpan={5}></TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                    <TableRow sx={{ "& td": { border: 0 } }}>
                      <TableCell
                        colSpan={5}
                        sx={{ fontWeight: 700 }}
                      >
                        Общая примерная стоимость заказа: {this.props.allPriceOrder}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </DialogContent>

          <DialogActions className={this.props.type === "max" ? "button" : null}>
            {this.props.type === "max" ? (
              <>
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#00a550", whiteSpace: "nowrap" }}
                  onClick={this.saveOrderPost.bind(this)}
                >
                  Отправить
                </Button>
                <Button
                  variant="contained"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={this.onClose.bind(this)}
                >
                  Отмена
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={this.onClose.bind(this)}
              >
                Закрыть
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

// Строки таблицы
class OrderPost2Manual_ListItem extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.item?.count !== this.props.item?.count ||
      nextProps.item?.rec_vendor_id !== this.props.item?.rec_vendor_id ||
      this.props.item?.choose_item_id !== nextProps.item?.choose_item_id ||
      this.props.item?.choose_vendor_id !== nextProps.item?.choose_vendor_id
    );
  }

  render() {
    const { item, changeSelectItem, changeCountItem } = this.props;
    console.log("item render");
    return (
      <TableRow hover>
        <TableCell>
          {item.items.length < 2 ? (
            item.items[0].name
          ) : (
            <MySelect
              is_none={false}
              data={item.items}
              value={item.choose_item_id}
              func={(event) => changeSelectItem(event, "item", item.id, 0)}
            />
          )}
        </TableCell>
        <TableCell>{item.ost}</TableCell>
        <TableCell>{item.avg_ras}</TableCell>
        <TableCell>
          {item.rec_pq} {item.ei_name}
        </TableCell>
        <TableCell style={{ minWidth: "100px" }}>
          <MyTextInput
            value={item?.count ?? ""}
            func={(event) => changeCountItem(event, item.id)}
          />
        </TableCell>
        <TableCell align="center">
          {item?.all_count ?? 0} {item.ei_name}
        </TableCell>
        <TableCell>
          {item.items.map((it, key_it) =>
            it.id === item.choose_item_id ? (
              it.vendors.length > 1 ? (
                <React.Fragment key={key_it}>
                  <MySelect
                    is_none={false}
                    data={it.vendors}
                    value={item.choose_vendor_id}
                    func={(event) =>
                      changeSelectItem(event, "vendor", item.id, item.choose_item_id)
                    }
                  />
                </React.Fragment>
              ) : (
                it.vendors[0].name
              )
            ) : null,
          )}
        </TableCell>
      </TableRow>
    );
  }
}

// Таблица
class OrderPost2Manual_List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cats: [],
      search: "",
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log(nextProps);

    if (!nextProps.cats) {
      return null;
    }

    if (nextProps.cats !== prevState.cats) {
      if (prevState.search) {
        const search = prevState.search;

        const catsCopy = JSON.parse(JSON.stringify(nextProps.cats));

        const cats = catsCopy.reduce((cats, cat) => {
          cat.items = cat.items.filter((item) => (search ? item.rec_item_name === search : item));

          if (cat.items.length !== 0) {
            cats.push(cat);
          }
          return cats;
        }, []);

        return { cats };
      } else {
        return { cats: JSON.parse(JSON.stringify(nextProps.cats)) };
      }
    }

    return null;
  }

  search(event, value) {
    const search = event.target.value ? event.target.value : value ? value : "";

    const catsCopy = this.state.cats;

    const cats = catsCopy.reduce((cats, cat) => {
      cat.items = cat.items.filter((item) => (search ? item.rec_item_name === search : item));

      if (cat.items.length !== 0) {
        cats.push(cat);
      }
      return cats;
    }, []);

    this.setState({
      cats,
      search,
    });
  }

  render() {
    console.log("OrderPost2_List render");

    return (
      <>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite2
            label="Поиск"
            freeSolo={true}
            multiple={false}
            data={this.props.data}
            value={this.state.search}
            func={this.search.bind(this)}
            onBlur={this.search.bind(this)}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={this.props.sortOrderPost.bind(this)}
            sx={{ whiteSpace: "nowrap" }}
          >
            Сохранить заявку
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
              <TableBody>
                {this.state.cats.map((cat, key) => (
                  <React.Fragment key={key}>
                    <TableRow key={key}>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ fontWeight: 700 }}
                      >
                        {cat.name.toUpperCase()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ width: "20%" }}>Товар</TableCell>
                      <TableCell style={{ width: "8%" }}>Остаток</TableCell>
                      <TableCell style={{ width: "14%" }}>Ср.расх. за 7 дней</TableCell>
                      <TableCell style={{ width: "10%" }}>Объем упаковки</TableCell>
                      <TableCell style={{ width: "18%" }}>Заявка</TableCell>
                      <TableCell
                        style={{ width: "10%" }}
                        align="center"
                      >
                        Количество
                      </TableCell>
                      <TableCell style={{ width: "20%" }}>Поставщик</TableCell>
                    </TableRow>
                    {cat.items.map((item, key_item) => (
                      <OrderPost2Manual_ListItem
                        key={key_item}
                        item={item}
                        changeSelectItem={this.props.changeSelectItem.bind(this)}
                        changeCountItem={this.props.changeCountItem.bind(this)}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </>
    );
  }
}

class OrderPost2Manual_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "order_post_2",
      module_name: "",
      is_load: false,

      points: [],
      point: "",

      search: "",

      all_items: [],
      cats: [],
      items_price: [],
      vendors: [],

      modalDialog: false,
      items: null,
      method: "",
      type: "",
      fullScreen: false,
      allPriceOrder: null,

      openAlert: false,
      err_status: true,
      err_text: "",

      modalConfirm: false,
      title: "",
      description: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getPointList();
    }, 300);
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch("https://jacochef.ru/api/index_new.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem("token"),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == "redir") {
          window.location.pathname = "/";
          return;
        }

        if (json.st === false && json.type == "auth") {
          window.location.pathname = "/auth";
          return;
        }

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        console.log(err);
      });
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

  async getPointList() {
    let { points } = await this.getData("get_point_list");

    this.setState({
      points,
      point: points[0].id,
    });

    setTimeout(() => {
      this.getDataTable();
    }, 300);
  }

  changePoint(event) {
    this.setState({
      point: event.target.value,
      search: "",
      all_items: [],
      cats: [],
    });

    setTimeout(() => {
      this.getDataTable();
    }, 300);
  }

  async getDataTable() {
    const point_id = this.state.point;

    const data = {
      point_id,
    };

    const res = await this.getData("get_handle", data);

    // console.log(res);

    this.setState({
      cats: this.checkColorRec(res.cats),
      all_items: this.getAllItems(res.cats),
      vendors: this.getAllVendors(res.cats, res.this_my_vendors),
      items_price: res.new_items_price,
    });
  }

  getAllItems(cats) {
    let all_items = [];

    cats.forEach((cat) => {
      cat.items.forEach((item) => {
        item.items.forEach((it) => {
          all_items.push({ name: it.name });
        });
      });
    });

    return all_items;
  }

  getAllVendors(cats, vendors) {
    let all_vendors = [];

    cats.forEach((cat) => {
      cat.items.forEach((item) => {
        item.items.forEach((it) => {
          it.vendors.forEach((vendor) => {
            all_vendors.push({ vendor_name: vendor.name, vendor_id: vendor.id, min_price: "0" });
          });
        });
      });
    });

    const vendorsPrice = [...vendors, ...all_vendors];

    const allNewVendors = vendorsPrice.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) => t.vendor_id === value.vendor_id && t.vendor_name === value.vendor_name,
        ),
    );

    return allNewVendors;
  }

  checkColorRec(cats) {
    cats.forEach((cat) => {
      cat.items.forEach((item) => {
        item.items.forEach((it) => {
          it.color = null;

          it.vendors.forEach((vendor) => {
            vendor.color = null;
          });
        });
      });
    });

    cats.forEach((cat) => {
      cat.items.forEach((item) => {
        item.items.forEach((it) => {
          if (item.rec_item_id === it.id) {
            it.color = "#388e3c";
          }

          it.vendors.forEach((vendor) => {
            if (item.rec_vendor_id === vendor.id) {
              vendor.color = "#388e3c";
            }
          });
        });
      });
    });

    return cats;
  }

  changeSelectItem(event, type, id, item_id) {
    const cats = this.state.cats;

    if (type === "item") {
      cats.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.id === id) {
            const itemNew = item.items.find((it) => it.id === event.target.value);

            item.choose_item_id = itemNew.id;
            item.choose_item_name = itemNew.name;

            //item.rec_item_id = itemNew.id;
            //item.rec_item_name = itemNew.name;
            //item.rec_vendor_id = itemNew.vendors[0].id;
            //item.rec_vendor_name = itemNew.vendors[0].name;
          }
        });
      });
    }

    if (type === "vendor") {
      cats.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.id === id) {
            const itemNew = item.items
              .find((it) => it.id === item_id)
              .vendors.find((vendor) => vendor.id === event.target.value);
            item.choose_vendor_id = itemNew.id;

            //item.rec_vendor_id = itemNew.id;
            //item.rec_vendor_name = itemNew.name;
          }
        });
      });
    }

    this.setState({
      cats: this.checkColorRec(cats),
    });
  }

  changeCountItem(event, id) {
    const cats = this.state.cats;
    const items_price = this.state.items_price;

    cats.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.id === id) {
          item.all_count = parseFloat(item.rec_pq) * parseFloat(event.target.value);
          item.count = parseFloat(event.target.value);
          const price = items_price.find(
            (vendor) =>
              vendor.vendor_id === item.choose_vendor_id && vendor.item_id === item.choose_item_id,
          );
          item.price = price ? price.price * item.all_count : 0;
        }
      });
    });

    this.setState({
      cats,
    });
  }

  sortOrderPost() {
    this.handleResize();

    const cats = JSON.parse(JSON.stringify(this.state.cats));

    const vendors = this.state.vendors;

    let allPriceOrder = 0;

    const vendorsItems = vendors.reduce((vendors, vendor) => {
      vendor.allPrice = 0;
      vendor.comment = "";
      vendor.items = [];

      cats.forEach((cat) => {
        cat.items.forEach((item) => {
          if (vendor.vendor_id === item.choose_vendor_id && item.price >= 0) {
            vendor.allPrice += item.price;
            vendor.items.push(item);
          }
        });
      });

      allPriceOrder += vendor.allPrice;

      if (vendor.items.length) {
        vendors.push(vendor);
      }

      return vendors;
    }, []);

    // console.log(vendorsItems);

    const vendorsLessMinPrice = vendorsItems.filter(
      (vendor) => parseFloat(vendor.allPrice) < parseFloat(vendor.min_price) && vendor.items.length,
    );

    // console.log(vendorsLessMinPrice);

    if (vendorsLessMinPrice.length) {
      this.setState({
        items: vendorsLessMinPrice,
        modalDialog: true,
        method: "Минимальная сумма заявки не набрана",
        type: "min",
        allPriceOrder,
      });
    } else {
      if (vendorsItems.length) {
        this.setState({
          items: vendorsItems,
          modalDialog: true,
          method: "Подтверждение заявки",
          type: "max",
          allPriceOrder,
        });
      } else {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "В заказе отсутствуют товары!",
        });
      }
    }
  }

  async saveOrderPost(vendors) {
    const cats = JSON.parse(JSON.stringify(this.state.cats));

    const point_id = this.state.point;

    const items = cats.reduce((items, cat) => {
      cat.items = cat.items.reduce(
        (newItem, item) =>
          (newItem = [
            ...newItem,
            ...[
              {
                choose_item_id: item.choose_item_id,
                choose_vendor_id: item.choose_vendor_id,
                rec_pq: item.rec_pq,
                percent: item.percent,
                all_count: item?.all_count ?? 0,
                count: item?.count ?? 0,
                price: item?.price ?? 0,
              },
            ],
          ]),
        [],
      );

      return (items = [...items, ...cat.items]);
    }, []);

    const data = {
      items,
      point_id,
      vendors,
    };

    // console.log(data);

    const res = await this.getData("save_hanlde", data);

    // console.log(res);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: "Заявка успешно сохранена!",
      });

      setTimeout(() => {
        this.getDataTable();
      }, 300);
    } else {
      this.setState({
        modalConfirm: true,
        title: res.title,
        description: res.description,
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
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <OrderPost2Manual_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          items={this.state.items}
          fullScreen={this.state.fullScreen}
          type={this.state.type}
          method={this.state.method}
          allPriceOrder={this.state.allPriceOrder}
          saveOrderPost={this.saveOrderPost.bind(this)}
        />
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.modalConfirm}
          onClose={() => this.setState({ modalConfirm: false })}
        >
          <DialogTitle
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            {this.state.title}
          </DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            {this.state.description}
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ modalConfirm: false })}
            >
              Закрыть
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
            <h1>Ручная заявка поставщикам New</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MySelect
              label="Точка"
              is_none={false}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
            />
          </Grid>

          <OrderPost2Manual_List
            cats={this.state.cats}
            changeSelectItem={this.changeSelectItem.bind(this)}
            changeCountItem={this.changeCountItem.bind(this)}
            sortOrderPost={this.sortOrderPost.bind(this)}
            data={this.state.all_items}
          />
        </Grid>
      </>
    );
  }
}

export default function OrderPost2Manual() {
  return <OrderPost2Manual_ />;
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
