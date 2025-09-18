import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {api_laravel} from "@/src/api_new";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import {MyAlert, MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput} from "@/ui/elements";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import TableFooter from "@mui/material/TableFooter";
import ModalOrder from "./ModalOrder";


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


export default function Clients() {
	const [isLoad, setIsLoad] = useState(false);
	const [module, setModule] = useState({});
	const [points, setPoints] = useState([]);
	const [items, setItems] = useState([]);
	const [users, setUsers] = useState([]);
	const [total, setTotal] = useState(0)
	const [user, setUser] = useState([]);
	const [url, setUrl] = useState('');
	const [urlCsv, setUrlCsv] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
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
		promo: '',
		no_promo: false,
		param: {id: 'all', name: 'Найти всех'},
		is_show_marketing: false,
		point: [],
		preset: '',
		item: []
	});

	// const router = useRouter();

	const showAlert = (status, message) => {
		setErrStatus(status);
		setErrText(message);
		setOpenAlert(true);
	}

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
		let value;
		const directValueFields = [
			'date_start_true',
			'date_end_true',
			'date_start_false',
			'date_end_false',
			'point',
			'item',
			'param',
		];
		const checkedFields = [
			'is_show_claim',
			'is_show_claim_last',
			'is_show_marketing',
			'no_promo',
		];

		if (directValueFields.includes(name)) {
			value = e;
		} else if (checkedFields.includes(name)) {
			value = e.target.checked;
		} else {
			value = e.target.value; 
		}
		setFormData((prev) => {
			if (name === 'promo') {
				return {
					...prev,
					promo: value,
					no_promo: value ? 0 : prev.no_promo, // clear checkbox if promo set
				};
			}

			if (name === 'no_promo') {
				return {
					...prev,
					no_promo: value,
					promo: value ? '' : prev.promo, // clear promo if checkbox set
				};
			}

			return {
				...prev,
				[name]: value,
			};
		});
	};

	const getUsers = (customPage = null, customPerPage = null) => {
		const currentPage = customPage && typeof customPage === 'number' ? customPage : page;
		const currentPerPage = customPerPage && typeof customPerPage === 'number' ? customPerPage : rowsPerPage;
		getData('get_users', {
			...formData,
			date_start_true: dayjs(formData.date_start_true).format('YYYY-MM-DD'),
			date_end_true: dayjs(formData.date_end_true).format('YYYY-MM-DD'),
			date_start_false: dayjs(formData.date_start_false).format('YYYY-MM-DD'),
			date_end_false: dayjs(formData.date_end_false).format('YYYY-MM-DD'),
			page: currentPage + 1,
			perPage: currentPerPage,

		}).then((data) => {
			if (data?.users) {
				setUsers(data.users);
				setTotal(data.total);
				setUrl(data.url);
				setUrlCsv(data.urlCsv);
			} else {
				showAlert(data.st, data.text);
			}
		})
	}

	const getFileLinks = async (format) => {
    if (url && urlCsv) {
      return {url, urlCsv};
    }
    try {
      const data = await getData("get_clients_files", {
        ...formData,
        date_start_true: dayjs(formData.date_start_true).format("YYYY-MM-DD"),
        date_end_true: dayjs(formData.date_end_true).format("YYYY-MM-DD"),
        date_start_false: dayjs(formData.date_start_false).format("YYYY-MM-DD"),
        date_end_false: dayjs(formData.date_end_false).format("YYYY-MM-DD"),
      });
      if (!data?.url || !data.urlCsv) throw new Error("Ссылка для скачивания недоступна");
      setUrl(data.url);
      setUrlCsv(data.urlCsv);

			return {url: data.url, urlCsv: data.urlCsv};
    } catch (error) {
			showAlert(false, error.message);
      console.error("Error getting files", error);
    }
  };

	const onDownload = async (e) => {
		e.preventDefault();
		const {url} = await getFileLinks();
		if(!url) return;
		const link = document.createElement('a');
		link.href = url;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.click();
	};

	const onDownloadCsv = async (e) => {
		e.preventDefault();
		const {urlCsv} = await getFileLinks();
		if(!urlCsv) return;
		const link = document.createElement('a');
		link.href = urlCsv;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.click();
	};

	const getData = async (method, data = {}) => {
		setIsLoad(true);
		try {
			const result = await api_laravel('site_clients', method, data);
			return result.data;
		} catch (error) {
			console.error('Error fetching data:', error);
			return null;
		} finally {
			setIsLoad(false);
		}
	};

	useEffect(() => {
		getData('get_all').then((data) => {
			setModule(data.module_info);
			setPoints(data.points);
			setItems(data.items);
		});
	}, []);

	useEffect(() => {
		if (formData.param.id === 'new') {
			setFormData((prev) => ({
				...prev,
				date_start_false: null,
				date_end_false: null,
			}));
		}
	}, [formData.param]);

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
						<Button variant="contained" style={{whiteSpace: 'nowrap'}} onClick={() => getUsers()}>
							Получить список клиентов
						</Button>
					</Grid>

					<Grid>
						<Button
							variant="contained"
							style={{marginLeft: 10, backgroundColor: !!url ? '#3cb623ff' : '#ffcc00'}}
							disabled={!users.length}
							onClick={onDownload}
						>
							<DownloadIcon/>
							Excel
						</Button>
					</Grid>
					<Grid>
						<Button
							variant="contained"
							style={{marginLeft: 10, backgroundColor: !!urlCsv ? '#3cb62388' : 'rgba(215,184,111,0.55)'}}
							disabled={!users.length}
							onClick={onDownloadCsv}
						>
							<DownloadIcon/>
							CSV
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
			<Grid container spacing={3} justifyContent="center">
				<Grid item xs={7} sm={3}>
					<MyTextInput
						label="Промокод"
						value={formData.promo}
						func={(e) => handleChange(e, 'promo')}
					/>
				</Grid>

				<Grid item xs={5} sm={6}>
					<MyCheckBox
						label="Заказ без промокода"
						value={formData.no_promo}
						func={(e) => handleChange(e, 'no_promo')}
					/>
				</Grid>
			</Grid>
				{!users.length ? null : (
					<Grid container justifyContent="center" mt={3}>
						<Grid item xs={12}>
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
										{users.map((item, i) => (
											<TableRow
												key={i + 1}
												style={{cursor: 'pointer'}}
												onClick={() => openUser(item.login)}
											>
												<TableCell>{page * rowsPerPage + i + 1}</TableCell>
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
								count={total}
								rowsPerPage={rowsPerPage}
								page={page}
								onPageChange={(_, newPage) => {
									setPage(newPage);
									getUsers(newPage);
								}}
								onRowsPerPageChange={(event) => {
									const newPerPage = parseInt(event.target.value, 10);
									setRowsPerPage(newPerPage);
									setPage(0);
									getUsers(0, newPerPage);
								}}
							/>
						</Grid>
					</Grid>
				)}
			<Grid container spacing={3} justifyContent="center" mb={3}>
				<Grid item xs={12} sm={1}>
				</Grid>
				<Grid item xs={12} sm={3}>
				</Grid>
			</Grid>
		</>
	);
}
