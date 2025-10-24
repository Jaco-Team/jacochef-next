import React from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import {MyTextInput} from '@/components/shared/Forms';

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import {api_laravel, api_laravel_local} from "@/src/api_new";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import {
	Backdrop,
	Button,
	CircularProgress,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography
} from '@mui/material';
import JModal from '@/components/sklad_modules/JModal';
import JParamModal from '@/components/sklad_modules/JParamModal';
import handleUserAccess from '@/src/helpers/access/handleUserAccess';
import TestAccess from '@/components/shared/TestAccess';
import MyAlert from '@/components/shared/MyAlert';

const defaultParamTypes = [
	{id: 2, name: "2 значения ( чекбокс - показывать / скрыть )"},
	{id: 3, name: "3 значения ( селект - не активный / просмотр / редактировать )"}
];

class SkladModules_ extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			module: 'sklad_modules',
			module_name: '',
			is_load: false,
			acces: {},

			fullScreen: false,

			list: null,

			mark: null,
			modalDialog: false,
			listCat: null,
			listNav: null,
			listContent: null,
			item: null,

			itemNew: {
				name: '',
				link: '',
				parent_id: '',
			},

			method: '',
			itemName: '',

			openAlert: false,
			err_status: true,
			err_text: '',
			expandedItems: {},

			mark_param: null,
			modalDialog_param: false,
			param: null,
			param_name: '',

			param_new: {
				name: '',
				category: '',
				categories: [],
				category_name: '',
				param: '',
				type: '',
				module_id: null
			},

		};
	}

	async componentDidMount() {
		const data = await this.getData('get_all');

		this.setState({
			list: data.items,
			module_name: data.module_info.name,
			acces: data.acces,
		});

		document.title = data.module_info.name;
	}

	getData = (method, data = {}) => {
		this.setState({
			is_load: true,
		});

		let result = api_laravel(this.state.module, method, data)
			.then((response) => response?.data)
			.catch((e) => {
				console.error("Error fetching data:", e);
				return null;
			})
			.finally(() => {
				setTimeout(() => {
					this.setState({
						is_load: false,
					});
				}, 500);
			});

		return result;
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

	async openModal(mark, id) {
		this.handleResize();

		if (mark === 'add') {
			const res = await this.getData('get_all_for_new');
			if (!res) return;

			this.setState({
				mark,
				item: JSON.parse(JSON.stringify(this.state.itemNew)),
				listCat: res.main_cat,
				modalDialog: true,
				method: 'Новый модуль',
			});
		}

		if (mark === 'edit') {
			const data = {
				id,
			};

			const res = await this.getData('get_one', data);
			if (!res) return;

			this.setState({
				mark,
				item: res.item[0],
				itemName: res.item[0]?.name,
				listCat: res.main_cat,
				listNav: res.list_nav,
				listContent: res.list_cont,
				modalDialog: true,
				method: 'Редактирование модуля',
			});
		}
	}

	updateOne = async (id) => {
		const data = {
			id,
		};

		const res = await this.getData('get_one', data);
		if (!res) return;

		this.setState({
			listNav: res.list_nav,
			listContent: res.list_cont,
		});
	}

	async openModal_param(mark_param, id) {
		this.handleResize();

		if (mark_param === 'add_param') {

			const res = await this.getData('get_new_param');

			let param = JSON.parse(JSON.stringify(this.state.param_new));

			param.modules = res.modules;
			param.types = defaultParamTypes;
			param.type = defaultParamTypes[0]?.id;

			this.setState({
				param,
				mark_param,
				modalDialog_param: true,
				method: 'Новый параметр',
			});
		}

		if (mark_param === 'edit_param') {
			const data = {
				id,
			};

			const res = await this.getData('get_one_param', data);

			res.param.types = defaultParamTypes;
			res.param.module_id = res.param.modules.find(module => parseInt(module.id) === parseInt(res.param.module_id)) ?? 0;
			// res.param.category = res.param.categories?.find(category => category.id === res.param.category) ?? 0;

			this.setState({
				mark_param,
				modalDialog_param: true,
				param: res.param,
				param_name: res.param.name,
				method: 'Редактирование параметра',
			});
		}
	}

	async save_param(param) {

		const mark_param = this.state.mark_param;
		let res;
		const data = {
			name: param.name,
			category_new: param.categoryItem?.id === 0,
			category: param.category,
			category_name: param.category_name || '',
			param: param.param,
			type: param.type,
			module_id: param.module_id.id,
			access: param.access,
			view: param.view,
			edit: param.edit
		};

		if (mark_param === 'add_param') {
			res = await this.getData('save_new_param', data);
		}

		if (mark_param === 'edit_param') {
			data.id = param.id;
			res = await this.getData('save_edit_param', data);
		}

		if (!res?.st) {
			this.setState({
				openAlert: true,
				err_status: res?.st || false,
				err_text: res?.text || 'Server Error',
			});
		} else {
			setTimeout(() => {
				this.update();
			}, 300);
		}
		return res;
	}

	async save(item) {
		const mark = this.state.mark;

		let res;

		if (mark === 'add') {
			const data = {
				name: item.name,
				link: item.link,
				parent_id: item.parent_id,
				navs: item.itemNav,
				cont: item.itemContent
			};

			res = await this.getData('save_new', data);
		}

		if (mark === 'edit') {
			const data = {
				id: item.id,
				name: item.name,
				link: item.link,
				parent_id: item.parent_id,
				is_show: item.is_show,
				modul_id: item.modul_id,
				navs: item.itemNav,
				cont: item.itemContent
			};

			res = await this.getData('save_edit', data);
		}

		if (!res.st) {
			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});
		} else {
			setTimeout(() => {
				this.update();
			}, 300);
		}
	}

	changeSort(index, cat, id, event) {
		const list = this.state.list;

		if (cat === 'subCat') {
			list.forEach((item) => {
				if (item.id === id) {
					item.items[index].sort = event.target.value;
				}
			});
		} else {
			list[index].sort = event.target.value;
		}

		this.setState({
			list,
		});
	}

	async saveSort(id, event) {
		const data = {
			id,
			value: event.target.value,
		};

		const res = await this.getData('save_sort', data);

		if (!res.st) {
			this.setState({
				openAlert: true,
				err_status: res.st,
				err_text: res.text,
			});
		} else {
			setTimeout(() => {
				this.update();
			}, 300);
		}
	}

	async update() {
		const data = await this.getData('get_all');

		this.setState({
			list: data.items,
			acces: data.acces,
		});
	}

	canView(key) {
		return handleUserAccess(this.state.acces)?.userCan('view', key);
	}

	canEdit(key) {
		return handleUserAccess(this.state.acces)?.userCan('edit', key);
	}

	canAccess(key) {
		return handleUserAccess(this.state.acces)?.userCan('access', key);
	}

	render() {
		return (
			<>
				<Backdrop open={this.state.is_load} style={{zIndex: 99}}>
					<CircularProgress color="inherit"/>
				</Backdrop>
				{/* <TestAccess
					access={this.state.acces}
					setAccess={(acces) => this.setState({acces})}
				/> */}
				<MyAlert
					isOpen={this.state.openAlert}
					onClose={() => this.setState({openAlert: false})}
					status={this.state.err_status}
					text={this.state.err_text}
				/>
				<JParamModal
					open={this.state.modalDialog_param}
					onClose={() => this.setState({modalDialog_param: false, param: null, param_name: '', method: ''})}
					item={this.state.param}
					fullScreen={this.state.fullScreen}
					save={this.save_param.bind(this)}
					method={this.state.method}
					param_name={this.state.param_name}
					getData={this.getData}
				/>
				<JModal
					open={this.state.modalDialog}
					onClose={() => this.setState({modalDialog: false, itemName: '', method: ''})}
					mark={this.state.mark}
					item={this.state.item}
					updateOne={this.updateOne}
					listCat={this.state.listCat}
					getData={this.getData}
					listNav={this.state.listNav}
					listContent={this.state.listContent}
					method={this.state.method}
					itemName={this.state.itemName}
					fullScreen={this.state.fullScreen}
					save={this.save.bind(this)}
					canEdit={this.canEdit.bind(this)}
					canView={this.canView.bind(this)}
				/>
				<Grid container spacing={3} className='container_first_child'>
					<Grid
						size={{
							xs: 12,
							sm: 12
						}}>
						<h1>{this.state.module_name}</h1>
					</Grid>

					<Grid
						size={{
							xs: 12,
							sm: 4
						}}>
						<Button variant="contained" color="primary" style={{whiteSpace: 'nowrap'}} onClick={this.openModal.bind(this, 'add', null)}>
							Добавить модуль
						</Button>
					</Grid>

					<Grid
						size={{
							xs: 12,
							sm: 6
						}}>
						{this.canEdit('app_params') && (
							<Button variant="contained" color="primary" style={{whiteSpace: 'nowrap'}} onClick={this.openModal_param.bind(this, 'add_param', null)}>
								Добавить параметр модулю
							</Button>
						)}
					</Grid>

					{!this.state.list ? null : (
						<Grid
							mb={10}
							size={{
								xs: 12,
								sm: 12
							}}>
							{parseInt(this.state.acces?.view_pos_access) == 1 ? (
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
												<TableCell style={{width: '5%'}}>#</TableCell>
												<TableCell style={{width: '35%'}}>Название</TableCell>
												<TableCell style={{width: '15%'}}>Сортировка</TableCell>
												<TableCell style={{width: '45%'}} align="center"><VisibilityIcon/></TableCell>
												<TableCell></TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{this.state.list.map((item, index) =>
												item.items?.length ? (
													<React.Fragment key={index}>
														<TableRow hover sx={{'& th': {border: 'none'}}}>
															<TableCell>{index + 1}</TableCell>
															<TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{
																fontWeight: 'bold',
																cursor: 'pointer',
																color: '#c03'
															}}>
																{item.name}
															</TableCell>
															<TableCell>
																<MyTextInput
																	label=""
																	value={item.sort}
																	func={this.changeSort.bind(this, index, 'cat', null)}
																	onBlur={this.saveSort.bind(this, item.id)}
																/>
															</TableCell>
															<TableCell align="center">
																{parseInt(item.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
															</TableCell>
															<TableCell></TableCell>
														</TableRow>
														{item.items.map((it, key) => (
															it.params?.length ?
																<React.Fragment key={key}>
																	<TableRow
																		hover
																		onClick={(e) => {
																			if (!e.currentTarget.querySelector('li')?.contains(e.target)) {
																				this.setState(prev => ({
																					expandedItems: {
																						...prev.expandedItems,
																						[it.id]: !prev.expandedItems[it.id]
																					}
																				}))
																			}
																		}}
																		sx={{
																			cursor: 'pointer',
																			'&:hover': {backgroundColor: 'action.hover'},
																		}}
																	>
																		<TableCell>{item.sort}.{it.sort}</TableCell>
																		<TableCell
																			onClick={this.openModal.bind(this, 'edit', it.id)}
																			sx={{paddingLeft: 10, alignItems: 'center'}}>
																			<li>{it.name}</li>
																		</TableCell>
																		<TableCell>
																			<MyTextInput
																				label=""
																				value={it.sort}
																				func={this.changeSort.bind(this, key, 'subCat', item.id)}
																				onBlur={this.saveSort.bind(this, it.id)}
																			/>
																		</TableCell>
																		<TableCell align="center">
																			{parseInt(it.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
																		</TableCell>
																		<TableCell><ExpandMoreIcon sx={{
																			transform: this.state.expandedItems[it.id] ? 'rotate(180deg)' : 'rotate(0deg)',
																			transition: 'transform 0.2s',
																			verticalAlign: 'middle',
																			ml: 1
																		}}/></TableCell>
																	</TableRow>
																	{this.state.expandedItems[it.id] && it.apps.map((param, k) => (
																		<TableRow
																			hover
																			key={k}
																			sx={{
																				display: 'table-row',
																				animation: 'fadeIn 0.3s ease-out',
																				backgroundColor: 'rgba(0, 0, 0, 0.02)', // Легкий фон
																				'&:hover': {
																					backgroundColor: 'rgba(0, 0, 0, 0.04)' // Чуть темнее при наведении
																				},
																				'&:last-child td': {
																					borderBottom: '1px solid rgba(224, 224, 224, 0.5)' // Граница снизу
																				}
																			}}
																		>
																			<TableCell></TableCell>
																			<TableCell sx={{
																				paddingLeft: 20,
																				alignItems: 'center',
																				position: 'relative',
																				'&:before': {
																					content: '""',
																					position: 'absolute',
																					left: 10,
																					top: '50%',
																					height: '1px',
																					width: 10,
																					backgroundColor: 'rgba(0, 0, 0, 0.1)'
																				}
																			}}>
																				<Box
																					component="li"
																					sx={{
																						display: 'flex',
																						alignItems: 'center',
																						'&:before': {
																							content: '"›"',
																							mr: 1,
																							color: 'text.secondary'
																						}
																					}}
																				>
																					{param.name}
																				</Box>
																			</TableCell>
																			<TableCell></TableCell>
																			<TableCell></TableCell>
																			<TableCell></TableCell>
																		</TableRow>
																	))}
																	{this.canView(`app_params`) && it?.params.map((param, k) => (
																		<TableRow hover key={k}>
																			<TableCell></TableCell>
																			<TableCell sx={{paddingLeft: 20, alignItems: 'center'}}>
																				<li className='li_disc'>{param.name}</li>
																			</TableCell>
																			<TableCell>{param.category_name}</TableCell>
																			<TableCell sx={{textAlign: 'center'}}>
																				{this.canEdit('app_params') && (
																					<Tooltip title={
																						<Typography color="inherit">Редактирование параметра</Typography>}>
																						<EditIcon
																							onClick={this.openModal_param.bind(this, 'edit_param', param.id)}
																							sx={{paddingLeft: 20, cursor: 'pointer'}}
																						/>
																					</Tooltip>
																				)}
																			</TableCell>
																			<TableCell></TableCell>
																		</TableRow>
																	))}
																</React.Fragment>
																:
																<React.Fragment key={key}>
																	<TableRow
																		hover
																		onClick={(e) => {
																			if (!e.currentTarget.querySelector('li')?.contains(e.target)) {
																				this.setState(prev => ({
																					expandedItems: {
																						...prev.expandedItems,
																						[it.id]: !prev.expandedItems[it.id]
																					}
																				}))
																			}
																		}}
																	>
																		<TableCell>{item.sort}.{it.sort}</TableCell>
																		<TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{
																			paddingLeft: 10,
																			alignItems: 'center',
																			cursor: 'pointer'
																		}}>
																			<li>{it.name}</li>
																		</TableCell>
																		<TableCell>
																			<MyTextInput
																				label=""
																				value={it.sort}
																				func={this.changeSort.bind(this, key, 'subCat', item.id)}
																				onBlur={this.saveSort.bind(this, it.id)}
																			/>
																		</TableCell>
																		<TableCell align="center">
																			{parseInt(it.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
																		</TableCell>
																		<TableCell><ExpandMoreIcon sx={{
																			transform: this.state.expandedItems[it.id] ? 'rotate(180deg)' : 'rotate(0deg)',
																			transition: 'transform 0.2s',
																			verticalAlign: 'middle',
																			ml: 1
																		}}/></TableCell>
																	</TableRow>
																	{this.state.expandedItems[it.id] && it.apps.map((param, k) => (
																		<TableRow
																			hover
																			key={k}
																			sx={{
																				display: 'table-row',
																				animation: 'fadeIn 0.3s ease-out',
																				backgroundColor: 'rgba(0, 0, 0, 0.02)', // Легкий фон
																				'&:hover': {
																					backgroundColor: 'rgba(0, 0, 0, 0.04)' // Чуть темнее при наведении
																				},
																				'&:last-child td': {
																					borderBottom: '1px solid rgba(224, 224, 224, 0.5)' // Граница снизу
																				}
																			}}
																		>
																			<TableCell></TableCell>
																			<TableCell sx={{
																				paddingLeft: 20,
																				alignItems: 'center',
																				position: 'relative',
																				'&:before': {
																					content: '""',
																					position: 'absolute',
																					left: 10,
																					top: '50%',
																					height: '1px',
																					width: 10,
																					backgroundColor: 'rgba(0, 0, 0, 0.1)'
																				}
																			}}>
																				<Box
																					component="li"
																					sx={{
																						display: 'flex',
																						alignItems: 'center',
																						'&:before': {
																							content: '"›"',
																							mr: 1,
																							color: 'text.secondary'
																						}
																					}}
																				>
																					{param.name}
																				</Box>
																			</TableCell>
																			<TableCell></TableCell>
																			<TableCell></TableCell>
																			<TableCell></TableCell>
																		</TableRow>
																	))}
																</React.Fragment>
														))}
													</React.Fragment>
												) : (
													<TableRow hover key={index} sx={{'& th': {border: 'none'}}}>
														<TableCell>{index + 1}</TableCell>
														<TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{
															fontWeight: 'bold',
															cursor: 'pointer',
															color: '#c03'
														}}>
															{item.name}
														</TableCell>
														<TableCell>
															<MyTextInput
																label=""
																value={item.sort}
																func={this.changeSort.bind(this, index, 'cat', null)}
																onBlur={this.saveSort.bind(this, item.id)}
															/>
														</TableCell>
														<TableCell align="center">
															{parseInt(item.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
														</TableCell>
													</TableRow>
												)
											)}
										</TableBody>
									</Table>
								</TableContainer>
							) : (
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow sx={{'& th': {fontWeight: 'bold'}}}>
												<TableCell style={{width: '5%'}}>#</TableCell>
												<TableCell style={{width: '35%'}}>Название</TableCell>
												<TableCell style={{width: '15%'}}>Сортировка</TableCell>
												<TableCell style={{width: '45%'}} align="center"><VisibilityIcon/></TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{this.state.list.map((item, index) =>
												item.items?.length ? (
													<React.Fragment key={index}>
														<TableRow hover sx={{'& th': {border: 'none'}}}>
															<TableCell>{index + 1}</TableCell>
															<TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{
																fontWeight: 'bold',
																cursor: 'pointer',
																color: '#c03'
															}}>
																{item.name}
															</TableCell>
															<TableCell>
																<MyTextInput
																	label=""
																	value={item.sort}
																	func={this.changeSort.bind(this, index, 'cat', null)}
																	onBlur={this.saveSort.bind(this, item.id)}
																/>
															</TableCell>
															<TableCell align="center">
																{parseInt(item.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
															</TableCell>
														</TableRow>
														{item.items.map((it, key) => (
															it.params?.length ?
																<React.Fragment key={key}>
																	<TableRow hover>
																		<TableCell></TableCell>
																		<TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{
																			paddingLeft: 10,
																			alignItems: 'center',
																			cursor: 'pointer'
																		}}>
																			<li>{it.name}</li>
																		</TableCell>
																		<TableCell>
																			<MyTextInput
																				label=""
																				value={it.sort}
																				func={this.changeSort.bind(this, key, 'subCat', item.id)}
																				onBlur={this.saveSort.bind(this, it.id)}
																			/>
																		</TableCell>
																		<TableCell align="center">
																			{parseInt(it.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
																		</TableCell>
																	</TableRow>
																	{it?.params.map((param, k) => (
																		<TableRow hover key={k}>
																			<TableCell></TableCell>
																			<TableCell sx={{paddingLeft: 20, alignItems: 'center'}}>
																				<li className='li_disc'>{param.name}</li>
																			</TableCell>
																			<TableCell>{param.category_name}</TableCell>
																			<TableCell sx={{textAlign: 'center'}} onClick={this.openModal_param.bind(this, 'edit_param', param.id)}>
																				<Tooltip title={
																					<Typography color="inherit">Редактирование параметра</Typography>}>
																					<EditIcon sx={{paddingLeft: 20, cursor: 'pointer'}}/>
																				</Tooltip>
																			</TableCell>
																		</TableRow>
																	))}
																</React.Fragment>
																:
																<TableRow hover key={key}>
																	<TableCell></TableCell>
																	<TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{
																		paddingLeft: 10,
																		alignItems: 'center',
																		cursor: 'pointer'
																	}}>
																		<li>{it.name}</li>
																	</TableCell>
																	<TableCell>
																		<MyTextInput
																			label=""
																			value={it.sort}
																			func={this.changeSort.bind(this, key, 'subCat', item.id)}
																			onBlur={this.saveSort.bind(this, it.id)}
																		/>
																	</TableCell>
																	<TableCell align="center">
																		{parseInt(it.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
																	</TableCell>
																</TableRow>
														))}
													</React.Fragment>
												) : (
													<TableRow hover key={index} sx={{'& th': {border: 'none'}}}>
														<TableCell>{index + 1}</TableCell>
														<TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{
															fontWeight: 'bold',
															cursor: 'pointer',
															color: '#c03'
														}}>
															{item.name}
														</TableCell>
														<TableCell>
															<MyTextInput
																label=""
																value={item.sort}
																func={this.changeSort.bind(this, index, 'cat', null)}
																onBlur={this.saveSort.bind(this, item.id)}
															/>
														</TableCell>
														<TableCell align="center">
															{parseInt(item.is_show) == 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}
														</TableCell>
													</TableRow>
												)
											)}
										</TableBody>
									</Table>
								</TableContainer>
							)}
						</Grid>
					)}
				</Grid>
			</>
		);
	}
}

export default function SkladModules() {
	return <SkladModules_/>;
}

export async function getServerSideProps({res}) {
	res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

	return {
		props: {},
	}
}
