import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {api_laravel, api_laravel_local} from "@/src/api_new";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import {MyAlert, MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput} from "@/ui/elements";
import {ModalOrder} from "@/pages/site_clients/_Clients";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import {Checkbox, Chip, FormControlLabel, Rating, TextField} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import TableFooter from "@mui/material/TableFooter";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";

const ModalOrderWithFeedback = ({open, onClose, order, order_items, err_order, feedback_forms, getData, openOrder}) => {
	const [formData, setFormData] = useState([]);
	const [values, setValues] = useState([]);
	const saveFeedback = () => {
		const feedbacks = [];
		order_items.map((value, index) => {
			feedbacks.push({...values[index], item: {...value}});
		});
		getData('save_feedbacks', {feedbacks, order_id: order.order_id, point_id: order.point_id}).then((data) => {
			openOrder(order.point_id, order.order_id)
		})
	}

	useEffect(() => {
		setValues([]);
	}, [open])

	const renderElementFeed = (element, item) => {
		switch (element.type) {
			case 'rating':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">Рейтинг</Typography>
						<Rating
							value={element.data?.value}
							size="large"
							sx={{pointerEvents: 'none', opacity: 0.5, span: {fontSize: '2rem !important'}}}
						/>
					</div>
				);
			case 'input':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">{element.data.title}</Typography>
						<TextField
							fullWidth
							sx={{pointerEvents: 'none', opacity: 0.75}}
							placeholder={element.data.placeholder}
							size="small"
						/>
					</div>
				);
			case 'textarea':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">{element.data.title}</Typography>
						<TextField
							fullWidth
							multiline
							size="small"
							rows={4}
							sx={{pointerEvents: 'none', opacity: 0.75}}
							value={element.data?.value}
							placeholder={element.data.placeholder}
						/>
					</div>
				);
			case 'heading':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h4">{element.data.text}</Typography>
					</div>
				);
			case 'checkbox':
				return (
					<div style={{marginBottom: 10}}>
						<FormControlLabel
							control={<Checkbox checked={element.data?.value}/>}
							label={element.data.label}
							sx={{pointerEvents: 'none', opacity: 0.75}}
							id={element.data.param}
							size="small"
						/>
					</div>
				);
			case 'checkboxGroup':
				return (
					<div style={{
						marginBottom: 10,
						display: element.data.conditions.stars.find((value) => value === parseInt(item.form_feed.find((el) => el.type === 'rating')?.data?.value)) || element.data.conditions.products.find((value) => value === item.name) || element.data.conditions.categories.find((value) => value === item.cat_name) ? 'initial' : 'none'
					}}>
						<Typography variant="h6">{element.data.title}</Typography>
						{element.data.checkboxes.map((checkbox) => (
							<div key={checkbox.id} style={{display: 'flex', alignItems: 'center'}}>
								<FormControlLabel
									control={<Checkbox checked={checkbox.value} value={checkbox.value} sx={{
										pointerEvents: 'none',
										opacity: 0.75
									}}/>}
									label={checkbox.label}
								/>
							</div>
						))}
					</div>
				);
			case 'tagCloud':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">Облако тегов</Typography>
						<div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
							{element.data.selectedTags.map((tag) => (
								<Chip sx={{
									pointerEvents: 'none',
									opacity: 0.85
								}} key={tag} label={tag} color={element.data?.value.includes(tag) ? "primary" : "default"} style={{cursor: "pointer"}}/>
							))}
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	const renderElement = (element, key, item) => {
		const handleChanges = (e, type, id) => {
			const valuesCopy = JSON.parse(JSON.stringify(values));

			if (!valuesCopy[key]) {
				valuesCopy[key] = {};
			}
			if (type === 'checkbox' || type === 'checkboxGroup') {
				valuesCopy[key][id] = {
					value: e.target.checked,
					type
				};
			} else if (type === 'tagCloud') {
				let arr = valuesCopy[key][type]?.value ? [...valuesCopy[key][type]?.value] : [];
				const existEl = arr.find((el) => el === e);
				if (existEl) {
					arr = arr.filter((el) => el !== e);
				} else {
					arr.push(e);
				}
				valuesCopy[key][type] = {
					value: arr,
					type
				};
			} else {
				valuesCopy[key][type] = {
					value: e.target.value,
					type
				};
			}

			setValues(valuesCopy);
		};

		switch (element.type) {
			case 'rating':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">Рейтинг</Typography>
						<Rating
							id={element.id}
							value={values[key]?.[element.type]?.value}
							onChange={(e) => handleChanges(e, element.type, element.id)}
							size="large"
							sx={{span: {fontSize: '2rem !important'}}}
						/>
					</div>
				);
			case 'input':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">{element.data.title}</Typography>
						<TextField
							fullWidth
							id={element.id}
							value={values[key]?.[element.type]?.value}
							onChange={(e) => handleChanges(e, element.type, element.id)}
							placeholder={element.data.placeholder}
							size="small"
						/>
					</div>
				);
			case 'textarea':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">{element.data.title}</Typography>
						<TextField
							fullWidth
							id={element.id}
							value={values[key]?.[element.type]?.value}
							onChange={(e) => handleChanges(e, element.type, element.id)}
							multiline
							size="small"
							rows={4}
							placeholder={element.data.placeholder}
						/>
					</div>
				);
			case 'heading':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h4">{element.data.text}</Typography>
					</div>
				);
			case 'checkbox':
				return (
					<div style={{marginBottom: 10}}>
						<FormControlLabel
							control={
								<Checkbox id={element.data.param} value={values[key]?.[element.type]?.value} onChange={(e) => handleChanges(e, element.type, element.data.param)}/>}
							label={element.data.label}
							id={element.data.param}
							size="small"
						/>
					</div>
				);
			case 'checkboxGroup':
				return (
					<div style={{
						marginBottom: 10,
						display: element.data.conditions.stars.find((value) => value === parseInt(values[key]?.['rating']?.value)) || element.data.conditions.products.find((value) => value === item.name) || element.data.conditions.categories.find((value) => value === item.cat_name) ? 'initial' : 'none'
					}}>
						<Typography variant="h6">{element.data.title}</Typography>
						{element.data.checkboxes.map((checkbox) => (
							<div key={checkbox.id} style={{display: 'flex', alignItems: 'center'}}>
								<FormControlLabel
									value={values[key]?.[element.type]?.value}
									control={<Checkbox onChange={(e) => handleChanges(e, element.type, checkbox.param)}/>}
									label={checkbox.label}
								/>
							</div>
						))}
					</div>
				);
			case 'tagCloud':
				return (
					<div style={{marginBottom: 10}}>
						<Typography variant="h6">Облако тегов</Typography>
						<div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
							{element.data.selectedTags.map((tag) => (
								<Chip key={tag} label={tag} value={values[key]?.[element.type]?.value} onClick={(e) => handleChanges(tag, element.type, element.id)} color={values[key]?.[element.type]?.value.includes(tag) ? "primary" : "default"} style={{cursor: "pointer"}}/>
							))}
						</div>
					</div>
				);
			default:
				return null;
		}
	};
	return (
		<Dialog
			open={open}
			onClose={onClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
			fullWidth={true}
			maxWidth={'md'}
			fullScreen={false}
		>
			<DialogTitle className="button">
				<Typography style={{
					fontWeight: 'bold',
					alignSelf: 'center'
				}}>Заказ #{order?.order_id}</Typography>
				<IconButton onClick={onClose} style={{cursor: 'pointer'}}>
					<CloseIcon/>
				</IconButton>
			</DialogTitle>

			<DialogContent>

				<Grid container spacing={0}>
					<Grid item xs={12}>
						<span>{order?.type_order}: {order?.type_order_addr_new}</span>
					</Grid>

					{parseInt(order?.type_order_) == 1 ?
						parseInt(order?.fake_dom) == 0 ?
							<Grid item xs={12}>
								<b style={{color: 'red', fontWeight: 900}}>Домофон не работает</b>
							</Grid>
							:
							<Grid item xs={12}>
								<b style={{color: 'green', fontWeight: 900}}>Домофон работает</b>
							</Grid>
						:
						null
					}
					<Grid item xs={12}>
						<span>{order?.time_order_name}: {order?.time_order}</span>
					</Grid>

					{order?.number?.length > 1 ?
						<Grid item xs={12}>
							<b>Телефон: </b>
							<span>{order?.number}</span>
						</Grid>
						:
						null
					}

					{order?.delete_reason?.length > 0 ?
						<Grid item xs={12}><span style={{color: 'red'}}>Удален: {order?.date_time_delete}</span></Grid> : null}
					{order?.delete_reason?.length > 0 ?
						<Grid item xs={12}><span style={{color: 'red'}}>{order?.delete_reason}</span></Grid> : null}

					{parseInt(order?.is_preorder) == 1 ? null :
						<Grid item xs={12}><span>{'Обещали: ' + order?.time_to_client + ' / '}{order?.text_time}{order?.time}</span></Grid>
					}

					{order?.promo_name == null || order?.promo_name?.length == 0 ? null :
						<>
							<Grid item xs={12}>
								<b>Промокод: </b>
								<span>{order?.promo_name}</span>
							</Grid>
							<Grid item xs={12}>
								<span className="noSpace">{order?.promo_text}</span>
							</Grid>
						</>
					}

					{order?.comment == null || order?.comment.length == 0 ? null :
						<Grid item xs={12}>
							<b>Комментарий: </b>
							<span>{order?.comment}</span>
						</Grid>
					}

					{order?.sdacha == null || parseInt(order?.sdacha) == 0 ? null :
						<Grid item xs={12}>
							<b>Сдача: </b>
							<span>{order?.sdacha}</span>
						</Grid>
					}

					<Grid item xs={12}>
						<b>Сумма заказа: </b>
						<span>{order?.sum_order} р</span>
					</Grid>

					{order?.check_pos_drive == null || !order?.check_pos_drive ? null :
						<Grid item xs={12}>
							<b>Довоз оформлен: </b>
							<span>{order?.check_pos_drive?.comment}</span>
						</Grid>
					}

					<Grid item xs={12}>
						<Table size={'small'} style={{marginTop: 15}}>
							<TableBody>
								{order_items ? order_items.map((item, key) =>
									<TableRow key={key}>
										<TableCell>{item.name}</TableCell>
										<TableCell>{item.count ? `${item.count} шт` : ''}</TableCell>
										<TableCell>{item.price ? `${item.price} р` : ''}</TableCell>
										<TableCell><Box sx={{
											p: 1,
											bgcolor: item.form_feed?.length ? 'grey.100' : '',
											display: item.form_feed?.length || item.form_data.length ? '' : 'none',
											borderRadius: 1,
											border: '1px solid',
											borderColor: 'grey.300',
										}}
										>
											{item.form_feed?.length ? Object.entries(item.form_feed).map((data) => data.map((element) => (<div key={element.id}>{renderElementFeed(element, item)}</div>))) : Object.entries(item.form_data).map((data) => data.map((element) => (<div key={element.id}>{renderElement(element, key, item)}</div>)))}
										</Box></TableCell>
									</TableRow>
								) : null}
							</TableBody>
							<TableFooter>
								<TableRow>
									<TableCell style={{fontWeight: 'bold', color: '#000'}}>Сумма заказа</TableCell>
									<TableCell></TableCell>
									<TableCell style={{
										fontWeight: 'bold',
										color: '#000'
									}}>{`${order?.sum_order}`} р</TableCell>
									<TableCell><Button variant="contained" onClick={saveFeedback}  sx={{display: order_items?.some(item => item.form_data.length) ? '' : 'none'}}>Сохранить отзывы</Button></TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</Grid>

					{!err_order ? null :
						<Grid item xs={12} mt={3}>
							<Accordion>
								<AccordionSummary expandIcon={<ExpandMoreIcon/>}>
									<Typography style={{fontWeight: 'bold'}}>Ошибка</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell style={{width: '20%'}}>Дата создания</TableCell>
												<TableCell style={{width: '30%'}}>Проблема</TableCell>
												<TableCell style={{width: '30%'}}>Решение</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow hover>
												<TableCell>{err_order?.date_time_desc}</TableCell>
												<TableCell>{err_order?.order_desc}</TableCell>
												<TableCell>{err_order?.text_win}</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</AccordionDetails>
							</Accordion>
						</Grid>
					}

				</Grid>
			</DialogContent>
		</Dialog>
	);
}
export default function OrdersMore() {
	const [isLoad, setIsLoad] = useState(false);
	const [module, setModule] = useState({});
	const [points, setPoints] = useState([]);
	const [items, setItems] = useState([]);
	const [orders, setOrders] = useState([]);
	const [acces, setAcces] = useState({});
	const [url, setUrl] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowPerPage] = useState(10);
	const [openAlert, setOpenAlert] = useState(false);
	const [openModalOrder, setOpenModalOrder] = useState(false);
	const [errStatus, setErrStatus] = useState(false);
	const [errText, setErrText] = useState('');
	const [order, setOrder] = useState({});
	const typeParam = [{id: 'all', name: 'Найти всех'}, {id: 'new', name: 'Только новые'}, {
		id: 'current',
		name: 'Только текущих'
	}]
	const [formData, setFormData] = useState({
		date_start_true: null,
		date_end_true: null,
		date_start_false: null,
		date_end_false: null,
		is_show_claim: false,
		count_orders_min: 0,
		count_orders_max: 0,
		is_show_claim_last: false,
		min_summ: 0,
		max_summ: 0,
		promo: '',
		no_promo: false,
		param: {id: 'all', name: 'Найти всех'},
		is_show_marketing: false,
		point: [],
		preset: '',
		item: []
	});

	const openOrder = (point_id, order_id) => {
		getData('get_order', {point_id, order_id}).then((data) => {
			setOrder(data);
			setOpenModalOrder(true);
		})
	}

	const handleChange = (e, name) => {
		let value = null;
		if (name === 'date_start_true' || name === 'date_end_true' || name === 'date_start_false' || name === 'date_end_false' || name === 'point' || name === 'item' || name === 'param') {
			value = e;
		} else if (name === 'is_show_claim' || name === 'is_show_claim_last' || name === 'is_show_marketing' || name === 'no_promo') {
			value = e.target.checked;
		} else {
			value = e.target.value;
		}
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (formData.no_promo) {
			setFormData((prev) => ({
				...prev,
				promo: '',
			}));
		}

		if (formData.promo) {
			setFormData((prev) => ({
				...prev,
				no_promo: 0,
			}));
		}

	}, [formData.promo, formData.no_promo])

	useEffect(() => {
		if (formData.param.id === 'new') {
			setFormData((prev) => ({
				...prev,
				date_start_false: null,
				date_end_false: null,
			}));
		}

	}, [formData.param])

	const getUsers = () => {
		getData('get_orders_more', {
			...formData,
			date_start_true: dayjs(formData.date_start_true).format('YYYY-MM-DD'),
			date_end_true: dayjs(formData.date_end_true).format('YYYY-MM-DD'),
			date_start_false: dayjs(formData.date_start_false).format('YYYY-MM-DD'),
			date_end_false: dayjs(formData.date_end_false).format('YYYY-MM-DD')
		}).then((data) => {
			if (data.orders) {
				setOrders(data.orders);
				setUrl(data.url);
			} else {
				setErrStatus(data.st);
				setErrText(data.text);
				setOpenAlert(true);
			}
		})
	}

	const onDownload = (e) => {
		e.preventDefault();
		const link = document.createElement('a');
		link.href = url;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.click();
	};

	useEffect(() => {
		getData('get_all').then((data) => {
			setModule(data.module_info);
			setPoints(data.points);
			setItems(data.items);
			setAcces(data.acces);
		});
	}, []);
	const getData = async (method, data = {}) => {
		setIsLoad(true);

		try {
			const result = await api_laravel('site_clients', method, data);
			return result.data;
		} finally {
			setIsLoad(false);
		}
	};

	return (
		<>
			<Backdrop style={{zIndex: 99}} open={isLoad}>
				<CircularProgress color="inherit"/>
			</Backdrop>
			<MyAlert
				isOpen={openAlert}
				onClose={() => setOpenAlert(false)}
				status={errStatus}
				text={errText}
			/>
			{parseInt(acces.send_feedback) === 1 ?
				(<ModalOrderWithFeedback
					getData={getData}
					openOrder={openOrder}
					open={openModalOrder}
					onClose={() => setOpenModalOrder(false)}
					order={order.order}
					order_items={order.order_items}
					err_order={order.err_order}
					feedback_forms={order.feedback_forms}/>
				) :
				(<ModalOrder
					getData={getData}
					openOrder={openOrder}
					open={openModalOrder}
					onClose={() => setOpenModalOrder(false)}
					order={order.order}
					order_items={order.order_items}
					err_order={order.err_order}
					feedback_forms={order.feedback_forms}/>
				)}

			<Grid item container spacing={3} justifyContent="center" sx={{
				flexDirection: {
					sm: 'row',
					xs: 'column-reverse'
				}
			}}
						style={{marginTop: '64px', marginBottom: '24px'}}
			>

				<Grid container spacing={2} justifyContent="center" mb={3} mt={0}>
					<Grid item xs={12} sm={9}>
						<Button
							variant="contained"
							style={{marginLeft: '20px', whiteSpace: 'nowrap'}}
							onClick={() => {
								setFormData((prev) => ({
									...prev,
									date_start_true: dayjs().subtract(91, 'day'),
									date_end_true: dayjs().subtract(1, 'day'),
									date_start_false: dayjs().subtract(6, 'month'),
									date_end_false: dayjs().subtract(92, 'day'),
									count_orders_min: 1
								}));
							}}>
							Не делал заказ 90 дней
						</Button>
						<Button
							variant="contained"
							style={{whiteSpace: 'nowrap', marginLeft: '8px'}}
							onClick={() => {
								setFormData((prev) => ({
									...prev,
									date_start_true: dayjs().subtract(8, 'day'),
									date_end_true: dayjs().subtract(1, 'day'),
								}));
							}}
						>
							Новые за неделю
						</Button>
					</Grid>
				</Grid>

				<Grid item xs={12} sm={3} sx={{order: {sm: 0, xs: 1}}}>
					<MyDatePickerNew
						label="Делал заказ от"
						value={formData.date_start_true}
						func={(e) => handleChange(e, 'date_start_true')}
					/>
				</Grid>

				<Grid item xs={12} sm={3} sx={{order: {sm: 1, xs: 0}}}>
					<MyDatePickerNew
						label="Делал заказ до"
						value={formData.date_end_true}
						func={(e) => handleChange(e, 'date_end_true')}
					/>
				</Grid>

				<Grid item xs={12} sm={3} sx={{order: {sm: 2, xs: 2}}} display="flex" flexDirection="row">

					<Grid>
						<Button variant="contained" style={{whiteSpace: 'nowrap'}} onClick={getUsers}>
							Получить список клиентов
						</Button>
					</Grid>

					<Grid>
						<Button
							variant="contained"
							style={{marginLeft: 10, backgroundColor: '#ffcc00'}}
							disabled={!orders.length}
							onClick={onDownload}
						>
							<DownloadIcon/>
						</Button>
					</Grid>

				</Grid>
			</Grid>

			<Grid container spacing={3} justifyContent="center" mb={3}>
				<Grid item xs={12} sm={3}>
					<MyDatePickerNew
						label="Не заказывал от"
						value={formData.date_start_false}
						disabled={formData.param.id === 'new'}
						func={(e) => handleChange(e, 'date_start_false')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyDatePickerNew
						label="Не заказывал до"
						disabled={formData.param.id === 'new'}
						value={formData.date_end_false}
						func={(e) => handleChange(e, 'date_end_false')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyCheckBox
						label="Была оформлена ошибка на заказ"
						value={formData.is_show_claim}
						func={(e) => handleChange(e, 'is_show_claim')}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={3} justifyContent="center" mb={3}>
				<Grid item xs={12} sm={3}>
					<MyTextInput
						label="Количество заказов от"
						value={formData.count_orders_min}
						type="number"
						func={(e) => handleChange(e, 'count_orders_min')}
					/>
				</Grid>
				<Grid item xs={12} sm={3}>
					<MyTextInput
						label="Количество заказов до"
						value={formData.count_orders_max}
						type="number"
						func={(e) => handleChange(e, 'count_orders_max')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyCheckBox
						label="Была оформлена ошибка на последний заказ"
						value={formData.is_show_claim_last}
						func={(e) => handleChange(e, 'is_show_claim_last')}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={3} justifyContent="center" mb={3}>
				<Grid item xs={12} sm={3}>
					<MyTextInput
						label="От суммы"
						value={formData.min_summ}
						type="number"
						func={(e) => handleChange(e, 'min_summ')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyTextInput
						label="До суммы"
						value={formData.max_summ}
						type="number"
						func={(e) => handleChange(e, 'max_summ')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyCheckBox
						label="Подписка на рекламную рассылку"
						value={formData.is_show_marketing}
						func={(e) => handleChange(e, 'is_show_marketing')}
					/>
				</Grid>
			</Grid>
			<Grid container spacing={3} justifyContent="center" mb={3}>
				<Grid item xs={12} sm={3}>
					<MyAutocomplite
						label="Точки"
						multiple={true}
						data={points}
						value={formData.point}
						func={(event, value) => handleChange(value, 'point')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyAutocomplite
						label="Позиции в заказе"
						multiple={true}
						data={items}
						value={formData.item}
						func={(event, value) => handleChange(value, 'item')}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<MyAutocomplite
						label="Пользователи"
						disableClearable={true}
						data={typeParam}
						value={formData.param}
						func={(event, value) => handleChange(value, 'param')}
					/>
				</Grid>
			</Grid>
			<Grid container spacing={2} justifyContent="center" mt={2}>
				<Grid item xs={12} sm={3}>
					<MyTextInput
						label="Промокод"
						value={formData.promo}
						func={(e) => handleChange(e, 'promo')}
					/>
				</Grid>

				<Grid item xs={12} sm={6}>
					<MyCheckBox
						label="Заказ без промокода"
						value={formData.no_promo}
						func={(e) => handleChange(e, 'no_promo')}
					/>
				</Grid>
				{!orders.length ? null : (
					<>
						<Grid container justifyContent="center">
							<Grid item xs={12} sm={12}>
								<TableContainer>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>#</TableCell>
												<TableCell>Заказ</TableCell>
												<TableCell>Точка</TableCell>
												<TableCell>Источник трафика</TableCell>
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

											{orders.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item, key) =>
												<TableRow
													hover
													key={key}
													style={parseInt(item.is_delete) == 1 ? {
														backgroundColor: 'red',
														color: '#fff',
														fontWeight: 'bold'
													} : {}}
													sx={{cursor: 'pointer'}}
													onClick={() => openOrder(item.point_id, item.id)}
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
													<TableCell style={{color: 'inherit', fontWeight: 'inherit'}}>{item.source}</TableCell>
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
								<TablePagination
									rowsPerPageOptions={[10, 50, 100]}
									labelDisplayedRows={({from, to, count}) => `${from}-${to} из ${count}`}
									labelRowsPerPage="Записей на странице:"
									component="div"
									count={orders.length}
									rowsPerPage={rowsPerPage}
									page={page}
									onPageChange={(event, newPage) => setPage(newPage)}
									onRowsPerPageChange={(event) => {
										setRowPerPage(parseInt(event.target.value, 10));
										setPage(0);
									}}
								/>
							</Grid>
						</Grid>
					</>
				)}
			</Grid>
			<Grid container spacing={3} justifyContent="center" mb={3}>
				<Grid item xs={12} sm={1}>
				</Grid>
				<Grid item xs={12} sm={3}>
				</Grid>
			</Grid>
		</>
	);
}
