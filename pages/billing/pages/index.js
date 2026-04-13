import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { api_laravel, api_laravel_local } from "@/src/api_new";

function Pages() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [formsActive, setFormsActive] = useState([]);
  const [formsNonActive, setFormsNonActive] = useState([]);
  const [products, setProducts] = useState([]);

  // State для диалогов
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const router = useRouter();

  useEffect(() => {
    getData("get_all_for_pages").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setFormsActive(data.ocrs);
      setProducts(data.products);
      setFormsNonActive(data.ocrs_null);
    });
  }, []);

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel_local("billing", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setSelectedProduct(null);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      showSnackbar("Выберите товар для сверки", "error");
      return;
    }

    setEditDialogOpen(false);
    setIsLoad(true);

    try {
      await api_laravel_local("billing", "save_reconciliation", {
        ocr_id: currentItem.id,
        product_name: selectedProduct,
      });

      // Обновляем данные
      const data = await getData("get_all_for_pages");
      setFormsActive(data.ocrs);
      setFormsNonActive(data.ocrs_null);

      showSnackbar("Сверка успешно сохранена", "success");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      showSnackbar("Не удалось сохранить сверку", "error");
    } finally {
      setIsLoad(false);
      setCurrentItem(null);
      setSelectedProduct(null);
    }
  };

  const handleDeleteClick = () => {
    setEditDialogOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setIsLoad(true);

    try {
      await api_laravel("billing", "delete_reconciliation", {
        ocr_id: currentItem.id,
      });

      // Обновляем данные
      const data = await getData("get_all_for_pages");
      setFormsActive(data.ocrs);
      setFormsNonActive(data.ocrs_null);

      showSnackbar("Сверка успешно удалена", "success");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      showSnackbar("Не удалось удалить сверку", "error");
    } finally {
      setIsLoad(false);
      setCurrentItem(null);
      setSelectedProduct(null);
    }
  };

  const ReconciliationTable = ({ title, data, isActive }) => (
    <Accordion defaultExpanded={!isActive}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <h3 style={{ margin: 0 }}>
          {title} ({data.length})
        </h3>
      </AccordionSummary>
      <AccordionDetails>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>OCR Название</strong>
              </TableCell>
              <TableCell>
                <strong>Нормализованное название</strong>
              </TableCell>
              {!isActive && (
                <TableCell>
                  <strong>Действия</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.ocr_name}</TableCell>
                  <TableCell>{item.ocr_name_norm || "—"}</TableCell>
                  {!isActive && (
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(item)}
                        title="Редактировать"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px" }}>Нет данных для отображения</div>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
      sx={{
        mb: 3,
      }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid size={{ xs: 12 }}>
        <h1>{module.name} / Сверка наименований</h1>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ReconciliationTable
          title="Сверено"
          data={formsActive}
          isActive={true}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ReconciliationTable
          title="Надо сверить"
          data={formsNonActive}
          isActive={false}
        />
      </Grid>

      {/* Модалка редактирования/удаления */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактирование сверки</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Настройка сверки для: <strong>{currentItem?.ocr_name}</strong>
          </DialogContentText>

          <Autocomplete
            options={products}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
            onChange={(event, newValue) => {
              setSelectedProduct(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите товар"
                size="small"
                placeholder="Выберите товар для сверки"
              />
            )}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDeleteClick}
            color="error"
          >
            Удалить
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить сверку для "<strong>{currentItem?.ocr_name}</strong>"?
            Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default function FeedBack() {
  return <Pages />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
