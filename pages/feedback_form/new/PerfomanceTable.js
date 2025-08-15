import dayjs from "dayjs";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TableBody from "@mui/material/TableBody";

export const PerformanceTable = ({dataTable}) => {
	dayjs.locale('ru');
	const {columns, rows} = dataTable;
	const [month, year] = columns.months[0].split('-');
	const firstMonthKey = `${year}-${month}`;

	const thinBorder = "1px solid #ccc";
	const thickBorder = "2px solid #000 !important";

	const renderMonthHeader = (formattedMonth) => {
		const parts = formattedMonth.split('-');
		const isoDate = `${parts[1]}-${parts[0]}-01`;
		return (
			<TableCell key={formattedMonth} colSpan={3} sx={{
				backgroundColor: "#dcdcdc",
				minWidth: 4 * 80,
				top: 0,
				zIndex: 1000,
				borderTop: thickBorder,
				borderRight: thickBorder,
				borderBottom: thickBorder
			}}>
				{dayjs(isoDate).format('MMMM YYYY').replace(/^./, (match) => match.toUpperCase())}
			</TableCell>
		);
	};

	const paramColWidth = 150;
	const typeColWidth = 5;
	const cellStylesHeader = {
		position: 'sticky',
		top: 40,
		zIndex: 1000,
		minWidth: '120px',
		borderRight: thickBorder,
		borderBottom: thickBorder
	};
	const getPreviousPeriodHeader = (formatted) => {
		const parts = formatted.split('-');
		if (parts.length < 2) return formatted;
		const year = parts[1];
		const currentLastTwo = year.slice(-2);
		const previousLastTwo = (parseInt(year, 10) - 1).toString().slice(-2);
		return `${currentLastTwo}/${previousLastTwo}`;
	};

	const totalColSpan = 2 + columns.months.length * 4;

	const toRawMonth = (formatted) => {
		const [month, year] = formatted.split('-');
		return `${year}-${month}`;
	};


	return (
		<TableContainer component={Paper} sx={{overflowX: 'auto', overflowY: 'hidden', p: 0, m: 0, pb: 5}}>
			<Table stickyHeader size="small" sx={{
				borderCollapse: 'separate',
				borderSpacing: 0,
				'& .MuiTableCell-root': {textAlign: 'center', whiteSpace: 'nowrap', border: thinBorder}
			}}>
				<TableHead>
					<TableRow sx={{backgroundColor: 'white', height: 40}}>
						<TableCell sx={{
							position: 'sticky',
							left: 0,
							top: 0,
							backgroundColor: 'white',
							zIndex: 1300,
							minWidth: paramColWidth + typeColWidth,
							borderRight: thickBorder,
							textAlign: 'left !important'
						}} colSpan={2} rowSpan={2}>
							Месяц / год
						</TableCell>
						{columns.months.map((formattedMonth) => renderMonthHeader(formattedMonth))}
					</TableRow>
					<TableRow sx={{backgroundColor: 'white', height: 40}}>
						{columns.months.map((formattedMonth) => (
							<React.Fragment key={formattedMonth}>
								<TableCell sx={cellStylesHeader}>время</TableCell>
								<TableCell sx={cellStylesHeader}>баллы</TableCell>
								<TableCell sx={{...cellStylesHeader, cursor: 'pointer'}}>
									<Tooltip title="Открыть график Эффективности">
										<Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
											<Typography variant="body2" sx={{whiteSpace: 'nowrap', fontWeight: 500}}>
												{getPreviousPeriodHeader(formattedMonth)}
											</Typography>
											<QueryStatsIcon fontSize="small"/>
										</Box>
									</Tooltip>
								</TableCell>
							</React.Fragment>
						))}
					</TableRow>

					<TableRow>
						<TableCell colSpan={totalColSpan} sx={{border: "none", p: 0, m: 0}}>{'\u00A0'}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row, rowIndex) => (
						<React.Fragment key={row.parameter}>
							<TableRow>

								<TableCell rowSpan={2} sx={{
									position: 'sticky',
									left: 0,
									backgroundColor: 'white',
									zIndex: 1100,
									minWidth: paramColWidth,
									borderRight: 'none !important',
									fontWeight: "bold",
									textAlign: 'left !important'
								}}>
									{row.parameter}
								</TableCell>

								<TableCell component="th" scope="row" rowSpan={2} sx={{
									position: 'sticky',
									left: paramColWidth + 33.5,
									backgroundColor: 'white',
									zIndex: 1100,
									minWidth: typeColWidth,
									borderLeft: 'none !important',
									borderRight: thickBorder
								}}>
									{row.parameterLabel}
								</TableCell>

								{columns.months.map((formattedMonth) => {
									const rawMonth = toRawMonth(formattedMonth);
									const cellData = row.data[rawMonth] || {};

									return (
										<React.Fragment key={`${formattedMonth}-rolls`}>
											<TableCell rowSpan={2} sx={{
												minWidth: '80px',
												backgroundColor: cellData.color,
												fontWeight: 'bold'
											}}>
												{cellData.time_str}
											</TableCell>
											<TableCell rowSpan={2} sx={{
												minWidth: '80px',
												backgroundColor: cellData.color_rolls ?? null,
												fontWeight: 'bold'
											}}>
												{cellData.ball}
											</TableCell>
											<TableCell rowSpan={2} sx={{
												minWidth: '80px',
												backgroundColor: cellData.color_rolls ?? null,
												fontWeight: 'bold'
											}}>
												{cellData.time_diff_str}
											</TableCell>

										</React.Fragment>
									);

								})}

							</TableRow>

							<TableRow>
								{columns.months.map((formattedMonth) => {
									const rawMonth = toRawMonth(formattedMonth);
									const cellData = row.data[rawMonth] || {};
									return (
										<React.Fragment key={`${formattedMonth}-pizza`}>
										</React.Fragment>
									);
								})}
							</TableRow>

							{rowIndex === 0 &&
								<TableRow>
									<TableCell colSpan={totalColSpan} sx={{border: 'none', p: 0, m: 0}}>
										{'\u00A0'}
									</TableCell>
								</TableRow>
							}

							{rowIndex < rows.length - 1 && !rows[rowIndex].data[firstMonthKey]?.point_id && rows[rowIndex + 1].data[firstMonthKey]?.point_id &&
								<TableRow>
									<TableCell colSpan={totalColSpan} sx={{border: 'none', p: 0, m: 0}}>
										{'\u00A0'}
									</TableCell>
								</TableRow>
							}

						</React.Fragment>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
