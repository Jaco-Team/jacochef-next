import React from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { MyCheckBox } from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';
import { create } from 'zustand'

import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ContrastIcon from '@mui/icons-material/Contrast';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';

import Draggable from 'react-draggable';

const useStore = create((set, get) => ({
  isPink: false,
  setPink: () => set((state) => ({ isPink: !state.isPink })),

  vendor_items: [],
  search_item: '',
  vendor_itemsCopy: [],

  all_ed_izmer: [],

  pq: '',
  count: '',
  fact_unit: '',
  summ: '',
  sum_w_nds: '',

  allPrice: 0,
  allPrice_w_nds: 0,

  bill_items_doc: [],
  bill_items: [],

  operAlert: false,
  err_status: true,
  err_text: '',

  points: [],
  point: '',
  point_name: '',

  search_vendor: '',

  docs: [],
  doc: '',

  vendors: [],
  vendorsCopy: [],

  types: [],
  type: '',

  fullScreen: false,

  kinds: [],
  doc_base_id: '',

  number: '',
  number_factur: '',

  date: null,
  date_factur: null,
  date_items: null,

  is_load_store: false,
  module: 'billing',

  imgs_bill: [],
  modalDialog: false,
  image: '',
  imgs_factur: [],

  vendor_name: '',

  bill_list: [],
  bill: null,

  is_new_doc: 0,

  users: [],
  user: [],

  comment: '',

  getData: (method, data = {}) => {
    set({
      is_load_store: true,
    });

    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: queryString.stringify({
        method: method,
        module: get().module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == 'redir') {
          window.location.pathname = '/';
          return;
        }

        if (json.st === false && json.type == 'auth') {
          window.location.pathname = '/auth';
          return;
        }

        setTimeout(() => {
          set({
            is_load_store: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        console.log(err);
        set({
          is_load_store: false,
        });
      });
  },

  changeAutocomplite: (type, data) => {
    set({
      [type]: data,
    })
  },

  changeItemChecked: (event, data) => {
    const value = event.target.checked === true ? 1 : 0;

    set({
      [data]: value,
    });
  },

  getDataBill: (res, point, items, docs) => {

    set({
      is_load_store: true,
    });

    const bill_items = res.bill_items.map((item) => {

      item.all_ed_izmer = item.pq_item.map(it => {
        it = { name: `${it.name} ${item.ed_izmer_name}`, id: it.id };
        return it;
      });

      item.fact_unit = (Number(item.fact_unit)).toFixed(2);
      item.price_item = item.price;

      const nds = get().check_nds_bill((Number(item.price_w_nds) - Number(item.price_item)) / (Number(item.price_item) / 100));

      if (nds) {
        item.nds = nds;
        item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2)
      } else {
        item.summ_nds = (0).toFixed(2);
        item.nds = '';
      }

      return item;
    });

    const allPrice = (bill_items.reduce((all, item) => all + Number(item.price), 0)).toFixed(2);
    const allPrice_w_nds = (bill_items.reduce((all, item) => all + Number(item.price_w_nds), 0)).toFixed(2);
   
    set({
      vendor_items: items,
      vendor_itemsCopy: items,
      docs: docs.billings,
      point: point ?? [],
      point_name: point?.name ?? '',
      vendors: res?.vendors ?? [],
      vendor_name: res?.vendors[0]?.name ?? '',
      bill_list: res?.bill_hist,
      imgs_bill: res?.bill_imgs,
      allPrice,
      allPrice_w_nds,
      bill: res?.bill,
      bill_items,
      number: res.bill?.number,
      date: res.bill?.date && res.bill?.date !== "0000-00-00" ? dayjs(res.bill?.date) : null,
      date_items: res.bill?.date_items ? dayjs(res.bill?.date_items) : null,
      comment: res.bill?.comment,
      users: res?.users,
      user: res?.bill_users,
      types: types,
      type: parseInt(res?.bill?.type_bill) == 1 ? 2 : 4,
      doc_base_id: parseInt(res?.bill?.type_doc),
      is_load_store: false,

      number_factur: res.bill?.number_factur,
      date_factur: res.bill?.date_factur,
    });


    get().changeKinds(res?.bill?.type_doc);
  },

  closeDialog: () => {
    document.body.style.overflow = "";
    set({ modalDialog: false })
  },

  openImageBill: (image) => {
    get().handleResize();

    set({ 
      modalDialog: true, 
      image
    })
  },

  handleResize: () => {
    if (window.innerWidth < 601) {
      set({
        fullScreen: true,
      });
    } else {
      set({
        fullScreen: false,
      });
    }
  },

  changeDateRange(event, data) {
    set({
      [data]: event,
    });
  },

  changeInput(event, type) {
    set({
      [type]: event.target.value,
    });
  },

  search_doc: async (event, name) => {

    const search = event.target.value ? event.target.value : name ? name : '';

    if(search) {
        
      const docs = get().docs;
      const vendor_id = get().vendors[0]?.id;
      const point = get().point;
      
      const billing_id = docs.find(doc => doc.name === search)?.id;
      
      const obj = {
        billing_id,
        vendor_id,
        point_id: point.id,
      }
      
      const res = await get().getData('get_base_doc_data', obj);
      
      set({
        bill_items: [],
        bill_items_doc: [],
        search_item: '',
        vendor_items: res.items,
        vendor_itemsCopy: res.items,
        users: res.users,
        all_ed_izmer: [],
        pq: '',
        count: '',
        fact_unit: '',
        summ: '',
        sum_w_nds: '',
        bill_items_doc: res.billing_items,
      });

    } else {

      const point = get().point;
      const vendors = get().vendors;
      const docs = get().docs;

      if(point && vendors.length === 1 && docs.length) {
        
        const data = {
          point_id: point.id,
          vendor_id: vendors[0]?.id
        }
        
        const res = await get().getData('get_vendor_items', data);
        
        set({
          bill_items: [],
          bill_items_doc: [],
          vendor_items: res.items,
          vendor_itemsCopy: res.items,
          users: res.users,
          search_item: '',
          all_ed_izmer: [],
          pq: '',
          count: '',
          fact_unit: '',
          summ: '',
          sum_w_nds: '',
        });
      }

    }

    set({
      doc: search,
    });
  },

  search_vendors: async (event, name) => {
    const search = event.target.value ? event.target.value : name ? name : '';

    const vendorsCopy = get().vendorsCopy;

    const vendors = vendorsCopy.filter((value) => search ? value.name.toLowerCase() === search.toLowerCase() : value);

    if (search && vendors.length) {

      const point = get().point;

      const data = {
        point_id: point.id,
        vendor_id: vendors[0].id
      }

      const res = await get().getData('get_vendor_items', data);
      const docs = await get().getData('get_base_doc', data);

      set({
        vendor_items: res.items,
        vendor_itemsCopy: res.items,
        users: res.users,
        docs: docs.billings,
      });

    } else {
    
      set({
        bill_items: [],
        bill_items_doc: [],
        search_item: '',
        vendor_items: [],
        vendor_itemsCopy: [],
        all_ed_izmer: [],
        pq: '',
        count: '',
        fact_unit: '',
        summ: '',
        sum_w_nds: '',
        docs: [],
        doc: '',
      });

    }

    set({
      search_vendor: search,
      vendors,
    });
  },

  search_point: async (event, name) => {
    const search = event.target.value ? event.target.value : name ? name : '';

    const points = get().points;
    const point = points.find(item => item.name === search);
    
    set({
      bill_items: [],
      bill_items_doc: [],
      point: point ?? '',
      point_name: point?.name ?? '',
      search_vendor: '',
      search_item: '',
      vendor_items: [],
      vendor_itemsCopy: [],
      all_ed_izmer: [],
      pq: '',
      count: '',
      fact_unit: '',
      summ: '',
      sum_w_nds: '',
      users: [],
      docs: [],
      doc: ''
    });

    if(point) {
  
        const obj = {
          point_id: point.id
        }
  
        const res = await get().getData('get_vendors', obj)
  
        set({
          vendors: res.vendors,
          vendorsCopy: res.vendors,
        })

      } else {

        set({
          vendors: [],
          vendorsCopy: [],
        })

      }
  },

  setData: (...props) => {

    set(
      ...props
    )
  },

  search_vendor_items: (event, name) => {

    const search = event.target.value ? event.target.value : name ? name : '';

    const vendor_itemsCopy = JSON.parse(JSON.stringify(get().vendor_itemsCopy))

    let vendor_items = [];

    if (vendor_itemsCopy.length) {

      vendor_items = vendor_itemsCopy.filter((value) => search ? value.name.toLowerCase() === search.toLowerCase() : value);

      vendor_items.map((item) => {
        item.pq_item = item.pq_item.map(it => {
          it = { name: `${it.name} ${item.ed_izmer_name}`, id: it.id };
          return it;
        });
        return item;
      });

      set({
        vendor_items,
        all_ed_izmer: vendor_items.length ? vendor_items[0].pq_item : [],
        pq: vendor_items.length ? vendor_items[0].pq_item[0].id : '',
        count: '',
        fact_unit: '',
        summ: '',
        sum_w_nds: '',
      });

    }

    set({
      search_item: search,
    });
  },

  changeCount: (event) => {
    const count = event.target.value;

    const fact_unit = Number(get().pq) * Number(count);

    set({
      count,
      fact_unit: fact_unit ? fact_unit : '',
    });
  },

  changeData: async (data, event) => {
    get().handleResize();

    const value = event.target.value;
    
    if(data === 'type' && (parseInt(value) === 1 || parseInt(value) === 2)) {

      const point = get().point;
      const vendors = get().vendors;

        if(point && vendors.length === 1) {

          const data = {
            point_id: point.id,
            vendor_id: vendors[0]?.id
          }
          
          const res = await get().getData('get_vendor_items', data);
          
          set({
            bill_items: [],
            bill_items_doc: [],
            vendor_items: res.items,
            vendor_itemsCopy: res.items,
            users: res.users,
            search_item: '',
            all_ed_izmer: [],
            pq: '',
            count: '',
            fact_unit: '',
            summ: '',
            sum_w_nds: '',
            doc: '',
          });
        }
    }

    if(data === 'type' && (parseInt(value) === 3 || parseInt(value) === 2)) {
      get().changeKinds(value);
    }

    // if(data === 'type' && parseInt(value) === 2){
    //   setTimeout( () => {
    //     set({
    //       DropzoneDop: new Dropzone("#img_bill_type", this.dropzoneOptions)
    //     })
    //   }, 500 )
      
    // } else {
    //   set({
    //     DropzoneDop: null
    //   })
    // }

    set({
      [data]: event.target.value
    });
  },

  changeKinds: (value) => {
    let kinds = [];

    if( parseInt(value) === 2 ){
      kinds = [
        {
          "name": "Накладная",
          "id": "1"
        },
        {
          "name": "УПД",
          "id": "2"
        },
      ];
    } else {
      kinds = [
        {
          "name": "Накладная",
          "id": "1"
        },
        {
          "name": "УКД",
          "id": "3"
        },
      ];
    }

    set({
      kinds,
    });
  },

  reducePrice: () => {
    const bill_items = get().bill_items;

    const allPrice = (bill_items.reduce((all, item) => all + Number(item.price_item), 0)).toFixed(2);
    const allPrice_w_nds = (bill_items.reduce((all, item) => all + Number(item.price_w_nds), 0)).toFixed(2);

    set({
      allPrice,
      allPrice_w_nds
    })
  },

  deleteItem: (key) => {
    const bill_items = get().bill_items;

    bill_items.splice(key, 1);

    set({
      bill_items,
    });

    get().reducePrice();
  },

  closeAlert: () => {
    set({ operAlert: false });
  },

  addItem: () => {
    const { count, fact_unit, summ, sum_w_nds, all_ed_izmer, pq, vendor_items } = get();

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    if (!count || !fact_unit || !summ || !sum_w_nds || !pq || !all_ed_izmer.length) {

      set({
        operAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать Товар / кол-во Товара / указать суммы',
      });

      return;
    }

    const nds = get().check_nds_bill((Number(sum_w_nds) - Number(summ)) / (Number(summ) / 100))

    if (!nds) {

      set({
        operAlert: true,
        err_status: false,
        err_text: 'Суммы указаны неверно',
      });

      return;
    }

    const range_price_item = get().check_price_item(vendor_items[0].price, vendor_items[0].vend_percent, summ, pq)

    if(range_price_item) {
      vendor_items[0].color = false;
    } else {
      vendor_items[0].color = true;
    }

    vendor_items[0].summ_nds = (Number(sum_w_nds) - Number(summ)).toFixed(2);
    vendor_items[0].nds = nds;
    vendor_items[0].pq = pq;
    vendor_items[0].all_ed_izmer = all_ed_izmer;
    vendor_items[0].count = count;
    vendor_items[0].fact_unit = (Number(fact_unit)).toFixed(2);
    vendor_items[0].price_item = summ;
    vendor_items[0].price_w_nds = sum_w_nds;

    const bill_items_doc = get().bill_items_doc;

    if(bill_items_doc.length) {
      const item = bill_items_doc.find(it => it.item_id === vendor_items[0].id);

      item.fact_unit = (Number(item.count) * Number(item.pq)).toFixed(2);
      item.summ_nds = (Number(item.price_w_nds) - Number(item.price)).toFixed(2);

      const nds = get().check_nds_bill((Number(item.price_w_nds) - Number(item.price)) / (Number(item.price) / 100))

      if(nds) {
        item.nds = nds;
      } else {
        item.nds = '';
      }

      vendor_items[0].data_bill = item;
    }

    bill_items.push(vendor_items[0]);

    const allPrice = (bill_items.reduce((all, item) => all + Number(item.price_item), 0)).toFixed(2);
    const allPrice_w_nds = (bill_items.reduce((all, item) => all + Number(item.price_w_nds), 0)).toFixed(2);

    set({
      bill_items,
      allPrice,
      allPrice_w_nds,
      count: '',
      fact_unit: '',
      summ: '',
      sum_w_nds: '',
    });
  },

  check_nds_bill: (value) => {
    let nds = [];
    nds[0] = 'без НДС';
    nds[10] = '10 %';
    nds[20] = '20 %';
    nds[18] = '18 %';
 
    return nds[Math.round(value)] ? nds[Math.round(value)] : false;
  },

  check_price_item: (price, percent, summ, pq) => {

    const res = Number(price) / 100 * Number(percent);

    const price_item = Number(summ) / Number(pq);

    if(price_item >= (Number(price) - res) && price_item <= (Number(price) + res)) {
      return true
    } else {
      return false
    }
  },

  changeDataTable: (event, type, id, key) => {
    const value = event.target.value;

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    bill_items = bill_items.map((item, index) => {
      if (item.id === id && key === index) {

        item[type] = value;

        if (type === 'pq') {
          item.fact_unit = (Number(item[type]) * Number(item.count)).toFixed(2);

          const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)
  
          if(range_price_item) {
            item.color = false;
          } else {
            item.color = true;
          }

        } 

        if (value && value !== '0' && value[0] !== '0' && type === 'count') {

          item.fact_unit = (Number(item[type]) * Number(item.pq)).toFixed(2);
          const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)

          if(range_price_item) {
            item.color = false;
          } else {
            item.color = true;
          }

        } else {

          if (type === 'count') {
            item.fact_unit = 0;
          }
    
          item.color = true;

        }


        if(type === 'price_item' || type === 'price_w_nds') {
          const nds = get().check_nds_bill((Number(item.price_w_nds) - Number(item.price_item)) / (Number(item.price_item) / 100))

          const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)
  
          if (nds) {
            item.nds = nds;
            item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2)
          } else {
            item.summ_nds = 0;
            item.nds = '';
          }

          if(nds && range_price_item) {
            item.color = false;
          } else {
            item.color = true;
          }
        } 

      }

      return item;
    });

    if (type === 'price_item') {
      const allPrice = (bill_items.reduce((all, item) => all + Number(item.price_item), 0)).toFixed(2);

      set({
        allPrice,
      });
    }

    if (type === 'price_w_nds') {
      const allPrice_w_nds = (bill_items.reduce((all, item) => all + Number(item.price_w_nds), 0)).toFixed(2);

      set({
        allPrice_w_nds,
      });
    }

    set({
      bill_items,
    });
  }

}));

const types = [
  {
    "name": "Счет",
    "id": "1"
  },
  {
    "name": "Поступление",
    "id": "2"
  },
  {
    "name": "Коррекция",
    "id": "3"
  },
  {
    "name": "Возврат",
    "id": "4"
  },
]

function MyTooltip(props) {
  const { children, name, ...other } = props;

  return (
    <Tooltip title={name} arrow placement="bottom-start"  {...other}
      componentsProps={{
        tooltip: {
          sx: { bgcolor: '#fff', color: '#000', fontSize: 16, border: '0.5px solid rgba(0, 0, 0, 0.87)',
            '& .MuiTooltip-arrow': {
              color: '#fff',
              '&::before': {
                backgroundColor: 'white',
                border: '0.5px solid black',
              },
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}

// Аккродион с данными из накладной для страниц Новая / Просмотр / Редактирование накладной
class Billing_Accordion extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.bill_list;
    var array2 = this.props.bill_list;

    var is_same = array1?.length == array2?.length && array1?.every(function (element, index) { return element === array2[index] });

    return !is_same;
  }

  render() {
    const { bill_list, bill_items, type } = this.props;

    return (
      <Grid item xs={12} sm={12} mb={5}>
        
        <AccordionDetails>
          <AccordionSummary style={{ cursor: 'default' }} expandIcon={<ExpandMoreIcon sx={{ opacity: 0 }} />} aria-controls="panel1a-content">
            <Grid item xs display="flex" flexDirection="row">
              <Typography style={{ width: '1%' }}></Typography>
              <Typography style={{ width: '3%' }}></Typography>
              <Typography style={{ width: '3%' }}></Typography>
              <Typography style={{ width: '10%' }}>
                Номер {type === 'edit' ? ' документа' : ' накладной'}
              </Typography>
              <Typography style={{ width: '10%' }}>
                Дата в {type === 'edit' ? ' документе' : ' накладной'}
              </Typography>
              <Typography style={{ width: '14%', minWidth: '200px' }}>Создатель</Typography>
              <Typography style={{ width: '10%' }}>Дата обновления</Typography>
              <Typography style={{ width: '14%', minWidth: '200px' }}>Редактор</Typography>
              <Typography style={{ width: '10%' }}>Время обновления</Typography>
              <Typography style={{ width: '17%', minWidth: '250px' }}>
                Тип {type === 'edit' ? ' документа' : ' накладной'}
              </Typography>
              <Typography style={{ width: '8%' }}>Сумма с НДС</Typography>
            </Grid>
          </AccordionSummary>

          {bill_list?.map((item, i) => (
            <Accordion key={i}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" className="accordion_summary" style={{ paddingRight: '1%' }}>

                <Grid item xs display="flex" flexDirection='row'>

                  <Typography component="div" style={{ width: '1%', backgroundColor: item.color, marginRight: '1%' }}></Typography>
                  
                    <MyTooltip name="Нету бумажного носителя">
                      <Typography component="div" style={{ width: '3%', display: 'flex', alignItems: 'center' }}>
                        <MyCheckBox
                          value={false}
                          //func={this.props.changeCheck.bind(this, key, 'is_not_del')}
                          label=""
                        />
                      </Typography>
                    </ MyTooltip>

                    <MyTooltip name="С бумажным носителем все хорошо">
                      <Typography component="div" style={{ width: '3%', display: 'flex', alignItems: 'center' }}>
                        <MyCheckBox
                          value={false}
                          //func={this.props.changeCheck.bind(this, key, 'is_not_del')}
                          label=""
                        />
                      </Typography>
                    </MyTooltip>

                  <Typography style={{ width: '10%',  display: 'flex', alignItems: 'center' }}>
                    {item.number}
                  </Typography>

                  <Typography style={{ width: '10%',  display: 'flex', alignItems: 'center' }}>
                    {item.date}
                  </Typography>

                  <Typography style={{ width: '14%', minWidth: '200px', display: 'flex', alignItems: 'center' }}>
                    {item.creator_id}
                  </Typography>

                  <Typography style={{ width: '10%',  display: 'flex', alignItems: 'center' }}>
                    {item.date_update}
                  </Typography>

                  <Typography style={{ width: '14%', minWidth: '200px', display: 'flex', alignItems: 'center'}}>
                    {item.editor_id}
                  </Typography>

                  <Typography style={{ width: '10%',  display: 'flex', alignItems: 'center' }}>
                    {item.time_update}
                  </Typography>

                  <Typography style={{ width: '17%', minWidth: '250px',  display: 'flex', alignItems: 'center' }}>
                    {item.name}
                  </Typography>

                  <Typography style={{ width: '8%',  display: 'flex', alignItems: 'center' }}>
                    {item.sum_w_nds}
                  </Typography>
                </Grid>
              </AccordionSummary>

              <AccordionDetails style={{ width: '100%' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell>Товар</TableCell>
                      <TableCell>Объем упак.</TableCell>
                      <TableCell>Кол-во упак.</TableCell>
                      <TableCell>Кол-во</TableCell>
                      <TableCell>Сумма с НДС</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {bill_items?.map((item, key) => (
                      <TableRow key={key} hover>
                        <TableCell> {item.item_name} </TableCell>
                        <TableCell>{item.pq} {item.ed_izmer_name}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>{item.fact_unit} {item.ed_izmer_name}</TableCell>
                        <TableCell> {item.price_w_nds} ₽</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionDetails>
        
      </Grid>
    );
  }
}

// модалка просмотра фото/картинок документов
class Billing_Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      vertical: false,
      horizontal: false,
    };
  }

  setLeftRotate() {
    let rotate = this.state.rotate;
    rotate = rotate - 90;
 
    this.setState({
      rotate,
    });

  }

  setRigthRotate() {
    let rotate = this.state.rotate;
    rotate = rotate + 90;

    this.setState({
      rotate,
    });

  }

  setScaleHorizontal() {
    let scaleX = this.state.scaleX;

    if(scaleX < 0) {
      scaleX = scaleX * -1;
    } else {
      scaleX = -scaleX;
    }

    this.setState({
      scaleX,
    });
  }

  setScaleVertical() {
    let scaleY = this.state.scaleY;

    if(scaleY < 0) {
      scaleY = scaleY * -1;
    } else {
      scaleY = -scaleY;
    }

    this.setState({
      scaleY,
    });
  }

  setZoomIn() {
    let scaleY = this.state.scaleY;
    let scaleX = this.state.scaleX;

    if(scaleY < 0) {
      scaleY = scaleY - 0.5;
    } else {
      scaleY = scaleY + 0.5;
    }

    if(scaleX < 0) {
      scaleX = scaleX - 0.5;
    }  else {
      scaleX = scaleX + 0.5;
    }

    this.setState({
      scaleY,
      scaleX,
    });

  }

  setZoomOut() {
    let scaleY = this.state.scaleY;
    let scaleX = this.state.scaleX;
      
    if(scaleY < 0) {
      scaleY = scaleY + 0.5;
    } else {
      scaleY = scaleY - 0.5;
    }
    
    if(scaleX < 0) {
      scaleX = scaleX + 0.5;
    }  else {
      scaleX = scaleX - 0.5;
    }

    this.setState({
      scaleY,
      scaleX,
    });
    
  }

  setSplitVertical() {
    this.reset();

    const vertical = this.state.vertical;

    this.setState({
      vertical: !vertical,
      horizontal: false,
    });

  }

  setSplitHorizontal() {
    this.reset();

    const horizontal = this.state.horizontal;

    this.setState({
      horizontal: !horizontal,
      vertical: false
    });

  }

  reset() {
    this.setState({
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
    });
  }

  shouldComponentUpdate(nextState) {
    return nextState.rotate !== this.state.rotate || nextState.scaleY !== this.state.scaleY || nextState.scaleX !== this.state.scaleX;
  }

  render() {
    return (
      <>
        <div className='modal_btn'>
          <MyTooltip name='Повернуть на 90 градусов влево'>
            <IconButton onClick={this.setLeftRotate.bind(this)}>
              <RotateLeftIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Повернуть на 90 градусов вправо'>
            <IconButton onClick={this.setRigthRotate.bind(this)}>
              <RotateRightIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Перевернуть по вертикали'>
            <IconButton onClick={this.setScaleVertical.bind(this)}>
              <ContrastIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Перевернуть по горизонтали'>
            <IconButton onClick={this.setScaleHorizontal.bind(this)}>
              <ContrastIcon style={{ transform: 'rotate(-90deg)'}}/>
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Увеличить документ'>
            <IconButton onClick={this.setZoomIn.bind(this)}>
              <ZoomInIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Уменьшить документ'>
            <IconButton onClick={this.setZoomOut.bind(this)}>
              <ZoomOutIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Разделить экран по вертикали'>
            <IconButton onClick={this.setSplitVertical.bind(this)}>
              <VerticalSplitIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Разделить экран по горизонтали'>
            <IconButton onClick={this.setSplitHorizontal.bind(this)}>
              <HorizontalSplitIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Сбросить'>
            <IconButton onClick={this.reset.bind(this)}>
              <RestartAltIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Закрыть'>
            <IconButton onClick={this.props.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </MyTooltip>
        </div>

        <div className="modal" onClick={this.props.onClose.bind(this)} style={{ width: this.state.vertical ? '50%' : '100%', height: this.state.horizontal ? '50vh' : '100vh'}}>
          <Draggable>
            <div>
              <div className="modal_content" style={{transform: `rotate(${this.state.rotate}deg) scale(${this.state.scaleX}, ${this.state.scaleY})`}}>
                <img 
                  src={this.props.image} 
                  alt="Image bill" 
                  className="image_bill"
                  onClick={(e) => e.stopPropagation()}
                  draggable="false"
                />
              </div>
            </div>
          </Draggable>
        </div>

        {this.state.vertical || this.state.horizontal ?
          <div className="modal"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)',  width: this.state.vertical ? '50%' : '100%',  height: this.state.horizontal ? '50vh' : '100vh', left: this.state.vertical ? '50%' : 0, top: this.state.horizontal ? '50%' : 0}}>
            <div className="modal_content">
              <img  src={this.props.image} alt="Image bill" className="image_bill" draggable="false" />
            </div>
          </div> 
        : null}

      </>
    );
  }
}

function VendorItemsTableView(){
  const [bill_items] = useStore(state => [state.bill_items]);

  return (
    <>
     <Grid item xs={12} sm={12}>
        <h2>Товары в накладной</h2>
        <Divider style={{ backgroundColor: 'rgba(0, 0, 0, 0.87)' }} />
     </Grid>

     <Grid item xs={12} style={{ marginBottom: 20 }} sm={12}>
      <TableContainer component={Paper}>
        <Table aria-label="a dense table">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
              <TableCell style={{ minWidth: '150px' }}>Товар</TableCell>
              <TableCell style={{ minWidth: '130px' }}>В упак.</TableCell>
              <TableCell>Упак</TableCell>
              <TableCell style={{ minWidth: '130px' }}>Кол-во</TableCell>
              <TableCell>НДС</TableCell>
              <TableCell style={{ minWidth: '180px' }}>Сумма без НДС</TableCell>
              <TableCell style={{ minWidth: '180px' }}>Сумма НДС</TableCell>
              <TableCell style={{ minWidth: '150px' }}>Сумма с НДС</TableCell>
              <TableCell style={{ minWidth: '150px' }}>За 1 ед с НДС</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill_items.map((item, key) => (
              <TableRow key={key} hover>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.pq} {item.ed_izmer_name}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{item.fact_unit} {item.ed_izmer_name}</TableCell>
                <TableCell>{item.nds}%</TableCell>
                <TableCell>{item.price} ₽</TableCell>
                <TableCell>{Number(item.price_w_nds) - Number(item.price)} ₽</TableCell>
                <TableCell>{item.price_w_nds} ₽</TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
     </Grid>
    </>
  )
}

class Billing_View_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'billing',
      module_name: '',
      is_load: false,
      
      point: null,
      vendor: null,
      bill: null,
      imgs: [],
      bill_items: [],
      bill_list: [],
      users: [],

      modalDialog: false,
      fullScreen: false,
      image: ''
    };
  }

  async componentDidMount() {
    
    let data_bill = window.location.pathname;

    data_bill = data_bill.split('/');

    const bill = {
      id: data_bill[3],
      point_id: data_bill[4],
      type: data_bill[2],
    }

    const data = await this.getData('get_one', bill);

    const { setData } = this.props.store;

    setData({
      bill_items: data?.bill_items ?? [],
    })

    const points = await this.getData('get_points');

    const point = points.points.find(point => point.id === data?.bill.point_id);

    this.setState({
      bill: data?.bill,
      point: point,
      vendor: data?.vendors[0],
      imgs: data?.bill_imgs,
      bill_items: data?.bill_items,
      bill_list: data?.bill_hist,
      users: data?.bill_users,
    });

    document.title = 'Накладные';
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == 'redir') {
          window.location.pathname = '/';
          return;
        }

        if (json.st === false && json.type == 'auth') {
          window.location.pathname = '/auth';
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
        this.setState({
          is_load: false,
        });
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

  openImageBill (image) {
    
    this.handleResize();

    document.body.style.overflow = "hidden";

    this.setState({ 
      modalDialog: true, 
      image
    })
    
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {!this.state.modalDialog ? null :
          <Billing_Modal
            onClose={() => {
              document.body.style.overflow = "";
              this.setState({ modalDialog: false })
            }}
            fullScreen={this.state.fullScreen}
            image={this.state.image}
          />
        }

        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <h1>Просмотр накладной: {this.state.bill?.number}</h1>
            <Divider style={{ backgroundColor: 'rgba(0, 0, 0, 0.87)' }} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid style={{ display: 'flex' }}>
              <Typography style={{ fontWeight: 'bold' }}>Точка:&nbsp;</Typography>
              <Typography>{this.state.point?.name}</Typography>
            </Grid>
            <Grid style={{ display: 'flex' }}>
              <Typography style={{ fontWeight: 'bold' }}>Поставщик:&nbsp;</Typography>
              <Typography>{this.state.vendor?.name}</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Grid style={{ display: 'flex' }}>
              <Typography style={{ fontWeight: 'bold' }}>Номер накладой:&nbsp;</Typography>
              <Typography>{this.state.bill?.number}</Typography>
            </Grid>
            <Grid style={{ display: 'flex' }}>
              <Typography style={{ fontWeight: 'bold' }}>Тип накладой:&nbsp;</Typography>
              <Typography>{this.state.bill?.type_bill === '1' ? 'Приходная' : 'Возвратная'}</Typography>
            </Grid>
            <Grid style={{ display: 'flex' }}>
              <Typography style={{ fontWeight: 'bold' }}>Форма оплаты:&nbsp;</Typography>
              <Typography>{this.state.bill?.type_pay === '1' ? 'Безналичная' : 'Наличная'}</Typography>
            </Grid>
            <Grid style={{ display: 'flex' }}>
              <Typography style={{ fontWeight: 'bold' }}>Дата накладой:&nbsp;</Typography>
              <Typography>{this.state.bill?.date}</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} display="flex" flexDirection="row" style={{ fontWeight: 'bold' }}>
            {!this.state.imgs?.length ? 'Фото отсутствует' : 
              <>
                {this.state.imgs.map((img, key) => (
                  <img 
                    key={key} 
                    src={'https://storage.yandexcloud.net/bill/' + img} 
                    alt="Image bill" 
                    className="img_modal_bill"
                    onClick={this.openImageBill.bind(this, 'https://storage.yandexcloud.net/bill/' + img)}
                  />
                ))}
              </>
            }
          </Grid>
        
          <VendorItemsTableView />

          <Grid item xs={12} sm={12} style={{ display: 'flex' }}>
            <Typography style={{ fontWeight: 'bold', color: '#9e9e9e' }}>Дата разгрузки:&nbsp;</Typography>
            <Typography>{this.state.bill?.date}</Typography>
          </Grid>

          <Grid item xs={12} sm={12} sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <Typography component='span' style={{ fontWeight: 'bold', color: '#9e9e9e' }}>Сотрудники:&nbsp;</Typography>
            {this.state.users?.map((user, key) => (
              <Typography key={key} component="span" mr={1}>
                {user.name}{this.state.users?.length === 1 || this.state.users.at(-1) === user ? null : ', '}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={12} sm={12} style={{ display: 'flex' }}>
            <Typography style={{ fontWeight: 'bold', color: '#9e9e9e' }}>Комментарии:&nbsp;</Typography>
            <Typography></Typography>
          </Grid>

          <Grid item xs={12} sm={12} style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ fontWeight: 'bold', color: '#9e9e9e' }}>Причина удаления:&nbsp;</Typography>
            <Typography></Typography>
          </Grid>

          <Billing_Accordion
            bill_list={this.state.bill_list}
            bill_items={this.state.bill_items}
          />
        </Grid>
      </>
    );
  }
}

const withStore = BaseComponent => props => {
  const store = useStore();
  return <BaseComponent {...props} store={store} />;
};

const Billing_View_Store = withStore(Billing_View_)

export default function BillingView() {
  return <Billing_View_Store />;
}
