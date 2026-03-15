"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    availableDeclarationsForBind,
    bindDeclarationId,
    setBindDeclarationId,
    handleBindDeclaration,
    handleUploadDeclaration,
    handleUnbindDeclaration,
    handleDeleteDeclaration,
    isDeclarationWorking,
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
              disabled={isItemsSaving || !selectOptions.length}
            />
            <Button
              variant="contained"
              onClick={handleAddVendorItem}
              disabled={
                isItemsSaving ||
                !selectedCatalogItemId ||
                vendorItemIds.has(Number(selectedCatalogItemId))
              }
            >
              Добавить
            </Button>
          </Stack>
          {!selectOptions.length ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Нет доступных товаров для добавления. Проверьте ответ `get_vendor_items`: поле
              `all_items` должно содержать доступный каталог товаров.
            </Typography>
          ) : null}
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
                const isExpanded = Number(item.item_id) === Number(selectedItemId);

                return (
                  <Accordion
                    key={item.id ?? item.item_id}
                    expanded={isExpanded}
                    onChange={(_, expanded) =>
                      setSelectedItemId(expanded ? Number(item.item_id) : null)
                    }
                    disableGutters
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: 1,
                      borderColor: isExpanded ? "primary.main" : "divider",
                      overflow: "hidden",
                      "&::before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 2,
                        py: 1,
                        "& .MuiAccordionSummary-content": {
                          my: 0,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ width: "100%" }}
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
                        </Stack>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                        >
                          <Chip
                            label={formatVendorNds(item.nds)}
                            size="small"
                          />
                          <Chip
                            label={item.cat_name || "Категория не указана"}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {(item.declarations || []).length ? (
                          <Stack spacing={1}>
                            {item.declarations.map((decl) => (
                              <Stack
                                key={decl.id}
                                direction={{ xs: "column", sm: "row" }}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                justifyContent="space-between"
                                spacing={1.5}
                                sx={{ borderRadius: 1, p: 1.5, bgcolor: "action.hover" }}
                              >
                                <Stack spacing={0.5}>
                                  <Typography variant="body2">
                                    {getDeclarationLabel(decl)}
                                  </Typography>
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
                                  flexWrap="wrap"
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Для этого товара пока нет деклараций.
                          </Typography>
                        )}

                        <Button
                          variant="text"
                          color="error"
                          onClick={() => handleRemoveVendorItem(item.item_id)}
                          disabled={isItemsSaving}
                          sx={{ alignSelf: "flex-start", px: 0 }}
                        >
                          Удалить товар у поставщика
                        </Button>

                        {availableDeclarationsForBind.length ? (
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", md: "center" }}
                          >
                            <MySelect
                              label="Привязать существующую декларацию"
                              data={availableDeclarationsForBind.map((decl) => ({
                                id: String(decl.id),
                                name: `${getDeclarationLabel(decl)}${
                                  decl.item_name ? ` · ${decl.item_name}` : ""
                                }`,
                              }))}
                              value={isExpanded ? bindDeclarationId : ""}
                              func={(event) => setBindDeclarationId(event.target.value)}
                              disabled={isDeclarationWorking}
                            />
                            <Button
                              variant="outlined"
                              onClick={handleBindDeclaration}
                              disabled={isDeclarationWorking || !isExpanded || !bindDeclarationId}
                            >
                              Привязать
                            </Button>
                          </Stack>
                        ) : null}

                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<UploadFileOutlinedIcon />}
                          disabled={isDeclarationWorking}
                          sx={{ alignSelf: "flex-start" }}
                        >
                          Загрузить декларацию
                          <input
                            hidden
                            type="file"
                            accept="application/pdf"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) {
                                handleUploadDeclaration(item.item_id, file);
                              }
                            }}
                          />
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
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
        </CardContent>
      </Card>
    </Stack>
  );
}
