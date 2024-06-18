import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Snackbar from '@mui/material/Snackbar';

import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

import {MySelect, MyAutocomplite2, MyAutocomplite } from '@/ui/elements';

import queryString from 'query-string';

class OrderPostRec_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      points: [],
      point: [],
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.event);

    if (!this.props.points) {
      return;
    }

    if (this.props.points !== prevProps.points) {
      this.setState({
        points: this.props.points,
      });
    }
  }

  choosePoint(event, value) {
    this.setState({
      point: value,
    });
  }

  save() {

    this.props.save(this.state.point)

    this.setState({
      points: this.props.points ? this.props.points : [],
    });

    this.props.onClose();
  }

  onClose() {
    this.setState({
      points: this.props.points ? this.props.points : [],
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={'xs'}
      >
        <DialogTitle>Где применить</DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid item xs={12} sm={4}>
            <MyAutocomplite
              label="Точки"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.choosePoint.bind(this)}
            />
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class OrderPostRec_TableItem extends React.Component {

  shouldComponentUpdate(nextProps) {
    return (nextProps.it.item_id_rec !== this.props.it.item_id_rec
         || nextProps.it.vendor_id_rec !== this.props.it.vendor_id_rec);
  }

  render(){
    const it = this.props.it;

    let vendors = [];
    let item = it.items.filter(el => el.id === it.item_id_rec);

    if( item.length > 0 ){
      vendors = item[0].vendors;
    }else{
      vendors = it.items[0].vendors;
    }

    /*if( parseInt(it.id) == 200 ){
      console.log( it )
      console.log( item )
      console.log( vendors )
    }*/

    let pq = vendors.find(el => el.id === it.vendor_id_rec);

    if( pq ){
      pq = pq.pq;
    }else{
      pq = '';
    }

    return(
      <TableRow
        sx={{ '& td': { border: 0 } }}
        hover={true}
      >
        <TableCell>{it.id}</TableCell>
        <TableCell>{it.name}</TableCell>

        <TableCell>
          {it.items.length === 1 ? (
            it.items[0].name
          ) : (
            <MySelect
              data={it.items}
              value={it.item_id_rec}
              func={this.props.changeSelect.bind(this, it.id, 'item_id_rec', this.props.type)}
            />
          )}
        </TableCell>

        <TableCell>
          {pq} {it.ei_name}
        </TableCell>

        <TableCell>
          <MySelect
            is_none={false}
            data={vendors}
            value={it.vendor_id_rec}
            func={this.props.changeSelect.bind(this, it.id, 'vendor_id_rec', this.props.type)}
          />
        </TableCell>
      </TableRow>
    )
  }
}

class OrderPostRec_Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      cats: [],
      freeItems: [],

      search: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {

      if(this.state.search) {

        const searchValue = this.state.search;

        const catsFilter = JSON.parse(JSON.stringify(this.props.cats));

        const freeItems = JSON.parse(JSON.stringify(this.props.freeItems));

        catsFilter.map((cat) => {
          let arr = [];
  
          cat.cats.map((el) => {
            el.items = el.items.filter((value) =>
              value.name.toLowerCase().includes(searchValue.toLowerCase())
            );
  
            if (!el.items.length) {
              arr.push(el);
            }
  
            return el;
          });
  
          if (cat.cats.length === arr.length) {
            cat.all = 0;
          }
        });
  
        const freeItemsFilter = freeItems.filter((value) =>
          value.name.toLowerCase().includes(searchValue.toLowerCase())
        );
  
        this.setState({
          cats: catsFilter,
          freeItems: freeItemsFilter,
          items: this.props.items,
        });

      } else {

        this.setState({
          cats: JSON.parse(JSON.stringify(this.props.cats)),
          freeItems: JSON.parse(JSON.stringify(this.props.freeItems)),
          items: this.props.items,
        });

      }

  }
}

  search(event) {

    let searchValue;

    if (event.target.value) {
      searchValue = event.target.value ?? '';

      this.setState({
      search: searchValue
      });

    } else {
      searchValue = event.target.innerText ?? '';

      this.setState({
        search: searchValue
        });
    } 

    const catsFilter = this.state.cats;

    const freeItems = this.state.freeItems;

    if (searchValue !== '' || searchValue.length > 1) {
      catsFilter.map((cat) => {
        let arr = [];

        cat.cats.map((el) => {
          el.items = el.items.filter((value) =>
            value.name.toLowerCase().includes(searchValue.toLowerCase())
          );

          if (!el.items.length) {
            arr.push(el);
          }

          return el;
        });

        if (cat.cats.length === arr.length) {
          cat.all = 0;
        }
      });

      const freeItemsFilter = freeItems.filter((value) =>
        value.name.toLowerCase().includes(searchValue.toLowerCase())
      );

      this.setState({
        cats: catsFilter,
        freeItems: freeItemsFilter,
      });

    } else {
      
      this.setState({
        cats: JSON.parse(JSON.stringify(this.props.cats)),
        freeItems: JSON.parse(JSON.stringify(this.props.freeItems)),
      });
    }
  }

  render() {
    console.log( 'OrderPostRec_Table render' )

    return (
      <>
        <Grid item xs={12} sm={4}>
          <MyAutocomplite2
            label="Поиск"
            freeSolo={true}
            multiple={false}
            data={this.state.items}
            value={this.state.search}
            func={this.search.bind(this)}
            onBlur={this.search.bind(this)}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Button variant="contained" onClick={this.props.openModal.bind(this)}>
            Сохранить изменения
          </Button>
        </Grid>

        <Grid item xs={12} sm={12} mb={6}>
          {this.state.cats
            .filter((it) => it.all !== 0)
            .map((item, key) => (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {item.cats
                    .filter((category) => category.items.length !== 0)
                    .map((category, key_cat) => (
                      <Accordion key={key_cat}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{category.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails
                          style={{ width: '100%', overflow: 'scroll' }}
                        >

                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ width: '2%' }}>
                                    #
                                  </TableCell>
                                  <TableCell style={{ width: '30%' }}>
                                    Заготовка
                                  </TableCell>
                                  <TableCell style={{ width: '25%' }}>
                                    Товар
                                  </TableCell>
                                  <TableCell style={{ width: '13%' }}>
                                    Объем (упак.)
                                  </TableCell>
                                  <TableCell style={{ width: '30%' }}>
                                    Поставщик
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {category.items.map((it, key) => (
                                  <OrderPostRec_TableItem key={key} it={it} changeSelect={this.props.changeSelect} type={1}/>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                        </AccordionDetails>
                      </Accordion>
                    ))}
                </AccordionDetails>
              </Accordion>
            ))}

          {this.state.freeItems.length == 0 ? null : (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Без категории</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ width: '100%', overflow: 'scroll' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '2%' }}>#</TableCell>
                        <TableCell style={{ width: '30%' }}>
                          Заготовка
                        </TableCell>
                        <TableCell style={{ width: '25%' }}>Товар</TableCell>
                        <TableCell style={{ width: '13%' }}>
                          Объем (упак.)
                        </TableCell>
                        <TableCell style={{ width: '30%' }}>
                          Поставщик
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.freeItems.map((it, key) => (
                        <OrderPostRec_TableItem key={key} it={it} changeSelect={this.props.changeSelect} type={2}/>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}
        </Grid>
      </>
    );
  }
}

class OrderPostRec_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'order_post_rec',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      items: [],

      cats: [],

      freeItems: [],

      hist: [],

      modalDialog: false,
      snackbar: false,
      st: false,
      error: ''
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    console.log(data);

    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name,
      cats: data.cats,
      freeItems: data.items_free,
      hist: data.hist,
      items: data.items,
    });

    document.title = data.module_info.name;
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
      });
  };

  async changePoint(event) {
    let data = {
      point_id: event.target.value
    }
    
    let res = await this.getData('get_all', data);

    this.setState({
      point: event.target.value,
      items: res.items,
      cats: res.cats,
      freeItems: res.items_free,
      hist: res.hist,
    });
  }

  openModal() {
    this.setState({
      modalDialog: true,
    });
  }

  findPQ(it){
    let vendors = [];
    let item = it.items.filter(el => el.id === it.item_id_rec);

    if( item.length > 0 ){
      vendors = item[0].vendors;
    }

    let pq = vendors.find(el => el.id === it.vendor_id_rec);

    if( pq ){
      pq = pq.pq;
    }else{
      pq = '';
    }

    return pq;
  }

  changeSelect(id, key, type, event) {
    // console.log(id, key, type, event.target.value)

    if (type === 1) {
      const cats = this.state.cats;

      cats.forEach((cat) => {
        cat.cats.forEach((it) => {
          it.items.forEach((el) => {
            if (el.id === id) {
              
              el[key] = event.target.value;

              if( key == 'vendor_id_rec' ){
                //console.log( this.findPQ(el) )
                el['pq'] = this.findPQ(el);
              }
            }
          });
        });
      });

      this.setState({
        cats
      });
    }

    if (type === 2) {
      const freeItems = this.state.freeItems;

      freeItems.forEach((el) => {
        if (el.id === id) {
          el[key] = event.target.value;
        }
      });

      this.setState({
        freeItems
      });
    }
  }

  async save(points) {
    console.log(points);

    let data = {
      items: this.state.cats,
      items_free: this.state.freeItems,
      points
    };

    console.log(data);

    let res = await this.getData('save_edit', data);

    // console.log(res)

    if(res.st) {

      this.setState({
        st: true,
        snackbar: true,
      });

      setTimeout(() => {
        this.update();
      }, 300);

    } else {

      this.setState({
        error: res.text,
        snackbar: true,
      });
      
    }

  }

  async update() {
    let data = {
      point_id: this.state.point
    }
    
    let res = await this.getData('get_all', data);

    // console.log(data);

    this.setState({
      items: res.items,
      cats: res.cats,
      freeItems: res.items_free,
      hist: res.hist,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Snackbar 
          open={this.state.snackbar} 
          autoHideDuration={30000}
          anchorOrigin={{  
            vertical: 'top',
            horizontal: 'center', 
          }}
          onClose={() => {
            this.setState({ snackbar: false });
          }}>
          <Alert 
            onClose={() => {
            this.setState({ snackbar: false });
            }} 
            severity={ this.state.st ? "success" : "error" } 
            sx={{ width: '100%' }}>
             { this.state.st ? 'Данные успешно сохранены!' : `${this.state.error}` }
          </Alert>
        </Snackbar>

        <OrderPostRec_Modal
          open={this.state.modalDialog}
          onClose={() => {
            this.setState({ modalDialog: false });
          }}
          points={this.state.points}
          save={this.save.bind(this)}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <OrderPostRec_Table
            cats={this.state.cats}
            freeItems={this.state.freeItems}
            items={this.state.items}
            openModal={this.openModal.bind(this)}
            changeSelect={this.changeSelect.bind(this)}
          />

          {!this.state.hist.length ? null : (
            <Grid pb={1} container justifyContent="center">
              <Grid item xs={10} sm={6}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                  >
                    <Typography>История изменений</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {this.state.hist.map((item, i) => (
                      <Accordion key={i}>
                        <AccordionSummary>
                          <Typography mr={8}>{item.date_time}</Typography>
                          <Typography>{item.user_name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {item.items.map((it, key_it) => (
                            <TableContainer key={key_it}>
                              <Table>
                                <TableBody>
                                  <TableRow
                                    sx={{
                                      '& td': {
                                        border: 0,
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                      },
                                    }}
                                    hover={true}
                                  >
                                    <TableCell style={{ width: '30%' }}>
                                      {it.item_name}
                                    </TableCell>
                                    <TableCell style={{ width: '30%' }}>
                                      {it.pf_name}
                                    </TableCell>
                                    <TableCell style={{ width: '10%' }}>
                                      {it.pq}
                                    </TableCell>
                                    <TableCell style={{ width: '30%' }}>
                                      {it.vendor_name}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}




class OrderPostRec_TableHist extends React.Component{
  shouldComponentUpdate(nextProps) {
    return (nextProps.hist !== this.props.hist);
  }

  render(){
    return (
      <>
        { this.props.hist.map( (item, key) =>
          <Accordion key={key}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{item.date_time} {item.user_name}</Typography>
            </AccordionSummary>
            <AccordionDetails>

              <TableContainer>
                <Table>
                  
                  <TableBody>
                    {item.items.map((it, item_k) => (
                      <TableRow
                        key={item_k}
                        sx={{ '& td': { border: 0 } }}
                        hover={true}
                      >
                        <TableCell>{it.pf_name}</TableCell>
                        <TableCell>{it.item_name}</TableCell>
                        <TableCell>{it.pq}</TableCell>
                        <TableCell>{it.vendor_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

            </AccordionDetails>
          </Accordion>
        ) }
      </>
    )
  }
}

class OrderPostRec_TableItemNew extends React.Component {

  render(){
    const it = this.props.item;

    const { main_key, dop_key, item_key } = this.props;

    let vendors = [];
    const items = this.props.items.filter( item => parseInt(item.pf_id) == parseInt(it.id) );

    let vendor = '';
    let item = '';

    if( items.length == 1 ){
      item = items[0].name;

      let id = items[0].id;

      vendors = this.props.vendors.filter( vendor => parseInt(vendor.item_id) == parseInt(id) )

      if( vendors.length == 1 ){
        vendor = vendors[0].name
      }
    }else{
      vendors = this.props.vendors.filter( vendor => parseInt(vendor.item_id) == parseInt(it.item_id_rec) )

      if( vendors.length == 1 ){
        vendor = vendors[0].name
      }
    }

    console.log( 'render_item' )

    return(
      <TableRow
        sx={{ '& td': { border: 0 } }}
        hover={true}
      >
        <TableCell>{it.id}</TableCell>
        <TableCell>{it.name}</TableCell>

        <TableCell>
          { items.length == 1 ? 
            item
              :
            <MySelect
              is_none={false}
              data={items}
              value={it.item_id_rec}
              func={ this.props.changeSelect.bind(this, main_key, dop_key, item_key, 'item_id_rec') }
            />
        }

        </TableCell>

        <TableCell>{it.pq} {it.ei_name}</TableCell>

        <TableCell>
          { vendor == '' ?
            vendors.length > 0 ?
              <MySelect
                is_none={false}
                data={vendors}
                value={it.vendor_id_rec}
                func={ this.props.changeSelect.bind(this, main_key, dop_key, item_key, 'vendor_id_rec') }
              />
                :
              null
              :
            vendor
          }</TableCell>

      </TableRow>
    )
  }
}

class OrderPostRecNew_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'order_post_rec',
      module_name: '',
      is_load: false,

      points: [],
      savePoints: [],
      point: '',

      items: [],
      vendors: [],
      mainCats: [],

      freePf: [],

      hist: [],

      modalDialog: false,
      snackbar: false,
      st: false,
      error: ''
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all_new');

    this.setState({
      points: data.point_list,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
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
      });
  };

  async changePoint(event) {
    let data = {
      point_id: event.target.value
    }
    
    let res = await this.getData('get_data', data);

    console.log( res );
    
    this.setState({
      point: event.target.value,
      mainCats: res.mainCats,
      freePf: res.free_pf,
      vendors: res.vendors,
      items: res.items,

      hist: res.hist
    });
  }

  findPQ(item_id, vendor_id){
    const vendors = this.state.vendors;

    let myVendor = vendors.find( vendor => parseInt(vendor.id) == parseInt(vendor_id) && parseInt(vendor.item_id) == parseInt(item_id) );

    if( myVendor ){
      myVendor = myVendor.pq;
    }else{
      myVendor = '';
    }

    return myVendor;
  }

  findVendors(item_id){
    const vendors = this.state.vendors.filter( vendor => parseInt(vendor.item_id) == parseInt(item_id) );

    if( vendors.length == 1 ){
      return vendors[0];
    }else{
      return null;
    }
  }

  changeSelect(main_key, dop_key, item_key, type, event){
    let mainCats = this.state.mainCats;
    const value = event.target.value;
    let item = mainCats[ main_key ]['cats'][ dop_key ]['items'][ item_key ];

    if( type == 'vendor_id_rec' ){
      item[ 'pq' ] = this.findPQ( item.item_id_rec, value );
    }

    if( type == 'item_id_rec' ){
      let vendor = this.findVendors(value);

      console.log( value, vendor )

      if( vendor ){
        item[ 'pq' ] = vendor.pq;
        item[ 'vendor_id_rec' ] = vendor.id;
      }else{
        item[ 'pq' ] = '';
        item[ 'vendor_id_rec' ] = '';
      }
      
    }

    item[ [type] ] = value;

    this.setState({
      mainCats: mainCats
    });
  }

  changeSelectOther(main_key, dop_key, item_key, type, event){
    let mainCats = this.state.freePf;
    const value = event.target.value;
    let item = mainCats[ item_key ];

    if( type == 'vendor_id_rec' ){
      item[ 'pq' ] = this.findPQ( item.item_id_rec, value );
    }

    if( type == 'item_id_rec' ){
      let vendor = this.findVendors(value);

      console.log( value, vendor )

      if( vendor ){
        item[ 'pq' ] = vendor.pq;
        item[ 'vendor_id_rec' ] = vendor.id;
      }else{
        item[ 'pq' ] = '';
        item[ 'vendor_id_rec' ] = '';
      }
      
    }

    item[ [type] ] = value;

    this.setState({
      freePf: mainCats
    });
  }

  openModal() {
    let arr = this.state.points.filter( point => parseInt(point.id) == parseInt(this.state.point) );

    this.setState({
      savePoints: arr,
      modalDialog: true,
    });
  }

  choosePoint(event, value) {
    this.setState({
      savePoints: value,
    });
  }

  async save() {
    const mainCats = this.state.mainCats;
    const freePf = this.state.freePf;

    let items = [];

    mainCats.map( mainCat => {
      mainCat.cats.map( cat => {
        cat.items.map( item => {
          items.push( item )
        } )
      } )
    } )

    freePf.map( item => {
      items.push( item )
    } )

    let check = items.find( item => parseInt(item.vendor_id_rec) == 0 || item.vendor_id_rec == '' || 
                        parseInt(item.item_id_rec) == 0 || item.item_id_rec == '' ||
                        parseFloat(item.pq) == 0 || item.pq == '' );

    if( check ){

      this.setState({ 
        st: false,
        snackbar: true,
        error: 'Не заполнены данные у позиции "' + check.name + '"'
      });

      return ;
    }

    let data = {
      items: items,
      points: this.state.savePoints
    };

    let res = await this.getData('save_edit_new', data);

    if(res.st) {

      this.setState({
        st: true,
        snackbar: true,
      });

      setTimeout(() => {
        this.update();
      }, 300);

    } else {

      this.setState({
        st: false,
        error: res.text,
        snackbar: true,
      });
      
    }

  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Snackbar 
          open={this.state.snackbar} 
          autoHideDuration={30000}
          anchorOrigin={{  
            vertical: 'top',
            horizontal: 'center', 
          }}
          onClose={() => { this.setState({ snackbar: false }); }}
        >
          <Alert 
            onClose={() => { this.setState({ snackbar: false }); }} 
            severity={ this.state.st ? "success" : "error" } 
            sx={{ width: '100%' }}
          >
            { this.state.st ? 'Данные успешно сохранены!' : `${this.state.error}` }
          </Alert>
        </Snackbar>

        <Dialog
          open={this.state.modalDialog}
          onClose={() => { this.setState({ modalDialog: false }); }}
          fullWidth={true}
          maxWidth={'xs'}
        >
          <DialogTitle>Где применить</DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid item xs={12} sm={4}>
              <MyAutocomplite
                label="Точки"
                multiple={true}
                data={this.state.points}
                value={this.state.savePoints}
                func={this.choosePoint.bind(this)}
              />
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>


        <Grid container spacing={3} style={{ paddingBottom: 50 }} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={this.openModal.bind(this)}>
              Сохранить изменения
            </Button>
          </Grid>

          <Grid item xs={12}>
            {this.state.mainCats.map((mainCat, key) => (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{mainCat.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  
                  {mainCat.cats.map( (cat, k) =>
                    <Accordion key={k}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{cat.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>

                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell style={{ width: '2%' }}>#</TableCell>
                                <TableCell style={{ width: '30%' }}>Заготовка</TableCell>
                                <TableCell style={{ width: '25%' }}>Товар</TableCell>
                                <TableCell style={{ width: '13%' }}>Объем (упак.)</TableCell>
                                <TableCell style={{ width: '30%' }}>Поставщик</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {cat.items.map((it, item_k) => (
                                <OrderPostRec_TableItemNew 
                                  key={item_k} 

                                  main_key={key}
                                  dop_key={k}
                                  item_key={item_k}

                                  item={it}
                                  vendors={this.state.vendors}
                                  items={this.state.items}

                                  changeSelect={this.changeSelect.bind(this)}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                      </AccordionDetails>
                    </Accordion>
                  )}

                </AccordionDetails>
              </Accordion>
            ))}

            { this.state.freePf.length == 0 ? null :
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Без категории</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '2%' }}>#</TableCell>
                          <TableCell style={{ width: '30%' }}>Заготовка</TableCell>
                          <TableCell style={{ width: '25%' }}>Товар</TableCell>
                          <TableCell style={{ width: '13%' }}>Объем (упак.)</TableCell>
                          <TableCell style={{ width: '30%' }}>Поставщик</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.freePf.map((it, item_k) => (
                          <OrderPostRec_TableItemNew
                            key={it.id} 

                            main_key={0}
                            dop_key={0}
                            item_key={item_k}

                            item={it}
                            vendors={this.state.vendors}
                            items={this.state.items}

                            changeSelect={this.changeSelectOther.bind(this)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                </AccordionDetails>
              </Accordion>
            }

          </Grid>

          <Grid item xs={12}>
            <OrderPostRec_TableHist hist={this.state.hist} />
          </Grid>

        </Grid>
      </>
    );
  }
}

export default function OrderPostRec() {
  return <OrderPostRecNew_ />;
}
