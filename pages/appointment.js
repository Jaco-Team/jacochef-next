import React from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyCheckBox } from '@/ui/elements';

import queryString from 'query-string';

class Appointment_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'appointment',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      cats: [],

      confirmDialog: false,
      cat: [],
    };
  }

  async componentDidMount() {
    console.log('appointment!!');
    const data = await this.getData('get_all');

    const point = {
      point_id: data.points[0].id,
    };

    const res = await this.getData('get_items', point);

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      cats: res.items,
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
    const point = event.target.value;

    const data = {
      point_id: point,
    };

    const res = await this.getData('get_items', data);

    this.setState({
      point,
      cats: res.items,
    });
  }

  openConfirm(cat, event) {
    event.stopPropagation();

    this.setState({
      confirmDialog: true,
      cat,
    });
  }

  async changeItemChecked(mark, catChoose, it, event) {
    const point = this.state.point;

    const cats = this.state.cats;

    let items = [];

    if (mark === 'all') {
      this.setState({
        confirmDialog: false,
      });

      const catConfirm = this.state.cat;

      cats.forEach((cat) => {
        if (cat.id === catConfirm.id) {
          cat.items.forEach((item) => {
            parseInt(item.is_active) == 1 ? (item.is_active = 0) : (item.is_active = 1);
            items.push(item);
          });
        }
      });
    }

    if (mark === 'one') {
      const value = event.target.checked === true ? 1 : 0;

      it.is_active = value;

      items.push(it);

      cats.forEach((cat) => {
        if (cat.id === catChoose.id) {
          cat.items.forEach((item) => {
            if (item.item_id === it.item_id) {
              item.is_active = value;
            }
          });
        }
      });
    }

    const data = {
      point_id: point,
      items,
    };

    // console.log(data);

    await this.getData('save_active', data);

    this.setState({
      cats,
    });

    this.update();
  }

  async update() {
    const point = this.state.point;

    const data = {
      point_id: point,
    };

    const res = await this.getData('get_items', data);

    this.setState({
      cats: res.items,
    });
  }

  render() {
    console.log('app render!!');
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>Изменить Активность у всех товаров данной категории ?</DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.changeItemChecked.bind(this, 'all')}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3} mb={3}>
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
        </Grid>

        <Grid item xs={12} mb={1}>
          {this.state.cats.map((cat, key) => {
            return (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <CheckBoxIcon style={{ marginRight: 30 }} color="error" onClick={this.openConfirm.bind(this, cat)}/>
                  <Typography>{cat.name}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ width: '100%', overflow: 'scroll' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '5%' }}>#</TableCell>
                          <TableCell style={{ width: '55%' }}>Позиция</TableCell>
                          <TableCell style={{ width: '40%' }}>Активность</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {cat.items.map((it, k) => (
                          <TableRow key={k}>
                            <TableCell>{it.item_id}</TableCell>
                            <TableCell>{it.name}</TableCell>
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={parseInt(it.is_active) == 1 ? true : false}
                                func={this.changeItemChecked.bind(this, 'one', cat, it)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Grid>
      </>
    );
  }
}

export default function Appointment() {
  return <Appointment_ />;
}
