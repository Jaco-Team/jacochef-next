"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddLinkIconOutlined from "@mui/icons-material/AddLinkOutlined";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { useConfirm } from "@/src/hooks/useConfirm";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import FileTypeIcon from "@/ui/FileTypeIcon";
import {
  getDeclarationDisplayFilename,
  getDeclarationStoredFilename,
} from "../declarationFileName";
import ModalAddProduct from "../ModalAddProduct";
import useVendorProductsView from "../useVendorProductsView";
import useVendorsStore from "../useVendorsStore";

const getFileExtension = (value) => {
  const extension = (value || "").split(".").pop()?.toLowerCase();
  return extension && extension !== value?.toLowerCase() ? extension : "";
};

const tableSx = {
  tableLayout: { xs: "auto", sm: "fixed" },
  minWidth: { xs: 640, sm: "100%" },
};
const tableContainerSx = { overflowX: "auto" };
const expandCellSx = { width: 30, px: 0 };
const actionCellSx = { width: { xs: 60, sm: 100 } };
const countCellSx = { width: { xs: 88, sm: 132 }, whiteSpace: "nowrap" };
const collapseCellSx = { py: 0, borderBottom: 0 };
const textCellSx = {
  minWidth: { xs: 180, sm: "auto" },
};
const declarationChipSx = {
  maxWidth: "100%",
  width: "auto",
  display: "inline-flex",
  flex: "0 0 auto",
  alignSelf: "flex-start",
  "& .MuiChip-label": {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 240,
  },
};

export default function TabProducts({
  canEdit,
  canUpload,
  handleAddVendorItem,
  handleRemoveVendorItem,
  handleUnbindDeclaration,
  openDocModal,
}) {
  const { ConfirmDialog, withConfirm } = useConfirm();
  const { itemsSelectData, productCategoryOptions, sortedVendorItems, vendorItemIds } =
    useVendorProductsView();
  const isLoading = useVendorsStore((state) => state.isLoading);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [selectedProductCategoryIds, setSelectedProductCategoryIds] = useState([]);
  const hasProductActions = canEdit || canUpload;

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

  const handleCloseAddModal = () => {
    setIsAddProductModalOpen(false);
    setSelectedCatalogItemId("");
  };

  const handleConfirmAdd = async () => {
    const result = await handleAddVendorItem(selectedCatalogItemId);

    if (result !== false) {
      handleCloseAddModal();
    }
  };

  const handleOpenDeclaration = (event, url) => {
    event.stopPropagation();

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <ConfirmDialog />

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
                sx={{ fontWeight: 700 }}
              >
                Продукты поставщика
              </Typography>
              {canEdit ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddProductModalOpen(true)}
                  disabled={isLoading || !itemsSelectData.length}
                >
                  Добавить
                </Button>
              ) : null}
            </Stack>

            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 8 }}>
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
            </Grid>

            {filteredVendorItems.length ? (
              <TableContainer sx={tableContainerSx}>
                <Table
                  size="small"
                  sx={tableSx}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={expandCellSx} />
                      <TableCell sx={textCellSx}>Наименование</TableCell>
                      <TableCell sx={textCellSx}>Категория</TableCell>
                      <TableCell
                        align="center"
                        sx={countCellSx}
                      >
                        Декларации
                      </TableCell>
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
                    {filteredVendorItems.map((item) => {
                      const isExpanded = Number(expandedProductId) === Number(item.item_id);
                      const declarations = item.declarations || [];
                      const rowKey = item.id ?? item.item_id;

                      return (
                        <Fragment key={rowKey}>
                          <TableRow>
                            <TableCell sx={expandCellSx}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setExpandedProductId(isExpanded ? null : Number(item.item_id))
                                }
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell sx={textCellSx}>{item.item_name || "Товар"}</TableCell>
                            <TableCell sx={textCellSx}>
                              {item.cat_name || "Категория не указана"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={countCellSx}
                            >
                              {declarations.length}
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
                              colSpan={hasProductActions ? 5 : 4}
                              sx={collapseCellSx}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Stack
                                  spacing={1.5}
                                  sx={{ py: 2 }}
                                >
                                  {declarations.length ? (
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      useFlexGap
                                      flexWrap="wrap"
                                    >
                                      {declarations.map((decl) => (
                                        <Tooltip
                                          key={decl.id}
                                          title={getDeclarationStoredFilename(decl)}
                                        >
                                          <Chip
                                            clickable
                                            variant="outlined"
                                            icon={
                                              <FileTypeIcon
                                                extension={getFileExtension(
                                                  decl.filename || decl.url,
                                                )}
                                                sx={{ fontSize: 30 }}
                                              />
                                            }
                                            label={getDeclarationDisplayFilename(decl)}
                                            onClick={(event) =>
                                              handleOpenDeclaration(event, decl.url)
                                            }
                                            onDelete={
                                              canEdit
                                                ? withConfirm(
                                                    () =>
                                                      handleUnbindDeclaration(
                                                        decl.id,
                                                        item.item_id,
                                                      ),
                                                    "Отвязать декларацию от товара?",
                                                  )
                                                : undefined
                                            }
                                            deleteIcon={<LinkOffIcon fontSize="small" />}
                                            disabled={isLoading || !decl.url}
                                            sx={declarationChipSx}
                                          />
                                        </Tooltip>
                                      ))}
                                    </Stack>
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
        isLoading={isLoading}
        itemsSelectData={itemsSelectData}
        selectedCatalogItemId={selectedCatalogItemId}
        setSelectedCatalogItemId={setSelectedCatalogItemId}
        vendorItemIds={vendorItemIds}
      />
    </>
  );
}
