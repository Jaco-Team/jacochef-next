import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Tooltip from '@mui/material/Tooltip';

import { MySelect, MyAlert, MyTextInput, TextEditor22, MyAutocomplite, formatDate, MyDatePickerNew } from '@/ui/elements';

import { ExlIcon } from '@/ui/icons';

import { api_laravel_local, api_laravel } from '@/src/api_new';
import dayjs from 'dayjs';

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
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
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
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class SiteClients_Modal_Comment_Action extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.myRef_action = React.createRef();

    this.state = {
      comment_id: null,
      raiting: 0,
      type_sale: 0,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.comment_id);

    if (!this.props.comment_id) {
      return;
    }

    if (this.props.comment_id !== prevProps.comment_id) {
      this.setState({
        comment_id: this.props.comment_id
      });
    }
  }

  saveCommentAction(){

    if((!this.myRef_action.current || this.myRef_action.current.getContent().length === 0)) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'В описании пусто'
      });

      return;
    } 

    if (this.click) {
      return;
    } else {
      this.click = true;
    }

    let data = {
      comment_id: this.state.comment_id,
      description: this.myRef_action.current.getContent(),
      number: this.props.client_login,
      raiting: this.state.raiting,
      type_sale: this.state.type_sale,
    };

    if(parseInt(this.state.type_sale) > 0){
      this.props.savePromo(this.state.type_sale);
    }

    this.props.saveCommentAction(data);

    setTimeout(() => {
      this.myRef_action.current.setContent('');
      this.click = false;
    }, 500)
  }

  onClose() {
    this.setState({
      comment_id: null,
      raiting: 0,
      type_sale: 0,

      openAlert: false,
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  render() {

    const { open, fullScreen } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth={'lg'}
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: 'bold' }}>Описание ситуации</Typography>
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            
            <Grid container spacing={0}>
            <Grid item xs={12} sm={12} style={{ justifyContent: 'center', display: 'flex', marginBottom: 20 }}>
                <ToggleButtonGroup
                  value={this.state.raiting}
                  exclusive
                  size="small"
                  onChange={(event, data)=>{ this.setState({raiting: data ?? 0}) } }
                >
                  <ToggleButton value="1" style={{ backgroundColor: parseInt(this.state.raiting) == 1 ? '#dd1a32' : '#fff', borderRightWidth: 2 }}>
                    <span style={{ color: parseInt(this.state.raiting) == 1 ? '#fff' : '#333', padding: '0 20px' }}>Положительный отзыв</span>
                  </ToggleButton>
                  <ToggleButton value="2" style={{ backgroundColor: parseInt(this.state.raiting) == 2 ? '#dd1a32' : '#fff', borderRightWidth: 2 }}>
                    <span style={{ color: parseInt(this.state.raiting) == 2 ? '#fff' : '#333', padding: '0 20px' }}>Средний отзыв</span>
                  </ToggleButton>
                  <ToggleButton value="3" style={{ backgroundColor: parseInt(this.state.raiting) == 3 ? '#dd1a32' : '#fff' }}>
                    <span style={{ color: parseInt(this.state.raiting) == 3 ? '#fff' : '#333', padding: '0 20px' }}>Отрицательный отзыв</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Grid item xs={12} sm={12} style={{ justifyContent: 'center', display: 'flex', marginBottom: 20 }}>
                <ToggleButtonGroup
                  value={this.state.type_sale}
                  exclusive
                  size="small"
                  onChange={(event, data)=>{ this.setState({type_sale: data ?? 0})} }
                >
                  <ToggleButton value="10" style={{ backgroundColor: parseInt(this.state.type_sale) == 10 ? '#dd1a32' : '#fff', borderRightWidth: 2 }}>
                    <span style={{ color: parseInt(this.state.type_sale) == 10 ? '#fff' : '#333', padding: '0 20px' }}>Скидка 10%</span>
                  </ToggleButton>
                  <ToggleButton value="20" style={{ backgroundColor: parseInt(this.state.type_sale) == 20 ? '#dd1a32' : '#fff' }}>
                    <span style={{ color: parseInt(this.state.type_sale) == 20 ? '#fff' : '#333', padding: '0 20px' }}>Скидка 20%</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextEditor22 id="EditorNew" value={''} refs_={this.myRef_action} toolbar={true} menubar={true} />
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.saveCommentAction.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class SiteClients_Modal_Client_Order extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showOrder: null
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
        maxWidth={'md'}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: 'bold', alignSelf: 'center' }}>Заказ #{this.state.showOrder?.order?.order_id}</Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <span>{this.state.showOrder?.order?.type_order}: {this.state.showOrder?.order?.type_order_addr_new}</span>
            </Grid>

            { parseInt(this.state.showOrder?.order?.type_order_) == 1 ?
              parseInt(this.state.showOrder?.order?.fake_dom) == 0 ?
                <Grid item xs={12}>
                  <b style={{ color: 'red', fontWeight: 900 }}>Домофон не работает</b>
                </Grid>
                  :
                <Grid item xs={12}>
                  <b style={{ color: 'green', fontWeight: 900 }}>Домофон работает</b>
                </Grid>
                :
              null
            }
            <Grid item xs={12}>
              <span>{this.state.showOrder?.order?.time_order_name}: {this.state.showOrder?.order?.time_order}</span>
            </Grid>

            { this.state.showOrder?.order?.number?.length > 1 ? 
              <Grid item xs={12}>
                <b>Телефон: </b> 
                <span>{this.state.showOrder?.order?.number}</span> 
              </Grid>
                : 
              null
            }

            { this.state.showOrder?.order?.delete_reason?.length > 0 ? <Grid item xs={12}><span style={{ color: 'red' }}>Удален: {this.state.showOrder?.order?.date_time_delete}</span></Grid> : null}
            { this.state.showOrder?.order?.delete_reason?.length > 0 ? <Grid item xs={12}><span style={{ color: 'red' }}>{this.state.showOrder?.order?.delete_reason}</span></Grid> : null}
            
            { parseInt(this.state.showOrder?.order?.is_preorder) == 1 ? null :
              <Grid item xs={12}><span>{'Обещали: ' + this.state.showOrder?.order?.time_to_client + ' / '}{this.state.showOrder?.order?.text_time}{this.state.showOrder?.order?.time}</span></Grid>
            }
            
            { this.state.showOrder?.order?.promo_name == null || this.state.showOrder?.order?.promo_name?.length == 0 ? null :
              <>
                <Grid item xs={12}>
                  <b>Промокод: </b>
                  <span>{this.state.showOrder?.order?.promo_name}</span>
                </Grid>
                <Grid item xs={12}>
                  <span className="noSpace">{this.state.showOrder?.order?.promo_text}</span>
                </Grid>
              </>
            }
            
            { this.state.showOrder?.order?.comment == null || this.state.showOrder?.order?.comment.length == 0 ? null :
              <Grid item xs={12}>
                <b>Комментарий: </b>
                <span>{this.state.showOrder?.order?.comment}</span>
              </Grid>
            }
            
            { this.state.showOrder?.order?.sdacha == null || parseInt(this.state.showOrder?.order?.sdacha) == 0 ? null :
              <Grid item xs={12}>
                <b>Сдача: </b>
                <span>{this.state.showOrder?.order?.sdacha}</span>
              </Grid>
            }
            
            <Grid item xs={12}>
              <b>Сумма заказа: </b>
              <span>{this.state.showOrder?.order?.sum_order} р</span>
            </Grid>

            { this.state.showOrder?.order?.check_pos_drive == null || !this.state.showOrder?.order?.check_pos_drive ? null :
              <Grid item xs={12}>
                <b>Довоз оформлен: </b>
                <span>{this.state.showOrder?.order?.check_pos_drive?.comment}</span>
              </Grid>
            }

            <Grid item xs={12}>
              <Table size={'small'} style={{ marginTop: 15 }}>
                <TableBody>
                  { this.state.showOrder?.order_items.map( (item, key) =>
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.price} р</TableCell>
                    </TableRow>
                  ) }
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell style={{fontWeight: 'bold', color: '#000'}}>Сумма заказа</TableCell>
                    <TableCell></TableCell>
                    <TableCell style={{fontWeight: 'bold', color: '#000'}}>{this.state.showOrder?.order?.sum_order} р</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Grid>

            {!this.state.showOrder?.err_order ? null : 
              <Grid item xs={12} mt={3}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography style={{fontWeight: 'bold'}}>Ошибка</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '20%' }}>Дата создания</TableCell>
                          <TableCell style={{ width: '30%' }}>Проблема</TableCell>
                          <TableCell style={{ width: '30%' }}>Решение</TableCell>
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
            }
            
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.onClose.bind(this)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SiteClients_Modal_Client extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.myRef = React.createRef();

    this.state = {
      item: null,
      activeTab: 0,

      openAlert: false,
      err_status: true,
      err_text: '',

      confirmDialog: false
    };
  }

  componentDidUpdate(prevProps) {
    //console.log('componentDidUpdate', this.props);
    
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;
    const value = event.target.value;
   
    item[data] = value;

    this.setState({
      item
    });
  }

  resetDateBR() {
    const item = this.state.item;

    item.date_bir = '';
    item.day = '';
    item.month = '';

    this.setState({
      item
    });
  }

  changeTab(event, val){
    this.setState({
      activeTab: val
    })
  }

  saveEdit(){

    const item = this.state.item;
    
    if((item.day && !item.month) || (!item.day && item.month)) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать полную дату рождения, либо сбросить',
      })
      
      return;
    }

    if(this.click === true){
      return;
    } else { 
      this.click = true;
    }
    
    let date_bir;

    if(item.day && item.month){
      date_bir = dayjs(`2024-${item.month}-${item.day}`).format('YYYY-MM-DD');
    } else {
      date_bir = null;
    }

    const data = {
      mail: item.mail,
      login: item.login,
      date_bir,
    }

    this.props.saveEdit(data);

    setTimeout(() => {
      this.click = false;
    }, 500)
  }

  saveComment(){
    if(this.myRef.current) {
      if(this.myRef.current.getContent().length == 0) {

        this.setState({
          openAlert: true,
          err_status: false,
          err_text: 'Комментарий пустой',
        });

        return;
      }
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Комментарий пустой',
      });

      return;
    }

    if(this.click === true){
      return;
    }else{
      this.click = true;
    }

    let data = {
      number: this.props.item_login,
      text: this.myRef.current.getContent()
    };
    
    this.props.saveComment(data);

    setTimeout(() => {
      this.myRef.current.setContent('');
      this.click = false;
    }, 500)
  }

  send_code() {
    this.setState ({
      confirmDialog: false
    });

    this.props.sendCode();
  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        item: null,
        activeTab: 0,
        openAlert: false,
        err_status: true,
        err_text: '',
        confirmDialog: false
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, item_login, acces, days, months, orders, openClientOrder, err_orders, comments, openSaveAction, login_sms, login_yandex } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Точно выслать новый код ?</Typography>
            <Typography style={{ color: '#dd1a32' }}>Важно: код действуют 15 минут</Typography>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.send_code.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'xl'}
        >
          <DialogTitle className="button">
            Информация о клиенте с номером телефона
            {item_login ? `: ${item_login}` : null}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

            <Grid item xs={12} sm={12}>
              <Paper>
                <Tabs value={this.state.activeTab} onChange={ this.changeTab.bind(this) } centered variant='fullWidth'>
                  <Tab label="О клиенте" {...a11yProps(0)} />
                  <Tab label="Заказы" {...a11yProps(1)} />
                  <Tab label="Оформленные ошибки" {...a11yProps(2)} />
                  <Tab label="Обращения" {...a11yProps(3)} />
                  <Tab label="Авторизации" {...a11yProps(4)} />
                </Tabs>
              </Paper>
            </Grid>

            {/* О клиенте */}
            <Grid item xs={12} sm={12}>
              <TabPanel value={this.state.activeTab} index={0} id='client'>
                <Paper style={{ padding: 24 }}>

                  <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Имя: &nbsp;
                    </Typography>
                    <Typography>
                      {this.state.item?.name ?? 'Не указано'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Телефон: &nbsp;
                    </Typography>
                    <Typography>
                      {this.state.item?.login ?? 'Не указан'}
                    </Typography>
                  </Grid>

                  {parseInt(acces?.edit_mail) ? 
                    <Grid item xs={12} sm={12} mb={3} className='mail_box'>
                      <Typography style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        Эл почта:
                      </Typography>
                      <MyTextInput
                        label="Электронная @ почта"
                        func={this.changeItem.bind(this, 'mail')}
                        value={this.state.item?.mail ?? ''}
                        type="email"
                      />
                    </Grid>
                    :
                    <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                      <Typography style={{ fontWeight: 'bold' }}>
                        Эл почта: &nbsp;
                      </Typography>
                      <Typography>
                        {this.state.item?.mail ?? 'Не указана'}
                      </Typography>
                    </Grid>
                  }

                  <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Регистрация: &nbsp;
                    </Typography>
                    <Typography>
                      {this.state.item?.date_reg ?? 'Не указана'}
                    </Typography>
                  </Grid>

                  {parseInt(acces?.edit_bir) ? 
                    <Grid item xs={12} sm={12} mb={3} className='select_box'>
                      <Typography style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        Дата рождения:
                      </Typography>
                      <MySelect
                        data={days}
                        value={this.state.item?.day ?? ''}
                        func={this.changeItem.bind(this, 'day')}
                        label="День"
                      />
                      <MySelect
                        data={months}
                        value={this.state.item?.month ?? ''}
                        func={this.changeItem.bind(this, 'month')}
                        label="Месяц"
                      />
                      <Button variant="contained" onClick={this.resetDateBR.bind(this)}>
                        Сбросить
                      </Button>
                    </Grid>
                    :
                    <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                      <Typography style={{ fontWeight: 'bold' }}>
                          Дата рождения: &nbsp;
                        </Typography>
                        <Typography>
                          {this.state.item?.date_bir ?? 'Не указана'}
                        </Typography>
                    </Grid>
                  }

                  <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Заказов: &nbsp;
                    </Typography>
                    <Typography>
                      {`${this.state.item?.all_count_order} / ${this.state.item?.summ} р.`}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Доставок: &nbsp;
                    </Typography>
                    <Typography>
                      {`${this.state.item?.count_dev} / ${this.state.item?.summ_dev} р.`}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12} style={{ display: 'flex' }} mb={3}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Самовывозов: &nbsp;
                    </Typography>
                    <Typography>
                      {`${this.state.item?.count_pic} / ${this.state.item?.summ_pic} р.`}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    {!parseInt(acces?.edit_bir) && !parseInt(acces?.edit_mail) ? null :
                      <Button variant="contained" color='success' onClick={this.saveEdit.bind(this)}>
                        Сохранить
                      </Button>
                    }
                  </Grid>

                </Paper>
              </TabPanel>
            </Grid>
            {/* О клиенте */}

            {/* Заказы */}
            {!parseInt(acces?.view_orders) ? null :
              <Grid item xs={12} sm={12}>
                <TabPanel value={this.state.activeTab} index={1} id='client'>
                  <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 607 } }} component={Paper}>
                    <Table size='small' stickyHeader>
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                          <TableCell style={{ width: '5%' }}>#</TableCell>
                          <TableCell style={{ width: '20%' }}>Точка</TableCell>
                          <TableCell style={{ width: '20%' }}>Тип заказа</TableCell>
                          <TableCell style={{ width: '20%' }}>Дата заказа</TableCell>
                          <TableCell style={{ width: '15%' }}>ID заказа</TableCell>
                          <TableCell style={{ width: '20%' }}>Сумма заказа</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((item, key) =>
                          <TableRow 
                            hover 
                            key={key} 
                            onClick={openClientOrder.bind(this, item.order_id, item.point_id)} 
                            style={{ cursor: 'pointer', backgroundColor: parseInt(item.is_delete) ? 'rgb(204, 0, 51)' : null}}
                            sx={{ '& td': { color: parseInt(item.is_delete) ? '#fff' : '#000' } }}
                          >
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item.point}</TableCell>
                            <TableCell>{item.new_type_order}</TableCell>
                            <TableCell>{item.date_time}</TableCell>
                            <TableCell>{`#${item.order_id}`}</TableCell>
                            <TableCell>{`${item.summ} р.`}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Grid>
            }
            {/* Заказы */}

            {/* Оформленные ошибки */}
            {!parseInt(acces?.view_err) ? null :
              <Grid item xs={12} sm={12}>
                <TabPanel value={this.state.activeTab} index={2} id='client'>
                  <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 607 } }} component={Paper}>
                    <Table size='small' stickyHeader>
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                          <TableCell style={{ width: '5%' }}>#</TableCell>
                          <TableCell style={{ width: '15%' }}>Точка</TableCell>
                          <TableCell style={{ width: '10%' }}>ID заказа</TableCell>
                          <TableCell style={{ width: '20%' }}>Дата</TableCell>
                          <TableCell style={{ width: '25%' }}>Описание</TableCell>
                          <TableCell style={{ width: '25%' }}>Действия</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {err_orders.map((item, key) =>
                          <TableRow hover key={key}>
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item.point}</TableCell>
                            <TableCell>{`#${item.order_id}`}</TableCell>
                            <TableCell>{item.date_time_desc}</TableCell>
                            <TableCell>{item.order_desc}</TableCell>
                            <TableCell>{item.text_win}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Grid>
            }
            {/* Оформленные ошибки */}

            {/* Обращения */}
            {!parseInt(acces?.view_comment) ? null :
              <Grid item xs={12} sm={12}>
                <TabPanel value={this.state.activeTab} index={3} id='client'>
                  {!comments.length ? null :
                    <Accordion style={{ marginBottom: 24 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography style={{ fontWeight: 'bold' }}>Оформленные ошибки</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {comments.map( (item, key) => 
                          <Paper key={key} style={{ padding: 15, marginBottom: 15}} elevation={3}>
                            <b>{item?.description ? 'Обращение:' : 'Комментарий:' }</b>
                            <span dangerouslySetInnerHTML={{__html: item.comment}} />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <div>
                                <span style={{ marginRight: 20 }}>{item.date_add}</span>
                                <span>{item.name}</span>
                              </div>
                            </div>

                            <hr />

                            <b>{item?.description ? 'Действие:' : null }</b>
                            
                            <p dangerouslySetInnerHTML={{__html: item?.description}} />
                            
                            <p>
                              <b>{ parseInt(item.raiting) > 0 ? parseInt(item.raiting) == 1 ? 'Положительный отзыв' : parseInt(item.raiting) == 2 ? 'Средний отзыв' : 'Отрицательный отзыв' : '' }</b>
                              { parseInt(item.raiting) > 0 & parseInt(item.sale) > 0 ? ' / ' : '' }
                              <b>{ parseInt(item.sale) > 0 ? 'Выписана скидка '+item.sale+'%' : '' }</b>
                            </p>

                            <div style={{ display: 'flex', justifyContent: item?.description ? 'flex-end' : 'space-between', alignItems: 'center' }}>
                              {/* {item?.description ? null :
                                <>
                                  <Button color="primary" variant="contained" onClick={ openSaveAction.bind(this, item.id)}>Действие</Button>
                                </>
                              } */}
                              <div>
                                <span style={{ marginRight: 20 }}>{item.date_time}</span>
                                <span>{item.name_close}</span>
                              </div>
                            </div>
                          </Paper>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  }

                  {/* <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography style={{ fontWeight: 'bold' }}>Новое обращение</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid item xs={12} sm={12} mb={3}>
                        <TextEditor22 id="EditorNew" value={''} refs_={this.myRef} toolbar={true} menubar={true} />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        {!parseInt(acces?.edit) ? null :
                          <Button variant="contained"  onClick={this.saveComment.bind(this)}>
                            Добавить новый комментарий
                          </Button>
                        }
                      </Grid>
                    </AccordionDetails>
                  </Accordion> */}

                </TabPanel>
              </Grid>
            }
            {/* Обращения */}

            {/* Авторизации */}
            {!parseInt(acces?.view_auth) ? null :
              <Grid item xs={12} sm={12}>
                <TabPanel value={this.state.activeTab} index={4} id='client'>

                  {parseInt(acces?.send_code) ?
                    <Grid item xs={12} sm={12}>
                      <Button variant="contained" color='success' onClick={() => this.setState({ confirmDialog: true })}>
                        Выслать новый код
                      </Button>
                    </Grid>
                    : null
                  }

                  <Grid className='client_auth'>
                    {!login_sms.length ? null :
                      <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 607 }, width: '48%', height: 'max-content' }} component={Paper}>
                        <Table size='small' stickyHeader>
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell colSpan={3}>Авторизации по смс</TableCell>
                            </TableRow>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell style={{ width: '15%' }}>#</TableCell>
                              <TableCell>Дата и время авторизации</TableCell>
                              <TableCell>Код для авторизации</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {login_sms.map((item, key) =>
                              <TableRow hover key={key} >
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>{item.date_time}</TableCell>
                                <TableCell>{item.code}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    }

                    {!login_yandex.length ? null :
                      <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 607, width: '48%', height: 'max-content' } }} component={Paper}>
                        <Table size='small' stickyHeader>
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell colSpan={2}>Авторизации через Яндекс</TableCell>
                            </TableRow>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell style={{ width: '15%' }} >#</TableCell>
                              <TableCell>Дата и время авторизации</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {login_yandex.map((item, key) =>
                              <TableRow hover key={key}>
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>{item.date_time}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    }
                  </Grid>

                </TabPanel>
              </Grid>
            }
            {/* Авторизации */}

          </DialogContent>

          <DialogActions>
            <Button variant="contained" onClick={this.onClose.bind(this)}>
              Закрыть
            </Button>
          </DialogActions>

        </Dialog>
      </>
    );
  }
}

class SiteClients_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_clients',
      module_name: '',
      is_load: false,

      acces: null,
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      activeTab: 0,

      search: '',
      clients: [],

      number: '',
      order: '',
      search_orders: [],
      addr: '',
      promo: '',

      cities: [],
      city_id: [],

      all_items: [],
      items: [],

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      modalDialog: false,
      client_login: '',
      client_id: '',
      client: null,
      orders: [],
      err_orders: [],
      comments: [],

      days: [],
      months: [
        {'id': 1, 'name': "января"},
        {'id': 2, 'name': "февраля"},
        {'id': 3, 'name': "марта"},
        {'id': 4, 'name': "апреля"},
        {'id': 5, 'name': "мая"},
        {'id': 6, 'name': "июня"},
        {'id': 7, 'name': "июля"},
        {'id': 8, 'name': "августа"},
        {'id': 9, 'name': "сентября"},
        {'id': 10, 'name': "октября"},
        {'id': 11, 'name': "ноября"},
        {'id': 12, 'name': "декабря"},
      ],

      modalDialog_order: false,
      showOrder: null,

      modalDialogAction: false,
      comment_id: null,

      login_sms: [],
      login_yandex: [],
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    if(data){
      this.setState({
        all_items: data.all_items,
        cities: data.cities,
        acces: data.acces,
        module_name: data.module_info.name
      });

      document.title = data.module_info.name;
    }

  }

  getData = (method, data = {}, dop_type = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel_local(this.state.module, method, data, dop_type)
      .then(result => {

        if(method === 'export_file_xls') {
          return result;
        } else {
          return result.data;
        }

      })
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

  changeTab(event, val){
    this.setState({
      activeTab: val
    })
  }

  changeInput(data, type, event) {

    if(type === 'clear') {

      this.setState({
        [data]: ''
      })

    } else {

      let value = event.target.value;

      this.setState({
        [data]: value
      });

    }
    
  }

  changeSearch(data, event) {

    if(data === 'clear') {

      this.setState({
        [data]: '',
        clients: []
      })

    } else {

      let login = event.target.value;

      this.setState({
        [data]: login
      });

    }
    
  }

  changeAutocomplite(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : ''
    });
  }

  async downLoad() {

    const number = this.state.number;
    const city_id = this.state.city_id;
    let date_start = this.state.date_start;
    let date_end = this.state.date_end;
    let order = this.state.order;
    let items = this.state.items;
    let addr = this.state.addr;
    let promo = this.state.promo;

    if (!city_id.length) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;
    } 

    if (!date_start || !date_end) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать даты'
      });

      return;
    } 

    date_start = dayjs(date_start).format('YYYY-MM-DD');
    date_end = dayjs(date_end).format('YYYY-MM-DD');

    const data = {
      number,
      city_id,
      date_start,
      date_end,
      order,
      items,
      addr,
      promo
    }

    const dop_type = {
      responseType: 'blob',
    }

    const res = await this.getData('export_file_xls', data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Таблица с заказами.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async getClients() {
    const search = this.state.search;

    if (!search || search.length < 4) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать минимум 4 цифры из номера телефона'
      });

      return;
    } 

    const data = {
      search
    }

    const res = await this.getData('get_clients', data);

    if (res.st) {

      if(!res.clients.length) {

        this.setState({
          openAlert: true,
          err_status: false,
          err_text: 'Клиенты с таким номером не найдены'
        });

      }

      this.setState({
        clients: res.clients
      });
      
    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }

  }

  async getOrders() {
    const number = this.state.number;
    const city_id = this.state.city_id;
    let date_start = this.state.date_start;
    let date_end = this.state.date_end;
    let order = this.state.order;
    let items = this.state.items;
    let addr = this.state.addr;
    let promo = this.state.promo;

    date_start = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
    date_end = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';

    if (!city_id.length) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;
    } 

    if ( (!date_start && !date_end) || !date_start || !date_end) {

      if( number.length > 0 || order.length > 0 || items.length > 0 || addr.length > 0 || promo.length > 0 ) {

      }else{
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: 'Необходимо указать дату или что-то кроме нее'
        });
  
        return;
      }
    } 

    const data = {
      number,
      city_id,
      date_start,
      date_end,
      order,
      items,
      addr,
      promo
    }

    const res = await this.getData('get_orders', data);

    if (res.search_orders.length) {

      this.setState({
        search_orders: res.search_orders
      });
      
    } else {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Заказы с заданными параметрами не найдены',
        search_orders: []
      });

    }

  }

  async openModalClient(login, type) {
    this.handleResize();

    const data = {
      login
    }

    const res = await this.getData('get_one_client', data);

    const days = Array.from({length: 31}, (_, i) => ({id: i + 1, name: i + 1}));

    if(res.client_info.date_bir) {
      const date = res.client_info.date_bir.split('-');

      const day = days.find(it => parseInt(it.id) == parseInt(date[2]));
      const month = this.state.months.find(it => parseInt(it.id) == parseInt(date[1]));

      if(day) {
        res.client_info.day = day.id;
      }

      if(month) {
        res.client_info.month = month.id;
      }

    }

    if(type === 'open') {
      this.setState({
        modalDialog: true,
      });
    }

    this.setState({
      client_id: res.client_info.id,
      client_login: login,
      client: res.client_info,
      orders: res.client_orders,
      err_orders: res.err_orders,
      comments: res.client_comments,
      login_sms: res.client_login_sms,
      login_yandex: res.client_login_yandex,
      days
    });

  }

  async openClientOrder(order_id, point_id){
    this.handleResize();

    const data = {
      order_id,
      point_id
    };

    const res = await this.getData('get_one_order', data);

    this.setState({
      showOrder: res,
      modalDialog_order: true
    })
  }

  openSaveAction(comment_id) {
    this.setState({
      modalDialogAction: true,
      comment_id
    });
  }

  async saveEdit(data) {
    const res = await this.getData('save_edit_client', data);

    if (res.st) {

      const login = this.state.client_login;

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      this.openModalClient(login, 'update');

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async saveComment(data) {
    const res = await this.getData('save_comment', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        comments: res.client_comments,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async saveCommentAction(data) {
    const res = await this.getData('save_action', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        comments: res.client_comments,
        modalDialogAction: false
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async savePromo(percent){
    const number = this.state.client_login;

    const data = {
      number,
      percent
    }

    await this.getData('save_promo', data);
  }

  async sendCode(){
    const number = this.state.client_login;
    const user_id = this.state.client_id;

    const data = {
      number,
      user_id
    }

    const res = await this.getData('get_code', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        login_sms: res.client_login_sms,
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
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <SiteClients_Modal_Client
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, client: null, client_login: '' })}
          item={this.state.client}
          fullScreen={this.state.fullScreen}
          item_login={this.state.client_login}
          acces={this.state.acces}
          days={this.state.days}
          months={this.state.months}
          orders={this.state.orders}
          err_orders={this.state.err_orders}
          saveEdit={this.saveEdit.bind(this)}
          saveComment={this.saveComment.bind(this)}
          openClientOrder={this.openClientOrder.bind(this)}
          openSaveAction={this.openSaveAction.bind(this)}
          comments={this.state.comments}
          login_sms={this.state.login_sms}
          login_yandex={this.state.login_yandex}
          sendCode={this.sendCode.bind(this)}
        />

        <SiteClients_Modal_Client_Order
          open={this.state.modalDialog_order}
          onClose={() => this.setState({ modalDialog_order: false })}
          showOrder={this.state.showOrder}
          fullScreen={this.state.fullScreen}
        />

        <SiteClients_Modal_Comment_Action
          open={this.state.modalDialogAction}
          onClose={() => this.setState({ modalDialogAction: false, comment_id: null })}
          comment_id={this.state.comment_id}
          fullScreen={this.state.fullScreen}
          savePromo={this.savePromo.bind(this)}
          saveCommentAction={this.saveCommentAction.bind(this)}
          client_login={this.state.client_login}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>

          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingBottom: 24 }}>
            <Paper>
              <Tabs value={this.state.activeTab} onChange={ this.changeTab.bind(this) } centered variant='fullWidth'>
                {parseInt(this.state.acces?.search_clients) ? <Tab label="Поиск клиента" {...a11yProps(0)} /> : null}
                {parseInt(this.state.acces?.search_orders) ? <Tab label="Поиск заказов" {...a11yProps(1)} /> : null}
              </Tabs>
            </Paper>
          </Grid>

          {/* Поиск клиента */}
            {!parseInt(this.state.acces?.search_clients) ? null :
              <Grid item xs={12} sm={12} style={{ paddingTop: 0, paddingBottom: '40px' }}>
              <TabPanel 
                value={this.state.activeTab} 
                index={parseInt(this.state.acces?.search_clients) ? 0 : null} 
                id='clients'
              >

                <Grid item xs={12} sm={6} mt={5} mr={5}>
                  <MyTextInput
                    type='number'
                    className="input_login"
                    label="Поиск по номеру телефона"
                    value={this.state.search}
                    func={this.changeSearch.bind(this, 'search')}
                    inputAdornment={{
                      endAdornment: (
                        <>
                          {!this.state.search ? null :
                            <InputAdornment position="end">
                            <IconButton>
                              <ClearIcon onClick={this.changeSearch.bind(this, 'clear')} />
                            </IconButton>
                          </InputAdornment>
                          }
                        </>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4} mt={5}>
                  <Button onClick={this.getClients.bind(this)} variant="contained">
                    Показать
                  </Button>
                </Grid>

                <Grid item xs={12} sm={12} mt={5}>
                  <TableContainer sx={{ maxHeight: { xs: 'none', sm: 570 } }} component={Paper}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Имя</TableCell>
                          <TableCell>Номер телефона</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.clients.map((item, key) =>
                          <TableRow 
                            hover 
                            key={key} 
                            style={{ cursor: 'pointer' }} 
                            onClick={this.openModalClient.bind(this, item.login, 'open')} 
                          >
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.login}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

              </TabPanel>
              </Grid>
            }
          {/* Поиск клиента */}

          {/* Поиск заказов */}
            {!parseInt(this.state.acces?.search_orders) ? null :
              <Grid item xs={12} sm={12} style={{ paddingTop: 0, paddingBottom: '40px' }}>
                <TabPanel 
                  value={this.state.activeTab} 
                  index={parseInt(this.state.acces?.search_clients) && parseInt(this.state.acces?.search_orders) ? 1 : 0} 
                  id='clients'
                >

                  <Grid container spacing={3}>

                    <Grid item xs={12} sm={4}>
                      <MyAutocomplite
                        label="Город"
                        multiple={true}
                        data={this.state.cities}
                        value={this.state.city_id}
                        func={this.changeAutocomplite.bind(this, 'city_id')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyDatePickerNew
                        label="Дата от"
                        customActions={true}
                        value={dayjs(this.state.date_start)}
                        func={this.changeDateRange.bind(this, 'date_start')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyDatePickerNew
                        label="Дата до"
                        customActions={true}
                        value={dayjs(this.state.date_end)}
                        func={this.changeDateRange.bind(this, 'date_end')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyTextInput
                        type='number'
                        className="input_login"
                        label="Номер заказа"
                        value={this.state.order}
                        func={this.changeInput.bind(this, 'order', 'edit')}
                        inputAdornment={{
                          endAdornment: (
                            <>
                              {!this.state.order ? null :
                                <InputAdornment position="end">
                                <IconButton>
                                  <ClearIcon onClick={this.changeInput.bind(this, 'order', 'clear')} />
                                </IconButton>
                              </InputAdornment>
                              }
                            </>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyTextInput
                        type='number'
                        className="input_login"
                        label="Номер телефона"
                        value={this.state.number}
                        func={this.changeInput.bind(this, 'number', 'edit')}
                        inputAdornment={{
                          endAdornment: (
                            <>
                              {!this.state.number ? null :
                                <InputAdornment position="end">
                                <IconButton>
                                  <ClearIcon onClick={this.changeInput.bind(this, 'number', 'clear')} />
                                </IconButton>
                              </InputAdornment>
                              }
                            </>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyTextInput
                        type='text'
                        className="input_promo"
                        label="Промокод"
                        value={this.state.promo}
                        func={this.changeInput.bind(this, 'promo', 'edit')}
                        inputAdornment={{
                          endAdornment: (
                            <>
                              {!this.state.number ? null :
                                <InputAdornment position="end">
                                <IconButton>
                                  <ClearIcon onClick={this.changeInput.bind(this, 'promo', 'clear')} />
                                </IconButton>
                              </InputAdornment>
                              }
                            </>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <MyTextInput
                        className="input_login"
                        label="Адрес клиента"
                        value={this.state.addr}
                        func={this.changeInput.bind(this, 'addr', 'edit')}
                        inputAdornment={{
                          endAdornment: (
                            <>
                              {!this.state.addr ? null :
                                <InputAdornment position="end">
                                <IconButton>
                                  <ClearIcon onClick={this.changeInput.bind(this, 'addr', 'clear')} />
                                </IconButton>
                              </InputAdornment>
                              }
                            </>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                      <MyAutocomplite
                        label="Товары в заказе"
                        multiple={true}
                        data={this.state.all_items}
                        value={this.state.items}
                        func={this.changeAutocomplite.bind(this, 'items')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <Button onClick={this.getOrders.bind(this)} variant="contained">
                        Показать
                      </Button>
                    </Grid>

                    {!parseInt(this.state.acces?.download_file) ? null :
                      !this.state.search_orders.length ? null :
                        <Grid item xs={12} sm={2} x={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={<Typography color="inherit">{'Скачать таблицу в Excel'}</Typography>}> 
                            <IconButton disableRipple sx={{ padding: 0 }} onClick={this.downLoad.bind(this)}>
                              <ExlIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                    }

                  </Grid>

                  <Grid item xs={12} sm={12} mt={5}>
                    <TableContainer sx={{ maxHeight: { xs: 'none', sm: 570 } }} component={Paper}>
                        <Table size={'small'} stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Заказ</TableCell>
                            <TableCell>Точка</TableCell>
                            <TableCell>Оформил</TableCell>
                            <TableCell>Номер клиента</TableCell>
                            <TableCell>Адрес доставки</TableCell>
                            <TableCell>Время открытия заказа</TableCell>
                            <TableCell>Ко времени</TableCell>
                            <TableCell>Закрыт на кухне</TableCell>
                            <TableCell>Получен клиентом</TableCell>
                            <TableCell>Время обещ</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Оплата</TableCell>
                            <TableCell>Водитель</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          
                          { this.state.search_orders.map( (item, key) =>
                            <TableRow 
                              hover
                              key={key} 
                              style={parseInt(item.is_delete) == 1 ? {backgroundColor: 'red', color: '#fff', fontWeight: 'bold'} : {}}
                              sx={{ cursor: 'pointer' }}
                              onClick={this.openClientOrder.bind(this, item.id, item.point_id)} 
                            >
                              <TableCell 
                                style={ parseInt(item.dist) >= 0 ? {backgroundColor: 'yellow', color: '#000', cursor: 'pointer', fontWeight: 'inherit'} : {color: 'inherit', cursor: 'pointer', fontWeight: 'inherit'} } 
                              >
                                {item.id}
                              </TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.point_addr}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.type_user}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.number}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.street} {item.home}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.date_time_order}</TableCell>
                              <TableCell 
                                style={{ color: 'inherit', fontWeight: 'inherit', backgroundColor: parseInt(item.is_preorder) == 1 ? '#bababa' : 'inherit' }}
                              >
                                {item.need_time}
                              </TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>
                                { item.give_data_time == '00:00:00' ? '' : item.give_data_time}
                              </TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.close_order}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>
                                {item.unix_time_to_client == '0' || parseInt(item.is_preorder) == 1 ? '' : item.unix_time_to_client}
                              </TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.type_order}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.status}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.order_price}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.type_pay}</TableCell>
                              <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.driver}</TableCell>
                            </TableRow>
                          ) }
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                </TabPanel>
              </Grid>
            }
          {/* Поиск заказов */}
             
        </Grid>
      </>
    );
  }
}

export default function SiteClients() {
  return <SiteClients_ />;
}
