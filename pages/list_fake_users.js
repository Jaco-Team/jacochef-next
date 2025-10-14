import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import DownloadIcon from "@mui/icons-material/Download";

import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { MyCheckBox, MyAutocomplite, MyDatePickerNew, MyTextInput, TextEditor22 } from "@/ui/Forms";

import queryString from "query-string";

import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";
import { Close } from "@mui/icons-material";

// class ListFakeUsers_Modal extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       item: {},
//     };
//   }

//   componentDidUpdate(prevProps) {
//     // console.log(this.props.event);

//     if (!this.props.event) {
//       return;
//     }

//     if (this.props.event !== prevProps.event) {
//       this.setState({
//         item: this.props.event,
//       });
//     }
//   }

//   onClose() {
//     this.setState({
//       item: this.props.event ? this.props.event : {},
//     });

//     this.props.onClose();
//   }

//   render() {
//     return (
//       <Dialog
//         open={this.props.open}
//         onClose={this.onClose.bind(this)}
//         fullScreen={this.props.fullScreen}
//         fullWidth={true}
//         maxWidth={'lg'}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle className="button">
//           <Typography style={{ fontWeight: 'bold' }}>Информация о клиенте</Typography>
//           {this.props.fullScreen ? (
//             <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
//               <CloseIcon />
//             </IconButton>
//           ) : null}
//         </DialogTitle>

//         <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
//           <Grid container spacing={3} justifyContent="center" mb={3}>

//             <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Имя</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap'}}>
//                 {this.state.item ? this.state.item.name !== '0' ? this.state.item.name : 'не указано' : 'не указано'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Регистрация</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.date_reg ? this.state.item.date_reg : 'не указано' : 'не указано'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>День рождения</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.date_bir ? this.state.item.date_bir : 'не указано' : 'не указано'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Согласие на рассылку</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.spam === '0' ? 'нет' : 'есть' : 'нет'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Общее количество заказов</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.all_count_order : '0'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Количество заказов на доставку</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.count_dev : '0'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Количество заказов на самовывоз</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.count_pic : '0'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Переодичность заказов</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.order_per_day : '0'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Первый промик после регистрации</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.promo_name !== '' ? this.state.item.promo_name : 'не было' : 'не было'}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
//               <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Есть ошибки в заказах</Typography>
//               <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
//                 {this.state.item ? this.state.item.error_exsist !== '' ? 'Да' : 'Нет' : ''}
//               </Typography>
//             </Grid>
//           </Grid>

//           {/* аккордион */}
//           {!this.state.item.orders ? null : (
//             <Grid item xs={12} sm={4} mb={3}>
//               <Accordion>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
//                   <Typography style={{ fontWeight: 'bold' }}>Заказы</Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   {this.props.fullScreen ? null : (
//                     <Accordion expanded={true}>
//                       <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ opacity: 0 }} />} aria-controls="panel1a-content">
//                         <Grid item xs display="flex" flexDirection="row">
//                           <Typography style={{ width: '15%' }} noWrap>Номер</Typography>
//                           <Typography style={{ width: '25%' }} noWrap>Дата/время</Typography>
//                           <Typography style={{ width: '20%' }} noWrap>Точка</Typography>
//                           <Typography style={{ width: '10%' }} noWrap>Сумма</Typography>
//                           <Typography style={{ width: '15%' }} noWrap>Промик</Typography>
//                           <Typography style={{ width: '15%' }} noWrap>Тип</Typography>
//                           <Typography style={{ width: '15%' }} noWrap>Ошибка заказа</Typography>
//                         </Grid>
//                       </AccordionSummary>
//                     </Accordion>
//                   )}
//                   {this.state.item.orders.map((item, i) => (
//                     <Accordion key={i}>
//                       <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">

//                         <Grid item xs display="flex" sx={{ flexDirection: { sm: 'row', xs: 'column' } }}>

//                           <Typography style={{ width: '15%' }} sx={{ noWrap: { sm: true, xs: false }, whiteSpace: { xs: 'nowrap' } }}>
//                             {this.props.fullScreen ? `Номер: ${item.order_id}` : item.order_id}
//                           </Typography>

//                           <Typography style={{ width: '25%' }} sx={{ noWrap: { sm: true, xs: false }, whiteSpace: { xs: 'nowrap' } }}>
//                             {this.props.fullScreen ? `Дата: ${item.date}/${item.time}` : `${item.date}/${item.time}`}
//                           </Typography>

//                           <Typography style={{ width: '20%' }} sx={{ noWrap: { sm: true, xs: false }, whiteSpace: { xs: 'nowrap' } }}>
//                             {this.props.fullScreen ? `Точка: ${item.addr}` : item.addr}
//                           </Typography>

//                           <Typography style={{ width: '10%' }} sx={{ noWrap: { sm: true, xs: false }, whiteSpace: { xs: 'nowrap' } }}>
//                             {this.props.fullScreen ? `Сумма: ${item.summ}` : item.summ}
//                           </Typography>

//                           <Typography style={{ width: '15%' }} sx={{ noWrap: { sm: true, xs: false }, whiteSpace: { xs: 'nowrap' } }}>
//                             {this.props.fullScreen ? `Промик: ${item.promo_name ?? 'Нет'}` : item.promo_name ?? 'Нет'}
//                           </Typography>

//                           <Typography style={{ width: '15%' }} sx={{ noWrap: { sm: true, xs: false }, whiteSpace: { xs: 'nowrap' } }}>
//                             {this.props.fullScreen ? `Тип: ${item.xy === '' ? 'Самовывоз' : 'Доставка'}` : item.xy === '' ? 'Самовывоз' : 'Доставка'}
//                           </Typography>

//                           <Typography style={{ width: '15%', overflow: 'hidden' }}>
//                             {item.order_desc != '' ? item.order_desc : ''}
//                           </Typography>

//                         </Grid>

//                       </AccordionSummary>
//                       <AccordionDetails style={{ width: '100%', overflow: 'scroll' }}>
//                         <Table>
//                           <TableHead>
//                             <TableRow>
//                               <TableCell>Наименование</TableCell>
//                               <TableCell>Количество</TableCell>
//                             </TableRow>
//                           </TableHead>

//                           <TableBody>
//                             {!item.items ? null : item.items.map((it, key) => (
//                               <TableRow key={key}>
//                                 <TableCell>{it.name}</TableCell>
//                                 <TableCell>{it.count}</TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </AccordionDetails>
//                     </Accordion>
//                   ))}
//                 </AccordionDetails>
//               </Accordion>
//             </Grid>
//           )}
//         </DialogContent>

//         <DialogActions>
//           <Button style={{ color: '#DC143C' }} onClick={this.onClose.bind(this)}>
//             Закрыть
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   }
// }

class ListFakeUsers_Modal_Action extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showOrder: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.showOrder);

    if (!this.props.showOrder) {
      return;
    }

    if (this.props.showOrder !== prevProps.showOrder) {
      this.setState({
        showOrder: this.props.showOrder,
      });
    }
  }

  onClose() {
    this.setState({
      showOrder: null,
    });

    this.props.onClose();
  }

  render() {
    const {
      open,
      fullScreen,
      saveCommentAction,
      raiting,
      myRef_action,
      type_sale,
      setRaiting,
      setTypeSale,
    } = this.props;

    return (
      <Dialog
        open={open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={"lg"}
        fullScreen={fullScreen}
      >
        <DialogTitle>
          Описание ситуации
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 10 }}>
          <Grid
            style={{ justifyContent: "center", display: "flex", marginBottom: 20 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <ToggleButtonGroup
              value={raiting}
              exclusive
              size="small"
              onChange={(event, data) => setRaiting(data)}
            >
              <ToggleButton
                value="1"
                style={{
                  backgroundColor: parseInt(raiting) == 1 ? "#dd1a32" : "#fff",
                  borderRightWidth: 2,
                }}
              >
                <span
                  style={{ color: parseInt(raiting) == 1 ? "#fff" : "#333", padding: "0 20px" }}
                >
                  Положительный отзыв
                </span>
              </ToggleButton>
              <ToggleButton
                value="2"
                style={{
                  backgroundColor: parseInt(raiting) == 2 ? "#dd1a32" : "#fff",
                  borderRightWidth: 2,
                }}
              >
                <span
                  style={{ color: parseInt(raiting) == 2 ? "#fff" : "#333", padding: "0 20px" }}
                >
                  Средний отзыв
                </span>
              </ToggleButton>
              <ToggleButton
                value="3"
                style={{ backgroundColor: parseInt(raiting) == 3 ? "#dd1a32" : "#fff" }}
              >
                <span
                  style={{ color: parseInt(raiting) == 3 ? "#fff" : "#333", padding: "0 20px" }}
                >
                  Отрицательный отзыв
                </span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid
            style={{ justifyContent: "center", display: "flex", marginBottom: 20 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <ToggleButtonGroup
              value={type_sale}
              exclusive
              size="small"
              onChange={(event, data) => setTypeSale(data)}
            >
              <ToggleButton
                value="10"
                style={{
                  backgroundColor: parseInt(type_sale) == 10 ? "#dd1a32" : "#fff",
                  borderRightWidth: 2,
                }}
              >
                <span
                  style={{ color: parseInt(type_sale) == 10 ? "#fff" : "#333", padding: "0 20px" }}
                >
                  Скидка 10%
                </span>
              </ToggleButton>
              <ToggleButton
                value="20"
                style={{ backgroundColor: parseInt(type_sale) == 20 ? "#dd1a32" : "#fff" }}
              >
                <span
                  style={{ color: parseInt(type_sale) == 20 ? "#fff" : "#333", padding: "0 20px" }}
                >
                  Скидка 20%
                </span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TextEditor22
              id="EditorNew"
              value={""}
              refs_={myRef_action}
              toolbar={true}
              menubar={true}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={saveCommentAction.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class ListFakeUsers_Modal_Order extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showOrder: null,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.showOrder);

    if (!this.props.showOrder) {
      return;
    }

    if (this.props.showOrder !== prevProps.showOrder) {
      this.setState({
        showOrder: this.props.showOrder,
      });
    }
  }

  onClose() {
    this.setState({
      showOrder: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        onClose={this.onClose.bind(this)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={"md"}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold", alignSelf: "center" }}>
            Заказ #{this.state.showOrder?.order?.order_id}
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            spacing={0}
          >
            <Grid
              size={{
                xs: 12,
              }}
            >
              <span>
                {this.state.showOrder?.order?.type_order}:{" "}
                {this.state.showOrder?.order?.type_order_addr_new}
              </span>
            </Grid>

            {parseInt(this.state.showOrder?.order?.type_order_) == 1 ? (
              parseInt(this.state.showOrder?.order?.fake_dom) == 0 ? (
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <b style={{ color: "red", fontWeight: 900 }}>Домофон не работает</b>
                </Grid>
              ) : (
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <b style={{ color: "green", fontWeight: 900 }}>Домофон работает</b>
                </Grid>
              )
            ) : null}
            <Grid
              size={{
                xs: 12,
              }}
            >
              <span>
                {this.state.showOrder?.order?.time_order_name}:{" "}
                {this.state.showOrder?.order?.time_order}
              </span>
            </Grid>

            {this.state.showOrder?.order?.number?.length > 1 ? (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b>Телефон: </b>
                <span>{this.state.showOrder?.order?.number}</span>
              </Grid>
            ) : null}

            {this.state.showOrder?.order?.delete_reason?.length > 0 ? (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <span style={{ color: "red" }}>
                  Удален: {this.state.showOrder?.order?.date_time_delete}
                </span>
              </Grid>
            ) : null}
            {this.state.showOrder?.order?.delete_reason?.length > 0 ? (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <span style={{ color: "red" }}>{this.state.showOrder?.order?.delete_reason}</span>
              </Grid>
            ) : null}

            {parseInt(this.state.showOrder?.order?.is_preorder) == 1 ? null : (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <span>
                  {"Обещали: " + this.state.showOrder?.order?.time_to_client + " / "}
                  {this.state.showOrder?.order?.text_time}
                  {this.state.showOrder?.order?.time}
                </span>
              </Grid>
            )}

            {this.state.showOrder?.order?.promo_name == null ||
            this.state.showOrder?.order?.promo_name?.length == 0 ? null : (
              <>
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <b>Промокод: </b>
                  <span>{this.state.showOrder?.order?.promo_name}</span>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <span className="noSpace">{this.state.showOrder?.order?.promo_text}</span>
                </Grid>
              </>
            )}

            {this.state.showOrder?.order?.comment == null ||
            this.state.showOrder?.order?.comment.length == 0 ? null : (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b>Комментарий: </b>
                <span>{this.state.showOrder?.order?.comment}</span>
              </Grid>
            )}

            {this.state.showOrder?.order?.sdacha == null ||
            parseInt(this.state.showOrder?.order?.sdacha) == 0 ? null : (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b>Сдача: </b>
                <span>{this.state.showOrder?.order?.sdacha}</span>
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <b>Сумма заказа: </b>
              <span>{this.state.showOrder?.order?.sum_order} р</span>
            </Grid>

            {this.state.showOrder?.order?.check_pos_drive == null ||
            !this.state.showOrder?.order?.check_pos_drive ? null : (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b>Довоз оформлен: </b>
                <span>{this.state.showOrder?.order?.check_pos_drive?.comment}</span>
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <Table
                size={"small"}
                style={{ marginTop: 15 }}
              >
                <TableBody>
                  {this.state.showOrder?.order_items.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.price} р</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold", color: "#000" }}>
                      Сумма заказа
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#000" }}>
                      {this.state.showOrder?.order?.sum_order} р
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Grid>

            {!this.state.showOrder?.err_order ? null : (
              <Grid
                mt={3}
                size={{
                  xs: 12,
                }}
              >
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography style={{ fontWeight: "bold" }}>Ошибка</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: "20%" }}>Дата создания</TableCell>
                          <TableCell style={{ width: "30%" }}>Проблема</TableCell>
                          <TableCell style={{ width: "30%" }}>Решение</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow hover>
                          <TableCell>{this.state.showOrder?.err_order?.date_time_desc}</TableCell>
                          <TableCell>{this.state.showOrder?.err_order?.order_desc}</TableCell>
                          <TableCell>{this.state.showOrder?.err_order?.text_win}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

class ListFakeUsers_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.user);

    if (!this.props.user) {
      return;
    }

    if (this.props.user !== prevProps.user) {
      this.setState({
        user: this.props.user,
      });
    }
  }

  onClose() {
    this.setState({
      user: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, saveComment, openNumber, orderOpen, myRef, openModalAction } =
      this.props;

    return (
      <Dialog
        open={open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        fullScreen={fullScreen}
        maxWidth={"lg"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold", alignSelf: "center" }}>
            Информация о клиенте
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Grid container>
                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Телефон: </span>
                  <span>{openNumber}</span>
                </Grid>
                <Grid
                  style={{ paddingTop: 12 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Имя: </span>
                  <span>{this.state.user?.info?.name}</span>
                </Grid>
                <Grid
                  style={{ paddingTop: 12 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Регистрация: </span>
                  <span>{this.state.user?.info?.date_reg}</span>
                </Grid>
                <Grid
                  style={{ paddingTop: 12 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>День рождения: </span>
                  <span>{this.state.user?.info?.date_bir}</span>
                </Grid>
                <Grid
                  style={{ paddingTop: 12 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Заказов: </span>
                  <span>
                    {this.state.user?.info?.all_count_order} / {this.state.user?.info?.summ} р.
                  </span>
                </Grid>
                <Grid
                  style={{ paddingTop: 12 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Доставок: </span>
                  <span>
                    {this.state.user?.info?.count_dev} / {this.state.user?.info?.summ_dev} р.
                  </span>
                </Grid>
                <Grid
                  style={{ paddingTop: 12 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Самовывозов: </span>
                  <span>
                    {this.state.user?.info?.count_pic} / {this.state.user?.info?.summ_pic} р.
                  </span>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 8,
              }}
            >
              <Accordion style={{ width: "100%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Заказы</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ maxHeight: 300, overflow: "scroll" }}>
                  <Table>
                    <TableBody>
                      {this.state.user?.orders.map((item, key) => (
                        <TableRow
                          key={key}
                          onClick={orderOpen.bind(this, item.order_id, item.point_id)}
                          hover
                          style={{ cursor: "pointer" }}
                        >
                          <TableCell>{item.point}</TableCell>
                          <TableCell>{item.new_type_order}</TableCell>
                          <TableCell>{item.date_time}</TableCell>
                          <TableCell>#{item.order_id}</TableCell>
                          <TableCell>{item.summ}р.</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              {this.state.user?.comments.map((item, key) => (
                <Paper
                  key={key}
                  style={{ padding: 15, marginBottom: 15 }}
                  elevation={3}
                >
                  <b>{item?.description ? "Обращение:" : "Комментарий:"}</b>
                  <span dangerouslySetInnerHTML={{ __html: item.comment }} />

                  <div
                    style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                  >
                    <div>
                      <span style={{ marginRight: 20 }}>{item.date_add}</span>
                      <span>{item.name}</span>
                    </div>
                  </div>

                  <hr />

                  <b>{item?.description ? "Действие:" : null}</b>

                  <p dangerouslySetInnerHTML={{ __html: item?.description }} />

                  <p>
                    <b>
                      {parseInt(item.raiting) > 0
                        ? parseInt(item.raiting) == 1
                          ? "Положительный отзыв"
                          : parseInt(item.raiting) == 2
                            ? "Средний отзыв"
                            : "Отрицательный отзыв"
                        : ""}
                    </b>
                    {(parseInt(item.raiting) > 0) & (parseInt(item.sale) > 0) ? " / " : ""}
                    <b>{parseInt(item.sale) > 0 ? "Выписана скидка " + item.sale + "%" : ""}</b>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: item?.description ? "flex-end" : "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item?.description ? null : (
                      <>
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={openModalAction.bind(this, item.id)}
                        >
                          Действие
                        </Button>
                      </>
                    )}
                    <div>
                      <span style={{ marginRight: 20 }}>{item.date_time}</span>
                      <span>{item.name_close}</span>
                    </div>
                  </div>
                </Paper>
              ))}
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TextEditor22
                id="EditorNew"
                value={""}
                refs_={myRef}
                toolbar={true}
                menubar={true}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={saveComment.bind(this)}
          >
            Добавить новый комментарий
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class ListFakeUsers_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.myRef = React.createRef();
    this.myRef_action = React.createRef();

    this.state = {
      module: "list_fake_users",
      module_name: "",
      is_load: false,

      points: [],
      point: [],
      items: [],
      item: [],
      users: [],

      url: "",

      date_start_true: null,
      date_end_true: null,
      date_start_false: null,
      date_end_false: null,
      count_orders_min: "",
      count_orders_max: "",
      max_summ: "",
      min_summ: "",
      is_show_claim: 0,
      is_show_claim_last: 0,
      is_show_marketing: 0,

      modalDialog: false,
      user: null,
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: "",

      openNumber: "",

      openOrder: false,
      showOrder: null,

      modalDialogAction: false,
      comment_id: null,

      raiting: 0,
      type_sale: 0,
    };
  }

  async componentDidMount() {
    let data = await this.getData("list_fake_users", "get_all");

    this.setState({
      points: data.points,
      items: data.items,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

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

  getData = (module, method, data = {}) => {
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
        module: module,
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

  async getUsers() {
    const data = {
      point: this.state.point,
      date_start_true: dayjs(this.state.date_start_true).format("YYYY-MM-DD"),
      date_end_true: dayjs(this.state.date_end_true).format("YYYY-MM-DD"),
      date_start_false: dayjs(this.state.date_start_false).format("YYYY-MM-DD"),
      date_end_false: dayjs(this.state.date_end_false).format("YYYY-MM-DD"),
      count_orders_min: this.state.count_orders_min,
      count_orders_max: this.state.count_orders_max,
      max_summ: this.state.max_summ,
      min_summ: this.state.min_summ,
      items: this.state.item,
      is_show_claim: this.state.is_show_claim,
      is_show_claim_last: this.state.is_show_claim_last,
      is_show_marketing: this.state.is_show_marketing,
    };

    const res = await this.getData("list_fake_users", "get_users", data);

    if (res.st) {
      this.setState({
        users: res.users,
        url: res.url,
      });
    } else {
      this.setState({
        users: [],
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeNumber(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeItem(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeItemChecked(data, event) {
    const value = event.target.checked === true ? 1 : 0;

    // делаем переключатель для галочек ошибка на заказ и на последний заказ
    if (data == "is_show_claim_last") {
      this.setState({
        is_show_claim: 0,
      });
    } else if (data == "is_show_claim") {
      this.setState({
        is_show_claim_last: 0,
      });
    }

    // changeItemChecked
    this.setState({
      [data]: value,
    });
  }

  async openModal(number) {
    this.handleResize();

    // const point = this.state.point;

    // const data = {
    //   client_id: item.client_id,
    //   date_start_true: dayjs(this.state.date_start_true).format('YYYY-MM-DD'),
    //   date_end_true: dayjs(this.state.date_end_true).format('YYYY-MM-DD'),
    //   point,
    // };

    const data = {
      number,
    };

    const res = await this.getData("new_site_users", "get_one", data);

    this.setState({
      modalDialog: true,
      user: res,
      openNumber: number,
    });

    // if (res.st) {
    //   this.setState({
    //     modalDialog: true,
    //     user: res.user,
    //   });
    // } else {
    //   this.setState({
    //     openAlert: true,
    //     err_status: res.st,
    //     err_text: res.text,
    //   });
    // }
  }

  onDownload() {
    const url = this.state.url;

    const link = document.createElement("a");
    link.href = url;
    link.click();
  }

  async orderOpen(order_id, point_id) {
    const data = {
      order_id,
      point_id,
    };

    const res = await this.getData("new_site_users", "get_order", data);

    this.setState({
      showOrder: res,
      openOrder: true,
    });
  }

  openModalAction(id) {
    this.setState({
      modalDialogAction: true,
      comment_id: id,
    });
  }

  setRaiting(data) {
    this.setState({ raiting: data ?? 0 });
  }

  setTypeSale(data) {
    this.setState({ type_sale: data ?? 0 });
  }

  async saveComment() {
    if (!this.myRef.current || this.myRef.current.getContent().length === 0) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Комментарий пустой",
      });

      return;
    }

    if (this.click === true) {
      return;
    } else {
      this.click = true;
    }

    const data = {
      number: this.state.openNumber,
      text: this.myRef.current.getContent(),
    };

    let res = await this.getData("new_site_users", "save_comment", data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    } else {
      const user = this.state.user;

      user.comments = res.comments;

      this.myRef.current.setContent("");

      this.setState({
        openAlert: true,
        err_status: true,
        err_text: "Успешно сохранено",
        user,
      });

      this.getUsers();
    }

    setTimeout(() => {
      this.click = false;
    }, 500);
  }

  async saveCommentAction() {
    if (!this.myRef_action.current || this.myRef_action.current.getContent().length === 0) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "В описании пусто",
      });

      return;
    }

    if (this.click) {
      return;
    } else {
      this.click = true;
    }

    const data = {
      comment_id: this.state.comment_id,
      description: this.myRef_action.current.getContent(),
      number: this.state.openNumber,
      raiting: this.state.raiting,
      type_sale: this.state.type_sale,
    };

    if (parseInt(this.state.type_sale) > 0) {
      this.savePromo(this.state.type_sale);
    }

    const res = await this.getData("new_site_users", "save_action", data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
        modalDialogAction: false,
      });
    } else {
      const user = this.state.user;

      user.comments = res.comments;

      this.myRef_action.current.setContent("");

      this.setState({
        openAlert: true,
        err_status: true,
        err_text: "Успешно сохранено",
        modalDialogAction: false,
        user,
      });

      this.getUsers();
    }

    setTimeout(() => {
      this.click = false;
    }, 500);
  }

  async savePromo(percent) {
    const number = this.state.openNumber;

    const data = {
      number,
      percent,
    };

    const res = await this.getData("new_site_users", "save_promo", data);
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
        <ListFakeUsers_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          user={this.state.user}
          fullScreen={this.state.fullScreen}
          openNumber={this.state.openNumber}
          saveComment={this.saveComment.bind(this)}
          orderOpen={this.orderOpen.bind(this)}
          myRef={this.myRef}
          openModalAction={this.openModalAction.bind(this)}
        />
        <ListFakeUsers_Modal_Order
          open={this.state.openOrder}
          onClose={() => this.setState({ openOrder: false })}
          showOrder={this.state.showOrder}
          fullScreen={this.state.fullScreen}
        />
        <ListFakeUsers_Modal_Action
          open={this.state.modalDialogAction}
          onClose={() => this.setState({ modalDialogAction: false })}
          showOrder={this.state.showOrder}
          fullScreen={this.state.fullScreen}
          saveCommentAction={this.saveCommentAction.bind(this)}
          raiting={this.state.raiting}
          myRef_action={this.myRef_action}
          type_sale={this.state.type_sale}
          setRaiting={this.setRaiting.bind(this)}
          setTypeSale={this.setTypeSale.bind(this)}
        />
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ flexDirection: { sm: "row", xs: "column-reverse" } }}
          style={{ marginTop: "64px", marginBottom: "24px" }}
        >
          <Grid
            mb={3}
            size={{
              xs: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            sx={{ order: { sm: 0, xs: 1 } }}
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Делал заказ от"
              value={this.state.date_start_true}
              func={this.changeDateRange.bind(this, "date_start_true")}
            />
          </Grid>

          <Grid
            sx={{ order: { sm: 1, xs: 0 } }}
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Делал заказ до"
              value={this.state.date_end_true}
              func={this.changeDateRange.bind(this, "date_end_true")}
            />
          </Grid>

          <Grid
            sx={{ order: { sm: 2, xs: 2 } }}
            display="flex"
            flexDirection="row"
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Grid>
              <Button
                variant="contained"
                style={{ whiteSpace: "nowrap" }}
                onClick={this.getUsers.bind(this)}
              >
                Получить список клиентов
              </Button>
            </Grid>

            <Grid>
              <Button
                variant="contained"
                style={{ marginLeft: 10, backgroundColor: "#ffcc00" }}
                onClick={this.onDownload.bind(this)}
                disabled={!this.state.users.length}
              >
                <DownloadIcon />
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          mb={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Не заказывал от"
              value={this.state.date_start_false}
              func={this.changeDateRange.bind(this, "date_start_false")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Не заказывал до"
              value={this.state.date_end_false}
              func={this.changeDateRange.bind(this, "date_end_false")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyCheckBox
              label="Была оформлена ошибка на заказ"
              value={parseInt(this.state.is_show_claim) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, "is_show_claim")}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          mb={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Количество заказов от"
              value={this.state.count_orders_min}
              type="number"
              func={this.changeNumber.bind(this, "count_orders_min")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Количество заказов до"
              value={this.state.count_orders_max}
              type="number"
              func={this.changeNumber.bind(this, "count_orders_max")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyCheckBox
              label="Была оформлена ошибка на последний заказ"
              value={parseInt(this.state.is_show_claim_last) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, "is_show_claim_last")}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          mb={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="От суммы"
              value={this.state.min_summ}
              type="number"
              func={this.changeNumber.bind(this, "min_summ")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="До суммы"
              value={this.state.max_summ}
              type="number"
              func={this.changeNumber.bind(this, "max_summ")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyCheckBox
              label="Подписка на рекламную рассылку"
              value={parseInt(this.state.is_show_marketing) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, "is_show_marketing")}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          mb={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Точки"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changeItem.bind(this, "point")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Позиции в заказе"
              multiple={true}
              data={this.state.items}
              value={this.state.item}
              func={this.changeItem.bind(this, "item")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          ></Grid>
        </Grid>
        {!this.state.users.length ? null : (
          <Grid
            container
            justifyContent="center"
          >
            <Grid
              size={{
                xs: 12,
                sm: 9,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Имя</TableCell>
                      <TableCell>Телефон</TableCell>
                      <TableCell>Последний комментарий</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.users.map((item, i) => (
                      <TableRow
                        key={i}
                        onClick={this.openModal.bind(this, item.login)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.login}</TableCell>
                        <TableCell
                          dangerouslySetInnerHTML={{ __html: item?.last_comment }}
                        ></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </>
    );
  }
}

export default function ListFakeUsers() {
  return <ListFakeUsers_ />;
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
