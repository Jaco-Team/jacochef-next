"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import VendorEditorForm from "./VendorEditorForm";
import {
  buildMailsPayload,
  buildVendorCitiesPayload,
  buildVendorPayload,
  formatMoney,
  normalizeCities,
  normalizeMails,
  normalizeVendor,
} from "./vendorFormUtils";

const TABS = [
  { key: "overview", label: "Обзор", icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { key: "locations", label: "Локации", icon: <PlaceOutlinedIcon fontSize="small" /> },
  { key: "products", label: "Продукты", icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { key: "documents", label: "Документы", icon: <StorefrontOutlinedIcon fontSize="small" /> },
];

function FieldCard({ title, rows }) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, textTransform: "uppercase" }}
          >
            {title}
          </Typography>
          {rows.map((row) => (
            <Box key={row.label}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {row.label}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{row.value || "Не указано"}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PlaceholderCard({ title, text }) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary">{text}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function VendorDetailPage() {
  const router = useRouter();
  const vendorId = Number(router.query.id);
  const { api_laravel } = useApi("vendors");
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorCities, setVendorCities] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [mails, setMails] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [products, setProducts] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const loadVendor = async () => {
    if (!vendorId) {
      return;
    }

    try {
      setIsLoading(true);
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
      setMails(normalizeMails(infoResponse.mails));
      setAllPoints(infoResponse.all_points || []);
      setProducts(productsResponse.vendor_items || []);
      document.title = infoResponse.vendor?.name || "Поставщик";
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  const overviewCards = useMemo(() => {
    if (!vendor) {
      return [];
    }

    return [
      {
        title: "Основное",
        rows: [
          { label: "Наименование", value: vendor.name },
          { label: "Описание", value: vendor.text },
          { label: "Мин. сумма заказа", value: formatMoney(vendor.min_price) },
        ],
      },
      {
        title: "Настройки",
        rows: [
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
    ];
  }, [vendor]);

  const handleSubmit = async () => {
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

  const renderOverview = () => (
    <Stack spacing={2}>
      {overviewCards.map((card) => (
        <FieldCard
          key={card.title}
          title={card.title}
          rows={card.rows}
        />
      ))}
    </Stack>
  );

  const renderLocations = () => (
    <Stack spacing={2}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Локации
            </Typography>
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
            >
              {vendorCities.length ? (
                vendorCities.map((city) => (
                  <Chip
                    key={city.id}
                    label={city.name}
                  />
                ))
              ) : (
                <Typography color="text.secondary">Локации не назначены.</Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Email по точкам
            </Typography>
            {mails.length ? (
              mails.map((mail, index) => (
                <Box key={`${mail.point_id?.id ?? "mail"}-${index}`}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {mail.point_id?.name || "Без точки"}
                  </Typography>
                  <Typography>{mail.mail || "Не указан"}</Typography>
                  {mail.comment ? (
                    <Typography color="text.secondary">{mail.comment}</Typography>
                  ) : null}
                  {index < mails.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">Email по точкам не настроены.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderProducts = () => (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Продукты поставщика
          </Typography>
          {products.length ? (
            products.map((item, index) => (
              <Box key={item.id || `${item.item_id}-${index}`}>
                <Typography sx={{ fontWeight: 600 }}>
                  {item.item_name || `Товар #${item.item_id}`}
                </Typography>
                <Typography color="text.secondary">
                  НДС: {item.nds_text || item.nds || "Не указан"}
                </Typography>
                {index < products.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">
              У поставщика пока нет привязанных товаров.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderDocuments = () => (
    <PlaceholderCard
      title="Документы"
      text="В текущем контракте нет отдельного API для документов поставщика. Экран оставлен как заглушка до появления backend-ручек."
    />
  );

  const renderContent = () => {
    if (isEditing && vendor) {
      return (
        <VendorEditorForm
          mode="update"
          vendor={vendor}
          vendorCities={vendorCities}
          allCities={allCities}
          mails={mails}
          allPoints={allPoints}
          isSubmitting={isSaving}
          onVendorChange={(field, value) => setVendor((prev) => ({ ...prev, [field]: value }))}
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
          onSubmit={handleSubmit}
        />
      );
    }

    switch (activeTab) {
      case "locations":
        return renderLocations();
      case "products":
        return renderProducts();
      case "documents":
        return renderDocuments();
      case "overview":
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={isLoading || isNavigating}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />

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
                      setIsNavigating(true);
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
                  {TABS.map((tab) => (
                    <Button
                      key={tab.key}
                      color={tab.key === activeTab ? "error" : "inherit"}
                      onClick={() => setActiveTab(tab.key)}
                      sx={{
                        justifyContent: "flex-start",
                        px: 3,
                        py: 1.5,
                        borderRadius: 0,
                        bgcolor: tab.key === activeTab ? "rgba(244, 67, 54, 0.08)" : "transparent",
                      }}
                      startIcon={tab.icon}
                    >
                      {tab.label}
                    </Button>
                  ))}
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
                        setIsNavigating(true);
                        router.push("/vendors");
                      }}
                    >
                      Назад
                    </Button>
                  </Stack>
                  <Typography
                    component="h1"
                    variant="h4"
                    sx={{ fontWeight: 800 }}
                  >
                    {activeTab === "overview"
                      ? "Обзор поставщика"
                      : TABS.find((tab) => tab.key === activeTab)?.label}
                  </Typography>
                </Stack>

                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                ) : null}
              </Stack>

              {!isLoading && !vendor ? (
                <Alert severity="error">Поставщик не найден или не загрузился.</Alert>
              ) : (
                renderContent()
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
          <Grid
            container
            columns={4}
          >
            {TABS.map((tab) => (
              <Grid
                key={tab.key}
                size={1}
              >
                <Button
                  color={tab.key === activeTab ? "error" : "inherit"}
                  onClick={() => setActiveTab(tab.key)}
                  sx={{
                    width: "100%",
                    minHeight: 60,
                    borderRadius: 0,
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {tab.icon}
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: tab.key === activeTab ? 700 : 500 }}
                  >
                    {tab.label}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
