import React, {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import {api_laravel, api_laravel_local} from '@/src/api_new';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {CalendarToday, Person, VpnKey, Work} from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import {Timeline} from "@mui/lab";
import Card from "@mui/material/Card";
import {CardContent} from "@mui/material";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {MyAutocomplite, MyTextInput} from "@/components/shared/Forms";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Cookies from "js-cookie";
import MyAlert from '@/components/shared/MyAlert';
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import dayjs from "dayjs";

function LkPage() {
	const [isLoad, setIsLoad] = useState(false);
	const [module, setModule] = useState({});
	const [my, setMy] = useState({});
	const [openAlert, setOpenAlert] = useState(false);
	const [errStatus, setErrStatus] = useState(false);
	const [errText, setErrText] = useState('');
	const [points, setPoints] = useState([]);
	const [point, setPoint] = useState({});
	const [revs, setRevs] = useState([]);
	const [rev, setRev] = useState({});
	const [events, setEvents] = useState([]);
	const [dateStart, setDateStart] = useState('');
	const [dateEnd, setDateEnd] = useState('');

	useEffect(() => {
		getData('get_all').then((data) => {
			document.title = data.module_info.name;
			setModule(data.module_info);
			setPoints(data.points);
			setMy(data.my);
		});
	}, []);

	useEffect(() => {
		if (point.id) {
			getData('get_revs', {point_id: point.id}).then((data ) => {
			setRevs(data.revs);
		});
		}
	}, [point]);

	const getData = async (method, data = {}) => {
		setIsLoad(true);

		try {
			const result = await api_laravel('revizion_calc', method, data);
			return result.data;
		} finally {
			setIsLoad(false);
		}
	};

	const showAlert = (status, message) => {
		setErrStatus(status);
		setErrText(message);
		setOpenAlert(true);
	}

	const showData = () => {
		getData('get_events', {point_id: point.id, rev_id: rev.id}).then((data ) => {
			setEvents(data.cat);
			setDateStart(dayjs(data.date_start).format('DD.MM.YYYY'));
			setDateEnd(dayjs(data.date_end).format('DD.MM.YYYY'));
		}
		);
	}

	function formatRussianNumber(number) {
		return new Intl.NumberFormat('ru-RU').format(number);
	}

	return (
		<Grid
			container
			spacing={3}
			mb={3}
			className="container_first_child"
			size={{
				xs: 12,
				sm: 12
			}}>
			<Backdrop style={{zIndex: 99}} open={isLoad}>
				<CircularProgress color="inherit"/>
			</Backdrop>
			<MyAlert
				isOpen={openAlert}
				onClose={() => setOpenAlert(false)}
				status={errStatus}
				text={errText}
			/>
			<Grid
				size={{
					xs: 12,
					sm: 12
				}}>
				<h1>{module.name}</h1>
			</Grid>
			<Grid
				size={{
					xs: 12,
					sm: 6
				}}>
				<MyAutocomplite data={points} value={point} func={(event, data) => {
					setPoint(data);
				}} multiple={false} label='Точка'/>
			</Grid>
			<Grid
				size={{
					xs: 12,
					sm: 6
				}}>
				<MyAutocomplite data={revs} value={rev} func={(event, data) => {
					setRev(data);
				}} multiple={false} label='Ревизия'/>
			</Grid>
			<Grid
				size={{
					xs: 12,
					sm: 12
				}}>
				<Button variant="contained" color="primary" onClick={showData}>Показать</Button>
			</Grid>
			{events.length ? (
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>#</TableCell>
							<TableCell>Заготовка</TableCell>
							<TableCell>Выбранная рев-я</TableCell>
							<TableCell>Накладные</TableCell>
							<TableCell>Расход</TableCell>
							<TableCell>Списание</TableCell>
							<TableCell>Последняя рев-я</TableCell>
							<TableCell>Результат</TableCell>
							<TableCell>Ед измер</TableCell>
						</TableRow>
						<TableRow>
							<TableCell></TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
							<TableCell>Кол-во заготовок по накладным от числа до последней ревизии (не включая день последней ревизии)</TableCell>
							<TableCell>Кол-во заготовок по проданным позициям со списанием от числа до последней ревизии (не включая день последней ревизии)</TableCell>
							<TableCell>От выбранной ревизии до последней (не включая день последней ревизии)</TableCell>
							<TableCell>Последняя ревизия</TableCell>
							<TableCell>Р.посл - (Р.выб + Нак - Рас - Спис) =</TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell></TableCell>
							<TableCell></TableCell>
							<TableCell>{dateStart}</TableCell>
							<TableCell>{dateStart} - {dateEnd}</TableCell>
							<TableCell>{dateStart} - {dateEnd}</TableCell>
							<TableCell>{dateStart} - {dateEnd}</TableCell>
							<TableCell>{dateEnd}</TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{events.map((it, k) =>
							<>
							<TableRow hover key={k} style={{backgroundColor: '#E5E4E2'}}>
								<TableCell></TableCell>
								<TableCell>{it.name}</TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
							</TableRow>
								{it.items.map((item, id) => {
									return (
										<TableRow hover key={id}>
											<TableCell>{id + 1}</TableCell>
											<TableCell>{item.name}</TableCell>
											<TableCell>{formatRussianNumber(item.first_rev)}</TableCell>
											<TableCell>{formatRussianNumber(item.bill_val)}</TableCell>
											<TableCell>{formatRussianNumber(item.ras_pf)}</TableCell>
											<TableCell>{formatRussianNumber(item.spis)}</TableCell>
											<TableCell>{formatRussianNumber(item.last_rev)}</TableCell>
											<TableCell>{formatRussianNumber(item.res)}</TableCell>
											<TableCell>{item.ei_name}</TableCell>
										</TableRow>
									)
								})}
							</>
						)}
					</TableBody>
				</Table>
			) : null}
		</Grid>
	);
}

export default function FeedBack() {
	return <LkPage/>;
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
