"use client";

import { Fragment } from "react";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useConfirm } from "@/src/hooks/useConfirm";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MySelect } from "@/ui/Forms";
import ModalAddVendorPriceProduct from "../ModalAddVendorPriceProduct";
import VendorPriceEditDialog from "../VendorPriceEditDialog";
import VendorPriceItemForm from "../VendorPriceItemForm";
import useVendorItemPricePage from "../useVendorItemPricePage";
import {
  formatPackPriceLabel,
  formatPackVolume,
  formatUnitPriceLabel,
} from "../vendorItemPriceUtils";

const tableSx = {
  tableLayout: { xs: "auto", sm: "fixed" },
  minWidth: { xs: 720, sm: "100%" },
};
const tableContainerSx = { overflowX: "auto" };
const expandCellSx = { width: 40, px: 0.5 };
const actionCellSx = { width: 72 };
const priceCellSx = { width: { xs: 120, sm: 140 }, whiteSpace: "nowrap" };
const collapseCellSx = { py: 0, borderBottom: 0 };
const productCellSx = { minWidth: { xs: 180, sm: 220 } };

export default function TabVendorPrices({ canEdit, vendorId }) {
  const { ConfirmDialog, withConfirm } = useConfirm();
  const {
    addDraft,
    alertMessage,
    alertStatus,
    catalogSelectOptions,
    cities,
    city,
    closeAlert,
    editDraft,
    editingItemId,
    enrichedItems,
    expandedItemId,
    handleCancelEdit,
    handleCityChange,
    handleCloseCityModal,
    handleCloseEditModal,
    handleAddDraftChange,
    handleCatalogItemSelect,
    handleCloseAddModal,
    handleConfirmCityScopeSave,
    handleCreateItem,
    handleDeleteItem,
    handleDraftChange,
    handleOpenEditModal,
    handleSaveEdit,
    handleSelectedVendorCitiesChange,
    handleToggleExpand,
    isAddModalOpen,
    isAlert,
    isCityModalOpen,
    isLoading,
    openAddModal,
    selectedCityName,
    selectedVendorCities,
    vendorCities,
  } = useVendorItemPricePage(vendorId);

  const handleConfirmAdd = async () => {
    const isCreated = await handleCreateItem();
    if (isCreated) {
      handleCloseAddModal();
    }
  };

  return (
    <>
      <Backdrop
        open={isLoading}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress />
      </Backdrop>

      <ConfirmDialog />

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <ModalAddVendorPriceProduct
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleConfirmAdd}
        isLoading={isLoading}
        catalogSelectOptions={catalogSelectOptions}
        addDraft={addDraft}
        onCatalogItemSelect={handleCatalogItemSelect}
        onAddDraftChange={handleAddDraftChange}
      />

      <VendorPriceEditDialog
        open={Boolean(editingItemId)}
        onClose={handleCloseEditModal}
        canEdit={canEdit}
        cityLabel={selectedCityName}
        draft={editDraft}
        isLoading={isLoading}
        onCancel={handleCloseEditModal}
        onSave={handleSaveEdit}
        onDraftChange={handleDraftChange}
      />

      <Dialog
        open={isCityModalOpen}
        onClose={handleCloseCityModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="button">
          <Typography>Где применить</Typography>
          <IconButton
            onClick={handleCloseCityModal}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid size={{ xs: 12 }}>
            <MyAutocomplite
              label="Города"
              multiple
              data={vendorCities}
              value={selectedVendorCities}
              func={handleSelectedVendorCitiesChange}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmCityScopeSave}
            variant="contained"
            disabled={isLoading}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Grid
                container
                spacing={2}
                sx={{ flex: 1 }}
              >
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <MySelect
                    data={cities}
                    value={city}
                    func={handleCityChange}
                    is_none={false}
                    label="Город"
                  />
                </Grid>
              </Grid>
              {canEdit ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddModal}
                  disabled={isLoading || !city || !catalogSelectOptions.length}
                  sx={{ alignSelf: { xs: "stretch", sm: "center" }, flexShrink: 0 }}
                >
                  Добавить продукт
                </Button>
              ) : null}
            </Stack>

            <TableContainer sx={tableContainerSx}>
              <Table
                size="small"
                sx={tableSx}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={expandCellSx} />
                    <TableCell sx={productCellSx}>Продукт</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell align="center">Декларации</TableCell>
                    <TableCell sx={priceCellSx}>Цена за упаковку</TableCell>
                    <TableCell>Объём упаковки</TableCell>
                    <TableCell sx={priceCellSx}>Цена за 1 ед.</TableCell>
                    {canEdit ? (
                      <TableCell
                        align="right"
                        sx={actionCellSx}
                      />
                    ) : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrichedItems.map((item) => {
                    const itemId = Number(item.item_id);
                    const isExpanded = expandedItemId === itemId;
                    const hasDeclarations = Number(item.declarations_count) > 0;

                    return (
                      <Fragment key={itemId}>
                        <TableRow hover>
                          <TableCell sx={expandCellSx}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleExpand(item)}
                              disabled={!city}
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={productCellSx}>
                            <Stack spacing={0.25}>
                              <Typography sx={{ fontWeight: 700 }}>
                                {item.name || "Товар"}
                              </Typography>
                              {item.name_for_vendor ? (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.name_for_vendor}
                                </Typography>
                              ) : null}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {item.cat_name ? (
                              <Chip
                                label={item.cat_name}
                                size="small"
                                sx={{
                                  bgcolor: "rgba(25, 118, 210, 0.08)",
                                  color: "primary.main",
                                  fontWeight: 600,
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Не указана
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Typography sx={{ fontWeight: 600 }}>
                                {item.declarations_count || 0}
                              </Typography>
                              {hasDeclarations ? (
                                <DescriptionOutlinedIcon
                                  sx={{ fontSize: 16, color: "error.main" }}
                                />
                              ) : null}
                            </Stack>
                          </TableCell>
                          <TableCell sx={priceCellSx}>
                            <Typography
                              component="button"
                              type="button"
                              onClick={() => canEdit && handleOpenEditModal(item)}
                              sx={{
                                fontWeight: 700,
                                border: 0,
                                bgcolor: "transparent",
                                p: 0,
                                cursor: canEdit ? "pointer" : "default",
                                textAlign: "left",
                                color: "text.primary",
                              }}
                            >
                              {formatPackPriceLabel(item.full_price)}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatPackVolume(item)}</TableCell>
                          <TableCell sx={priceCellSx}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatUnitPriceLabel(item)}
                            </Typography>
                          </TableCell>
                          {canEdit ? (
                            <TableCell
                              align="right"
                              sx={actionCellSx}
                            >
                              <Tooltip title="Удалить">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={withConfirm(
                                      () => handleDeleteItem(item.item_id),
                                      "Удалить цену продукта у поставщика?",
                                    )}
                                    disabled={isLoading || !city}
                                    sx={{ color: "primary.main" }}
                                  >
                                    <DeleteOutlineIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          ) : null}
                        </TableRow>
                        <TableRow>
                          <TableCell
                            colSpan={canEdit ? 8 : 7}
                            sx={collapseCellSx}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ py: 2 }}>
                                <VendorPriceItemForm
                                  canEdit={canEdit}
                                  cityLabel={selectedCityName}
                                  draft={editDraft}
                                  isLoading={isLoading}
                                  onCancel={handleCancelEdit}
                                  onSave={handleSaveEdit}
                                  onDraftChange={handleDraftChange}
                                />
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {!city ? (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Выберите город, чтобы загрузить цены.
              </Typography>
            ) : null}
            {city && !enrichedItems.length && !isLoading ? (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Нет продуктов с ценами для выбранного города.
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
