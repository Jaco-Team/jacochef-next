import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Tooltip from '@mui/material/Tooltip';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Collapse from '@mui/material/Collapse';

import {
	MyAlert,
	MyTextInput,
	MyAutocomplite,
	formatDate,
	MyDatePickerNew,
	MyCheckBox
} from '@/ui/elements';

import {ExlIcon} from '@/ui/icons';

import {api_laravel} from '@/src/api_new';
import dayjs from 'dayjs';
import SiteClientsOrdersByUtmTable from '@/components/site_clients/SiteClientsOrdersByUtmTable';
import SiteClientsOrdersBySourceTable from '@/components/site_clients/SiteClientsOrdersBySourceTable';
import SiteClientsTrafficBySourceTable from '@/components/site_clients/SiteClientsTrafficBySourceTable';
import SiteClientsTrafficSummaryTable from '@/components/site_clients/SiteClientsTrafficSummaryTable';

import SiteClients_Modal_Comment_Action from "@/components/site_clients/_SiteClientsModalCommentAction";
import SiteClients_Modal_Client_Order from "@/components/site_clients/_SiteClientsModalClientOrder";
import SiteClients_Modal_Client from "@/components/site_clients/_SiteClientsModalClient";
import Clients from "@/components/site_clients/_Clients";
import OrdersMore from "@/components/site_clients/_OrdersMore";

function TabPanel(props) {
	const {children, value, index, ...other} = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{p: 3}}>{children}</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}

class SiteClients_ extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			module: 'site_clients',
			module_name: '',
			is_load: false,

			acces: null,
			fullScreen: false,

			openAlert: false,
			err_status: true,
			err_text: '',

			activeTab: 0,
			activeTab_address: 0,

			search: '',
			clients: [],

			number: '',
			order: '',
			search_orders: [],
			addr: '',
			promo: '',

			cities: [],
			city_id: [],
			city_id_addr: [],
			city_id_traffic: [],

			all_items: [],
			items: [],

			date_start: formatDate(new Date()),
			date_end: formatDate(new Date()),

			date_start_addr: formatDate(new Date()),
			date_end_addr: formatDate(new Date()),

			date_start_traffic: formatDate(new Date()),
			date_end_traffic: formatDate(new Date()),

			modalDialog: false,
			client_login: '',
			client_id: '',
			client: null,
			orders: [],
			err_orders: [],
			comments: [],

			created: [],
			all_created: [
				{id: 1, name: 'Клиент'},
				{id: 2, name: 'Контакт-центр'},
				{id: 3, name: 'Кафе'},
			],

			days: [],
			months: [
				{'id': 1, 'name': "января"},
				{'id': 2, 'name': "февраля"},
				{'id': 3, 'name': "марта"},
				{'id': 4, 'name': "апреля"},
				{'id': 5, 'name': "мая"},
				{'id': 6, 'name': "июня"},
				{'id': 7, 'name': "июля"},
				{'id': 8, 'name': "августа"},
				{'id': 9, 'name': "сентября"},
				{'id': 10, 'name': "октября"},
				{'id': 11, 'name': "ноября"},
				{'id': 12, 'name': "декабря"},
			],

			modalDialog_order: false,
			showOrder: null,

			modalDialogAction: false,
			comment_id: null,

			login_sms: [],
			login_yandex: [],

			index_clients: -1,
			index_order_more: -1,
			index_search_clients: -1,
			index_orders: -1,
			index_address: -1,
			index_traffic: -1,
			tabs_data: [],

			address_list: '',
			orders_list: [],
			orders_list_addr: [],

			traffic_stats: [],
			traffic_sources: [],
			orders_by_source: [],
			orders_by_utm: [],

			select_toggle: 'city',
			points: [],
			point_id: [],

			promo_dr: false
		};
	}

	async componentDidMount() {
		const data = await this.getData('get_all');

		if (data) {
			this.setState({
				all_items: data.all_items,
				cities: data.cities,
				points: data.points,
				acces: data.acces,
				module_name: data.module_info.name
			});

			document.title = data.module_info.name;

			setTimeout(() => {
				this.getTabIndex();
			}, 100);

			this.handleResize();

		}

	}

	getData = (method, data = {}, dop_type = {}) => {
		this.setState({
			is_load: true,
		});

		let res = api_laravel(this.state.module, method, data, dop_type)
			.then(result => {

				if (method === 'export_file_xls') {
					return result;
				} else {
					return result.data;
				}

			})
			.finally(() => {
				setTimeout(() => {
					this.setState({
						is_load: false,
					});
				}, 500);
			});

		return res;
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

	getTabIndex() {
		const acces = this.state.acces;

		let tabs_data = [];

		for (let key in acces) {
			if (parseInt(acces[key])) {

				if (key === 'search_clients_access') {
					tabs_data.push({key, 'name': "Поиск клиента"});
				}

				if (key === 'search_orders_access') {
					tabs_data.push({key, 'name': "Поиск заказов"});
				}

				if (key === 'find_orders_more_access') {
					tabs_data.push({key, 'name': "Поиск заказов расширенный"});
				}

				if (key === 'find_clients_access') {
					tabs_data.push({key, 'name': "Поиск клиентов"});
				}

				if (key === 'search_address_access') {
					tabs_data.push({key, 'name': "Заказы по адресам"});
				}

				if (key === 'source_traffic_access') {
					tabs_data.push({key, 'name': "Аналитика по оформленным заказам"});
				}

			}
		}

		tabs_data.forEach((item, index) => {


			if (item.key === 'search_clients') {
				this.setState({
					index_clients: index
				});
			}

			if (item.key === 'find_orders_more') {
				this.setState({
					index_order_more: index
				});
			}

			if (item.key === 'find_clients') {
				this.setState({
					index_search_clients: index
				});
			}

			if (item.key === 'search_orders') {
				this.setState({
					index_orders: index
				});
			}

			if (item.key === 'search_address') {
				this.setState({
					index_address: index
				});
			}

			if (item.key === 'source_traffic') {
				this.setState({
					index_traffic: index
				});
			}

		});

		this.setState({
			tabs_data
		});

	}

	changeTab(event, val) {
		this.setState({
			activeTab: val
		})
	}

	changeTab_address(event, val) {
		this.setState({
			activeTab_address: val
		})

		this.getDataAddress();
	}

	changeInput(data, type, event) {

		if (type === 'clear') {

			this.setState({
				[data]: ''
			})

		} else {

			let value = event.target.value;

			this.setState({
				[data]: value
			});

		}

	}

	changeSearch(data, event) {

		if (data === 'clear') {

			this.setState({
				[data]: '',
				clients: []
			})

		} else {

			let login = event.target.value;

			this.setState({
				[data]: login
			});

		}

	}

	changeAutocomplite(data, event, value) {
		this.setState({
			[data]: value,
		});
	}

	changeDateRange(data, event) {
		this.setState({
			[data]: event ? event : ''
		});
	}

	get_data_request() {
		let {
			number,
			city_id,
			date_start,
			date_end,
			order,
			items,
			addr,
			promo,
			select_toggle,
			point_id,
			promo_dr,
			created
		} = this.state;

		if (select_toggle === 'city' && !city_id.length) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо выбрать город'
			});

			return null;

		}

		if (select_toggle === 'point') {

			if (!point_id.length) {

				this.setState({
					openAlert: true,
					err_status: false,
					err_text: 'Необходимо выбрать точку'
				});

				return null;

			}

			point_id = point_id.map(item => {
				const parts = item.name.split(',');
				return {
					...item,
					addr: parts.length > 1 ? parts.slice(1).join(',').trim() : item.name,
				};
			});

		}

		date_start = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
		date_end = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';

		if ((!date_start && !date_end) || !date_start || !date_end) {

			if (number.length > 0 || order.length > 0 || items.length > 0 || addr.length > 0 || promo.length > 0) {

			} else {
				this.setState({
					openAlert: true,
					err_status: false,
					err_text: 'Необходимо указать дату или что-то кроме нее'
				});

				return null;
			}
		}

		return {
			number,
			city_id,
			date_start,
			date_end,
			order,
			items,
			addr,
			promo,
			point_id,
			type: select_toggle,
			promo_dr: promo_dr == true ? 1 : 0,
			created
		};
	}

	async downLoad() {

		const data = this.get_data_request();

		if (!data) return;

		const dop_type = {
			responseType: 'blob',
		}

		const res = await this.getData('export_file_xls', data, dop_type);

		const url = window.URL.createObjectURL(new Blob([res]));
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "Таблица с заказами.xlsx");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	async getClients() {
		const search = this.state.search;

		if (!search || search.length < 4) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо указать минимум 4 цифры из номера телефона'
			});

			return;
		}

		const data = {
			search
		}

		const res = await this.getData('get_clients', data);

		if (res.st) {

			if (!res.clients.length) {

				this.setState({
					openAlert: true,
					err_status: false,
					err_text: 'Клиенты с таким номером не найдены'
				});

			}

			this.setState({
				clients: res.clients
			});

		} else {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});

		}

	}

	async getOrders() {

		const data = this.get_data_request();

		if (!data) return;

		const res = await this.getData('get_orders', data);

		if (res.search_orders.length) {

			this.setState({
				search_orders: res.search_orders
			});

		} else {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Заказы с заданными параметрами не найдены',
				search_orders: []
			});

		}

	}

	async openModalClient(login, type) {
		this.handleResize();

		const data = {
			login
		}

		const res = await this.getData('get_one_client', data);

		const days = Array.from({length: 31}, (_, i) => ({id: i + 1, name: i + 1}));

		if (res.client_info.date_bir) {
			const date = res.client_info.date_bir.split('-');

			const day = days.find(it => parseInt(it.id) == parseInt(date[2]));
			const month = this.state.months.find(it => parseInt(it.id) == parseInt(date[1]));

			if (day) {
				res.client_info.day = day.id;
			}

			if (month) {
				res.client_info.month = month.id;
			}

		}

		if (type === 'open') {
			this.setState({
				modalDialog: true,
			});
		}

		this.setState({
			client_id: res.client_info.id,
			client_login: login,
			client: res.client_info,
			orders: res.client_orders,
			err_orders: res.err_orders,
			comments: res.client_comments,
			login_sms: res.client_login_sms,
			login_yandex: res.client_login_yandex,
			days
		});

	}

	async openClientOrder(order_id, point_id) {
		this.handleResize();

		const data = {
			order_id,
			point_id
		};

		const res = await this.getData('get_one_order', data);

		this.setState({
			showOrder: res,
			modalDialog_order: true
		})
	}

	openSaveAction(comment_id) {
		this.setState({
			modalDialogAction: true,
			comment_id
		});
	}

	async saveEdit(data) {
		const res = await this.getData('save_edit_client', data);

		if (res.st) {

			const login = this.state.client_login;

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});

			this.openModalClient(login, 'update');

		} else {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});

		}
	}

	async saveComment(data) {
		const res = await this.getData('save_comment', data);

		if (res.st) {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
				comments: res.client_comments,
			});

		} else {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});

		}
	}

	async saveCommentAction(data) {
		const res = await this.getData('save_action', data);

		if (res.st) {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
				comments: res.client_comments,
				modalDialogAction: false
			});

		} else {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});

		}
	}

	async savePromo(percent) {
		const number = this.state.client_login;

		const data = {
			number,
			percent
		}

		await this.getData('save_promo', data);
	}

	async sendCode() {
		const number = this.state.client_login;
		const user_id = this.state.client_id;

		const data = {
			number,
			user_id
		}

		const res = await this.getData('get_code', data);

		if (res.st) {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
				login_sms: res.client_login_sms,
			});

		} else {

			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});

		}
	}

	changeAddressList(type, event) {
		const value = event.target.value;

		this.setState({
			[type]: value
		});
	}

	async getDataAddress() {
		const city_id = this.state.city_id_addr;
		let date_start = this.state.date_start_addr;
		let date_end = this.state.date_end_addr;
		let addresses = this.state.address_list;

		date_start = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
		date_end = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';

		if (!city_id.length) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо выбрать город'
			});

			return;
		}

		if ((!date_start && !date_end) || !date_start || !date_end) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо указать даты'
			});

			return;
		}

		if (!addresses) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо указать адреса'
			});

			return;
		}

		const data = {
			city_id,
			date_start,
			date_end,
			addresses,
		}

		const res = await this.getData('get_data_address', data);

		if (res.orders.length || res.addresses.length) {

			this.setState({
				orders_list: res.orders,
				orders_list_addr: res.addresses
			});

		} else {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Заказы с заданными параметрами не найдены',
				search_orders: []
			});

		}

	}

	async getDataTraffic() {
		const city_id = this.state.city_id_traffic.map(c => c.id);
		const date_start = dayjs(this.state.date_start_traffic)?.format('YYYY-MM-DD') || '';
		const date_end = dayjs(this.state.date_end_traffic)?.format('YYYY-MM-DD') || '';
		if (!city_id?.length) {
			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо выбрать город'
			});
			return;
		}
		if (!date_start || !date_end) {
			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо указать обе даты'
			});
			return;
		}

		const data = {
			city_id,
			date_start,
			date_end,
		}

		const res = await this.getData('get_traffic', data);

		if (res.st) {
			this.setState({
				traffic_stats: res.stats,
				traffic_sources: res.sources,
				orders_by_source: res.orders_by_source,
				orders_by_utm: res.orders_by_utm,
			});
		} else {
			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'За период нет статистики',
			});
		}

	}

	openAccordionAdrress(id) {

		const orders_list_addr = this.state.orders_list_addr;

		orders_list_addr.forEach(item => {
			if (parseInt(item.id) === parseInt(id)) {
				item.is_open = !item.is_open;
			} else {
				item.is_open = false;
			}
		});

		this.setState({
			orders_list_addr,
		});

	}

	handleToggleChange = (event, newSelection) => {
		if (newSelection !== null) {

			this.setState({
				select_toggle: newSelection,
			});

			if (newSelection === 'city') {
				this.setState({
					point_id: [],
				});
			}

			if (newSelection === 'point') {
				this.setState({
					city_id: [],
				});
			}

		}
	};

	changeDataCheck(type, event) {
		this.setState({
			[type]: event.target.checked
		})
	}

	render() {
		return (
			<>
				<Backdrop style={{zIndex: 99}} open={this.state.is_load}>
					<CircularProgress color="inherit"/>
				</Backdrop>

				<MyAlert
					isOpen={this.state.openAlert}
					onClose={() => this.setState({openAlert: false})}
					status={this.state.err_status}
					text={this.state.err_text}
				/>

				<SiteClients_Modal_Client
					open={this.state.modalDialog}
					onClose={() => this.setState({modalDialog: false, client: null, client_login: ''})}
					item={this.state.client}
					fullScreen={this.state.fullScreen}
					item_login={this.state.client_login}
					acces={this.state.acces}
					days={this.state.days}
					months={this.state.months}
					orders={this.state.orders}
					err_orders={this.state.err_orders}
					saveEdit={this.saveEdit.bind(this)}
					saveComment={this.saveComment.bind(this)}
					openClientOrder={this.openClientOrder.bind(this)}
					openSaveAction={this.openSaveAction.bind(this)}
					comments={this.state.comments}
					login_sms={this.state.login_sms}
					login_yandex={this.state.login_yandex}
					sendCode={this.sendCode.bind(this)}
				/>

				<SiteClients_Modal_Client_Order
					open={this.state.modalDialog_order}
					onClose={() => this.setState({modalDialog_order: false})}
					showOrder={this.state.showOrder}
					fullScreen={this.state.fullScreen}
				/>

				<SiteClients_Modal_Comment_Action
					open={this.state.modalDialogAction}
					onClose={() => this.setState({modalDialogAction: false, comment_id: null})}
					comment_id={this.state.comment_id}
					fullScreen={this.state.fullScreen}
					savePromo={this.savePromo.bind(this)}
					saveCommentAction={this.saveCommentAction.bind(this)}
					client_login={this.state.client_login}
				/>

				<Grid container spacing={3} mb={3} className='container_first_child'>

					<Grid item xs={12} sm={12}>
						<h1>{this.state.module_name}</h1>
					</Grid>

					<Grid item xs={12} sm={12} style={{paddingBottom: 24}}>
						<Paper>
							<Tabs
								value={this.state.activeTab}
								onChange={this.changeTab.bind(this)}
								variant={this.state.fullScreen ? 'scrollable' : 'fullWidth'}
								scrollButtons={false}
							>
								{this.state.tabs_data?.map((item, index) => {
									return <Tab label={item.name} {...a11yProps(index)} key={index} sx={{
										minWidth: "fit-content",
										flex: 1
									}}/>
								})}
							</Tabs>
						</Paper>
					</Grid>

					{/* Поиск клиента */}
					<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
						<TabPanel
							value={this.state.activeTab}
							index={this.state.index_clients}
							id='clients'
						>

							<Grid container spacing={3}>

								<Grid item xs={12} sm={6}>
									<MyTextInput
										type='number'
										className="input_login"
										label="Поиск по номеру телефона"
										value={this.state.search}
										func={this.changeSearch.bind(this, 'search')}
										inputAdornment={{
											endAdornment: (
												<>
													{!this.state.search ? null :
														<InputAdornment position="end">
															<IconButton>
																<ClearIcon onClick={this.changeSearch.bind(this, 'clear')}/>
															</IconButton>
														</InputAdornment>
													}
												</>
											)
										}}
									/>
								</Grid>

								<Grid item xs={12} sm={4}>
									<Button onClick={this.getClients.bind(this)} variant="contained">
										Показать
									</Button>
								</Grid>

								<Grid item xs={12} sm={12} mt={5}>
									<TableContainer sx={{maxHeight: {xs: 'none', sm: 570}}} component={Paper}>
										<Table stickyHeader size="small">
											<TableHead>
												<TableRow>
													<TableCell>#</TableCell>
													<TableCell>Имя</TableCell>
													<TableCell>Номер телефона</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{this.state.clients.map((item, key) =>
													<TableRow
														hover
														key={key}
														style={{cursor: 'pointer'}}
														onClick={this.openModalClient.bind(this, item.login, 'open')}
													>
														<TableCell>{key + 1}</TableCell>
														<TableCell>{item.name}</TableCell>
														<TableCell>{item.login}</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
								</Grid>
							</Grid>
						</TabPanel>
					</Grid>
					{/* Поиск клиента */}

					{/* Поиск заказов */}
					<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
						<TabPanel
							value={this.state.activeTab}
							index={this.state.index_orders}
							id='clients'
						>

							<Grid container spacing={3}>

								<Grid item xs={12} sm={12}>
									<ToggleButtonGroup
										value={this.state.select_toggle}
										exclusive
										onChange={this.handleToggleChange}
										sx={{
											display: 'flex',
											'& .MuiToggleButton-root': {
												fontSize: 16,
												textTransform: 'none',
												borderRadius: 0,
												px: 3,
												py: 0.5,
											},
											'& .MuiToggleButton-root:first-of-type': {
												borderTopLeftRadius: 4,
												borderBottomLeftRadius: 4,
											},
											'& .MuiToggleButton-root:last-of-type': {
												borderTopRightRadius: 4,
												borderBottomRightRadius: 4,
											},
											'& .MuiToggleButton-root.Mui-selected': {
												backgroundColor: 'primary.main',
												color: 'primary.contrastText',
												'&:hover': {
													backgroundColor: 'primary.dark',
												},
											},
										}}
									>
										<ToggleButton value="city">Город</ToggleButton>
										<ToggleButton value="point">Точка</ToggleButton>
									</ToggleButtonGroup>
								</Grid>

								<Grid item xs={12} sm={12}>
									{this.state.select_toggle === 'city' ?
										<MyAutocomplite
											label="Город"
											multiple={true}
											data={this.state.cities}
											value={this.state.city_id}
											func={this.changeAutocomplite.bind(this, 'city_id')}
										/>
										:
										<MyAutocomplite
											label="Точка"
											multiple={true}
											data={this.state.points}
											value={this.state.point_id}
											func={this.changeAutocomplite.bind(this, 'point_id')}
										/>
									}
								</Grid>

								<Grid item xs={12} sm={6}>
									<MyDatePickerNew
										label="Дата от"
										customActions={true}
										value={dayjs(this.state.date_start)}
										func={this.changeDateRange.bind(this, 'date_start')}
									/>
								</Grid>

								<Grid item xs={12} sm={6}>
									<MyDatePickerNew
										label="Дата до"
										customActions={true}
										value={dayjs(this.state.date_end)}
										func={this.changeDateRange.bind(this, 'date_end')}
									/>
								</Grid>

								<Grid item xs={12} sm={4}>
									<MyTextInput
										type='number'
										className="input_login"
										label="Номер заказа"
										value={this.state.order}
										func={this.changeInput.bind(this, 'order', 'edit')}
										inputAdornment={{
											endAdornment: (
												<>
													{!this.state.order ? null :
														<InputAdornment position="end">
															<IconButton>
																<ClearIcon onClick={this.changeInput.bind(this, 'order', 'clear')}/>
															</IconButton>
														</InputAdornment>
													}
												</>
											)
										}}
									/>
								</Grid>

								<Grid item xs={12} sm={4}>
									<MyTextInput
										type='number'
										className="input_login"
										label="Номер телефона"
										value={this.state.number}
										func={this.changeInput.bind(this, 'number', 'edit')}
										inputAdornment={{
											endAdornment: (
												<>
													{!this.state.number ? null :
														<InputAdornment position="end">
															<IconButton>
																<ClearIcon onClick={this.changeInput.bind(this, 'number', 'clear')}/>
															</IconButton>
														</InputAdornment>
													}
												</>
											)
										}}
									/>
								</Grid>

								<Grid item xs={12} sm={2}>
									<MyTextInput
										type='text'
										className="input_promo"
										label="Промокод"
										value={this.state.promo}
										func={this.changeInput.bind(this, 'promo', 'edit')}
										inputAdornment={{
											endAdornment: (
												<>
													{!this.state.number ? null :
														<InputAdornment position="end">
															<IconButton>
																<ClearIcon onClick={this.changeInput.bind(this, 'promo', 'clear')}/>
															</IconButton>
														</InputAdornment>
													}
												</>
											)
										}}
									/>
								</Grid>

								<Grid item xs={12} sm={2}>
									<MyCheckBox value={this.state.promo_dr} func={this.changeDataCheck.bind(this, 'promo_dr')} label='Промик на ДР'/>
								</Grid>

								<Grid item xs={12}>
									<MyTextInput
										className="input_login"
										label="Адрес клиента"
										value={this.state.addr}
										func={this.changeInput.bind(this, 'addr', 'edit')}
										inputAdornment={{
											endAdornment: (
												<>
													{!this.state.addr ? null :
														<InputAdornment position="end">
															<IconButton>
																<ClearIcon onClick={this.changeInput.bind(this, 'addr', 'clear')}/>
															</IconButton>
														</InputAdornment>
													}
												</>
											)
										}}
									/>
								</Grid>

								<Grid item xs={12} sm={3}>
									<MyAutocomplite
										label="Кто оформил"
										multiple={true}
										data={this.state.all_created}
										value={this.state.created}
										func={this.changeAutocomplite.bind(this, 'created')}
									/>
								</Grid>

								<Grid item xs={12} sm={5}>
									<MyAutocomplite
										label="Товары в заказе"
										multiple={true}
										data={this.state.all_items}
										value={this.state.items}
										func={this.changeAutocomplite.bind(this, 'items')}
									/>
								</Grid>


								<Grid item xs={12} sm={2}>
									<Button onClick={this.getOrders.bind(this)} variant="contained">
										Показать
									</Button>
								</Grid>

								{!parseInt(this.state.acces?.download_file_access) ? null :
									!this.state.search_orders.length ? null :
										<Grid item xs={12} sm={2} x={{display: 'flex', alignItems: 'center'}}>
											<Tooltip title={<Typography color="inherit">{'Скачать таблицу в Excel'}</Typography>}>
												<IconButton disableRipple sx={{padding: 0}} onClick={this.downLoad.bind(this)}>
													<ExlIcon/>
												</IconButton>
											</Tooltip>
										</Grid>
								}

							</Grid>

							<Grid item xs={12} sm={12} mt={5}>
								<TableContainer sx={{maxHeight: {xs: 'none', sm: 570}}} component={Paper}>
									<Table size={'small'} stickyHeader>
										<TableHead>
											<TableRow>
												<TableCell>#</TableCell>
												<TableCell>Заказ</TableCell>
												<TableCell>Точка</TableCell>
												<TableCell>Оформил</TableCell>
												<TableCell>Номер клиента</TableCell>
												<TableCell>Адрес доставки</TableCell>
												<TableCell>Время открытия заказа</TableCell>
												<TableCell>Ко времени</TableCell>
												<TableCell>Закрыт на кухне</TableCell>
												<TableCell>Получен клиентом</TableCell>
												<TableCell>Время обещ</TableCell>
												<TableCell>Тип</TableCell>
												<TableCell>Статус</TableCell>
												<TableCell>Сумма</TableCell>
												<TableCell>Оплата</TableCell>
												<TableCell>Водитель</TableCell>
											</TableRow>
										</TableHead>

										<TableBody>

											{this.state.search_orders.map((item, key) =>
												<TableRow
													hover
													key={key}
													style={parseInt(item.is_delete) == 1 ? {
														backgroundColor: 'red',
														color: '#fff',
														fontWeight: 'bold'
													} : {}}
													sx={{cursor: 'pointer'}}
													onClick={this.openClientOrder.bind(this, item.id, item.point_id)}
												>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{key + 1}</TableCell>
													<TableCell
														style={parseInt(item.dist) >= 0 ? {
															backgroundColor: 'yellow',
															color: '#000',
															cursor: 'pointer',
															fontWeight: 'inherit'
														} : {color: 'inherit', cursor: 'pointer', fontWeight: 'inherit'}}
													>
														{item.id}
													</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.point_addr}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.type_user}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.number}</TableCell>
													<TableCell style={{
														color: 'inherit',
														fontWeight: 'inherit'
													}}>{item.street} {item.home}</TableCell>
													<TableCell style={{
														color: 'inherit',
														fontWeight: 'inherit'
													}}>{item.date_time_order}</TableCell>
													<TableCell
														style={{
															color: 'inherit',
															fontWeight: 'inherit',
															backgroundColor: parseInt(item.is_preorder) == 1 ? '#bababa' : 'inherit'
														}}
													>
														{item.need_time}
													</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>
														{item.give_data_time == '00:00:00' ? '' : item.give_data_time}
													</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.close_order}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>
														{item.unix_time_to_client == '0' || parseInt(item.is_preorder) == 1 ? '' : item.unix_time_to_client}
													</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.type_order}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.status}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.order_price}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.type_pay}</TableCell>
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.driver}</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</Grid>

						</TabPanel>
					</Grid>
					{/* Поиск заказов */}

					{/* Заказы по адресам */}
					<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
						<TabPanel
							value={this.state.activeTab}
							index={this.state.index_address}
							id='clients'
						>
							<Grid container spacing={3}>

								<Grid item xs={12} sm={4}>
									<MyAutocomplite
										label="Город"
										multiple={true}
										data={this.state.cities}
										value={this.state.city_id_addr}
										func={this.changeAutocomplite.bind(this, 'city_id_addr')}
									/>
								</Grid>

								<Grid item xs={12} sm={4}>
									<MyDatePickerNew
										label="Дата от"
										customActions={true}
										value={dayjs(this.state.date_start_addr)}
										func={this.changeDateRange.bind(this, 'date_start_addr')}
									/>
								</Grid>

								<Grid item xs={12} sm={4}>
									<MyDatePickerNew
										label="Дата до"
										customActions={true}
										value={dayjs(this.state.date_end_addr)}
										func={this.changeDateRange.bind(this, 'date_end_addr')}
									/>
								</Grid>

								<Grid item xs={12} sm={8} style={{paddingRight: '20px'}}>
									<TextareaAutosize
										aria-label="empty textarea"
										placeholder=""
										minRows={8}
										value={this.state.address_list}
										onChange={this.changeAddressList.bind(this, 'address_list')}
										label="Список адресов"
										style={{
											width: '100%',
											padding: '10px',
											fontFamily: 'Arial, sans-serif',
											fontSize: '16px',
											borderRadius: '4px',
											borderColor: '#ccc',
											maxWidth: '100%',
											resize: 'vertical',
										}}
									/>
								</Grid>

								<Grid item xs={12} sm={2}>
									<Button onClick={this.getDataAddress.bind(this)} variant="contained">
										Показать
									</Button>
								</Grid>

								<Grid item xs={12} sm={12}>
									<Paper>
										<Tabs value={this.state.activeTab_address} onChange={this.changeTab_address.bind(this)} centered variant='fullWidth'>
											<Tab label="Список заказов" {...a11yProps(0)} />
											<Tab label="Список адресов" {...a11yProps(1)} />
										</Tabs>
									</Paper>
								</Grid>

								{/* Список заказов */}
								<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
									<TabPanel
										value={this.state.activeTab_address}
										index={0}
										id='clients'
									>
										<Grid container spacing={3}>
											<Grid item xs={12} sm={12} mt={3} mb={5}>
												<TableContainer sx={{maxHeight: {xs: 'none', sm: 570}}} component={Paper}>
													<Table size={'small'} stickyHeader>
														<TableHead>
															<TableRow>
																<TableCell>#</TableCell>
																<TableCell>ИД заказа</TableCell>
																<TableCell>Точка</TableCell>
																<TableCell>Номер клиента</TableCell>
																<TableCell>Адрес заказа</TableCell>
																<TableCell>Сумма заказа</TableCell>
															</TableRow>
														</TableHead>

														<TableBody>
															{this.state.orders_list.map((item, key) =>
																<TableRow
																	hover
																	key={key}
																	sx={{cursor: 'pointer', backgroundColor: item.is_new ? '#ffcc00' : 'inherit'}}
																	onClick={this.openClientOrder.bind(this, item.id, item.point_id)}
																>
																	<TableCell>{key + 1}</TableCell>
																	<TableCell>{item.id}</TableCell>
																	<TableCell>{item.point_addr}</TableCell>
																	<TableCell>{item.number}</TableCell>
																	<TableCell>{item.addr}</TableCell>
																	<TableCell>{new Intl.NumberFormat('ru-RU').format(item.order_price ?? 0)} ₽</TableCell>
																</TableRow>
															)}
														</TableBody>
													</Table>
												</TableContainer>
											</Grid>
										</Grid>
									</TabPanel>
								</Grid>
								{/* Список заказов */}

								{/* Список адресов */}
								<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
									<TabPanel
										value={this.state.activeTab_address}
										index={1}
										id='clients'
									>
										<Grid container spacing={3}>
											<Grid item xs={12} sm={12} mt={3} mb={5}>
												<TableContainer>
													<Table>
														<TableHead>
															<TableRow>
																<TableCell>#</TableCell>
																<TableCell>Адрес</TableCell>
																<TableCell>Количество заказов</TableCell>
																<TableCell>Сумма заказов</TableCell>
																<TableCell></TableCell>
															</TableRow>
														</TableHead>

														<TableBody>
															{this.state.orders_list_addr.map((item, key) => (
																<React.Fragment key={key}>
																	<TableRow hover onClick={this.openAccordionAdrress.bind(this, item.id)} style={{cursor: 'pointer'}}>
																		<TableCell>{key + 1}</TableCell>
																		<TableCell>{item.address}</TableCell>
																		<TableCell>{item.orders_count}</TableCell>
																		<TableCell>{new Intl.NumberFormat('ru-RU').format(item.total_amount ?? 0)} ₽</TableCell>
																		<TableCell>
																			<Tooltip title={
																				<Typography color="inherit">Все заказы по этому адресу</Typography>}>
																				<ExpandMoreIcon
																					style={{
																						display: 'flex',
																						transform: item.is_open ? 'rotate(180deg)' : 'rotate(0deg)'
																					}}
																				/>
																			</Tooltip>
																		</TableCell>
																	</TableRow>
																	<TableRow>
																		<TableCell style={{padding: 0}} colSpan={10}>
																			<Collapse in={item.is_open} timeout="auto" unmountOnExit>
																				<Box sx={{margin: '8px 0'}}>
																					<Table size={'small'} stickyHeader>
																						<TableHead>
																							<TableRow>
																								<TableCell>#</TableCell>
																								<TableCell>ИД заказа</TableCell>
																								<TableCell>Точка</TableCell>
																								<TableCell>Номер клиента</TableCell>
																								<TableCell>Адрес заказа</TableCell>
																								<TableCell>Сумма заказа</TableCell>
																							</TableRow>
																						</TableHead>

																						<TableBody>
																							{item.orders.map((it, k) =>
																								<TableRow
																									hover
																									key={k}
																									sx={{
																										cursor: 'pointer',
																										backgroundColor: it.is_new ? '#ffcc00' : 'inherit'
																									}}
																									onClick={this.openClientOrder.bind(this, it.id, it.point_id)}
																								>
																									<TableCell>{key + 1}</TableCell>
																									<TableCell>{it.id}</TableCell>
																									<TableCell>{it.point_addr}</TableCell>
																									<TableCell>{it.number}</TableCell>
																									<TableCell>{it.addr}</TableCell>
																									<TableCell>{new Intl.NumberFormat('ru-RU').format(it.order_price ?? 0)} ₽</TableCell>
																								</TableRow>
																							)}
																						</TableBody>
																					</Table>
																				</Box>
																			</Collapse>
																		</TableCell>
																	</TableRow>
																</React.Fragment>
															))}
														</TableBody>
													</Table>
												</TableContainer>
											</Grid>
										</Grid>
									</TabPanel>
								</Grid>
								{/* Список адресов */}

							</Grid>
						</TabPanel>
					</Grid>
					{/* Заказы по адресам */}

					{/* Поиск клиентов */}
					<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
						<TabPanel
							value={this.state.activeTab}
							index={this.state.index_search_clients}
							id='traffic'
						>
							<Clients/>
						</TabPanel>
					</Grid>
					{/* Поиск клиентов */}

					{/* Поиск заказов расширенный */}
					<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
						<TabPanel
							value={this.state.activeTab}
							index={this.state.index_order_more}
							id='traffic'
						>
							<OrdersMore/>
						</TabPanel>
					</Grid>
					{/* Поиск заказов расширенный */}

					{/* Аналитика по заказам */}
					<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
						<TabPanel
							value={this.state.activeTab}
							index={this.state.index_traffic}
							id='traffic'
						>
							<Grid container spacing={3}>

								<Grid item xs={12} sm={4}>
									<MyAutocomplite
										label="Город"
										multiple={true}
										data={this.state.cities}
										value={this.state.city_id_traffic}
										func={this.changeAutocomplite.bind(this, 'city_id_traffic')}
									/>
								</Grid>

								<Grid item xs={12} sm={3}>
									<MyDatePickerNew
										label="Дата от"
										customActions={true}
										value={dayjs(this.state.date_start_traffic)}
										func={this.changeDateRange.bind(this, 'date_start_traffic')}
									/>
								</Grid>

								<Grid item xs={12} sm={3}>
									<MyDatePickerNew
										label="Дата до"
										customActions={true}
										value={dayjs(this.state.date_end_traffic)}
										func={this.changeDateRange.bind(this, 'date_end_traffic')}
									/>
								</Grid>

								<Grid item xs={12} sm={2}>
									<Button onClick={this.getDataTraffic.bind(this)} variant="contained">
										Показать
									</Button>
								</Grid>

								{/* Визиты статистика */}
								{this.state.traffic_stats?.length > 0 && (
									<Grid item xs={12} sm={6} mt={3} mb={5}>
										<Typography variant="h4">Визиты все</Typography>
										<SiteClientsTrafficSummaryTable data={this.state.traffic_stats[0]}/>
									</Grid>
								)}
								{/* Визиты статистика */}

								{/* Визиты по источнику */}
								{this.state.traffic_sources?.length > 0 && (
									<Grid item xs={12} sm={6} mt={3} mb={5}>
										<Typography variant="h4">Источники трафика</Typography>
										<SiteClientsTrafficBySourceTable rows={this.state.traffic_sources}/>
									</Grid>
								)}
								{/* Визиты по источнику */}

								{/* Заказы по источнику */}
								{this.state.orders_by_source?.length > 0 && (
									<Grid item xs={12} sm={6} mt={3} mb={5}>
										<Typography variant="h4">Источники заказов</Typography>
										<SiteClientsOrdersBySourceTable rows={this.state.orders_by_source}/>
									</Grid>
								)}
								{/* Заказы по источнику */}

								{/* Заказы по utm */}
								{this.state.orders_by_utm?.length > 0 && (
									<Grid item xs={12} sm={6} mt={3} mb={5}>
										<Typography variant="h4">Заказы по UTM</Typography>
										<SiteClientsOrdersByUtmTable rows={this.state.orders_by_utm}/>
									</Grid>
								)}
								{/* Заказы по utm */}

							</Grid>
						</TabPanel>
					</Grid>
					{/* Аналитика по заказам */}

				</Grid>
			</>
		);
	}
}

export default function SiteClients() {
	return <SiteClients_/>;
}
