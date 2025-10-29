"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import DialogPromoHistory from "./DialogPromoHistory";
import ModalDelete from "./ModalDelete";
import DateModal from "./DateModal";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

export default function PromoCodeForm({
  mockItems,
  getData,
  setIsLoad,
  setErrStatus,
  setErrText,
  setOpenAlert,
}) {
  const [formData, setFormData] = useState({
    type: "",
    discountValue: "",
    products: [],
    minOrderAmount: "",
    maxOrderAmount: "",
    activationLimit: "",
    daysBeforeIssue: 0,
    validityDays: "",
    description: "",
  });

  const [history, setHistory] = useState([]);
  const [position, setPosition] = useState({});
  const [count, setCount] = useState(0);
  const [price, setPrice] = useState(0);
  const [open, setOpen] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [story, setStory] = useState({});

  const openModal = (item) => {
    setStory(item);
    setOpen(true);
  };

  const openModalDelete = (item) => {
    setStory(item);
    setOpenDelete(true);
  };

  const onDeleteDate = (date) => {
    setIsLoad(true);
    getData("delete_date", { date_start: date })
      .then((data) => {
        if (!data.st) {
          setErrStatus(data.st);
          setErrText(data.text);
          setOpenAlert(true);
        } else {
          getData("get_promo")
            .then((data) => setHistory(data.history))
            .finally(() => setIsLoad(false));
        }
      })
      .finally(() => setIsLoad(false));
  };

  const discountOptions = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        discountValue: "",
        products: [],
      }));
    }
  };

  useEffect(() => {
    getData("get_promo").then((data) => {
      setHistory(data.history);
      setFormData({
        type: data.promo.type,
        discountValue: parseInt(data.promo.discount, 10),
        products: JSON.parse(data.promo.products),
        minOrderAmount: data.promo.minOrderAmount,
        maxOrderAmount: data.promo.maxOrderAmount,
        activationLimit: data.promo.activationLimit,
        daysBeforeIssue: data.promo.daysBeforeIssue,
        validityDays: data.promo.validityDays,
        description: data.promo.description,
      });
    });
  }, []);
  const handleSubmit = (date) => {
    setIsLoad(true);
    getData("save_promo", { ...formData, date_start: dayjs(date).format("YYYY-MM-DD") })
      .then((data) => {
        if (!data.st) {
          setErrStatus(data.st);
          setErrText(data.text);
          setOpenAlert(true);
        } else {
          getData("get_promo")
            .then((data) => setHistory(data.history))
            .finally(() => setIsLoad(false));
        }
      })
      .finally(() => {
        setIsLoad(false);
      });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      discountValue: "",
      products: [...prev.products, { ...position, price, count }],
    }));
    setCount(0);
    setPrice(0);
    setPosition("");
  };

  const delItemAdd = (item) => {
    setFormData((prev) => ({
      ...prev,
      products: [...formData.products.filter((value) => value.id !== item.id)],
    }));
  };

  return (
    <Box
      component="form"
      sx={{ mt: 1 }}
    >
      <DialogPromoHistory
        onClose={() => setOpen(false)}
        open={open}
        getData={getData}
        story={story}
      />
      <ModalDelete
        onClose={() => setOpenDelete(false)}
        open={openDelete}
        onDelete={onDeleteDate}
        date={story}
      />
      <DateModal
        open={openDate}
        onClose={() => setOpenDate(false)}
        onSave={handleSubmit}
      />
      <Grid
        container
        spacing={3}
        sx={{ padding: 0 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <FormControl
            fullWidth
            size="small"
          >
            <InputLabel id="discount-type-label">Тип</InputLabel>
            <Select
              labelId="discount-type-label"
              id="type"
              name="type"
              value={formData.type}
              label="Тип скидки"
              onChange={handleChange}
              required
            >
              <MenuItem value="percentage">Cкидка</MenuItem>
              <MenuItem value="product">Добавление товара</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {formData.type && formData.type !== "product" && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Autocomplete
              options={discountOptions}
              size="small"
              getOptionLabel={(option) => `${option}%`}
              value={formData.discountValue}
              onChange={(_, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  discountValue: newValue,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Размер скидки"
                  required
                />
              )}
            />
          </Grid>
        )}

        {formData.type === "product" && (
          <>
            <Grid
              container
              direction="row"
              justifyContent="center"
              spacing={3}
              sx={{ paddingTop: 0 }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyAutocomplite
                  data={mockItems}
                  value={position}
                  func={(event, data) => {
                    setPosition(data);
                  }}
                  label="Позиция"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={count}
                  func={(e) => setCount(e.target.value)}
                  label="Количество"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  value={price}
                  func={(e) => setPrice(e.target.value)}
                  label="Цена за все"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Button
                  variant="contained"
                  onClick={addItem}
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Позиция</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Цена за все</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.products.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>{item.price}</TableCell>
                        <TableCell>
                          <CloseIcon
                            onClick={() => delItemAdd(item)}
                            style={{ cursor: "pointer" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell />
                      <TableCell />
                      <TableCell>
                        {formData.products.reduce((sum, item) => sum + parseInt(item.price), 0)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </Grid>
            </Grid>
          </>
        )}

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            fullWidth
            label="Минимальная сумма заказа"
            name="minOrderAmount"
            type="number"
            size="small"
            value={formData.minOrderAmount}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            required
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            fullWidth
            label="Максимальная сумма заказа"
            name="maxOrderAmount"
            type="number"
            value={formData.maxOrderAmount}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            size="small"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Количество активаций"
            name="activationLimit"
            type="number"
            value={formData.activationLimit}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            required
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            fullWidth
            label="За сколько дней выписан промокод"
            name="daysBeforeIssue"
            size="small"
            type="number"
            value={formData.daysBeforeIssue}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            required
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Сколько дней действует промокод"
            name="validityDays"
            type="number"
            value={formData.validityDays}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            required
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
          }}
        >
          <TextField
            fullWidth
            label="Описание промокода"
            name="description"
            multiline
            size="small"
            rows={2}
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          display="grid"
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Button
            color="success"
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              setOpenDate(true);
            }}
            type="submit"
            style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
          >
            Сохранить изменения
          </Button>
        </Grid>
        <Grid
          display="grid"
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Accordion style={{ marginTop: "24px", display: history.length ? "inherit" : "none" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "bold" }}>История изменений</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "20%" }}>#</TableCell>
                    <TableCell style={{ width: "30%" }}>Дата начала изменения</TableCell>
                    <TableCell style={{ width: "30%" }}>Дата создания</TableCell>
                    <TableCell style={{ width: "15%" }}>Сотрудник</TableCell>
                    <TableCell style={{ width: "5%" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item, k) => (
                    <TableRow key={k}>
                      <TableCell>{k + 1}</TableCell>
                      <TableCell
                        hover={true}
                        style={{ cursor: "pointer" }}
                        onClick={() => openModal(item)}
                      >
                        {item.date_start}
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.user_name}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => openModalDelete(item)}>
                          <DeleteIcon style={{ color: "red" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}
