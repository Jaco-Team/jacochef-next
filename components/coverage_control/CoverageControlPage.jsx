"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
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
import Grid from "@mui/material/Grid";

import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import { useConfirm } from "@/src/hooks/useConfirm";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MySelect, MyTextInput } from "@/ui/Forms";
import ExcelIcon from "@/ui/ExcelIcon";

import {
  METHODS,
  MODULE,
  buildMaterialSavePayload,
  buildSupplierSavePayload,
  getErrorText,
  isSuccess,
  unwrapPayload,
} from "./apiMethods";
import { FILTER_FLAGS, getStatusColor, getStatusLabel } from "./status";
import {
  emptyMaterialForm,
  emptySupplierForm,
  formatNumber,
  formatValue,
  matchesFilters,
  supplierNames,
} from "./utils";
import MaterialFormModal from "./MaterialFormModal";
import MaterialCardModal from "./MaterialCardModal";
import SupplierCardModal from "./SupplierCardModal";

const defaultFilters = {
  search: "",
  category_id: "",
  supplier_id: "",
  critical: false,
  no_supplier_stock: false,
  no_usage: false,
  stale_stock: false,
  undistributed: false,
  active_only: true,
};

export default function CoverageControlPage() {
  const { api_laravel } = useApi(MODULE);
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const { withConfirm, ConfirmDialog } = useConfirm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moduleName, setModuleName] = useState("Закупки: контроль остатков и потребности");
  const [access, setAccess] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliersDict, setSuppliersDict] = useState([]);
  const [units, setUnits] = useState([]);
  const [calcTypes, setCalcTypes] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [materialFormInitial, setMaterialFormInitial] = useState(null);

  const [materialCard, setMaterialCard] = useState({
    open: false,
    loading: false,
    material: null,
  });

  const [supplierCard, setSupplierCard] = useState({
    open: false,
    loading: false,
    material: null,
    initial: null,
  });

  const canAccess = useCallback(
    (key) => {
      if (!access) return false;
      const { userCan } = handleUserAccess(access);
      return userCan("access", key);
    },
    [access],
  );

  const canEdit = canAccess("edit");
  const canDelete = canAccess("delete");
  const canExport = canAccess("export_excel");
  const canRequestStock = canAccess("request_stock");

  const ensureAccess = useCallback(
    (allowed, message = "Недостаточно прав") => {
      if (allowed) return true;
      showAlert(message);
      return false;
    },
    [showAlert],
  );

  const callApi = useCallback(
    async (method, data = {}, options = {}) => {
      const res = await api_laravel(method, data, options);
      if (options.responseType === "blob") return res;
      if (!isSuccess(res)) {
        throw new Error(getErrorText(res));
      }
      return res;
    },
    [api_laravel],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filterPayload = {
        category_id: filters.category_id || undefined,
        supplier_id: filters.supplier_id || undefined,
        critical: filters.critical || undefined,
        no_supplier_stock: filters.no_supplier_stock || undefined,
        no_usage: filters.no_usage || undefined,
        stale_stock: filters.stale_stock || undefined,
        undistributed: filters.undistributed || undefined,
        active_only: filters.active_only || undefined,
        search: filters.search?.trim() || undefined,
      };

      const res = await callApi(METHODS.GET_ALL, filterPayload);
      const payload = unwrapPayload(res);
      const nextName = payload.module_info?.name || res.module_info?.name || moduleName;

      setModuleName(nextName);
      document.title = nextName;
      setAccess(payload.acces || payload.access || res.acces || res.access || null);
      setItems(
        Array.isArray(payload.items) ? payload.items : Array.isArray(res.items) ? res.items : [],
      );
      setCategories(
        Array.isArray(payload.categories)
          ? payload.categories
          : Array.isArray(res.categories)
            ? res.categories
            : [],
      );
      setSuppliersDict(
        Array.isArray(payload.suppliers)
          ? payload.suppliers
          : Array.isArray(res.suppliers)
            ? res.suppliers
            : [],
      );
      setUnits(
        Array.isArray(payload.units) ? payload.units : Array.isArray(res.units) ? res.units : [],
      );
      setCalcTypes(
        Array.isArray(payload.calc_types)
          ? payload.calc_types
          : Array.isArray(res.calc_types)
            ? res.calc_types
            : [],
      );
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [callApi, filters, moduleName, showAlert]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilters(item, filters)),
    [items, filters],
  );

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateMaterial = () => {
    if (!ensureAccess(canEdit)) return;
    setMaterialFormInitial(emptyMaterialForm());
    setMaterialFormOpen(true);
  };

  const openEditMaterial = (material) => {
    if (!ensureAccess(canEdit)) return;
    setMaterialFormInitial({
      id: material.id,
      name: material.name || "",
      category_id: material.category_id ?? "",
      unit_id: material.unit_id ?? "",
      calc_type: material.calc_type ?? "",
      packaging: material.packaging ?? "",
      comment: material.comment ?? "",
      is_active: material.is_active !== false,
    });
    setMaterialFormOpen(true);
  };

  const closeMaterialForm = () => {
    setMaterialFormOpen(false);
    setMaterialFormInitial(null);
  };

  const loadMaterialCard = async (id) => {
    setMaterialCard((prev) => ({ ...prev, open: true, loading: true }));
    try {
      const res = await callApi(METHODS.GET_MATERIAL, { id });
      const payload = unwrapPayload(res);
      const material = payload.material || payload;
      setMaterialCard({
        open: true,
        loading: false,
        material: {
          ...material,
          suppliers: Array.isArray(payload.suppliers)
            ? payload.suppliers
            : Array.isArray(material.suppliers)
              ? material.suppliers
              : [],
          history: Array.isArray(payload.history)
            ? payload.history
            : Array.isArray(material.history)
              ? material.history
              : [],
        },
      });
    } catch (error) {
      setMaterialCard({ open: false, loading: false, material: null });
      showAlert(error?.message || "Ошибка загрузки позиции");
    }
  };

  const closeMaterialCard = () => {
    setMaterialCard({ open: false, loading: false, material: null });
  };

  const saveMaterial = async (form) => {
    if (!ensureAccess(canEdit)) return;
    setSaving(true);
    try {
      const res = await callApi(METHODS.SAVE_MATERIAL, buildMaterialSavePayload(form));
      const payload = unwrapPayload(res);
      showAlert(getErrorText(res, "Сохранено"), true);
      closeMaterialForm();
      await loadAll();
      const id = payload.id || form.id || payload.material?.id;
      if (id) await loadMaterialCard(id);
    } catch (error) {
      showAlert(error?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const toggleMaterialActive = async (material) => {
    if (!ensureAccess(canEdit)) return;
    setLoading(true);
    try {
      await callApi(METHODS.SET_MATERIAL_ACTIVE, {
        id: material.id,
        is_active: material.is_active === false,
      });
      showAlert("Статус позиции обновлён", true);
      await loadAll();
      await loadMaterialCard(material.id);
    } catch (error) {
      showAlert(error?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (material) => {
    if (!ensureAccess(canDelete)) return;
    setLoading(true);
    try {
      await callApi(METHODS.DELETE_MATERIAL, { id: material.id });
      showAlert("Позиция удалена", true);
      closeMaterialCard();
      await loadAll();
    } catch (error) {
      showAlert(error?.message || "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  const openAddSupplier = (material) => {
    if (!ensureAccess(canEdit)) return;
    setSupplierCard({
      open: true,
      loading: false,
      material,
      initial: emptySupplierForm(material?.id),
    });
  };

  const openSupplier = (material, row) => {
    setSupplierCard({
      open: true,
      loading: false,
      material,
      initial: { ...emptySupplierForm(material?.id), ...row },
    });
  };

  const closeSupplierCard = () => {
    setSupplierCard({ open: false, loading: false, material: null, initial: null });
  };

  const saveSupplier = async (form) => {
    if (!ensureAccess(canEdit)) return;
    setSaving(true);
    try {
      await callApi(METHODS.SAVE_SUPPLIER, buildSupplierSavePayload(form));
      showAlert("Распределение сохранено", true);
      closeSupplierCard();
      await loadAll();
      if (form.material_id) await loadMaterialCard(form.material_id);
    } catch (error) {
      showAlert(error?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const deleteSupplier = async (form) => {
    if (!ensureAccess(canDelete)) return;
    setLoading(true);
    try {
      await callApi(METHODS.DELETE_SUPPLIER, {
        id: form.id,
        material_id: form.material_id,
      });
      showAlert("Поставщик удалён", true);
      closeSupplierCard();
      await loadAll();
      if (form.material_id) await loadMaterialCard(form.material_id);
    } catch (error) {
      showAlert(error?.message || "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  const requestStock = async (form) => {
    if (!ensureAccess(canRequestStock)) return;
    setLoading(true);
    try {
      await callApi(METHODS.REQUEST_STOCK, {
        supplier_link_id: form.id,
        material_id: form.material_id,
        supplier_id: form.supplier_id,
      });
      showAlert("Запрос остатков отправлен", true);
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса остатков");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!ensureAccess(canExport)) return;
    setLoading(true);
    try {
      const res = await callApi(METHODS.EXPORT_EXCEL, {}, { responseType: "blob" });
      if (!res) throw new Error("Ошибка экспорта");
      const blob = new Blob([res], { type: res?.type || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `coverage_control_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert(error?.message || "Ошибка экспорта");
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplier = suppliersDict.find((s) => String(s.id) === String(filters.supplier_id));

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={loading || saving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <ConfirmDialog />

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <MaterialFormModal
        open={materialFormOpen}
        onClose={closeMaterialForm}
        onSave={saveMaterial}
        initial={materialFormInitial}
        categories={categories}
        units={units}
        calcTypes={calcTypes}
        canEdit={canEdit}
        saving={saving}
      />

      <MaterialCardModal
        open={materialCard.open}
        onClose={closeMaterialCard}
        loading={materialCard.loading}
        material={materialCard.material}
        canEdit={canEdit}
        canDelete={canDelete}
        onEditMaterial={openEditMaterial}
        onAddSupplier={openAddSupplier}
        onOpenSupplier={openSupplier}
        onToggleActive={withConfirm(
          (material) => toggleMaterialActive(material),
          materialCard.material?.is_active === false
            ? "Включить сырьевую позицию?"
            : "Отключить сырьевую позицию без удаления?",
        )}
        onDelete={withConfirm(
          (material) => deleteMaterial(material),
          "Удалить сырьевую позицию? Действие необратимо.",
        )}
      />

      <SupplierCardModal
        open={supplierCard.open}
        onClose={closeSupplierCard}
        loading={supplierCard.loading}
        material={supplierCard.material}
        initial={supplierCard.initial}
        suppliersDict={suppliersDict}
        freeNeed={supplierCard.material?.free_need}
        canEdit={canEdit}
        canRequestStock={canRequestStock}
        canDelete={canDelete}
        saving={saving}
        onSave={saveSupplier}
        onRequestStock={requestStock}
        onDelete={withConfirm(
          (form) => deleteSupplier(form),
          "Удалить поставщика из сырьевой позиции?",
        )}
      />

      <Grid
        container
        spacing={3}
        className="container_first_child"
      >
        <Grid size={{ xs: 12, sm: 8 }}>
          <h1>{moduleName}</h1>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Позиции, требующие действия, отображаются в общем списке. Расчётные поля приходят с
            сервера и не редактируются.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent={{ xs: "flex-start", sm: "flex-end" }}
            flexWrap="wrap"
            useFlexGap
          >
            {canExport ? (
              <Tooltip title="Выгрузка в Excel">
                <IconButton
                  onClick={exportExcel}
                  size="large"
                >
                  <ExcelIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            <Button
              variant="outlined"
              onClick={loadAll}
            >
              Обновить
            </Button>
            {canEdit ? (
              <Button
                variant="contained"
                onClick={openCreateMaterial}
              >
                Добавить сырьё
              </Button>
            ) : null}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <MyTextInput
            label="Поиск"
            value={filters.search}
            func={(e) => setFilter("search", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MySelect
            label="Категория"
            data={categories}
            value={filters.category_id || ""}
            is_none={true}
            func={(e) => setFilter("category_id", e.target.value === "none" ? "" : e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MyAutocomplite
            label="Поставщик"
            data={suppliersDict}
            value={selectedSupplier || null}
            multiple={false}
            func={(event, value) => setFilter("supplier_id", value?.id ?? "")}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            {FILTER_FLAGS.map((flag) => (
              <FormControlLabel
                key={flag.key}
                control={
                  <Checkbox
                    checked={Boolean(filters[flag.key])}
                    onChange={(e) => setFilter(flag.key, e.target.checked)}
                    size="small"
                  />
                }
                label={flag.label}
              />
            ))}
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(filters.active_only)}
                  onChange={(e) => setFilter("active_only", e.target.checked)}
                  size="small"
                />
              }
              label="Только активные"
            />
            <Button
              size="small"
              onClick={loadAll}
            >
              Применить на сервере
            </Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined">
            <TableContainer>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Статус</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Сырьё</TableCell>
                    <TableCell>Общая потребность</TableCell>
                    <TableCell>Свободная</TableCell>
                    <TableCell>Распределено</TableCell>
                    <TableCell>Осталось</TableCell>
                    <TableCell>Поставщики</TableCell>
                    <TableCell>Обновление остатков</TableCell>
                    <TableCell>Комментарий</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length ? (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => loadMaterialCard(item.id)}
                      >
                        <TableCell>
                          <Chip
                            size="small"
                            color={getStatusColor(item.status)}
                            label={getStatusLabel(item.status)}
                          />
                        </TableCell>
                        <TableCell>{formatValue(item.category_name)}</TableCell>
                        <TableCell>{formatValue(item.name)}</TableCell>
                        <TableCell>{formatNumber(item.total_need)}</TableCell>
                        <TableCell>{formatNumber(item.free_need)}</TableCell>
                        <TableCell>{formatNumber(item.allocated)}</TableCell>
                        <TableCell>{formatNumber(item.remaining)}</TableCell>
                        <TableCell>{supplierNames(item)}</TableCell>
                        <TableCell>{formatValue(item.last_stock_update)}</TableCell>
                        <TableCell>{formatValue(item.comment)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        align="center"
                      >
                        <Box sx={{ py: 4 }}>
                          <Typography
                            variant="body1"
                            gutterBottom
                          >
                            Нет данных для отображения
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Список загружается с сервера. Добавьте сырьевую позицию или измените
                            фильтры.
                          </Typography>
                          {canEdit ? (
                            <Button
                              variant="contained"
                              onClick={openCreateMaterial}
                            >
                              Добавить сырьё
                            </Button>
                          ) : null}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
