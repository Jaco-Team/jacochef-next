import React, {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import {useRouter} from 'next/router';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import {api_laravel, api_laravel_local} from '@/src/api_new';
import Paper from "@mui/material/Paper";
import TabContext from "@mui/lab/TabContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import {formatDate, MyAlert, MyAutocomplite, MyDatePickerNewViews} from "@/ui/elements";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import 'dayjs/locale/ru';
import ModalSettings from "@/components/service_indicators/ModalSettings";
import PerformanceTable from "@/components/service_indicators/PerfomanceTable";
import PerformanceTableYears from "@/components/service_indicators/PerfomanceTableYears";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import TableHead from "@mui/material/TableHead";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

function IndicatorsPage() {
	const [isLoad, setIsLoad] = useState(false);
	const [module, setModule] = useState({});
	const [value, setValue] = useState('average_time');
	const [activeTab, setActiveTab] = useState('table_month');
	const [point, setPoint] = useState([]);
	const [points, setPoints] = useState([]);
	const [dateStart, setDateStart] = useState(null);
	const [dateEnd, setDateEnd] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [tableDataYear, setTableDataYear] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const [typeModal, setTypeModal] = useState(null);
	const [colorEdit, setColorEdit] = useState(null);
	const [valueEdit, setValueEdit] = useState(null);
	const [nameRow, setNameRow] = useState('');
	const [itemType, setItemType] = useState('');
	const [statFutureTimes, setStatFutureTimes] = useState([]);
	const [statPrevTimes, setStatPrevTimes] = useState([]);
	const [openAlert, setOpenAlert] = useState(false);
	const [itemIdEdit, setItemIdEdit] = useState('');
	const [errStatus, setErrStatus] = useState(false);
	const [errText, setErrText] = useState('');
	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.locale('ru');
	dayjs.tz.setDefault('Europe/Samara');
	const [rowClients, setRowClients] = useState([
		{
			id: 1,
			name: '1.Время',
			fontWeight_name: 'bold',
			color_name: '#fff',
			backgroundColor_name: '#B22222',
			type: 'times',
			data: []
		},
	]);
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const handleChangeTab = (event, newValue) => {
		setActiveTab(newValue);
	};
	const router = useRouter();
	const tabsData = {
		average_time: 'Время приготовленя',
	};

	useEffect(() => {
		getData('get_all').then((data) => {
			document.title = data.module_info.name;
			setModule(data.module_info);
			setPoints(data.points);
		});
	}, []);

	const getSettings = () => {
		getData('get_settings').then((data) => {
			const rowCl = [...rowClients];
			rowCl[0].data = data.stat_times.map((item) => {
				if (item.type === 'times') {
					return {
						id: item.id,
						value: item.value,
						value_range: `${item.max_value} - ${item.min_value}`,
						backgroundColor: item.value_color,
					};
				}
			});
			setStatFutureTimes(data.stat_future_times);
			setStatPrevTimes(data.stat_prev_times);
			setRowClients(rowCl)
		})
	}

	useEffect(() => {
		if (activeTab === 'settings') {
			getSettings();
		}

		if (activeTab === 'table_month' || activeTab === 'table_year') {
			setDateStart(null);
			setDateEnd(null);
			setPoint([]);
		}
	}, [activeTab]);
	const getData = async (method, data = {}) => {
		setIsLoad(true);

		try {
			const result = await api_laravel('service_indicators', method, data);
			return result.data;
		} finally {
			setIsLoad(false);
		}
	};

	const getTableData = () => {
		const res = {
			date_start: dateStart,
			date_end: dateEnd,
			point: point
		};
		getData('get_data', res).then((data) => {
			setTableData(data.result);
		});
	}

	const getTableDataYear = () => {
		const res = {
			date_start: dateStart,
			date_end: dateEnd,
			point: point
		};
		getData('get_data_year', res).then((data) => {
			setTableDataYear(data.result);
		});
	}

	const maxDataLength_cliens = Math.max(...rowClients.map(r => (r.data?.length || 0)));
	const tableWidth_clietns = Math.max(500, maxDataLength_cliens * 150 + 500);
	const cellStyles = {
		name: {
			border: '1px solid #ccc',
			minHeight: '15px',
			width: '400px',
			position: 'sticky',
			left: 0,
			zIndex: 20,
		},
		default: {
			border: '1px solid #ccc',
			minHeight: '15px',
			width: '150px',
		},
	};

	const save_sett_rate_clients = async (data) => {
		if (typeModal === 'edit') {
			data.id = itemIdEdit;
		}

		data.type = typeModal;
		data.item_type = itemType;
		data.date_start = dayjs(data.date_start).local().format('YYYY-MM-DD');

		if (data.item_type === 'orders') {
			const numericValue = Number(data.value);
			if (numericValue > 0 && numericValue < 1) {
				data.value = Math.round(numericValue * 100);
			}
		}

		const res = await getData('save_sett', data);
		if (res.st) {
			getSettings();
		}
	}

	const delete_sett_rate_clients = async () => {

		const data = {
			id: itemIdEdit,
		}

		const res = await getData('delete_sett', data);
	}

	const openModalRate_clients = (type_modal, name_row, item_type, id, value_edit, color_edit) => {
		setValueEdit(value_edit);
		setColorEdit(color_edit);
		setItemIdEdit(id);
		setTypeModal(type_modal);
		setItemType(item_type);
		setNameRow(name_row.replace(/^\d+\./, '').toLowerCase().replace(/^./, char => char.toUpperCase()));
		setOpenModal(true);
	}


	return (
		<Grid item xs={12} sm={12} container spacing={3} mb={3} className="container_first_child">
			<Backdrop style={{zIndex: 99}} open={isLoad}>
				<CircularProgress color="inherit"/>
			</Backdrop>
			<MyAlert
				isOpen={openAlert}
				onClose={() => setOpenAlert(false)}
				status={errStatus}
				text={errText}
			/>
			<ModalSettings
				open={openModal}
				onClose={() => setOpenModal(false)}
				fullScreen={false}
				save={save_sett_rate_clients}
				value={valueEdit}
				type_modal={typeModal}
				color_edit={colorEdit}
				itemIdEdit={itemIdEdit}
				openAlert={(status, text) => {
					setOpenAlert(true);
					setErrStatus(status);
					setErrText(text);
				}}
				name_row={nameRow}
				delete={delete_sett_rate_clients}
			/>
			<Grid item xs={12} sm={6}>
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
							{Object.entries(tabsData).map(([key, value]) => <Tab label={value} value={key} key={key}/>)}
						</Tabs>
					</TabContext>
				</Paper>
			</Grid>
			<Grid item xs={12} sm={12} style={{paddingTop: 0}}>
				<TabContext value={value}>
					<TabPanel value="average_time">
						<Grid container spacing={3}>
							<Grid item xs={12} sm={12} style={{paddingBottom: 10, paddingTop: 0}}>
								<Paper>
									<Tabs
										value={activeTab}
										onChange={handleChangeTab}
										centered
										variant='fullWidth'
									>
										<Tab label="Таблица по месяцам" value="table_month"/>
										<Tab label="Таблица по годам" value="table_year"/>
										<Tab label="Настройки" value="settings"/>
									</Tabs>
								</Paper>
							</Grid>

							<Grid item xs={12} sm={12} style={{paddingBottom: 10}}>
								{activeTab === 'settings' && (
									<Grid container spacing={3}>
										<Grid item xs={12} sm={12} mt={3} mb={5}>
											<TableContainer style={{
												overflowX: 'auto',
												maxWidth: '100%',
												paddingBottom: 20,
												width: tableWidth_clietns
											}}>
												<Table size='small'>
													<TableBody>
														{rowClients.map((item, key) => (
															<TableRow key={key}>
																<TableCell
																	style={{
																		...cellStyles.name,
																		backgroundColor: item.backgroundColor_name || '#fff',
																		fontWeight: item.fontWeight_name,
																		color: item.color_name,
																		border: item?.name ? '1px solid #ccc' : 'none',
																	}}
																>
																	{item?.name ?? '\u00A0'}
																</TableCell>
																{item?.data.map((it, k) => (
																	<Tooltip
																		key={k}
																		title={<Typography color="inherit">Редактировать данные в ячейке</Typography>}
																	>
																		<TableCell
																			style={{
																				...cellStyles.default,
																				backgroundColor: it?.backgroundColor || '#fff',
																				textAlign: 'center',
																				fontWeight: '900',
																				cursor: 'pointer',
																				border: '1px solid #ccc'
																			}}
																			onClick={() => openModalRate_clients('edit', item.name, item.type, it.id, it.value, it.backgroundColor)}
																		>
																			{it?.value_range ?? 0}
																		</TableCell>
																	</Tooltip>
																))}
																{item?.name && (
																	<TableCell style={{border: 'none'}} onClick={() => openModalRate_clients('new', item.name, item.type, null, 0, null)}>
																		<Button variant='contained'>+</Button>
																	</TableCell>
																)}
															</TableRow>
														))}
													</TableBody>
												</Table>
											</TableContainer>
										</Grid>
										{!statFutureTimes.length ? null : (
											<Grid item xs={12} sm={12}>
												<Accordion>
													<AccordionSummary expandIcon={<ExpandMoreIcon/>}>
														<Typography>История изменений после {dayjs(new Date()).local().add(2, 'day').format('YYYY-MM-DD')}</Typography>
													</AccordionSummary>
													<AccordionDetails>
														<TableContainer>
															<Table>
																<TableHead>
																	<TableRow>
																		<TableCell style={{width: '10%'}}>#</TableCell>
																		<TableCell style={{width: '20%'}}>Тип</TableCell>
																		<TableCell style={{width: '20%'}}>Дата</TableCell>
																		<TableCell style={{width: '50%'}}></TableCell>
																	</TableRow>
																</TableHead>

																<TableBody>
																	{statFutureTimes.map((it, k) => (
																		<TableRow key={k}>
																			<TableCell>{k + 1}</TableCell>
																			<TableCell>{it.type}</TableCell>
																			<TableCell>{it.date_start}</TableCell>
																			<TableCell>{it.update_list.map((item) => {
																				if (item.type === 'times') {
																					return {
																						id: item.id,
																						value: item.value,
																						value_range: `${item.max_value} - ${item.min_value}`,
																						backgroundColor: item.value_color,
																					};
																				}
																			}).map((value, ind) => {
																				return (
																					<TableCell
																						style={{
																							...cellStyles.default,
																							backgroundColor: value?.backgroundColor || '#fff',
																							textAlign: 'center',
																							fontWeight: '900',
																							cursor: 'pointer',
																							border: value?.value === it.value ? '4px dashed blue': '1px solid #ccc'
																						}}
																					>
																						{value?.value_range ?? 0}
																					</TableCell>
																				)
																			})}</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</TableContainer>
													</AccordionDetails>
												</Accordion>
											</Grid>
										)}
										{!statPrevTimes.length ? null : (
											<Grid item xs={12} sm={12}>
												<Accordion>
													<AccordionSummary expandIcon={<ExpandMoreIcon/>}>
														<Typography>История изменений по {dayjs(new Date()).local().add(2, 'day').format('YYYY-MM-DD')}</Typography>
													</AccordionSummary>
													<AccordionDetails>
														<TableContainer>
															<Table>
																<TableHead>
																	<TableRow>
																		<TableCell style={{width: '10%'}}>#</TableCell>
																		<TableCell style={{width: '20%'}}>Тип</TableCell>
																		<TableCell style={{width: '20%'}}>Дата</TableCell>
																		<TableCell style={{width: '50%'}}></TableCell>
																	</TableRow>
																</TableHead>

																<TableBody>
																	{statPrevTimes.map((it, k) => (
																		<TableRow key={k}>
																			<TableCell>{k + 1}</TableCell>
																			<TableCell>{it.type}</TableCell>
																			<TableCell>{it.date_start}</TableCell>
																			<TableCell>{it.update_list.map((item) => {
																				if (item.type === 'times') {
																					return {
																						id: item.id,
																						value: item.value,
																						value_range: `${item.max_value} - ${item.min_value}`,
																						backgroundColor: item.value_color,
																					};
																				}
																			}).map((value, ind) => {
																				return (
																					<TableCell
																						style={{
																							...cellStyles.default,
																							backgroundColor: value?.backgroundColor || '#fff',
																							textAlign: 'center',
																							fontWeight: '900',
																							cursor: 'pointer',
																							border: value?.value === it.value ? '4px dashed blue': '1px solid #ccc'
																						}}
																					>
																						{value?.value_range ?? 0}
																					</TableCell>
																				)
																			})}</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</TableContainer>
													</AccordionDetails>
												</Accordion>
											</Grid>
										)}
									</Grid>
								)}
								{activeTab === 'table_month' && (
									<>
										<Grid container spacing={3} xs={12} sm={6}>

											<Grid item xs={12} sm={6}>
												<MyDatePickerNewViews
													label="Дата от"
													views={['month', 'year']}
													value={dateStart}
													func={(e) => setDateStart(formatDate(e))}
												/>
											</Grid>

											<Grid item xs={12} sm={6} style={{paddingLeft: 12}}>
												<MyDatePickerNewViews
													label="Дата до"
													views={['month', 'year']}
													value={dateEnd}
													func={(e) => setDateEnd(formatDate(e))}
												/>
											</Grid>

											<Grid item xs={12} sm={6}>
												<MyAutocomplite label="Точки" data={points} multiple={true} value={point} func={(event, data) => {
													setPoint(data)
												}}/>
											</Grid>

											<Grid item xs={12} sm={6}>
												<Button variant="contained" onClick={getTableData}>
													Показать
												</Button>
											</Grid>
										</Grid>
										<Grid item xs={12} sm={12} paddingTop={4}>
											{tableData.rows && <PerformanceTable dataTable={tableData}/>}
										</Grid>
									</>
								)}
								{activeTab === 'table_year' && (
									<>
										<Grid container spacing={3} xs={12} sm={6}>

											<Grid item xs={12} sm={6}>
												<MyDatePickerNewViews
													label="Дата от"
													views={['year']}
													value={dateStart}
													func={(e) => setDateStart(formatDate(e))}
												/>
											</Grid>

											<Grid item xs={12} sm={6} style={{paddingLeft: 12}}>
												<MyDatePickerNewViews
													label="Дата до"
													views={['year']}
													value={dateEnd}
													func={(e) => setDateEnd(formatDate(e))}
												/>
											</Grid>

											<Grid item xs={12} sm={6}>
												<MyAutocomplite label="Точки" data={points} multiple={true} value={point} func={(event, data) => {
													setPoint(data)
												}}/>
											</Grid>

											<Grid item xs={12} sm={6}>
												<Button variant="contained" onClick={getTableDataYear}>
													Показать
												</Button>
											</Grid>
										</Grid>
										<Grid item xs={12} sm={12} paddingTop={4}>
											{tableDataYear.rows && <PerformanceTableYears dataTable={tableDataYear}/>}
										</Grid>
									</>
								)}
							</Grid>
						</Grid>
					</TabPanel>
				</TabContext>
			</Grid>
		</Grid>
	);
}

export default function Indicators() {
	return <IndicatorsPage/>;
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
