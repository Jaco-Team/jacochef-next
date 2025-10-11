"use client";

import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { memo, useEffect, useState } from "react";

const DialogPromoHistory = ({ open, onClose, story }) => {
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
  useEffect(() => {
    if (story.type) {
      setFormData({
        type: story.type,
        discountValue: parseInt(story.discount),
        products: JSON.parse(story.products),
        minOrderAmount: story.minOrderAmount,
        maxOrderAmount: story.maxOrderAmount,
        activationLimit: story.activationLimit,
        daysBeforeIssue: story.daysBeforeIssue,
        validityDays: story.validityDays,
        description: story.description,
      });
    }
  }, [story]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle style={{ display: "flex", alignItems: "center" }}>
        Изменения
        <IconButton
          onClick={onClose}
          style={{ marginLeft: "auto" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
        <Box
          component="form"
          sx={{ mt: 1 }}
        >
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <b>Дата начала изменения: {story?.date_start}</b>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
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
                  disabled
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
                  sm: 6
                }}>
                <Autocomplete
                  options={[]}
                  size="small"
                  disabled
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
              <Grid
                container
                style={{ paddingTop: 20 }}
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
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
                          <TableCell />
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
            )}

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Минимальная сумма заказа"
                name="minOrderAmount"
                type="number"
                disabled
                size="small"
                value={formData.minOrderAmount}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Максимальная сумма заказа"
                name="maxOrderAmount"
                type="number"
                disabled
                value={formData.maxOrderAmount}
                inputProps={{ min: 0 }}
                size="small"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                disabled
                size="small"
                label="Количество активаций"
                name="activationLimit"
                type="number"
                value={formData.activationLimit}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="За сколько дней выписан промокод"
                name="daysBeforeIssue"
                size="small"
                disabled
                type="number"
                value={formData.daysBeforeIssue}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                size="small"
                label="Сколько дней действует промокод"
                name="validityDays"
                type="number"
                disabled
                value={formData.validityDays}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid
              size={{
                xs: 12
              }}>
              <TextField
                fullWidth
                label="Описание промокода"
                name="description"
                disabled
                multiline
                size="small"
                rows={2}
                value={formData.description}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DialogPromoHistory);
