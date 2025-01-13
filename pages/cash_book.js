import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';

import HelpIcon from '@mui/icons-material/Help';

import { MySelect, MyTextInput, MyDatePickerNew, formatDate } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

const text = {
  'virycka_fiz': 'Выручка проставляется автоматически на основании Z-отчетов после закрытия кассовой смены',
  'virycka_driver': 'Выручка проставляется автоматически на основании Z-отчетов после закрытия кассовой смены',
  'zaim_fiz': 'Проставляется бухгалтерией в случае внесения руководителя займа в кассу кафе, если не хватает д/с в кассе, например, на выдачу з/платы',
  'zaim_driver': 'Проставляется руководителем сумму которую выдал управляющему на расходы',
  'peremeshenie': 'Проставляется управляющим в случае, если у него не хватает д/с в кассе и он берет их из курьерской кассы',
  'zp_fiz': 'Проставляется бухгалтерией на основании платежных ведомостей на выплату з/платы',
  'zp_driver': 'Проставляются автоматически сумма которую заработали курьеры',
  'incasacia': 'Проставляется управляющим в случае инкассации в банк',
  'vozvrat_fiz': 'Проставляется бухгалтерией в случае возврата из кассы ранее внесенного займа руководителем',
  'vozvrat_driver': 'Проставляется управляющим, которую сдает руководителю',
  'otchet_fiz': 'Проставляется управляющим с случае, если он взял из кассы д/с для покупки и отчитаться по авансовому отчету',
  'otchet_driver': 'Все наличные расходы управляющего за месяц',
  'cash_from_bank_fiz': 'Проставляется бухгалтерией, после того как управляющий снимет наличные в банк, например на выдачу з/платы',
  'cash_from_bank_driver': 'Проставляется бухгалтерией, после того как управляющий снимет наличные в банк, например на выдачу з/платы',
};

class MainTableRow extends React.Component {
  //label
  //is_edit
  //is_open
  //type
  //table
  //data_plus
  //data_minus
  //data_hist
  //tooltip

  /**
   * 
   * <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
            <Collapse in={this.props?.is_open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Сотрудник</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell>Комментарий</TableCell>
                      <TableCell>Наличка</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
  
                    {this.props.data_hist?.map( item => 
                      
                      <TableRow key={item.id}>
                        <TableCell>{item.user_name}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.comment}</TableCell>
                        <TableCell>{item.summ}</TableCell>
                        <TableCell>
                          
                          { this.props?.is_delete === true ?
                            <IconButton onClick={this.props.updateData.bind(this, item, 'Редактирование ' + kassa_text+': '+this.props?.label)}>
                              <EditIcon style={{ color: 'rgba(255, 3, 62, 1)' }} />
                            </IconButton>
                              :
                            false
                          }

                          { this.props?.is_delete === true ?
                            <IconButton onClick={this.props.deleteData.bind(this, item, 'delete')}>
                              <CloseIcon style={{ color: 'rgba(255, 3, 62, 1)' }} />
                            </IconButton>
                              :
                            false
                          }
                        </TableCell>
                      </TableRow>

                    )}

                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
   */
  

  render () {

    const kassa_text = this.props.table == 'fiz' ? 'Физические кассы' : 'Курьерская наличка';

    console.log( this.props.table, this.props.type, this.props?.is_delete, this.props?.is_edit, this.props?.is_delete == false && this.props?.is_edit === false )

    return(
      <React.Fragment>
        <TableRow>
          <TableCell onClick={this.props.toogleCollapseTable.bind(this, this.props.type, this.props.table)} style={{ cursor: 'pointer' }}>
            { this.props?.is_edit === false ?
              <Typography 
                component="span"
              >
                {this.props?.label}
              </Typography>
                :
              <Typography 
                component="span"
                //onClick={this.props.addData.bind(this, 'virycka', this.props.table, this.props?.virycka_arr, kassa_text+': Выручка')} 
                //onClick={this.props.toogleCollapseTable.bind(this, this.props.type, this.props.table)}
                style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
              >
                {this.props?.label}
                <Tooltip title={<Typography color="inherit">{ this.props.tooltip }</Typography>}> 
                  <IconButton>
                    <HelpIcon color="primary" />
                  </IconButton>
                </Tooltip>
              </Typography>
            }
            
          </TableCell>
          <TableCell 
            style={{ backgroundColor: 'rgba(3, 192, 60, 0.8)', color: '#fff', cursor: 'pointer' }}
            onClick={this.props.addData.bind(this, this.props.type, this.props.table, this.props.data_hist, kassa_text+': '+this.props?.label)}
          >
            {this.props?.data_plus ?? ''}
          </TableCell>
          <TableCell 
            style={{ backgroundColor: 'rgba(255, 3, 62, 1)', color: '#fff', cursor: 'pointer' }}
            onClick={this.props.addData.bind(this, this.props.type, this.props.table, this.props.data_hist, kassa_text+': '+this.props?.label)}
          >{
            this.props?.data_minus ?? ''}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
            <Collapse in={this.props?.is_open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
  
                    {this.props.data_hist?.map( (item, key) => 
                      <React.Fragment key={key}>
                        <TableRow onClick={this.props.toogleCollapseTableRow.bind(this, this.props.type, this.props.table, key)} style={{ cursor: 'pointer' }}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.summ}</TableCell>
                          <TableCell><ExpandMoreIcon style={{ display: 'flex', transform: item.is_open ? 'rotate(180deg)' : 'rotate(0deg)' }}/></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                            <Collapse in={item.is_open} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 1 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Сотрудник</TableCell>
                                      <TableCell>Дата</TableCell>
                                      <TableCell>Комментарий</TableCell>
                                      <TableCell>Наличка</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                  
                                    {item['data']?.map( item => 
                                      
                                      <TableRow key={item.id}>
                                        <TableCell>{item.user_name}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.comment}</TableCell>
                                        <TableCell>{item.summ}</TableCell>
                                        <TableCell>
                                          
                                          { this.props?.is_delete == false || this.props?.is_edit === false ? false :
                                            <IconButton onClick={this.props.updateData.bind(this, item, 'Редактирование ' + kassa_text+': '+this.props?.label)}>
                                              <EditIcon style={{ color: 'rgba(255, 3, 62, 1)' }} />
                                            </IconButton>
                                          }

                                          { this.props?.is_delete == false || this.props?.is_edit === false ? false :
                                            <IconButton onClick={this.props.deleteData.bind(this, item, 'delete')}>
                                              <CloseIcon style={{ color: 'rgba(255, 3, 62, 1)' }} />
                                            </IconButton>
                                          }
                                        </TableCell>
                                      </TableRow>

                                    )}

                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>

                      </React.Fragment>
                    )}

                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>



          
        </TableRow>
      </React.Fragment>
    )
  }
}

class MainTable extends React.Component {
  render () {

    const kassa_text = this.props.table == 'fiz' ? 'Физические кассы' : 'Курьерская наличка';

    console.log( 'vidacha_otchet_arr', this.props?.vidacha_otchet, this.props?.vidacha_otchet_arr )

    return (
      <TableContainer component={Paper}>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan="3" style={{ textAlign: 'center' }}>{ kassa_text }</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(3, 192, 60, 0.8)', color: '#fff', textAlign: 'center' }}>Приход</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(255, 3, 62, 1)', color: '#fff', textAlign: 'center' }}>Расход</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            
            <TableRow>
              <TableCell>
                { this.props?.ostatok_nachalo_dnya_is_edit === false ?
                  <Typography 
                    component="span"
                  >
                    Остаток на начало дня
                  </Typography>
                    :
                  <Typography 
                    component="span"
                    onClick={this.props.addData.bind(this, 'ostatok_nachalo_dnya', this.props.table, this.props?.ostatok_nachalo_dnya_arr, kassa_text+': Остаток на начало дня')} 
                    style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                  >
                    Остаток на начало дня
                  </Typography>
                }
              </TableCell>
              <TableCell style={{ backgroundColor: 'rgba(3, 192, 60, 0.8)', color: '#fff' }}>{this.props?.ostatok_nachalo_dnya}</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(255, 3, 62, 1)', color: '#fff' }}></TableCell>
            </TableRow>

            
            <MainTableRow 
              label={'Выручка'}
              is_edit={'show'}
              is_open={this.props?.virycka_is_open}
              type={'virycka'}
              table={this.props.table}
              data_plus={this.props?.virycka}
              //data_minus
              data_hist={this.props?.virycka_arr}
              tooltip={this.props.table == 'fiz' ? text.virycka_fiz : text.virycka_driver}

              toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
              toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
              addData={this.props.addData.bind(this)}

              is_delete={false}
            />
            

            { this.props.table == 'fiz' ?
              this.props?.cash_from_bank_is_edit === false ? false :
              <MainTableRow 
                label={'Снятие наличных в банке'}
                is_edit={this.props?.cash_from_bank_is_edit}
                is_open={this.props?.cash_from_bank_is_open}
                type={'cash_from_bank'}
                table={this.props.table}
                data_plus={this.props?.cash_from_bank}
                //data_minus
                data_hist={this.props?.cash_from_bank_arr}
                tooltip={this.props.table == 'fiz' ? text.cash_from_bank_fiz : text.cash_from_bank_driver}

                toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                addData={this.props.addData.bind(this)}

                is_delete={this.props?.cash_from_bank_is_edit}
                deleteData={this.props.deleteData.bind(this)}
                updateData={this.props.updateData.bind(this)}
              />
                : 
              false
            }

            { this.props?.zaim_is_edit === false ? false :
              <MainTableRow 
                label={this.props.table == 'fiz' ? 'Заемные средства' : 'Выдано'}
                is_edit={this.props?.zaim_is_edit}
                is_open={this.props?.zaim_is_open}
                type={'zaim'}
                table={this.props.table}
                data_plus={this.props?.zaim}
                //data_minus
                data_hist={this.props?.zaim_arr}
                tooltip={this.props.table == 'fiz' ? text.zaim_fiz : text.zaim_driver}

                toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                addData={this.props.addData.bind(this)}

                is_delete={this.props?.zaim_is_edit}
                deleteData={this.props.deleteData.bind(this)}
                updateData={this.props.updateData.bind(this)}
              />
            }

            { this.props?.vedomosm_zp_is_edit === false ? false :
              <MainTableRow 
                label={this.props.table == 'fiz' ? 'Платежная ведомость на выплату заработной платы' : 'Выплата за услуги курьера'}
                is_edit={this.props?.vedomosm_zp_is_edit}
                is_open={this.props?.vedomosm_zp_is_open}
                type={'vedomosm_zp'}
                table={this.props.table}
                //data_plus={this.props?.vedomosm_zp}
                data_minus={this.props?.vedomosm_zp}
                data_hist={this.props?.vedomosm_zp_arr}
                tooltip={this.props.table == 'fiz' ? text.zp_fiz : text.zp_driver}
                

                toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                addData={this.props.addData.bind(this)}

                is_delete={this.props?.vedomosm_zp_is_edit}
                deleteData={this.props.deleteData.bind(this)}
                updateData={this.props.updateData.bind(this)}
              />
            }

            { this.props.table == 'fiz' ?
              this.props?.incasacia_is_edit === false ? false :
              <MainTableRow 
                label={'Инкассация'}
                is_edit={this.props?.incasacia_is_edit}
                is_open={this.props?.incasacia_is_open}
                type={'incasacia'}
                table={this.props.table}
                //data_plus={this.props?.vedomosm_zp}
                data_minus={this.props?.incasacia}
                data_hist={this.props?.incasacia_arr}
                tooltip={text.incasacia}

                toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                addData={this.props.addData.bind(this)}

                is_delete={this.props?.incasacia_is_edit}
                deleteData={this.props.deleteData.bind(this)}
                updateData={this.props.updateData.bind(this)}
              />
                :
              false
            }

            { this.props?.vozvrat_zaim_is_edit === false ? false :
              <MainTableRow 
                label={this.props.table == 'fiz' ? 'Возврат займа' : 'Сдано'}
                is_edit={this.props?.vozvrat_zaim_is_edit}
                is_open={this.props?.vozvrat_zaim_is_open}
                type={'vozvrat_zaim'}
                table={this.props.table}
                //data_plus={this.props?.vedomosm_zp}
                data_minus={this.props?.vozvrat_zaim}
                data_hist={this.props?.vozvrat_zaim_arr}
                tooltip={this.props.table == 'fiz' ? text.vozvrat_fiz : text.vozvrat_driver}

                toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                addData={this.props.addData.bind(this)}

                is_delete={this.props?.vozvrat_zaim_is_edit}
                deleteData={this.props.deleteData.bind(this)}
                updateData={this.props.updateData.bind(this)}
              />
            }

            { this.props.table == 'fiz' ?
              this.props?.vidacha_otchet_is_edit === false ? false :
                <MainTableRow 
                  label={'Выдача в подотчет'}
                  is_edit={this.props?.vidacha_otchet_is_edit}
                  is_open={this.props?.vidacha_otchet_is_open}
                  type={'vidacha_otchet'}
                  table={this.props.table}
                  //data_plus={this.props?.vedomosm_zp}
                  data_minus={this.props?.vidacha_otchet}
                  data_hist={this.props?.vidacha_otchet_arr}
                  tooltip={this.props.table == 'fiz' ? text.otchet_fiz : text.otchet_driver}

                  toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                  toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                  addData={this.props.addData.bind(this)}

                  is_delete={this.props?.vidacha_otchet_is_edit}
                  deleteData={this.props.deleteData.bind(this)}
                  updateData={this.props.updateData.bind(this)}
                />
                  :
                false
            }

            { this.props.table == 'driver_cash' ?
              this.props?.vidacha_otchet_is_edit === false ? false :
                <MainTableRow 
                  label={'Расходы управляющего'}
                  is_edit={this.props?.vidacha_otchet_is_edit}
                  is_open={this.props?.vidacha_otchet_is_open}
                  type={'vidacha_otchet'}
                  table={this.props.table}
                  //data_plus={this.props?.vedomosm_zp}
                  data_minus={this.props?.vidacha_otchet}
                  data_hist={this.props?.vidacha_otchet_arr}
                  tooltip={this.props.table == 'fiz' ? text.otchet_fiz : text.otchet_driver}

                  toogleCollapseTable={this.props.toogleCollapseTable.bind(this)}
                  toogleCollapseTableRow={this.props.toogleCollapseTableRow.bind(this)}
                  addData={this.props.addData.bind(this)}

                  is_delete={this.props?.vidacha_otchet_is_edit}
                  deleteData={this.props.deleteData.bind(this)}
                  updateData={this.props.updateData.bind(this)}
                />
                  :
                false
            }
            
            
            <TableRow>
              <TableCell>Итого</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(3, 192, 60, 0.8)', color: '#fff' }}>{this.props?.itog_plus}</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(255, 3, 62, 1)', color: '#fff' }}>{this.props?.itog_minus}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Остаток на конец дня</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(3, 192, 60, 0.8)', color: '#fff' }}>{this.props?.ostatok_konec_dnya}</TableCell>
              <TableCell style={{ backgroundColor: 'rgba(255, 3, 62, 1)', color: '#fff' }}></TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}

class CashBook_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);
        
    this.state = {
      module: 'cash_book',
      module_name: '',
      is_load: false,
      
      points: [],
      point: '0',
      
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      date: formatDate(new Date()),
      rangeDate: [formatDate(new Date()), formatDate(new Date())],

      modalDialog: false,
      modalDialogEdit: false,

    
      summ: 0,

      getSumm: 0,
      modalDialogGetSumm: false,
      getSummDriverId: null,
      getSummComment: '',

      modalDialogStatSumm: false,
      modalDialogStatSummMain: false,
      statSumm: [],
      statSummMain: [],

      show_dop: 0,

      fiz_kassa: {},
      driver_kassa: {},
      openModalType: '',
      openModalType_edit: false,
      comment: '',
      type: '',
      openModalKassa: '',
      openModalTitle: '',
      openModalHist_data: [],

      type_action: '',
      data_action: null,
      comment_action: '',
      is_open_action: false,

      hist: []
    };
  }
  
  async componentDidMount(){
    
    let data = await this.getData('get_all');
    
    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
    })
    
    document.title = data.module_info.name;
    
    setTimeout( () => {
      this.updateData();
    }, 50 )
  }
  
  getData = (method, data = {}) => {
    
    this.setState({
      is_load: true
    })
    
    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded'},
      body: queryString.stringify({
        method: method, 
        module: this.state.module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify( data )
      })
    }).then(res => res.json()).then(json => {
      
      if( json.st === false && json.type == 'redir' ){
        window.location.pathname = '/';
        return;
      }
      
      if( json.st === false && json.type == 'auth' ){
        window.location.pathname = '/auth';
        return;
      }
      
      setTimeout( () => {
        this.setState({
          is_load: false
        })
      }, 300 )
      
      return json;
    })
    .catch(err => { 
      console.log( err )
    });
  }
   
  async updateData(){
    let data = {
      point_id: this.state.point,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('get_data', data);
    
    if( res?.st === true ){
      this.setState({
        fiz_kassa: res.fiz_kassa,
        driver_kassa: res.driver_kassa,
      })
    }else{
      alert(res['text'])
      this.setState({
        fiz_kassa: [],
        driver_kassa: [],
      })
    }
  }
  
  changeDate(data, event){
    this.setState({
      [data]: (event)
    })

    if( data == 'date' ){
      this.getHist(this.state.openModalType, event);
    }
  }

  changePoint(event){
    let data = event.target.value;
    
    this.setState({
      point: data
    })
  }

  changeSumm(event){
    this.setState({
      summ: event.target.value,
    })
  }

  changeComment(data, event){
    this.setState({
      [data]: event.target.value,
    })
  }

  async saveGivePrice(){
    if( this.click ){
      return ;
    }

    this.click = true;

    if( parseInt( this.state.summ ) == 0 || this.state.comment.length == 0 || this.state.date.length == 0 ){
      alert('Необходимо указать сумму и комментарий и дату');

      setTimeout( () => {
        this.click = false;
      }, 300 )

      return;
    }


    let data = {
      point_id: this.state.point,
      price: this.state.summ,
      comment: this.state.comment,
      type: this.state.openModalType,
      kassa: this.state.openModalKassa,
      date: dayjs(this.state.date).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('save_give', data);

    if( res['st'] == true ){
      this.setState({
        modalDialog: false,
      })

      this.updateData();
    }else{
      alert(res['text'])
    }

    setTimeout( () => {
      this.click = false;
    }, 300 )
  }

  toogleCollapseTable(type, kassa){

    let driver_kassa = this.state.driver_kassa;
    let fiz_kassa = this.state.fiz_kassa;

    if( kassa == 'driver_cash' ){
      driver_kassa[ type+'_is_open' ] = !driver_kassa[ type+'_is_open' ];
    }else{
      fiz_kassa[ type+'_is_open' ] = !fiz_kassa[ type+'_is_open' ];
    }

    this.setState({
      driver_kassa: driver_kassa,
      fiz_kassa: fiz_kassa,
    })
  }

  toogleCollapseTableRow(type, kassa, key){

    let driver_kassa = this.state.driver_kassa;
    let fiz_kassa = this.state.fiz_kassa;

    if( kassa == 'driver_cash' ){
      driver_kassa[ type+'_arr' ][ key ]['is_open'] = !driver_kassa[ type+'_arr' ][ key ]['is_open'];
    }else{
      fiz_kassa[ type+'_arr' ][ key ]['is_open'] = !fiz_kassa[ type+'_arr' ][ key ]['is_open'];
    }

    this.setState({
      driver_kassa: driver_kassa,
      fiz_kassa: fiz_kassa,
    })
  }

  addData(type, kassa, hist, title){

    if( kassa == 'driver_cash' ){
      this.setState({
        openModalType: type,
        openModalType_edit: this.state.driver_kassa[ type+'_is_edit' ] == 'edit' ? true : false,
        openModalKassa: kassa,
        openModalTitle: title,
        openModalHist_data: hist,
  
        modalDialog: true,
        comment: '',
        summ: 0,
      })
    }else{
      this.setState({
        openModalType: type,
        openModalType_edit: this.state.fiz_kassa[ type+'_is_edit' ] == 'edit' ? true : false,
        openModalKassa: kassa,
        openModalTitle: title,
        openModalHist_data: hist,

        modalDialog: true,
        comment: '',
        summ: 0,
      })
    }

    this.getHist(type, this.state.date);
  }

  deleteData(item, type){
    this.setState({
      type_action: type,
      data_action: item,
      comment_action: '',
      is_open_action: true
    })
  }

  closeAction(){
    this.setState({
      type_action: '',
      data_action: null,
      comment_action: '',
      is_open_action: false
    })
  }

  async saveAction(){
    let data = {
      type: this.state.type_action,
      item: this.state.data_action,
      comment: this.state.comment_action,
      point_id: this.state.point,
    };

    let res = await this.getData('save_action', data);

    if( res['st'] == true ){
      this.setState({
        type_action: '',
        data_action: null,
        comment_action: '',
        is_open_action: false
      })

      this.updateData();
    }else{
      alert(res['text'])
    }
  }

  updateItem(item, title){
    this.setState({
      summ: item?.summ,
      date: formatDate(item?.date),
      comment: item?.comment,
      modalDialogEdit: true,
      data_action: item,
      openModalTitle: title
    })
  }

  async saveUpdateAction(){

    let item = this.state.data_action;

    item.summ = this.state.summ;
    item.date = dayjs(this.state.date).format('YYYY-MM-DD');
    item.comment = this.state.comment;

    let data = {
      type: 'update',
      item: item,
      comment: '',
      point_id: this.state.point,
    };

    let res = await this.getData('save_action', data);

    if( res['st'] == true ){
      this.setState({
        type_action: '',
        data_action: null,
        comment_action: '',
        is_open_action: false,
        modalDialogEdit: false,
        summ: 0,
        comment: ''
      })

      this.updateData();
    }else{
      alert(res['text'])
    }
  }

  async getHist(type, date){
    let data = {
      point_id: this.state.point,
      date: dayjs(date).format('YYYY-MM-DD'),
      type: type
    };

    let res = await this.getData('get_hist', data);

    this.setState({ 
      hist: res 
    });
  }

  get_type(type){
    if( type == 'delete' ){
      return 'Удален';
    }

    if( type == 'create' ){
      return 'Создан';
    }

    if( type == 'update' ){
      return 'Обновлен';
    }
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Dialog
          fullWidth={true}
          maxWidth={'md'}
          open={this.state.modalDialog}
          onClose={ () => { this.setState({ modalDialog: false, comment: '', openModalType: '', openModalKassa: '', summ: 0 }) } }
        >
          <DialogTitle>{this.state.openModalTitle}</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            
            <Grid container spacing={3}>

              { this.state.openModalType_edit === false ? false :
                <Grid item xs={12} sm={6}>
                  <MyTextInput label="Сумма" value={this.state.summ} type={'number'} func={this.changeSumm.bind(this)} />
                </Grid>
              }

              { this.state.openModalType_edit === false ? false :
                <Grid item xs={12} sm={6}>
                  <MyDatePickerNew label="Дата" value={ this.state.date } func={ this.changeDate.bind(this, 'date') } />
                </Grid>
              }

              { this.state.openModalType_edit === false ? false :
                <Grid item xs={12} sm={12}>
                  <MyTextInput label="Комментарий" value={this.state.comment} multiline={true} maxRows={3} type={'text'} func={this.changeComment.bind(this, 'comment')} />
                </Grid>
              }

              <Grid item xs={12} sm={12}>
                <TableContainer component={Paper}>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Время</TableCell>
                        <TableCell>Событие</TableCell>
                        <TableCell>Сотрудник</TableCell>
                        <TableCell>Комментарий</TableCell>
                        <TableCell>Наличка</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>

                      {this.state.hist?.map( item => 
                        
                        <TableRow key={item.id}>
                          <TableCell>{item.date_time_update}</TableCell>
                          <TableCell>{this.get_type(item.event)}</TableCell>
                          <TableCell>{item.user_name}</TableCell>
                          <TableCell>{item.comment}</TableCell>
                          <TableCell>{item.summ}</TableCell>
                        </TableRow>

                      )}

                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

            </Grid>

            

          </DialogContent>
          { this.state.openModalType_edit === false ? false :
            <DialogActions style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button style={{ backgroundColor: 'green', color: '#fff' }} onClick={this.saveGivePrice.bind(this)}>Сохранить</Button>
              <Button style={{ backgroundColor: 'red', color: '#fff' }} onClick={() => { this.setState({ modalDialog: false, comment: '', openModalType: '', openModalKassa: '', summ: 0 }) }}>Отмена</Button>
            </DialogActions>
          }
        </Dialog>

        <Dialog
          fullWidth={true}
          maxWidth={'md'}
          open={this.state.modalDialogEdit}
          onClose={ () => { this.setState({ modalDialogEdit: false, comment: '', openModalType: '', openModalKassa: '', summ: 0 }) } }
        >
          <DialogTitle>{this.state.openModalTitle}</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            
            <Grid container spacing={3}>

              <Grid item xs={12} sm={6}>
                <MyTextInput label="Сумма" value={this.state.summ} type={'number'} func={this.changeSumm.bind(this)} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <MyDatePickerNew label="Дата" value={ this.state.date } func={ this.changeDate.bind(this, 'date') } />
              </Grid>
              
              <Grid item xs={12} sm={12}>
                <MyTextInput label="Комментарий" value={this.state.comment} multiline={true} maxRows={3} type={'text'} func={this.changeComment.bind(this, 'comment')} />
              </Grid>
            
            </Grid>

            

          </DialogContent>
          
          <DialogActions style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button style={{ backgroundColor: 'green', color: '#fff' }} onClick={this.saveUpdateAction.bind(this)}>Обновить</Button>
            <Button style={{ backgroundColor: 'red', color: '#fff' }} onClick={() => { this.setState({ modalDialog: false, comment: '', openModalType: '', openModalKassa: '', summ: 0 }) }}>Отмена</Button>
          </DialogActions>
          
        </Dialog>

        <Dialog
          open={this.state.is_open_action}
          onClose={this.closeAction.bind(this)}
        >
          <DialogTitle>Подтверди действие</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: 10 }}>
              { this.state?.type_action === 'delete' ? 'Удалить' : '' } данные ?
            </DialogContentText>

            <MyTextInput 
              label="Комментарий" 
              value={this.state.comment_action} 
              multiline={true} 
              maxRows={3} 
              type={'text'} 
              func={this.changeComment.bind(this, 'comment_action')} 
            />

          </DialogContent>
          <DialogActions style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button style={{ backgroundColor: 'green', color: '#fff' }} onClick={this.saveAction.bind(this)}>Подтвердить</Button>
            <Button style={{ backgroundColor: 'red', color: '#fff' }} onClick={this.closeAction.bind(this)}>Отмена</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3} style={{ paddingBottom: 100 }} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <MySelect data={this.state.points} value={this.state.point} func={ this.changePoint.bind(this) } label='Точка' />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDate.bind(this, 'date_start') } />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDate.bind(this, 'date_end') } />
          </Grid>

          
          <Grid item xs={12}>
            <Button variant="contained" onClick={this.updateData.bind(this)}>Обновить данные</Button>
          </Grid>
        
          <Grid item xs={12} sm={6}>
            <MainTable
              table={'fiz'}
              addData={this.addData.bind(this)}
              deleteData={this.deleteData.bind(this)}
              updateData={this.updateItem.bind(this)}
              toogleCollapseTable={this.toogleCollapseTable.bind(this)}
              toogleCollapseTableRow={this.toogleCollapseTableRow.bind(this)}

              ostatok_nachalo_dnya={this.state.fiz_kassa?.ostatok_nachalo_dnya}
              ostatok_nachalo_dnya_is_edit={this.state.fiz_kassa?.ostatok_nachalo_dnya_is_edit}
              ostatok_nachalo_dnya_arr={this.state.fiz_kassa?.ostatok_nachalo_dnya_arr}
              
              virycka={this.state.fiz_kassa?.virycka}
              virycka_is_edit={this.state.fiz_kassa?.virycka_is_edit}
              virycka_is_open={this.state.fiz_kassa?.virycka_is_open}
              virycka_arr={this.state.fiz_kassa?.virycka_arr}

              cash_from_bank={this.state.fiz_kassa?.cash_from_bank}
              cash_from_bank_is_edit={this.state.fiz_kassa?.cash_from_bank_is_edit}
              cash_from_bank_is_open={this.state.fiz_kassa?.cash_from_bank_is_open}
              cash_from_bank_arr={this.state.fiz_kassa?.cash_from_bank_arr}

              zaim={this.state.fiz_kassa?.zaim}
              zaim_is_edit={this.state.fiz_kassa?.zaim_is_edit}
              zaim_is_open={this.state.fiz_kassa?.zaim_is_open}
              zaim_arr={this.state.fiz_kassa?.zaim_arr}

              vedomosm_zp={this.state.fiz_kassa?.vedomosm_zp}
              vedomosm_zp_is_edit={this.state.fiz_kassa?.vedomosm_zp_is_edit}
              vedomosm_zp_is_open={this.state.fiz_kassa?.vedomosm_zp_is_open}
              vedomosm_zp_arr={this.state.fiz_kassa?.vedomosm_zp_arr}

              incasacia={this.state.fiz_kassa?.incasacia}
              incasacia_is_edit={this.state.fiz_kassa?.incasacia_is_edit}
              incasacia_is_open={this.state.fiz_kassa?.incasacia_is_open}
              incasacia_arr={this.state.fiz_kassa?.incasacia_arr}

              vozvrat_zaim={this.state.fiz_kassa?.vozvrat_zaim}
              vozvrat_zaim_is_edit={this.state.fiz_kassa?.vozvrat_zaim_is_edit}
              vozvrat_zaim_is_open={this.state.fiz_kassa?.vozvrat_zaim_is_open}
              vozvrat_zaim_arr={this.state.fiz_kassa?.vozvrat_zaim_arr}

              vidacha_otchet={this.state.fiz_kassa?.vidacha_otchet}
              vidacha_otchet_is_edit={this.state.fiz_kassa?.vidacha_otchet_is_edit}
              vidacha_otchet_is_open={this.state.fiz_kassa?.vidacha_otchet_is_open}
              vidacha_otchet_zp_arr={this.state.fiz_kassa?.vidacha_otchet_arr}
              vidacha_otchet_arr={this.state.fiz_kassa?.vidacha_otchet_arr}

              itog_plus={this.state.fiz_kassa?.itog_plus}
              itog_minus={this.state.fiz_kassa?.itog_minus}
              ostatok_konec_dnya={this.state.fiz_kassa?.ostatok_konec_dnya}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MainTable 
              table={'driver_cash'}
              addData={this.addData.bind(this)}
              deleteData={this.deleteData.bind(this)}
              updateData={this.updateItem.bind(this)}
              toogleCollapseTable={this.toogleCollapseTable.bind(this)}
              toogleCollapseTableRow={this.toogleCollapseTableRow.bind(this)}

              ostatok_nachalo_dnya={this.state.driver_kassa?.ostatok_nachalo_dnya}
              ostatok_nachalo_dnya_is_edit={this.state.driver_kassa?.ostatok_nachalo_dnya_is_edit}
              ostatok_nachalo_dnya_arr={this.state.driver_kassa?.ostatok_nachalo_dnya_arr}
              
              virycka={this.state.driver_kassa?.virycka}
              virycka_is_edit={this.state.driver_kassa?.virycka_is_edit}
              virycka_is_open={this.state.driver_kassa?.virycka_is_open}
              virycka_arr={this.state.driver_kassa?.virycka_arr}

              cash_from_bank={this.state.driver_kassa?.cash_from_bank}
              cash_from_bank_is_edit={this.state.driver_kassa?.cash_from_bank_is_edit}
              cash_from_bank_is_open={this.state.driver_kassa?.cash_from_bank_is_open}
              cash_from_bank_arr={this.state.driver_kassa?.cash_from_bank_arr}

              zaim={this.state.driver_kassa?.zaim}
              zaim_is_edit={this.state.driver_kassa?.zaim_is_edit}
              zaim_is_open={this.state.driver_kassa?.zaim_is_open}
              zaim_arr={this.state.driver_kassa?.zaim_arr}

              vedomosm_zp={this.state.driver_kassa?.vedomosm_zp}
              vedomosm_zp_is_edit={this.state.driver_kassa?.vedomosm_zp_is_edit}
              vedomosm_zp_is_open={this.state.driver_kassa?.vedomosm_zp_is_open}
              vedomosm_zp_arr={this.state.driver_kassa?.vedomosm_zp_arr}

              incasacia={this.state.driver_kassa?.incasacia}
              incasacia_is_edit={this.state.driver_kassa?.incasacia_is_edit}
              incasacia_is_open={this.state.driver_kassa?.incasacia_is_open}
              incasacia_arr={this.state.driver_kassa?.incasacia_arr}

              vozvrat_zaim={this.state.driver_kassa?.vozvrat_zaim}
              vozvrat_zaim_is_edit={this.state.driver_kassa?.vozvrat_zaim_is_edit}
              vozvrat_zaim_is_open={this.state.driver_kassa?.vozvrat_zaim_is_open}
              vozvrat_zaim_arr={this.state.driver_kassa?.vozvrat_zaim_arr}

              vidacha_otchet={this.state.driver_kassa?.vidacha_otchet}
              vidacha_otchet_is_edit={this.state.driver_kassa?.vidacha_otchet_is_edit}
              vidacha_otchet_is_open={this.state.driver_kassa?.vidacha_otchet_is_open}
              vidacha_otchet_zp_arr={this.state.driver_kassa?.vidacha_otchet_arr}

              itog_plus={this.state.driver_kassa?.itog_plus}
              itog_minus={this.state.driver_kassa?.itog_minus}
              ostatok_konec_dnya={this.state.driver_kassa?.ostatok_konec_dnya}
            />
          </Grid>

          

          
        </Grid>
      </>
    )
  }
}

export default function CashBook() {
  return (
    <CashBook_ />
  );
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
