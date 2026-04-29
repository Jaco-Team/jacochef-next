import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Box,
  Paper,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  Zoom,
} from "@mui/material";
import React, { useState } from "react";
import { CreateSegmentModal } from "@/components/crm/CreateSegmentModal";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { EditSegmentModal } from "@/components/crm/EditSegmentModal";
import EditIcon from "@mui/icons-material/Edit";
import useMyAlert from "@/src/hooks/useMyAlert";

// Маппинг полей на человекочитаемые названия (русские)
const fieldLabels = {
  gender: "Пол",
  birth_date_start: "Дата рождения (от)",
  birth_date_end: "Дата рождения (до)",
  days_before_birthday: "Дней до ДР",
  has_email: "Email",
  consent_email: "Согласие на email",
  consent_sms: "Согласие на SMS",
  consent_push: "Согласие на Push",
  orders_count_min: "Заказов (мин)",
  orders_count_max: "Заказов (макс)",
  avg_check_min: "Средний чек (мин)",
  avg_check_max: "Средний чек (макс)",
  total_sum_min: "Сумма покупок (мин)",
  total_sum_max: "Сумма покупок (макс)",
  last_order_date_start: "Последний заказ (от)",
  last_order_date_end: "Последний заказ (до)",
  days_from_last: "Дней с последнего заказа",
  days_from_first: "Дней с первого заказа",
  period_days: "Период активности",
  categories: "Категории",
  promo: "Промокод",
  order_types: "Типы заказов",
  cities: "Города",
  points: "Точки продаж",
  sources: "Источники",
  utm_source: "UTM Source",
  utm_medium: "UTM Medium",
  utm_campaign: "UTM Campaign",
  utm_term: "UTM Term",
  utm_content: "UTM Content",
};

// Функция форматирования значений
const formatValue = (key, value) => {
  if (value === null || value === undefined) return null;

  // Булевы значения
  if (["has_email", "consent_email", "consent_sms", "consent_push"].includes(key)) {
    return value === 1 ? "Да" : "Нет";
  }

  // Массивы (хранятся как строки с запятыми)
  if (["categories", "order_types", "cities", "points", "sources"].includes(key)) {
    const items = String(value).split(",");
    return items.map((i) => i.trim()).join(", ");
  }

  return value;
};

// Компонент карточки сегмента
const SegmentCard = ({ segment, onShowAll, openEdit, edittingSegment, canAccess }) => {
  const theme = useTheme();

  // Собираем все активные фильтры
  const activeFilters = Object.entries(segment)
    .filter(([key, value]) => {
      // Исключаем служебные поля
      if (["id", "segment_name", "segment_value", "date_create"].includes(key)) return false;
      return value !== null && value !== undefined && value !== "";
    })
    .map(([key, value]) => ({
      label: fieldLabels[key] || key,
      value: formatValue(key, value),
      key: key,
    }));

  return (
    <Zoom
      in={true}
      style={{ transitionDelay: "100ms" }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          minWidth: "350px",
          flexDirection: "column",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
          },
          cursor: "pointer",
        }}
      >
        <CardHeader
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
          title={
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{segment.segment_name}</span>
                {canAccess("edit_segment") ? (
                  <IconButton
                    onClick={() => {
                      openEdit(true);
                      edittingSegment(segment);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                ) : null}
              </div>
            </Typography>
          }
          subheader={
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <PeopleAltIcon sx={{ color: theme.palette.primary.main, fontSize: "1.5rem" }} />
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
                >
                  {segment.segment_value}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Обновлено: {new Date(segment.date_create).toLocaleDateString("ru-RU")}
              </Typography>
            </Box>
          }
        />
      </Card>
    </Zoom>
  );
};

// Модальное окно для всех параметров
const FiltersModal = ({ open, onClose, segment, filters }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Zoom}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Все параметры сегмента</Typography>
          <IconButton
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{ mt: 1 }}
        >
          {segment?.segment_name}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filters?.map((filter, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
              >
                {filter.label}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
              >
                {filter.value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Основной компонент SegmentTab
export const SegmentTab = ({
  categories = [],
  points = [],
  canAccess,
  cities = [],
  saveSegment,
  updateSegment,
  handleDelete,
  segments = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [hiddenFilters, setHiddenFilters] = useState([]);
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);

  const handleUpdateSegment = (updatedData) => {
    updateSegment(updatedData);
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setEditModalOpen(true);
  };

  const handleCreateSegment = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleShowAllFilters = (segment, filters) => {
    setCurrentSegment(segment);
    setHiddenFilters(filters);
    setFiltersModalOpen(true);
  };

  const handleCloseFiltersModal = () => {
    setFiltersModalOpen(false);
    setCurrentSegment(null);
    setHiddenFilters([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <EditSegmentModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSegment(null);
        }}
        handleDelete={handleDelete}
        categories={categories}
        points={points}
        cities={cities}
        updateSegment={handleUpdateSegment}
        segmentData={editingSegment}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          Сегменты клиентов
        </Typography>
        {canAccess("create_segment") ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSegment}
            sx={{
              textTransform: "none",
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            + Создать сегмент
          </Button>
        ) : null}
      </Box>

      {segments.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <FilterListIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography
            variant="h6"
            color="textSecondary"
            gutterBottom
          >
            Нет созданных сегментов
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            Нажмите "Создать сегмент", чтобы начать сегментировать клиентов
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCreateSegment}
          >
            Создать первый сегмент
          </Button>
        </Paper>
      ) : (
        <Grid
          container
          spacing={3}
        >
          {segments.map((segment) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={`${segment.id}-${segment.date_create}`}
            >
              <SegmentCard
                openEdit={setEditModalOpen}
                segment={segment}
                canAccess={canAccess}
                edittingSegment={setEditingSegment}
                onShowAll={handleShowAllFilters}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateSegmentModal
        open={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        points={points}
        saveSegment={saveSegment}
        cities={cities}
      />

      <FiltersModal
        open={filtersModalOpen}
        onClose={handleCloseFiltersModal}
        segment={currentSegment}
        filters={hiddenFilters}
      />
    </Box>
  );
};
