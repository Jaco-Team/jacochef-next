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
  
    let found = false;

    const newOrdersReturn = ordersReturn.map((order) => {
      if (parseInt(order.id) === parseInt(id)) {
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
        id: parseInt(id),
        count: 1,
        maxCount: parseInt(maxCount),
        price: priceOneItem,
      });
    }
  
    const updatedOrderItems = showOrder.order_items.map((item) => {
      if (parseInt(item.item_id) === parseInt(id)) {

        let currentCount = (typeof item.count_return === 'number') ? item.count_return : parseInt(maxCount);
  
        currentCount = currentCount > 0 ? currentCount - 1 : 0;
  
        return {
          ...item,
          count_return: currentCount,
          price_return: (item.price_return ?? 0) + priceOneItem,
        };
      }
      return item;
    });
  
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };

    const totalSummReturn = newOrdersReturn.reduce((acc, item) => acc + item.price, 0);
  
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };

  handleDecrement = (id, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
  
    const newOrdersReturn = ordersReturn.map((order) => {
      if (parseInt(order.id) === parseInt(id)) {
        if (order.count > 0) {
          const newCount = order.count - 1;
          return {
            ...order,
            count: newCount,
            price: order.price - priceOneItem,
          };
        }
      }
      return order;
    });
  
    const updatedOrderItems = showOrder.order_items.map((item) => {
      if (parseInt(item.item_id) === parseInt(id)) {
        let currentCount = (typeof item.count_return === 'number') ? item.count_return : parseInt(maxCount);
 
        currentCount = currentCount < parseInt(maxCount) ? currentCount + 1 : parseInt(maxCount);
  
        return {
          ...item,
          count_return: currentCount,
          price_return: (item.price_return ?? 0) - priceOneItem,
        };

      }
      return item;
    });
  
    const updatedShowOrder = {
      ...showOrder,
      order_items: updatedOrderItems,
    };

    const totalSummReturn = newOrdersReturn.reduce((acc, item) => acc + item.price, 0);
  
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };

  handleFullReturn = (key, count, price) => {
    const { showOrder, ordersReturn } = this.state;
  
    const targetItem = showOrder.order_items.find(item => parseInt(item.item_id) === parseInt(key));
  
    const isCurrentlyFullReturn = targetItem && targetItem.count_return === 0;
  
    let updatedOrderItems, updatedOrdersReturn;
  
    if (isCurrentlyFullReturn) {
  
      updatedOrderItems = showOrder.order_items.map(item => {
        if (parseInt(item.item_id) === parseInt(key)) {
          return {
            ...item,
            count_return: item.count,
            price_return: 0,
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
          };
        }
        return item;
      });

      const existingOrder = ordersReturn.find(order => parseInt(order.id) === parseInt(key));

      if (existingOrder) {

        updatedOrdersReturn = ordersReturn.map(order => {
          if (parseInt(order.id) === parseInt(key)) {
            return {
              ...order,
              count: count,
              price: price,
            };
          }
          return order;
        });

      } else {

        updatedOrdersReturn = [
          ...ordersReturn,
          {
            id: parseInt(key),
            count: count,
            maxCount: count,
            price: price,
          }
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
  
  handleIncrement_set = (setId, subItemId, maxCount, price) => {
    const { showOrder, ordersReturn } = this.state;
    const priceOneItem = parseInt(price) / parseInt(maxCount);
  
    const updatedOrderItems = showOrder.order_items.map(item => {
      if (parseInt(item.id) === parseInt(setId)) {
        const updatedSetItems = item.set_items.map(sub => {
          if (parseInt(sub.item_id) === parseInt(subItemId)) {

            let currentCount = (typeof sub.count_return === 'number') ? sub.count_return : parseInt(maxCount);

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

    const newOrdersReturn = ordersReturn.map(order => {
      if (parseInt(order.id) === parseInt(subItemId) && parseInt(order.set_id) === parseInt(setId)) {

        if (order.count > 0) {
          const newCount = order.count - 1;
          return {
            ...order,
            count: newCount,
            price: order.price - priceOneItem,
          };
        }

      }

      return order;
    });

    const updatedOrderItems = showOrder.order_items.map(item => {

      if (parseInt(item.id) === parseInt(setId)) {

        const updatedSetItems = item.set_items.map(sub => {

          if (parseInt(sub.item_id) === parseInt(subItemId)) {

            let currentCount = (typeof sub.count_return === 'number') ? sub.count_return : parseInt(maxCount);
            currentCount = currentCount < parseInt(maxCount) ? currentCount + 1 : parseInt(maxCount);

            return {
              ...sub,
              count_return: currentCount,
              price_return: (sub.price_return ?? 0) - priceOneItem,
            };

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

    const totalSummReturn = newOrdersReturn.reduce((acc, item) => acc + item.price, 0);
  
    this.setState({
      ordersReturn: newOrdersReturn,
      showOrder: updatedShowOrder,
      totalSummReturn
    });
  };
  
  handleFullReturn_set = (setId, subItemId, count, price) => {
    const { showOrder, ordersReturn } = this.state;
  
    const targetSet = showOrder.order_items.find(item => parseInt(item.id) === parseInt(setId));
    
    let targetSub;
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

  handleReturn_div = (id) => {
    const { showOrder, ordersReturn } = this.state;

    let updatedOrdersReturn = [...ordersReturn];
    let updatedShowOrder = { ...showOrder };
  
    const existing = updatedOrdersReturn.find(item => parseInt(item.item_id) === parseInt(id));
    
    if (existing) {
      updatedOrdersReturn = updatedOrdersReturn.filter(item => parseInt(item.item_id) !== parseInt(id));

      updatedShowOrder.order = { 
        ...updatedShowOrder.order,
        delivery_return: false 
      };

    } else {

      updatedOrdersReturn.push({
        item_id: id,
        count: 1,
        price: showOrder?.order?.summ_div || 0
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
  
  
  onClose() {
    this.setState({
      showOrder: null,
      ordersReturn: [],
      totalSummReturn: 0,
    });

    this.props.onClose();
  }

  render() {

    const { open, fullScreen } = this.props;

    const { showOrder, totalSummReturn } = this.state;

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
                                <AddIcon fontSize="small" />
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
                                <RemoveIcon fontSize="small" />
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
                            <TableCell ></TableCell>
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
                                        <AddIcon fontSize="small" />
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
                                        <RemoveIcon fontSize="small" />
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

                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>Доставка</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{new Intl.NumberFormat('ru-RU').format(showOrder?.order?.summ_div || 0)} ₽</TableCell>
                    <TableCell></TableCell>
                    <TableCell align='center' sx={{ fontWeight: 'bold' }}>{showOrder?.order?.delivery_return ? `${new Intl.NumberFormat('ru-RU').format(showOrder?.order?.summ_div || 0)} ₽` : "0 ₽"}</TableCell>
                    <TableCell>
                      <MyCheckBox
                        value={showOrder?.order?.delivery_return || false}
                        func={() => this.handleReturn_div(-1)}
                      />
                    </TableCell>
                  </TableRow>

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
          <Button variant="contained" onClick={this.onClose.bind(this)}>
            Оформить возврат
          </Button>
        </DialogActions>

      </Dialog>
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
      // orders: [],

      orders: [
        {
            "point_addr": "Тольятти, Ленинградская 47",
            "point_id": "1",
            "id": 771785,
            "unix_time": "1742823527.000000",
            "status": "У клиента",
            "number": "89677268864",
            "date_time_order": "2025-03-24 17:38:47",
            "date_time_preorder": "0000-00-00 00:00:00",
            "is_preorder": 0,
            "close_order": "2025-03-24 18:41:08",
            "type_pay": "Безнал",
            "order_price": 1728,
            "is_return": true
        }
    ],

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

      console.log('🚀 === get_orders modifiedOrders:', modifiedOrders);

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

    let res = await this.getData('get_one_order', data);
    console.log("🚀 === res:", res);

    res = {
      order:{
        "order_id": 771785,
        "number": "89677268864",
        "sum_order": 1728,
        "point_id": "1",
        "date_time_order": "2025-03-24 17:38:47",
        "date_time_preorder": "0000-00-00 00:00:00",
        "is_preorder": 0,
        "point_addr": "Ленинградская 47",
        "summ_div"
: 
189
    },
      
     order_items: [
        {
            "id": 3534653,
            "name": "Мадагаскар сет",
            "item_id": 296,
            "count": 1,
            "price": 2159,
            "set_items": [
                {
                    "item_id": 124,
                    "name": "Акваланг запечённый унаги",
                    "count": 1,
                    "price": 318
                },
                {
                    "item_id": 48,
                    "name": "Филадельфия",
                    "count": 1,
                    "price": 468
                },
                {
                    "item_id": 173,
                    "name": "Везувий запечённый унаги",
                    "count": 1,
                    "price": 318
                },
                {
                    "item_id": 7,
                    "name": "Филадельфия жареный",
                    "count": 1,
                    "price": 358
                },
                {
                    "item_id": 53,
                    "name": "Закат жареный",
                    "count": 1,
                    "price": 358
                },
                {
                    "item_id": 50,
                    "name": "Лиана",
                    "count": 1,
                    "price": 339
                }
            ]
        },
        {
          "id": 3534383,
          "name": "Скала сет",
          "item_id": 126,
          "count": 1,
          "price": 1509,
          "set_items": [
              {
                  "item_id": 45,
                  "name": "Цезарь с лососем",
                  "count": 1,
                  "price": 318
              },
              {
                  "item_id": 27,
                  "name": "Коралл",
                  "count": 1,
                  "price": 278
              },
              {
                  "item_id": 58,
                  "name": "Сёрфинг жареный",
                  "count": 1,
                  "price": 298
              },
              {
                  "item_id": 207,
                  "name": "Алоха",
                  "count": 1,
                  "price": 318
              },
              {
                  "item_id": 59,
                  "name": "Цезарь с курицей жареный",
                  "count": 1,
                  "price": 297
              }
          ]
      },
        {
            "id": 3534654,
            "name": "Калифорния с лососем Люкс",
            "item_id": 165,
            "count": 1,
            "price": 359
        },
        {
            "id": 3534655,
            "name": "Цезарь с креветкой запечённый унаги",
            "item_id": 253,
            "count": 1,
            "price": 319
        },
        {
            "id": 3534656,
            "name": "Соевый соус ",
            "item_id": 19,
            "count": 4,
            "price": 60
        },
        {
            "id": 3534657,
            "name": "Имбирь",
            "item_id": 18,
            "count": 3,
            "price": 45
        },
        {
            "id": 3534658,
            "name": "Васаби",
            "item_id": 22,
            "count": 1,
            "price": 9
        },
        {
            "id": 3534659,
            "name": "Палочки",
            "item_id": 17,
            "count": 3,
            "price": 0
        }
    ]
  };

    this.setState({
      showOrder: res,
      modalDialog_order: true
    });

  }

  render() {
    const {is_load, openAlert, err_status,
      err_text,
      module_name,
      points,
      point,
      order,
      orders,
      showOrder,
      modalDialog_order,
      fullScreen
    } = this.state;

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
