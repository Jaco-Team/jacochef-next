import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArchiveIcon from '@mui/icons-material/Archive';

import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import HelpIcon from '@mui/icons-material/Help';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

import {MySelect, MyDatePickerNew, MyAlert, MyAutocomplite, formatDateReverse, MyTextInput} from '@/ui/elements';

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import {api_laravel, api_laravel_local} from "@/src/api_new";

import dayjs from 'dayjs';

const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

function getColor(val1, val2, serverColor) {
  const n1 = Number(val1) || 0;
  const n2 = Number(val2) || 0;

  if (n1 !== n2) return 'red';

  if (serverColor === 'gray' || serverColor === 'grey') return 'gray';
  if (serverColor === 'green') return 'green';
  return 'inherit';
}

const DiffButton = ({
  visible,
  onClick,
  ctx,
  canEdit = false,    
  title = 'Расхождение сумм — подробности',
}) => {
  if (!visible) return null;

  const scope = ctx?.scope;
  const canComment = scope === 'kassa_day';

  const hasComment =
    (typeof ctx?.hasComment === 'boolean' ? ctx.hasComment : undefined) ??
    (canComment && typeof ctx?.comment === 'string' && ctx.comment.trim().length > 0);


  const tooltip = scope === 'kassa_day'
    ? (hasComment
        ? 'Расхождение сумм — есть комментарий'
        : (canEdit ? 'Расхождение сумм — добавить комментарий'
                   : 'Расхождение сумм — подробности'))
    : scope === 'day'
      ? (hasComment ? 'Расхождение сумм — есть комментарии'
                    : 'Расхождение сумм — подробности')
      : title;

  return (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        aria-label={tooltip}
        onClick={(e) => { e.stopPropagation?.(); onClick?.(ctx, e); }}
        sx={{ ml: 0.5 }}
      >
        <ReportProblemOutlinedIcon
          color={hasComment ? 'info' : 'error'}
          fontSize="small"
        />
      </IconButton>
    </Tooltip>
  );
};


const status = [
  {
      "id": 1,
      "name": "Выгружено",
      "clr": "green",
      "count": 0,
  },
  {
      "id": 2,
      "name": "Не выгружено",
      "clr": "grey",
      "count": 0,
  },
  {
      "id": 3,
      "name": "Ошибка",
      "clr": "red",
      "count": 0,
  },
  {
      "id": 4,
      "name": "Комментарий",
      "clr": "blue",
      "count": 0,
  }
]

class CheckCheck_Accordion_online extends React.Component {

  render() {
    const { orders } = this.props;

    return (
      <Box>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'bold' }}>Не фискализированные онлайн заказы</Typography>
            <Tooltip title="Количество заказов" arrow>
              <Chip label={orders.length} color="primary" size="small" sx={{ ml: 1 }} />
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Номер заказа</TableCell>
                  <TableCell>Дата / время заказа</TableCell>
                  <TableCell>Тип оплаты</TableCell>
                  <TableCell>Сумма заказа</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, k) => (
                  <TableRow key={k} hover>
                    <TableCell>{k + 1}</TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date_time}</TableCell>
                    <TableCell>{order.type_pay_text}</TableCell>
                    <TableCell>{formatNumber(order?.summ_order ?? 0)} ₽</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }
}

class CheckCheck_Accordion extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      openRows: {},
      openSummary: false, 
      mismatchOpen: false,
      mismatchCtx: null,
      comment: '',
    };
  }

  static findDay(days, date) {
    return (days ?? []).find(d => d.date === date);
  }

  getPreparedDays = (summ_ofd, summ_chef) => {

    const allDatesSet = new Set([
      ...(summ_ofd?.days ?? []).map(d => d.date),
      ...(summ_chef?.days ?? []).map(d => d.date)
    ]);

    const allDates = Array.from(allDatesSet).sort();

    return allDates.map(date => {
      
      const ofdDay = CheckCheck_Accordion.findDay(summ_ofd?.days, date);
      const chefDay = CheckCheck_Accordion.findDay(summ_chef?.days, date);

      const kassaIdsSet = new Set([
        ...(ofdDay?.kass ?? []).map(k => k.kassa),
        ...(chefDay?.kass ?? []).map(k => k.kassa)
      ]);

      const allKassaIds = Array.from(kassaIdsSet).sort();
  
      const kassas = allKassaIds.map(kassaId => ({
        kassaId,
        ofdKassa: (ofdDay?.kass ?? []).find(k => k.kassa === kassaId) || {},
        chefKassa: (chefDay?.kass ?? []).find(k => k.kassa === kassaId) || {}
      }));

      return { date, ofdDay, chefDay, kassas };

    });
  };

  toggleRow = date => {
    this.setState(prev => ({
      openRows: { ...prev.openRows, [date]: !prev.openRows[date] }
    }));
  };

  toggleSummary = () => {
    this.setState(prev => ({ openSummary: !prev.openSummary }));
  };

  getKassTotals = (summ_ofd, summ_chef) => {
    const ids = new Set([
      ...((summ_ofd?.kass_total ?? []).map(k => k.kassa)),
      ...((summ_chef?.kass_total ?? []).map(k => k.kassa)),
    ]);

    return Array.from(ids).sort((a,b) => a - b).map(kassaId => ({
      kassaId,
      ofdTotal: (summ_ofd?.kass_total ?? []).find(k => k.kassa === kassaId) || {},
      chefTotal: (summ_chef?.kass_total ?? []).find(k => k.kassa === kassaId) || {},
    }));
  };

  openMismatch = (ctx) => {
    this.setState({
      mismatchOpen: true,
      mismatchCtx: ctx,
      comment: (ctx?.comment ?? ''),
    });
  };

  closeMismatch = () => this.setState({ mismatchOpen: false, mismatchCtx: null, comment: '' });

  handleCommentChange = (e) => this.setState({ comment: e.target.value });

  saveComment = async () => {
    const { mismatchCtx, comment } = this.state;
    const { acces_comment, save_comment } = this.props;

    if (!mismatchCtx || mismatchCtx.scope !== 'kassa_day') return;
     if (String(acces_comment) !== '1') return;
    const smena_list = (mismatchCtx.smena_list || '').trim();
    if (!smena_list) return;
  
    const data = {
      date: mismatchCtx.date,
      kassa: mismatchCtx.kassaId,
      smena_list,
      comment: comment,
    };

    save_comment(data);

     this.setState({
      mismatchOpen: false,
      mismatchCtx: null,
      comment: '',
    });
  };

  render() {
    const { summ_ofd, summ_chef, acces_comment } = this.props;
    const { openRows, openSummary, mismatchOpen, mismatchCtx, comment } = this.state;

    const daysMerged = this.getPreparedDays(summ_ofd, summ_chef);
    const kassTotals = this.getKassTotals(summ_ofd, summ_chef);

    const counts = { green: 0, gray: 0, red: 0 };

    daysMerged.forEach(({ ofdDay, kassas }) => {
      kassas.forEach(({ ofdKassa = {}, chefKassa = {} }) => {
        const ofdSum  = (ofdKassa.summ_cash ?? 0) + (ofdKassa.summ_bank ?? 0);
        const chefSum = (chefKassa.summ_cash ?? 0) + (chefKassa.summ_bank ?? 0);

        const smenaCount = ofdKassa.smena_count ?? 0;

        const summColor = ofdKassa.color ?? ofdDay?.color ?? 'inherit';

        const color = getColor(ofdSum, chefSum, summColor);

        if (color === 'green') counts.green += smenaCount;
        else if (color === 'gray') counts.gray += smenaCount;
        else if (color === 'red') counts.red += smenaCount;
      });
    });

    const statusRows = status
      .map(s => {
        let baseCount =
          s.clr === 'green' ? counts.green :
          (s.clr === 'grey' || s.clr === 'gray') ? counts.gray :
          s.clr === 'red' ? counts.red :
          s.count;

        if (s.id === 4) {
          return {
            ...s,
            clr: 'info.main',
            count: Number(summ_ofd?.comment_count ?? 0),
          };
        }

        return { ...s, count: baseCount };
    });

    const num = v => Number(v) || 0;
    const hasCashMismatchInside = daysMerged.some(({ ofdDay, chefDay }) =>
      num(ofdDay?.summ_cash) !== num(chefDay?.summ_cash)
    );
    const hasBankMismatchInside = daysMerged.some(({ ofdDay, chefDay }) =>
      num(ofdDay?.summ_bank) !== num(chefDay?.summ_bank)
    );

    let colorAllCash = getColor(summ_ofd?.all_cash, summ_chef?.all_cash, summ_ofd?.color);
    let colorAllBank = getColor(summ_ofd?.all_bank, summ_chef?.all_bank, summ_ofd?.color);

    if (hasCashMismatchInside) colorAllCash = 'red';
    if (hasBankMismatchInside) colorAllBank = 'red';

    const canEdit = Number(acces_comment) === 1;
    
    return (
      <Box>
        <Accordion expanded>
          <AccordionSummary>
            <Typography sx={{ fontWeight: 'bold' }}>Данные по суммам</Typography>
          </AccordionSummary>

          <AccordionDetails>
     
            <TableContainer component={Paper} sx={{ mb: 5, width: '40%' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell sx={{ minWidth: 180, fontWeight: 400 }} colSpan={2}>
                      Тип цвета суммы в зависимости от смены
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusRows.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: item.clr, fontWeight: 'bold' }}>{item.name}</TableCell>
                      <TableCell sx={{ color: item.clr, fontWeight: 'bold' }}>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        
            <Table size="small" sx={{ mb: 5 }}>

              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '8%' }} />
                  <TableCell style={{ width: '46%' }} colSpan={2}>
                    Суммы из выгруженного ОФД
                  </TableCell>
                  <TableCell style={{ width: '46%' }} colSpan={2}>
                    Суммы из системы ШЕФ
                  </TableCell>
                  <TableCell style={{ width: 48 }} />
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow hover  onClick={(e) => { e.stopPropagation(); this.toggleSummary(); }} sx={{ cursor: 'pointer' }}>

                  <TableCell style={{ width: '8%', fontWeight: 'bold' }}>Даты</TableCell>
            
                  <TableCell style={{ width: '23%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>Наличные за период:</Typography>
                      <Typography sx={{ fontWeight: 'bold', color: colorAllCash }}>
                        {formatNumber(summ_ofd?.all_cash ?? 0)} ₽
                      </Typography>

                      <DiffButton
                        visible={colorAllCash === 'red'}
                        onClick={this.openMismatch}
                        ctx={{
                          scope: 'period',
                          label: 'Наличные (период)',
                          ofd: summ_ofd?.all_cash,
                          chef: summ_chef?.all_cash,
                          smena_list: '',
                          comment: '',
                        }}
                        canEdit={canEdit}
                      />

                      <Tooltip title="Количество чеков" arrow>
                        <Chip
                          label={formatNumber(summ_ofd?.count_cash_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell style={{ width: '23%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>Безнал за период:</Typography>
                      <Typography sx={{ fontWeight: 'bold', color: colorAllBank }}>
                        {formatNumber(summ_ofd?.all_bank ?? 0)} ₽
                      </Typography>

                      <DiffButton
                        visible={colorAllBank === 'red'}
                        onClick={this.openMismatch}
                        ctx={{
                          scope: 'period',
                          label: 'Безнал (период)',
                          ofd: summ_ofd?.all_bank,
                          chef: summ_chef?.all_bank,
                          smena_list: '',
                          comment: '',
                        }}
                        canEdit={canEdit}
                      />

                      <Tooltip title="Количество чеков" arrow>
                        <Chip
                          label={formatNumber(summ_ofd?.count_bank_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>
              
                  <TableCell style={{ width: '23%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>Наличные за период:</Typography>
                      <Typography sx={{ fontWeight: 'bold', color: colorAllCash }}>
                        {formatNumber(summ_chef?.all_cash ?? 0)} ₽
                      </Typography>
                      <Tooltip title="Количество чеков" arrow>
                        <Chip
                          label={formatNumber(summ_chef?.count_cash_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>
            
                  <TableCell style={{ width: '23%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>Безнал за период:</Typography>
                      <Typography sx={{ fontWeight: 'bold', color: colorAllBank }}>
                        {formatNumber(summ_chef?.all_bank ?? 0)} ₽
                      </Typography>
                      <Tooltip title="Количество чеков" arrow>
                        <Chip
                          label={formatNumber(summ_chef?.count_bank_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell
                    style={{ width: 48 }}
                    align='left'
                  >
                    <ExpandMoreIcon
                      style={{
                        display: 'flex',
                        transform: openSummary ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </TableCell>

                </TableRow>
              </TableBody>

            </Table>
            
            {openSummary && kassTotals.length > 0 && (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '7%', borderRight: '1px solid #ccc' }}>Касса</TableCell>
                      <TableCell style={{ width: '22%' }}>Наличные за период</TableCell>
                      <TableCell style={{ width: '22%', borderRight: '1px solid #ccc' }}>Безнал за период</TableCell>
                      <TableCell style={{ width: '23%' }}>Наличные за период</TableCell>
                      <TableCell style={{ width: '23%' }}>Безнал за период</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kassTotals.map(({ kassaId, ofdTotal, chefTotal }) => {
                      const colCash = getColor(ofdTotal.summ_cash, chefTotal.summ_cash, ofdTotal.color);
                      const colBank = getColor(ofdTotal.summ_bank, chefTotal.summ_bank, ofdTotal.color);
                      return (
                        <TableRow key={`tot-${kassaId}`}>
                          <TableCell style={{ borderRight: '1px solid #ccc' }}>
                            {`${kassaId}${kassaId === 2 ? ' (онлайн)' : ''}`}
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ color: colCash }}>
                                {formatNumber(ofdTotal?.summ_cash ?? 0)} ₽
                              </Typography>
                              <DiffButton
                                visible={colCash === 'red'}
                                onClick={this.openMismatch}
                                ctx={{
                                  scope: 'kassa_total',
                                  kassaId,
                                  label: 'Наличные (период по кассе)',
                                  ofd: ofdTotal?.summ_cash,
                                  chef: chefTotal?.summ_cash,
                                  smena_list: '',
                                  comment: '',
                                }}
                                canEdit={canEdit}
                              />
                              <Tooltip title="Количество чеков" arrow>
                                <Chip
                                  label={formatNumber(ofdTotal?.count_cash_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell style={{ borderRight: '1px solid #ccc' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ color: colBank }}>
                                {formatNumber(ofdTotal?.summ_bank ?? 0)} ₽
                              </Typography>
                              <DiffButton
                                visible={colBank === 'red'}
                                onClick={this.openMismatch}
                                ctx={{
                                  scope: 'kassa_total',
                                  kassaId,
                                  label: 'Безнал (период по кассе)',
                                  ofd: ofdTotal?.summ_bank,
                                  chef: chefTotal?.summ_bank,
                                  smena_list: '',
                                  comment: '',
                                }}
                                canEdit={canEdit}
                              />
                              <Tooltip title="Количество чеков" arrow>
                                <Chip
                                  label={formatNumber(ofdTotal?.count_bank_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ color: colCash }}>
                                {formatNumber(chefTotal?.summ_cash ?? 0)} ₽
                              </Typography>
                              <Tooltip title="Количество чеков" arrow>
                                <Chip
                                  label={formatNumber(chefTotal?.count_cash_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ color: colBank }}>
                                {formatNumber(chefTotal?.summ_bank ?? 0)} ₽
                              </Typography>
                              <Tooltip title="Количество чеков" arrow>
                                <Chip
                                  label={formatNumber(chefTotal?.count_bank_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Table size="small">
              <TableBody>
                {daysMerged.map(({ date, ofdDay, chefDay, kassas }) => {
                  const colorCashDay = getColor(ofdDay?.summ_cash, chefDay?.summ_cash, ofdDay?.color);
                  const colorBankDay = getColor(ofdDay?.summ_bank, chefDay?.summ_bank, ofdDay?.color);

                  const hasCommentForDate = [
                    ...(ofdDay?.kass ?? []),
                    ...(chefDay?.kass ?? []),
                  ].some(k => typeof k?.comment === 'string' && k.comment.trim().length > 0);

                  return (
                    <React.Fragment key={date}>
                      <TableRow hover onClick={() => this.toggleRow(date)} style={{ cursor: 'pointer' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatDateReverse(date)}</TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>Наличные за день:</Typography>
                            <Typography sx={{ fontWeight: 'bold', color: colorCashDay }}>
                              {formatNumber(ofdDay?.summ_cash ?? 0)} ₽
                            </Typography>
                            <DiffButton
                              visible={colorCashDay === 'red'}
                              onClick={this.openMismatch}
                              ctx={{
                                scope: 'day',
                                date,
                                label: 'Наличные (день)',
                                ofd: ofdDay?.summ_cash,
                                chef: chefDay?.summ_cash,
                                smena_list: '',
                                comment: '',
                                hasComment: hasCommentForDate,
                              }}
                              canEdit={canEdit}
                            />
                            <Tooltip title="Количество чеков" arrow>
                              <Chip
                                label={formatNumber(ofdDay?.count_cash_checks ?? 0)}
                                size="small"
                                sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>Безнал за день:</Typography>
                            <Typography sx={{ fontWeight: 'bold', color: colorBankDay }}>
                              {formatNumber(ofdDay?.summ_bank ?? 0)} ₽
                            </Typography>
                            <DiffButton
                              visible={colorBankDay === 'red'}
                              onClick={this.openMismatch}
                              ctx={{
                                scope: 'day',
                                date,
                                label: 'Безнал (день)',
                                ofd: ofdDay?.summ_bank,
                                chef: chefDay?.summ_bank,
                                smena_list: ofdDay?.smena_list || '',
                                comment: '',
                                hasComment: hasCommentForDate,
                              }}
                              canEdit={canEdit}
                            />
                            <Tooltip title="Количество чеков" arrow>
                              <Chip
                                label={formatNumber(ofdDay?.count_bank_checks ?? 0)}
                                size="small"
                                sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>Наличные за день:</Typography>
                            <Typography sx={{ fontWeight: 'bold', color: colorCashDay }}>
                              {formatNumber(chefDay?.summ_cash ?? 0)} ₽
                            </Typography>
                            <Tooltip title="Количество чеков" arrow>
                              <Chip
                                label={formatNumber(chefDay?.count_cash_checks ?? 0)}
                                size="small"
                                sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>Безнал за день:</Typography>
                            <Typography sx={{ fontWeight: 'bold', color: colorBankDay }}>
                              {formatNumber(chefDay?.summ_bank ?? 0)} ₽
                            </Typography>
                            <Tooltip title="Количество чеков" arrow>
                              <Chip
                                label={formatNumber(chefDay?.count_bank_checks ?? 0)}
                                size="small"
                                sx={{ ml: 1, fontWeight: 500, cursor: 'default' }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell style={{ width: 48 }} align="center">
                          <ExpandMoreIcon
                            style={{
                              display: 'flex',
                              transform: openRows[date] ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                            }}
                          />
                        </TableCell>
                      </TableRow>

                      {openRows[date] && (
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <TableContainer component={Paper} sx={{ mt: 3, mb: 3 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{ width: '7%', borderRight: '1px solid #ccc' }}>Касса</TableCell>
                                    <TableCell style={{ width: '22%' }}>Наличные</TableCell>
                                    <TableCell style={{ width: '22%', borderRight: '1px solid #ccc' }}>
                                      Безнал
                                    </TableCell>
                                    <TableCell style={{ width: '23%' }}>Наличные</TableCell>
                                    <TableCell style={{ width: '23%' }}>Безнал</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {kassas.map(({ kassaId, ofdKassa = {}, chefKassa = {} }) => {

                                    const colCash = getColor(ofdKassa.summ_cash, chefKassa.summ_cash, ofdKassa.color);
                                    const colBank = getColor(ofdKassa.summ_bank, chefKassa.summ_bank, ofdKassa.color);

                                    return (
                                      <TableRow key={kassaId}>
                                        <TableCell style={{ borderRight: '1px solid #ccc' }}>
                                          {`${kassaId}${kassaId === 2 ? ' (онлайн)' : ''}`}
                                        </TableCell>

                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: colCash }}>
                                              {formatNumber(ofdKassa.summ_cash ?? 0)} ₽
                                            </Typography>
                                            <DiffButton
                                              visible={colCash === 'red'}
                                              onClick={this.openMismatch}
                                              ctx={{
                                                scope: 'kassa_day',
                                                date,
                                                kassaId,
                                                label: 'Наличные (касса/день)',
                                                ofd: ofdKassa.summ_cash,
                                                chef: chefKassa.summ_cash,
                                                smena_list: ofdKassa?.smena_list || '', 
                                                comment: ofdKassa?.comment || '',
                                              }}
                                              canEdit={canEdit}
                                            />
                                            <Tooltip title="Количество чеков" arrow>
                                              <Chip
                                                label={formatNumber(ofdKassa.count_cash_checks ?? 0)}
                                                size="small"
                                                sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                              />
                                            </Tooltip>
                                          </Box>
                                        </TableCell>

                                        <TableCell style={{ borderRight: '1px solid #ccc' }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: colBank }}>
                                              {formatNumber(ofdKassa.summ_bank ?? 0)} ₽
                                            </Typography>
                                            <DiffButton
                                              visible={colBank === 'red'}
                                              onClick={this.openMismatch}
                                              ctx={{
                                                scope: 'kassa_day',
                                                date,
                                                kassaId,
                                                label: 'Безнал (касса/день)',
                                                ofd: ofdKassa.summ_bank,
                                                chef: chefKassa.summ_bank,
                                                smena_list: ofdKassa?.smena_list || '', 
                                                comment: ofdKassa?.comment || '',
                                              }}
                                              canEdit={canEdit}
                                            />
                                            <Tooltip title="Количество чеков" arrow>
                                              <Chip
                                                label={formatNumber(ofdKassa.count_bank_checks ?? 0)}
                                                size="small"
                                                sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                              />
                                            </Tooltip>
                                          </Box>
                                        </TableCell>

                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: colCash }}>
                                              {formatNumber(chefKassa.summ_cash ?? 0)} ₽
                                            </Typography>
                                            <Tooltip title="Количество чеков" arrow>
                                              <Chip
                                                label={formatNumber(chefKassa.count_cash_checks ?? 0)}
                                                size="small"
                                                sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                              />
                                            </Tooltip>
                                          </Box>
                                        </TableCell>

                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: colBank }}>
                                              {formatNumber(chefKassa.summ_bank ?? 0)} ₽
                                            </Typography>
                                            <Tooltip title="Количество чеков" arrow>
                                              <Chip
                                                label={formatNumber(chefKassa.count_bank_checks ?? 0)}
                                                size="small"
                                                sx={{ ml: 1, fontWeight: 400, cursor: 'default' }}
                                              />
                                            </Tooltip>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

          </AccordionDetails>
        </Accordion>

        {/* Модалка по ошибкам (расхождение сумм ОФД и ШЕФ) */}
        <Dialog open={mismatchOpen} onClose={this.closeMismatch} maxWidth="md" fullWidth>
          <DialogTitle>Расхождение сумм</DialogTitle>
          <DialogContent dividers>
            {(() => {
              const c = mismatchCtx || {};
              const nOfd  = Number(c.ofd)  || 0;
              const nChef = Number(c.chef) || 0;
              const diff  = nOfd - nChef;
              const smenaList = (typeof c.smena_list === 'string' ? c.smena_list : '').trim();
              const num = v => Number(v) || 0;
      
              let dayCommentRows = [];
              if (c.scope === 'day') {
                const ofdDay  = (summ_ofd?.days  ?? []).find(d => d.date === c.date) || {};
                const chefDay = (summ_chef?.days ?? []).find(d => d.date === c.date) || {};

                (ofdDay?.kass ?? []).forEach(ofdK => {
                  const id  = Number(ofdK?.kassa);
                  const txt = (ofdK?.comment ?? '').trim();
                  if (!id || !txt) return;

                  const chfK = (chefDay?.kass ?? []).find(k => Number(k.kassa) === id) || {};
                  const cashMismatch = num(ofdK?.summ_cash) !== num(chfK?.summ_cash);
                  const bankMismatch = num(ofdK?.summ_bank) !== num(chfK?.summ_bank);

                  if (cashMismatch) dayCommentRows.push({ kassa: id, payType: 'Наличные', comment: txt });
                  if (bankMismatch) dayCommentRows.push({ kassa: id, payType: 'Безнал',   comment: txt });
                });

                const order = { 'Наличные': 1, 'Безнал': 2 };
                dayCommentRows.sort((a, b) => (a.kassa - b.kassa) || (order[a.payType] - order[b.payType]));
              }

              return (
                <>
                  {c.date && (
                    <Typography sx={{ mb: 0.5 }}>
                      Дата: <b>{typeof formatDateReverse === 'function' ? formatDateReverse(c.date) : c.date}</b>
                    </Typography>
                  )}
                  {c.kassaId != null && (
                    <Typography sx={{ mb: 0.5 }}>
                      Касса: <b>{c.kassaId}</b>
                    </Typography>
                  )}
                  {smenaList && (
                    <Typography sx={{ mb: 0.5 }}>
                      Смена: <b>{smenaList}</b>
                    </Typography>
                  )}
                  {c.label && (
                    <Typography sx={{ mb: 1 }}>
                      Показатель: <b>{c.label}</b>
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography>ОФД: <b>{formatNumber ? formatNumber(nOfd) : nOfd} ₽</b></Typography>
                    <Typography>ШЕФ: <b>{formatNumber ? formatNumber(nChef) : nChef} ₽</b></Typography>
                    <Typography sx={{ mt: 1 }}>
                      Разница: <b>{formatNumber ? formatNumber(diff) : diff} ₽</b>
                    </Typography>
                  </Box>

                  {c.scope === 'day' && dayCommentRows.length > 0 && (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3}>Комментарии:</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ width: '18%' }}>Касса</TableCell>
                            <TableCell sx={{ width: '22%' }}>Тип оплаты</TableCell>
                            <TableCell>Комментарий</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dayCommentRows.map((row, idx) => (
                            <TableRow key={`${row.kassa}-${row.payType}-${idx}`}>
                              <TableCell>{`${row.kassa}${row.kassa === 2 ? ' (онлайн)' : ''}`}</TableCell>
                              <TableCell>{row.payType}</TableCell>
                              <TableCell>
                                <Typography sx={{ whiteSpace: 'pre-line' }}>
                                  {row.comment}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {c.scope === 'kassa_day' && (
                    <Box sx={{ mt: 2 }}>
                      <MyTextInput
                        label="Комментарий"
                        value={comment}
                        func={this.handleCommentChange}
                        multiline
                        maxRows={6}
                        disabled={!canEdit}
                        className={!canEdit ? 'disabled_input' : undefined}
                      />
                    </Box>
                  )}
                </>
              );
            })()}
          </DialogContent>

          <DialogActions>
            {mismatchCtx?.scope === 'kassa_day' && canEdit && (
              <Button onClick={this.saveComment} variant="contained" color="success">
                Сохранить
              </Button>
            )}
            <Button onClick={this.closeMismatch} variant="contained">Закрыть</Button>
          </DialogActions>
        </Dialog>

      </Box>
    );
  }
}

class CheckCheck_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order_id: '',
      type_pay: '',
      confirmDialog: false,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.orders) {
      return;
    }

    if (this.props.orders !== prevProps.orders) {
      this.setState({
        orders: this.props.orders,
      });
    }
  }

  openConfirm = (order_id, type_pay) => {
    this.setState({
      confirmDialog: true,
      order_id,
      type_pay
    });
  }

  save = () => {
    this.setState ({
      confirmDialog: false
    });

    this.props.saveOrder(this.props.order?.id, this.state.order_id, this.state.type_pay, this.props.order?.summ_check);

    this.onClose();
  }

  onClose = () => {
    this.setState({
      orders: [],
      confirmDialog: false,
      order_id: '',
      type_pay: '',
    });

    this.props.onClose();
  }

  render() {

    const { orders, confirmDialog } = this.state;
    const { order, open, fullScreen } = this.props;

    return (
      <>
        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>Сохранить данные выбранного заказа ?</DialogContent>
          <DialogActions>
            <Button autoFocus variant="contained" onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button variant="contained" color='success' onClick={this.save}>Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          onClose={this.onClose}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'lg'}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: 'bold' }}>Выбрать из списка подходящий заказ</Typography>
            <IconButton onClick={this.onClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>

            <Grid item xs={12} sm={6} display="flex" flexDirection="column" marginBottom={2}>
              <Grid display="flex" flexDirection="row">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: 2 }}>Дата/Время заказа:</Typography>
                <Typography sx={{ whiteSpace: 'nowrap' }}>{order?.date} {order?.time}</Typography>
              </Grid>

              <Grid display="flex" flexDirection="row">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: 2 }}>Сумма заказа:</Typography>
                <Typography sx={{ whiteSpace: 'nowrap' }}>{formatNumber(order?.summ_check ?? 0)} ₽</Typography>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={6}>Список заказов</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Номер заказа</TableCell>
                    <TableCell>Тип заказа</TableCell>
                    <TableCell>Дата/Время заказа</TableCell>
                    <TableCell>Сумма заказа</TableCell>
                    <TableCell>Выбрать</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.order_type}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{formatNumber(item.summ_check ?? 0)} ₽</TableCell>
                      <TableCell>
                        <IconButton title={'Сохранить'} onClick={()=>this.openConfirm(item.id, item.type_pay)}>
                          <ArchiveIcon sx={{ color: '#c03' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </DialogContent>

          <DialogActions>
            <Button variant="contained" onClick={this.onClose}>
              Закрыть
            </Button>
          </DialogActions>

        </Dialog>
      </>
    );
  }
}

class CheckCheck_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'check_check',
      module_name: '',
      is_load: false,

      points: [],
      kass: [],

      date_start: dayjs(),
      date_end: dayjs(),

      point_id: '',
      kassa: [],

      openAlert: false,
      err_status: true,
      err_text: '',

      complete_data: [],
      summ_ofd: null,
      summ_chef: null,

      order: null,
      modalOrder: false,
      fullScreen: false,
      orders: [],

      isAccordionOpen: false,
      confirmDialog: false,
      unfisc_online_orders: null,

      acces: null,
      needsRefresh: true,   
      need_upload: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      kass: data.kass,
      points: data.points,
      module_name: data.module_info.name,
      acces: data.acces,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
        
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then(result => result.data)
      .finally( () => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  }

  handleResize = () => {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  };

  changeDateRange = (field, newDate) => {
    this.setState({ [field]: newDate, needsRefresh: true });
  };

  changeSort = (type, event) => {
    this.setState({
      [type]: event.target.value,
      needsRefresh: true
    });
  };

  changeKass = (data, event, value) => {
    this.setState({
      [data]: value,
      needsRefresh: true
    });
  }

  check_data() {
    let { date_start, date_end, point_id, kassa, points } = this.state;

    if (!date_start || !date_end || !point_id || !Array.isArray(kassa) || kassa.length === 0) {
      this.openAlert(false, 'Необходимо заполнить даты начала и конца, указать точку и выбрать кассу');
      return null;
    }

    const formattedStart = dayjs(date_start).format('YYYY-MM-DD');
    const formattedEnd = dayjs(date_end).format('YYYY-MM-DD');

    const point = points.find(it => parseInt(it.id, 10) === parseInt(point_id, 10));

    return {
      date_start: formattedStart,
      date_end: formattedEnd,
      point,
      kassa,
    };
  }

  getOrders = async () => {
    const data = this.check_data();
    if (!data) return;
    
    if (Number(this.state.acces?.check_access) === 1) {
      data.acces = 'check';
    }

    const res = await this.getData('get_orders', data);

    if (!res.st) {

      this.openAlert(false, res.text);

    } else {

      this.setState({
        complete_data: res.complete_data,
        summ_ofd: res.summ_ofd,
        summ_chef: res.summ_chef,
        unfisc_online_orders: res.unfisc_online_orders,
        needsRefresh: false,   
        need_upload: false
      });

    }

  };

  openModal = async (summ, date, order) => {
    this.handleResize();

    const { point_id, points } = this.state;

    const point = points.find(it => parseInt(it.id) === parseInt(point_id));

    const data = {
      summ,
      point,
      date,
    };

    const res = await this.getData('find_order', data);

    this.setState({
      modalOrder: true,
      orders: res.orders,
      order,
    });
  };

  saveOrder = async (id, order_id, type_pay, summ) => {

    const { point_id, points } = this.state;
    const point = points.find(it => parseInt(it.id) === parseInt(point_id));
    const type = parseInt(type_pay) === 1 ? 'sum_cash' : 'sum_bank';

    const data = {
      id,
      order_id,
      point,
      type,
      summ
    };

    const res = await this.getData('save_order', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }

  }

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });
  };

  handleAccordionChange = (event, isExpanded) => {
    this.setState({ isAccordionOpen: isExpanded });
  };

  set_orders = async () => {
    if (this.state.needsRefresh) {
      this.openAlert(false, 'Параметры изменились. Нажмите «Показать».');
      return;
    }

    const data = this.check_data();
    if (!data) return;

    const res = await this.getData('set_orders', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }
  };

  check_data_for_1C = async () => {
    if (this.state.needsRefresh) {
      this.openAlert(false, 'Параметры изменились. Нажмите «Показать».');
      return;
    }

    const data = this.check_data();
    if (!data) return;

    const res = await this.getData('check_data_1C', data);

    if(res.st) { 

      this.setState({
        confirmDialog: true,
        need_upload: res.need_upload,
      });

    } else {

      this.openAlert(res.st, res.text);

    }

  };

  upload_data_1C = async (type) => {

    this.setState({
      confirmDialog: false,
    });

    const data = this.check_data();
    if (!data) return;

    data.type = type;      

    const res = await this.getData('upload_data_1C', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }

  };

  save_comment = async (data) => {

    data.point_id = this.state.point_id;

    const res = await this.getData('save_err_comment', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }

  };

  render() {
    const { is_load, openAlert, err_status, err_text, modalOrder, fullScreen, orders, module_name, date_start, date_end, points, kass, point_id, kassa, complete_data, order, summ_ofd, summ_chef, confirmDialog, unfisc_online_orders, acces, needsRefresh, need_upload } = this.state;

    const canAct = summ_ofd != null && summ_chef != null && !needsRefresh;

    const text_primary = need_upload ? "Выгрузить данные в 1C" : "Все равно выгрузить данные в 1С (возможны дубли!)";

    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 600 } }}
          maxWidth="md"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false, need_upload: false })}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Выберите действие
            </Typography>
          </DialogTitle>
          <DialogContent>
            <List>
              {Number(acces?.upload_access) === 1 &&
                <ListItemButton
                  onClick={() => this.upload_data_1C('export')}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'primary.lighter' }
                  }}
                >
                  <ListItemText
                    primary={text_primary}
                    primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
                  />
                </ListItemButton>
              }
              {Number(acces?.clear_access) === 1 &&
                <ListItemButton
                  onClick={() => this.upload_data_1C('clear')}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'primary.lighter' }
                  }}
                >
                  <ListItemText
                    primary="Очистить данные по выбранным параметрам в 1С и после выгрузить данные в 1С"
                    primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
                  />
                </ListItemButton>
              }
              {Number(acces?.clear_export_access) === 1 &&
                <ListItemButton
                  onClick={() => this.upload_data_1C('clear_export')}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'primary.lighter' }
                  }}
                >
                  <ListItemText
                    primary="Очистить ВСЕ данные по выбранной точке в 1С и после выгрузить данные в 1С"
                    primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
                  />
                </ListItemButton>
              }
              {Number(acces?.all_clear_access) === 1 &&
                <ListItemButton
                  onClick={() => this.upload_data_1C('all_clear')}
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'primary.lighter' }
                  }}
                >
                  <ListItemText
                    primary="Очистить ВСЕ данные по выбранной точке в 1С"
                    primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
                  />
                </ListItemButton>
              }
            </List>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
          </DialogActions>
        </Dialog>

        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />

        <CheckCheck_Modal
          open={modalOrder}
          onClose={() => this.setState({ modalOrder: false, orders: [], order: null })}
          fullScreen={fullScreen}
          orders={orders}
          order={order}
          saveOrder={this.saveOrder}
        />
       
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Начало периода"
              value={date_start}
              func={newDate => this.changeDateRange('date_start', newDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Конец периода"
              value={date_end}
              func={newDate => this.changeDateRange('date_end', newDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MySelect
              label="Точка"
              is_none={false}
              data={points}
              value={point_id}
              func={event => this.changeSort('point_id', event)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Касса"
              multiple={true}
              data={kass}
              value={kassa}
              func={(event, value) => this.changeKass('kassa', event, value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button onClick={this.getOrders} variant="contained">
                Показать
              </Button>

              {needsRefresh && (
                <Tooltip
                  title={
                    <span style={{ fontSize: '18px', lineHeight: 1.5 }}>
                      Нажмите «Показать», чтобы обновить данные.
                    </span>
                  }
                  placement="right"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: '18px',
                        maxWidth: 600,
                        p: '10px',
                        whiteSpace: 'normal',
                        bgcolor: '#333',
                        color: '#fff',
                      },
                    },
                    arrow: {
                      sx: { color: '#333' },
                    },
                  }}
                >
                  <HelpIcon sx={{ color: '#c03' }} />
                </Tooltip>
              )}

            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            {Number(acces?.check_access) === 1 ? (
              <Button
                onClick={this.set_orders}
                sx={{ whiteSpace: 'nowrap' }}
                color="success"
                variant={canAct ? "contained" : "outlined"}
                disabled={!canAct}
              >
                Расставить номера заказов / суммы
              </Button>
            ) : Number(acces?.upload_access) === 1 ? (
              <Button
                onClick={this.check_data_for_1C}
                variant={canAct ? "contained" : "outlined"}
                disabled={!canAct}
                color="info"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Выгрузить в 1С
              </Button>
            ) : null}
          </Grid>

          {Number(acces?.check_access) === 1 && Number(acces?.upload_access) === 1 && (
            <Grid item xs={12} sm={3} container justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              <Button
                onClick={this.check_data_for_1C}
                variant={canAct ? "contained" : "outlined"}
                disabled={!canAct}
                color="info"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Выгрузить в 1С
              </Button>
            </Grid>
          )}

          {complete_data?.length > 0 && Number(acces?.check_access) === 1 &&
            <Grid item xs={12} sm={12} mb={summ_ofd ? 0 : 5}>
              <Accordion
                style={{ width: '100%' }}
                expanded={complete_data.length > 100 ? false : this.state.isAccordionOpen}
                onChange={complete_data.length > 100 ? undefined : this.handleAccordionChange}
                disabled={complete_data.length > 100}
              >
                <AccordionSummary expandIcon={complete_data.length > 100 ? null : <ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Проверка на заполненность данных
                    </Typography>
                    <Tooltip title="Количество заказов" arrow>
                      <Chip label={complete_data.length} color="primary" size="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                {complete_data.length <= 100 &&
                  <AccordionDetails>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Номер заказа</TableCell>
                          <TableCell>Номер кассы</TableCell>
                          <TableCell>Сумма заказа</TableCell>
                          <TableCell>Дата / время</TableCell>
                          <TableCell>Найти заказ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {complete_data.map((it, k) =>
                          <TableRow hover key={k}>
                            <TableCell>{k + 1}</TableCell>
                            <TableCell>{it.id}</TableCell>
                            <TableCell>{it.kassa}</TableCell>
                            <TableCell>{formatNumber(it.summ_check ?? 0)} ₽</TableCell>
                            <TableCell>{it.date} {it.time}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => this.openModal(it.summ_check, it.date, it)}>
                                <ReceiptLongIcon sx={{ color: '#c03' }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                }
              </Accordion>
            </Grid>
          }

          {unfisc_online_orders?.length > 0 && Number(acces?.check_access) === 1 &&
            <Grid item xs={12} sm={12}>
              <CheckCheck_Accordion_online
                orders={unfisc_online_orders}
              />
            </Grid>
          }

          {summ_ofd && summ_chef &&
            <Grid item xs={12} sm={12} mb={5}>
              <CheckCheck_Accordion
                summ_ofd={summ_ofd}
                summ_chef={summ_chef}
                save_comment={this.save_comment}
                acces_comment={acces.comment_access}
              />
            </Grid>
          }
         
        </Grid>
      </>
    );
  }
}

export default function CheckCheck() {
  return <CheckCheck_ />;
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
