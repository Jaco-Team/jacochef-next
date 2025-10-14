import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import Avatar from "@mui/material/Avatar";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export default class Test extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "kkt_info",
      module_name: "",
      is_load: false,

      points: [],
      point: "0",

      kkt: [],
      kkt_update: null,

      type: "",
      pointModal: "",
      modalDialog: false,
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {}

  render() {
    return (
      <>
        <Grid
          container
          spacing={3}
          className="test_container"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>Test view</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button variant="contained">Обновить данные</Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button
              variant="contained"
              style={{ whiteSpace: "nowrap" }}
            >
              Добавить кассу
            </Button>
          </Grid>

          <Grid
            mt={3}
            mb={5}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      style={{ fontWeight: 700 }}
                    >
                      Кассы
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell style={{ minWidth: "150px" }}>№ кассы</TableCell>
                    <TableCell>РН ККТ</TableCell>
                    <TableCell>ФН</TableCell>
                    <TableCell style={{ minWidth: "200px" }}>Дата регистрации</TableCell>
                    <TableCell style={{ minWidth: "200px" }}>Дата окончания</TableCell>
                    <TableCell>Активность</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody></TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}
