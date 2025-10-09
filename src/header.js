import React, {useState, useEffect} from 'react';

import Link from 'next/link';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import api from '@/src/api';

import Cookies from 'js-cookie';

import {font} from "@/src/theme";
import {api_laravel, api_laravel_local} from "@/src/api_new";
import {AccountCircle, Attachment, Dashboard, ExitToApp, Person} from "@mui/icons-material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
	Button,
	ListItemButton,
	Menu,
	MenuItem,
} from '@mui/material';
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {useRouter} from "next/router";

const UserMenu = ({my, logOut}) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const router = useRouter();
	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleNavigation = (path) => {
		// Навигация по страницам
		handleMenuClose();
		router.push(path);
	};

	return (
		<>
			<IconButton color="inherit" onClick={handleMenuOpen} sx={{borderRadius: 0}}>
				<Badge
					color="secondary"
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							padding: 1,
							boxShadow: 'none',
							'&:hover': {
								backgroundColor: 'transparent !important',
							}
						}}
					>
						{my.img ? (
							<Avatar
								alt={my.short_name}
								src={`https://storage.yandexcloud.net/user-img/min-img/${my.img}?${my.img_update}`}
								sx={{
									width: 38,
									height: 38,
								}}
							/>
						) : (
							<Avatar
								sx={{
									width: 38,
									height: 38,
									bgcolor: 'primary.main',
									boxShadow: 'none'
								}}
							>
								<AccountCircle sx={{width: 24, height: 24}}/>
							</Avatar>
						)}

						<Typography
							variant="body1"
							sx={{
								fontWeight: 500,
								maxWidth: 200,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{my.short_name}
						</Typography>
						<KeyboardArrowDownIcon sx={{width: 24, height: 24}}/>
					</Box>
				</Badge>
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				PaperProps={{
					elevation: 3,
					sx: {
						mt: 1.5,
						minWidth: 200,
						borderRadius: 2
					}
				}}
				transformOrigin={{horizontal: 'right', vertical: 'top'}}
				anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
			>
				<MenuItem onClick={() => handleNavigation('/lk')}>
					<ListItemIcon>
						<Person fontSize="small"/>
					</ListItemIcon>
					<ListItemText>Личный кабинет</ListItemText>
				</MenuItem>

				<MenuItem onClick={() => handleNavigation('/work_schedule')}>
					<ListItemIcon>
						<Dashboard fontSize="small"/>
					</ListItemIcon>
					<ListItemText>График работы</ListItemText>
				</MenuItem>
				<Divider/>
				<MenuItem onClick={logOut}>
					<ListItemIcon>
						<ExitToApp fontSize="small"/>
					</ListItemIcon>
					<ListItemText>Выйти</ListItemText>
				</MenuItem>
			</Menu>
		</>
	);
};

export default function Header() {
	const [isOpenMenu, setIsOpenMenu] = useState(false);
	const [CatMenu, setCatMenu] = useState([]);
	const [FullMenu, setFullMenu] = useState([]);
	const [my, setMy] = useState({});

	function openMenu() {
		setIsOpenMenu(state => !state);
	}

	function closeMenu() {
		setIsOpenMenu(false);
	}

	async function loadMenu() {
		const response = await api_laravel('header', 'get_all');

		if (response?.data?.st === true) {
			setCatMenu(response?.data?.left_menu);
			setMy(response?.data?.my);
			setFullMenu(response?.data?.full_menu.filter((item, index, self) =>
				index === self.findIndex(t => t.name === item.name)
			));
		}

	}

	useEffect(() => {
		if ((!localStorage.getItem('token') || localStorage.getItem('token').length == 0)) {
			if (window.location.pathname == '/auth' || window.location.pathname == '/registration') {

			} else {
				// если не авторизованы и в каком-то модуле
				window.location.href = '/auth';
			}
		} else {
			// если авторизованы
			loadMenu()
		}
	}, []);

	function logOut() {
		localStorage.removeItem('token');
		Cookies.remove('token');
		window.location.href = '/auth';
	}

	if (typeof window != 'undefined') {
		if (location.protocol !== 'https:' && location.hostname != 'localhost') {
			location.replace(`https:${location.href.substring(location.protocol.length)}`);
		} else {
			if (window.location.pathname == '/auth' || window.location.pathname == '/registration') {
				return <></>;
			}
		}
	}


	return (
		<>
			<AppBar position="fixed" className={font.variable}>
				<Toolbar>
					<IconButton
						edge="start"
						color="inherit"
						aria-label="open drawer"
						onClick={openMenu}
					>
						<MenuIcon/>
					</IconButton>
					<Typography component="h1" variant="h6" color="inherit" noWrap style={{flexGrow: 1}}>
						Dashboard
					</Typography>
					<UserMenu my={my} logOut={logOut}/>
				</Toolbar>
			</AppBar>

			<SwipeableDrawer
				anchor={'left'}
				open={isOpenMenu}
				onClose={openMenu}
				onOpen={openMenu}
				className={'LeftMenu ' + font.variable}
			>

				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 10}}>

					<Autocomplete
						size="small"
						options={FullMenu}
						getOptionLabel={(option) => option.name}
						filterOptions={(options, {inputValue}) => {
							const searchTerm = inputValue.toLowerCase().trim();
							if (!searchTerm) return options;

							return options.filter(option => {
								// В первую очередь ищем по основному названию
								if (option.name.toLowerCase().includes(searchTerm)) {
									return true;
								}

								// Во вторую очередь - по навигационным элементам
								return option.navs_id && option.navs_id.some(nav =>
									nav.name.toLowerCase().includes(searchTerm)
								);
							});
						}}
						onChange={(event, newValue) => {
							if (newValue) {
								window.location = "/" + newValue.key_query;
								closeMenu();
							}
						}}
						style={{width: '100%'}}
						renderOption={(props, option, {inputValue, selectedOptions}) => {
							const searchTerm = inputValue.toLowerCase();

							const isDuplicate = selectedOptions?.some(selected => selected.name === option.name);

							if (isDuplicate) {
								return null;
							}

							// Находим совпадающие nav элементы
							const matchingNavs = option.navs_id
								? option.navs_id.filter(nav =>
									nav.name.toLowerCase().includes(searchTerm)
								)
								: [];

							return (
								<li {...props} key={option.name} style={{
									padding: '8px 16px',
									fontSize: '14px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-start',
									borderBottom: '1px solid #e0e0e0'
								}}>
									<i style={{
										display: 'flex',
										fontSize: '14px',
										fontStyle: 'normal',
										alignItems: 'center'
									}}>{option.name}</i>
									{option.navs_id && option.navs_id.length > 0 && (
										<div style={{
											display: 'flex',
											flexWrap: 'wrap',
											gap: '4px',
											marginTop: '4px',
										}}>
          <span style={{
						fontSize: '12px',
						color: '#666',
						marginRight: '4px',
					}}>↳</span>
											{option.navs_id.map((nav, index) => (
												<i
													key={index}
													style={{
														padding: '2px 8px',
														backgroundColor: '#e3f2fd',
														color: '#1976d2',
														borderRadius: '12px',
														fontSize: '11px',
														fontWeight: 500,
														border: '1px solid #bbdefb'
													}}
												>
													{nav.name}
												</i>
											))}
										</div>
									)}
								</li>
							);
						}}
						renderInput={(params) => <TextField {...params} label="Поиск" variant="outlined"/>}
					/>

					<IconButton onClick={openMenu}>
						<ChevronLeftIcon/>
					</IconButton>
				</div>


				<Divider/>

				{CatMenu?.map((item, key) =>
					<Accordion key={key}>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon/>}
						>
							<Typography>{item.parent.name}</Typography>
						</AccordionSummary>
						<AccordionDetails>

							<List style={{width: '100%'}}>

								{item.chaild.map((it, k) =>
									<Link href={`/${it.key_query}`} key={k} onClick={closeMenu}>
										<ListItemButton style={{height: 50}}>
											{it.name}
										</ListItemButton>
									</Link>
								)}

							</List>

						</AccordionDetails>
					</Accordion>
				)}


				<Accordion>
					<AccordionSummary onClick={logOut}>
						<Typography>Выйти из аккаунта</Typography>
					</AccordionSummary>
				</Accordion>

			</SwipeableDrawer>
		</>
	);
}
