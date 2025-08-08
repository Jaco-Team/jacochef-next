import React from "react";
import dayjs from "dayjs";
import {MyAlert, MySelect, MyTextInput} from "@/ui/elements";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

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
export default class SiteClients_Modal_Client extends React.Component {
	click = false;

	constructor(props) {
		super(props);

		this.myRef = React.createRef();

		this.state = {
			item: null,
			activeTab: 0,

			openAlert: false,
			err_status: true,
			err_text: '',

			confirmDialog: false
		};
	}

	componentDidUpdate(prevProps) {
		//console.log('componentDidUpdate', this.props);

		if (!this.props.item) {
			return;
		}

		if (this.props.item !== prevProps.item) {
			this.setState({
				item: this.props.item
			});
		}
	}

	changeItem(data, event) {
		const item = this.state.item;
		const value = event.target.value;

		item[data] = value;

		this.setState({
			item
		});
	}

	resetDateBR() {
		const item = this.state.item;

		item.date_bir = '';
		item.day = '';
		item.month = '';

		this.setState({
			item
		});
	}

	changeTab(event, val) {
		this.setState({
			activeTab: val
		})
	}

	saveEdit() {

		const item = this.state.item;

		if ((item.day && !item.month) || (!item.day && item.month)) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Необходимо указать полную дату рождения, либо сбросить',
			})

			return;
		}

		if (this.click === true) {
			return;
		} else {
			this.click = true;
		}

		let date_bir;

		if (item.day && item.month) {
			date_bir = dayjs(`2024-${item.month}-${item.day}`).format('YYYY-MM-DD');
		} else {
			date_bir = null;
		}

		const data = {
			mail: item.mail,
			login: item.login,
			date_bir,
		}

		this.props.saveEdit(data);

		setTimeout(() => {
			this.click = false;
		}, 500)
	}

	saveComment() {
		if (this.myRef.current) {
			if (this.myRef.current.getContent().length == 0) {

				this.setState({
					openAlert: true,
					err_status: false,
					err_text: 'Комментарий пустой',
				});

				return;
			}
		} else {
			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'Комментарий пустой',
			});

			return;
		}

		if (this.click === true) {
			return;
		} else {
			this.click = true;
		}

		let data = {
			number: this.props.item_login,
			text: this.myRef.current.getContent()
		};

		this.props.saveComment(data);

		setTimeout(() => {
			this.myRef.current.setContent('');
			this.click = false;
		}, 500)
	}

	send_code() {
		this.setState({
			confirmDialog: false
		});

		this.props.sendCode();
	}

	onClose() {

		setTimeout(() => {
			this.setState({
				item: null,
				activeTab: 0,
				openAlert: false,
				err_status: true,
				err_text: '',
				confirmDialog: false
			});
		}, 100);

		this.props.onClose();
	}

	render() {
		const {
			open,
			fullScreen,
			item_login,
			acces,
			days,
			months,
			orders,
			openClientOrder,
			err_orders,
			comments,
			openSaveAction,
			login_sms,
			login_yandex
		} = this.props;

		return (
			<>
				<MyAlert
					isOpen={this.state.openAlert}
					onClose={() => this.setState({openAlert: false})}
					status={this.state.err_status}
					text={this.state.err_text}
				/>

				<Dialog sx={{
					'& .MuiDialog-paper': {
						width: '80%',
						maxHeight: 435
					}
				}} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({confirmDialog: false})}>
					<DialogTitle>Подтвердите действие</DialogTitle>
					<DialogContent align="center" sx={{fontWeight: 'bold'}}>
						<Typography>Точно выслать новый код ?</Typography>
						<Typography style={{color: '#dd1a32'}}>Важно: код действуют 15 минут</Typography>
					</DialogContent>
					<DialogActions>
						<Button autoFocus onClick={() => this.setState({confirmDialog: false})}>Отмена</Button>
						<Button onClick={this.send_code.bind(this)}>Ok</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={open}
					onClose={this.onClose.bind(this)}
					fullScreen={fullScreen}
					fullWidth={true}
					maxWidth={'xl'}
				>
					<DialogTitle className="button">
						Информация о клиенте с номером телефона
						{item_login ? `: ${item_login}` : null}
						<IconButton onClick={this.onClose.bind(this)} style={{
							cursor: 'pointer',
							position: 'absolute',
							top: 0,
							right: 0,
							padding: 20
						}}>
							<CloseIcon/>
						</IconButton>
					</DialogTitle>

					<DialogContent style={{paddingBottom: 10, paddingTop: 10}}>

						<Grid item xs={12} sm={12}>
							<Paper>
								<Tabs value={this.state.activeTab} onChange={this.changeTab.bind(this)} centered variant='fullWidth'>
									<Tab label="О клиенте" {...a11yProps(0)} />
									<Tab label="Заказы" {...a11yProps(1)} />
									<Tab label="Оформленные ошибки" {...a11yProps(2)} />
									<Tab label="Обращения" {...a11yProps(3)} />
									<Tab label="Авторизации" {...a11yProps(4)} />
								</Tabs>
							</Paper>
						</Grid>

						{/* О клиенте */}
						<Grid item xs={12} sm={12}>
							<TabPanel value={this.state.activeTab} index={0} id='client'>
								<Paper style={{padding: 24}}>

									<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
										<Typography style={{fontWeight: 'bold'}}>
											Имя: &nbsp;
										</Typography>
										<Typography>
											{this.state.item?.name ?? 'Не указано'}
										</Typography>
									</Grid>

									<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
										<Typography style={{fontWeight: 'bold'}}>
											Телефон: &nbsp;
										</Typography>
										<Typography>
											{this.state.item?.login ?? 'Не указан'}
										</Typography>
									</Grid>

									{parseInt(acces?.edit_mail) ?
										<Grid item xs={12} sm={12} mb={3} className='mail_box'>
											<Typography style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
												Эл почта:
											</Typography>
											<MyTextInput
												label="Электронная @ почта"
												func={this.changeItem.bind(this, 'mail')}
												value={this.state.item?.mail ?? ''}
												type="email"
											/>
										</Grid>
										:
										<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
											<Typography style={{fontWeight: 'bold'}}>
												Эл почта: &nbsp;
											</Typography>
											<Typography>
												{this.state.item?.mail ?? 'Не указана'}
											</Typography>
										</Grid>
									}

									<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
										<Typography style={{fontWeight: 'bold'}}>
											Регистрация: &nbsp;
										</Typography>
										<Typography>
											{this.state.item?.date_reg ?? 'Не указана'}
										</Typography>
									</Grid>

									{parseInt(acces?.edit_bir) ?
										<Grid item xs={12} sm={12} mb={3} className='select_box'>
											<Typography style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
												Дата рождения:
											</Typography>
											<MySelect
												data={days}
												value={this.state.item?.day ?? ''}
												func={this.changeItem.bind(this, 'day')}
												label="День"
											/>
											<MySelect
												data={months}
												value={this.state.item?.month ?? ''}
												func={this.changeItem.bind(this, 'month')}
												label="Месяц"
											/>
											<Button variant="contained" onClick={this.resetDateBR.bind(this)}>
												Сбросить
											</Button>
										</Grid>
										:
										<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
											<Typography style={{fontWeight: 'bold'}}>
												Дата рождения: &nbsp;
											</Typography>
											<Typography>
												{this.state.item?.date_bir ?? 'Не указана'}
											</Typography>
										</Grid>
									}

									<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
										<Typography style={{fontWeight: 'bold'}}>
											Заказов: &nbsp;
										</Typography>
										<Typography>
											{`${this.state.item?.all_count_order} / ${this.state.item?.summ} р.`}
										</Typography>
									</Grid>

									<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
										<Typography style={{fontWeight: 'bold'}}>
											Доставок: &nbsp;
										</Typography>
										<Typography>
											{`${this.state.item?.count_dev} / ${this.state.item?.summ_dev} р.`}
										</Typography>
									</Grid>

									<Grid item xs={12} sm={12} style={{display: 'flex'}} mb={3}>
										<Typography style={{fontWeight: 'bold'}}>
											Самовывозов: &nbsp;
										</Typography>
										<Typography>
											{`${this.state.item?.count_pic} / ${this.state.item?.summ_pic} р.`}
										</Typography>
									</Grid>

									<Grid item xs={12} sm={12}>
										{!parseInt(acces?.edit_bir) && !parseInt(acces?.edit_mail) ? null :
											<Button variant="contained" color='success' onClick={this.saveEdit.bind(this)}>
												Сохранить
											</Button>
										}
									</Grid>

								</Paper>
							</TabPanel>
						</Grid>
						{/* О клиенте */}

						{/* Заказы */}
						{!parseInt(acces?.view_orders) ? null :
							<Grid item xs={12} sm={12}>
								<TabPanel value={this.state.activeTab} index={1} id='client'>
									<TableContainer sx={{maxHeight: {xs: 'none', sm: 607}}} component={Paper}>
										<Table size='small' stickyHeader>
											<TableHead>
												<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
													<TableCell style={{width: '5%'}}>#</TableCell>
													<TableCell style={{width: '20%'}}>Точка</TableCell>
													<TableCell style={{width: '20%'}}>Тип заказа</TableCell>
													<TableCell style={{width: '20%'}}>Дата заказа</TableCell>
													<TableCell style={{width: '15%'}}>ID заказа</TableCell>
													<TableCell style={{width: '20%'}}>Сумма заказа</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{orders.map((item, key) =>
													<TableRow
														hover
														key={key}
														onClick={openClientOrder.bind(this, item.order_id, item.point_id)}
														style={{
															cursor: 'pointer',
															backgroundColor: parseInt(item.is_delete) ? 'rgb(204, 0, 51)' : null
														}}
														sx={{'& td': {color: parseInt(item.is_delete) ? '#fff' : '#000'}}}
													>
														<TableCell>{key + 1}</TableCell>
														<TableCell>{item.point}</TableCell>
														<TableCell>{item.new_type_order}</TableCell>
														<TableCell>{item.date_time}</TableCell>
														<TableCell>{`#${item.order_id}`}</TableCell>
														<TableCell>{`${item.summ} р.`}</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
								</TabPanel>
							</Grid>
						}
						{/* Заказы */}

						{/* Оформленные ошибки */}
						{!parseInt(acces?.view_err) ? null :
							<Grid item xs={12} sm={12}>
								<TabPanel value={this.state.activeTab} index={2} id='client'>
									<TableContainer sx={{maxHeight: {xs: 'none', sm: 607}}} component={Paper}>
										<Table size='small' stickyHeader>
											<TableHead>
												<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
													<TableCell style={{width: '5%'}}>#</TableCell>
													<TableCell style={{width: '15%'}}>Точка</TableCell>
													<TableCell style={{width: '10%'}}>ID заказа</TableCell>
													<TableCell style={{width: '20%'}}>Дата</TableCell>
													<TableCell style={{width: '25%'}}>Описание</TableCell>
													<TableCell style={{width: '25%'}}>Действия</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{err_orders.map((item, key) =>
													<TableRow hover key={key}>
														<TableCell>{key + 1}</TableCell>
														<TableCell>{item.point}</TableCell>
														<TableCell>{`#${item.order_id}`}</TableCell>
														<TableCell>{item.date_time_desc}</TableCell>
														<TableCell>{item.order_desc}</TableCell>
														<TableCell>{item.text_win}</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
								</TabPanel>
							</Grid>
						}
						{/* Оформленные ошибки */}

						{/* Обращения */}
						{!parseInt(acces?.view_comment) ? null :
							<Grid item xs={12} sm={12}>
								<TabPanel value={this.state.activeTab} index={3} id='client'>
									{!comments.length ? null :
										<Accordion style={{marginBottom: 24}}>
											<AccordionSummary expandIcon={<ExpandMoreIcon/>}>
												<Typography style={{fontWeight: 'bold'}}>Оформленные ошибки</Typography>
											</AccordionSummary>
											<AccordionDetails>
												{comments.map((item, key) =>
													<Paper key={key} style={{padding: 15, marginBottom: 15}} elevation={3}>
														<b>{item?.description ? 'Обращение:' : 'Комментарий:'}</b>
														<span dangerouslySetInnerHTML={{__html: item.comment}}/>

														<div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
															<div>
																<span style={{marginRight: 20}}>{item.date_add}</span>
																<span>{item.name}</span>
															</div>
														</div>

														<hr/>

														<b>{item?.description ? 'Действие:' : null}</b>

														<p dangerouslySetInnerHTML={{__html: item?.description}}/>

														<p>
															<b>{parseInt(item.raiting) > 0 ? parseInt(item.raiting) == 1 ? 'Положительный отзыв' : parseInt(item.raiting) == 2 ? 'Средний отзыв' : 'Отрицательный отзыв' : ''}</b>
															{parseInt(item.raiting) > 0 & parseInt(item.sale) > 0 ? ' / ' : ''}
															<b>{parseInt(item.sale) > 0 ? 'Выписана скидка ' + item.sale + '%' : ''}</b>
														</p>

														<div style={{
															display: 'flex',
															justifyContent: item?.description ? 'flex-end' : 'space-between',
															alignItems: 'center'
														}}>
															{/* {item?.description ? null :
                                <>
                                  <Button color="primary" variant="contained" onClick={ openSaveAction.bind(this, item.id)}>Действие</Button>
                                </>
                              } */}
															<div>
																<span style={{marginRight: 20}}>{item.date_time}</span>
																<span>{item.name_close}</span>
															</div>
														</div>
													</Paper>
												)}
											</AccordionDetails>
										</Accordion>
									}

									{/* <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography style={{ fontWeight: 'bold' }}>Новое обращение</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid item xs={12} sm={12} mb={3}>
                        <TextEditor22 id="EditorNew" value={''} refs_={this.myRef} toolbar={true} menubar={true} />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        {!parseInt(acces?.edit) ? null :
                          <Button variant="contained"  onClick={this.saveComment.bind(this)}>
                            Добавить новый комментарий
                          </Button>
                        }
                      </Grid>
                    </AccordionDetails>
                  </Accordion> */}

								</TabPanel>
							</Grid>
						}
						{/* Обращения */}

						{/* Авторизации */}
						{!parseInt(acces?.view_auth) ? null :
							<Grid item xs={12} sm={12}>
								<TabPanel value={this.state.activeTab} index={4} id='client'>

									{parseInt(acces?.send_code) ?
										<Grid item xs={12} sm={12}>
											<Button variant="contained" color='success' onClick={() => this.setState({confirmDialog: true})}>
												Выслать новый код
											</Button>
										</Grid>
										: null
									}

									<Grid className='client_auth'>
										{!login_sms.length ? null :
											<TableContainer sx={{
												maxHeight: {xs: 'none', sm: 607},
												width: '48%',
												height: 'max-content'
											}} component={Paper}>
												<Table size='small' stickyHeader>
													<TableHead>
														<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
															<TableCell colSpan={3}>Авторизации по смс</TableCell>
														</TableRow>
														<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
															<TableCell style={{width: '15%'}}>#</TableCell>
															<TableCell>Дата и время авторизации</TableCell>
															<TableCell>Код для авторизации</TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{login_sms.map((item, key) =>
															<TableRow hover key={key}>
																<TableCell>{key + 1}</TableCell>
																<TableCell>{item.date_time}</TableCell>
																<TableCell>{item.code}</TableCell>
															</TableRow>
														)}
													</TableBody>
												</Table>
											</TableContainer>
										}

										{!login_yandex.length ? null :
											<TableContainer sx={{
												maxHeight: {
													xs: 'none',
													sm: 607,
													width: '48%',
													height: 'max-content'
												}
											}} component={Paper}>
												<Table size='small' stickyHeader>
													<TableHead>
														<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
															<TableCell colSpan={2}>Авторизации через Яндекс</TableCell>
														</TableRow>
														<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
															<TableCell style={{width: '15%'}}>#</TableCell>
															<TableCell>Дата и время авторизации</TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{login_yandex.map((item, key) =>
															<TableRow hover key={key}>
																<TableCell>{key + 1}</TableCell>
																<TableCell>{item.date_time}</TableCell>
															</TableRow>
														)}
													</TableBody>
												</Table>
											</TableContainer>
										}
									</Grid>

								</TabPanel>
							</Grid>
						}
						{/* Авторизации */}

					</DialogContent>

					<DialogActions>
						<Button variant="contained" onClick={this.onClose.bind(this)}>
							Закрыть
						</Button>
					</DialogActions>

				</Dialog>
			</>
		);
	}
}
