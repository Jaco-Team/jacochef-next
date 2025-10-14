import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableFooter from "@mui/material/TableFooter";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import TableHead from "@mui/material/TableHead";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default class SiteClients_Modal_Client_Order extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showOrder: null
		};
	}

	componentDidUpdate(prevProps) {
		// console.log(this.props.showOrder);

		if (!this.props.showOrder) {
			return;
		}

		if (this.props.showOrder !== prevProps.showOrder) {
			this.setState({
				showOrder: this.props.showOrder,
			});
		}
	}

	onClose() {
		this.setState({
			showOrder: null,
		});

		this.props.onClose();
	}

	render() {

		const {open, fullScreen} = this.props;

		return (
            <Dialog
				open={open}
				onClose={this.onClose.bind(this)}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				fullWidth={true}
				maxWidth={'md'}
				fullScreen={fullScreen}
			>
                <DialogTitle className="button">
					<Typography style={{
						fontWeight: 'bold',
						alignSelf: 'center'
					}}>Заказ #{this.state.showOrder?.order?.order_id}</Typography>
					<IconButton onClick={this.onClose.bind(this)} style={{cursor: 'pointer'}}>
						<CloseIcon/>
					</IconButton>
				</DialogTitle>
                <DialogContent>

					<Grid container spacing={0}>
						<Grid
                            size={{
                                xs: 12
                            }}>
							<span>{this.state.showOrder?.order?.type_order}: {this.state.showOrder?.order?.type_order_addr_new}</span>
						</Grid>

						{parseInt(this.state.showOrder?.order?.type_order_) == 1 ?
							parseInt(this.state.showOrder?.order?.fake_dom) == 0 ?
								<Grid
                                    size={{
                                        xs: 12
                                    }}>
									<b style={{color: 'red', fontWeight: 900}}>Домофон не работает</b>
								</Grid>
								:
								<Grid
                                    size={{
                                        xs: 12
                                    }}>
									<b style={{color: 'green', fontWeight: 900}}>Домофон работает</b>
								</Grid>
							:
							null
						}
						<Grid
                            size={{
                                xs: 12
                            }}>
							<span>{this.state.showOrder?.order?.time_order_name}: {this.state.showOrder?.order?.time_order}</span>
						</Grid>

						{this.state.showOrder?.order?.number?.length > 1 ?
							<Grid
                                size={{
                                    xs: 12
                                }}>
								<b>Телефон: </b>
								<span>{this.state.showOrder?.order?.number}</span>
							</Grid>
							:
							null
						}

						{this.state.showOrder?.order?.delete_reason?.length > 0 ?
							<Grid
                                size={{
                                    xs: 12
                                }}><span style={{color: 'red'}}>Удален: {this.state.showOrder?.order?.date_time_delete}</span></Grid> : null}
						{this.state.showOrder?.order?.delete_reason?.length > 0 ?
							<Grid
                                size={{
                                    xs: 12
                                }}><span style={{color: 'red'}}>{this.state.showOrder?.order?.delete_reason}</span></Grid> : null}

						{parseInt(this.state.showOrder?.order?.is_preorder) == 1 ? null :
							<Grid
                                size={{
                                    xs: 12
                                }}><span>{'Обещали: ' + this.state.showOrder?.order?.time_to_client + ' / '}{this.state.showOrder?.order?.text_time}{this.state.showOrder?.order?.time}</span></Grid>
						}

						{this.state.showOrder?.order?.promo_name == null || this.state.showOrder?.order?.promo_name?.length == 0 ? null :
							<>
								<Grid
                                    size={{
                                        xs: 12
                                    }}>
									<b>Промокод: </b>
									<span>{this.state.showOrder?.order?.promo_name}</span>
								</Grid>
								<Grid
                                    size={{
                                        xs: 12
                                    }}>
									<span className="noSpace">{this.state.showOrder?.order?.promo_text}</span>
								</Grid>
							</>
						}

						{this.state.showOrder?.order?.comment == null || this.state.showOrder?.order?.comment.length == 0 ? null :
							<Grid
                                size={{
                                    xs: 12
                                }}>
								<b>Комментарий: </b>
								<span>{this.state.showOrder?.order?.comment}</span>
							</Grid>
						}

						{this.state.showOrder?.order?.sdacha == null || parseInt(this.state.showOrder?.order?.sdacha) == 0 ? null :
							<Grid
                                size={{
                                    xs: 12
                                }}>
								<b>Сдача: </b>
								<span>{this.state.showOrder?.order?.sdacha}</span>
							</Grid>
						}

						<Grid
                            size={{
                                xs: 12
                            }}>
							<b>Сумма заказа: </b>
							<span>{this.state.showOrder?.order?.sum_order} р</span>
						</Grid>

						{this.state.showOrder?.order?.check_pos_drive == null || !this.state.showOrder?.order?.check_pos_drive ? null :
							<Grid
                                size={{
                                    xs: 12
                                }}>
								<b>Довоз оформлен: </b>
								<span>{this.state.showOrder?.order?.check_pos_drive?.comment}</span>
							</Grid>
						}

						<Grid
                            size={{
                                xs: 12
                            }}>
							<Table size={'small'} style={{marginTop: 15}}>
								<TableBody>
									{this.state.showOrder?.order_items.map((item, key) =>
										<TableRow key={key}>
											<TableCell>{item.name}</TableCell>
											<TableCell>{item.count}</TableCell>
											<TableCell>{item.price} р</TableCell>
										</TableRow>
									)}
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableCell style={{fontWeight: 'bold', color: '#000'}}>Сумма заказа</TableCell>
										<TableCell></TableCell>
										<TableCell style={{
											fontWeight: 'bold',
											color: '#000'
										}}>{this.state.showOrder?.order?.sum_order} р</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</Grid>

						{!this.state.showOrder?.err_order ? null :
							<Grid
                                mt={3}
                                size={{
                                    xs: 12
                                }}>
								<Accordion>
									<AccordionSummary expandIcon={<ExpandMoreIcon/>}>
										<Typography style={{fontWeight: 'bold'}}>Ошибка</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell style={{width: '20%'}}>Дата создания</TableCell>
													<TableCell style={{width: '30%'}}>Проблема</TableCell>
													<TableCell style={{width: '30%'}}>Решение</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												<TableRow hover>
													<TableCell>{this.state.showOrder?.err_order?.date_time_desc}</TableCell>
													<TableCell>{this.state.showOrder?.err_order?.order_desc}</TableCell>
													<TableCell>{this.state.showOrder?.err_order?.text_win}</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</AccordionDetails>
								</Accordion>
							</Grid>
						}

					</Grid>
				</DialogContent>
                <DialogActions>
					<Button variant="contained" onClick={this.onClose.bind(this)}>
						Закрыть
					</Button>
				</DialogActions>
            </Dialog>
        );
	}
}
