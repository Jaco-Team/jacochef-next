import React from "react";
import {
	MyAutocomplite,
	MyCheckBox,
	MyDatePickerNew,
	MySelect,
	MyTextInput,
	MyTimePicker
} from "@/components/shared/Forms";
import dayjs from "dayjs";
import {api_laravel, api_laravel_local} from "@/src/api_new";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import DatePicker from "react-multi-date-picker";
import {formatDate} from "@/src/helpers/ui/formatDate";

class MyDatePicker extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<>
				<Typography>{this.props.label}</Typography>
				<DatePicker
					format="YYYY-MM-DD"
					multiple
					sort
					style={{width: '100%'}}
					label={this.props.label}
					value={this.props.value}
					onChange={this.props.func}
				/>
			</>
		)
	}
}

function formatDateDot(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [day, month, year].join('.');
}

function formatDateName(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	//if (month.length < 2)
	//    month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	let m = '';

	switch (parseInt(month)) {
		case 1: {
			m = 'Января';
			break;
		}
		case 2: {
			m = 'Февраля';
			break;
		}
		case 3: {
			m = 'Марта';
			break;
		}
		case 4: {
			m = 'Апреля';
			break;
		}
		case 5: {
			m = 'Мая';
			break;
		}
		case 6: {
			m = 'Июня';
			break;
		}
		case 7: {
			m = 'Июля';
			break;
		}
		case 8: {
			m = 'Августа';
			break;
		}
		case 9: {
			m = 'Сентября';
			break;
		}
		case 10: {
			m = 'Октября';
			break;
		}
		case 11: {
			m = 'Ноября';
			break;
		}
		case 12: {
			m = 'Декабря';
			break;
		}
	}

	return [day, m].join(' ');
}

export class PromoEdit extends React.Component {
	click = false;

	constructor(props) {
		super(props);

		this.state = {
			module: 'site_sale_2',
			module_name: '',
			access: {},
			is_load: false,
			modalText: '',

			points: [],
			point: 0,
			cities: [],
			city: 0,

			modalDialog: false,
			modalLink: '',

			where_promo_list: [
				{id: 1, name: 'Создать'},
				{id: 2, name: 'Создать и показать'},
				{id: 3, name: 'Отправить на почту'},
				{id: 4, name: 'Отправить в смс'},
				{id: 5, name: 'Рассылка смс'},
				{id: 6, name: 'Отправить в ЛК (через 8)'},
				{id: 7, name: 'Создать сертификат(ы)'},
			],
			promo_action_list: [],
			sale_list: [
				{id: 1, name: 'На товары'},
				{id: 2, name: 'На категории'},
				{id: 3, name: 'На все меню (кроме допов и закусок)'},
				{id: 7, name: 'На все меню'},
			],
			promo_conditions_list: [
				{id: 1, name: 'В корзине есть определенные товар(ы)'},
				{id: 2, name: 'В корзине набрана определенная сумма'},
			],
			promo_sale_list: [],
			type_sale_list: [
				{id: 1, name: 'В рублях'},
				{id: 2, name: 'В процентах'},
			],
			date_promo_list: [
				{id: 1, name: 'В определенные даты'},
				{id: 2, name: '14 дней с 10:00 до 21:40'},
				{id: 3, name: '14 дней с 00:00 до 23:59'},
				{id: 4, name: '30 дней с 10:00 до 21:40'},
				{id: 5, name: '30 дней с 00:00 до 23:59'},
			],
			type_order_list: [
				{id: 1, name: 'Все'},
				{id: 3, name: 'Доставка'},
				{id: 2, name: 'Самовывоз'},
				{id: 4, name: 'Зал'},
			],
			where_order_list: [
				{id: 1, name: 'В городе'},
				{id: 2, name: 'На точке'}
			],

			auto_text: false,
			where_promo: 1,
			promo_name: '',
			generate_new: false,
			count_action: 1,
			promo_action: 1,
			type_sale: 3,
			promo_sale: 1,
			sale_type: 2,
			promo_conditions: 2,

			price_start: 0,
			price_end: 0,
			date_promo: 1,

			date_start: formatDate(new Date()),
			date_end: formatDate(new Date()),
			rangeDate: [formatDate(new Date()), formatDate(new Date())],
			time_start: '10:00',
			time_end: '21:30',

			promo_length: 5,
			promo_count: 1,

			day_1: true,
			day_2: true,
			day_3: true,
			day_4: true,
			day_5: true,
			day_6: true,
			day_7: true,

			type_order: 1,
			where_order: 1,

			numberList: '',
			promo_desc_true: '',
			promo_desc_false: '',
			textSMS: '',


			addItem: 1,
			addItemCount: 1,
			addItemPrice: 1,
			addItemAllPrice: 0,

			itemsAdd: [],
			itemsAddPrice: [],
			items: [],
			cats: [],
			saleCat: [],
			saleItem: [],

			priceItem: 1,

			conditionItems: [],

			testDate: [],

			for_new: false,
			once_number: false,
			for_registred: false,

			created: '',
			diff_ent: {},

			for_number: false,
			for_number_text: '',
		};
	}

	componentDidMount() {
		let items = [];

    if( this.props.promo_conditions_items.length > 4 ){
      this.props.promo_conditions_items = JSON.parse(this.props.promo_conditions_items, true);

      this.props.promo_conditions_items.map( (item) => {
        let findItem = this.props.items.find( (it) => parseInt(it.id) == parseInt(item) );

        items.push(findItem)
      } )
    }
		if (this.props.promo_double.date1) {
			let original_promo = {
        promo_action: this.props.promo_action_list.find( (item) => parseInt(item.id) == parseInt(this.props.promo.promo_action))?.id,
        promo_sale: this.props.promo_sale_list.find( (item) => parseInt(item.name) == parseInt(this.props.promo.count_promo))?.id,
        itemsAdd: JSON.parse(this.props.promo.promo__items) ? JSON.parse(this.props.promo.promo__items) : [],
        itemsAddPrice: JSON.parse(this.props.promo.add_items_on_price) ? JSON.parse(this.props.promo.add_items_on_price) : [],
        date_start: dayjs(this.props.promo.date1),
        date_end: dayjs(this.props.promo.date2),
        time_start: this.props.promo.time1,
        time_end: this.props.promo.time2,
				promo_desc_false: this.props.promo.condition_text,
				promo_desc_true: this.props.promo.coment,
        rangeDate: [dayjs(this.props.promo.date1), dayjs(this.props.promo.date2)],
        day_1: parseInt(this.props.promo.d1) == 1 ? true : false,
        day_2: parseInt(this.props.promo.d2) == 1 ? true : false,
        day_3: parseInt(this.props.promo.d3) == 1 ? true : false,
        day_4: parseInt(this.props.promo.d4) == 1 ? true : false,
        day_5: parseInt(this.props.promo.d5) == 1 ? true : false,
        day_6: parseInt(this.props.promo.d6) == 1 ? true : false,
        day_7: parseInt(this.props.promo.d7) == 1 ? true : false,
        count_action: this.props.promo.count,
        promo_name: this.props.promo.name,
        price_start: this.props.promo.promo_summ,
        price_end: this.props.promo.promo_summ_to,
        point: this.props.promo.point_id,
        city: this.props.promo.city_id,
        where_order: parseInt(this.props.promo.city_id) > 0 ? 1 : parseInt(this.props.promo.point_id) > 0 ? 2 : 1,
        type_order: this.props.promo.type_order,
        promo_id: this.props.promo.id,
        for_new: parseInt(this.props.promo.only_first_order) == 1 ? true : false,
        once_number: parseInt(this.props.promo.once_number) == 1 ? true : false,
        for_registred: parseInt(this.props.promo.for_registred) == 1 ? true : false,
        for_number: parseInt(this.props.promo.for_number) == 1 ? true : false,
        for_number_text: this.props.promo.for_number_text,
		}

		let copy_promo = {
        promo_action: this.props.promo_action_list.find( (item) => parseInt(item.id) == parseInt(this.props.promo_double.promo_action))?.id,
        promo_sale: this.props.promo_sale_list.find( (item) => parseInt(item.name) == parseInt(this.props.promo_double.count_promo))?.id,
        itemsAdd: JSON.parse(this.props.promo_double.promo__items) ? JSON.parse(this.props.promo_double.promo__items) : [],
        itemsAddPrice: JSON.parse(this.props.promo_double.add_items_on_price) ? JSON.parse(this.props.promo_double.add_items_on_price) : [],
        date_start: dayjs(this.props.promo_double.date1),
        date_end: dayjs(this.props.promo_double.date2),
        time_start: this.props.promo_double.time1,
        time_end: this.props.promo_double.time2,
				promo_desc_false: this.props.promo_double.condition_text,
				promo_desc_true: this.props.promo_double.coment,
        rangeDate: [dayjs(this.props.promo_double.date1), dayjs(this.props.promo_double.date2)],
        day_1: parseInt(this.props.promo_double.d1) == 1 ? true : false,
        day_2: parseInt(this.props.promo_double.d2) == 1 ? true : false,
        day_3: parseInt(this.props.promo_double.d3) == 1 ? true : false,
        day_4: parseInt(this.props.promo_double.d4) == 1 ? true : false,
        day_5: parseInt(this.props.promo_double.d5) == 1 ? true : false,
        day_6: parseInt(this.props.promo_double.d6) == 1 ? true : false,
        day_7: parseInt(this.props.promo_double.d7) == 1 ? true : false,
        count_action: this.props.promo_double.count,
        promo_name: this.props.promo_double.name,
        price_start: this.props.promo_double.promo_summ,
        price_end: this.props.promo_double.promo_summ_to,
        point: this.props.promo_double.point_id,
        city: this.props.promo_double.city_id,
        where_order: parseInt(this.props.promo_double.city_id) > 0 ? 1 : parseInt(this.props.promo_double.point_id) > 0 ? 2 : 1,
        type_order: this.props.promo_double.type_order,
        promo_id: this.props.promo_double.id,
        for_new: parseInt(this.props.promo_double.only_first_order) == 1 ? true : false,
        once_number: parseInt(this.props.promo_double.once_number) == 1 ? true : false,
        for_registred: parseInt(this.props.promo_double.for_registred) == 1 ? true : false,
        for_number: parseInt(this.props.promo_double.for_number) == 1 ? true : false,
        for_number_text: this.props.promo_double.for_number_text,
		}
		const d1 = Object.entries(copy_promo);
		const diffEntries = [];
		Object.entries(original_promo).map(([key, value], index) => {
			if (value !== d1[index][1]) {
				if (Array.isArray(d1[index][1])) {
					if (value.length !== d1[index][1].length) {
						diffEntries.push([key, {current: JSON.stringify(value), undo: JSON.stringify(d1[index][1])}]);
					}
				} else {
					if (key === 'date_start' || key === 'date_end') {
						if (dayjs(value).format("HH:mm") !== dayjs(d1[index][1]).format("HH:mm")) {
							diffEntries.push([key, {current: value, undo: d1[index][1]}]);
						}
					} else {
						diffEntries.push([key, {current: value, undo: d1[index][1]}]);
					}
				}
			}
		})
		this.setState({
			diff_ent: Object.fromEntries(diffEntries),
		});
		}

		this.setState({
				cities: this.props.cities,
				points:this.props.points,
        promo_action_list: this.props.promo_action_list,
        promo_action: this.props.promo_action_list.find( (item) => parseInt(item.id) == parseInt(this.props.promo.promo_action))?.id,
        promo_sale_list: this.props.promo_sale_list,
        promo_sale: this.props.promo_sale_list.find( (item) => parseInt(item.name) == parseInt(this.props.promo.count_promo))?.id,
        type_sale: this.props.promo.promo_type_sale,
        itemsAdd: JSON.parse(this.props.promo.promo__items) ? JSON.parse(this.props.promo.promo__items) : [],
        itemsAddPrice: JSON.parse(this.props.promo.add_items_on_price) ? JSON.parse(this.props.promo.add_items_on_price) : [],
        date_start: dayjs(this.props.promo.date1),
        date_end: dayjs(this.props.promo.date2),
        time_start: this.props.promo.time1,
        time_end: this.props.promo.time2,
				promo_desc_false: this.props.promo.condition_text,
				promo_desc_true: this.props.promo.coment,
        rangeDate: [dayjs(this.props.promo.date1), dayjs(this.props.promo.date2)],

        items: this.props.items,
        cats: this.props.cats,

        day_1: parseInt(this.props.promo.d1) == 1 ? true : false,
        day_2: parseInt(this.props.promo.d2) == 1 ? true : false,
        day_3: parseInt(this.props.promo.d3) == 1 ? true : false,
        day_4: parseInt(this.props.promo.d4) == 1 ? true : false,
        day_5: parseInt(this.props.promo.d5) == 1 ? true : false,
        day_6: parseInt(this.props.promo.d6) == 1 ? true : false,
        day_7: parseInt(this.props.promo.d7) == 1 ? true : false,

        count_action: this.props.promo.count,
        promo_name: this.props.promo.name,

        price_start: this.props.promo.promo_summ,
        price_end: this.props.promo.promo_summ_to,

        conditionItems: items,
        promo_conditions: items.length > 0 ? 1 : 2,

        point: this.props.promo.point_id,
        city: this.props.promo.city_id,

        where_order: parseInt(this.props.promo.city_id) > 0 ? 1 : parseInt(this.props.promo.point_id) > 0 ? 2 : 1,

        type_order: this.props.promo.type_order,

        promo_id: this.props.promo.id,

        for_new: parseInt(this.props.promo.only_first_order) == 1 ? true : false,
        once_number: parseInt(this.props.promo.once_number) == 1 ? true : false,
        for_registred: parseInt(this.props.promo.for_registred) == 1 ? true : false,

        created: this.props.created,

        for_number: parseInt(this.props.promo.for_number) == 1 ? true : false,
        for_number_text: this.props.promo.for_number_text,
      })
	}

	diffUndo = (key) => {
		if (this.state.diff_ent[key]) {
			return 'highlighted-field'; // возвращаем имя класса
		} else {
			return '';
		}
	}

	render() {
		return (
			<Dialog
				open={this.props.modalDialogEdit}
				onClose={this.props.onClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				maxWidth={'xl'}
			>
				<DialogTitle id="alert-dialog-title">Редактирование {this.props.promoName}</DialogTitle>
				<DialogContent>
					<>
						<Backdrop style={{zIndex: 99}} open={this.state.is_load}>
							<CircularProgress color="inherit"/>
						</Backdrop>
						<Grid container style={{marginTop: '80px', paddingLeft: '24px'}}>
							<Grid container direction="row" justifyContent="start" style={{paddingTop: 20}} spacing={3}>
								<Grid
									size={{
										xs: 12
									}}>
									<Typography>Был создан: {this.state.created}</Typography>
								</Grid>
							</Grid>

							<Grid container direction="row" justifyContent="start" style={{paddingTop: 20}} spacing={3}>

								<Grid
									size={{
										xs: 12,
										sm: 3
									}}>
									<Typography>Промокод: {this.state.promo_name}</Typography>
								</Grid>
								<Grid
									className={this.diffUndo('count_action')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyTextInput value={this.state.count_action} disabled={true} label='Количество активаций'/>
								</Grid>
								<Grid
									className={this.diffUndo('promo_count')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyTextInput value={this.state.promo_count} disabled={true} label='Количество промокодов'/>
								</Grid>

							</Grid>

							<Grid container direction="column" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('for_new')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyCheckBox value={this.state.for_new} disabled={true} label='Для новых клиентов ( на первый заказ )'/>
								</Grid>
								<Grid
									className={this.diffUndo('once_number')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyCheckBox value={this.state.once_number} disabled={true} label='1 раз на номер телефона'/>
								</Grid>
								<Grid
									className={this.diffUndo('for_registred')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyCheckBox value={this.state.for_registred} disabled={true} label='Только для зарегистрированных клиентов'/>
								</Grid>
								<Grid
									className={this.diffUndo('for_number')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyCheckBox value={this.state.for_number} disabled={true} label='Привязан к номеру телефона'/>
								</Grid>

							</Grid>

							<Grid container style={{paddingTop: 20}} spacing={3}>

								{this.state.for_number && <Grid
									className={this.diffUndo('for_number_text')}
									size={{
										xs: 3
									}}>
									<MyTextInput value={this.state.for_number_text} disabled={true} label='Номер телефона'/>
								</Grid>}

							</Grid>

							<Divider style={{width: '100%', marginTop: 20}}/>

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('promo_action')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MySelect data={this.state.promo_action_list} disabled={true} value={this.state.promo_action} label='Промокод дает:'/>
								</Grid>

							</Grid>

							{parseInt(this.state.promo_action) !== 1 ? null :
								<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

									<Grid
										className={this.diffUndo('type_sale')}
										size={{
											xs: 12,
											sm: 3
										}}>
										<MySelect data={this.state.sale_list} disabled={true} value={this.state.type_sale} label='Скидка'/>
									</Grid>

									{parseInt(this.state.type_sale) !== 1 ? null :
										<Grid
											className={this.diffUndo('saleItem')}
											size={{
												xs: 12,
												sm: 9
											}}>
											<MyAutocomplite data={this.state.items} disabled={true} value={this.state.saleItem} multiple={true} label='Товары'/>
										</Grid>
									}

									{parseInt(this.state.type_sale) !== 2 ? null :
										<Grid
											className={this.diffUndo('saleCat')}
											size={{
												xs: 12,
												sm: 9
											}}>
											<MyAutocomplite data={this.state.cats} disabled={true} value={this.state.saleCat} multiple={true} label='Категории'/>
										</Grid>
									}
									{parseInt(this.state.sale_type) == 1 ?
										<Grid
											className={this.diffUndo('promo_sale')}
											size={{
												xs: 12,
												sm: 3
											}}>
											<MyTextInput value={this.state.promo_sale} disabled={true} label='Размер скидки'/>
										</Grid>
										:
										<Grid
											className={this.diffUndo('promo_sale')}
											size={{
												xs: 12,
												sm: 3
											}}>
											<MySelect data={this.state.promo_sale_list} disabled={true} value={this.state.promo_sale}  label='Размер скидки'/>
										</Grid>
									}

									<Grid
										className={this.diffUndo('sale_type')}
										size={{
											xs: 12,
											sm: 3
										}}>
										<MySelect data={this.state.type_sale_list} disabled={true} value={this.state.sale_type} label='Какая скидка'/>
									</Grid>

								</Grid>
							}

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('promo_conditions')}
									size={{
										xs: 12,
										sm: 4
									}}>
									<MySelect data={this.state.promo_conditions_list} disabled={true} value={this.state.promo_conditions} label='Условие'/>
								</Grid>

								{parseInt(this.state.promo_conditions) !== 1 ? null :
									<Grid
										className={this.diffUndo('conditionItems')}
										size={{
											xs: 12,
											sm: 8
										}}>
										<MyAutocomplite data={this.state.items} disabled={true} value={this.state.conditionItems} multiple={true} label='Товары'/>
									</Grid>
								}

								{parseInt(this.state.promo_conditions) !== 2 ? null :
									<>
										<Grid
											className={this.diffUndo('price_start')}
											size={{
												xs: 12,
												sm: 4
											}}>
											<MyTextInput value={this.state.price_start} disabled={true} label='Сумма от'/>
										</Grid>

										<Grid
											className={this.diffUndo('price_end')}
											size={{
												xs: 12,
												sm: 4
											}}>
											<MyTextInput value={this.state.price_end} disabled={true} label='Сумма до'/>
										</Grid>
									</>
								}

							</Grid>

							<Divider style={{width: '100%', marginTop: 20}}/>

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('date_promo')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MySelect data={this.state.date_promo_list} disabled={true} value={this.state.date_promo} label='Когда работает промокод'/>
								</Grid>

							</Grid>

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('date_start')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyDatePickerNew label="Дата от" value={this.state.date_start} disabled={true}/>
								</Grid>
								<Grid
									className={this.diffUndo('date_end')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyDatePickerNew label="Дата до" value={this.state.date_end} disabled={true}/>
								</Grid>

								<Grid
									className={this.diffUndo('time_start')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyTimePicker label="Время от" value={this.state.time_start} disabled={true}/>
								</Grid>

								<Grid
									className={this.diffUndo('time_end')}
									size={{
										xs: 12,
										sm: 3
									}}>
									<MyTimePicker label="Время до" value={this.state.time_end} disabled={true}/>
								</Grid>

							</Grid>

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>
								<Grid
									className={this.diffUndo('testDate')}
									size={{
										xs: 12,
										sm: 12
									}}>
									<MyDatePicker multiple={false} label={'Кроме дат'} disabled={true} value={this.state.testDate}/>
								</Grid>
							</Grid>

							<Grid  container direction="row" justifyContent="center" style={{marginTop: 20}} spacing={3}>

								<MyCheckBox value={this.state.day_1} disabled={true} label='Понедельник'/>

								<MyCheckBox value={this.state.day_2} disabled={true} label='Вторник'/>

								<MyCheckBox value={this.state.day_3} disabled={true} label='Среда'/>

								<MyCheckBox value={this.state.day_4} disabled={true} label='Четверг'/>

								<MyCheckBox value={this.state.day_5} disabled={true} label='Пятница'/>

								<MyCheckBox value={this.state.day_6} disabled={true} label='Суббота'/>

								<MyCheckBox value={this.state.day_7} disabled={true} label='Воскресенье'/>

							</Grid>

							<Divider style={{width: '100%', marginTop: 20}}/>

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('type_order')}
									size={{
										xs: 12,
										sm: 4
									}}>
									<MySelect data={this.state.type_order_list} disabled={true} value={this.state.type_order} label='Тип заказа'/>
								</Grid>
								<Grid
									className={this.diffUndo('where_order')}
									size={{
										xs: 12,
										sm: 4
									}}>
									<MySelect data={this.state.where_order_list} disabled={true} value={this.state.where_order} label='Где работает'/>
								</Grid>
								{parseInt(this.state.where_order) !== 1 ? null :
									<Grid
										className={this.diffUndo('city')}
										size={{
											xs: 12,
											sm: 4
										}}>
										<MySelect data={this.state.cities} disabled={true} value={this.state.city} label='Город'/>
									</Grid>
								}
								{parseInt(this.state.where_order) !== 2 ? null :
									<Grid
										className={this.diffUndo('point')}
										size={{
											xs: 12,
											sm: 4
										}}>
										<MySelect data={this.state.points} disabled={true} value={this.state.point} label='Точка'/>
									</Grid>
								}

							</Grid>

							<Divider style={{width: '100%', marginTop: 20}}/>

							<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>

								<Grid
									className={this.diffUndo('auto_text')}
									size={{
										xs: 12,
										sm: 12
									}}>
									<MyCheckBox value={this.state.auto_text} disabled={true} label='Авто-текст'/>
								</Grid>

								<Grid
									className={this.diffUndo('promo_desc_true')}
									size={{
										xs: 12,
										sm: 12
									}}>
									<MyTextInput value={this.state.promo_desc_true} disabled={true} label='Описание промокода после активации (Промокод дает: )'/>
								</Grid>

								<Grid
									className={this.diffUndo('promo_desc_false')}
									size={{
										xs: 12,
										sm: 12
									}}>
									<MyTextInput value={this.state.promo_desc_false} disabled={true} label='Условие промокода, когда условия не соблюдены'/>
								</Grid>

							</Grid>


						</Grid>
					</>
				</DialogContent>
				<DialogActions>
					<Button color="primary" onClick={() => {
						this.props.onClose()
					}}>Закрыть</Button>
				</DialogActions>
			</Dialog>
		);
	}
}
