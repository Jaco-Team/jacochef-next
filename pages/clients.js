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
import {MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput, TextEditor22} from "@/ui/elements";
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

const DialogUser = ({open , onClose, user}) => {
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
											<TableRow key={key} hover style={{cursor: 'pointer'}}>
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

function ClientPage() {
	const [isLoad, setIsLoad] = useState(false);
	const [module, setModule] = useState({});
	const [points, setPoints] = useState([]);
	const [items, setItems] = useState([]);
	const [users, setUsers] = useState([]);
	const [user, setUser] = useState([]);
	const [url, setUrl] = useState('');
	const [openModalUser, setOpenModalUser] = useState(false);
	const typeParam = [{id: 'all' , name: 'Найти всех'}, {id: 'new' , name: 'Только новые'}, {id: 'current' , name: 'Только текущих'}]
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
		param: {id: 'all' , name: 'Найти всех'},
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
		getData('get_users', formData).then((data) => {
			if (data.users) {
				setUsers(data.users);
				setUrl(data.url);
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
			<DialogUser open={openModalUser} onClose={() => setOpenModalUser(false)} user={user}/>
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
                    {users.map((item, i) => (
                      <TableRow key={i} style={{ cursor: 'pointer' }} onClick={() => openUser(item.login)}>
                        <TableCell>{i + 1}</TableCell>
												<TableCell>{item.name} {item.number_new_active ? (<span style={{color: 'red', fontWeight: 'bold'}}> Новый!</span>) : ''}</TableCell>
                        <TableCell>{item.login}</TableCell>
                        <TableCell dangerouslySetInnerHTML={{__html: item?.last_comment}}></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
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
