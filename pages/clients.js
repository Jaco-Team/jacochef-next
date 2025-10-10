import React, {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import {useRouter} from 'next/router';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import {api_laravel, api_laravel_local} from '@/src/api_new';
import {MyAlert, MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput, TextEditor22} from "@/ui/elements";
import DownloadIcon from "@mui/icons-material/Download";
import TableContainer from "@mui/material/TableContainer";
import dayjs from "dayjs";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import Dialog from "@mui/material/Dialog";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import {Checkbox, Chip, FormControlLabel, Rating, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import {ModalAccept} from "@/components/general/ModalAccept";

const DialogUser = ({open, onClose, user, openOrder}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth={true}
			fullScreen={false}
			maxWidth={'lg'}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>

			<DialogTitle className="button">
				<Typography style={{fontWeight: 'bold', alignSelf: 'center'}}>Информация о клиенте</Typography>
				<IconButton onClick={onClose} style={{cursor: 'pointer'}}>
					<CloseIcon/>
				</IconButton>
			</DialogTitle>

			<DialogContent style={{paddingTop: 10}}>

				<Grid container spacing={3}>

					<Grid item xs={12} sm={4}>

						<Grid container>
							<Grid item xs={12} sm={12}>
								<span>Телефон: </span>
								<span>{user?.info?.login}</span>
							</Grid>
							<Grid item xs={12} sm={12} style={{paddingTop: 12}}>
								<span>Имя: </span>
								<span>{user?.info?.name}</span>
							</Grid>
							<Grid item xs={12} sm={12} style={{paddingTop: 12}}>
								<span>Регистрация: </span>
								<span>{user?.info?.date_reg}</span>
							</Grid>
							<Grid item xs={12} sm={12} style={{paddingTop: 12}}>
								<span>День рождения: </span>
								<span>{user?.info?.date_bir}</span>
							</Grid>
							<Grid item xs={12} sm={12} style={{paddingTop: 12}}>
								<span>Заказов: </span>
								<span>{user?.info?.all_count_order} / {user?.info?.summ} р.</span>
							</Grid>
							<Grid item xs={12} sm={12} style={{paddingTop: 12}}>
								<span>Доставок: </span>
								<span>{user?.info?.count_dev} / {user?.info?.summ_dev} р.</span>
							</Grid>
							<Grid item xs={12} sm={12} style={{paddingTop: 12}}>
								<span>Самовывозов: </span>
								<span>{user?.info?.count_pic} / {user?.info?.summ_pic} р.</span>
							</Grid>
						</Grid>
					</Grid>

					<Grid item xs={12} sm={8}>
						<Accordion style={{width: '100%'}}>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon/>}
							>
								<Typography>Заказы</Typography>
							</AccordionSummary>
							<AccordionDetails style={{maxHeight: 300, overflow: 'scroll'}}>
								<Table>
									<TableBody>
										{user?.orders ? user?.orders.map((item, key) =>
											<TableRow key={key} hover style={{cursor: 'pointer'}} onClick={() => openOrder(item.point_id, item.order_id)}>
												<TableCell>{item.point}</TableCell>
												<TableCell>{item.new_type_order}</TableCell>
												<TableCell>{item.date_time}</TableCell>
												<TableCell>#{item.order_id}</TableCell>
												<TableCell>{item.summ}р.</TableCell>
											</TableRow>
										) : null}
									</TableBody>
								</Table>
							</AccordionDetails>
						</Accordion>
					</Grid>

				</Grid>

			</DialogContent>
		</Dialog>
	);
}

const ModalOrder = ({open, onClose, order, order_items, err_order, feedback_forms, getData, openOrder}) => {
	const [formData, setFormData] = useState([]);
	const [values, setValues] = useState([]);
	const [discountValue, setDiscountValue] = useState(0);
	const [userActive, setUserActive] = useState(0);
	const saveFeedback = () => {
		const feedbacks = [];
		order_items.map((value, index) => {
			feedbacks.push({...values[index], item: {...value}});
		});
		const anyPercent = {
			sale: discountValue,
			phone: order.number,
		};
		getData('save_feedbacks', {feedbacks, order_id: order.order_id, point_id: order.point_id, anyPercent, userActive}).then((data) => {
			openOrder(order.point_id, order.order_id)
		})
	}

	useEffect(() => {
		setValues([]);
		setDiscountValue(0);
		setUserActive(0);
		if (order?.feedback_data?.discount_id) {
			setDiscountValue(order.feedback_data?.count_promo);
		}
		if (order?.feedback_data?.user_active) {
			setUserActive(order.feedback_data?.user_active);
		}
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
	const hasDiscount = order_items?.some(item => item.form_data.some(data => data.type === 'discount'));
	const hasFormFeed = order_items?.some(item => item.form_feed.length);
	const [openAccept, setOpenAccept] = useState(false);
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
			{openAccept && <ModalAccept open={openAccept} onClose={() => setOpenAccept(false)} save={() => {saveFeedback(); setOpenAccept(false)}}/>}

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
								{order_items?.some((item) => item.form_data.length) ? (
                  <>
                    <TableRow>
                      <TableCell>Заказов</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell><b>{order?.stat_order?.all_count} шт</b></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Доставок</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell><b>{order?.stat_order?.count_dev} шт</b></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Самовывозов</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell><b>{order?.stat_order?.count_pic} шт</b></TableCell>
                    </TableRow>
                  </>
                ) : null}
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
								{order_items?.some(item => item.form_data.length) && (
									<TableRow>
										<TableCell style={{fontWeight: 'bold', color: '#000'}}>Тип клиента</TableCell>
										<TableCell></TableCell>
										<TableCell style={{
											fontWeight: 'bold',
											color: '#000'
										}}></TableCell>
										<TableCell>
											<div className="form-element" style={order.feedback_data?.user_active || order.feedback_data?.user_active === 0 ? {pointerEvents: 'none', opacity: 0.4} : {}}>
												<ToggleButtonGroup
													value={userActive}
													exclusive
													size="small"
													onChange={(event, data) => setUserActive(data)}
												>
													<ToggleButton value={0} style={{
														backgroundColor: parseInt(userActive) == 0 ? '#dd1a32' : '#fff',
														borderRightWidth: 2
													}}>
														<span style={{
															color: parseInt(userActive) == 0 ? '#fff' : '#333',
															padding: '0 20px'
														}}>Текущий</span>
													</ToggleButton>
													<ToggleButton value={1} style={{backgroundColor: parseInt(userActive) == 1 ? '#dd1a32' : '#fff'}}>
														<span style={{
															color: parseInt(userActive) == 1 ? '#fff' : '#333',
															padding: '0 20px'
														}}>Новый</span>
													</ToggleButton>
													<ToggleButton value={2} style={{backgroundColor: parseInt(userActive) == 2 ? '#dd1a32' : '#fff'}}>
														<span style={{
															color: parseInt(userActive) == 2 ? '#fff' : '#333',
															padding: '0 20px'
														}}>Ушедший</span>
													</ToggleButton>
												</ToggleButtonGroup>
											</div>
										</TableCell>
									</TableRow>
								)}
								{hasDiscount && (
									<TableRow>
										<TableCell style={{fontWeight: 'bold', color: '#000'}}>Выписать скидку</TableCell>
										<TableCell></TableCell>
										<TableCell style={{
											fontWeight: 'bold',
											color: '#000'
										}}></TableCell>
										<TableCell>
											<div className="form-element" style={order.feedback_data?.discount_id ? {pointerEvents: 'none', opacity: 0.4} : {}}>
												<ToggleButtonGroup
													value={discountValue}
													exclusive
													size="small"
													onChange={(event, data) => {
														setDiscountValue(data)
													}}
												>
													{[10, 20].map((discount) => {
														return (
															<ToggleButton value={discount} style={{backgroundColor: parseInt(discountValue) == discount ? '#dd1a32' : '#fff'}}>
										<span style={{
											color: parseInt(discountValue) == discount ? '#fff' : '#333',
											padding: '0 20px'
										}}>Скидка {discount}%</span>
															</ToggleButton>
														);
													})}
												</ToggleButtonGroup>
											</div>
										</TableCell>
									</TableRow>
								)}
								<TableRow>
									<TableCell style={{fontWeight: 'bold', color: '#000'}}>Сумма заказа</TableCell>
									<TableCell></TableCell>
									<TableCell style={{
										fontWeight: 'bold',
										color: '#000'
									}}>{`${order?.sum_order}`} р</TableCell>
									<TableCell><Button variant="contained" onClick={() => setOpenAccept(true)} sx={{display: order_items?.some(item => item.form_data.length) ? '' : 'none'}}>Сохранить отзывы</Button></TableCell>
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

function ClientPage() {
	const [isLoad, setIsLoad] = useState(false);
	const [module, setModule] = useState({});
	const [points, setPoints] = useState([]);
	const [items, setItems] = useState([]);
	const [users, setUsers] = useState([]);
	const [user, setUser] = useState([]);
	const [url, setUrl] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowPerPage] = useState(10);
	const [openAlert, setOpenAlert] = useState(false);
	const [openModalUser, setOpenModalUser] = useState(false);
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
		param: {id: 'all', name: 'Найти всех'},
		is_show_marketing: false,
		point: [],
		preset: '',
		item: []
	});

	const router = useRouter();

	const openUser = (number) => {
		getData('get_one', {number}).then((data) => {
			setUser(data);
			setOpenModalUser(true);
		})
	}

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
		} else if (name === 'is_show_claim' || name === 'is_show_claim_last' || name === 'is_show_marketing') {
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
		if (formData.param.id === 'new') {
			setFormData((prev) => ({
				...prev,
				date_start_false: null,
				date_end_false: null,
			}));
		}
	}, [formData.param])

	const getUsers = () => {
		getData('get_users', {
			...formData,
			date_start_true: dayjs(formData.date_start_true).format('YYYY-MM-DD'),
			date_end_true: dayjs(formData.date_end_true).format('YYYY-MM-DD'),
			date_start_false: dayjs(formData.date_start_false).format('YYYY-MM-DD'),
			date_end_false: dayjs(formData.date_end_false).format('YYYY-MM-DD')
		}).then((data) => {
			if (data.users) {
				setUsers(data.users);
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
			document.title = data.module_info.name;
			setModule(data.module_info);
			setPoints(data.points);
			setItems(data.items);
		});
	}, []);
	const getData = async (method, data = {}) => {
		setIsLoad(true);

		try {
			const result = await api_laravel('clients', method, data);
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
			<DialogUser open={openModalUser} onClose={() => setOpenModalUser(false)} user={user} openOrder={openOrder}/>
			<ModalOrder getData={getData} openOrder={openOrder} open={openModalOrder} onClose={() => setOpenModalOrder(false)} order={order.order} order_items={order.order_items} err_order={order.err_order} feedback_forms={order.feedback_forms}/>
			<Grid item container spacing={3} justifyContent="center" sx={{
				flexDirection: {
					sm: 'row',
					xs: 'column-reverse'
				}
			}}
						style={{marginTop: '64px', marginBottom: '24px'}}
			>

				<Grid item xs={12} mb={3}>
					<h1>{module.name}</h1>
				</Grid>

				<Grid container spacing={2} justifyContent="center" mb={3}>
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
							disabled={!users.length}
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
						data={typeParam}
						value={formData.param}
						func={(event, value) => handleChange(value, 'param')}
					/>
				</Grid>
				{!users.length ? null : (
					<>
						<Grid container justifyContent="center">
							<Grid item xs={12} sm={9}>
								<TableContainer>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>#</TableCell>
												<TableCell>Имя</TableCell>
												<TableCell>Телефон</TableCell>
												<TableCell>Последний комментарий</TableCell>
											</TableRow>
										</TableHead>

										<TableBody>
											{users.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item, i) => (
												<TableRow
													key={i}
													style={{cursor: 'pointer'}}
													onClick={() => openUser(item.login)}
												>
													<TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
													<TableCell>
														{item.name}
														{item.number_new_active ? (
															<span style={{color: 'red', fontWeight: 'bold'}}> Новый!</span>
														) : ''}
													</TableCell>
													<TableCell>{item.login}</TableCell>
													<TableCell dangerouslySetInnerHTML={{__html: item?.last_comment}}></TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
								<TablePagination
									rowsPerPageOptions={[10, 50, 100]}
									labelDisplayedRows={({from, to, count}) => `${from}-${to} из ${count}`}
									labelRowsPerPage="Записей на странице:"
									component="div"
									count={users.length}
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

export default function FeedBack() {
	return <ClientPage/>;
}

export async function getServerSideProps({req, res, query}) {
	res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

	return {
		props: {},
	};
}
