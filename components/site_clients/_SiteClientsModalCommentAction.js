import React from "react";
import {MyAlert, TextEditor22} from "@/ui/elements";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default class SiteClients_Modal_Comment_Action extends React.Component {
	click = false;

	constructor(props) {
		super(props);

		this.myRef_action = React.createRef();

		this.state = {
			comment_id: null,
			raiting: 0,
			type_sale: 0,

			openAlert: false,
			err_status: true,
			err_text: '',
		};
	}

	componentDidUpdate(prevProps) {
		// console.log(this.props.comment_id);

		if (!this.props.comment_id) {
			return;
		}

		if (this.props.comment_id !== prevProps.comment_id) {
			this.setState({
				comment_id: this.props.comment_id
			});
		}
	}

	saveCommentAction() {

		if ((!this.myRef_action.current || this.myRef_action.current.getContent().length === 0)) {

			this.setState({
				openAlert: true,
				err_status: false,
				err_text: 'В описании пусто'
			});

			return;
		}

		if (this.click) {
			return;
		} else {
			this.click = true;
		}

		let data = {
			comment_id: this.state.comment_id,
			description: this.myRef_action.current.getContent(),
			number: this.props.client_login,
			raiting: this.state.raiting,
			type_sale: this.state.type_sale,
		};

		if (parseInt(this.state.type_sale) > 0) {
			this.props.savePromo(this.state.type_sale);
		}

		this.props.saveCommentAction(data);

		setTimeout(() => {
			this.myRef_action.current.setContent('');
			this.click = false;
		}, 500)
	}

	onClose() {
		this.setState({
			comment_id: null,
			raiting: 0,
			type_sale: 0,

			openAlert: false,
			err_status: true,
			err_text: '',
		});

		this.props.onClose();
	}

	render() {

		const {open, fullScreen} = this.props;

		return (
			<>
				<MyAlert
					isOpen={this.state.openAlert}
					onClose={() => this.setState({openAlert: false})}
					status={this.state.err_status}
					text={this.state.err_text}
				/>

				<Dialog
					open={open}
					onClose={this.onClose.bind(this)}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
					fullWidth={true}
					maxWidth={'lg'}
					fullScreen={fullScreen}
				>
					<DialogTitle className="button">
						<Typography style={{fontWeight: 'bold'}}>Описание ситуации</Typography>
						<IconButton onClick={this.onClose.bind(this)} style={{cursor: 'pointer'}}>
							<CloseIcon/>
						</IconButton>
					</DialogTitle>

					<DialogContent>

						<Grid container spacing={0}>
							<Grid item xs={12} sm={12} style={{justifyContent: 'center', display: 'flex', marginBottom: 20}}>
								<ToggleButtonGroup
									value={this.state.raiting}
									exclusive
									size="small"
									onChange={(event, data) => {
										this.setState({raiting: data ?? 0})
									}}
								>
									<ToggleButton value="1" style={{
										backgroundColor: parseInt(this.state.raiting) == 1 ? '#dd1a32' : '#fff',
										borderRightWidth: 2
									}}>
										<span style={{
											color: parseInt(this.state.raiting) == 1 ? '#fff' : '#333',
											padding: '0 20px'
										}}>Положительный отзыв</span>
									</ToggleButton>
									<ToggleButton value="2" style={{
										backgroundColor: parseInt(this.state.raiting) == 2 ? '#dd1a32' : '#fff',
										borderRightWidth: 2
									}}>
										<span style={{
											color: parseInt(this.state.raiting) == 2 ? '#fff' : '#333',
											padding: '0 20px'
										}}>Средний отзыв</span>
									</ToggleButton>
									<ToggleButton value="3" style={{backgroundColor: parseInt(this.state.raiting) == 3 ? '#dd1a32' : '#fff'}}>
										<span style={{
											color: parseInt(this.state.raiting) == 3 ? '#fff' : '#333',
											padding: '0 20px'
										}}>Отрицательный отзыв</span>
									</ToggleButton>
								</ToggleButtonGroup>
							</Grid>

							<Grid item xs={12} sm={12} style={{justifyContent: 'center', display: 'flex', marginBottom: 20}}>
								<ToggleButtonGroup
									value={this.state.type_sale}
									exclusive
									size="small"
									onChange={(event, data) => {
										this.setState({type_sale: data ?? 0})
									}}
								>
									<ToggleButton value="10" style={{
										backgroundColor: parseInt(this.state.type_sale) == 10 ? '#dd1a32' : '#fff',
										borderRightWidth: 2
									}}>
										<span style={{
											color: parseInt(this.state.type_sale) == 10 ? '#fff' : '#333',
											padding: '0 20px'
										}}>Скидка 10%</span>
									</ToggleButton>
									<ToggleButton value="20" style={{backgroundColor: parseInt(this.state.type_sale) == 20 ? '#dd1a32' : '#fff'}}>
										<span style={{
											color: parseInt(this.state.type_sale) == 20 ? '#fff' : '#333',
											padding: '0 20px'
										}}>Скидка 20%</span>
									</ToggleButton>
								</ToggleButtonGroup>
							</Grid>

							<Grid item xs={12} sm={12}>
								<TextEditor22 id="EditorNew" value={''} refs_={this.myRef_action} toolbar={true} menubar={true}/>
							</Grid>

						</Grid>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={this.saveCommentAction.bind(this)}>
							Сохранить
						</Button>
					</DialogActions>
				</Dialog>
			</>
		);
	}
}
