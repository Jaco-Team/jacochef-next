import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MySelect, MyCheckBox, MyTextInput, MyDatePickerNew, formatDate, MyAlert, MyAutocomplite} from '@/ui/elements';

import Dropzone from 'dropzone';
import queryString from 'query-string';
import dayjs from 'dayjs';

class SiteItems_Modal_Mark extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: 'image/jpeg,image/png',
    addRemoveLinks: true,
    url: 'https://jacochef.ru/src/img/site_img/upload_img_new.php',
  };
  myDropzoneNew = null;

  constructor(props) {
    super(props);

    this.state = {
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      tmp_desc: '',
      marc_desc: '',
      marc_desc_full: '',
      is_hit: '0',
      is_new: '0',
      show_program: '0',
      show_site: '0',
      img_app: '',
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        date_start: this.props.item?.date_start ?? formatDate(null),
        date_end: this.props.item?.date_end ?? formatDate(null),
        tmp_desc: this.props.item?.tmp_desc,
        marc_desc: this.props.item?.marc_desc,
        marc_desc_full: this.props.item?.marc_desc_full,
        is_hit: parseInt(this.props.item?.is_hit) ? 1 : 0,
        is_new: parseInt(this.props.item?.is_new) ? 1 : 0,
        show_program: parseInt(this.props.item?.show_program) ? 1 : 0,
        show_site: parseInt(this.props.item?.show_site) ? 1 : 0,
        img_app: this.props.item?.img_app,
      });
    }
  }

  changeItem(type, event, data) {
    this.setState({
      [type]: data ? data : event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeItemChecked(type, event) {
    this.setState({
      [type]: event.target.checked === true ? 1 : 0,
    });
  }

  save() {
    const data = {
      date_start: this.state.date_start && this.state.date_start.length != 0 ? dayjs(this.state.date_start).format('YYYY-MM-DD') : '',
      date_end: this.state.date_end && this.state.date_end.length != 0 ? dayjs(this.state.date_end).format('YYYY-MM-DD') : '',
      tmp_desc: this.state.tmp_desc,
      marc_desc: this.state.marc_desc,
      marc_desc_full: this.state.marc_desc_full,
      is_hit: this.state.is_hit,
      is_new: this.state.is_new,
      show_program: this.state.show_program,
      show_site: this.state.show_site,
      img_app: this.state.img_app,
    };

    this.props.save(data);

    this.onClose();
  }

  onClose() {
    this.setState({
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      tmp_desc: '',
      marc_desc: '',
      marc_desc_full: '',
      is_hit: '0',
      is_new: '0',
      show_program: '0',
      show_site: '0',
      img_app: '',
    });

    this.props.onClose();
  }

  render() {
    const { open, method, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography>Описание блюда</Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Typography>{method}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyDatePickerNew
                label="Действует с"
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, 'date_start')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyDatePickerNew
                label="по"
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, 'date_end')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Состав"
                value={this.state.tmp_desc}
                func={this.changeItem.bind(this, 'tmp_desc')}
                multiline={true}
                maxRows={3}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Короткое описание (в карточке)"
                value={this.state.marc_desc}
                func={this.changeItem.bind(this, 'marc_desc')}
                multiline={true}
                maxRows={3}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Полное описание (в карточке)"
                value={this.state.marc_desc_full}
                func={this.changeItem.bind(this, 'marc_desc_full')}
                multiline={true}
                maxRows={3}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyCheckBox
                label="На кассе"
                value={parseInt(this.state.show_program) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'show_program')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyCheckBox
                label="Новинка"
                value={parseInt(this.state.is_new) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'is_new')}
              />
            </Grid>
            <Grid item xs={12} sm={4} />
            <Grid item xs={12} sm={4}>
              <MyCheckBox
                label="На сайте и КЦ"
                value={parseInt(this.state.show_site) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'show_site')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyCheckBox
                label="Хит"
                value={parseInt(this.state.is_hit) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'is_hit')}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography>
                    Картинка соотношением сторон (1:1) (пример: 2000х2000)
                    только JPG
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  {this.state.img_app.length > 0 ? (
                    <picture>
                      <source
                        srcSet={`https://storage.yandexcloud.net/site-img/${this.state.img_app}_276x276.jpg 138w, 
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_292x292.jpg 146w,
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_366x366.jpg 183w,
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_466x466.jpg 233w,
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_585x585.jpg 292w
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_732x732.jpg 366w,
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_1168x1168.jpg 584w,
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_1420x1420.jpg 760w,
                                https://storage.yandexcloud.net/site-img/${this.state.img_app}_2000x2000.jpg 1875w`}
                        sizes="(max-width=1439px) 233px, (max-width=1279px) 218px, 292px"
                      />
                      <img
                        style={{ maxHeight: 300 }}
                        src={`https://storage.yandexcloud.net/site-img/${this.state.img_app}_276x276.jpg`}
                      />
                    </picture>
                  ) : (
                    <div className="dropzone" id="for_img_edit_new" style={{ width: '100%', minHeight: 150 }} />
                  )}
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                  <div
                    className="dropzone"
                    id="for_img_edit_new"
                    style={{ width: '100%', minHeight: 150 }}
                  />
                </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SiteItems_Modal_Tech extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      art: '',
      list: [],
      cat: '',
      count_part: '',
      stol: '',
      weight: '',
      is_price: '0',
      is_show: '0',
      protein: '0',
      fat: '0',
      carbohydrates: '0',
      time_stage_1: '',
      time_stage_2: '',
      time_stage_3: '',
      all_w: '',
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        name: this.props.item?.name,
        art: this.props.item?.art,
        cat: this.props.item?.cat,
        count_part: this.props.item?.count_part,
        date_start: this.props.item?.date_start ?? formatDate(null),
        date_end: this.props.item?.date_end ?? formatDate(null),
        stol: this.props.item?.stol,
        weight: this.props.item?.weight,
        is_price: parseInt(this.props.item?.is_price) ? 1 : 0,
        is_show: parseInt(this.props.item?.is_show) ? 1 : 0,
        protein: this.props.item?.protein,
        fat: this.props.item?.fat,
        carbohydrates: this.props.item?.carbohydrates,
        time_stage_1: this.props.item?.time_stage_1,
        time_stage_2: this.props.item?.time_stage_2,
        time_stage_3: this.props.item?.time_stage_3,
        all_w: this.props.item?.all_w,
      });
    }
  }

  chooseItem(event, data) {
    let list = this.state.list;

    list.push({
      name_id: data,
      ed: data.ei_name,
      brutto: 0,
      pr_1: 0,
      netto: 0,
      pr_2: 0,
      res: 0,
    });

    this.setState({ list });
  }

  changeItemData(type, key, event, data) {
    let list = this.state.list;

    let this_item = list[key];

    if (type == 'name_id') {
      this_item[[type]] = data;
    } else {
      this_item[[type]] = event.target.value;
    }

    this_item.netto = roundTo(
      (parseFloat(this_item.brutto) * (100 - parseFloat(this_item.pr_1))) / 100,
      3
    );
    this_item.res = roundTo(
      (parseFloat(this_item.netto) * (100 - parseFloat(this_item.pr_2))) / 100,
      3
    );

    list[key] = this_item;

    let all_w = 0;

    list.map((it) => {
      all_w += parseFloat(it.res);
    });

    all_w = roundTo(all_w, 3);

    this.setState({ list, all_w });
  }

  changeItem(type, event, data) {
    this.setState({
      [type]: data ? data : event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeSelect(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeItemChecked(type, event) {
    this.setState({
      [type]: event.target.checked === true ? 1 : 0,
    });
  }

  save() {
    const data = {
      name: this.state.name,
      art: this.state.art,
      list: this.state.list,
      cat: this.state.cat,
      count_part: this.state.count_part,
      stol: this.state.stol,
      weight: this.state.weight,
      is_price: this.state.is_price,
      is_show: this.state.is_show,
      protein: this.state.protein,
      fat: this.state.fat,
      carbohydrates: this.state.carbohydrates,
      time_stage_1: this.state.time_stage_1,
      time_stage_2: this.state.time_stage_2,
      time_stage_3: this.state.time_stage_3,
      all_w: this.state.all_w,
      date_start: this.state.date_start && this.state.date_start.length != 0 ? dayjs(this.state.date_start).format('YYYY-MM-DD') : '',
      date_end: this.state.date_end && this.state.date_end.length != 0 ? dayjs(this.state.date_end).format('YYYY-MM-DD') : '',
    };

    this.props.save(data);

    this.onClose();
  }

  onClose() {
    this.setState({
      name: '',
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      art: '',
      list: [],
      cat: '',
      count_part: '',
      stol: '',
      weight: '',
      is_price: '0',
      is_show: '0',
      protein: '0',
      fat: '0',
      carbohydrates: '0',
      time_stage_1: '',
      time_stage_2: '',
      time_stage_3: '',
      all_w: '',
    });

    this.props.onClose();
  }

  render() {
    const { open, method, items, fullScreen, category } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography>{method}</Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Наименование"
                value={this.state.name}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyDatePickerNew
                label="Действует с"
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, 'date_start')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyDatePickerNew
                label="по"
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, 'date_end')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Код 1С"
                value={this.state.art}
                func={this.changeItem.bind(this, 'art')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MySelect
                is_none={false}
                data={category}
                value={this.state.cat}
                func={this.changeSelect.bind(this, 'cat')}
                label="Категория"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Кусочков или размер"
                value={this.state.count_part}
                func={this.changeItem.bind(this, 'count_part')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Стол"
                value={this.state.stol}
                func={this.changeItem.bind(this, 'stol')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Вес"
                value={this.state.weight}
                func={this.changeItem.bind(this, 'weight')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyCheckBox
                label="Установить цену"
                value={parseInt(this.state.is_price) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'is_price')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyCheckBox
                label="Активность"
                value={parseInt(this.state.is_show) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'is_show')}
              />
            </Grid>
            <Grid item xs={12} sm={6} />
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Белки"
                value={this.state.protein}
                func={this.changeItem.bind(this, 'protein')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Жиры"
                value={this.state.fat}
                func={this.changeItem.bind(this, 'fat')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Углеводы"
                value={this.state.carbohydrates}
                func={this.changeItem.bind(this, 'carbohydrates')}
              />
            </Grid>
            <Grid item xs={12} sm={6} />
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время на 1 этап"
                value={this.state.time_stage_1}
                func={this.changeItem.bind(this, 'time_stage_1')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время на 2 этап"
                value={this.state.time_stage_2}
                func={this.changeItem.bind(this, 'time_stage_2')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время на 3 этап"
                value={this.state.time_stage_3}
                func={this.changeItem.bind(this, 'time_stage_3')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell width="30%">Номенклатура</TableCell>
                    <TableCell>Единица измерения</TableCell>
                    <TableCell>Брутто</TableCell>
                    <TableCell>% потери при ХО</TableCell>
                    <TableCell>Нетто</TableCell>
                    <TableCell>% потери при ГО</TableCell>
                    <TableCell>Выход</TableCell>
                    <TableCell>Этапы</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.list.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <MyAutocomplite
                          multiple={false}
                          data={items}
                          value={item.name_id}
                          func={this.changeItemData.bind(this, 'name_id', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.ed}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.brutto}
                          type={'number'}
                          func={this.changeItemData.bind(this, 'brutto', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_1}
                          type={'number'}
                          func={this.changeItemData.bind(this, 'pr_1', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.netto}
                          type={'number'}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_2}
                          type={'number'}
                          func={this.changeItemData.bind(this, 'pr_2', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.res}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={''}
                          type={'number'}
                          //func={this.changeItemData.bind(this, 'pr_2', key)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <MyAutocomplite
                        multiple={false}
                        data={items}
                        value={null}
                        func={this.chooseItem.bind(this)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} />
                    <TableCell>
                      <MyTextInput
                        value={this.state.all_w}
                        disabled={true}
                        className="disabled_input"
                      />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SiteItems_Table extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.timeUpdate !== this.props.timeUpdate;
  }

  render() {
    const { cats, user_app, changeSort, saveSort, changeTableCheck, openItem } = this.props;
    return (
      <Grid item xs={12} sm={12} style={{ paddingBottom: '50px' }}>
        {cats.map((cat, key) => (
          <Accordion key={key}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{cat.name}</Typography>
            </AccordionSummary>
            <AccordionDetails className="accordion_details">
              <TableContainer component={Paper} sx={{ maxHeight: { xs: 'none', sm: 600 } }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell style={{ width: '1%' }}>№</TableCell>
                      <TableCell style={{ width: '11%' }}>{user_app === 'technologist' ? 'Активность' : 'Сайт и КЦ'}</TableCell>
                      {user_app === 'marketing' ? <TableCell style={{ width: '11%' }}>Касса</TableCell> : null}
                      {user_app === 'marketing' ? <TableCell style={{ width: '11%' }}>Сортировка</TableCell> : null}
                      <TableCell style={{ width: '11%' }}>Название</TableCell>
                      <TableCell style={{ width: '11%' }}>Действует с</TableCell>
                      <TableCell style={{ width: '11%' }}>по</TableCell>
                      <TableCell style={{ width: '11%' }}>Дата редактирования</TableCell>
                      <TableCell style={{ width: '11%' }}>Обновление</TableCell>
                      {user_app === 'technologist' ? <TableCell style={{ width: '11%' }}>Код для 1С</TableCell> : null}
                      <TableCell style={{ width: '11%' }}>Редактирование</TableCell>
                      <TableCell style={{ width: '11%' }}>История изменений</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {cat.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <MyCheckBox
                            label=""
                            value={parseInt(user_app === 'technologist' ? item.is_show : item.show_site) === 1 ? true : false}
                            func={changeTableCheck.bind(this, key, index, item.id, user_app === 'technologist' ? 'is_show' : 'show_site')}
                          />
                        </TableCell>
                        {user_app === 'marketing' ? (
                          <TableCell>
                            <MyCheckBox
                              label=""
                              value={parseInt(item.show_program) === 1 ? true : false}
                              func={changeTableCheck.bind(this, key, index, item.id, 'show_program')}
                            />
                          </TableCell>
                        ) : null}
                        {user_app === 'marketing' ? (
                          <TableCell>
                            <MyTextInput
                              label=""
                              value={item.sort}
                              func={changeSort.bind(this, key, index)}
                              onBlur={saveSort.bind(this, item.id)}
                            />
                          </TableCell>
                        ) : null}
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.date_start}</TableCell>
                        <TableCell>{item.date_end}</TableCell>
                        <TableCell>{item.date_update}</TableCell>
                        <TableCell></TableCell>
                        {user_app === 'technologist' ? <TableCell>{item.art}</TableCell> : null}
                        <TableCell style={{ cursor: 'pointer' }} onClick={openItem.bind(this, item, item.date_update ? 'hist' : 'origin', item.name)}>
                          <EditIcon />
                        </TableCell>
                        <TableCell
                          style={{ cursor: 'pointer' }}
                          // onClick={this.openHistoryItem.bind(this, it.id, 'История изменений')}
                        >
                          <EditNoteIcon />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    );
  }
}

class SiteItems_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'site_items',
      module_name: '',
      is_load: false,

      user_app: '',

      cats: [],

      confirmDialog: false,

      timeUpdate: new Date(),

      openAlert: false,
      err_status: false,
      err_text: '',

      modalDialogTech: false,
      modalDialogMark: false,

      item: null,
      fullScreen: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    console.log('componentDidMount data', data);

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      user_app: 'technologist',
      user_app: 'marketing',
      timeUpdate: new Date(),
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}, is_load = true) => {
    if (is_load == true) {
      this.setState({
        is_load: true,
      });
    }

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
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);
        console.log(err);
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

  async updateItems(res) {
    console.log('updateItems');

    //if (res.st) {
    // const data = await this.getData('get_all');
    // this.setState({
    //   cats: data.cats,
    //   cat_list: data.cat_list,
    //   timeUpdate: new Date()
    // })
    // } else {
    //   this.setState({
    //     openAlert: true,
    //     err_status: false,
    //     err_text: 'Данные не изменены, попробуйте позже',
    //   });
    // }
  }

  async openItemNew(method) {
    this.handleResize();

    const res = await this.getData('get_all_for_new');

    console.log('openItemNew res', res);

    this.setState({
      item: res.item,
      modalDialogTech: true,
      method,
    });
  }

  async openItemTech(item, type = 'origin', method) {
    this.handleResize();

    const data = {
      id: item.id,
      type: type,
    };

    const res = await this.getData('get_one', data);

    console.log('openItemTech get_one', res);

    this.setState({
      item: res.item,
      modalDialogTech: true,
      method,
    });
  }

  async openItemMark(item, type = 'origin', method) {
    this.handleResize();

    const data = {
      id: item.id,
      type: type,
    };

    const res = await this.getData('get_one', data);

    console.log('openItemMark get_one', res);

    this.setState({
      item: res.item,
      modalDialogMark: true,
      method,
    });
  }

  async updateVK() {
    this.setState({
      confirmDialog: false,
    });

    console.log('updateVK');
    //await this.getData('updateVK', {});
  }

  changeSort(key_cat, key_item, event) {
    const value = event.target.value;
    let cats = this.state.cats;

    cats[key_cat]['items'][key_item]['sort'] = value;

    this.setState({
      cats,
      timeUpdate: new Date(),
    });
  }

  async saveSort(item_id, event) {
    const data = {
      id: item_id,
      sort: event.target.value,
    };

    console.log('saveSort', data);

    //const res = await this.getData('saveSort', data);

    // setTimeout(() => {
    //   this.updateItems(res);
    // }, 300);
  }

  async changeTableCheck(key_cat, key_item, id, type, event, val) {
    const value = val ? 1 : 0;

    let cats = this.state.cats; // для тестов
    cats[key_cat]['items'][key_item][type] = value; // для тестов
    // для тестов
    this.setState({
      cats,
      timeUpdate: new Date(),
    });

    const data = {
      type,
      id,
      value,
    };

    console.log('changeTableCheck', data);

    // const res = await this.getData('save_check', data);

    // setTimeout(() => {
    //   this.updateItems(res);
    // }, 300);
  }

  async saveTech(data) {
    console.log('saveTech', data);
  }

  async saveMark(data) {
    console.log('saveMark', data);
  }

  render() {
    return (
      <>
        <Backdrop open={this.state.is_load} style={{ zIndex: 99999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <SiteItems_Modal_Tech
          open={this.state.modalDialogTech}
          onClose={() => this.setState({ modalDialogTech: false })}
          items={[]}
          item={this.state.item}
          method={this.state.method}
          category={[]}
          save={this.saveTech.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <SiteItems_Modal_Mark
          open={this.state.modalDialogMark}
          onClose={() => this.setState({ modalDialogMark: false })}
          item={this.state.item}
          method={this.state.method}
          save={this.saveMark.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>Точно обновить товары в VK ?</DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.updateVK.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button onClick={this.state.user_app === 'technologist' ? this.openItemNew.bind(this, 'Новое блюдо') : () => this.setState({ confirmDialog: true })} color="primary" variant="contained">
              {this.state.user_app === 'technologist' ? 'Новый товар' : 'Обновить товары VK'}
            </Button>
          </Grid>

          {this.state.cats.length == 0 ? null : (
            <SiteItems_Table
              user_app={this.state.user_app}
              cats={this.state.cats}
              timeUpdate={this.state.timeUpdate}
              changeSort={this.changeSort.bind(this)}
              saveSort={this.saveSort.bind(this)}
              changeTableCheck={this.changeTableCheck.bind(this)}
              openItem={this.state.user_app === 'technologist' ? this.openItemTech.bind(this) : this.openItemMark.bind(this)}
            />
          )}
        </Grid>
      </>
    );
  }
}

export default function SiteItems() {
  return <SiteItems_ />;
}
