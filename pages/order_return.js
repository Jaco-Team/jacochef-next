import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TableContainer from '@mui/material/TableContainer';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyCheckBox, MyTextInput, MyAutocomplite, MyAlert} from '@/ui/elements';

import { api, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

class OrderReturn_Modal_Order extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showOrder: null,
      showOrderCopy: null,
      ordersReturn: [],
      totalSummReturn: 0,
      confirmDialog: false
    };

  }

  componentDidUpdate(prevProps) {
    if (!this.props.showOrder) return;

    if (this.props.showOrder !== prevProps.showOrder) {
      const showOrderCopy = JSON.parse(JSON.stringify(this.props.showOrder));
  
      this.setState({
        showOrder: this.props.showOrder,
        showOrderCopy,
        ordersReturn: [],
        totalSummReturn: 0,
      });
    }
  }
  

  handleIncrement = (id, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const maxCountInt = parseInt(maxCount);
    const priceOneItem = parseInt(price) / maxCountInt;
    
    let newItemRowId;
    const updatedOrderItems = showOrder.order_items.map(item => {

      if (parseInt(item.item_id) === parseInt(id)) {
        const currentReturn = item.count_return || 0;

        if (currentReturn >= maxCountInt || !item.item_row_ids || item.item_row_ids.length === 0) {
           return item;
        }
        
        const count_return = currentReturn + 1;
        let count_remaining = (typeof item.count_remaining === 'number' ? item.count_remaining : maxCountInt);
        count_remaining = count_remaining > 0 ? count_remaining - 1 : 0;
    
        let item_row_ids = [...item.item_row_ids];
        newItemRowId = item_row_ids.pop();
    
        return {
          ...item,
          count_return,
          count_remaining,
          price_return: (item.price_return || 0) + priceOneItem,
          item_row_ids,
        };
      }
      return item;
    });
    
    if (newItemRowId === undefined) return;
    
    ordersReturn.push({
      id: parseInt(id),
      count: 1,
      price: priceOneItem,
      item_row_id: newItemRowId
    });
    
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
    
    const totalSummReturn = ordersReturn.reduce((acc, rec) => acc + rec.price, 0);

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);
    
    this.setState({
      ordersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };

  handleDecrement = (id, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const maxCountInt = parseInt(maxCount);
    const priceOneItem = parseInt(price) / maxCountInt;
    
    let removedItemRowId;

    for (let i = ordersReturn.length - 1; i >= 0; i--) {
      if (parseInt(ordersReturn[i].id) === parseInt(id)) {
        removedItemRowId = ordersReturn[i].item_row_id;
        ordersReturn.splice(i, 1);
        break;
      }
    }

    if (removedItemRowId === undefined) return;
    
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.item_id) === parseInt(id)) {
        const currentReturn = item.count_return || 0;
        if (currentReturn > 0) {
          const count_return = currentReturn - 1;
          let count_remaining = (typeof item.count_remaining === 'number' ? item.count_remaining : maxCountInt);
          count_remaining = count_remaining < maxCountInt ? count_remaining + 1 : maxCountInt;
          let item_row_ids = [...item.item_row_ids];
    
          item_row_ids.push(removedItemRowId);
    
          return {
            ...item,
            count_return,
            count_remaining,
            price_return: (item.price_return || 0) - priceOneItem,
            item_row_ids,
          };
        }
      }
      return item;
    });

    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
    
    const totalSummReturn = ordersReturn.reduce((acc, rec) => acc + rec.price, 0);

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);
    
    this.setState({
      ordersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };
  
  handleFullReturn = (id, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const maxCountInt = parseInt(maxCount);
    const priceOneItem = parseInt(price) / maxCountInt;
    
    const currentFullReturnCount = ordersReturn.filter(o => parseInt(o.id) === parseInt(id)).length;
    
    let newOrdersReturn = [...ordersReturn];
    
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.item_id) === parseInt(id)) {

        const usedIds = ordersReturn.filter(o => parseInt(o.id) === parseInt(id)).map(o => o.item_row_id);
        const availableIds = item.item_row_ids || [];
        const fullIds = [...usedIds, ...availableIds];
        
        if (currentFullReturnCount === maxCountInt) {

          newOrdersReturn = newOrdersReturn.filter(o => parseInt(o.id) !== parseInt(id));
          return {
            ...item,
            count_return: 0,
            count_remaining: maxCountInt,
            price_return: 0,
            item_row_ids: fullIds,
          };

        } else {

          newOrdersReturn = newOrdersReturn.filter(o => parseInt(o.id) !== parseInt(id));
          let fullReturnEntries = [];

          for (let i = 0; i < maxCountInt; i++) {
            fullReturnEntries.push({
              id: parseInt(id),
              count: 1,
              price: priceOneItem,
              item_row_id: fullIds[i],
            });
          }

          newOrdersReturn = newOrdersReturn.concat(fullReturnEntries);

          return {
            ...item,
            count_return: maxCountInt,
            count_remaining: 0,
            price_return: priceOneItem * maxCountInt,
            item_row_ids: [],
          };

        }
      }
      return item;
    });

    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
    
    const totalSummReturn = newOrdersReturn.reduce((acc, rec) => acc + rec.price, 0);

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);
    
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };

  handleIncrement_set = (setId, subItemId, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;

    const priceOneItem = parseInt(price) / parseInt(maxCount);
    let subItemRowId = null;
  
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.item_id) === parseInt(setId)) {
        const updatedSetItems = item.set_items.map(sub => {

          if (parseInt(sub.item_id) === parseInt(subItemId)) {
            const count_return = (sub?.count_return ?? 0) + 1;
            let count_remaining = sub?.count_remaining ?? parseInt(maxCount);
            count_remaining = count_remaining > 0 ? count_remaining - 1 : 0;
  
            if (sub.item_row_id) {
              subItemRowId = sub.item_row_id;
            }
  
            return {
              ...sub,
              count_return,
              count_remaining,
              price_return: (sub?.price_return ?? 0) + priceOneItem,
              item_row_id: null,
            };

          }
          return sub;
        });
        return { ...item, set_items: updatedSetItems };
      }
      return item;
    });
  
    ordersReturn.push({
      id: parseInt(subItemId),
      count: 1,
      price: priceOneItem,
      set_id: parseInt(setId),
      item_row_id: subItemRowId,
    });
  
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
  
    const totalSummReturn = ordersReturn.reduce((acc, item) => acc + item.price, 0);

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);
  
    this.setState({
      ordersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };

  handleDecrement_set = (setId, subItemId, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
    let removedItemRowId = null;
  
    for (let i = ordersReturn.length - 1; i >= 0; i--) {

      if (parseInt(ordersReturn[i].id) === parseInt(subItemId) && parseInt(ordersReturn[i].set_id) === parseInt(setId)) {
        removedItemRowId = ordersReturn[i].item_row_id;
        ordersReturn.splice(i, 1);
        break;
      }

    }
  
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.item_id) === parseInt(setId)) {
        const updatedSetItems = item.set_items.map(sub => {

          if (parseInt(sub.item_id) === parseInt(subItemId)) {
            const currentCountReturn = sub?.count_return ?? 0;

            if (currentCountReturn > 0) {
              const count_return = currentCountReturn - 1;
              let count_remaining = sub?.count_remaining ?? parseInt(maxCount);
              count_remaining = count_remaining < parseInt(maxCount) ? count_remaining + 1 : parseInt(maxCount);
              
              return {
                ...sub,
                count_return,
                count_remaining,
                price_return: (sub?.price_return ?? 0) - priceOneItem,
                item_row_id: removedItemRowId !== null ? removedItemRowId : sub.item_row_id,
              };

            }
          }

          return sub;
        });
        return { ...item, set_items: updatedSetItems };
      }
      return item;
    });

    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
  
    const totalSummReturn = ordersReturn.reduce((acc, order) => acc + order.price, 0);

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);
  
    this.setState({
      ordersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };

  handleFullReturn_set = (setId, subItemId, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const maxCountInt = parseInt(maxCount);
    const priceInt = parseInt(price);
    const priceOneItem = priceInt / maxCountInt;
    
    const currentFullReturnCount = ordersReturn.filter(o => parseInt(o.id) === parseInt(subItemId) && parseInt(o.set_id) === parseInt(setId)).length;
    
    let newOrdersReturn = [...ordersReturn];
    
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.item_id) === parseInt(setId)) {
        const updatedSetItems = item.set_items.map(sub => {
          if (parseInt(sub.item_id) === parseInt(subItemId)) {
            if (currentFullReturnCount === maxCountInt) {

              newOrdersReturn = newOrdersReturn.filter(o => !(parseInt(o.id) === parseInt(subItemId) && parseInt(o.set_id) === parseInt(setId)));

              const removedRowId = ordersReturn.filter(o => parseInt(o.id) === parseInt(subItemId) && parseInt(o.set_id) === parseInt(setId))[0]?.item_row_id;
    
              return {
                ...sub,
                count_return: 0,
                count_remaining: maxCountInt,
                price_return: 0,
                item_row_id: removedRowId || sub.item_row_id,
              };

            } else {

              newOrdersReturn = newOrdersReturn.filter(o => !(parseInt(o.id) === parseInt(subItemId) && parseInt(o.set_id) === parseInt(setId)));
           
              const originalRowId = sub.item_row_id;
              let fullReturnEntries = [];

              for (let i = 0; i < maxCountInt; i++) {
                let rowId = i === 0 ? originalRowId : null;
                fullReturnEntries.push({
                  id: parseInt(subItemId),
                  count: 1,
                  price: priceOneItem,
                  set_id: parseInt(setId),
                  item_row_id: rowId,
                });
              }

              newOrdersReturn = [...newOrdersReturn, ...fullReturnEntries];
    
              return {
                ...sub,
                count_return: maxCountInt,
                count_remaining: 0,
                price_return: priceOneItem * maxCountInt,
                item_row_id: null,
              };
            }

          }
          return sub;
        });
        return { ...item, set_items: updatedSetItems };
      }
      return item;
    });

    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
    
    const totalSummReturn = newOrdersReturn.reduce((acc, order) => acc + order.price, 0);

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);
    
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };

  handleReturn_dev = (id) => {
    const { showOrder, ordersReturn } = this.state;

    let updatedOrdersReturn = [...ordersReturn];
    let updatedShowOrder = { ...showOrder };
  
    const existing = updatedOrdersReturn.find(item => parseInt(item.id) === parseInt(id));
    
    if (existing) {
      updatedOrdersReturn = updatedOrdersReturn.filter(item => parseInt(item.id) !== parseInt(id));

      updatedShowOrder.order = { 
        ...updatedShowOrder.order,
        delivery_return: false 
      };

    } else {

      updatedOrdersReturn.push({
        id,
        count: 1,
        price: showOrder?.order?.summ_div || 0,
        item_row_id: id
      });

      updatedShowOrder.order = { 
        ...updatedShowOrder.order,
        delivery_return: true 
      };

    }

    updatedShowOrder.fullReturn = this.checkFullReturn(updatedShowOrder);

    const totalSummReturn = updatedOrdersReturn.reduce((acc, item) => acc + item.price, 0);
    
    this.setState({
      ordersReturn: updatedOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };

  handleFullOrderReturn = () => {
    const { showOrder, showOrderCopy } = this.state;
  
    const currentFullReturn = showOrder.fullReturn || false;
    const newFullReturn = !currentFullReturn;
    const clonedShowOrder = JSON.parse(JSON.stringify(showOrderCopy));
  
    if (!newFullReturn) {
      this.setState({
        showOrder: clonedShowOrder,
        ordersReturn: [],
        totalSummReturn: 0,
      });
      return;
    }
  
    let newOrdersReturn = [];
  
    clonedShowOrder.order_items.forEach((item) => {

      if (!item.set_items || item.set_items.length === 0) {
        const itemCount = parseInt(item.count) || 0;
        const fullPrice = parseInt(item.price) || 0;

        if (itemCount > 0) {
          const priceOneItem = fullPrice / itemCount;

          if (Array.isArray(item.item_row_ids)) {
            item.item_row_ids.forEach((rowId) => {
              newOrdersReturn.push({
                id: parseInt(item.item_id),
                count: 1,
                price: priceOneItem,
                item_row_id: rowId,
              });
            });
          }
       
          item.count_return = itemCount;
          item.count_remaining = 0;
          item.price_return = fullPrice;
          item.item_row_ids = [];
        }

      } else {

        item.set_items.forEach((sub) => {
          const subCount = parseInt(sub.count) || 1;
          const subPrice = parseInt(sub.price) || 0;

          newOrdersReturn.push({
            id: parseInt(sub.item_id),
            count: subCount,
            price: subPrice,
            set_id: parseInt(item.item_id),
            item_row_id: sub.item_row_id,
          });

          sub.count_return = subCount;
          sub.count_remaining = 0;
          sub.price_return = subPrice;
        });

      }
    });
  
    if (clonedShowOrder.order && clonedShowOrder.order.summ_div && !clonedShowOrder.order.is_return) {
      newOrdersReturn.push({
        id: -1,
        count: 1,
        price: clonedShowOrder.order.summ_div,
        item_row_id: -1,
      });
      clonedShowOrder.order.delivery_return = true;
    }
  
    const totalSummReturn = newOrdersReturn.reduce((acc, row) => acc + (row.price || 0), 0);
    clonedShowOrder.fullReturn = true;
  
    this.setState({
      showOrder: clonedShowOrder,
      ordersReturn: newOrdersReturn,
      totalSummReturn,
    });
  };

  checkFullReturn = (showOrder) => {
    if (!showOrder || !showOrder.order_items) return false;
  
    const itemsFull = showOrder.order_items.every(item => {

      if (item.set_items && item.set_items.length > 0) {
        return item.set_items.every(sub => { const maxCount = parseInt(sub.count ?? 1); return parseInt(sub.count_return ?? 0) === maxCount; });
      }

      const maxCount = parseInt(item.count ?? 1);

      return parseInt(item.count_return ?? 0) === maxCount;

    });
  
    const deliveryFull = showOrder.order?.delivery_return === true;
    
    return itemsFull && deliveryFull;
  };

  save = () => {

    const { showOrder, ordersReturn } = this.state;

    if (!ordersReturn.length) {
      return this.props.openAlert(false, 'Не выбрано товаров для оформления возврата');
    }
    
    const data = {
      orders: ordersReturn,
      order_id: showOrder.order.order_id,
    };

    this.props.save(data);
    this.onClose();

  };

  onClose() {

    this.setState({
      showOrder: null,
      showOrderCopy: null,
      ordersReturn: [],
      totalSummReturn: 0,
      confirmDialog: false
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen } = this.props;
    const { showOrder, totalSummReturn, confirmDialog } = this.state;

    if (!showOrder || !showOrder.order) return null;

    const order = showOrder.order;
    const dateSrc = order.is_preorder === 1 ? order.date_time_preorder : order.date_time_order;
    let formattedDate = '';

    if (dateSrc) {
      formattedDate = dayjs(dateSrc).format('D MMMM YYYY HH:mm:ss');
    }

    return (
      <>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Вы действительно хотите оформить возврат?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.save}>Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          fullWidth
          maxWidth="lg"
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: 'bold', alignSelf: 'center' }}>
              Заказ #{order.order_id}
            </Typography>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <b>Точка: </b>
                <span>{order.point_addr}</span>
              </Grid>

              <Grid item xs={12}>
                <b>Дата и время заказа: </b>
                <span>{formattedDate}</span>
              </Grid>

              {order.number?.length > 1 && (
                <Grid item xs={12}>
                  <b>Телефон: </b>
                  <span>{order.number}</span>
                </Grid>
              )}

              <Grid item xs={12}>
                <Table size="small" style={{ marginTop: 15 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Товар</TableCell>
                      <TableCell align="center">Количество</TableCell>
                      <TableCell>Стоимость</TableCell>
                      <TableCell />
                      <TableCell align="center">К возврату</TableCell>
                      {showOrder?.order_items?.length || !order.is_return ?
                        <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '8px' }}>Полный возврат</span>
                          <MyCheckBox
                            value={showOrder?.fullReturn ?? 0}
                            func={this.handleFullOrderReturn}
                          />
                        </TableCell>
                        :  
                        <TableCell style={{ minWidth: 180 }}/>
                      }
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(showOrder.order_items ?? []).map((item, index) => {
                      const isSet = Array.isArray(item.set_items) && item.set_items.length > 0;

                      if (!isSet) {
             
                        const key = item.item_id;
                        return (
                          <TableRow key={key} hover>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="center">{item?.count_remaining ?? item.count}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('ru-RU').format(item.price || 0)} ₽
                            </TableCell>
                  
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <IconButton
                                  disableRipple
                                  onClick={() => this.handleDecrement(key, item.count, item.price)}
                                  disabled={(item?.count_return ?? 0) === 0}
                                  sx={{
                                    backgroundColor: (item.count_return ?? 0) === 0 ? 'transparent' : '#CC0033',
                                    color: 'white',
                                    transition: 'none',
                                    '&:hover': {
                                      backgroundColor: (item.count_return ?? 0) === 0 ? 'transparent' : '#b30000'
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: 'transparent !important',
                                      pointerEvents: 'none'
                                    },
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>

                                <Typography variant="body1" minWidth={24} textAlign="center">
                                  {item.count_return ?? 0}
                                </Typography>

                                <IconButton
                                  disableRipple
                                  onClick={() => this.handleIncrement(key, item.count, item.price)}
                                  disabled={(item?.count_return ?? 0) === item.count}
                                  sx={{
                                    backgroundColor: (item?.count_return ?? 0) === item.count ? 'transparent' : '#CC0033',
                                    color: 'white',
                                    transition: 'none',
                                    '&:hover': {
                                      backgroundColor: (item?.count_return ?? 0) === item.count ? 'transparent' : '#b30000'
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: 'transparent !important',
                                      pointerEvents: 'none'
                                    },
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                      
                            <TableCell align="center">
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('ru-RU').format(item.price_return || 0)} ₽
                              </Typography>
                            </TableCell>
                        
                            <TableCell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <MyCheckBox
                                value={(item.count_return ?? 0) === item.count}
                                func={() => this.handleFullReturn(key, item.count, item.price)}
                              />
                            </TableCell>

                          </TableRow>
                        );

                      } else {
         
                        return (
                          <React.Fragment key={item.item_id}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                              <TableCell />
                              <TableCell />
                              <TableCell />
                              <TableCell />
                              <TableCell />
                            </TableRow>

                            {(item.set_items ?? []).map(sub => {

                              const subKey = sub.item_id;

                              return (
                                <TableRow key={subKey} hover>
                                  <TableCell style={{ paddingLeft: 30 }}>
                                    • {sub.name}
                                  </TableCell>
                                  <TableCell align="center">{sub?.count_remaining ?? sub.count}</TableCell>
                                  <TableCell>
                                    {new Intl.NumberFormat('ru-RU').format(sub.price || 0)} ₽
                                  </TableCell>

                                  <TableCell align="center">
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                      <IconButton
                                        disableRipple
                                        onClick={() => this.handleDecrement_set(item.item_id, subKey, sub.count, sub.price)}
                                        disabled={(sub.count_return ?? 0) === 0}
                                        sx={{
                                          backgroundColor: (sub.count_return ?? 0) === 0 ? 'transparent' : '#CC0033',
                                          color: 'white',
                                          transition: 'none',
                                          '&:hover': {
                                            backgroundColor: (sub.count_return ?? 0) === 0 ? 'transparent' : '#b30000'
                                          },
                                          '&.Mui-disabled': {
                                            backgroundColor: 'transparent !important',
                                            pointerEvents: 'none'
                                          },
                                          width: 32,
                                          height: 32,
                                          borderRadius: 1
                                        }}
                                      >
                                        <RemoveIcon fontSize="small" />
                                      </IconButton>

                                      <Typography variant="body1" minWidth={24} textAlign="center">
                                        {sub.count_return ?? 0}
                                      </Typography>

                                      <IconButton
                                        disableRipple
                                        onClick={() => this.handleIncrement_set(item.item_id, subKey, sub.count, sub.price)}
                                        disabled={(sub?.count_return ?? 0) === sub.count}
                                        sx={{
                                          backgroundColor: (sub.count_return ?? 0) === sub.count ? 'transparent' : '#CC0033',
                                          color: 'white',
                                          transition: 'none',
                                          '&:hover': {
                                            backgroundColor: (sub.count_return ?? 0) === sub.count  ? 'transparent' : '#b30000'
                                          },
                                          '&.Mui-disabled': {
                                            backgroundColor: 'transparent !important',
                                            pointerEvents: 'none'
                                          },
                                          width: 32,
                                          height: 32,
                                          borderRadius: 1
                                        }}
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </TableCell>

                                  <TableCell align="center">
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                      {new Intl.NumberFormat('ru-RU').format(sub.price_return || 0)} ₽
                                    </Typography>
                                  </TableCell>

                                  <TableCell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <MyCheckBox
                                      value={(sub.count_return ?? 0) === sub.count}
                                      func={() => this.handleFullReturn_set(item.item_id, subKey, sub.count, sub.price)}
                                    />
                                  </TableCell>
                                </TableRow>
                              );

                            })}

                          </React.Fragment>
                        );
                      }
                    })}

                    {(showOrder.items_order_return ?? []).map((item, key) => (
                      <TableRow key={key} sx={{ backgroundColor: '#fadadd', '& .MuiTableCell-root': { borderBottom: '1px solid rgba(0,0,0,0.2)', height: '40px' }}}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="center">{item.count}</TableCell>
                        <TableCell>{new Intl.NumberFormat('ru-RU').format(item.price || 0)} ₽</TableCell>
                        <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold' }}>Оформлен возврат</TableCell>
                      </TableRow>
                    ))}

                    {!order.is_return && (
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>Доставка</TableCell>
                        <TableCell />
                        <TableCell>{new Intl.NumberFormat('ru-RU').format(order.summ_div || 0)} ₽</TableCell>
                        <TableCell />
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>{order.delivery_return ? `${new Intl.NumberFormat('ru-RU').format(order.summ_div || 0)} ₽` : '0 ₽'}</TableCell>
                        <TableCell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <MyCheckBox
                            value={order.delivery_return || false}
                            func={() => this.handleReturn_dev(-1)}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>

                  <TableFooter>
                    <TableRow style={{ height: '60px' }}>
                      <TableCell colSpan={2} style={{ fontWeight: 'bold', color: '#000' }}>Сумма заказа</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#000' }}>{new Intl.NumberFormat('ru-RU').format(order.sum_order || 0)} ₽</TableCell>
                      <TableCell align="center" style={{ fontWeight: 'bold', color: '#000' }}>Итого к возврату</TableCell>
                      <TableCell align="center" style={{ fontWeight: 'bold', color: '#000' }}>{new Intl.NumberFormat('ru-RU').format(totalSummReturn)} ₽</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            {showOrder?.order_items?.length || !order.is_return ?
              <Button variant="contained" onClick={() => this.setState({ confirmDialog: true })}>Оформить возврат</Button>
              :
              <Button variant="contained" onClick={this.onClose.bind(this)}>Закрыть</Button>
            }
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class OrderReturn_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'order_return',
      module_name: '',
      is_load: false,
      fullScreen: false,

      points: [],
      point: null,

      openAlert: false,
      err_status: false,
      err_text: '',

      order: '',
      orders: [],

      modalDialog_order: false,
      showOrder: null,
  
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      points: data.points
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

  handleResize = () => {
    this.setState({ fullScreen: window.innerWidth < 601 });
  };

  changeAutocomplite = (field, event, value) => {
    this.setState({
      [field]: value
    });
  };

  changeInput = (field, type, event) => {

    if (type === 'clear') {
      this.setState({ [field]: '' });

    } else {
      const { value } = event.target;
      this.setState({ [field]: value });
    }
  };

  getOrders = async () => {
    const { order, point } = this.state;

    if (!point) {
      return this.openAlert(false, 'Необходимо выбрать точку');
    }

    if (!order) {
      return this.openAlert(false, 'Необходимо указать номер заказа');
    }

    const data = { point, order };

    const res = await this.getData('get_orders', data);

    if (res.orders.length) {
      const modifiedOrders = res.orders.map((item) => {
        let newCloseOrder = item.close_order;
        
        if (item.close_order) {
          const dateSrc = item.is_preorder === 1 ? item.date_time_preorder: item.date_time_order;
          
          const parsedDate = dayjs(dateSrc, 'YYYY-MM-DD HH:mm:ss');
          
          if (parsedDate.isValid()) {
            const dateOnly = parsedDate.format('YYYY-MM-DD');
            newCloseOrder = `${dateOnly} ${item.close_order}`;
          }

        }

        const usedDate = item.is_preorder === 1 ? item.date_time_preorder : item.date_time_order;

        const dateObj = dayjs(usedDate, 'YYYY-MM-DD HH:mm:ss');
    
        const is_return = dateObj.isValid() && dateObj.isAfter(dayjs().subtract(7, 'day'));

        return {
          ...item,
          close_order: newCloseOrder,
          is_return,
        };
      });

      this.setState({
        orders: modifiedOrders,
      });
    } else {
      this.openAlert(false, 'Заказов с таким номером не найдено');
    }
  };

  openAlert = (status, text) => {

    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });

  };

  openOrder = async (status, order_id, point_id) => {

    if (!status) {
      return this.openAlert(false, 'Возврат заказа невозможен');
    }

    this.handleResize();

    const data = {
      order_id,
      point_id
    };

    const res = await this.getData('get_one_order', data);

    this.setState({
      showOrder: res,
      modalDialog_order: true
    });

  }

  save_return = async (data) => {
    const point = this.state.point;

    data.point_id = point;

    const res = await this.getData('save_return', data);

    if (res.st) {

      this.setState({
        modalDialog_order: false,
        showOrder: null,
      });

      this.openAlert(true, 'Возврат заказа оформлен');
    } else {
      this.openAlert(false, 'Возврат заказа не оформлен');
    }

  };

  render() {
    const {is_load, openAlert, err_status, err_text, module_name, points, point, order, orders, showOrder, modalDialog_order, fullScreen} = this.state;

    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />

        <OrderReturn_Modal_Order
          open={modalDialog_order}
          onClose={() => this.setState({ modalDialog_order: false })}
          showOrder={showOrder}
          fullScreen={fullScreen}
          openAlert={this.openAlert}
          save={this.save_return}
        />

        <Grid container spacing={3} className="container_first_child">
          <Grid item xs={12} sm={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyAutocomplite
              label="Точка"
              multiple={false}
              data={points}
              value={point}
              func={(event, val) => this.changeAutocomplite('point', event, val)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyTextInput
              type="number"
              className="input_login"
              label="Номер заказа"
              value={order}
              func={(e) => this.changeInput('order', 'edit', e)}
              inputAdornment={{
                endAdornment: (
                  <>
                    {!order ? null : (
                      <InputAdornment position="end">
                        <IconButton onClick={() => this.changeInput('order', 'clear')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )}
                  </>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button onClick={this.getOrders} variant="contained">
              Показать
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} mt={3} mb={5}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>ИД заказа</TableCell>
                    <TableCell>Дата / время оформления</TableCell>
                    <TableCell>Дата / время предзаказа</TableCell>
                    <TableCell>Дата / время завершения</TableCell>
                    <TableCell>Статус заказа</TableCell>
                    <TableCell>Точка</TableCell>
                    <TableCell>Номер клиента</TableCell>
                    <TableCell>Сумма заказа</TableCell>
                    <TableCell>Тип оплаты</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orders.map( (item, key) =>
                    <TableRow 
                      hover
                      key={key} 
                      sx={{ cursor: 'pointer' }}
                      onClick={this.openOrder.bind(this, item.is_return, item.id, item.point_id)} 
                    >
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.date_time_order}</TableCell>
                      <TableCell>{parseInt(item.is_preorder) ? item.date_time_preorder : ''}</TableCell>
                      <TableCell>{item.close_order}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.point_addr}</TableCell>
                      <TableCell>{item.number}</TableCell>
                      <TableCell>{new Intl.NumberFormat('ru-RU').format(item.order_price ?? 0)} ₽</TableCell>
                      <TableCell>{item.type_pay}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

        </Grid>
      </>
    );
  }
}

export default function OrderReturn() {
  return <OrderReturn_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  }
}
