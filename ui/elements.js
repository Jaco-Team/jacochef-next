import React, {useEffect} from 'react';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import TextField from '@mui/material/TextField';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import Stack from '@mui/material/Stack';

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

import Typography from '@mui/material/Typography';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import { Editor } from '@tinymce/tinymce-react';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export function formatDate(date) {
  return dayjs(date)
  /*var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  return [year, month, day].join('-');*/
}

export function formatDateReverse(date) {
  if( date == '0000-00-00' ){
    return '';
  }
  return dayjs(date).format('DD-MM-YYYY');
}

export function formatDateMax(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),

      hour = d.getHours(),
      min = d.getMinutes();

  console.log( d, date, hour, min )

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  if (hour.length < 2)
    hour = '0' + hour;
  if (min.length < 2)
    min = '0' + min;

  return ([year, month, day].join('-')) + ' ' + ([hour, min].join(':'));
}

export function formatDateMin(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      year = d.getFullYear();

  if (month.length < 2)
      month = '0' + month;


  return [year, month].join('-');
}

export class MyAutocomplite extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <Stack spacing={3}>
        <Autocomplete
          size="small"
          disableCloseOnSelect={this.props.disableCloseOnSelect ?? true}
          // freeSolo
          // multiple={true}
          disabled={ this.props.disabled || this.props.disabled === true ? true : false }
          id={ this.props.id ?? null }
          options={this.props.data ?? []}
          getOptionLabel={(option) => option?.name || ''}
          disableClearable={this.props.disableClearable}
          getOptionKey={this.props.getOptionKey}
          value={this.props.value}
          onChange={this.props.func}
          onBlur={this.props.onBlur || undefined}
          filterSelectedOptions
          multiple={ this.props.multiple && this.props.multiple === true ? true : false }
          isOptionEqualToValue={this.props.isOptionEqualToValue || ((option, value) => parseInt(option?.id) === parseInt(value?.id)) }
          renderInput={this.props.renderInput || ((params) => (
            <TextField
              {...params}
              label={this.props.label}
              placeholder={this.props.placeholder}
            />
          ))}
          renderOption={(props, option) => (
            <li {...props} key={this.props.optionKey ? option[`${this.props.optionKey}`] : option.id}>
              {option.name}
            </li>
          )}
        />
      </Stack>
    )
  }
}
export class MyAutocomplite2 extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    if( this.props.id && this.props.id == 'promoName' ){
      return (
        <Stack spacing={3}>
          <Autocomplete
            freeSolo={ this.props.freeSolo ? this.props.freeSolo : false }
            size="small"
            disableCloseOnSelect={true}
            onBlur={this.props.onBlur ? this.props.onBlur : null}
            id={ this.props.id ?? null }
            options={this.props.data ?? []}
            getOptionLabel={(option) => option.name}
            value={this.props.value}
            onChange={this.props.func}
            //filterSelectedOptions
            disabled={ this.props.disabled && this.props.disabled === true ? true : false }
            multiple={ this.props.multiple && this.props.multiple === true ? true : false }
            //isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={this.props.label}
                placeholder={this.props.placeholder}
              />
            )}
          />
        </Stack>
      )
    }

    // для Управление точкой управляющего
    if( this.props.id && this.props.id == 'cafe_upr_edit' ){
      return (
        <Stack spacing={3}>
          <Autocomplete
            freeSolo={ this.props.freeSolo ? this.props.freeSolo : false }
            size="small"
            //disableCloseOnSelect={true}
            onBlur={this.props.onBlur ? this.props.onBlur : null}
            id={ this.props.id ?? null }

            options={this.props.data.map((option) => option.name)}

            value={this.props.value}
            onChange={this.props.func}
            filterSelectedOptions
            multiple={ this.props.multiple && this.props.multiple === true ? true : false }
            disabled={ this.props.disabled && this.props.disabled === true ? true : false }
            renderInput={(params) => (
              <TextField
                {...params}
                label={this.props.label}
                placeholder={this.props.placeholder}
              />
            )}
          />
        </Stack>
      )
    }

    //isOptionEqualToValue

    if( this.props.name && this.props.name == 'only_choose' ){
      return (
        <Stack spacing={3}>
          <Autocomplete
            freeSolo={ this.props.freeSolo ? this.props.freeSolo : false }
            size="small"
            //disableCloseOnSelect={true}
            onBlur={this.props.onBlur ? this.props.onBlur : null}
            id={ this.props.id ?? null }

            options={this.props.data.map((option) => option.name)}

            value={this.props.value}
            onChange={this.props.func}
            //filterSelectedOptions
            multiple={ this.props.multiple && this.props.multiple === true ? true : false }
            isOptionEqualToValue={(option, value) => option?.id === value?.id}

            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              //console.log( 'params', params )
              //console.log( 'filtered', filtered )

              const { inputValue } = params;
              // Suggest the creation of a new value
              const isExisting = options.some((option) => inputValue === option.name);
              /*if (inputValue !== '' && !isExisting) {
                filtered.push(
                  inputValue
                );
              }*/

              //console.log( 'new filtered', filtered )

              return filtered;
            }}
            disabled={ this.props.disabled && this.props.disabled === true ? true : false }
            renderInput={(params) => (
              <TextField
                {...params}
                label={this.props.label}
                placeholder={this.props.placeholder}
              />
            )}
          />
        </Stack>
      )
    }


    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={ this.props.freeSolo ? this.props.freeSolo : false }
          size="small"
          //disableCloseOnSelect={true}
          onBlur={this.props.onBlur ? this.props.onBlur : null}
          id={ this.props.id ?? null }

          options={this.props.data.map((option) => option.name)}

          value={this.props.value}
          onChange={this.props.func}
          //filterSelectedOptions
          multiple={ this.props.multiple && this.props.multiple === true ? true : false }
          //isOptionEqualToValue={(option, value) => option.id === value.id}

          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            //console.log( 'params', params )
            //console.log( 'filtered', filtered )

            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some((option) => inputValue === option.name);
            if (inputValue !== '' && !isExisting) {
              filtered.push(
                inputValue
              );
            }

            //console.log( 'new filtered', filtered )

            return filtered;
          }}
          disabled={ this.props.disabled && this.props.disabled === true ? true : false }
          renderInput={(params) => (
            <TextField
              {...params}
              label={this.props.label}
              placeholder={this.props.placeholder}
            />
          )}
        />
      </Stack>
    )
  }
}

export class MySelect extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <FormControl fullWidth variant="outlined" size="small" style={this.props.style}>
        <InputLabel>{this.props.label}</InputLabel>
        <Select
          value={this.props.value}
          label={this.props.label}
          disabled={ this.props.disabled || this.props.disabled === true ? true : false }
          onChange={ this.props.func }
          multiple={ this.props.multiple && this.props.multiple === true ? true : false }
          //style={{ zIndex: 9999 }}
        >
          {this.props.is_none === false ? null :
            <MenuItem value=""><em>None</em></MenuItem>
          }

          { this.props.data?.map( (item, key) =>
            <MenuItem key={key} value={item.id} style={{ color: item?.color ? item.color : null, zIndex: 9999 }}>{item.name}</MenuItem>
          ) }
        </Select>
      </FormControl>
    )
  }
}

export class MyTextInput extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      type: 'text'
    };
  }

  render(){
    return (
      <TextField
        id={ this.props.id ? this.props.id : null }
        label={this.props.label}
        value={this.props.value}
        onChange={this.props.func}
        onBlur={this.props.onBlur ? this.props.onBlur : null}
        disabled={ this.props.disabled || this.props.disabled === true ? true : false }
        variant="outlined"
        size={'small'}
        color='primary'
        multiline={this.props.multiline ? this.props.multiline : false}
        maxRows={this.props.maxRows ? this.props.maxRows : 1}
        type={ this.props.type ? this.props.type : this.state.type }
        min={ this.props.min ? this.props.min : 0 }
        style={{ width: '100%' }}
        onKeyUp={this.props.enter}
        InputProps={this.props.inputAdornment}
        inputProps={{ tabIndex: this.props.tabindex, ...(this.props.inputProps || {}) }}
        className={this.props.className}
        onWheel={this.props.onWheel ? this.props.onWheel : null}
      />
    )
  }
}

const inputProps = {
  step: 600,
};

export class MyTimePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      thisVal: ''
    };
  }

  onChange(event){
    this.setState({
      thisVal: event.target.value
    })
  }

  onBlur(){
    this.setState({
      thisVal: ''
    })

    this.props.onBlur();
  }

  render(){
    return (
      <TextField
        variant="outlined"
        size="small"
        color="primary"
        label={this.props.label}
        type="time"
        id={ this.props.id ? this.props.id : null }
        value={ this.props.func ? this.props.value : this.state.thisVal }
        style={{ width: '100%' }}
        onChange={this.props.func ? this.props.func : this.onChange.bind(this)}
        onBlur={this.props.onBlur ? this.onBlur.bind(this) : null}
        InputLabelProps={{
          shrink: true,
        }}
        step={600}
        inputProps={inputProps}
      />
    )
  }
}

export class MyDatePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <>
        <Typography>{this.props.label}</Typography>
        <DatePicker
          format="YYYY-MM-DD"

          multiple
          sort

          //mask="____/__/__"
          //multiple={ this.props.multiple && this.props.multiple === true ? true : false }
          //disableCloseOnSelect={true}
          //inputFormat="yyyy-MM-dd"
          style={{ width: '100%' }}
          label={this.props.label}
          value={this.props.value}
          onChange={this.props.func}
        />
      </>
    )
  }
}

export class MyDatePickerNew extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <DatePicker
          multiple={true}
          //mask="____-__-__"
          //format="YYYY-MM-DD"
          format={ this.props.format ?? "YYYY-MM-DD" }
          minDate={ this.props.minDate ? this.props.minDate : null }
          label={this.props.label}
          value={this.props.value ? dayjs(this.props.value) : null}
          disabled={ this.props.disabled || this.props.disabled === true ? true : false }
          onChange={this.props.func}
          onBlur={this.props.onBlur ? this.props.onBlur : null}
          className={'datePicker'}
          slotProps={{
            textField: { size: "small" },
            field: { clearable: this.props.clearable },
            actionBar: {
              actions: this.props.customActions ? ["clear", "accept"] : ["cancel", "accept"],
             },
          }}
          //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
        />
      </LocalizationProvider>
    )
  }
}

export class MyDateTimePickerNew extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <DateTimePicker
          multiple={true}
          views={['year', 'month', 'day', 'hours', 'minutes']}
          mask="____-__-__ __:__"
          format="YYYY-MM-DD HH:mm"
          minDate={ this.props.minDate ? this.props.minDate : null }
          label={this.props.label}
          value={this.props.value}
          disabled={ this.props.disabled || this.props.disabled === true ? true : false }
          //onChange={this.props.func}
          onBlur={this.props.onBlur ? this.props.onBlur : null}
          onAccept={this.props.func} // <-- Изменения применяются только при нажатии "OK"
          className={'datePicker'}
          slotProps={{
            textField: { size: "small" },
          }}
          //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
        />
      </LocalizationProvider>
    )
  }
}

export class MyDatePickerNewViews extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <DatePicker
          className={'datePicker'}
          //multiple={true}
          //mask="____-__"
          //inputFormat="yyyy-MM"
          minDate={ this.props.minDate ? this.props.minDate : null }
          label={this.props.label}
          value={dayjs(this.props.value)}
          views={this.props.views}
          onChange={this.props.func}
          onBlur={this.props.onBlur ? this.props.onBlur : null}
          size={'small'}
          style={{ width: '100%' }}
          //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
        />
      </LocalizationProvider>
    )
  }
}

export class MyDatePickerGraph extends React.PureComponent {
  constructor(props) {
    super(props);

    let data = this.props.year;
    data = data.split('-')

    this.state = {
      activeValue: formatDate(this.props.year+'-01'),
      minDate: new Date(data[0], parseInt(data[1])-1, 1),
      maxDate: new Date(data[0], parseInt(data[1]), 0),
      arr: []
    };
  }

  renderWeekPickerDay = (date, selectedDates, pickersDayProps) => {
    pickersDayProps['selected'] = false;
    pickersDayProps['aria-selected'] = false;

    let arr = this.state.arr;
    let res = arr.find( (item) => formatDate(item.date) == formatDate(date) );

    if( res ){
      return <PickersDay {...pickersDayProps} style={{ backgroundColor: 'yellow', color: 'red' }} onClick={ this.chooseDay.bind(this, date) } />;
    }

    return <PickersDay {...pickersDayProps} onClick={ this.chooseDay.bind(this, date) }  />;
  };

  chooseDay(newValue, event){

    let arr = this.state.arr;

    let res = arr.find( (item) => formatDate(item.date) == formatDate(newValue) );

    console.log( 'res', res )

    if( !res ){
      arr.push({
        date: formatDate(newValue),
        type: 1
      })

      this.setState({
        arr: arr
      })
    }else{
      let newArr = arr.filter( (item) => formatDate(item.date) != formatDate(newValue) );

      this.setState({
        arr: newArr
      })
    }
  }

  render(){
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <StaticDatePicker
          multiple={true}
          minDate={formatDate(this.state.minDate)}
          maxDate={formatDate(this.state.maxDate)}
          displayStaticWrapperAs="desktop"
          label="Week picker"

          //renderDay={this.props.renderWeekPickerDay}
          //renderInput={(params) => <TextField {...params} />}
          //inputFormat="yyyy-MM-dd"
          //onChange={ () => {} }

          slotProps={{ textField: { size: "small", multiple: true } }}
          value={this.state.activeValue}

          slots={{ day: (props) => this.props.renderWeekPickerDay(props)}}

        />
      </LocalizationProvider>
    )
  }
}

export class MyCheckBox extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    return (
      <FormGroup row style={ this.props.style ? this.props.style : {} }>
        <FormControlLabel
          control={
            <Checkbox
              disabled={ this.props.disabled || this.props.disabled === true ? true : false }
              checked={this.props.value}
              onChange={this.props.func}
              color="primary"
              size={this.props.size ? this.props.size : 'medium'}
            />
          }
          label={this.props.label}
        />
      </FormGroup>
    )
  }
}

//q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj - новый
//r0ihgs4ukfpmudzw7aexxgb88tnx5jw26h1xx9x6409ji3gx - старый
//q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj - еще более новый

export function TextEditor(props){

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root") !== null) {
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener("focusin", handler);
    return () => document.removeEventListener("focusin", handler);
  }, []);

  return (
    <Editor
      apiKey='q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj'
      value={props.value}
      disabled={props.disabled}
      onEditorChange={props.func}
      init={{
        height: 500,
        //menubar: false,
        language: 'ru',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | link image | code | fullscreen | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  )
}



export class TextEditor22 extends React.PureComponent {
  render(){
    return (
      <Editor
        apiKey='q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj'
        value={this.props.value}
        onEditorChange={this.props.func}
        onInit={(evt, editor) => this.props.refs_.current = editor}
        init={{
          height: 500,
          menubar: this.props?.menubar,
          language: 'ru',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: this.props?.toolbar ? 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image | code | fullscreen | help' : false,
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
    )
  }
}

export class TextEditor11 extends React.PureComponent {
  render(){
    return (
      <Editor
        apiKey = {'q3skq93mjg9kb2pusut1jjvqd15b8wncykg7tj0ke02dbipj'}
        value={this.props.value}
        onEditorChange={this.props.func}
        init={{
          height: 500,
          language: 'ru',
          //menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image | code | fullscreen | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
    )
  }
}

export class MyAlert extends React.Component {
  render(){
    return (
      <Snackbar
        open={this.props.isOpen}
        autoHideDuration={30000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={this.props.onClose}
      >
        <Alert
          onClose={this.props.onClose}
          severity={ this.props.status ? "success" : "error" }
          sx={{ width: '100%' }}
        >
          { this.props.status ? this.props.text ? this.props.text : 'Данные успешно сохранены!' : this.props.text }
        </Alert>
      </Snackbar>
    )
  }
}
