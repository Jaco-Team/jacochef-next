import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";

// ---------- Модалка для Графиков ----------
class StatSale_Modal_Graph extends React.Component {
  render() {
    const { open, onClose, id, fullScreen, name } = this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose.bind(this)}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="calc(95% - 32px)"
        slotProps={{
          paper: { style: { height: "90vh" } },
        }}
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold" }}>{name}</Typography>
          <IconButton onClick={onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            direction="column"
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <div
                  id={id}
                  style={{ width: "100%", height: "700px" }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onClose.bind(this)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default StatSale_Modal_Graph;
