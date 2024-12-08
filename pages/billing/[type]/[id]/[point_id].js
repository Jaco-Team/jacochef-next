import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
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
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

import Dropzone from 'dropzone';

import { MySelect, MyAutocomplite, MyAutocomplite2, MyDatePickerNew, MyTextInput, MyCheckBox, MyAlert, formatDateReverse} from '@/ui/elements';

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

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import Draggable from 'react-draggable';

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

function getOrientation(file, callback) {
	var reader = new FileReader();
  
	reader.onload = function(event) {
    var view = new DataView(event.target.result);

    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

    var length = view.byteLength,
      offset = 2;

    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;

      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) {
          return callback(-1);
        }

        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
  
        for (var i = 0; i < tags; i++)
        if (view.getUint16(offset + (i * 12), little) == 0x0112)
          return callback(view.getUint16(offset + (i * 12) + 8, little));

      }else if ((marker & 0xFF00) != 0xFF00) break;

      else offset += view.getUint16(offset, false);
		}
		  
	  return callback(-1);
	};
  
	reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
};

var i = 0;
var global_new_bill_id = 0;
var global_point_id = 0;
var type_bill = 'bill';
var bill_type = 0;
const url_bill = "https://jacochef.ru/src/img/billing_items/upload.php";
const url_bill_ex = "https://jacochef.ru/src/img/bill_ex_items/upload.php";

var dropzoneOptions_bill = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFiles: 1,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg,image/png,image/gif,.pdf",
  addRemoveLinks: true,
  
  url: url_bill,

  init: function() {

    var myDropzone = this;

    this.on("queuecomplete", function(data){
      var check_img = false;

      myDropzone['files'].map(function(item, key){
        if( item['status'] == "error" ){
          check_img = true;
        }
      })
      
      if( check_img ){
        return;
      }
      
      //console.log( 'queuecomplete' )
      //$('#modal_message').addClass('modal_true');
      //show_modal_message('Результат операции', 'Накладная успешно сохранена');
      //window.location.pathname = '/billing';

      if( type_bill == 'bill' ){

      }else{
        window.location.pathname = '/billing';
      }
    })
    
    this.on("sending", function(file, xhr, data) {
      //var point = document.getElementById('point_id').value;

      i++;
      var file_type = (file.name).split('.');
      file_type = file_type[file_type.length - 1];
      file_type = file_type.toLowerCase();

      if( type_bill == 'bill' ){
        data.append("filetype", 'bill_file_'+i+'_point_id_'+global_point_id+'_bill_id_'+global_new_bill_id+'.'+file_type);
        data.append("type_bill", 'bill');
      }else{
        data.append("filetype", 'bill_ex_file_'+i+'_point_id_'+global_point_id+'_bill_id_'+global_new_bill_id+'.'+file_type);
      }
      
      
      //'bill_file_0_point_id_1_bill_id_9114.png'
      
      if( file_type != 'pdf' ){
        getOrientation(file, function(orientation) {
          data.append("orientation", orientation);
        })
      }
    });
  },
};

var dropzoneOptions_bill_factur = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFiles: 1,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg,image/png,image/gif,.pdf",
  addRemoveLinks: true,
  
  url: url_bill,

  init: function() {

    var myDropzone = this;

    this.on("queuecomplete", function(data){
      var check_img = false;

      myDropzone['files'].map(function(item, key){
        if( item['status'] == "error" ){
          check_img = true;
        }
      })
      
      if( check_img ){
        return;
      }
      
      //console.log( 'queuecomplete' )
      //$('#modal_message').addClass('modal_true');
      //show_modal_message('Результат операции', 'Накладная успешно сохранена');
      //window.location.pathname = '/billing';

      window.location.pathname = '/billing';
    })
    
    this.on("sending", function(file, xhr, data) {
      //var point = document.getElementById('point_id').value;

      i++;
      var file_type = (file.name).split('.');
      file_type = file_type[file_type.length - 1];
      file_type = file_type.toLowerCase();

      if( type_bill== 'bill' ){
        data.append("filetype", 'bill_file_'+i+'_point_id_'+global_point_id+'_bill_id_'+global_new_bill_id+'.'+file_type);
        data.append("type_bill", 'factur');
      }else{
        data.append("filetype", 'bill_ex_file_'+i+'_point_id_'+global_point_id+'_bill_id_'+global_new_bill_id+'.'+file_type);
      }
      
      
      //'bill_file_0_point_id_1_bill_id_9114.png'
      
      if( file_type != 'pdf' ){
        getOrientation(file, function(orientation) {
          data.append("orientation", orientation);
        })
      }
    });
  },
};

const useStore = create((set, get) => ({
  isPink: false,
  setPink: () => set((state) => ({ isPink: !state.isPink })),

  acces: [],

  vendor_items: [],
  search_item: '',
  vendor_itemsCopy: [],

  all_ed_izmer: [],

  pq: '',
  count: '',
  fact_unit: '',
  summ: '',
  sum_w_nds: '',

  err_items: [],

  allPrice: 0,
  allPrice_w_nds: 0,

  bill_items_doc: [],
  bill_items: [],

  openAlert: false,
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

  types: types,
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

  is_horizontal: false,
  is_vertical: false,

  DropzoneMain: null,
  DropzoneDop: null,

  openImgType: '',

  set_position: (is_horizontal, is_vertical) => {
    set({
      is_horizontal: is_horizontal,
      is_vertical: is_vertical,
    });
  },

  setImgList: (imgs_bill, imgs_factur) => {
    set({
      imgs_bill: imgs_bill,
      imgs_factur: imgs_factur,
    });
  },

  setPoints: points => {
    set({
      points
    })
  },

  setAcces: acces => {
    set({
      acces
    });
  },

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
      vendorsCopy: res?.vendors ?? [],
      vendor_name: res?.vendors[0]?.name ?? '',
      search_vendor: res?.vendors[0]?.name ?? '',
      is_new_doc: parseInt(res?.bill?.doc_true),
      bill_list: res?.bill_hist,
      imgs_bill: res?.bill_imgs ?? [],
      imgs_factur: res?.factur_imgs ?? [],
      allPrice,
      allPrice_w_nds,
      bill: res?.bill,
      bill_items,
      number: res.bill?.number,
      date: res.bill?.date && res.bill?.date !== "0000-00-00" ? dayjs(res.bill?.date) : null,
      date_items: res.bill?.date_items ? dayjs(res.bill?.date_items) : null,
      comment: res.bill?.comment,
      comment_bux: res.bill?.com_bux,
      delete_text: res.bill?.del_text,
      users: res?.users,
      user: res?.bill_users,
      types: types,
      //type: parseInt(res?.bill?.type_bill) == 1 ? 2 : 4,
      type: res?.bill?.type_bill,
      //doc_base_id: parseInt(res?.bill?.type_doc ?? 0) === 0 ? '' : parseInt(res?.bill?.type_doc),
      doc_base_id: res?.bill?.doc_base_id,
      is_load_store: false,

      number_factur: res.bill?.number_factur,
      date_factur: res.bill?.date_factur && res.bill?.date_factur !== "0000-00-00" ? dayjs(res.bill?.date_factur) : null,
    });

    setTimeout( () => {
      if( document.getElementById('img_bill') ){
        set({
          DropzoneMain: new Dropzone("#img_bill", dropzoneOptions_bill),
        })
      }

      if( parseInt(res?.bill?.type_bill) == 2 ){
        if( document.getElementById('img_bill_type') ){
          set({
            DropzoneDop: new Dropzone("#img_bill_type", dropzoneOptions_bill_factur)
          })
        }
      }

      get().checkPriceItems();
      get().check_price_item_new();
    }, 500 )

    get().changeKinds(res?.bill?.type_doc);
  },

  closeDialog: () => {
    document.body.style.overflow = "";
    set({ 
      modalDialog: false,
      is_horizontal: false,
      is_vertical: false,
      openImgType: ''
    })
  },

  openImageBill: (image, type) => {
    get().handleResize();

    set({ 
      modalDialog: true, 
      image,
      openImgType: type,
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
        //bill_items_doc: [],
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

    const vendor = get().vendors.find((value) => value.name == search);

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
        doc: '',
        vendor: vendor,
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
      //vendors,
    });
  },

  search_point: async (event, name) => {
    const search = event.target.value ? event.target.value : name ? name : '';

    const type = get().type;
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

    if(point && type) {
  
        const obj = {
          point_id: point.id,
          type
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
          it = { name: `${it.name}`, id: it.id };
          return it;
        });
        return item;
      });

      set({
        vendor_items,
        all_ed_izmer: vendor_items.length ? vendor_items[0].pq_item : [],
        //pq: vendor_items.length ? vendor_items[0].pq_item[0].id : '',
        pq: '',
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
    const point = get().point;
    
    console.log( data, value, point )

    if(data === 'type' && point) {

      // const vendors = get().vendors;

        // if(point) {
          
          const obj = {
            point_id: point.id,
            type: value
          }

          const res = await get().getData('get_vendors', obj)
          
          

          // const data = {
          //   point_id: point.id,
          //   vendor_id: vendors[0]?.id
          // }

          // const res = await get().getData('get_vendor_items', data);
          
          set({
            vendors: res.vendors,
            vendorsCopy: res.vendors,
          });
        // }
    }

    if(data === 'type' && (parseInt(value) === 3 || parseInt(value) === 2)) {
      get().changeKinds(value);
    }

    if(data === 'type'){

      if( parseInt(value) === 2 ){
        setTimeout( () => {
          set({
            DropzoneDop: new Dropzone("#img_bill_type", dropzoneOptions_bill_factur)
          })
        }, 1000 )
      }else{
        set({
          DropzoneDop: null
        })
      }
    }

    set({
      [data]: value
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
    set({ openAlert: false });
  },

  showAlert: (status, text) => {
    set({ 
      openAlert: true,
      err_status: status,
      err_text: text
    });
  },

  addItem: () => {
    const { count, fact_unit, summ, sum_w_nds, all_ed_izmer, pq, vendor_items } = get();

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    if (!count || !fact_unit || !summ || !sum_w_nds || !pq || !all_ed_izmer.length) {

      set({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать Товар / кол-во Товара / указать суммы',
      });

      return;
    }

    const nds = get().check_nds_bill((Number(sum_w_nds) - Number(summ)) / (Number(summ) / 100))

    if (!nds) {

      set({
        openAlert: true,
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
    nds[5] = '5 %';
    nds[7] = '7 %';
    nds[10] = '10 %';
    nds[20] = '20 %';
    nds[18] = '18 %';
 
    return nds[Math.round(value)] ? nds[Math.round(value)] : false;
  },

  check_price_item_new: () => {
		var err_items = [];
    var bill_items = get().bill_items;		
    var vendor_items = get().vendor_items;

    bill_items.map((item, key) => {
      let one_price_bill = parseFloat(item['one_price_bill']);
      let one_price_vend = vendor_items.find(it => parseInt(it.id) === parseInt(item['item_id']))?.price;
      let vendor_percent = vendor_items.find(it => parseInt(it.id) === parseInt(item['item_id']))?.vend_percent;

      let one_price_max = parseFloat(one_price_vend) + ((parseFloat(one_price_vend) / 100) * parseFloat(vendor_percent));
			let one_price_min = parseFloat(one_price_vend) - ((parseFloat(one_price_vend) / 100) * parseFloat(vendor_percent));

      if(one_price_bill >= one_price_max || one_price_bill <= one_price_min || !one_price_bill || !one_price_max || !one_price_min || one_price_bill == 0 ){
        err_items.push(item);

        bill_items[ key ].color = true;
      }
    })

    set({
      bill_items,
      err_items
    })
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

  checkPriceItems: () => {
    //let bill_items = JSON.parse(JSON.stringify(get().bill_items));
    /*let bill_items = get().bill_items;

    bill_items.map((item) => {

      console.log( item.price, item.vend_percent, item.price_item, item.pq )
      console.log( 'item', item ) //

      const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)

      if(range_price_item) {
        item.color = false;
      } else {
        item.color = true;
      }

      return item;
    })

    set({
      bill_items,
    });*/

    get().check_price_item_new();
  },

  changeDataTable: (event, type, id, key) => {

    console.log( event )

    const value = event.target.value;

    let bill_items = get().bill_items;

    console.log(value, type, id, key)
    console.log(bill_items)

    bill_items = bill_items.map((item, index) => {
      if (item.id === id && key === index) {

        item[type] = value;

        if (type === 'pq') {
          item.fact_unit = (Number(item[type]) * Number(item.count)).toFixed(2);

          /*const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)
  
          if(range_price_item) {
            item.color = false;
          } else {
            item.color = true;
          }*/

        } 

        if (value && value !== '0' && value[0] !== '0' && type === 'count') {

          item.fact_unit = (Number(item[type]) * Number(item.pq)).toFixed(2);
          /*const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)

          if(range_price_item) {
            item.color = false;
          } else {
            item.color = true;
          }*/

        } else {

          if (type === 'count') {
            item.fact_unit = 0;
          }
    
          item.color = true;

        }


        if(type === 'price_item' || type === 'price_w_nds') {
          const nds = get().check_nds_bill((Number(item.price_w_nds) - Number(item.price_item)) / (Number(item.price_item) / 100))

          //const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)
  
          if (nds) {
            item.nds = nds;
            item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2)
          } else {
            item.summ_nds = 0;
            item.nds = '';
          }

          /*if(nds && range_price_item) {
            item.color = false;
          } else {
            item.color = true;
          }*/
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

    get().check_price_item_new();
  }

}));

function FormHeader_new({ type_edit }){

  const [points, point_name, search_point, types, type, changeData, search_vendors, vendors, search_vendor, kinds, doc_base_id, docs, doc, search_doc, changeInput, number, number_factur, changeDateRange, date, date_factur, fullScreen, vendor_name] = useStore( state => [ state.points, state.point_name, state.search_point, state.types, state.type, state.changeData, state.search_vendors, state.vendors, state.search_vendor, state.kinds, state.doc_base_id, state.docs, state.doc, state.search_doc, state.changeInput, state.number, state.number_factur, state.changeDateRange, state.date, state.date_factur, state.fullScreen, state.vendor_name]);

  //doc

  return (
    <>
      
      <Grid item xs={12} sm={4}>
        <MyAutocomplite2
          data={points}
          value={point_name}
          multiple={false}
          //disabled={ type_edit === 'edit' ? false : true }
          disabled={ true }
          func={ (event, name) => search_point(event, name) }
          onBlur={ (event, name) => search_point(event, name) }
          label="Точка"
        />
      </Grid>
          
        

      <Grid item xs={12} sm={4}>
        <MySelect
          data={types}
          value={type}
          multiple={false}
          is_none={false}
          //disabled={ type_edit === 'edit' ? false : true }
          disabled={ true }
          func={ event => changeData('type', event) }
          label="Тип"
        />
      </Grid>

     
      <Grid item xs={12} sm={4}>
        <MyAutocomplite2
          label="Поставщик"
          freeSolo={true}
          multiple={false}
          data={vendors}
          value={search_vendor}
          //disabled={ type_edit === 'edit' ? false : true }
          disabled={ true }
          func={ (event, name) => search_vendors(event, name) }
          onBlur={ (event, name) => search_vendors(event, name) }
        />
      </Grid>

      {parseInt(type) === 2 || parseInt(type) === 3 ? (
        <>
          <Grid item xs={12} sm={4}>
            <MySelect
              data={kinds}
              value={doc_base_id}
              multiple={false}
              is_none={false}
              //disabled={ type_edit === 'edit' ? false : true }
              disabled={ true }
              func={ event => changeData('doc_base_id', event) }
              label="Документ"
            />
          </Grid>
          {parseInt(type) === 2 ?  <Grid item xs={12} sm={4}></Grid> : null}
        </>
      ) : null}

      {parseInt(type) === 3 || parseInt(type) === 4 ? (
        <>
          <Grid item xs={12} sm={4}>
            <MyAutocomplite2
              data={docs}
              multiple={false}
              value={doc}
              disabled={ type_edit === 'edit' ? false : true }
              //disabled={ true }
              func={ (event, name) => search_doc(event, name) }
              onBlur={ (event, name) => search_doc(event, name) }
              label="Документ основание"
            />
          </Grid>
          {parseInt(type) === 4 ?  <Grid item xs={12} sm={4}></Grid> : null}
        </>
      ) : null}

      <Grid item xs={12} sm={6}>
        <MyTextInput
          label="Номер документа"
          disabled={ type_edit === 'edit' ? false : true }
          value={number}
          func={ (event) => changeInput(event, 'number') }
        />
      </Grid>

      {parseInt(type) === 2 && !fullScreen ? 
        <Grid item xs={12} sm={6}>
          <MyTextInput
            label="Номер счет-фактуры"
            disabled={ type_edit === 'edit' ? false : true }
            value={number_factur}
            func={ (event) => changeInput(event, 'number_factur') }
          />
        </Grid>
        : null
      }

      <Grid item xs={12} sm={6}>
        <MyDatePickerNew
          label="Дата документа"
          format="DD-MM-YYYY"
          disabled={ type_edit === 'edit' ? false : true }
          value={date}
          func={ (event) => changeDateRange(event, 'date') }
        />
      </Grid>

      {parseInt(type) === 2 && !fullScreen ? 
        <Grid item xs={12} sm={6}>
          <MyDatePickerNew
            label="Дата счет-фактуры"
            format="DD-MM-YYYY"
            disabled={ type_edit === 'edit' ? false : true }
            value={date_factur}
            func={ (event) => changeDateRange(event, 'date_factur') }
          />
        </Grid>
        : null
      }
    </>
  )
}

function FormVendorItems(){

  const [ vendor_items, search_item, all_ed_izmer, changeCount, changeData, addItem ] = useStore( state => [ state.vendor_items, state.search_item, state.all_ed_izmer, state.changeCount, state.changeData, state.addItem ]);
  const [ search_vendor_items, pq, count, fact_unit, summ, sum_w_nds ] = useStore( state => [ state.search_vendor_items, state.pq, state.count, state.fact_unit, state.summ, state.sum_w_nds ]);

  return (
    <>
      <Grid item xs={12} sm={12}>
        <h2>Товары поставщика</h2>
        <Divider style={{ backgroundColor: 'rgba(0, 0, 0, 0.87)' }} />
      </Grid>

      <Grid item xs={12} sm={4}>
        <MyAutocomplite2
          label="Товар поставщика"
          freeSolo={true}
          multiple={false}
          data={ vendor_items }
          value={ search_item?.name }
          func={ (event, name) => search_vendor_items(event, name) }
          onBlur={ (event, name) => search_vendor_items(event, name) }
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <MyAutocomplite2
          label="Объем упаковки"
          freeSolo={true}
          multiple={false}
          data={ all_ed_izmer }
          value={ pq }
          func={ (event, name) => changeData('pq', event) }
          onBlur={ (event, name) => changeData('pq', event) }
        />

      </Grid>

      <Grid item xs={12} sm={3}>
        <MyTextInput
          type="number"
          label="Кол-во упаковок"
          value={count}
          func={changeCount}
        />
      </Grid>
        
      <Grid item xs={12} sm={2}>
        <MyTextInput label="Кол-вo" disabled={true} value={fact_unit} className='disabled_input' />
      </Grid>

      <Grid item xs={12} sm={4}>
        <MyTextInput
          type="number"
          label="Сумма без НДС"
          value={summ}
          func={ event => changeData('summ', event) }
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MyTextInput
          type="number"
          label="Сумма c НДС"
          value={sum_w_nds}
          func={ event => changeData('sum_w_nds', event) }
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Button variant="contained" fullWidth style={{ height: '100%' }} onClick={addItem}>
          <AddIcon />
        </Button>
      </Grid>
    </>
  )
}

function VendorItemsTableEdit(){

  const [ deleteItem, changeDataTable ] = useStore( state => [ state.deleteItem, state.changeDataTable ]);
  const [ bill_items_doc, bill_items, allPrice, allPrice_w_nds ] = useStore( state => [ state.bill_items_doc, state.bill_items, state.allPrice, state.allPrice_w_nds ]);

  return (
    <>
      <Grid item xs={12} sm={12}>
        <h2>Товары в документе</h2>
        <Divider style={{ backgroundColor: 'rgba(0, 0, 0, 0.87)' }} />
      </Grid>

      <Grid item xs={12} style={{ marginBottom: 20 }} sm={12}>
        <TableContainer component={Paper}>
          <Table aria-label="a dense table">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell style={{ minWidth: '150px' }}>Товар</TableCell>
                { bill_items_doc.length == 0 ? null : <TableCell style={{ minWidth: '130px' }}>Изменения</TableCell> }
                <TableCell style={{ minWidth: '130px' }}>В упак.</TableCell>
                <TableCell style={{ minWidth: '130px' }}>Упак</TableCell>
                <TableCell>Кол-во</TableCell>
                <TableCell style={{ minWidth: '100px' }}>НДС</TableCell>
                <TableCell style={{ minWidth: '130px' }}>Сумма без НДС</TableCell>
                <TableCell>Сумма НДС</TableCell>
                <TableCell style={{ minWidth: '130px' }}>Сумма с НДС</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill_items.map((item, key) => (
                <React.Fragment key={key}>
                  {!item?.data_bill ? null :
                    <TableRow style={{ backgroundColor: item?.color ? 'rgb(255, 204, 0)' : '#fff' }}>
                      <TableCell rowSpan={2}>{item?.name ?? item.item_name}</TableCell>
                      <TableCell>До</TableCell>
                      <TableCell>{item?.data_bill?.pq} {item.ed_izmer_name}</TableCell>
                      <TableCell>{item?.data_bill?.count}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{item?.data_bill?.fact_unit} {item.ed_izmer_name}</TableCell>
                      <TableCell>{item?.data_bill?.nds}</TableCell>
                      <TableCell>{item?.data_bill?.price} ₽</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{item?.data_bill?.summ_nds} ₽</TableCell>
                      <TableCell>{item?.data_bill?.price_w_nds} ₽</TableCell>
                      <TableCell rowSpan={2}>
                        <Button onClick={ () => deleteItem(key) } style={{ cursor: 'pointer' }} color="error" variant="contained">
                          <ClearIcon />
                        </Button>
                      </TableCell>
                      <TableCell rowSpan={2}>
                        {Number(item.count) === 0 ? Number(item.count).toFixed(2) : ( parseFloat(item.price_w_nds) / parseFloat(item.fact_unit)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  }

                  <TableRow hover style={{ backgroundColor: item?.color ? 'rgb(255, 204, 0)' : '#fff' }}>
                    {item?.data_bill ? null : <TableCell> {item?.name ?? item.item_name} </TableCell>}
                    {!item?.data_bill ? null : <TableCell>После</TableCell>}
                    <TableCell className="ceil_white">
                      

                      <MyAutocomplite2
                        label=""
                        freeSolo={true}
                        multiple={false}
                        data={ item.pq_item }
                        value={ item.pq }
                        //func={ (event, data) => { console.log( data ?? event.target.value ) } }
                        //onBlur={ (event, data) => { console.log( data ?? event.target.value ) } }
                        func={ (event, data) => changeDataTable( { target: { value: data ?? event.target.value } }, 'pq', item.id, key) }
                        onBlur={ (event, data) => changeDataTable({ target: { value: data ?? event.target.value } }, 'pq', item.id, key) }
                      />


                    </TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="number"
                        label=""
                        value={item.count}
                        func={(event) => changeDataTable(event, 'count', item.id, key)}
                        onBlur={(event) => changeDataTable(event, 'count', item.id, key)}
                      />
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{item.fact_unit} {item.ed_izmer_name}</TableCell>
                    <TableCell>{item.nds}</TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="number"
                        label=""
                        value={item.price_item}
                        func={(event) => changeDataTable(event, 'price_item', item.id, key)}
                        onBlur={(event) => changeDataTable(event, 'price_item', item.id, key)}
                      />
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{item.summ_nds} ₽</TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="number"
                        label=""
                        value={item.price_w_nds}
                        func={(event) => changeDataTable(event, 'price_w_nds', item.id, key)}
                        onBlur={(event) => changeDataTable(event, 'price_w_nds', item.id, key)}
                      />
                    </TableCell>
                    {item?.data_bill ? null :
                      <>
                        <TableCell>
                          <Button onClick={ () => deleteItem(key) } style={{ cursor: 'pointer' }} color="error" variant="contained">
                            <ClearIcon />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {Number(item.count) === 0 ? Number(item.count).toFixed(2) : (Number(item.price_w_nds) / Number(item.fact_unit)).toFixed(2)}
                        </TableCell>
                      </>
                    }
                  </TableRow>
                </React.Fragment>
              ))}
              { bill_items.length == 0 ? null : (
                <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                  <TableCell>Итого:</TableCell>
                  { bill_items_doc.length == 0 ? null : <TableCell></TableCell> }
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{allPrice} ₽</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{allPrice_w_nds} ₽</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  )
}

function VendorItemsTableView(){

  const [ deleteItem, changeDataTable ] = useStore( state => [ state.deleteItem, state.changeDataTable ]);
  const [ bill_items_doc, bill_items, allPrice, allPrice_w_nds ] = useStore( state => [ state.bill_items_doc, state.bill_items, state.allPrice, state.allPrice_w_nds ]);

  return (
    <>
      <Grid item xs={12} sm={12}>
        <h2>Товары в документе</h2>
        <Divider style={{ backgroundColor: 'rgba(0, 0, 0, 0.87)' }} />
      </Grid>

      <Grid item xs={12} style={{ marginBottom: 20 }} sm={12}>
        <TableContainer component={Paper}>
          <Table aria-label="a dense table">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell>Товар</TableCell>
                { bill_items_doc.length == 0 ? null : <TableCell>Изменения</TableCell> }
                <TableCell>В упак.</TableCell>
                <TableCell>Упак</TableCell>
                <TableCell>Кол-во</TableCell>
                <TableCell>НДС</TableCell>
                <TableCell>Сумма без НДС</TableCell>
                <TableCell>Сумма НДС</TableCell>
                <TableCell>Сумма с НДС</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill_items.map((item, key) => (
                <React.Fragment key={key}>
                  {!item?.data_bill ? null :
                    <TableRow style={{ backgroundColor: item?.color ? 'rgb(255, 204, 0)' : '#fff' }}>
                      <TableCell rowSpan={2}>{item?.name ?? item.item_name}</TableCell>
                      <TableCell>До</TableCell>
                      <TableCell>{item?.data_bill?.pq} {item.ed_izmer_name}</TableCell>
                      <TableCell>{item?.data_bill?.count}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{item?.data_bill?.fact_unit} {item.ed_izmer_name}</TableCell>
                      <TableCell>{item?.data_bill?.nds}</TableCell>
                      <TableCell>{item?.data_bill?.price} ₽</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{item?.data_bill?.summ_nds} ₽</TableCell>
                      <TableCell>{item?.data_bill?.price_w_nds} ₽</TableCell>
                      <TableCell rowSpan={2}></TableCell>
                      <TableCell rowSpan={2}>
                        {Number(item.count) === 0 ? Number(item.count).toFixed(2) : (Number(item.price_w_nds) / Number(item.count)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  }

                  <TableRow hover style={{ backgroundColor: item?.color ? 'rgb(255, 204, 0)' : '#fff' }}>
                    {item?.data_bill ? null : <TableCell> {item?.name ?? item.item_name} </TableCell>}
                    {!item?.data_bill ? null : <TableCell>После</TableCell>}
                    <TableCell className="ceil_white">{item.pq}</TableCell>
                    <TableCell className="ceil_white">{item.count}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{item.fact_unit} {item.ed_izmer_name}</TableCell>
                    <TableCell>{item.nds}</TableCell>
                    <TableCell className="ceil_white">{item.price_item}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{item.summ_nds} ₽</TableCell>
                    <TableCell className="ceil_white">{item.price_w_nds}</TableCell>
                    {item?.data_bill ? null :
                      <>
                        <TableCell>
                          
                        </TableCell>
                        <TableCell>
                          {Number(item.count) === 0 ? Number(item.count).toFixed(2) : (Number(item.price_w_nds) / Number(item.count)).toFixed(2)}
                        </TableCell>
                      </>
                    }
                  </TableRow>
                </React.Fragment>
              ))}
              { bill_items.length == 0 ? null : (
                <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                  <TableCell>Итого:</TableCell>
                  { bill_items_doc.length == 0 ? null : <TableCell></TableCell> }
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{allPrice} ₽</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{allPrice_w_nds} ₽</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  )
}

function FormImage_new({ type_edit, type_doc }){

  const [type, imgs_bill, openImageBill, fullScreen, imgs_factur, number_factur, changeInput, changeDateRange, date_factur] = useStore( state => [state.type, state.imgs_bill, state.openImageBill, state.fullScreen, state.imgs_factur, state.number_factur, state.changeInput, state.changeDateRange, state.date_factur]);

  const url = type_doc === 'bill' ? 'bill/' : 'bill-ex-items/'

  return (
    <>
      <Grid item xs={12} sm={parseInt(type) === 2 ? 6 : 12}>
        <TableContainer>
          <Grid display="flex" flexDirection="row" style={{ fontWeight: 'bold' }}>
            {!imgs_bill.length ? 'Фото отсутствует' :
              <>
                {imgs_bill.map((img, key) => (
                  <img 
                    key={key} 
                    src={'https://storage.yandexcloud.net/' + url + img} 
                    alt="Image bill" 
                    className="img_modal_bill"
                    onClick={() => openImageBill('https://storage.yandexcloud.net/' + url + img, 'bill')}
                  />
                ))}
              </>
            }
          </Grid>
        </TableContainer>
      </Grid>

      {parseInt(type) === 2 && !fullScreen && type_doc === 'bill' ? (
        <Grid item xs={12} sm={6} display="flex" flexDirection="row" style={{ fontWeight: 'bold' }}>
          {!imgs_factur.length ? 'Фото отсутствует' :
            <>
              {imgs_factur.map((img, key) => (
                <img 
                  key={key} 
                  src={'https://storage.yandexcloud.net/bill/' + img} 
                  alt="Image bill" 
                  className="img_modal_bill"
                  onClick={() => openImageBill('https://storage.yandexcloud.net/bill/' + img, 'factur')}
                />
              ))}
            </>
          }
        </Grid>
      ) : null}

      { type_edit === 'edit' ?
        <Grid item xs={12} sm={parseInt(type) === 2 ? 6 : 12}>
          <div
            className="dropzone"
            id="img_bill"
            style={{ width: '100%', minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Grid>
          :
        null
      }


      {type_edit === 'edit' && parseInt(type) === 2 && !fullScreen ? (
        <Grid item xs={12} sm={6}>
          
          <div
            className="dropzone"
            id="img_bill_type"
            style={{ width: '100%', minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Grid>
      ) : null}

      {parseInt(type) === 2 && fullScreen && type_doc === 'bill' ? 
        <>
          <Grid item xs={12}>
            <MyTextInput
              label="Номер счет-фактуры"
              disabled={ type_edit === 'edit' ? false : true }
              value={number_factur}
              func={ (event) => changeInput(event, 'number_factur') }
            />
          </Grid>

          <Grid item xs={12}>
            <MyDatePickerNew
              label="Дата счет-фактуры"
              format="DD-MM-YYYY"
              disabled={ type_edit === 'edit' ? false : true }
              value={date_factur}
              func={ (event) => changeDateRange(event, 'date_factur') }
            />
          </Grid>

          <Grid item xs={12}>
            <TableContainer>
              <Grid display="flex" flexDirection="row" style={{ fontWeight: 'bold' }}>
                {!imgs_factur.length ? 'Фото отсутствует' :
                  <>
                    {imgs_factur.map((img, key) => (
                      <img 
                        key={key} 
                        src={'https://storage.yandexcloud.net/bill/' + img} 
                        alt="Image bill" 
                        className="img_modal_bill"
                        onClick={() => openImageBill('https://storage.yandexcloud.net/bill/' + img, 'factur')}
                      />
                    ))}
                  </>
                }
              </Grid>
            </TableContainer>
          </Grid>

          { type_edit === 'edit' ?
            <Grid item xs={12}>
              <div
                className="dropzone"
                id="img_bill_type"
                style={{ width: '100%', minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Grid>
              :
            null
          }
        </>
        : null
      }
    </>
  )
}

function FormOther_new({ page, type_edit, type_doc }){

  const [type, date_items, changeDateRange, users, user, changeAutocomplite, comment, changeInput, changeItemChecked, is_new_doc, comment_bux, delete_text] = useStore( state => [state.type, state.date_items, state.changeDateRange, state.users, state.user, state.changeAutocomplite, state.comment, state.changeInput, state.changeItemChecked, state.is_new_doc, state.comment_bux, state.delete_text]);

  return (
    <>
      {parseInt(type) === 1 ? null : type_doc === 'bill_ex' ? null :
        <>
          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Дата разгрузки"
              format="DD-MM-YYYY"
              disabled={ type_edit === 'edit' ? false : true }
              value={date_items}
              func={ (event) => changeDateRange(event, 'date_items') }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              data={users}
              multiple={true}
              disabled={ type_edit === 'edit' ? false : true }
              value={user}
              func={(event, data) => changeAutocomplite('user', data)}
              label={"Сотрудники"}
            />
          </Grid>
        </>
      }

      <Grid item xs={12} sm={12}>
        <MyTextInput
          label="Комментарии"
          multiline={true}
          disabled={ type_edit === 'edit' ? false : true }
          maxRows={3}
          value={comment}
          func={ (event) => changeInput(event, 'comment') }
        />
      </Grid>

      {page === 'new' ? null :
        <>
          <Grid item xs={12} sm={6} style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ fontWeight: 'bold', color: '#9e9e9e' }}>
              Причина удаления:&nbsp;
            </Typography>
            <Typography>{delete_text}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ fontWeight: 'bold', color: '#9e9e9e' }}>Комментарий бухгалтера:&nbsp;</Typography>
            <Typography>{comment_bux}</Typography>
          </Grid>
        </>
      }


      <Grid item xs={12} sm={12} display="flex" alignItems="center" style={{ display: 'none' }}>
        <MyCheckBox
          disabled={ type_edit === 'edit' ? false : true }
          value={parseInt(is_new_doc) === 1 ? true : false}
          func={ (event) => changeItemChecked(event, 'is_new_doc') }
          label="Поставщик привезет новый документ"
        />
        
      </Grid>

    </>
  )
}

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

// Аккродион с данными из накладной
class Billing_Accordion extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.bill_list;
    var array2 = this.props.bill_list;

    var is_same = array1.length == array2.length && array1.every(function (element, index) { return element === array2[index] });

    return !is_same;
  }

  render() {
    const { bill_list, type } = this.props;

    return (
      <Grid item xs={12} sm={12} mb={5}>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>История</AccordionSummary>
          <AccordionDetails>

            <AccordionDetails>
              <AccordionSummary style={{ cursor: 'default' }} expandIcon={<ExpandMoreIcon sx={{ opacity: 0 }} />} aria-controls="panel1a-content">
                <Grid item xs display="flex" flexDirection="row">
                  <Typography style={{ width: '1%' }}></Typography>
                  <Typography style={{ width: '4%', minWidth: '210px' }}>Тип документа</Typography>
                  
                  <Typography style={{ width: '11%' }}>
                    Номер документа
                  </Typography>
                  <Typography style={{ width: '11%' }}>
                    Дата в документе
                  </Typography>
                  <Typography style={{ width: '14%', minWidth: '200px' }}>Создатель</Typography>
                  <Typography style={{ width: '10%' }}>Дата обновления</Typography>
                  <Typography style={{ width: '14%', minWidth: '200px' }}>Редактор</Typography>
                  <Typography style={{ width: '11%' }}>Время обновления</Typography>
                  <Typography style={{ width: '8%' }}>Сумма с НДС</Typography>
                </Grid>
              </AccordionSummary>

              {bill_list.map((item, i) => (
                <Accordion key={i}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" className="accordion_summary" style={{ paddingRight: '1%' }}>

                    <Grid item xs display="flex" flexDirection='row'>

                      <Typography component="div" style={{ width: '1%', backgroundColor: item.color, marginRight: '1%' }}></Typography>
                      
                      <Typography style={{ width: '4%', minWidth: '210px',  display: 'flex', alignItems: 'center' }}>
                        {item.name}
                      </Typography>

                      

                      <Typography style={{ width: '11%',  display: 'flex', alignItems: 'center' }}>
                        {item.number}
                      </Typography>

                      <Typography style={{ width: '11%',  display: 'flex', alignItems: 'center' }}>
                        {formatDateReverse(item.date_create)}
                      </Typography>

                      <Typography style={{ width: '14%', minWidth: '200px', display: 'flex', alignItems: 'center' }}>
                        {item.creator_id}
                      </Typography>

                      <Typography style={{ width: '10%',  display: 'flex', alignItems: 'center' }}>
                        {formatDateReverse(item.date_update)}
                      </Typography>

                      <Typography style={{ width: '14%', minWidth: '200px', display: 'flex', alignItems: 'center'}}>
                        {item.editor_id}
                      </Typography>

                      <Typography style={{ width: '11%',  display: 'flex', alignItems: 'center' }}>
                        {item.time_update}
                      </Typography>

                      

                      <Typography style={{ width: '8%',  display: 'flex', alignItems: 'center' }}>
                        {item.sum_w_nds}
                      </Typography>
                    </Grid>
                  </AccordionSummary>

                  <AccordionDetails>
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
                        {item?.items?.map((item, key) => (
                          <TableRow key={key} hover>
                            <TableCell>{item.name}</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>{item.pq} {item.ei_name}</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>{item.count}</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>{item.fact_count} {item.ei_name}</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>{item.price_w_nds} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>

          </AccordionDetails>
        </Accordion>

        
        
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
      horizontal: true,
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
    /*let scaleX = this.state.scaleX;

    if(scaleX < 0) {
      scaleX = scaleX * -1;
    } else {
      scaleX = -scaleX;
    }

    this.setState({
      scaleX,
    });*/

    let rotate = this.state.rotate;
    rotate = rotate + 180;

    this.setState({
      rotate,
    });
  }

  setScaleVertical() {
    /*let scaleY = this.state.scaleY;

    if(scaleY < 0) {
      scaleY = scaleY * -1;
    } else {
      scaleY = -scaleY;
    }

    this.setState({
      scaleY,
    });*/

    let rotate = this.state.rotate;
    rotate = rotate - 180;
 
    this.setState({
      rotate,
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

    this.props.store.set_position(false, !vertical);

    this.setState({
      vertical: !vertical,
      horizontal: false,
    });

  }

  setSplitHorizontal() {
    this.reset();

    const horizontal = this.state.horizontal;

    this.props.store.set_position(!horizontal, false);

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
          { this.props.isDelImg === true ?
            <MyTooltip name='Удалить'>
              <IconButton onClick={this.props.delImg.bind(this, this.props.image)} style={{ backgroundColor: 'red', color: '#fff' }}>
                <DeleteForeverIcon />
              </IconButton>
            </MyTooltip>
              :
            false
          }
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
          <MyTooltip name='Повернуть на 180 градусов влево'>
            <IconButton onClick={this.setScaleVertical.bind(this)}>
              <ContrastIcon />
            </IconButton>
          </MyTooltip>
          <MyTooltip name='Повернуть на 180 градусов вправо'>
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
          <MyTooltip name='Разделить экран по вертикали' style={{ display: 'none' }}>
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
          <MyTooltip name='Закрыть картинку'>
            <IconButton onClick={this.props.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </MyTooltip>
        </div>

        { !this.state.vertical && !this.state.horizontal ?
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
            : 
          null
        }

        {this.state.vertical || this.state.horizontal ?
          <div className="modal" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)',  width: this.state.vertical ? '50%' : '100%',  height: this.state.horizontal ? '50vh' : '100vh', left: this.state.vertical ? '50%' : 0, top: this.state.horizontal ? '50%' : 0}}>
            <Draggable>
              <div>
                <div className="modal_content" style={{transform: `rotate(${this.state.rotate}deg) scale(${this.state.scaleX}, ${this.state.scaleY})`}}>
                  <img 
                    src={this.props.image} 
                    alt="Image bill" 
                    className="image_bill" 
                    draggable="false"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </Draggable>
          </div> 
        : null}

      </>
    );
  }
}

class Billing_Edit_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'billing',
      module_name: '',
      is_load: false,

      acces: null,
      type_doc: '',

      modelCheckDel: false,
      modelCheckDelImg: false,
      modelChecReturn: false,

      imgDel: '',
      delText: '',
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

    let res;

    if(bill.type === 'bill') {
      res = await this.getData('get_one', bill);
    } else {
      res = await this.getData('get_one_bill_ex', bill);
    }

    // console.log("🚀 === componentDidMount res:", res);

    const points = await this.getData('get_points');

    const point = points.points.find(point => point.id === res.bill.point_id);

    const data = {
      point_id: bill['point_id'],
      vendor_id: res?.vendors[0]?.id,
    }

    this.setState({
      acces: res?.acces,
      type_doc: data_bill[2]
    });

    const items = await this.getData('get_vendor_items', data);
    const docs = await this.getData('get_base_doc', data);

    const { getDataBill, setAcces } = this.props.store;

    setAcces(res?.acces);
    getDataBill(res, point, items.items, docs);

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

  async saveEditBill (type_save) {
    const {vendor, err_items, DropzoneMain, DropzoneDop, showAlert, number, point, date, number_factur, date_factur, type, doc, doc_base_id, date_items, user, comment, is_new_doc, bill_items, imgs_bill, imgs_factur, bill } = this.props.store;

    const dateBill = date ? dayjs(date).format('YYYY-MM-DD') : '';
    const dateFactur = date_factur ? dayjs(date_factur).format('YYYY-MM-DD') : '';
    const dateItems = date_items ? dayjs(date_items).format('YYYY-MM-DD') : '';

    const items = bill_items.reduce((newItems, item) => {

      let it = {};

      it.pq = item.pq;
      it.count = item.count;
      it.item_id = item.item_id ?? item.id;
      it.summ = item.price_item;
      it.summ_w_nds = item.price_w_nds;
      it.color = item.color;

      const nds = item.nds.split(' %')[0];

      if(nds === 'без НДС') {
        it.nds = -1
      } else {
        it.nds = nds;
      }

      newItems.push(it);

      return newItems;
    }, [])

    if( imgs_bill.length == 0 && ( !DropzoneMain || DropzoneMain['files'].length === 0 ) ) {
      showAlert(false, 'Нет изображений документа');

      return ;
    }

    if( imgs_factur.length == 0 && parseInt(doc_base_id) == 1 && ( parseInt(type) == 2 && ( !DropzoneDop || DropzoneDop['files'].length === 0 ) ) ) {
      showAlert(false, 'Нет изображений счет-фактуры');

      return ;
    }

    if( DropzoneMain && DropzoneMain['files'].length > 0 ){
      if( parseInt(type) == 1 ){
        DropzoneMain.options.url = url_bill_ex;
        type_bill = 'bill_ex';
      }else{
        DropzoneMain.options.url = url_bill;
        type_bill = 'bill';
      }
    }

    const data = {
      bill_id: bill.id,
      doc,
      type,
      items,
      number,
      text: this.state.delText,
      comment,
      is_new_doc,
      users: user,
      doc_base_id,
      number_factur,
      date: dateBill,
      date_items: dateItems,
      date_factur: dateFactur,
      point_id: bill.point_id,
      vendor_id: bill.vendor_id,
      type_save: type_save,
      err_items: err_items
    }

    const res = await this.getData('save_edit', data);

    if (res.st === true) {

      if( res?.text && res.text.length > 0 ) {

        showAlert(res.st, res.text);
      }

      global_point_id = point?.id
      global_new_bill_id = res.bill_id;
      
      if( DropzoneMain && DropzoneMain['files'].length > 0 ){
        i = imgs_bill.length + 1;
        DropzoneMain.processQueue();
      }

      if( parseInt(type) == 2 && DropzoneDop && DropzoneDop['files'].length > 0 ){
        i = imgs_factur.length + 1;
        DropzoneDop.processQueue();
      }

      if( (!DropzoneMain || DropzoneMain['files'].length == 0) && (!DropzoneDop || DropzoneDop['files'].length == 0) ){
        window.location.pathname = '/billing';
      }

    } else {

      showAlert(res.st, res.text);

    }
  }

  async saveDelDoc () {
    const { bill, point, showAlert } = this.props.store;

    if( this.state.delText.length <= 3 ) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Надо указать причину удаления'
      });

      return;
    }

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      del_res: this.state.delText
    }

    const res = await this.getData('save_bill_del', data);

    if (res.st) {
      showAlert(res.st, res.text);

      this.setState({
        modelCheckDel: false
      });

      window.location.pathname = '/billing';
    } else {

      showAlert(res.st, res.text);
    }
  }

  delImg(img){

    this.setState({
      imgDel: img,
      modelCheckDelImg: true
    })

  }

  async delImgTrue(){
    const { bill, point, closeDialog, setImgList, showAlert, openImgType } = this.props.store;

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      bill_type: parseInt(bill.type_bill) == 1 ? 'bill_ex' : 'bill', //bill / bill_ex
      type: openImgType, //bill / factur
      img_name: this.state.imgDel
    }

    const res = await this.getData('delImg', data);

    if( res.st === true ){
      closeDialog();
      setImgList(res?.imgs_bill, res?.imgs_factur);

      this.setState({ modelCheckDelImg: false, imgDel: '' })
    }else{
      showAlert(res.st, res.text);
    }
  }

  async saveTruePrice(){
    const { bill, point, showAlert } = this.props.store;

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      type: parseInt(bill.type_bill) == 1 ? 'bill_ex' : 'bill', //bill / bill_ex
    }

    const res = await this.getData('save_true_price', data);

    if (res.st) {
      showAlert(res.st, res.text);

      window.location.pathname = '/billing';
    } else {

      showAlert(res.st, res.text);
    }
  }

  render() {

    const { acces, openAlert, err_status, err_text, closeAlert, is_load_store, modalDialog, fullScreen, image, closeDialog, bill, bill_list, bill_items, is_horizontal, is_vertical } = this.props.store;

    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load || is_load_store}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {!modalDialog ? null :
          <Billing_Modal
            onClose={closeDialog}
            fullScreen={fullScreen}
            image={image}
            store={this.props.store}
            delImg={this.delImg.bind(this)}
            isDelImg={ parseInt(acces?.del_img) == 1 ? true : false }
          />
        }

        <MyAlert
          isOpen={openAlert}
          onClose={closeAlert}
          status={err_status}
          text={err_text}
        />

        <Dialog
          open={this.state.modelCheckDel}
          onClose={ () => { this.setState({ modelCheckDel: false }) } }
        >
          <DialogTitle>Подтверждение</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: 20 }}>
              Несохраненные данные не будут применены
            </DialogContentText>

            <MyTextInput label="Причина удаления" value={this.state.delText} func={ event => { this.setState({ delText: event.target.value }) } } />
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => { this.setState({ modelCheckDel: false }) } }>Отмена</Button>
            <Button onClick={ this.saveDelDoc.bind(this) }>Удалить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modelChecReturn}
          onClose={ () => { this.setState({ modelChecReturn: false, delText: '' }) } }
        >
          <DialogTitle>Подтверждение</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: 20 }}>
              Укажите причину возврата
            </DialogContentText>

            <MyTextInput label="Причина" value={this.state.delText} func={ event => { this.setState({ delText: event.target.value }) } } />
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => { this.setState({ modelChecReturn: false, delText: '' }) } }>Отмена</Button>
            <Button onClick={ this.saveEditBill.bind(this, 'return') }>Вернуть</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modelCheckDelImg}
          onClose={ () => { this.setState({ modelCheckDelImg: false, imgDel: '' }) } }
        >
          <DialogTitle>Подтверждение</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: 20 }}>
              Удалить сохраненное изображение?
            </DialogContentText>

          </DialogContent>
          <DialogActions>
            <Button onClick={ () => { this.setState({ modelCheckDelImg: false, imgDel: '' }) } }>Отмена</Button>
            <Button onClick={ this.delImgTrue.bind(this) }>Удалить</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3} mb={10} style={{ marginTop: '64px', maxWidth: is_vertical ? '50%' : '100%', marginBottom: is_horizontal ? 700 : 30 }}>

          <Grid item xs={12} sm={12}>
            <h1>Документ: {bill?.number}</h1>
            <Divider style={{ backgroundColor: 'rgba(0, 0, 0, 0.87)' }} />
          </Grid>

          <FormHeader_new type_doc={this.state.type_doc} page={'edit'} type_edit={ parseInt(this.state.acces?.header) == 1 ? 'edit' : 'show' } />
          
          <FormImage_new type_doc={this.state.type_doc} type_edit={ parseInt(this.state.acces?.photo) == 1 ? 'edit' : 'show' } />

          { parseInt(this.state.acces?.items) == 1 ? 
            <>
              <FormVendorItems />  
              <VendorItemsTableEdit />
            </>
              :
            <VendorItemsTableView />
          }
          
          <FormOther_new type_doc={this.state.type_doc} page={'edit'} type_edit={parseInt(this.state.acces?.footer) == 1 ? 'edit' : 'show' } />

          <Billing_Accordion
            bill_list={bill_list}
            bill_items={bill_items}
            type='edit'
          />

          { parseInt(this.state.acces?.only_delete) === 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth style={{ height: '100%' }}
                onClick={ () => { this.setState({ modelCheckDel: true }) } }
              >
                Удалить
              </Button>
            </Grid>
          }

          { !parseInt(this.state.acces?.only_return) || parseInt(this.state.acces?.only_return) == 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth style={{ height: '100%' }}
                onClick={ () => { this.setState({ modelChecReturn: true }) } }
              >
                Ошибка ( вернуть управляющему )
              </Button>
            </Grid>
          }

          { parseInt(this.state.acces?.only_save) === 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth color="success" style={{ height: '100%' }} onClick={this.saveEditBill.bind(this, 'current')}>
                Сохранить
              </Button>
            </Grid>
          }
         
         { !parseInt(this.state.acces?.send_1c) || parseInt(this.state.acces?.send_1c) == 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth color="success" style={{ height: '100%' }} onClick={this.saveEditBill.bind(this, 'next')}>
                Отправить в 1с
              </Button>
            </Grid>
          }

          { !parseInt(this.state.acces?.pay) || parseInt(this.state.acces?.pay) == 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth color="success" style={{ height: '100%' }} onClick={this.saveEditBill.bind(this, 'next')}>
                Оплатить
              </Button>
            </Grid>
          }

          { !parseInt(this.state.acces?.true_price) || parseInt(this.state.acces?.true_price) == 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth color="success" style={{ height: '100%' }} onClick={this.saveTruePrice.bind(this)}>
                Подтвердить ценники
              </Button>
            </Grid>
          }

          { parseInt(this.state.acces?.only_delete) === 0 ? false :
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth color="info" style={{ height: '100%' }}
                onClick={this.saveEditBill.bind(this, 'next')}
              >
                Сохранить и отправить
              </Button>
            </Grid>
          }
          
        </Grid>
      </>
    );
  }
}

const withStore = BaseComponent => props => {
  const store = useStore();
  return <BaseComponent {...props} store={store} />;
};

const Billing_Edit_Store = withStore(Billing_Edit_)

export default function BillingEdit() {
  return <Billing_Edit_Store />;
}
