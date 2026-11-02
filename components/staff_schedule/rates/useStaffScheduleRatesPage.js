import { useCallback, useEffect, useRef, useState } from "react";
import useStaffScheduleApi from "../useStaffScheduleApi";
import {
  buildRatesSavePayload,
  getDefaultExpandedUnitIds,
  isValidMoneyInput,
} from "./staffScheduleRates.mjs";

const EMPTY_POINT_DATA = {
  positions: [],
  coefficients: { k_rolls: "", k_pizza: "" },
  rate_history: [],
  coef_history: [],
};

function toInputValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

export default function useStaffScheduleRatesPage() {
  const api = useStaffScheduleApi();
  const [points, setPoints] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [point, setPoint] = useState(null);
  const [pointData, setPointData] = useState(EMPTY_POINT_DATA);
  const [positions, setPositions] = useState([]);
  const [coefficients, setCoefficients] = useState(EMPTY_POINT_DATA.coefficients);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [saveDialog, setSaveDialog] = useState({ open: false, dateStart: "", points: [] });
  const [graphFilter, setGraphFilter] = useState("all");
  const [expandedUnitIds, setExpandedUnitIds] = useState([]);
  const requestRef = useRef(0);

  const applyPointData = useCallback((data) => {
    const next = { ...EMPTY_POINT_DATA, ...data };
    setPointData(next);
    const editablePositions = (next.positions ?? []).map((position) => ({
      ...position,
      price: position.price > 0 ? String(position.price) : "",
    }));
    setPositions(editablePositions);
    setExpandedUnitIds(getDefaultExpandedUnitIds(editablePositions));
    setCoefficients({
      k_rolls: toInputValue(next.coefficients?.k_rolls),
      k_pizza: toInputValue(next.coefficients?.k_pizza),
    });
    if (Array.isArray(data?.periods)) setPeriods(data.periods);
    if (typeof data?.can_edit === "boolean") setCanEdit(data.can_edit);
  }, []);

  const loadPoint = useCallback(
    async (nextPoint) => {
      if (!nextPoint?.id) return;
      const requestId = ++requestRef.current;
      setIsLoading(true);
      const response = await api.getRatesPoint({ point_id: nextPoint.id });
      if (requestId !== requestRef.current) return;
      setIsLoading(false);
      if (response?.st === false) {
        setError(response.text || "Не удалось загрузить ставки кафе");
        return;
      }
      setError("");
      applyPointData(response);
    },
    [api, applyPointData],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await api.getRates();
      if (cancelled) return;
      if (response?.st === false) {
        setIsLoading(false);
        setError(response.text || "Нет доступа к ставкам");
        return;
      }
      const name = response?.module_info?.name;
      if (name) document.title = `${name}: ставки`;
      setPoints(response?.points ?? []);
      setPeriods(response?.periods ?? []);
      setCanEdit(Boolean(response?.can_edit));
      const firstPoint = response?.points?.[0] ?? null;
      setPoint(firstPoint);
      if (firstPoint) {
        loadPoint(firstPoint);
      } else {
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, loadPoint]);

  const handlePointChange = useCallback(
    (_, nextPoint) => {
      setPoint(nextPoint);
      loadPoint(nextPoint);
    },
    [loadPoint],
  );

  const handlePriceChange = useCallback((appId, value) => {
    setPositions((current) =>
      current.map((position) =>
        Number(position.app_id) === Number(appId) ? { ...position, price: value } : position,
      ),
    );
  }, []);

  const toggleUnit = useCallback((unitId) => {
    setExpandedUnitIds((current) =>
      current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId],
    );
  }, []);

  const handleCoefficientChange = useCallback((key, value) => {
    setCoefficients((current) => ({ ...current, [key]: value }));
  }, []);

  const invalidFields = [
    ...positions.filter((position) => !isValidMoneyInput(position.price)).map((p) => p.app_name),
    ...Object.entries(coefficients)
      .filter(([, value]) => !isValidMoneyInput(value))
      .map(([key]) => (key === "k_rolls" ? "Коэф. роллов" : "Коэф. пиццы")),
  ];

  const openSaveDialog = useCallback(() => {
    setSaveDialog({ open: true, dateStart: periods[0]?.value ?? "", points: point ? [point] : [] });
  }, [periods, point]);

  const closeSaveDialog = useCallback(() => {
    setSaveDialog((current) => ({ ...current, open: false }));
  }, []);

  const updateSaveDialog = useCallback((patch) => {
    setSaveDialog((current) => ({ ...current, ...patch }));
  }, []);

  const save = useCallback(async () => {
    setIsLoading(true);
    const response = await api.saveRates(
      buildRatesSavePayload({
        dateStart: saveDialog.dateStart,
        points: saveDialog.points,
        positions,
        coefficients,
      }),
    );
    setIsLoading(false);
    if (response?.st === false) {
      setNotice({ status: false, text: response.text || "Не удалось сохранить ставки" });
      return;
    }
    closeSaveDialog();
    setNotice({ status: true, text: response?.text || "Изменения сохранены" });
    loadPoint(point);
  }, [api, saveDialog, positions, coefficients, closeSaveDialog, loadPoint, point]);

  const deleteHistory = useCallback(
    async (type, row) => {
      setIsLoading(true);
      const response = await api.deleteRatesHistory({ type, id: row.id });
      setIsLoading(false);
      setNotice({
        status: response?.st !== false,
        text: response?.text || "Не удалось удалить запланированное изменение",
      });
      if (response?.st !== false) loadPoint(point);
    },
    [api, loadPoint, point],
  );

  return {
    points,
    periods,
    canEdit,
    point,
    pointData,
    positions,
    coefficients,
    isLoading,
    error,
    notice,
    setNotice,
    saveDialog,
    graphFilter,
    setGraphFilter,
    expandedUnitIds,
    toggleUnit,
    invalidFields,
    handlePointChange,
    handlePriceChange,
    handleCoefficientChange,
    openSaveDialog,
    closeSaveDialog,
    updateSaveDialog,
    save,
    deleteHistory,
  };
}
