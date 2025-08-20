import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";

const ModalDelete = ({open, onClose, onDelete, id}) => {

  const handleSubmit = () => {
    onDelete(id);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Вы точно хотите удалить изменения?</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose}>Нет</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDelete;
