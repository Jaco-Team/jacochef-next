"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddLinkIconOutlined from "@mui/icons-material/AddLinkOutlined";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import { useConfirm } from "@/src/hooks/useConfirm";
import useApi from "@/src/hooks/useApi";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MySelect, MyTextInput } from "@/ui/Forms";
import FileTypeIcon from "@/ui/FileTypeIcon";
import {
  getDeclarationDisplayFilename,
  getDeclarationStoredFilename,
} from "../declarationFileName";
import DeclarationEditDialog from "../DeclarationEditDialog";
import ModalAddProduct from "../ModalAddProduct";
import VendorPriceEditDialog from "../VendorPriceEditDialog";
import VendorPriceItemForm from "../VendorPriceItemForm";
import useVendorItemPricePage from "../useVendorItemPricePage";
import useVendorProductsView, { buildItemsSelectData } from "../useVendorProductsView";
import useVendorsStore from "../useVendorsStore";
import {
  formatPackPriceLabel,
  formatPackVolume,
  formatUnitPriceLabel,
  mergeVendorItemWithPrice,
} from "../vendorItemPriceUtils";

const getFileExtension = (value) => {
  const extension = (value || "").split(".").pop()?.toLowerCase();
  return extension && extension !== value?.toLowerCase() ? extension : "";
};

const tableSx = {
  tableLayout: { xs: "auto", sm: "fixed" },
  minWidth: { xs: 720, sm: "100%" },
};
const tableContainerSx = { overflowX: "auto" };
const expandCellSx = { width: 40, px: 0.5 };
const actionCellSx = { width: { xs: 72, sm: 100 } };
const countCellSx = { width: { xs: 96, sm: 120 }, whiteSpace: "nowrap" };
const priceCellSx = { width: { xs: 120, sm: 140 }, whiteSpace: "nowrap" };
const collapseCellSx = { py: 0, borderBottom: 0 };
const productCellSx = { minWidth: { xs: 180, sm: 220 } };
const nestedTableContainerSx = { borderRadius: 2, border: "1px solid", borderColor: "divider" };

const formatDeclarationExpiry = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD.MM.YYYY") : "Не указана";

const formatDeclarationAdded = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD.MM.YYYY") : "Не указана";

const formatDeclarationType = (decl) => {
  const extension = getFileExtension(decl.filename || decl.url);
  return extension ? extension.toUpperCase() : "Не указан";
};

const formatDeclarationSize = (decl) => {
  if (typeof decl.filesize !== "number" || Number.isNaN(decl.filesize) || decl.filesize <= 0) {
    return "Не указан";
  }

  const units = ["Б", "КБ", "МБ", "ГБ"];
  let value = decl.filesize;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const fractionDigits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(fractionDigits)} ${units[unitIndex]}`;
};

const getExpiresSortKey = (decl) => {
  const timestamp = Date.parse(decl.expires_at || "");
  return Number.isNaN(timestamp) ? "2" : `1_${String(timestamp).padStart(13, "0")}`;
};

const isExpiredDeclaration = (decl) =>
  Boolean(
    decl?.expires_at &&
    dayjs(decl.expires_at).isValid() &&
    dayjs(decl.expires_at).isBefore(dayjs(), "day"),
  );

const isExpiringSoon = (decl) => {
  if (!decl?.expires_at || !dayjs(decl.expires_at).isValid()) {
    return false;
  }

  const diff = dayjs(decl.expires_at).startOf("day").diff(dayjs().startOf("day"), "day");
  return diff >= 0 && diff <= 14;
};

const formatExpiringSoonLabel = (count) => (count === 1 ? "1 истекает" : `${count} истекают`);

export default function TabProducts({
  canEdit,
  canEditDeclaration,
  canUpload,
  canEditСost,
  getItemVendorOptions,
  handleAddVendorItem,
  handleUploadDeclaration,
  handleRemoveVendorItem,
  handleSaveDeclaration,
  loadItemVendors,
  openDocModal,
  vendorId,
}) {
  const { ConfirmDialog, withConfirm } = useConfirm();
  const { api_laravel } = useApi("vendors");
  const apiLaravelRef = useRef(api_laravel);
  const { productCategoryOptions, sortedVendorItems, vendorItemIds } = useVendorProductsView();
  const isVendorsLoading = useVendorsStore((state) => state.isLoading);
  const {
    alertMessage,
    alertStatus,
    city,
    citySelectOptions,
    closeAlert,
    editDraft,
    enrichedItems,
    expandedItemId,
    handleCancelEdit,
    handleCityChange,
    handleCloseCityModal,
    handleCloseEditModal,
    handleConfirmCityScopeSave,
    handleDraftChange,
    handleOpenEditModal,
    handleSaveEdit,
    handleSelectedVendorCitiesChange,
    handleToggleExpand,
    reloadItems,
    editingItemId,
    isAlert,
    isCityModalOpen,
    isLoading: isPriceLoading,
    selectedCityName,
    selectedVendorCities,
    vendorCities,
  } = useVendorItemPricePage(vendorId);

  const isLoading = isVendorsLoading || isPriceLoading;
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [modalCatalogItems, setModalCatalogItems] = useState([]);
  const [isModalCatalogLoading, setIsModalCatalogLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [declarationFile, setDeclarationFile] = useState(null);
  const [declarationExpiresAt, setDeclarationExpiresAt] = useState(null);
  const [selectedProductCategoryIds, setSelectedProductCategoryIds] = useState([]);
  const [editableDeclaration, setEditableDeclaration] = useState(null);
  const hasProductActions = canEdit || canUpload;
  const hasDeclarationActions = canEditDeclaration;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const priceByItemId = useMemo(
    () => new Map(enrichedItems.map((item) => [Number(item.item_id), item])),
    [enrichedItems],
  );

  const selectedProductCategories = useMemo(
    () =>
      productCategoryOptions.filter((option) =>
        selectedProductCategoryIds.some((categoryId) => String(categoryId) === String(option.id)),
      ),
    [productCategoryOptions, selectedProductCategoryIds],
  );

  const filteredVendorItems = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase();
    const selectedCategoryIds = new Set(
      selectedProductCategoryIds.map((categoryId) => Number(categoryId)),
    );

    return sortedVendorItems.filter((item) => {
      const matchesSearch = !normalizedSearch
        ? true
        : (item.item_name || "").toLowerCase().includes(normalizedSearch);
      const matchesCategory = !selectedCategoryIds.size
        ? true
        : selectedCategoryIds.has(Number(item.cat_id));

      return matchesSearch && matchesCategory;
    });
  }, [productSearch, selectedProductCategoryIds, sortedVendorItems]);

  const mergedItems = useMemo(
    () =>
      filteredVendorItems.map((vendorItem) =>
        mergeVendorItemWithPrice(vendorItem, priceByItemId.get(Number(vendorItem.item_id))),
      ),
    [filteredVendorItems, priceByItemId],
  );

  const modalItemsSelectData = useMemo(
    () => buildItemsSelectData(modalCatalogItems, vendorItemIds),
    [modalCatalogItems, vendorItemIds],
  );

  useEffect(() => {
    apiLaravelRef.current = api_laravel;
  }, [api_laravel]);

  useEffect(() => {
    if (!isAddProductModalOpen || !vendorId) {
      return undefined;
    }

    let isActive = true;

    const loadModalCatalogItems = async () => {
      setIsModalCatalogLoading(true);

      try {
        const response = await apiLaravelRef.current("get_items_for_vendors_new", {
          vendor_id: vendorId,
        });

        if (!isActive) {
          return;
        }

        if (!response?.st) {
          throw new Error(response?.text || "Не удалось загрузить товары");
        }

        setModalCatalogItems(response.items ?? response.all_items ?? []);
      } catch {
        if (isActive) {
          setModalCatalogItems([]);
        }
      } finally {
        if (isActive) {
          setIsModalCatalogLoading(false);
        }
      }
    };

    loadModalCatalogItems();

    return () => {
      isActive = false;
    };
  }, [isAddProductModalOpen, vendorId]);

  const handleCloseAddModal = () => {
    setIsAddProductModalOpen(false);
    setModalCatalogItems([]);
    setSelectedCatalogItemId("");
    setDeclarationFile(null);
    setDeclarationExpiresAt(null);
  };

  const handleConfirmAdd = async () => {
    const catalogItemId = selectedCatalogItemId;
    const result = await handleAddVendorItem(catalogItemId);

    if (result === false) {
      return;
    }

    if (declarationFile && canUpload) {
      await handleUploadDeclaration(catalogItemId, declarationFile, declarationExpiresAt);
    }

    await reloadItems();
    handleCloseAddModal();
  };

  const handleOpenDeclaration = (event, url) => {
    event.stopPropagation();

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCloseEditDialog = () => {
    setEditableDeclaration(null);
  };

  const collapseColSpan = hasProductActions ? 8 : 7;

  return (
    <>
      <Backdrop
        open={isPriceLoading}
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

      <VendorPriceEditDialog
        open={Boolean(editingItemId)}
        onClose={handleCloseEditModal}
        canEdit={canEditСost}
        cityLabel={selectedCityName}
        draft={editDraft}
        isLoading={isPriceLoading}
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
            disabled={isPriceLoading}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <DeclarationEditDialog
        open={Boolean(editableDeclaration)}
        declaration={editableDeclaration}
        isLoading={isLoading}
        loadItemVendors={loadItemVendors}
        onClose={handleCloseEditDialog}
        onSubmit={handleSaveDeclaration}
        vendorOptions={getItemVendorOptions?.(editableDeclaration?.item_id) || []}
      />

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 700, display: "flex", alignItems: "center" }}
              >
                Продукты поставщика
                <Tooltip
                  title="Красная декларация за 2 недели"
                  arrow
                >
                  <InfoIcon sx={{ marginLeft: "10px", color: "grey" }} />
                </Tooltip>
              </Typography>
              {canEdit ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddProductModalOpen(true)}
                  disabled={isLoading}
                >
                  Добавить
                </Button>
              ) : null}
            </Stack>

            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 5 }}>
                <MyTextInput
                  type="search"
                  label="Поиск по названию"
                  value={productSearch}
                  func={(event) => setProductSearch(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyAutocomplite
                  multiple
                  label="Категории"
                  data={productCategoryOptions}
                  value={selectedProductCategories}
                  func={(_, value) => setSelectedProductCategoryIds(value.map((item) => item.id))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MySelect
                  data={citySelectOptions}
                  value={city}
                  func={handleCityChange}
                  is_none={false}
                  label="Город"
                />
              </Grid>
            </Grid>

            {mergedItems.length ? (
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
                      <TableCell
                        align="center"
                        sx={countCellSx}
                      >
                        Декларации
                      </TableCell>
                      <TableCell sx={priceCellSx}>Цена за упаковку</TableCell>
                      <TableCell>Объём упаковки</TableCell>
                      <TableCell sx={priceCellSx}>Цена за 1 ед.</TableCell>
                      {hasProductActions ? (
                        <TableCell
                          align="right"
                          sx={actionCellSx}
                        >
                          Действия
                        </TableCell>
                      ) : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mergedItems.map((item) => {
                      const itemId = Number(item.item_id);
                      const isExpanded = expandedItemId === itemId;
                      const declarations = (item.declarations || [])
                        .filter((decl) => !isExpiredDeclaration(decl))
                        .sort((a, b) => getExpiresSortKey(b).localeCompare(getExpiresSortKey(a)));
                      const expiringSoonCount = declarations.filter((decl) =>
                        isExpiringSoon(decl),
                      ).length;
                      const hasDeclarations = declarations.length > 0;
                      const rowKey = item.id ?? item.item_id;

                      return (
                        <Fragment key={rowKey}>
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
                                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
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
                            <TableCell
                              align="center"
                              sx={countCellSx}
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Typography sx={{ fontWeight: 600 }}>
                                  {declarations.length}
                                </Typography>
                                {hasDeclarations ? (
                                  <DescriptionOutlinedIcon
                                    sx={{ fontSize: 16, color: "error.main" }}
                                  />
                                ) : null}
                                {expiringSoonCount > 0 ? (
                                  <Chip
                                    label={formatExpiringSoonLabel(expiringSoonCount)}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      borderRadius: 1,
                                      backgroundColor: "rgba(211, 47, 47, 0.08)",
                                      color: "error.main",
                                      border: "1px solid rgba(211, 47, 47, 0.28)",
                                      "& .MuiChip-label": { px: 1 },
                                    }}
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
                                  whiteSpace: "nowrap",
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
                            {hasProductActions ? (
                              <TableCell
                                align="right"
                                sx={actionCellSx}
                              >
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="flex-end"
                                >
                                  {canUpload ? (
                                    <Tooltip title="Добавить декларацию">
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() => openDocModal(item.item_id)}
                                          disabled={isLoading}
                                        >
                                          <AddLinkIconOutlined />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  ) : null}
                                  {canEdit ? (
                                    <Tooltip title="Удалить товар">
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={withConfirm(
                                            () => handleRemoveVendorItem(item.item_id),
                                            "Удалить товар у поставщика без возможности восстановления?",
                                          )}
                                          disabled={isLoading}
                                          sx={{ color: "primary.main" }}
                                        >
                                          <DeleteOutlineIcon />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  ) : null}
                                </Stack>
                              </TableCell>
                            ) : null}
                          </TableRow>
                          <TableRow>
                            <TableCell
                              colSpan={collapseColSpan}
                              sx={collapseCellSx}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Stack
                                  spacing={2}
                                  sx={{
                                    py: 2,
                                    width: "100%",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {canEdit && city && !isMobile ? (
                                    <VendorPriceItemForm
                                      canEdit={canEditСost}
                                      cityLabel={selectedCityName}
                                      draft={editDraft}
                                      isLoading={isPriceLoading}
                                      onCancel={handleCancelEdit}
                                      onSave={handleSaveEdit}
                                      onDraftChange={handleDraftChange}
                                    />
                                  ) : null}

                                  {isMobile && canEdit && city && isExpanded ? (
                                    <Box
                                      sx={{
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 1,
                                        width: { xs: "min(100%, calc(100vw - 48px))", sm: "auto" },
                                        bgcolor: "background.paper",
                                        py: 0.5,
                                      }}
                                    >
                                      <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => handleOpenEditModal(item)}
                                        disabled={isPriceLoading}
                                      >
                                        Редактировать цену
                                      </Button>
                                    </Box>
                                  ) : null}

                                  {declarations.length ? (
                                    <TableContainer sx={nestedTableContainerSx}>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Файл</TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>Тип</TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              Добавлена
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              Добавил
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              Действует до
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              Размер
                                            </TableCell>
                                            {hasDeclarationActions ? (
                                              <TableCell
                                                align="right"
                                                sx={{ whiteSpace: "nowrap", width: 96 }}
                                              >
                                                Действия
                                              </TableCell>
                                            ) : null}
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {declarations.map((decl) => (
                                            <TableRow key={decl.id}>
                                              <TableCell sx={{ minWidth: 260 }}>
                                                <Tooltip title={getDeclarationStoredFilename(decl)}>
                                                  <Stack
                                                    direction="row"
                                                    spacing={1.25}
                                                    alignItems="center"
                                                    sx={{
                                                      cursor: decl.url ? "pointer" : "default",
                                                      width: "fit-content",
                                                      maxWidth: "100%",
                                                    }}
                                                    onClick={(event) =>
                                                      handleOpenDeclaration(event, decl.url)
                                                    }
                                                  >
                                                    <FileTypeIcon
                                                      extension={getFileExtension(
                                                        decl.filename || decl.url,
                                                      )}
                                                      sx={{ fontSize: 30, flexShrink: 0 }}
                                                    />
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        fontWeight: 500,
                                                        wordBreak: "break-word",
                                                      }}
                                                    >
                                                      {getDeclarationDisplayFilename(decl)}
                                                    </Typography>
                                                  </Stack>
                                                </Tooltip>
                                              </TableCell>
                                              <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {formatDeclarationType(decl)}
                                              </TableCell>
                                              <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {formatDeclarationAdded(decl.created_at)}
                                              </TableCell>
                                              <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {decl.creator_name || "Не указан"}
                                              </TableCell>
                                              <TableCell
                                                sx={{
                                                  whiteSpace: "nowrap",
                                                  color: isExpiringSoon(decl)
                                                    ? "error.main"
                                                    : "inherit",
                                                  fontWeight: isExpiringSoon(decl) ? 700 : 400,
                                                }}
                                              >
                                                {formatDeclarationExpiry(decl.expires_at)}
                                              </TableCell>
                                              <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {formatDeclarationSize(decl)}
                                              </TableCell>
                                              {hasDeclarationActions ? (
                                                <TableCell
                                                  align="right"
                                                  sx={{ whiteSpace: "nowrap" }}
                                                >
                                                  {canEditDeclaration ? (
                                                    <Tooltip title="Редактировать">
                                                      <span>
                                                        <IconButton
                                                          size="small"
                                                          onClick={() =>
                                                            setEditableDeclaration({
                                                              ...decl,
                                                              item_id: item.item_id,
                                                            })
                                                          }
                                                          disabled={isLoading}
                                                          sx={{ color: "primary.main" }}
                                                        >
                                                          <EditIcon fontSize="small" />
                                                        </IconButton>
                                                      </span>
                                                    </Tooltip>
                                                  ) : null}
                                                </TableCell>
                                              ) : null}
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Для этого товара пока нет деклараций.
                                    </Typography>
                                  )}
                                </Stack>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                {vendorItemIds.size
                  ? "По текущим фильтрам товары не найдены."
                  : "У поставщика пока нет привязанных товаров."}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <ModalAddProduct
        open={isAddProductModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleConfirmAdd}
        isLoading={isLoading || isModalCatalogLoading}
        itemsSelectData={modalItemsSelectData}
        selectedCatalogItemId={selectedCatalogItemId}
        setSelectedCatalogItemId={setSelectedCatalogItemId}
        vendorItemIds={vendorItemIds}
        canUpload={canUpload}
        declarationFile={declarationFile}
        declarationExpiresAt={declarationExpiresAt}
        onDeclarationFileChange={setDeclarationFile}
        onDeclarationExpiresAtChange={setDeclarationExpiresAt}
      />
    </>
  );
}
