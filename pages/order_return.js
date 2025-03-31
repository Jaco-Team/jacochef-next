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
      ordersReturn: [],
      totalSummReturn: 0,
      confirmDialog: false
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
        ordersReturn: [],
        totalSummReturn: 0,
      });
    }
  }

  handleIncrement = (id, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
  
    const itemIndex = showOrder.order_items.findIndex((item) => parseInt(item.item_id) === parseInt(id));
    
    let selectedId = null;
    
    const updatedOrderItems = showOrder.order_items.map((item, idx) => {

      if (idx === itemIndex) {
        let currentCount = typeof item.count_return === 'number' ? item.count_return : parseInt(maxCount);
        currentCount = currentCount > 0 ? currentCount - 1 : 0;
        let newItemRowIds = Array.isArray(item.item_row_ids) ? [...item.item_row_ids] : [];

        if (newItemRowIds.length > 0) {
          selectedId = newItemRowIds.shift();
        }
        
        return {
          ...item,
          count_return: currentCount,
          price_return: (item.price_return ?? 0) + priceOneItem,
          item_row_ids: newItemRowIds,
        };
      }

      return item;
    });
  
    const newOrdersReturn = [
      ...ordersReturn,
      ...(selectedId !== null
        ? [
            {
              id: parseInt(id),
              count: 1,
              maxCount: parseInt(maxCount),
              price: priceOneItem,
              item_row_id: selectedId,
            },
          ]
        : []),
    ];
  
    const totalSummReturn = newOrdersReturn.reduce((acc, order) => acc + order.price, 0);
  
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
  
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };

  handleDecrement = (id, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
  
    let removedOrder = null;
    const newOrdersReturn = ordersReturn.filter(order => {
      if (!removedOrder && parseInt(order.id) === parseInt(id)) {
        removedOrder = order;
        return false;
      }
      return true;
    });
  
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.item_id) === parseInt(id)) {
        let currentCount = typeof item.count_return === 'number' ? item.count_return : parseInt(maxCount);
        currentCount = currentCount < parseInt(maxCount) ? currentCount + 1 : parseInt(maxCount);
        
        const newPriceReturn = (item.price_return ?? 0) - priceOneItem;
        
        let newItemRowIds = Array.isArray(item.item_row_ids) ? [...item.item_row_ids] : [];
        if (removedOrder && removedOrder.item_row_id) {
          newItemRowIds.push(removedOrder.item_row_id);
        }
        
        return {
          ...item,
          count_return: currentCount,
          price_return: newPriceReturn,
          item_row_ids: newItemRowIds
        };
      }
      return item;
    });
  
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
  
    const totalSummReturn = newOrdersReturn.reduce((acc, order) => acc + order.price, 0);
  
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };

  handleFullReturn = (key, count, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(count);
    
    const targetItem = showOrder.order_items.find(item => parseInt(item.item_id) === parseInt(key));
    
    const isCurrentlyFullReturn = targetItem && targetItem.count_return === 0;
    
    let updatedOrderItems, updatedOrdersReturn;
    
    if (isCurrentlyFullReturn) {
      updatedOrderItems = showOrder.order_items.map(item => {
        if (parseInt(item.item_id) === parseInt(key)) {
          const returnedIds = ordersReturn.filter(order => parseInt(order.id) === parseInt(key)).map(order => order.item_row_id);

          return {
            ...item,
            count_return: item.count,
            price_return: 0,
            item_row_ids: returnedIds
          };
        }
        return item;
      });
      
      updatedOrdersReturn = ordersReturn.filter(order => parseInt(order.id) !== parseInt(key));
      
    } else {

      updatedOrderItems = showOrder.order_items.map(item => {
        if (parseInt(item.item_id) === parseInt(key)) {
          return {
            ...item,
            count_return: 0,
            price_return: price,
            item_row_ids: []
          };
        }
        return item;
      });

      const newReturnItems = (targetItem && Array.isArray(targetItem.item_row_ids))
        ? targetItem.item_row_ids.map(rowId => ({
            id: parseInt(key),
            count: 1,
            maxCount: count,
            price: priceOneItem,
            item_row_id: rowId
          }))
        : [];
      
      updatedOrdersReturn = [
        ...ordersReturn.filter(order => parseInt(order.id) !== parseInt(key)),
        ...newReturnItems,
      ];
    }
    
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
    
    const totalSummReturn = updatedOrdersReturn.reduce((acc, order) => acc + order.price, 0);
    
    this.setState({
      showOrder: updatedShowOrder,
      ordersReturn: updatedOrdersReturn,
      totalSummReturn,
    });
  };
  
  handleIncrement_set = (setId, subItemId, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
  
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.id) === parseInt(setId)) {
        const updatedSetItems = item.set_items.map(sub => {
          if (parseInt(sub.item_id) === parseInt(subItemId)) {
            let currentCount = typeof sub.count_return === 'number' ? sub.count_return : parseInt(maxCount);
            currentCount = currentCount > 0 ? currentCount - 1 : 0;

            return {
              ...sub,
              count_return: currentCount,
              price_return: (sub.price_return ?? 0) + priceOneItem,
            };
          }
          return sub;
        });
        return { ...item, set_items: updatedSetItems };
      }
      return item;
    });
  
    const updatedShowOrder = { ...showOrder, order_items: updatedOrderItems };
  
    const targetSet = updatedShowOrder.order_items.find(item => parseInt(item.id) === parseInt(setId));
    let subItemRowId = null;
    if (targetSet) {
      const targetSub = targetSet.set_items.find(sub => parseInt(sub.item_id) === parseInt(subItemId));
      if (targetSub) {
        subItemRowId = targetSub.item_row_id;
      }
    }
  
    let found = false;
    const newOrdersReturn = ordersReturn.map(order => {
      if (parseInt(order.id) === parseInt(subItemId) && parseInt(order.set_id) === parseInt(setId)) {
        found = true;
        if (order.count < order.maxCount) {
          const newCount = order.count + 1;
          return {
            ...order,
            count: newCount,
            price: order.price + priceOneItem,
          };
        }
      }
      return order;
    });
  
    if (!found) {
      newOrdersReturn.push({
        id: parseInt(subItemId),
        count: 1,
        maxCount: parseInt(maxCount),
        price: priceOneItem,
        set_id: parseInt(setId),
        item_row_id: subItemRowId,
      });
    }
  
    const totalSummReturn = newOrdersReturn.reduce((acc, item) => acc + item.price, 0);
  
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };
  
  handleDecrement_set = (setId, subItemId, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
 
    let removedItemRowId = null;
    let updatedOrdersReturn = ordersReturn.map(order => {
      if (parseInt(order.id) === parseInt(subItemId) && parseInt(order.set_id) === parseInt(setId)) {
        if (order.count > 0) {
          const newCount = order.count - 1;

          if (newCount === 0) {
            removedItemRowId = order.item_row_id;
            return null;
          }

          return {
            ...order,
            count: newCount,
            price: order.price - priceOneItem,
          };
        }
      }
      return order;
    }).filter(order => order !== null);
  
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.id) === parseInt(setId)) {
        const updatedSetItems = item.set_items.map(sub => {
          if (parseInt(sub.item_id) === parseInt(subItemId)) {
            let currentCount = typeof sub.count_return === 'number' ? sub.count_return : parseInt(maxCount);
            currentCount = currentCount < parseInt(maxCount) ? currentCount + 1 : parseInt(maxCount);
    
            let newSub = {
              ...sub,
              count_return: currentCount,
              price_return: (sub.price_return ?? 0) - priceOneItem,
            };
     
            if (removedItemRowId && !newSub.item_row_id) {
              newSub.item_row_id = removedItemRowId;
            }
    
            return newSub;
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
  
    const totalSummReturn = updatedOrdersReturn.reduce((acc, order) => acc + order.price, 0);
  
    this.setState({
      ordersReturn: updatedOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn,
    });
  };
  
  handleFullReturn_set = (setId, subItemId, count, price) => {
    const { showOrder, ordersReturn } = this.state;
    
    const targetSet = showOrder.order_items.find(item => parseInt(item.id) === parseInt(setId));
    let targetSub = null;
    if (targetSet) {
      targetSub = targetSet.set_items.find(sub => parseInt(sub.item_id) === parseInt(subItemId));
    }
    
    const currentCountReturn = targetSub ? (typeof targetSub.count_return === 'number' ? targetSub.count_return : targetSub.count) : null;
    const isCurrentlyFullReturn = currentCountReturn === 0;
    
    let updatedOrderItems, updatedOrdersReturn;
    
    if (isCurrentlyFullReturn) {
 
      updatedOrderItems = showOrder.order_items.map(item => {
        if (parseInt(item.id) === parseInt(setId)) {
          const updatedSetItems = item.set_items.map(sub => {
            if (parseInt(sub.item_id) === parseInt(subItemId)) {
              return {
                ...sub,
                count_return: sub.count,
                price_return: 0,
                item_row_id: targetSub && targetSub.item_row_id ? targetSub.item_row_id : sub.item_row_id
              };
            }
            return sub;
          });
          return { ...item, set_items: updatedSetItems };
        }
        return item;
      });

      updatedOrdersReturn = ordersReturn.filter(order => !(parseInt(order.id) === parseInt(subItemId) && parseInt(order.set_id) === parseInt(setId)));
      
    } else {

      updatedOrderItems = showOrder.order_items.map(item => {
        if (parseInt(item.id) === parseInt(setId)) {
          const updatedSetItems = item.set_items.map(sub => {
            if (parseInt(sub.item_id) === parseInt(subItemId)) {
              return {
                ...sub,
                count_return: 0,
                price_return: price,
                item_row_id: null
              };
            }
            return sub;
          });
          return { ...item, set_items: updatedSetItems };
        }
        return item;
      });
      
      const existingOrder = ordersReturn.find(order => parseInt(order.id) === parseInt(subItemId) && parseInt(order.set_id) === parseInt(setId));

      if (existingOrder) {

        updatedOrdersReturn = ordersReturn.map(order => {
          if (parseInt(order.id) === parseInt(subItemId) && parseInt(order.set_id) === parseInt(setId)) {
            return {
              ...order,
              count: count,
              price: price,
              item_row_id: targetSub && targetSub.item_row_id ? targetSub.item_row_id : order.item_row_id
            };
          }
          return order;
        });

      } else {

        updatedOrdersReturn = [
          ...ordersReturn,
          {
            id: parseInt(subItemId),
            count: count,
            maxCount: count,
            price: price,
            set_id: parseInt(setId),
            item_row_id: targetSub && targetSub.item_row_id ? targetSub.item_row_id : null
          },
        ];

      }
    }
    
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };
  
    const totalSummReturn = updatedOrdersReturn.reduce((acc, item) => acc + item.price, 0);
    
    this.setState({
      showOrder: updatedShowOrder,
      ordersReturn: updatedOrdersReturn,
      totalSummReturn
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
        id: id,
        count: 1,
        price: showOrder?.order?.summ_div || 0,
        item_row_id: id
      });
  
      updatedShowOrder.order = { 
        ...updatedShowOrder.order,
        delivery_return: true 
      };
    }
  
    const totalSummReturn = updatedOrdersReturn.reduce((acc, item) => acc + item.price, 0);
    
    this.setState({
      ordersReturn: updatedOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };

  save = () => {

    const { showOrder, ordersReturn } = this.state;

    if(!ordersReturn.length) {
      return this.props.openAlert(false, 'Не выбрано товаров для оформления возврата');
    }

    const data = {
      orders: ordersReturn,
      order_id: showOrder.order.order_id,
    }

    this.props.save(data);

    this.onClose();

  }
  
  onClose() {
    this.setState({
      showOrder: null,
      ordersReturn: [],
      totalSummReturn: 0,
      confirmDialog: false
    });

    this.props.onClose();
  }

  render() {

    const { open, fullScreen } = this.props;

    const { showOrder, totalSummReturn, confirmDialog } = this.state;

    const order = showOrder?.order;

    if (!order) {
      return null;
    }

    const dateSrc = order.is_preorder === 1 ? order.date_time_preorder : order.date_time_order;

    let formattedDate = '';

    if (dateSrc) {
      formattedDate = dayjs(dateSrc).format('D MMMM YYYY HH:mm:ss');
    }

    return (
      <>
        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
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
          fullWidth={true}
          maxWidth='lg'
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: 'bold', alignSelf: 'center' }}>Заказ #{showOrder?.order?.order_id}</Typography>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            
            <Grid container spacing={3}>

              <Grid item xs={12}>
                <b>Точка: </b>
                <span>{showOrder?.order?.point_addr}</span>
              </Grid>
              
              <Grid item xs={12}>
                <b>Дата и время заказа: </b> 
                <span>{formattedDate}</span> 
              </Grid>

              {showOrder?.order?.number?.length > 1 ? 
                <Grid item xs={12}>
                  <b>Телефон: </b> 
                  <span>{showOrder?.order?.number}</span> 
                </Grid>
              : null}

              <Grid item xs={12}>
                <Table size={'small'} style={{ marginTop: 15 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Товар</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Стоимость</TableCell>
                      <TableCell></TableCell>
                      <TableCell>К возврату</TableCell>
                      <TableCell>Полный возврат</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(showOrder?.order_items ?? []).map(item => {

                      const isSet = Array.isArray(item.set_items) && item.set_items.length > 0;

                      if (!isSet) {

                        const key = item.item_id;
                
                        return (
                          <TableRow key={key} hover>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('ru-RU').format(item.price || 0)} ₽
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <IconButton
                                  disableRipple
                                  onClick={() => this.handleIncrement(key, item.count, item.price)}
                                  disabled={(item.count_return ?? item.count) === 0}
                                  sx={{
                                    backgroundColor: (item.count_return ?? item.count) === 0 ? 'transparent' : '#CC0033',
                                    color: 'white',
                                    transition: 'none',
                                    '&:hover': {
                                      backgroundColor: (item.count_return ?? item.count) === 0 ? 'transparent' : '#b30000'
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
                                  {item?.count_return ?? item.count}
                                </Typography>

                                <IconButton
                                  disableRipple
                                  onClick={() => this.handleDecrement(key, item.count, item.price)}
                                  disabled={(item.count_return ?? item.count) === item.count}
                                  sx={{
                                    backgroundColor: (item.count_return ?? item.count) === item.count ? 'transparent' : '#CC0033',
                                    color: 'white',
                                    transition: 'none',
                                    '&:hover': {
                                      backgroundColor: (item.count_return ?? item.count) === item.count ? 'transparent' : '#b30000'
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
                                {new Intl.NumberFormat('ru-RU').format(item?.price_return || 0)} ₽
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <MyCheckBox
                                value={(item.count_return ?? item.count) === 0}
                                func={() => this.handleFullReturn(key, item.count, item.price)}
                              />
                            </TableCell>
                          </TableRow>
                        );

                      } else {

                        return (
                          <React.Fragment key={item.item_id}>
                            <TableRow key={`set-${item.item_id}`}>
                              <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                            </TableRow>

                            {Array.isArray(item.set_items) && item.set_items.map(subItem => {
                                const key = subItem.item_id;
                                return (
                                  <TableRow key={key} hover>
                                    <TableCell style={{ paddingLeft: 30 }}>• {subItem.name}</TableCell>
                                    <TableCell>{subItem.count}</TableCell>
                                    <TableCell>
                                      {new Intl.NumberFormat('ru-RU').format(subItem.price || 0)} ₽
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        <IconButton
                                          disableRipple
                                          onClick={() => this.handleIncrement_set(item.id, key, subItem.count, subItem.price)}
                                          disabled={(subItem.count_return ?? subItem.count) === 0}
                                          sx={{
                                            backgroundColor: (subItem.count_return ?? subItem.count) === 0 ? 'transparent' : '#CC0033',
                                            color: 'white',
                                            transition: 'none',
                                            '&:hover': {
                                              backgroundColor: (subItem.count_return ?? subItem.count) === 0 ? 'transparent' : '#b30000'
                                            },
                                            '&.Mui-disabled': {
                                              backgroundColor: 'transparent !important',
                                              pointerEvents: 'none'
                                            },
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                          }}
                                        >
                                          <RemoveIcon fontSize="small" />
                                        </IconButton>

                                        <Typography variant="body1" minWidth={24} textAlign="center">
                                          {subItem.count_return ?? subItem.count}
                                        </Typography>
                                    
                                        <IconButton
                                          disableRipple
                                          onClick={() => this.handleDecrement_set(item.id, key, subItem.count, subItem.price)}
                                          disabled={(subItem.count_return ?? subItem.count) === subItem.count}
                                          sx={{
                                            backgroundColor: (subItem.count_return ?? subItem.count) === subItem.count ? 'transparent' : '#CC0033',
                                            color: 'white',
                                            transition: 'none',
                                            '&:hover': {
                                              backgroundColor: (subItem.count_return ?? subItem.count) === subItem.count ? 'transparent' : '#b30000'
                                            },
                                            '&.Mui-disabled': {
                                              backgroundColor: 'transparent !important',
                                              pointerEvents: 'none'
                                            },
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                          }}
                                        >
                                          <AddIcon fontSize="small" />
                                        </IconButton>

                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {new Intl.NumberFormat('ru-RU').format(subItem?.price_return || 0)} ₽
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <MyCheckBox
                                        value={(subItem.count_return ?? subItem.count) === 0}
                                        func={() => this.handleFullReturn_set(item.id, key, subItem.count, subItem.price)}
                                      />
                                    </TableCell>
                                  </TableRow>

                                );
                              })}

                          </React.Fragment>
                        );
                      }
                    })}

                    {(showOrder?.items_order_return ?? []).map((item, key) => (
                      <TableRow key={key} sx={{ backgroundColor: '#fadadd', '& .MuiTableCell-root': { borderBottom: '1px solid rgba(0, 0, 0, 0.2)', height: '40px' } }}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('ru-RU').format(item.price || 0)} ₽
                        </TableCell>
                        <TableCell colSpan={3} align='center' sx={{ fontWeight: 'bold' }}>Оформлен возврат</TableCell>
                      </TableRow>
                    ))}

                    {showOrder?.order.is_return ? null :
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>Доставка</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{new Intl.NumberFormat('ru-RU').format(showOrder?.order?.summ_div || 0)} ₽</TableCell>
                        <TableCell></TableCell>
                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>{showOrder?.order?.delivery_return ? `${new Intl.NumberFormat('ru-RU').format(showOrder?.order?.summ_div || 0)} ₽` : "0 ₽"}</TableCell>
                        <TableCell>
                          <MyCheckBox
                            value={showOrder?.order?.delivery_return || false}
                            func={() => this.handleReturn_dev(-1)}
                          />
                        </TableCell>
                      </TableRow>
                    }

                  </TableBody>

                  <TableFooter>
                    <TableRow style={{ height: '60px' }}>
                      <TableCell colSpan={2} style={{fontWeight: 'bold', color: '#000'}}>Сумма заказа</TableCell>
                      <TableCell style={{fontWeight: 'bold', color: '#000'}}>{new Intl.NumberFormat('ru-RU').format(showOrder?.order?.sum_order)} ₽</TableCell>
                      <TableCell style={{fontWeight: 'bold', color: '#000'}} align='center'>Итого к возврату</TableCell>
                      <TableCell style={{fontWeight: 'bold', color: '#000'}} align='center'>{new Intl.NumberFormat('ru-RU').format(totalSummReturn)} ₽</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>

                </Table>
              </Grid>
              
            </Grid>
          </DialogContent>

          <DialogActions>
            {showOrder?.order_items.length ?
              <Button variant="contained" onClick={() => this.setState({ confirmDialog: true })}>
                Оформить возврат
              </Button>
              :
              <Button variant="contained" onClick={this.onClose.bind(this)}>
                Закрыть
              </Button>
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
