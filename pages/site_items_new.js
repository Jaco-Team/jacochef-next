import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

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

function roundTo(n, digits) {
  if (n.length == 0) {
    return n;
  }

  var negative = false;
  if (digits === undefined) {
    digits = 0;
  }
  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = (Math.round(n) / multiplicator).toFixed(digits);
  if (negative) {
    n = (n * -1).toFixed(digits);
  }
  return n;
}

class SiteItems_Modal_History_View_Tech extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, itemName, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: 'center' }}>
            Изменения в{itemName ? `: ${itemName}` : ''}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Наименование"
                value={this.state.itemView ? this.state.itemView.name?.color ? this.state.itemView.name.key : this.state.itemView.name : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.name?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Действует с"
                value={this.state.itemView ? this.state.itemView.date_start?.color ? this.state.itemView.date_start.key : this.state.itemView.date_start : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.date_start?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="по"
                value={this.state.itemView ? this.state.itemView.date_end?.color ? this.state.itemView.date_end.key : this.state.itemView.date_end : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.date_end?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Код 1С"
                value={this.state.itemView ? this.state.itemView.art?.color ? this.state.itemView.art.key : this.state.itemView.art : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.art?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Категория"
                value={this.state.itemView ? this.state.itemView.category_name?.color ? this.state.itemView.category_name.key : this.state.itemView.category_name : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.category_name?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Кусочков или размер"
                value={this.state.itemView ? this.state.itemView.count_part?.color ? this.state.itemView.count_part.key : this.state.itemView.count_part : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.count_part?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Стол"
                value={this.state.itemView ? this.state.itemView.stol?.color ? this.state.itemView.stol.key : this.state.itemView.stol : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.stol?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Вес"
                value={this.state.itemView ? this.state.itemView.weight?.color ? this.state.itemView.weight.key : this.state.itemView.weight : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.weight?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Установить цену"
                value={this.state.itemView ? this.state.itemView.is_price?.color ? this.state.itemView.is_price.key : this.state.itemView.is_price : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.is_price?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Активность"
                value={this.state.itemView ? this.state.itemView.is_show?.color ? this.state.itemView.is_show.key : this.state.itemView.is_show : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.is_show?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={6} />
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Белки"
                value={this.state.itemView ? this.state.itemView.protein?.color ? this.state.itemView.protein.key : this.state.itemView.protein : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.protein?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Жиры"
                value={this.state.itemView ? this.state.itemView.fat?.color ? this.state.itemView.fat.key : this.state.itemView.fat : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.fat?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Углеводы"
                value={this.state.itemView ? this.state.itemView.carbohydrates?.color ? this.state.itemView.carbohydrates.key : this.state.itemView.carbohydrates : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.carbohydrates?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3} />
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время на 1 этап"
                value={this.state.itemView ? this.state.itemView.time_stage_1?.color ? this.state.itemView.time_stage_1.key : this.state.itemView.time_stage_1 : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.time_stage_1?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время на 2 этап"
                value={this.state.itemView ? this.state.itemView.time_stage_2?.color ? this.state.itemView.time_stage_2.key : this.state.itemView.time_stage_2 : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.time_stage_2?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время на 3 этап"
                value={this.state.itemView ? this.state.itemView.time_stage_3?.color ? this.state.itemView.time_stage_3.key : this.state.itemView.time_stage_3 : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.time_stage_3?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
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
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell colSpan={8}>Заготовки</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.itemView?.stage_1.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyTextInput
                            value={item.name?.color ? item.name.key : item.name}
                            disabled={true}
                            className={item.name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name?.color ? item.ei_name.key : item.ei_name}
                            disabled={true}
                            className={item.ei_name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto?.color ? item.brutto.key : item.brutto}
                            disabled={true}
                            className={item.brutto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                            disabled={true}
                            className={item.pr_1?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto?.color ? item.netto.key : item.netto}
                            disabled={true}
                            className={item.netto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                            disabled={true}
                            className={item.pr_2?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.res?.color ? item.res.key : item.res}
                            disabled={true}
                            className={item.res?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.stage?.color ? item.stage.key : item.stage}
                            disabled={true}
                            className={item.stage?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {this.state.itemView?.stage_2.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyTextInput
                            value={item.name?.color ? item.name.key : item.name}
                            disabled={true}
                            className={item.name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name?.color ? item.ei_name.key : item.ei_name}
                            disabled={true}
                            className={item.ei_name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto?.color ? item.brutto.key : item.brutto}
                            disabled={true}
                            className={item.brutto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                            disabled={true}
                            className={item.pr_1?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto?.color ? item.netto.key : item.netto}
                            disabled={true}
                            className={item.netto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                            disabled={true}
                            className={item.pr_2?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.res?.color ? item.res.key : item.res}
                            disabled={true}
                            className={item.res?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.stage?.color ? item.stage.key : item.stage}
                            disabled={true}
                            className={item.stage?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {this.state.itemView?.stage_3.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyTextInput
                            value={item.name?.color ? item.name.key : item.name}
                            disabled={true}
                            className={item.name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name?.color ? item.ei_name.key : item.ei_name}
                            disabled={true}
                            className={item.ei_name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto?.color ? item.brutto.key : item.brutto}
                            disabled={true}
                            className={item.brutto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                            disabled={true}
                            className={item.pr_1?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto?.color ? item.netto.key : item.netto}
                            disabled={true}
                            className={item.netto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                            disabled={true}
                            className={item.pr_2?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.res?.color ? item.res.key : item.res}
                            disabled={true}
                            className={item.res?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.stage?.color ? item.stage.key : item.stage}
                            disabled={true}
                            className={item.stage?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                      <TableCell colSpan={8}>Позиции</TableCell>
                    </TableRow>
                    {this.state.itemView?.items.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell colSpan={2}>
                          <MyTextInput
                            value={item.name?.color ? item.name.key : item.name}
                            disabled={true}
                            className={item.name?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto?.color ? item.brutto.key : item.brutto}
                            disabled={true}
                            className={item.brutto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                            disabled={true}
                            className={item.pr_1?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto?.color ? item.netto.key : item.netto}
                            disabled={true}
                            className={item.netto?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                            disabled={true}
                            className={item.pr_2?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.res?.color ? item.res.key : item.res}
                            disabled={true}
                            className={item.res?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                          />
                        </TableCell>
                        <TableCell>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.itemView ? this.state.itemView.all_w_brutto?.color ? this.state.itemView.all_w_brutto.key : this.state.itemView.all_w_brutto : ''}
                          disabled={true}
                          className={this.state.itemView ? this.state.itemView.all_w_brutto?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                        />
                      </TableCell>
                      <TableCell colSpan={1} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.itemView ? this.state.itemView.all_w_netto?.color ? this.state.itemView.all_w_netto.key : this.state.itemView.all_w_netto : ''}
                          disabled={true}
                          className={this.state.itemView ? this.state.itemView.all_w_netto?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                        />
                      </TableCell>
                      <TableCell colSpan={1} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.itemView ? this.state.itemView.all_w?.color ? this.state.itemView.all_w.key : this.state.itemView.all_w : ''}
                          disabled={true}
                          className={this.state.itemView ? this.state.itemView.all_w?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                        />
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
     
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

class SiteItems_Modal_History_View_Mark extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, itemName, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: 'center' }}>
            Изменения в{itemName ? `: ${itemName}` : ''}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Действует с"
                value={this.state.itemView ? this.state.itemView.date_start?.color ? this.state.itemView.date_start.key : this.state.itemView.date_start : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.date_start?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="по"
                value={this.state.itemView ? this.state.itemView.date_end?.color ? this.state.itemView.date_end.key : this.state.itemView.date_end : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.date_end?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Состав"
                value={this.state.itemView ? this.state.itemView.tmp_desc?.color ? this.state.itemView.tmp_desc.key : this.state.itemView.tmp_desc : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.tmp_desc?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Короткое описание (в карточке)"
                value={this.state.itemView ? this.state.itemView.marc_desc?.color ? this.state.itemView.marc_desc.key : this.state.itemView.marc_desc : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.marc_desc?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Полное описание (в карточке)"
                value={this.state.itemView ? this.state.itemView.marc_desc_full?.color ? this.state.itemView.marc_desc_full.key : this.state.itemView.marc_desc_full : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.marc_desc_full?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="На кассе"
                value={this.state.itemView ? this.state.itemView.show_program?.color ? this.state.itemView.show_program.key : this.state.itemView.show_program : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.show_program?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Новинка"
                value={this.state.itemView ? this.state.itemView.is_new?.color ? this.state.itemView.is_new.key : this.state.itemView.is_new : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.is_new?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Сортировка"
                value={this.state.itemView ? this.state.itemView.sort?.color ? this.state.itemView.sort.key : this.state.itemView.sort : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.sort?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="На сайте и КЦ"
                value={this.state.itemView ? this.state.itemView.show_site?.color ? this.state.itemView.show_site.key : this.state.itemView.show_site : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.show_site?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Хит"
                value={this.state.itemView ? this.state.itemView.is_hit?.color ? this.state.itemView.is_hit.key : this.state.itemView.is_hit : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.is_hit?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography style={{ backgroundColor: this.state.itemView ? this.state.itemView?.img_app.length > 0 ? this.state.itemView?.img_new_update?.color ? '#fadadd' : '#fff' : '#fff' : '#fff'}}>
                    {this.state.itemView ? this.state.itemView?.img_app.length > 0 ? this.state.itemView?.img_new_update?.color ? 'Картинка была изменена на:' : 'Картинка не была изменена' : 'Картинка отсутствует' : 'Картинка отсутствует'}
                  </Typography>
                </Grid>

                {this.state.itemView ? this.state.itemView?.img_app.length > 0 ? (
                  <Grid item xs={12} sm={6}>
                      <picture>
                        <source
                          srcSet={`https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_276x276.jpg 138w, 
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_292x292.jpg 146w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_366x366.jpg 183w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_466x466.jpg 233w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_585x585.jpg 292w
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_732x732.jpg 366w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_1168x1168.jpg 584w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_1420x1420.jpg 760w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_2000x2000.jpg 1875w`}
                          sizes="(max-width=1439px) 233px, (max-width=1279px) 218px, 292px"
                        />
                        <img
                          style={{ maxHeight: 300 }}
                          src={`https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_276x276.jpg`}
                        />
                      </picture>
                  </Grid>
                ) : null : null}
              </Grid>
            </Grid>
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

class SiteItems_Modal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  onClose() {
    setTimeout(() => {
      this.setState({
        item: []
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={'xl'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: 'center' }}>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ''}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '2%' }}>#</TableCell>
                  <TableCell style={{ width: '19%' }}>Наименование</TableCell>
                  <TableCell style={{ width: '18%' }}>Действует с</TableCell>
                  <TableCell style={{ width: '18%' }}>по</TableCell>
                  <TableCell style={{ width: '18%' }}>Дата редактирования</TableCell>
                  <TableCell style={{ width: '20%' }}>Редактор</TableCell>
                  <TableCell style={{ width: '5%' }}>Просмотр</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key} hover>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.date_start}</TableCell>
                    <TableCell>{it.date_end}</TableCell>
                    <TableCell>{it.date_update}</TableCell>
                    <TableCell>{it.user}</TableCell>
                    <TableCell style={{ cursor: 'pointer' }} onClick={this.props.openModalHistoryView.bind(this, key)}><TextSnippetOutlinedIcon /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose.bind(this)} variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

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
  isInit = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      date_start: null,
      date_end: null,
      tmp_desc: '',
      marc_desc: '',
      marc_desc_full: '',
      is_hit: '0',
      is_new: '0',
      show_program: '0',
      show_site: '0',
      img_app: '',
      openAlert: false,
      err_status: true,
      err_text: '',
      openAlert: false,
      err_status: true,
      err_text: ''
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {

      this.setState({
        date_start: this.props.item?.date_start ? formatDate(this.props.item.date_start) : null,
        date_end: this.props.item?.date_end ? formatDate(this.props.item.date_end) : null,
        tmp_desc: this.props.item?.tmp_desc,
        marc_desc: this.props.item?.marc_desc,
        marc_desc_full: this.props.item?.marc_desc_full,
        is_hit: parseInt(this.props.item?.is_hit) ? 1 : 0,
        is_new: parseInt(this.props.item?.is_new) ? 1 : 0,
        show_program: parseInt(this.props.item?.show_program) ? 1 : 0,
        show_site: parseInt(this.props.item?.show_site) ? 1 : 0,
        img_app: this.props.item?.img_app ?? '',
      });

      setTimeout( () => {
        this.myDropzone = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
      }, 300)

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

  async save() {

    if (!this.click) {

      this.click = true;
  
      const data = {
        date_start: this.state.date_start ? dayjs(this.state.date_start).format('YYYY-MM-DD') : '',
        date_end: this.state.date_end ? dayjs(this.state.date_end).format('YYYY-MM-DD') : '',
        tmp_desc: this.state.tmp_desc,
        marc_desc: this.state.marc_desc,
        marc_desc_full: this.state.marc_desc_full,
        is_hit: this.state.is_hit,
        is_new: this.state.is_new,
        show_program: this.state.show_program,
        show_site: this.state.show_site,
        img_app: this.state.img_app,
        id: this.props.item.id,
        name: this.props.item.name,
        link: this.props.item.link,
        category_id: this.props.item.category_id,
        weight: this.props.item.weight,
        stol: this.props.item.stol,
        type: this.props.item.type,
      };
  
      const res = await this.props.getData('save_edit_mark', data);
  
      if(res.st === false){

        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });

      } else {
        if( this.myDropzone['files'].length > 0 ){
          
          if(this.myDropzone['files'].length > 0 && this.isInit === false) {
            this.isInit = true;

            let name = this.props.item.name,
            id = this.props.item.id,
            type = 'new';
    
            this.myDropzone.on('sending', (file, xhr, data) => {
              let file_type = (file.name).split('.');
              file_type = file_type[file_type.length - 1];
              file_type = file_type.toLowerCase();
        
              data.append("typeFile", type);
              data.append("name", name);
              data.append("id", id);
            });
    
            this.myDropzone.on('queuecomplete', (data) => {
              var check_img = false;
    
              this.myDropzone['files'].map( (item, key) => {
                if (item['status'] == 'error') {
                  check_img = true;
                }
              });
    
              if (check_img) {
                this.setState({
                  openAlert: true,
                  err_status: false,
                  err_text: 'Ошибка при загрузке фотографии',
                });
    
                return;

              } else {
                
                setTimeout(() => {
                  this.onClose(true);
                  this.props.update();
                }, 1000)

              }
    
              this.isInit = false;

            });
          }
  
          this.myDropzone.processQueue();

        } else {

          this.setState({
            openAlert: true,
            err_status: res.st,
            err_text: res.text,
          });

          this.onClose(true);
          this.props.update();
        }
      }
  
      setTimeout(() => {
        this.click = false;
      }, 300);
    }

    this.onClose();
  }

  onClose() {
    this.setState({
      date_start: null,
      date_end: null,
      tmp_desc: '',
      marc_desc: '',
      marc_desc_full: '',
      is_hit: '0',
      is_new: '0',
      show_program: '0',
      show_site: '0',
      img_app: '',
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  render() {
    const { open, method, fullScreen } = this.props;

    return (
      <>
        <MyAlert 
          isOpen={this.state.openAlert} 
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} 
        />
        
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
                    <Typography>Картинка соотношением сторон (1:1) (пример: 2000х2000) только JPG</Typography>
                  </Grid>

                  {this.state.img_app.length > 0 ? (
                    <Grid item xs={12} sm={6}>
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
                    </Grid>
                  ) : null}
                  <Grid item xs={12} sm={6}>
                    <div className="dropzone" id="for_img_edit_new" style={{ width: '100%', minHeight: 150 }} />
                  </Grid>
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
      </>
    );
  }
}

class SiteItems_Modal_Tech extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      date_start: null,
      date_end: null,
      art: '',
      category_id: '',
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
      all_w: 0,
      all_w_brutto: 0,
      all_w_netto: 0,
      items_stage: null,
      item_items: null
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
        category_id: this.props.item?.category_id,
        count_part: this.props.item?.count_part,
        date_start: this.props.item?.date_start ? formatDate(this.props.item.date_start) : null,
        date_end: this.props.item?.date_end ? formatDate(this.props.item.date_end) : null,
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
        all_w_brutto: this.props.item?.all_w_brutto,
        all_w_netto: this.props.item?.all_w_netto,
        items_stage: this.props.items_stage,
        item_items: this.props.item_items,
      });
    }
  }

  chooseItem(type, event, data) {

    if(type === 'stages') {
      let items_stage = this.state.items_stage;

      items_stage.not_stage.push({
        type_id: {id: data.id, name: data.name},
        ei_name: data.ei_name,
        type: data.type,
        brutto: 0,
        pr_1: 0,
        netto: 0,
        pr_2: 0,
        res: 0,
        stage: ''
      })

      this.setState({ items_stage });
    }

    if(type === 'items') {
      let item_items = this.state.item_items;

      item_items.this_items.push({
        item_id: {id: data.id, name: data.name},
        brutto: 0,
        pr_1: 0,
        netto: 0,
        pr_2: 0,
        res: 0,
        is_add: 0
      })

      this.setState({ item_items });
    }
  
  }

  changeItemData(index, type, event, value) {
    let items_stage = this.state.items_stage;
    let item_items = this.state.item_items;
    
    if(!value && (type === 'stage_1' || type === 'stage_2' || type === 'stage_3' || type === 'not_stage')) {
      
      items_stage[type].splice(index, 1);

      this.setState({ 
        items_stage 
      });
    }

    if(!value && type === 'this_items') {
      
      item_items[type].splice(index, 1);

      this.setState({ 
        item_items
      });
    }

    if(!value) {

      let all_w_brutto_1 = items_stage.stage_1.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_2 = items_stage.stage_2.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_3 = items_stage.stage_3.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_4 = items_stage.not_stage.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_5 = item_items.this_items.reduce((sum, item) => sum + parseFloat(item.brutto), 0);

      let all_w_brutto = all_w_brutto_1 + all_w_brutto_2 + all_w_brutto_3 + all_w_brutto_4 + all_w_brutto_5;

      all_w_brutto = roundTo(all_w_brutto, 3);

      let all_w_netto_1 = items_stage.stage_1.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_2 = items_stage.stage_2.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_3 = items_stage.stage_3.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_4 = items_stage.not_stage.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_5 = item_items.this_items.reduce((sum, item) => sum + parseFloat(item.netto), 0);

      let all_w_netto = all_w_netto_1 + all_w_netto_2 + all_w_netto_3 + all_w_netto_4 + all_w_netto_5;

      all_w_netto = roundTo(all_w_netto, 3);

      let all_w_1 = items_stage.stage_1.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_2 = items_stage.stage_2.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_3 = items_stage.stage_3.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_4 = items_stage.not_stage.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_5 = item_items.this_items.reduce((sum, item) => sum + parseFloat(item.res), 0);

      let all_w = all_w_1 + all_w_2 + all_w_3 + all_w_4 + all_w_5;

      all_w = roundTo(all_w, 3);

      this.setState({ 
        all_w_brutto, 
        all_w_netto, 
        all_w 
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

  changeSelect(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeItemSelect(data, index, type, item, event) {

    let items_stage = this.state.items_stage;

    items_stage[type].splice(index, 1);

    const stage = `stage_${event.target.value}`;

    item[data] = event.target.value;

    items_stage[stage].push(item);
    
    this.setState({ items_stage });
  }

  changeItemList(type, key, stage, event) {
    let items_stage = this.state.items_stage;
    let item_items = this.state.item_items;
    let value = event.target.value;

    if(stage === 'stage_1' || stage === 'stage_2' || stage === 'stage_3' || stage === 'not_stage') {

      if(value < 0) {
        items_stage[stage][key][type] = 0;
      } else {
        items_stage[stage][key][type] = value;
      }

      if(type === 'brutto') {
        items_stage[stage][key].netto = roundTo((parseFloat(items_stage[stage][key].brutto) * (100 - parseFloat(items_stage[stage][key].pr_1))) / 100, 3);

        items_stage[stage][key].res = roundTo((parseFloat(items_stage[stage][key].netto) * (100 - parseFloat(items_stage[stage][key].pr_2))) / 100, 3);
      }

      if(type === 'pr_1') {
        items_stage[stage][key].netto = roundTo((parseFloat(items_stage[stage][key].brutto) * (100 - parseFloat(items_stage[stage][key].pr_1))) / 100, 3);

        items_stage[stage][key].res = roundTo((parseFloat(items_stage[stage][key].netto) * (100 - parseFloat(items_stage[stage][key].pr_2))) / 100, 3);
      }

      if(type === 'pr_2') {
        items_stage[stage][key].res = roundTo((parseFloat(items_stage[stage][key].netto) * (100 - parseFloat(items_stage[stage][key].pr_2))) / 100, 3);
      }
    
      this.setState({ items_stage });
    }

    if(stage === 'this_items') {

      if(value < 0) {
        item_items[stage][key][type] = 0;
      } else {
        item_items[stage][key][type] = value;
      }

      if(type === 'brutto') {
        item_items[stage][key].netto = roundTo((parseFloat(item_items[stage][key].brutto) * (100 - parseFloat(item_items[stage][key].pr_1))) / 100, 3);

        item_items[stage][key].res = roundTo((parseFloat(item_items[stage][key].netto) * (100 - parseFloat(item_items[stage][key].pr_2))) / 100, 3);
      }

      if(type === 'pr_1') {
        item_items[stage][key].netto = roundTo((parseFloat(item_items[stage][key].brutto) * (100 - parseFloat(item_items[stage][key].pr_1))) / 100, 3);

        item_items[stage][key].res = roundTo((parseFloat(item_items[stage][key].netto) * (100 - parseFloat(item_items[stage][key].pr_2))) / 100, 3);
      }

      if(type === 'pr_2') {
        item_items[stage][key].res = roundTo((parseFloat(item_items[stage][key].netto) * (100 - parseFloat(item_items[stage][key].pr_2))) / 100, 3);
      }

      this.setState({ item_items });
    }

    if(type === 'brutto') {
      let all_w_brutto_1 = items_stage.stage_1.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_2 = items_stage.stage_2.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_3 = items_stage.stage_3.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_4 = items_stage.not_stage.reduce((sum, item) => sum + parseFloat(item.brutto), 0);
      let all_w_brutto_5 = item_items.this_items.reduce((sum, item) => sum + parseFloat(item.brutto), 0);

      let all_w_brutto = all_w_brutto_1 + all_w_brutto_2 + all_w_brutto_3 + all_w_brutto_4 + all_w_brutto_5;

      all_w_brutto = roundTo(all_w_brutto, 3);

      this.setState({ all_w_brutto });
    }

    if(type === 'brutto' || type === 'pr_1') {
      let all_w_netto_1 = items_stage.stage_1.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_2 = items_stage.stage_2.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_3 = items_stage.stage_3.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_4 = items_stage.not_stage.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      let all_w_netto_5 = item_items.this_items.reduce((sum, item) => sum + parseFloat(item.netto), 0);

      let all_w_netto = all_w_netto_1 + all_w_netto_2 + all_w_netto_3 + all_w_netto_4 + all_w_netto_5;

      all_w_netto = roundTo(all_w_netto, 3);
      
      this.setState({ all_w_netto });
    }

      let all_w_1 = items_stage.stage_1.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_2 = items_stage.stage_2.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_3 = items_stage.stage_3.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_4 = items_stage.not_stage.reduce((sum, item) => sum + parseFloat(item.res), 0);
      let all_w_5 = item_items.this_items.reduce((sum, item) => sum + parseFloat(item.res), 0);

      let all_w = all_w_1 + all_w_2 + all_w_3 + all_w_4 + all_w_5;

      all_w = roundTo(all_w, 3);

      this.setState({ all_w });
  }

  changeItemChecked(type, event) {
    this.setState({
      [type]: event.target.checked === true ? 1 : 0,
    });
  }

  save() {

    const items_stage = this.state.items_stage;

    if(items_stage.not_stage.length) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'В Заготовках необходимо у всех позиций указать этап'
      });

      return;
    }

    const data = {
      id: this.props.item?.id,
      type: this.props.item?.type,
      size_pizza: this.props.item?.size_pizza,
      name: this.state.name,
      art: this.state.art,
      category_id: this.state.category_id,
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
      date_start: this.state.date_start ? dayjs(this.state.date_start).format('YYYY-MM-DD') : '',
      date_end: this.state.date_end ? dayjs(this.state.date_end).format('YYYY-MM-DD') : '',
      all_w: this.state.all_w,
      all_w_brutto: this.state.all_w_brutto,
      all_w_netto: this.state.all_w_netto,
      items_stage: this.state.items_stage,
      item_items: this.state.item_items,
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
      category_id: '',
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
      all_w: 0,
      all_w_brutto: 0,
      all_w_netto: 0,
      items_stage: null,
      item_items: null,
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  render() {
    const { open, method, fullScreen, category, stages } = this.props;

    return (
      <>
        <MyAlert 
          isOpen={this.state.openAlert} 
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} 
        />

        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={'xl'}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography>{method === 'Новое блюдо' ? method : `Редактирование: ${method}`}</Typography>
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
                  value={this.state.category_id}
                  func={this.changeSelect.bind(this, 'category_id')}
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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={3}>
                <MyTextInput
                  label="Белки"
                  value={this.state.protein}
                  func={this.changeItem.bind(this, 'protein')}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MyTextInput
                  label="Жиры"
                  value={this.state.fat}
                  func={this.changeItem.bind(this, 'fat')}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MyTextInput
                  label="Углеводы"
                  value={this.state.carbohydrates}
                  func={this.changeItem.bind(this, 'carbohydrates')}
                />
              </Grid>
              <Grid item xs={12} sm={3} />
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
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell colSpan={8}>Заготовки</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.items_stage?.stage_1.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyAutocomplite
                            multiple={false}
                            data={this.state.items_stage?.all ?? []}
                            value={item.type_id}
                            func={this.changeItemData.bind(this, key, 'stage_1')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'brutto', key, 'stage_1')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_1', key, 'stage_1')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_2', key, 'stage_1')}
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
                          <MySelect
                            is_none={false}
                            data={stages}
                            value={item.stage}
                            func={this.changeItemSelect.bind(this, 'stage', key, 'stage_1', item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {this.state.items_stage?.stage_2.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyAutocomplite
                            multiple={false}
                            data={this.state.items_stage?.all ?? []}
                            value={item.type_id}
                            func={this.changeItemData.bind(this, key, 'stage_2')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'brutto', key, 'stage_2')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_1', key, 'stage_2')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_2', key, 'stage_2')}
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
                          <MySelect
                            is_none={false}
                            data={stages}
                            value={item.stage}
                            func={this.changeItemSelect.bind(this, 'stage', key, 'stage_2', item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {this.state.items_stage?.stage_3.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyAutocomplite
                            multiple={false}
                            data={this.state.items_stage?.all ?? []}
                            value={item.type_id}
                            func={this.changeItemData.bind(this, key, 'stage_3')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'brutto', key, 'stage_3')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_1', key, 'stage_3')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_2', key, 'stage_3')}
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
                          <MySelect
                            is_none={false}
                            data={stages}
                            value={item.stage}
                            func={this.changeItemSelect.bind(this, 'stage', key, 'stage_3', item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {this.state.items_stage?.not_stage.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyAutocomplite
                            multiple={false}
                            data={this.state.items_stage?.all ?? []}
                            value={item.type_id}
                            func={this.changeItemData.bind(this, key, 'not_stage')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'brutto', key, 'not_stage')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_1', key, 'not_stage')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_2', key, 'not_stage')}
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
                          <MySelect
                            is_none={false}
                            data={stages}
                            value={item.stage}
                            func={this.changeItemSelect.bind(this, 'stage', key, 'not_stage', item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <MyAutocomplite
                          multiple={false}
                          data={this.state.items_stage?.all ?? []}
                          value={null}
                          func={this.chooseItem.bind(this, 'stages')}
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
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                      <TableCell colSpan={8}>Позиции</TableCell>
                    </TableRow>
                    {this.state.item_items?.this_items.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell colSpan={2}>
                          <MyAutocomplite
                            multiple={false}
                            data={this.state.item_items?.all_items ?? []}
                            value={item.item_id}
                            func={this.changeItemData.bind(this, key, 'this_items')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'brutto', key, 'this_items')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_1', key, 'this_items')}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2}
                            type={'number'}
                            func={this.changeItemList.bind(this, 'pr_2', key, 'this_items')}
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
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}>
                        <MyAutocomplite
                          multiple={false}
                          data={this.state.item_items?.all_items ?? []}
                          value={null}
                          func={this.chooseItem.bind(this, 'items')}
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
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.all_w_brutto}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell colSpan={1} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.all_w_netto}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell colSpan={1} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.all_w}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell></TableCell>
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
      </>
    );
  }
}

class SiteItems_Table extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.timeUpdate !== this.props.timeUpdate;
  }

  render() {
    const { cats, user_app, changeSort, saveSort, changeTableCheck, openItem, openHistoryItem } = this.props;
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
                              onBlur={saveSort.bind(this, item.id, 'sort')}
                            />
                          </TableCell>
                        ) : null}
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.date_start}</TableCell>
                        <TableCell>{item.date_end}</TableCell>
                        <TableCell>{item.date_update}</TableCell>
                        {user_app === 'technologist' ? <TableCell>{item.art}</TableCell> : null}
                        <TableCell style={{ cursor: 'pointer' }} onClick={openItem.bind(this, item.id, item.name)}>
                          <EditIcon />
                        </TableCell>
                        <TableCell
                          style={{ cursor: 'pointer' }}
                          onClick={openHistoryItem.bind(this, item.id, 'История изменений')}
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
      fullScreen: false,

      openAlert: false,
      err_status: false,
      err_text: '',

      modalDialogTech: false,
      itemTech: null,

      modalDialogMark: false,
      itemMark: null,

      modalDialogHist: false,
      itemHist: null,

      modalDialogView_Mark: false,
      itemView_Mark: null,

      modalDialogView: false,
      itemView: null,

      items_stage: null,
      item_items: null,

      category: [],
      stages: [],
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all_new');

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      // ??
      //user_app: 'technologist',
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

  async update() {
    const data = await this.getData('get_all_new');

    this.setState({
      cats: data.cats,
      // ??
      //user_app: 'technologist',
      user_app: 'marketing',
      timeUpdate: new Date(),
    });
  }

  async openItemNew(method) {
    this.handleResize();

    let res = await this.getData('get_all_for_new_tech');

    res.items_stage.not_stage = [];
    const stages = [{id: '1', name: '1 этап'}, {id: '2', name: '2 этап'}, {id: '3', name: '3 этап'}]
    res.item.category_id = '';

    this.setState({
      itemTech: res.item,
      modalDialogTech: true,
      method,
      category: res.cat_list,
      items_stage: res.items_stage,
      item_items: res.item_items,
      stages
    });

  }

  async openItemTech(id, method) {
    this.handleResize();

    const data = {
      id
    };

    const res = await this.getData('get_one_tech', data);

    res.items_stage.stage_1.map(it => {
      let value;

      if(it.type === 'rec') {
         value = res.items_stage.all.find((item) => item.type === 'rec' && parseInt(item.id) === parseInt(it.rec_id));
      } else {
         value = res.items_stage.all.find((item) => item.type === 'pf' && parseInt(item.id) === parseInt(it.pf_id));
      }
      
      if(value) {
        it.type_id = { id: value.id, name: value.name }
      } else {
        it.type_id = { id: '', name: it.name }
      }
    })

    res.items_stage.stage_2.map(it => {
      let value;

      if(it.type === 'rec') {
         value = res.items_stage.all.find((item) => item.type === 'rec' && parseInt(item.id) === parseInt(it.rec_id));
      } else {
         value = res.items_stage.all.find((item) => item.type === 'pf' && parseInt(item.id) === parseInt(it.pf_id));
      }

      if(value) {
        it.type_id = { id: value.id, name: value.name }
      } else {
        it.type_id = { id: '', name: it.name }
      }
    })

    res.items_stage.stage_3.map(it => {
      let value;
      
      if(it.type === 'rec') {
         value = res.items_stage.all.find((item) => item.type === 'rec' && parseInt(item.id) === parseInt(it.rec_id));
      } else {
         value = res.items_stage.all.find((item) => item.type === 'pf' && parseInt(item.id) === parseInt(it.pf_id));
      }

      if(value) {
        it.type_id = { id: value.id, name: value.name }
      } else {
        it.type_id = { id: '', name: it.name }
      }
    })

    res.items_stage.not_stage = [];

    res.item_items.this_items.map(it => {
      const value = res.item_items.all_items.find((item) => parseInt(item.id) === parseInt(it.item_id));
      it.item_id = { id: value.id, name: value.name }
      return it;
    })

    const stages = [{id: '1', name: '1 этап'}, {id: '2', name: '2 этап'}, {id: '3', name: '3 этап'}]

    this.setState({
      itemTech: res.item,
      modalDialogTech: true,
      method,
      category: res.cat_list,
      items_stage: res.items_stage,
      item_items: res.item_items,
      stages
    });
  }

  async openItemMark(id, method) {
    this.handleResize();

    const data = {
      id
    };

    const res = await this.getData('get_one_mark', data);

    this.setState({
      itemMark: res.item,
      modalDialogMark: true,
      method,
    });
  }

  async updateVK() {
    this.setState({
      confirmDialog: false,
    });

    await this.getData('updateVK', {});
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

  async saveSort(id, type, event) {
    const value = event.target.value;

    const data = {
      id,
      type,
      value
    };

    await this.getData('save_check', data);
  }

  async changeTableCheck(key_cat, key_item, id, type, event, val) {
    const value = val ? 1 : 0;

    let cats = this.state.cats;
    cats[key_cat]['items'][key_item][type] = value;

    this.setState({
      cats,
      timeUpdate: new Date(),
    });

    const data = {
      id,
      type,
      value,
    };

    const res = await this.getData('save_check', data);

    // setTimeout(() => {
    //   this.update();
    // }, 300);
  }

  async saveTech(item) {

    const method = this.state.method;

    item.item_items.this_items = item.item_items.this_items.map((it) => {
      it.item_id = it.item_id.id;
      return it;
    });

    const pf_stage_1 = item.items_stage.stage_1.reduce((newIt, it) => {
      if(it.type === 'pf') {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const pf_stage_2 = item.items_stage.stage_2.reduce((newIt, it) => {
      if(it.type === 'pf') {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const pf_stage_3 = item.items_stage.stage_3.reduce((newIt, it) => {
      if(it.type === 'pf') {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_1 = item.items_stage.stage_1.reduce((newIt, it) => {
      if(it.type === 'rec') {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_2 = item.items_stage.stage_2.reduce((newIt, it) => {
      if(it.type === 'rec') {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_3 = item.items_stage.stage_3.reduce((newIt, it) => {
      if(it.type === 'rec') {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);


    const data = {
      ...item,
      pf_stage_1,
      pf_stage_2,
      pf_stage_3,
      rec_stage_1,
      rec_stage_2,
      rec_stage_3
    }

    let res;

    if(method === 'Новое блюдо') {
      res = await this.getData('save_new_tech', data);
    } else {
      res = await this.getData('save_edit_tech', data);
    }

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialogTech: false,
        itemTech: null,
      });
      
      setTimeout(async () => {
        this.update();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async openHistoryMark(id, method) {
    this.handleResize();

    const data = {
      item_id: id,
    };

    let res;

    res = await this.getData('get_one_hist_mark', data);

    if(res.hist.length) {

      if (res.hist.length > 1) {
        res.hist.map((hist, index) => {
          hist.date_update = res?.hist[index + 1]?.date_start ?? ''
          return hist;
        });
      }
  
      this.setState({
        modalDialogHist: true,
        itemHist: res.hist,
        itemName: res.hist[0].name,
        method,
      });

    } else {

      const data = {
        id
      };

      res = await this.getData('get_one_mark', data);

      this.setState({
        modalDialogHist: true,
        itemHist: [res.item],
        itemName: res.item.name,
        method,
      });
    }
  }

  async openHistoryTech(id, method, type) {
    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData('get_one_hist_tech', data);

    if(res.hist.length) {

      if (res.hist.length > 1) {
        res.hist.map((hist, index) => {
          hist.date_update = res?.hist[index + 1]?.date_start ?? ''
          return hist;
        });
      }
  
      this.setState({
        modalDialogHist: true,
        itemHist: res.hist,
        itemName: res.hist[0].name,
        method,
      });

    } else {

      const data = {
        id
      };

      const res = await this.getData('get_one_tech', data);

      res.item.items = res.item_items.this_items;
      res.item.stage_1 = res.items_stage.stage_1;
      res.item.stage_2 = res.items_stage.stage_2;
      res.item.stage_3 = res.items_stage.stage_3;

      if(res.item.category_id) {
        res.item.category_name = res.cat_list.find(cat => parseInt(cat.id) === parseInt(res.item.category_id))?.name ?? '';
      } else {
        res.item.category_name = res.cat_list.find(cat => parseInt(cat.id) === parseInt(res.item.category_id2))?.name ?? '';
      }

      this.setState({
        modalDialogHist: true,
        itemHist: [res.item],
        itemName: res.item.name,
        method,
      });
    }

  }

  async openModalHistoryView_Mark(index) {

    const item = this.state.itemHist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.show_program = parseInt(itemView.show_program) ? 'Да' : 'Нет';
    itemView.is_new = parseInt(itemView.is_new) ? 'Да' : 'Нет';
    itemView.show_site = parseInt(itemView.show_site) ? 'Да' : 'Нет';
    itemView.is_hit = parseInt(itemView.is_hit) ? 'Да' : 'Нет';

    if(parseInt(index) !== 0) {
      
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      itemView_old.show_program = parseInt(itemView_old.show_program) ? 'Да' : 'Нет';
      itemView_old.is_new = parseInt(itemView_old.is_new) ? 'Да' : 'Нет';
      itemView_old.show_site = parseInt(itemView_old.show_site) ? 'Да' : 'Нет';
      itemView_old.is_hit = parseInt(itemView_old.is_hit) ? 'Да' : 'Нет';
      
      for (let key in itemView) {

        if(itemView[key] !== itemView_old[key] && key !== 'img_app') {
          itemView[key] = { key: itemView[key], color: 'true' }
        }
      }
    } 
    
    this.setState({
      modalDialogView_Mark: true,
      itemView_Mark: itemView
    });

  }

  async openModalHistoryView_Tech(index) {

    const item = this.state.itemHist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.is_show = parseInt(itemView.is_show) ? 'Да' : 'Нет';
    itemView.is_price = parseInt(itemView.is_price) ? 'Да' : 'Нет';

    if(parseInt(index) !== 0) {
      
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      itemView_old.is_show = parseInt(itemView_old.is_show) ? 'Да' : 'Нет';
      itemView_old.is_price = parseInt(itemView_old.is_price) ? 'Да' : 'Нет';
      
      for (let key in itemView) {

        if(itemView[key] !== itemView_old[key] && key !== 'stage_1' && key !== 'stage_2' && key !== 'stage_3' && key !== 'items') {
          itemView[key] = { key: itemView[key], color: 'true' }
        }

        if(key === 'stage_1') {
         
          itemView.stage_1 = itemView.stage_1.reduce((newList, it) => {

            let item_old;

            if(it.type === 'rec') {
              item_old = itemView_old.stage_1.find((item) => item.type === 'rec' && parseInt(item.rec_id) === parseInt(it.rec_id));
            } else {
              item_old = itemView_old.stage_1.find((item) => item.type === 'pf' && parseInt(item.pf_id) === parseInt(it.pf_id));
            }

            if(item_old) {
              for (let key in it) {
                if(it[key] !== item_old[key]) {
                  it[key] = { key: it[key], color: 'true' }
                }
              }
            } else {
              for (let key in it) {
                it[key] = { key: it[key], color: 'true' }
              }
            }
            
            return newList = [...newList,...[it]]
          }, [])
        }

        if(key === 'stage_2') {
          
          itemView.stage_2 = itemView.stage_2.reduce((newList, it) => {

            let item_old;

            if(it.type === 'rec') {
              item_old = itemView_old.stage_2.find((item) => item.type === 'rec' && parseInt(item.rec_id) === parseInt(it.rec_id));
            } else {
              item_old = itemView_old.stage_2.find((item) => item.type === 'pf' && parseInt(item.pf_id) === parseInt(it.pf_id));
            }

            if(item_old) {
              for (let key in it) {
                if(it[key] !== item_old[key]) {
                  it[key] = { key: it[key], color: 'true' }
                }
              }
            } else {
              for (let key in it) {
                it[key] = { key: it[key], color: 'true' }
              }
            }
            
            return newList = [...newList,...[it]]
          }, [])
        }

        if(key === 'stage_3') {
       
          itemView.stage_3 = itemView.stage_3.reduce((newList, it) => {

            let item_old;

            if(it.type === 'rec') {
              item_old = itemView_old.stage_3.find((item) => item.type === 'rec' && parseInt(item.rec_id) === parseInt(it.rec_id));
            } else {
              item_old = itemView_old.stage_3.find((item) => item.type === 'pf' && parseInt(item.pf_id) === parseInt(it.pf_id));
            }

            if(item_old) {
              for (let key in it) {
                if(it[key] !== item_old[key]) {
                  it[key] = { key: it[key], color: 'true' }
                }
              }
            } else {
              for (let key in it) {
                it[key] = { key: it[key], color: 'true' }
              }
            }
            
            return newList = [...newList,...[it]]
          }, [])
        }

        if(key === 'items') {
          itemView.items = itemView.items.reduce((newList, it) => {
            const item_old = itemView_old.items.find((item) => parseInt(item.item_id) === parseInt(it.item_id));

            if(item_old) {
              for (let key in it) {
                if(it[key] !== item_old[key]) {
                  it[key] = { key: it[key], color: 'true' }
                }
              }
            } else {
              for (let key in it) {
                it[key] = { key: it[key], color: 'true' }
              }
            }
            
            return newList = [...newList,...[it]]
          }, [])
        }
      }
    } 
    
    this.setState({
      modalDialogView: true,
      itemView
    });

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
          onClose={() => this.setState({ modalDialogTech: false, itemTech: null })}
          item={this.state.itemTech}
          method={this.state.method}
          category={this.state.category}
          save={this.saveTech.bind(this)}
          fullScreen={this.state.fullScreen}
          item_items={this.state.item_items}
          items_stage={this.state.items_stage}
          stages={this.state.stages}
        />

        <SiteItems_Modal_Mark
          open={this.state.modalDialogMark}
          onClose={() => this.setState({ modalDialogMark: false })}
          item={this.state.itemMark}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          getData={this.getData.bind(this)}
          update={this.update.bind(this)}
        />

        <SiteItems_Modal_History
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false, itemHist: null })}
          item={this.state.itemHist}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          openModalHistoryView={this.state.user_app === 'technologist' ? this.openModalHistoryView_Tech.bind(this) : this.openModalHistoryView_Mark.bind(this)}
          itemName={this.state.itemName}
        />

        <SiteItems_Modal_History_View_Mark
          open={this.state.modalDialogView_Mark}
          onClose={() => this.setState({ modalDialogView_Mark: false, itemView_Mark: null })}
          itemView={this.state.itemView_Mark}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />

        <SiteItems_Modal_History_View_Tech
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null })}
          itemView={this.state.itemView}
          itemName={this.state.itemName}
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
              openHistoryItem={this.state.user_app === 'technologist' ? this.openHistoryTech.bind(this) : this.openHistoryMark.bind(this)}
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
