"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import TabPanel from "@/ui/TabPanel/TabPanel";
import a11yProps from "@/ui/TabPanel/a11yProps";
import { MySelect } from "@/ui/Forms";
import TabInfo from "./tabs/TabInfo";
import TabLocations from "./tabs/TabLocations";
import TabProducts from "./tabs/TabProducts";
import TabDocuments from "./tabs/TabDocuments";
import { VendorDetailsProvider } from "./VendorDetailsContext";
import VendorEditorForm from "./VendorEditorForm";
import useVendorsStore from "./useVendorsStore";
import {
  buildMailsPayload,
  buildVendorCitiesPayload,
  buildVendorPayload,
  formatMoney,
  normalizeCities,
  normalizeMails,
  normalizeVendor,
} from "./vendorFormUtils";

const TAB_DEFINITIONS = [
  { index: 0, key: "overview", label: "Обзор", icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { index: 1, key: "locations", label: "Локации", icon: <PlaceOutlinedIcon fontSize="small" /> },
  {
    index: 2,
    key: "products",
    label: "Продукты",
    icon: <Inventory2OutlinedIcon fontSize="small" />,
  },
  {
    index: 3,
    key: "documents",
    label: "Документы",
    icon: <StorefrontOutlinedIcon fontSize="small" />,
  },
];

export default function VendorDetailPage() {
  const router = useRouter();
  const vendorId = Number(router.query.id);
  const { api_laravel, api_upload } = useApi("vendors");
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();
  const isLoading = useVendorsStore((state) => state.isLoading);
  const setLoading = useVendorsStore((state) => state.setLoading);

  const [activeTab, setActiveTab] = useState(0);
  const [vendor, setVendor] = useState(null);
  const [vendorCities, setVendorCities] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [mails, setMails] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [vendorItems, setVendorItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [bindDeclarationId, setBindDeclarationId] = useState("");
  const [isDeclarationWorking, setIsDeclarationWorking] = useState(false);
  const [documentsFilter, setDocumentsFilter] = useState("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalItemId, setDocModalItemId] = useState("");
  const [docModalFile, setDocModalFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isItemsSaving, setIsItemsSaving] = useState(false);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");

  const loadVendor = async () => {
    if (!vendorId) {
      return;
    }

    try {
      setLoading(true);
      const [infoResponse, productsResponse] = await Promise.all([
        api_laravel("get_vendor_info", { vendor_id: vendorId }),
        api_laravel("get_vendor_items", { vendor_id: vendorId }),
      ]);

      if (!infoResponse?.st) {
        throw new Error(infoResponse?.text || "Не удалось загрузить поставщика");
      }

      if (!productsResponse?.st) {
        throw new Error(productsResponse?.text || "Не удалось загрузить товары поставщика");
      }

      setVendor(normalizeVendor(infoResponse.vendor));
      setVendorCities(normalizeCities(infoResponse.vendor_cities));
      setAllCities(normalizeCities(infoResponse.all_cities));
      setMails(normalizeMails(infoResponse.mails, infoResponse.all_points || []));
      setAllPoints(infoResponse.all_points || []);
      setVendorItems(productsResponse.vendor_items || []);
      setAllItems(productsResponse.all_items || []);
      document.title = infoResponse.vendor?.name || "Поставщик";
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  useEffect(() => {
    if (!vendorItems?.length) {
      setDocModalItemId("");
      return;
    }

    const exists = vendorItems.some((item) => String(item.item_id) === String(docModalItemId));

    if (!exists) {
      setDocModalItemId(String(vendorItems[0].item_id));
    }
  }, [vendorItems, docModalItemId]);

  useEffect(() => {
    if (!vendorItems?.length) {
      setSelectedItemId(null);
      return;
    }

    const hasSelected =
      selectedItemId != null &&
      vendorItems.some((item) => Number(item.item_id) === Number(selectedItemId));

    if (!hasSelected) {
      setSelectedItemId(Number(vendorItems[0].item_id));
    }
  }, [vendorItems, selectedItemId]);

  useEffect(() => {
    setBindDeclarationId("");
  }, [selectedItemId]);

  const applyDeclarationUpdates = (entries = []) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return;
    }

    const updates = new Map();
    entries.forEach((entry) => {
      if (!entry?.item_id) {
        return;
      }
      const itemId = Number(entry.item_id);
      const declarations = Array.isArray(entry.declarations) ? entry.declarations : [];
      updates.set(itemId, declarations);
    });

    if (!updates.size) {
      return;
    }

    setVendorItems((prev) =>
      prev.map((vendorItem) => {
        const itemId = Number(vendorItem.item_id);
        if (updates.has(itemId)) {
          return { ...vendorItem, declarations: updates.get(itemId) };
        }
        return vendorItem;
      }),
    );

    setAllItems((prev) =>
      prev.map((catalogItem) => {
        const itemId = Number(catalogItem.id);
        if (updates.has(itemId)) {
          return { ...catalogItem, declarations: updates.get(itemId) };
        }
        return catalogItem;
      }),
    );
  };

  const handleDeclarationResponse = (response) => {
    if (!response) {
      return;
    }

    if (Array.isArray(response.item_declarations)) {
      applyDeclarationUpdates(response.item_declarations);
      return;
    }

    if (response.item_id) {
      applyDeclarationUpdates([
        { item_id: response.item_id, declarations: response.declarations || [] },
      ]);
    }
  };

  const handleUploadDeclaration = async (itemId, file) => {
    if (!itemId || !file) {
      return;
    }

    setIsDeclarationWorking(true);

    try {
      const response = await api_upload("upload_declaration", file, {
        item_id: Number(itemId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось загрузить декларацию");
      }

      handleDeclarationResponse(response);
      showAlert("Декларация загружена", true);
      return response;
    } catch (error) {
      showAlert(error?.message || "Не удалось загрузить декларацию", false);
    } finally {
      setIsDeclarationWorking(false);
    }

    return null;
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setDocModalFile(null);
  };

  const handleDocumentModalSubmit = async () => {
    if (!docModalItemId || !docModalFile) {
      showAlert("Выберите товар и файл", false);
      return;
    }

    const response = await handleUploadDeclaration(docModalItemId, docModalFile);
    if (response?.st) {
      closeDocModal();
    }
  };

  const openDocModal = () => {
    setDocModalFile(null);
    setIsDocModalOpen(true);
  };

  const handleBindDeclaration = async () => {
    if (!selectedItemId || !bindDeclarationId) {
      return;
    }

    setIsDeclarationWorking(true);

    try {
      const response = await api_laravel("bind_declaration_to_item", {
        item_id: Number(selectedItemId),
        decl_id: Number(bindDeclarationId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось привязать декларацию");
      }

      handleDeclarationResponse(response);
      showAlert("Декларация привязана", true);
      setBindDeclarationId("");
    } catch (error) {
      showAlert(error?.message || "Не удалось привязать декларацию", false);
    } finally {
      setIsDeclarationWorking(false);
    }
  };

  const handleUnbindDeclaration = async (declId) => {
    if (!selectedItemId || !declId) {
      return;
    }

    setIsDeclarationWorking(true);

    try {
      const response = await api_laravel("unbind_declaration_from_item", {
        item_id: Number(selectedItemId),
        decl_id: Number(declId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось отвязать декларацию");
      }

      handleDeclarationResponse(response);
      showAlert("Декларация отвязана", true);
    } catch (error) {
      showAlert(error?.message || "Не удалось отвязать декларацию", false);
    } finally {
      setIsDeclarationWorking(false);
    }
  };

  const handleDeleteDeclaration = async (declId) => {
    if (!declId) {
      return;
    }

    setIsDeclarationWorking(true);

    try {
      const response = await api_laravel("delete_declaration", {
        decl_id: Number(declId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось удалить декларацию");
      }

      handleDeclarationResponse(response);
      showAlert("Декларация удалена", true);
    } catch (error) {
      showAlert(error?.message || "Не удалось удалить декларацию", false);
    } finally {
      setIsDeclarationWorking(false);
    }
  };

  const toggleCity = (city) => {
    if (!city?.id) {
      return;
    }

    const cityId = Number(city.id);
    setVendorCities((prev) => {
      const exists = prev.some((entry) => Number(entry.id) === cityId);
      if (exists) {
        return prev.filter((entry) => Number(entry.id) !== cityId);
      }
      return [...prev, city];
    });
  };

  const commitVendorItems = async (nextItems) => {
    if (!vendorId) {
      return;
    }

    setIsItemsSaving(true);

    try {
      const payload = nextItems.map((item, index) => ({
        item_id: Number(item.item_id),
        nds: Number(item.nds ?? -1),
        sort: Number(item.sort ?? index * 10),
      }));

      const response = await api_laravel("save_vendor_items", {
        vendor_id: vendorId,
        items: payload,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось сохранить товары");
      }

      await loadVendor();
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
    } finally {
      setIsItemsSaving(false);
    }
  };

  const handleAddVendorItem = async () => {
    if (!selectedCatalogItemId) {
      return;
    }

    const newItemId = Number(selectedCatalogItemId);
    if (vendorItemIds.has(newItemId)) {
      return;
    }

    const maxSort = vendorItems.reduce((max, item) => Math.max(max, Number(item.sort) || 0), 0);

    const nextItems = [...vendorItems, { item_id: newItemId, nds: -1, sort: maxSort + 1 }];

    await commitVendorItems(nextItems);
    setSelectedCatalogItemId("");
  };

  const handleRemoveVendorItem = async (itemId) => {
    if (!itemId) {
      return;
    }

    const nextItems = vendorItems.filter((item) => Number(item.item_id) !== Number(itemId));

    await commitVendorItems(nextItems);

    if (Number(selectedItemId) === Number(itemId)) {
      setSelectedItemId(null);
    }
  };

  const handleVendorSubmit = async () => {
    try {
      setIsSaving(true);

      const response = await api_laravel("update_vendor", {
        vendor: buildVendorPayload(vendor, "update"),
        vendor_cities: buildVendorCitiesPayload(vendorCities),
        mails: buildMailsPayload(mails),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось сохранить поставщика");
      }

      setIsEditing(false);
      await loadVendor();
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
    } finally {
      setIsSaving(false);
    }
  };

  const sortedVendorItems = [...(vendorItems || [])].sort(
    (a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0),
  );

  const vendorItemIds = new Set((vendorItems || []).map((item) => Number(item.item_id)));

  const selectedVendorItem = sortedVendorItems.find(
    (item) => Number(item.item_id) === Number(selectedItemId),
  );

  const selectedCatalogItem = (allItems || []).find(
    (item) => Number(item.id) === Number(selectedItemId),
  );

  const itemsSelectData = (allItems || []).map((item) => ({
    id: String(item.id),
    name: item.name || `Товар #${item.id}`,
  }));

  const availableDeclarations = (() => {
    const map = new Map();
    (allItems || []).forEach((item) => {
      (item.declarations || []).forEach((decl) => {
        if (!decl?.id) {
          return;
        }
        const key = Number(decl.id);
        if (map.has(key)) {
          return;
        }
        map.set(key, {
          ...decl,
          item_id: item.id,
          item_name: item.name || "",
        });
      });
    });
    return Array.from(map.values());
  })();

  const availableDeclarationsForBind = (() => {
    const boundIds = new Set(
      (selectedVendorItem?.declarations || []).map((decl) => Number(decl.id)),
    );
    return availableDeclarations.filter((decl) => !boundIds.has(Number(decl.id)));
  })();

  const vendorDeclarations = (vendorItems || []).flatMap((item) =>
    (item.declarations || []).map((decl) => ({
      ...decl,
      item_id: Number(item.item_id),
      item_name: item.item_name || `Товар #${item.item_id}`,
      nds: item.nds,
    })),
  );

  const normalizedDocumentsFilter = (documentsFilter || "").trim().toLowerCase();
  const filteredVendorDeclarations = !normalizedDocumentsFilter
    ? vendorDeclarations
    : vendorDeclarations.filter((decl) => {
        const fileName = (decl.filename || decl.url || "").toLowerCase();
        const itemName = (decl.item_name || "").toLowerCase();
        return (
          fileName.includes(normalizedDocumentsFilter) ||
          itemName.includes(normalizedDocumentsFilter)
        );
      });

  const vendorItemsOptions = (vendorItems || []).map((item) => ({
    id: String(item.item_id),
    name: item.item_name || `Товар #${item.item_id}`,
  }));

  const overviewCards = vendor
    ? [
        {
          title: "Основное",
          rows: [
            { label: "Наименование", value: vendor.name },
            { label: "Описание", value: vendor.text },
          ],
        },
        {
          title: "Настройки",
          rows: [
            { label: "Мин. сумма заказа", value: formatMoney(vendor.min_price) },
            { label: "Активность", value: Number(vendor.is_show) ? "Да" : "Нет" },
            { label: "Работа по счетам", value: Number(vendor.bill_ex) ? "Да" : "Нет" },
            {
              label: "Необходима картинка накладной",
              value: Number(vendor.need_img_bill_ex) ? "Да" : "Нет",
            },
            { label: "Приоритетный поставщик", value: Number(vendor.is_priority) ? "Да" : "Нет" },
          ],
        },
        {
          title: "Реквизиты",
          rows: [
            { label: "ИНН", value: vendor.inn },
            { label: "ОГРН", value: vendor.ogrn },
            { label: "Расчетный счет", value: vendor.rc },
            { label: "БИК", value: vendor.bik },
            { label: "Юридический адрес", value: vendor.addr },
          ],
        },
      ]
    : [];

  const activeTabDefinition =
    TAB_DEFINITIONS.find((tab) => tab.index === activeTab) ?? TAB_DEFINITIONS[0];

  const contextValue = {
    overviewCards,
    vendorCities,
    allCities,
    mails,
    sortedVendorItems,
    vendorItemIds,
    selectedItemId,
    setSelectedItemId,
    selectedVendorItem,
    selectedCatalogItem,
    allItems,
    itemsSelectData,
    selectedCatalogItemId,
    setSelectedCatalogItemId,
    isEditing,
    isItemsSaving,
    toggleCity,
    handleAddVendorItem,
    handleRemoveVendorItem,
    availableDeclarationsForBind,
    bindDeclarationId,
    setBindDeclarationId,
    handleBindDeclaration,
    handleUploadDeclaration,
    handleUnbindDeclaration,
    handleDeleteDeclaration,
    isDeclarationWorking,
    filteredVendorDeclarations,
    documentsFilter,
    setDocumentsFilter,
    openDocModal,
    vendorItems,
  };

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />

      <Dialog
        open={isDocModalOpen}
        onClose={closeDocModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Добавить декларацию</DialogTitle>
        <DialogContent>
          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >
            <MySelect
              label="Товар поставщика"
              data={vendorItemsOptions}
              value={docModalItemId}
              func={(event) => setDocModalItemId(event.target.value)}
              is_none={false}
              disabled={isDeclarationWorking || !vendorItems.length}
            />
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Button
                variant="outlined"
                component="label"
                disabled={isDeclarationWorking}
              >
                Выбрать файл
                <input
                  hidden
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    setDocModalFile(file || null);
                  }}
                />
              </Button>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {docModalFile ? docModalFile.name : "Файл не выбран"}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDocModal}
            disabled={isDeclarationWorking}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleDocumentModalSubmit}
            disabled={isDeclarationWorking || !docModalFile || !docModalItemId}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Box className="container_first_child">
        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Card
              variant="outlined"
              sx={{ borderRadius: 0, minHeight: "calc(100vh - 120px)" }}
            >
              <CardContent sx={{ p: 0 }}>
                <Stack spacing={0}>
                  <Button
                    startIcon={<KeyboardBackspaceIcon />}
                    sx={{ justifyContent: "flex-start", p: 2 }}
                    onClick={() => {
                      setLoading(true);
                      router.push("/vendors");
                    }}
                  >
                    Все поставщики
                  </Button>
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800 }}
                    >
                      {vendor?.name || "Поставщик"}
                    </Typography>
                  </Box>
                  <Tabs
                    orientation="vertical"
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    aria-label="Vendor tabs"
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {TAB_DEFINITIONS.map((tab) => (
                      <Tab
                        key={tab.index}
                        icon={tab.icon}
                        iconPosition="start"
                        label={tab.label}
                        {...a11yProps(tab.index)}
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          flexDirection: "row",
                          textTransform: "none",
                          px: 3,
                          py: 1.5,
                          borderRadius: 0,
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          minHeight: 56,
                          minWidth: 180,
                          columnGap: 1,
                          "& .MuiTab-icon": {
                            marginBottom: "0 !important",
                            marginRight: "0 !important",
                          },
                        }}
                      />
                    ))}
                  </Tabs>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Stack
              spacing={3}
              sx={{ pb: { xs: 10, md: 0 } }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ display: { xs: "flex", md: "none" } }}
                  >
                    <Button
                      startIcon={<KeyboardBackspaceIcon />}
                      onClick={() => {
                        setLoading(true);
                        router.push("/vendors");
                      }}
                    >
                      Назад
                    </Button>
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
                    <Typography
                      component="h1"
                      variant="h4"
                      sx={{ fontWeight: 800 }}
                    >
                      {activeTabDefinition.label}
                    </Typography>
                    {activeTab === 0 ? (
                      <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading || !vendor}
                        sx={{ ml: { xs: 0, sm: "auto" } }}
                      >
                        Редактировать
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </Stack>

              {!isLoading && !vendor ? (
                <Alert severity="error">Поставщик не найден или не загрузился.</Alert>
              ) : isEditing ? (
                <VendorEditorForm
                  mode="update"
                  vendor={vendor}
                  vendorCities={vendorCities}
                  allCities={allCities}
                  mails={mails}
                  allPoints={allPoints}
                  isSubmitting={isSaving}
                  onVendorChange={(field, value) =>
                    setVendor((prev) => ({ ...prev, [field]: value }))
                  }
                  onVendorToggle={(field) =>
                    setVendor((prev) => ({ ...prev, [field]: Number(prev[field]) ? 0 : 1 }))
                  }
                  onVendorCitiesChange={setVendorCities}
                  onMailChange={(index, field, value) =>
                    setMails((prev) =>
                      prev.map((mail, mailIndex) =>
                        mailIndex === index ? { ...mail, [field]: value } : mail,
                      ),
                    )
                  }
                  onAddMail={(mail) => setMails((prev) => [...prev, mail])}
                  onRemoveMail={(index) =>
                    setMails((prev) => prev.filter((_, mailIndex) => mailIndex !== index))
                  }
                  onCancel={() => setIsEditing(false)}
                  onSubmit={handleVendorSubmit}
                />
              ) : (
                <VendorDetailsProvider value={contextValue}>
                  <TabPanel
                    value={activeTab}
                    index={0}
                  >
                    <TabInfo />
                  </TabPanel>
                  <TabPanel
                    value={activeTab}
                    index={1}
                  >
                    <TabLocations />
                  </TabPanel>
                  <TabPanel
                    value={activeTab}
                    index={2}
                  >
                    <TabProducts />
                  </TabPanel>
                  <TabPanel
                    value={activeTab}
                    index={3}
                  >
                    <TabDocuments />
                  </TabPanel>
                </VendorDetailsProvider>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            display: { xs: "block", md: "none" },
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
            aria-label="Vendor mobile tabs"
          >
            {TAB_DEFINITIONS.map((tab) => (
              <Tab
                key={tab.index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                {...a11yProps(tab.index)}
                sx={{
                  display: "flex",
                  minHeight: 60,
                  flexDirection: "row",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  columnGap: 0.75,
                  "& .MuiTab-icon": {
                    marginBottom: "0 !important",
                    marginRight: "0 !important",
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
    </>
  );
}
