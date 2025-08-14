import React, {useEffect, useState} from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import TabPanel from '@mui/lab/TabPanel';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Accordion from '@mui/material/Accordion';
import CloseIcon from '@mui/icons-material/Close';
import TableFooter from '@mui/material/TableFooter';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import {
	formatDate,
	MyAlert, MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput,
} from '@/ui/elements';
import {api_laravel, api_laravel_local} from '@/src/api_new';
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import {CardHeader, Slide} from "@mui/material";
import axios from "axios";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import TableContainer from "@mui/material/TableContainer";

function PromoCodeForm({ mockItems, getData, setIsLoad, setErrStatus, setErrText, setOpenAlert, }) {
	const [formData, setFormData] = useState({
		type: '',
		discountValue: '',
		products: [],
		minOrderAmount: '',
		maxOrderAmount: '',
		activationLimit: '',
		daysBeforeIssue: 0,
		validityDays: '',
		description: '',
	});

	const [history, setHistory] = useState([]);
	const [position, setPosition] = useState({});
	const [count, setCount] = useState(0);
	const [price, setPrice] = useState(0);
	const [open, setOpen] = useState(false);
	const [openDate, setOpenDate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [story, setStory] = useState({});

	const openModal = (item) => {
		setStory(item);
		setOpen(true);
	};

	const openModalDelete = (item) => {
		setStory(item);
		setOpenDelete(true);
	};

	const onDeleteDate = (date) => {
		setIsLoad(true);
		getData('delete_date', {date_start: date}).then((data) => {
			if (!data.st) {
				setErrStatus(data.st);
				setErrText(data.text);
				setOpenAlert(true);
			} else {
				getData('get_promo').then((data) => setHistory(data.history))
					.finally(() => setIsLoad(false));
			}
		}).finally(() => setIsLoad(false))
	}

	const discountOptions = Array.from({length: 20}, (_, i) => (i + 1) * 5);

	const handleChange = (e) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === 'type') {
			setFormData((prev) => ({
				...prev,
				discountValue: '',
				products: [],
			}));
		}
	};

	useEffect(() => {
		getData('get_promo').then((data) => {
			setHistory(data.history);
			setFormData(
				{
					type: data.promo.type,
					discountValue: parseInt(data.promo.discount, 10),
					products: JSON.parse(data.promo.products),
					minOrderAmount: data.promo.minOrderAmount,
					maxOrderAmount: data.promo.maxOrderAmount,
					activationLimit: data.promo.activationLimit,
					daysBeforeIssue: data.promo.daysBeforeIssue,
					validityDays: data.promo.validityDays,
					description: data.promo.description,
				},
			);
		});
	}, []);
	const handleSubmit = (date) => {
		setIsLoad(true);
		getData('save_promo', {...formData, date_start: dayjs(date).format('YYYY-MM-DD')}).then((data) => {
			if (!data.st) {
				setErrStatus(data.st);
				setErrText(data.text);
				setOpenAlert(true);
			} else {
				getData('get_promo').then((data) => setHistory(data.history))
					.finally(() => setIsLoad(false));
			}
		})
			.finally(() => {
				setIsLoad(false);
			});
	};

	const addItem = () => {
		setFormData((prev) => ({
			...prev,
			discountValue: '',
			products: [...prev.products, {...position, price, count}],
		}));
		setCount(0);
		setPrice(0);
		setPosition('');
	};

	const delItemAdd = (item) => {
		setFormData((prev) => ({
			...prev,
			products: [...formData.products.filter((value) => value.id !== item.id)],
		}));
	};

	return (
		<Box component="form" sx={{mt: 1}}>
			<DialogPromoHistory onClose={() => setOpen(false)} open={open} getData={getData} story={story}/>
			<ModalDelete onClose={() => setOpenDelete(false)} open={openDelete} onDelete={onDeleteDate} date={story}/>
			<DateModal open={openDate} onClose={() => setOpenDate(false)} onSave={handleSubmit}/>
			<Grid container spacing={3}>
				<Grid item xs={12} sm={6}>
					<FormControl fullWidth size="small">
						<InputLabel id="discount-type-label">Тип</InputLabel>
						<Select
							labelId="discount-type-label"
							id="type"
							name="type"
							value={formData.type}
							label="Тип скидки"
							onChange={handleChange}
							required
						>
							<MenuItem value="percentage">Cкидка</MenuItem>
							<MenuItem value="product">Добавление товара</MenuItem>
						</Select>
					</FormControl>
				</Grid>

				{formData.type && formData.type !== 'product' && (
					<Grid item xs={12} sm={6}>
						<Autocomplete
							options={discountOptions}
							size="small"
							getOptionLabel={(option) => `${option}%`}
							value={formData.discountValue}
							onChange={(_, newValue) => {
								setFormData((prev) => ({
									...prev,
									discountValue: newValue,
								}));
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Размер скидки"
									required
								/>
							)}
						/>
					</Grid>
				)}

				{formData.type === 'product' && (
					<>
						<Grid container direction="row" justifyContent="center" style={{
							paddingTop: 20,
							paddingLeft: 24
						}} spacing={3}>
							<Grid item xs={12} sm={3}>
								<MyAutocomplite
									data={mockItems}
									value={position}
									func={(event, data) => {
										setPosition(data);
									}}
									label="Позиция"
								/>
							</Grid>
							<Grid item xs={12} sm={3}>
								<MyTextInput value={count} func={(e) => setCount(e.target.value)} label="Количество"/>
							</Grid>
							<Grid item xs={12} sm={3}>
								<MyTextInput value={price} func={(e) => setPrice(e.target.value)} label="Цена за все"/>
							</Grid>
							<Grid item xs={12} sm={3}>
								<Button variant="contained" onClick={addItem}>Добавить</Button>
							</Grid>
						</Grid>
						<Grid container direction="row" justifyContent="center" style={{paddingTop: 20}} spacing={3}>
							<Grid item xs={12} sm={6}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Позиция</TableCell>
											<TableCell>Количество</TableCell>
											<TableCell>Цена за все</TableCell>
											<TableCell/>
										</TableRow>
									</TableHead>
									<TableBody>
										{formData.products.map((item, key) => (
											<TableRow key={key}>
												<TableCell>{item.name}</TableCell>
												<TableCell>{item.count}</TableCell>
												<TableCell>{item.price}</TableCell>
												<TableCell>
													<CloseIcon onClick={() => delItemAdd(item)} style={{cursor: 'pointer'}}/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
									<TableFooter>
										<TableRow>
											<TableCell/>
											<TableCell/>
											<TableCell>{formData.products.reduce((sum, item) => sum + parseInt(item.price), 0)}</TableCell>
											<TableCell/>
										</TableRow>
									</TableFooter>
								</Table>
							</Grid>
						</Grid>
					</>
				)}

				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Минимальная сумма заказа"
						name="minOrderAmount"
						type="number"
						size="small"
						value={formData.minOrderAmount}
						onChange={handleChange}
						inputProps={{min: 0}}
						required
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Максимальная сумма заказа"
						name="maxOrderAmount"
						type="number"
						value={formData.maxOrderAmount}
						onChange={handleChange}
						inputProps={{min: 0}}
						size="small"
					/>
				</Grid>

				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						size="small"
						label="Количество активаций"
						name="activationLimit"
						type="number"
						value={formData.activationLimit}
						onChange={handleChange}
						inputProps={{min: 1}}
						required
					/>
				</Grid>

				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="За сколько дней выписан промокод"
						name="daysBeforeIssue"
						size="small"
						type="number"
						value={formData.daysBeforeIssue}
						onChange={handleChange}
						inputProps={{min: 0}}
						required
					/>
				</Grid>

				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						size="small"
						label="Сколько дней действует промокод"
						name="validityDays"
						type="number"
						value={formData.validityDays}
						onChange={handleChange}
						inputProps={{min: 1}}
						required
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label="Описание промокода"
						name="description"
						multiline
						size="small"
						rows={2}
						value={formData.description}
						onChange={handleChange}
					/>
				</Grid>
				<Grid item xs={12} sm={12} display="grid">
					<Button
						color="success"
						variant="contained"
						onClick={(e) => {
							e.preventDefault();
							setOpenDate(true)
						}}
						type="submit"
						style={{whiteSpace: 'nowrap', justifySelf: 'flex-end'}}
					>
						Сохранить изменения
					</Button>
				</Grid>
				<Grid item xs={12} sm={12} display="grid">
					<Accordion style={{marginTop: '24px', display: history.length ? 'inherit' : 'none'}}>
						<AccordionSummary expandIcon={<ExpandMoreIcon/>}>
							<Typography sx={{fontWeight: 'bold'}}>История изменений</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell style={{width: '20%'}}>#</TableCell>
										<TableCell style={{width: '30%'}}>Дата начала изменения</TableCell>
										<TableCell style={{width: '30%'}}>Дата создания</TableCell>
										<TableCell style={{width: '15%'}}>Сотрудник</TableCell>
										<TableCell style={{width: '5%'}}></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{history.map((item, k) => (
										<TableRow key={k}>
											<TableCell>{k + 1}</TableCell>
											<TableCell hover style={{cursor: 'pointer'}} onClick={() => openModal(item)}>{item.date_start}</TableCell>
											<TableCell>{item.date}</TableCell>
											<TableCell>{item.user_name}</TableCell>
											<TableCell>
												<IconButton onClick={() => openModalDelete(item)}>
													<DeleteIcon style={{color: "red"}}/>
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</AccordionDetails>
					</Accordion>
				</Grid>

			</Grid>
		</Box>
	);
}

function DialogPromoHistory({
															open, onClose, getData, story,
														}) {
	const [formData, setFormData] = useState({
		type: '',
		discountValue: '',
		products: [],
		minOrderAmount: '',
		maxOrderAmount: '',
		activationLimit: '',
		daysBeforeIssue: 0,
		validityDays: '',
		description: '',
	});
	useEffect(() => {
		if (story.type) {
			setFormData(
				{
					type: story.type,
					discountValue: parseInt(story.discount),
					products: JSON.parse(story.products),
					minOrderAmount: story.minOrderAmount,
					maxOrderAmount: story.maxOrderAmount,
					activationLimit: story.activationLimit,
					daysBeforeIssue: story.daysBeforeIssue,
					validityDays: story.validityDays,
					description: story.description,
				},
			);
		}
	}, [story]);
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
		>
			<DialogTitle style={{display: 'flex', alignItems: 'center'}}>
				Изменения
				<IconButton onClick={onClose} style={{marginLeft: 'auto'}}>
					<CloseIcon/>
				</IconButton>
			</DialogTitle>
			<DialogContent style={{paddingBottom: 10, paddingTop: 10}}>
				<Box component="form" sx={{mt: 1}}>
					<Grid container spacing={3}>
						<Grid item xs={12} sm={12}>
							<b>Дата начала изменения: {story?.date_start}</b>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth size="small">
								<InputLabel id="discount-type-label">Тип</InputLabel>
								<Select
									labelId="discount-type-label"
									id="type"
									name="type"
									value={formData.type}
									label="Тип скидки"
									disabled
									required
								>
									<MenuItem value="percentage">Cкидка</MenuItem>
									<MenuItem value="product">Добавление товара</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						{formData.type && formData.type !== 'product' && (
							<Grid item xs={12} sm={6}>
								<Autocomplete
									options={[]}
									size="small"
									disabled
									getOptionLabel={(option) => `${option}%`}
									value={formData.discountValue}
									onChange={(_, newValue) => {
										setFormData((prev) => ({
											...prev,
											discountValue: newValue,
										}));
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Размер скидки"
											required
										/>
									)}
								/>
							</Grid>
						)}

						{formData.type === 'product' && (
							<Grid container style={{paddingTop: 20}} spacing={3}>
								<Grid item xs={12} sm={12}>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>Позиция</TableCell>
												<TableCell>Количество</TableCell>
												<TableCell>Цена за все</TableCell>
												<TableCell/>
											</TableRow>
										</TableHead>
										<TableBody>
											{formData.products.map((item, key) => (
												<TableRow key={key}>
													<TableCell>{item.name}</TableCell>
													<TableCell>{item.count}</TableCell>
													<TableCell>{item.price}</TableCell>
													<TableCell/>
												</TableRow>
											))}
										</TableBody>
										<TableFooter>
											<TableRow>
												<TableCell/>
												<TableCell/>
												<TableCell>{formData.products.reduce((sum, item) => sum + parseInt(item.price), 0)}</TableCell>
												<TableCell/>
											</TableRow>
										</TableFooter>
									</Table>
								</Grid>
							</Grid>
						)}

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Минимальная сумма заказа"
								name="minOrderAmount"
								type="number"
								disabled
								size="small"
								value={formData.minOrderAmount}
								inputProps={{min: 0}}
								required
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Максимальная сумма заказа"
								name="maxOrderAmount"
								type="number"
								disabled
								value={formData.maxOrderAmount}
								inputProps={{min: 0}}
								size="small"
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								disabled
								size="small"
								label="Количество активаций"
								name="activationLimit"
								type="number"
								value={formData.activationLimit}
								inputProps={{min: 1}}
								required
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="За сколько дней выписан промокод"
								name="daysBeforeIssue"
								size="small"
								disabled
								type="number"
								value={formData.daysBeforeIssue}
								inputProps={{min: 0}}
								required
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								size="small"
								label="Сколько дней действует промокод"
								name="validityDays"
								type="number"
								disabled
								value={formData.validityDays}
								inputProps={{min: 1}}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Описание промокода"
								name="description"
								disabled
								multiline
								size="small"
								rows={2}
								value={formData.description}
							/>
						</Grid>

					</Grid>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" onClick={onClose}>Закрыть</Button>
			</DialogActions>
		</Dialog>
	);
}

const DateModal = ({open, onClose, onSave}) => {
	const [newDate, setNewDate] = useState(null);

	const handleChange = (data, val) => {
		setNewDate(data);
	};

	const handleSubmit = () => {
		onSave(newDate);
		handleClose();
	};

	const handleClose = () => {
		setNewDate(null);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Создать дату с которой будут применяться изменения</DialogTitle>

			<DialogContent>
				<Box sx={{mt: 2}}>
					<MyDatePickerNew
						label="Дата изменений"
						value={newDate}
						func={handleChange}
					/>
				</Box>
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose}>Отмена</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
				>
					Создать
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ModalAder = ({open, onClose, getData, setIsLoad, setErrStatus, setErrText, setOpenAlert}) => {
	const [formData, setFormData] = useState({
		date_start: dayjs(new Date()).format('YYYY-MM-DD'),
		date_end: dayjs(new Date()).add(7, 'day').format('YYYY-MM-DD'),
		where_active: 0,
		city_ids: [],
		point_ids: [],
		name: '',
		description: '',
		order_type: 0,
		pay_type: [],
		sum_order: 0,
		in_order: 0,
		items_ids: [],
		category_ids: [],
		name_pack: ''
	});
	const [points, setPoints] = useState([]);
	const [cities, setCities] = useState([]);
	const [items, setItems] = useState([]);
	const [categories, setCategories] = useState([]);

	const saveNewAder = () => {
		const formatData = {
			...formData,
			date_start: dayjs(formData.date_start).format('YYYY-MM-DD'),
			date_end: dayjs(formData.date_end).format('YYYY-MM-DD'),
			point_ids: formData.point_ids.map((el) => el.id).join(','),
			items_ids: formData.items_ids.map((el) => el.id).join(','),
			city_ids: formData.city_ids.map((el) => el.id).join(','),
			category_ids: formData.category_ids.map((el) => el.id).join(','),
			pay_type: formData.pay_type.join(',')
		}
		getData('save_ader', {formatData}).then(data => {
			if (!data.st) {
				setErrStatus(data.st);
				setErrText(data.text);
				setOpenAlert(true);
			} else {
				onClose();
			}
		})
	}

	useEffect(() => {
		getData('get_all_ader').then((data) => {
			setPoints(data.points);
			setItems(data.items);
			setCities(data.cities);
			setCategories(data.categories);
		})
	}, [])
	return (
		<Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth TransitionComponent={Slide}
						TransitionProps={{direction: 'up'}}>
			<DialogTitle>Добавление новой рекламы</DialogTitle>
			<DialogContent>

				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={12}><Typography> Общее</Typography></Grid>
					<Grid item xs={12} sm={3}>
						<MyTextInput label="Название" value={formData.name} func={(e) => setFormData((prev) => ({
							...prev,
							name: e.target.value
						}))}/>
					</Grid>
					<Grid item xs={12} sm={6}>
						<MyTextInput label="Описание" multiline={true} maxRows={5} value={formData.description} func={(e) => setFormData((prev) => ({
							...prev,
							description: e.target.value
						}))}/>
					</Grid>
				</Grid>

				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={3}>
						<MyDatePickerNew
							label="Дата начала"
							value={formData.date_start}
							func={(e) => setFormData((prev) => ({...prev, date_start: e}))}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<MyDatePickerNew
							label="Дата окончания"
							value={formData.date_end}
							func={(e) => setFormData((prev) => ({...prev, date_end: e}))}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<Autocomplete
							size="small"
							options={[0, 1, 2]}
							getOptionLabel={(option) => {
								switch (option) {
									case 0:
										return 'Вся сеть';
									case 1:
										return 'В городе';
									case 2:
										return 'На точке';
									default:
										return option;
								}
							}}
							value={formData.where_active}
							onChange={(_, value) => {
								setFormData((prev) => ({...prev, where_active: value}))
							}}
							renderInput={(params) => <TextField {...params} label="Где работает"/>}
							sx={{mb: 2}}
						/>
					</Grid>
					{formData.where_active === 2 && (
						<Grid item xs={12} sm={3}>
							<MyAutocomplite label="Точки" data={points} multiple={true} value={formData.point_ids} func={(event, data) => {
								setFormData((prev) => ({...prev, point_ids: data}))
							}}
							/>
						</Grid>
					)}
					{formData.where_active === 1 && (
						<Grid item xs={12} sm={3}>
							<MyAutocomplite label="Город" data={cities} multiple={true} value={formData.city_ids} func={(event, data) => {
								setFormData((prev) => ({...prev, city_ids: data}))
							}}
							/>
						</Grid>
					)}
				</Grid>
				
				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={12}><Typography>Условие</Typography></Grid>
					<Grid item xs={12} sm={3}>
						<MyCheckBox
							label="На первый заказ клиента"
							value={!!formData.order_type}
							func={(_, value) => {
								setFormData((prev) => ({...prev, order_type: +value}))
							}}
						/>
					
					</Grid>
					<Grid item xs={12} sm={3}>
						<MyTextInput label="Сумма заказа от" value={formData.sum_order} type="number" func={(e) => setFormData((prev) => ({
							...prev,
							sum_order: e.target.value
						}))}/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<Autocomplete
							size="small"
							multiple
							options={['Кафе', 'Контакт-центр', 'Клиент']}
							value={formData.pay_type}
							onChange={(_, value) => {
								setFormData((prev) => ({...prev, pay_type: value}))
							}}
							renderInput={(params) => <TextField {...params} label="Тип оформления"/>}
							sx={{mb: 2}}
						/>
					</Grid>
					
				</Grid>
				<Grid container spacing={2} style={{marginBottom: 16}}>
					<Grid item xs={12} sm={3}>
						<Autocomplete
							size="small"
							options={[0, 1]}
							getOptionLabel={(option) => {
								switch (option) {
									case 0:
										return 'Блюдо';
									case 1:
										return 'Категория';
									default:
										return option;
								}
							}}
							value={formData.in_order}
							onChange={(_, value) => {
								setFormData((prev) => ({...prev, in_order: value}))
							}}
							renderInput={(params) => <TextField {...params} label="В заказе есть"/>}
							sx={{mb: 2}}
						/>
					</Grid>
						{formData.in_order === 0 && (
							<Grid item xs={12} sm={3}>
								<MyAutocomplite label="Блюда" data={items} multiple={true} value={formData.items_ids} func={(event, data) => {
									setFormData((prev) => ({...prev, items_ids: data}))
								}}
								/>
							</Grid>
						)}
						{formData.in_order === 1 && (
							<Grid item xs={12} sm={3}>
								<MyAutocomplite label="Категории" data={categories} multiple={true} value={formData.category_ids} func={(event, data) => {
									setFormData((prev) => ({...prev, category_ids: data}))
								}}
								/>
							</Grid>
						)}

				</Grid>
				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={12}><Typography>Добавляемая позиция</Typography></Grid>
					<Grid item xs={12} sm={3}>
						<MyTextInput label="Название на сборке" value={formData.name_pack} func={(e) => setFormData((prev) => ({
							...prev,
							name_pack: e.target.value
						}))}/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					color="primary"
					onClick={saveNewAder}
				>
					Добавить
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ModalUpdateAder = ({open, onClose, getData, id, setIsLoad, setErrStatus, setErrText, setOpenAlert}) => {
	const [formData, setFormData] = useState({
		date_start: null,
		date_end: null,
		where_active: 0,
		city_ids: [],
		point_ids: [],
		name: '',
		description: '',
		order_type: 0,
		pay_type: [],
		sum_order: 0,
		in_order: 0,
		items_ids: [],
		category_ids: [],
		name_pack: ''
	});
	const [points, setPoints] = useState([]);
	const [cities, setCities] = useState([]);
	const [items, setItems] = useState([]);
	const [categories, setCategories] = useState([]);

	const updateNewAder = () => {
		const formatData = {
			...formData,
			date_start: dayjs(formData.date_start).format('YYYY-MM-DD'),
			date_end: dayjs(formData.date_end).format('YYYY-MM-DD'),
			point_ids: formData.point_ids.map((el) => el.id).join(','),
			items_ids: formData.items_ids.map((el) => el.id).join(','),
			city_ids: formData.city_ids.map((el) => el.id).join(','),
			category_ids: formData.category_ids.map((el) => el.id).join(','),
			pay_type: formData.pay_type.join(',')
		}
		getData('update_ader', {formatData, id}).then(data => {
			if (!data.st) {
				setErrStatus(data.st);
				setErrText(data.text);
				setOpenAlert(true);
			} else {
				onClose();
			}
		})
	}

	useEffect(() => {
		getData('get_one_ader', {id}).then((data) => {
			setPoints(data.points);
			setItems(data.items);
			setFormData({
				...data.form_data,
				date_start: dayjs(data.form_data.date_start),
				date_end: dayjs(data.form_data.date_end),
				pay_type: data.form_data.pay_type.split(','),
				point_ids: data.points.filter((el) => data.form_data.point_ids.split(',').map(Number).includes(el.id)),
				items_ids: data.items.filter((el) => data.form_data.items_ids.split(',').map(Number).includes(el.id)),
				city_ids: data.cities.filter((el) => data.form_data.city_ids.split(',').map(Number).includes(el.id)),
				category_ids: data.categories.filter((el) => data.form_data.category_ids.split(', ').map(Number).includes(el.id)),
			});
			setCities(data.cities);
			setCategories(data.categories);
		})
	}, [])

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth TransitionComponent={Slide}
						TransitionProps={{direction: 'up'}}>
			<DialogTitle>Изменение {formData.name}</DialogTitle>
			<DialogContent>
				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={12}><Typography> Общее</Typography></Grid>
					<Grid item xs={12} sm={3}>
						<MyTextInput label="Название" value={formData.name} func={(e) => setFormData((prev) => ({
							...prev,
							name: e.target.value
						}))}/>
					</Grid>
					<Grid item xs={12} sm={6}>
						<MyTextInput label="Описание" multiline={true} maxRows={5} value={formData.description} func={(e) => setFormData((prev) => ({
							...prev,
							description: e.target.value
						}))}/>
					</Grid>
				</Grid>

				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={3}>
						<MyDatePickerNew
							label="Дата начала"
							value={formData.date_start}
							func={(e) => setFormData((prev) => ({...prev, date_start: e}))}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<MyDatePickerNew
							label="Дата окончания"
							value={formData.date_end}
							func={(e) => setFormData((prev) => ({...prev, date_end: e}))}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<Autocomplete
							size="small"
							options={[0, 1, 2]}
							getOptionLabel={(option) => {
								switch (option) {
									case 0:
										return 'Вся сеть';
									case 1:
										return 'В городе';
									case 2:
										return 'На точке';
									default:
										return option;
								}
							}}
							value={formData.where_active}
							onChange={(_, value) => {
								setFormData((prev) => ({...prev, where_active: value}))
							}}
							renderInput={(params) => <TextField {...params} label="Где работает"/>}
							sx={{mb: 2}}
						/>
					</Grid>
					{formData.where_active === 2 && (
						<Grid item xs={12} sm={3}>
							<MyAutocomplite label="Точки" data={points} multiple={true} value={formData.point_ids} func={(_, data) => {
								setFormData((prev) => ({...prev, point_ids: data}))
							}}
							/>
						</Grid>
					)}
					{formData.where_active === 1 && (
						<Grid item xs={12} sm={3}>
							<MyAutocomplite label="Город" data={cities} multiple={true} value={formData.city_ids} func={(_, data) => {
								setFormData((prev) => ({...prev, city_ids: data}))
							}}
							/>
						</Grid>
					)}
				</Grid>

				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={12}><Typography>Условие</Typography></Grid>
					<Grid item xs={12} sm={3}>
						<MyCheckBox
							label="На первый заказ клиента"
							value={!!formData.order_type}
							func={(_, value) => {
								setFormData((prev) => ({...prev, order_type: +value}))
							}}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<MyTextInput label="Сумма заказа от" value={formData.sum_order} type="number" func={(e) => setFormData((prev) => ({
							...prev,
							sum_order: e.target.value
						}))}/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<Autocomplete
							size="small"
							multiple
							options={['Кафе', 'Контакт-центр', 'Клиент']}
							value={formData.pay_type}
							onChange={(_, value) => {
								setFormData((prev) => ({...prev, pay_type: value}))
							}}
							renderInput={(params) => <TextField {...params} label="Тип оформления"/>}
							sx={{mb: 2}}
						/>
					</Grid>
</Grid>
				<Grid container spacing={2} style={{marginBottom: 16}}>
					<Grid item xs={12} sm={3}>
						<Autocomplete
							size="small"
							options={[0, 1]}
							getOptionLabel={(option) => {
								switch (option) {
									case 0:
										return 'Блюдо';
									case 1:
										return 'Категория';
									default:
										return option;
								}
							}}
							value={formData.in_order}
							onChange={(_, value) => {
								setFormData((prev) => ({...prev, in_order: value}))
							}}
							renderInput={(params) => <TextField {...params} label="В заказе есть"/>}
							sx={{mb: 2}}
						/>
					</Grid>
						{formData.in_order === 0 && (
							<Grid item xs={12} sm={3}>
								<MyAutocomplite label="Блюда" data={items} multiple={true} value={formData.items_ids} func={(event, data) => {
									setFormData((prev) => ({...prev, items_ids: data}))
								}}
								/>
							</Grid>
						)}
						{formData.in_order === 1 && (
							<Grid item xs={12} sm={3}>
								<MyAutocomplite label="Категории" data={categories} multiple={true} value={formData.category_ids} func={(event, data) => {
									setFormData((prev) => ({...prev, category_ids: data}))
								}}
								/>
							</Grid>
						)}
				</Grid>
				<Grid container spacing={2} style={{marginBottom: 16, marginTop: 4}}>
					<Grid item xs={12} sm={12}><Typography>Добавляемая позиция</Typography></Grid>
					<Grid item xs={12} sm={3}>
						<MyTextInput label="Название на сборке" value={formData.name_pack} func={(e) => setFormData((prev) => ({
							...prev,
							name_pack: e.target.value
						}))}/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					color="primary"
					onClick={updateNewAder}
				>
					Сохранить
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ModalDelete = ({open, onClose, onDelete, date}) => {

	const handleSubmit = () => {
		onDelete(date.date_start);
		handleClose();
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Вы точно хотите удалить изменения?</DialogTitle>
			<DialogActions>
				<Button onClick={handleClose}>Нет</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
				>
					Да
				</Button>
			</DialogActions>
		</Dialog>
	);
};

function SettingsPage() {
	const tabsData = {
		birth_promo: 'Промокод на день рождения',
		order_adver: 'Реклама в заказ'
	};

	const [isLoad, setIsLoad] = useState(false);
	const [value, setValue] = useState('birth_promo');
	const [mockItems, setMockItems] = useState([]);
	const [points, setPoints] = useState([]);
	const [point, setPoint] = useState([]);
	const [module, setModule] = useState({});
	const [dateStart, setDateStart] = useState(null);
	const [dateEnd, setDateEnd] = useState(null);
	const [openAlert, setOpenAlert] = useState(false);
	const [errStatus, setErrStatus] = useState(false);
	const [errText, setErrText] = useState('');
	const [tabs, setTabs] = useState(tabsData);
	const [openAder, setOpenAder] = useState(false);
	const [itemId, setItemId] = useState(0);
	const [openUpdateAder, setOpenUpdateAder] = useState(false);
	const [activeAder, setActiveAder] = useState([]);
	const [disableAder, setDisableAder] = useState([]);

	useEffect(() => {
		getData('get_all').then((data) => {
			document.title = data.module_info.name;
			setModule(data.module_info);
			setPoints(data.points);
			setMockItems(data.items);
			const tabsCheck = Object.entries(tabsData).filter(([key]) => data.acces[key] === '1');
			setTabs(Object.fromEntries(tabsCheck));
		});
	}, []);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const getAders = () => {

		const data = {
			dateStart: dayjs(dateStart).format('YYYY-MM-DD'),
			dateEnd: dayjs(dateEnd).format('YYYY-MM-DD'),
			points: point
		};

		getData('get_aders', data).then((data) => {
			if (!data.st) {
				setErrStatus(data.st);
				setErrText(data.text);
				setOpenAlert(true);
			} else {
				setActiveAder(data.activeOrders);
				setDisableAder(data.inactiveOrders);
			}
		})
	}
	const getData = async (method, data = {}) => {
		setIsLoad(true);

		try {
			const result = await api_laravel('settings', method, data);
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
			{openAder ? <ModalAder open={openAder} onClose={() => setOpenAder(false)} getData={getData} setIsLoad={setIsLoad} setErrStatus={setErrStatus} setErrText={setErrText} setOpenAlert={setOpenAlert} /> : null}
			{openUpdateAder ?
				<ModalUpdateAder open={openUpdateAder} onClose={() => setOpenUpdateAder(false)} getData={getData} id={itemId} setIsLoad={setIsLoad} setErrStatus={setErrStatus} setErrText={setErrText} setOpenAlert={setOpenAlert} /> : null}
			<Grid item xs={12} sm={12} container spacing={3} mb={3} className="container_first_child">
				<Grid item xs={12} sm={12}>
					<h1>{module.name}</h1>
				</Grid>
				<Grid item xs={12} sm={12} style={{paddingBottom: 24}}>
					<Paper>
						<TabContext value={value}>
							<Tabs
								value={value}
								onChange={handleChange}
								variant="scrollable"
								scrollButtons={false}
							>
								{Object.entries(tabs).map(([key, value]) => <Tab label={value} value={key} key={key}/>)}
							</Tabs>
						</TabContext>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
					<TabContext value={value}>
						<TabPanel value="birth_promo">
							<PromoCodeForm
								mockItems={mockItems}
								getData={getData}
								setIsLoad={setIsLoad}
								setErrStatus={setErrStatus}
								setErrText={setErrText}
								setOpenAlert={setOpenAlert}
							/>
						</TabPanel>
						<TabPanel value="order_adver">
							<Grid container spacing={2} style={{marginBottom: 16}}>
								<Grid item xs={12} sm={3}>
									<MyAutocomplite label="Точки" data={points} multiple={true} value={point} func={(event, data) => {
										setPoint(data)
									}}/>
								</Grid>
								<Grid item xs={12} sm={2}>
									<MyDatePickerNew
										label="Дата начала"
										value={dateStart}
										func={(e) => setDateStart(formatDate(e))}
									/>
								</Grid>
								<Grid item xs={12} sm={2}>
									<MyDatePickerNew
										label="Дата окончания"
										value={dateEnd}
										func={(e) => setDateEnd(formatDate(e))}
									/>
								</Grid>
								<Grid item xs={12} sm={3}>
									<Button
										variant="contained"
										color="primary"
										onClick={() => getAders()}
									>
										Показать отчет
									</Button>
								</Grid>
								<Grid item xs={12} sm={2}>
									<Button
										variant="contained"
										color="primary"
										onClick={() => setOpenAder(true)}
									>
										Добавить рекламу
									</Button>
								</Grid>
							</Grid>
							{activeAder.length ? (
								<Grid item xs={12} style={{marginBottom: '24px'}}>
									<Card elevation={3}>
										<CardHeader
											title="Активные"
											titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
										/>
										<Divider/>
										<TableContainer>
											<Table>
												<TableHead>
													<TableRow>
														<TableCell>#</TableCell>
														<TableCell align="left"><b>Название</b></TableCell>
														<TableCell align="center"><b>Дата начала</b></TableCell>
														<TableCell align="center"><b>Дата окончания</b></TableCell>
														<TableCell align="center"><b>Где активно</b></TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{activeAder.map((row, index) => (
														<TableRow
															key={index}
															sx={{ cursor: 'pointer' }}
															onClick={() => {
															setItemId(row.id);
															setOpenUpdateAder(true)
														}}>
															<TableCell>{index + 1}</TableCell>
															<TableCell align="left">{row.name}</TableCell>
															<TableCell align="center">{row.date_start}</TableCell>
															<TableCell align="center">{row.date_end}</TableCell>
															<TableCell align="center">{row.where_active}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									</Card>
								</Grid>
							) : null}
							{disableAder.length ? (
								<Grid item xs={12} style={{marginBottom: '24px'}}>
									<Card elevation={3}>
										<CardHeader
											title="Не активные"
											titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
										/>
										<Divider/>
										<TableContainer>
											<Table>
												<TableHead>
													<TableRow>
														<TableCell>#</TableCell>
														<TableCell align="left"><b>Название</b></TableCell>
														<TableCell align="center"><b>Дата начала</b></TableCell>
														<TableCell align="center"><b>Дата окончания</b></TableCell>
														<TableCell align="center"><b>Где активно</b></TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{disableAder.map((row, index) => (
														<TableRow
															key={index}
															sx={{ cursor: 'pointer' }}
															onClick={() => {
															setItemId(row.id);
															setOpenUpdateAder(true)
														}}>
															<TableCell>{index + 1}</TableCell>
															<TableCell align="left">{row.name}</TableCell>
															<TableCell align="center">{row.date_start}</TableCell>
															<TableCell align="center">{row.date_end}</TableCell>
															<TableCell align="center">{row.where_active}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									</Card>
								</Grid>
							) : null}
						</TabPanel>
					</TabContext>
				</Grid>
			</Grid>
		</>
	);
}

export default function Settings() {
	return <SettingsPage/>;
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
