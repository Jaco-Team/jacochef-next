"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { MySelect } from "@/ui/Forms";
import { useVendorDetails } from "../VendorDetailsContext";
import { formatVendorNds } from "../vendorFormUtils";

const getDeclarationLabel = (decl) =>
  decl?.filename?.split("/")?.pop() || decl?.url?.split("/")?.pop() || "Декларация";

export default function TabProducts() {
  const {
    sortedVendorItems,
    vendorItemIds,
    selectedItemId,
    setSelectedItemId,
    selectedVendorItem,
    availableDeclarationsForBind,
    bindDeclarationId,
    setBindDeclarationId,
    handleBindDeclaration,
    handleUploadDeclaration,
    handleUnbindDeclaration,
    handleDeleteDeclaration,
    isDeclarationWorking,
    isEditing,
    isItemsSaving,
    itemsSelectData,
    selectedCatalogItemId,
    setSelectedCatalogItemId,
    handleAddVendorItem,
    handleRemoveVendorItem,
  } = useVendorDetails();

  const selectOptions = itemsSelectData;

  return (
    <Stack spacing={3}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "flex-end" }}
          >
            <MySelect
              label="Выберите товар"
              data={selectOptions}
              value={selectedCatalogItemId}
              func={(event) => setSelectedCatalogItemId(event.target.value)}
              is_none
              sx={{ minWidth: 240 }}
              disabled={!isEditing}
            />
            <Button
              variant="contained"
              onClick={handleAddVendorItem}
              disabled={
                !isEditing ||
                isItemsSaving ||
                !selectedCatalogItemId ||
                vendorItemIds.has(Number(selectedCatalogItemId))
              }
            >
              Добавить
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Товары поставщика
          </Typography>
          {sortedVendorItems.length ? (
            <Stack
              spacing={1}
              sx={{ mt: 2 }}
            >
              {sortedVendorItems.map((item) => {
                const isSelected = Number(item.item_id) === Number(selectedItemId);
                return (
                  <Box
                    key={item.id ?? item.item_id}
                    sx={{
                      borderRadius: 2,
                      p: 1,
                      border: 1,
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "action.selected" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedItemId(Number(item.item_id))}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1">{item.item_name || "Товар"}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.cat_name || "Категория не указана"}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Chip
                          label={formatVendorNds(item.nds)}
                          size="small"
                        />
                        {isEditing ? (
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ ml: 1 }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveVendorItem(item.item_id);
                            }}
                            disabled={isItemsSaving}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Stack>
                    </Stack>
                    {(item.declarations || []).length ? (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ mt: 1 }}
                      >
                        {(item.declarations || []).map((decl) => (
                          <Chip
                            key={decl.id}
                            label={getDeclarationLabel(decl)}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Деклараций нет
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              У поставщика пока нет привязанных товаров.
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {selectedVendorItem
              ? "Декларации выбранного товара"
              : "Выберите товар, чтобы посмотреть декларации"}
          </Typography>
          {selectedVendorItem ? (
            <Stack
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1">
                  {selectedVendorItem.item_name || "Товар"}
                </Typography>
                <Chip
                  label={formatVendorNds(selectedVendorItem.nds)}
                  size="small"
                />
              </Stack>
              {selectedVendorItem.declarations?.length ? (
                <Stack spacing={1}>
                  {selectedVendorItem.declarations.map((decl) => (
                    <Stack
                      key={decl.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ borderRadius: 1, p: 1, bgcolor: "action.hover" }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{getDeclarationLabel(decl)}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {decl.created_at || "Дата не указана"}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1}
                      >
                        <Button
                          component="a"
                          href={decl.url}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                        >
                          Открыть
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleUnbindDeclaration(decl.id)}
                          disabled={isDeclarationWorking}
                        >
                          Отвязать
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleDeleteDeclaration(decl.id)}
                          disabled={isDeclarationWorking}
                        >
                          Удалить
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">Декларации пока не загружены.</Typography>
              )}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="flex-start"
              >
                <Button
                  variant="outlined"
                  startIcon={<UploadFileOutlinedIcon />}
                  component="label"
                  disabled={isDeclarationWorking}
                >
                  Загрузить PDF
                  <input
                    hidden
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) {
                        handleUploadDeclaration(selectedVendorItem.item_id, file);
                      }
                    }}
                  />
                </Button>
                <Stack
                  spacing={1}
                  flex={1}
                >
                  <MySelect
                    label="Связать декларацию"
                    data={availableDeclarationsForBind.map((decl) => ({
                      id: String(decl.id),
                      name: `${getDeclarationLabel(decl)} (${decl.item_name || "Товар"})`,
                    }))}
                    value={bindDeclarationId}
                    func={(event) => setBindDeclarationId(event.target.value)}
                    is_none={false}
                    disabled={!availableDeclarationsForBind.length || isDeclarationWorking}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleBindDeclaration}
                    disabled={!bindDeclarationId || isDeclarationWorking}
                  >
                    Привязать существующую
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Выберите товар из списка, чтобы просмотреть декларации.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
