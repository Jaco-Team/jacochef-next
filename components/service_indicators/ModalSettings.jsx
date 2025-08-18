"use client";
import React, {memo, useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {CustomColorPicker} from "@/pages/stat_sale";

const ModalSettings = (props) => {
	const
		{
			open,
			fullScreen,
			type_modal,
			name_row,
			value:
			propValue = 0,
			color_edit = '#2ECC71',
			openAlert,
			save,
			delete:
			deleteProp,
			onClose
		} = props;
	const [color, setColor] = useState('#2ECC71');
	const [value, setValue] = useState(0);

	// Обновляем состояние при изменении props
	useEffect(() => {
		if (type_modal === 'edit') {
			setValue(propValue);
			setColor(color_edit);
		}
	}, [type_modal, propValue, color_edit]);

	const changeItem = (event) => {
		let newValue = event.target.value;

		if (newValue === '') {
			newValue = '0';
		} else {
			newValue = newValue.replace(/^0+(?=\d)/, '');
		}

		const numericValue = Math.max(Number(newValue), 0);
		setValue(numericValue.toString());
	};

	const hsvaConvertHex = ({h, s, v, a = 1}) => {
		const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
		const r = Math.round(f(5) * 255);
		const g = Math.round(f(3) * 255);
		const b = Math.round(f(1) * 255);

		const toHex = (num) => {
			const hex = num.toString(16).toUpperCase();
			return hex.length === 1 ? '0' + hex : hex;
		};

		const alphaHex = toHex(Math.round(a * 255));
		setColor(`#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`);
	};

	const handleSave = () => {
		if (!value || Number(value) <= 0) {
			openAlert(false, 'Значение должно быть больше 0');
			return;
		}

		save({
			value,
			color
		});

		handleClose();
	};

	const handleDelete = () => {
		deleteProp();
		handleClose();
	};

	const handleClose = () => {
		setColor('#2ECC71');
		setValue(0);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth={true}
			maxWidth={'md'}
			fullScreen={fullScreen}
		>
			<DialogTitle className="button">
				<Typography style={{fontWeight: 'bold'}}>
					{type_modal === 'edit'
						? `Редактировать данные в таблице Коэффициенты (Клиенты) в строке ${name_row}`
						: `Добавить данные в таблицу Коэффициенты (Клиенты) в строку ${name_row}`}
				</Typography>
				<IconButton onClick={handleClose} style={{cursor: 'pointer'}}>
					<CloseIcon/>
				</IconButton>
			</DialogTitle>

			<DialogContent>
				<Grid container spacing={10}>
					<Grid item xs={12} sm={6} mt={3}>
						<TextField
							type="number"
							value={value}
							variant="outlined"
							onChange={changeItem}
							onBlur={changeItem}
							fullWidth
							InputProps={{
								inputProps: {min: 0, step: 1},
							}}
							sx={{
								margin: 0,
								padding: 0,
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "transparent",
									},
								},
								"& .MuiOutlinedInput-input": {
									fontWeight: "bold",
									backgroundColor: color,
									borderRadius: "8px",
									backgroundClip: "padding-box",
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6} mt={3}>
						<CustomColorPicker
							hsvaConvertHex={hsvaConvertHex}
							initialColor={color}
						/>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions sx={{
				display: 'flex',
				justifyContent: type_modal === 'edit' ? 'space-between' : 'flex-end'
			}}>
				{type_modal === 'edit' && (
					<Button variant="contained" onClick={handleDelete}>
						Удалить
					</Button>
				)}

				<Button variant="contained" color="success" onClick={handleSave}>
					Сохранить
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default memo(ModalSettings);
