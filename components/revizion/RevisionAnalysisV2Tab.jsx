import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PT_Sans } from "next/font/google";

import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";

import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { api_laravel } from "@/src/api_new";
import {
  CalculationDetailDialog,
  Drilldown,
  MultiCafeReport,
  SingleCafeReport,
} from "@/components/revizion/RevisionAnalysisTab";

const ALL_POSITIONS = { id: "__all__", name: "Все позиции" };
const getResponseData = (response) => response?.data ?? response;
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`))
    : "—";

export const ptSans = PT_Sans({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
});

const createPrototypeTheme = (mode) => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#a2a9b8" : "#c03",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#201f1d" : "#fafafa",
        paper: isDark ? "#302f2c" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f5f4ee" : "#212121",
        secondary: isDark ? "#b0ada4" : "#616161",
      },
      divider: isDark ? "rgba(255,255,255,.12)" : "#e0e0e0",
      success: { main: isDark ? "#63d68b" : "#4caf50" },
      warning: { main: "#e4aa55" },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: `${ptSans.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? "rgba(255,255,255,.14)" : "#e0e0e0"}`,
            backgroundColor: isDark ? "rgba(255,255,255,.10)" : "#eeeeee",
            fontWeight: 600,
          },
        },
      },
    },
  });
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 54,
    borderRadius: "16px",
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,.05)" : "#ffffff"),
    boxShadow: (theme) =>
      `inset 0 1px 0 ${
        theme.palette.mode === "dark" ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.9)"
      }`,
    "& fieldset": {
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.23)",
    },
    "&:hover fieldset": {
      borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,.26)" : "#212121"),
    },
    "&.Mui-focused": {
      bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,.09)" : "#ffffff"),
      boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.mode === "dark" ? "#616978" : "#c03"}`,
    },
    "&.Mui-focused fieldset": {
      borderColor: (theme) => (theme.palette.mode === "dark" ? "#616978" : "#c03"),
    },
  },
  "& .MuiInputLabel-root": {
    color: "text.secondary",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: ".05em",
    textTransform: "uppercase",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: (theme) => (theme.palette.mode === "dark" ? "#a2a9b8" : "#c03"),
  },
};

function PositionSelect({ positions, value, onChange, disabled }) {
  const options = useMemo(
    () => [
      ALL_POSITIONS,
      ...[...positions].sort(
        (left, right) =>
          String(left.category_name || "").localeCompare(String(right.category_name || ""), "ru") ||
          left.name.localeCompare(right.name, "ru"),
      ),
    ],
    [positions],
  );
  const selectedIds = useMemo(() => new Set(value.map((position) => position.id)), [value]);
  const allSelected = positions.length > 0 && value.length === positions.length;

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      disabled={disabled}
      options={options}
      value={allSelected ? [ALL_POSITIONS] : value}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      getOptionLabel={(option) => option.name}
      onChange={(_, next, reason, details) => {
        if (reason === "clear") {
          onChange([]);
          return;
        }
        if (details?.option?.id === ALL_POSITIONS.id) {
          onChange(allSelected ? [] : positions);
          return;
        }
        if (allSelected && details?.option) {
          onChange(positions.filter((position) => position.id !== details.option.id));
          return;
        }
        onChange(next.filter((position) => position.id !== ALL_POSITIONS.id));
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const checked = option.id === ALL_POSITIONS.id ? allSelected : selectedIds.has(option.id);
        return (
          <Box
            component="li"
            key={key}
            {...optionProps}
            sx={{ py: 1, px: 1.75, gap: 1 }}
          >
            <Checkbox
              checked={checked}
              size="small"
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography>{option.name}</Typography>
              {option.category_name ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {option.category_name}
                </Typography>
              ) : null}
            </Box>
          </Box>
        );
      }}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            size="small"
            label={
              option.id === ALL_POSITIONS.id ? `Все позиции (${positions.length})` : option.name
            }
          />
        ))
      }
      slotProps={{
        paper: {
          sx: (theme) => ({
            mt: 0.75,
            border: `1px solid ${
              theme.palette.mode === "dark" ? "rgba(255,255,255,.12)" : "#e0e0e0"
            }`,
            borderRadius: "20px",
            bgcolor: theme.palette.mode === "dark" ? "rgba(43,42,39,.96)" : "rgba(255,255,255,.96)",
            backdropFilter: "blur(24px) saturate(180%)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 20px 48px rgba(0,0,0,.5)"
                : "0 8px 24px rgba(0,0,0,.16)",
          }),
        },
        listbox: { sx: { maxHeight: 300, py: 0.5 } },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Позиции"
          placeholder="Найти позицию…"
          sx={fieldSx}
        />
      )}
    />
  );
}

function RevisionSelect({ label, options, value, onChange, disabled }) {
  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      value={value}
      onChange={(_, next) => onChange(next)}
      isOptionEqualToValue={(option, selected) => option.date === selected.date}
      getOptionLabel={(option) => formatDate(option.date)}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const participants = option.participants || [];
        return (
          <Box
            component="li"
            key={key}
            {...optionProps}
            sx={{ gap: 1.25, py: 1.25 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography>{formatDate(option.date)}</Typography>
              <Typography
                variant="caption"
                color={option.complete ? "text.secondary" : "warning.main"}
              >
                {option.matched_points} из {option.total_points} кафе
              </Typography>
            </Box>
            {participants.length ? (
              <Tooltip
                placement="right"
                title={participants.map((participant) => (
                  <Typography
                    key={`${participant.point_id}-${participant.revision_id}`}
                    variant="caption"
                    display="block"
                  >
                    {participant.point_name}: {participant.user_name || "Автор не указан"}
                    {participant.role ? `, ${participant.role}` : ""}
                  </Typography>
                ))}
              >
                <Box
                  component="span"
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,255,255,.32)" : "#c9ccd1",
                  }}
                />
              </Tooltip>
            ) : null}
          </Box>
        );
      }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            mt: 0.75,
            border: `1px solid ${
              theme.palette.mode === "dark" ? "rgba(255,255,255,.12)" : "#e0e0e0"
            }`,
            borderRadius: "20px",
            bgcolor: theme.palette.mode === "dark" ? "rgba(43,42,39,.96)" : "rgba(255,255,255,.96)",
            backdropFilter: "blur(24px) saturate(180%)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 20px 48px rgba(0,0,0,.5)"
                : "0 8px 24px rgba(0,0,0,.16)",
          }),
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Выбери ревизию…"
          sx={fieldSx}
        />
      )}
    />
  );
}

export default function RevisionAnalysisV2Tab({ initialData = null, themeMode = "dark" }) {
  const [scope, setScope] = useState("food");
  const [points, setPoints] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [positions, setPositions] = useState({ food: [], household: [] });
  const [selectedPositions, setSelectedPositions] = useState({ food: [], household: [] });
  const [revisions, setRevisions] = useState([]);
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [reports, setReports] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [drill, setDrill] = useState(null);
  const [calculationDetail, setCalculationDetail] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [error, setError] = useState("");
  const revisionRequest = useRef(0);
  const isDark = themeMode === "dark";
  const prototypeTheme = useMemo(() => createPrototypeTheme(themeMode), [themeMode]);

  const report = reports[scope] || null;
  const selectedScopePositions = selectedPositions[scope] || [];

  useEffect(() => {
    let active = true;

    async function loadFilters() {
      setLoading(true);
      const response = initialData ?? (await api_laravel("revizion", "get_analysis_filters"));
      const result = getResponseData(response);
      if (!active) return;

      if (!result || result.st === false) {
        setError(result?.text || "Не удалось загрузить фильтры анализа");
        setLoading(false);
        return;
      }

      const nextPoints = result.points || [];
      const nextPositions = {
        food: (result.positions?.food || []).map((position) => ({ ...position, scope: "food" })),
        household: (result.positions?.household || []).map((position) => ({
          ...position,
          scope: "household",
        })),
      };
      setPoints(nextPoints);
      setSelectedPoints(nextPoints);
      setPositions(nextPositions);
      setSelectedPositions(nextPositions);
      setLoading(false);
    }

    loadFilters();
    return () => {
      active = false;
    };
  }, [initialData]);

  useEffect(() => {
    const requestId = ++revisionRequest.current;
    setReports({});
    setAppliedFilters({});
    setDrill(null);
    setCalculationDetail(null);
    setSeries(null);

    if (!selectedPoints.length) {
      setRevisions([]);
      setDateStart(null);
      setDateEnd(null);
      return;
    }

    async function loadRevisions() {
      setRevisionLoading(true);
      setError("");
      const response = await api_laravel("revizion", "get_analysis_revisions", {
        point_ids: selectedPoints.map((point) => point.id),
      });
      const result = getResponseData(response);
      if (requestId !== revisionRequest.current) return;

      if (!result || result.st === false) {
        setError(result?.text || "Не удалось загрузить даты ревизий");
        setRevisions([]);
        setDateStart(null);
        setDateEnd(null);
      } else {
        const nextRevisions = result.revisions || [];
        setRevisions(nextRevisions);
        setDateEnd(nextRevisions[0] || null);
        setDateStart(nextRevisions[1] || nextRevisions[0] || null);
      }
      setRevisionLoading(false);
    }

    loadRevisions();
  }, [selectedPoints]);

  const clearResult = (targetScope = scope) => {
    setReports((current) => ({ ...current, [targetScope]: null }));
    setAppliedFilters((current) => ({ ...current, [targetScope]: null }));
    setDrill(null);
    setCalculationDetail(null);
    setSeries(null);
  };

  const clearAllResults = () => {
    setReports({});
    setAppliedFilters({});
    setDrill(null);
    setCalculationDetail(null);
    setSeries(null);
  };

  const runReport = async () => {
    if (!selectedPoints.length || !selectedScopePositions.length || !dateStart || !dateEnd) {
      setError("Выберите кафе, позиции и обе граничные ревизии");
      return;
    }
    if (dateStart.date > dateEnd.date) {
      setError("Начальная ревизия не может быть позже конечной");
      return;
    }

    const filters = {
      point_ids: selectedPoints.map((point) => point.id),
      position_ids: selectedScopePositions.map((position) => position.id),
      date_start: dateStart.date,
      date_end: dateEnd.date,
      scope,
    };

    setError("");
    setReportLoading(true);
    setDrill(null);
    setCalculationDetail(null);
    setSeries(null);
    const response = await api_laravel("revizion", "get_analysis", filters);
    const result = getResponseData(response);
    setReportLoading(false);

    if (!result || result.st === false) {
      setError(result?.text || "Не удалось построить отчёт");
      return;
    }

    setReports((current) => ({ ...current, [scope]: result }));
    setAppliedFilters((current) => ({ ...current, [scope]: filters }));
  };

  const loadSeries = useCallback(
    async (positionId) => {
      const filters = appliedFilters[scope];
      if (!filters) return;
      setSeriesLoading(true);
      const response = await api_laravel("revizion", "get_analysis_series", {
        point_ids: filters.point_ids,
        position_id: positionId,
        date_start: filters.date_start,
        date_end: filters.date_end,
        scope,
      });
      const result = getResponseData(response);
      setSeriesLoading(false);

      if (!result || result.st === false) {
        setError(result?.text || "Не удалось загрузить динамику");
        return;
      }
      setSeries(result);
    },
    [appliedFilters, scope],
  );

  const openPosition = (positionId, pointId = null) => {
    setCalculationDetail(null);
    setSeries(null);
    setDrill({ scope, positionId, pointId });
  };

  const openPoint = (pointId) => {
    const positionId = report?.positions?.[0]?.id;
    if (positionId) openPosition(positionId, pointId);
  };

  return (
    <ThemeProvider theme={prototypeTheme}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          px: { xs: 1.75, sm: 3.75 },
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 3.25, sm: 4.25 },
          color: "text.primary",
          border: `1px solid ${isDark ? "rgba(255,255,255,.10)" : "#e0e0e0"}`,
          borderTop: 0,
          borderRadius: { xs: 0, sm: "0 0 30px 30px" },
          background: isDark
            ? "radial-gradient(900px 500px at 10% 0%, rgba(72,68,62,.72), transparent 60%), radial-gradient(760px 480px at 95% 10%, rgba(52,49,45,.68), transparent 60%), rgba(48,47,44,.78)"
            : "#ffffff",
          backdropFilter: isDark ? "blur(30px) saturate(180%)" : "none",
          boxShadow: isDark
            ? "0 18px 50px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.2)"
            : "0 2px 8px rgba(0,0,0,.10)",
          fontFamily: prototypeTheme.typography.fontFamily,
          "& .MuiAccordion-root": {
            bgcolor: isDark ? "rgba(255,255,255,.04)" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,.12)" : "#e0e0e0",
          },
          "& .MuiTableContainer-root": {
            borderRadius: 0,
            scrollbarColor: isDark
              ? "rgba(255,255,255,.25) transparent"
              : "rgba(0,0,0,.24) transparent",
          },
          "& .MuiTableCell-root": {
            borderColor: isDark ? "rgba(255,255,255,.08)" : "#e0e0e0",
            py: 1.125,
            fontSize: "12px !important",
          },
          "& .MuiTableCell-root button": {
            fontSize: "12px !important",
          },
          "& .MuiTableCell-root p, & .MuiTableCell-root span": {
            fontSize: "inherit !important",
          },
          "& .MuiTableCell-head": {
            bgcolor: isDark ? "rgba(43,42,39,.98)" : "#fafafa",
            color: "text.secondary",
          },
          "& .matrixPositionCell": {
            bgcolor: `${isDark ? "#2b2a27" : "#ffffff"} !important`,
          },
          "& .MuiTableRow-root:hover .MuiTableCell-body": {
            bgcolor: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
          },
        }}
      >
        <Backdrop
          open={loading}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Tabs
          value={scope}
          onChange={(_, next) => {
            setScope(next);
            setDrill(null);
            setCalculationDetail(null);
            setSeries(null);
          }}
          sx={{
            minHeight: 42,
            mb: 2,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.10)"}`,
            "& .MuiTabs-indicator": {
              height: 2,
              bgcolor: isDark ? "#a2a9b8" : "#c03",
            },
            "& .MuiTab-root": {
              minHeight: 42,
              minWidth: 0,
              px: 0.25,
              mr: 3.25,
              color: "text.secondary",
              fontSize: 15,
              fontWeight: 600,
            },
            "& .Mui-selected": {
              color: `${isDark ? "#a2a9b8" : "#c03"} !important`,
            },
          }}
        >
          <Tab
            value="food"
            label="Блюда и напитки"
          />
          <Tab
            value="household"
            label="Хозрасходы"
          />
        </Tabs>

        <Stack spacing={2.25}>
          <Box sx={fieldSx}>
            <CityCafeAutocomplete2
              points={points}
              value={selectedPoints}
              onChange={setSelectedPoints}
              label="Кафе"
              withAll={points.length > 0}
              withAllSelected
              withOrganizationMode
            />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
          >
            <Box sx={{ flex: 1 }}>
              <RevisionSelect
                label="Ревизия (от)"
                options={revisions}
                value={dateStart}
                onChange={(next) => {
                  setDateStart(next);
                  clearAllResults();
                }}
                disabled={revisionLoading}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RevisionSelect
                label="Ревизия (до)"
                options={revisions}
                value={dateEnd}
                onChange={(next) => {
                  setDateEnd(next);
                  clearAllResults();
                }}
                disabled={revisionLoading}
              />
            </Box>
          </Stack>

          <PositionSelect
            positions={positions[scope] || []}
            value={selectedScopePositions}
            disabled={!positions[scope]?.length}
            onChange={(next) => {
              setSelectedPositions((current) => ({ ...current, [scope]: next }));
              clearResult();
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
          >
            {revisionLoading ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <CircularProgress size={18} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Подбираем ревизии кафе
                </Typography>
              </Stack>
            ) : null}
            <Button
              variant="contained"
              onClick={runReport}
              disabled={reportLoading || revisionLoading}
              sx={{
                minWidth: 132,
                px: 4,
                py: 1.25,
                color: "#fff",
                bgcolor: isDark ? "rgba(96,102,116,.88)" : "#c03",
                border: isDark ? "1px solid rgba(255,255,255,.5)" : "1px solid #c03",
                boxShadow: isDark
                  ? "0 8px 24px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.5)"
                  : "0 3px 8px rgba(204,0,51,.24)",
                "&:hover": { bgcolor: isDark ? "rgba(112,119,135,.98)" : "#990026" },
              }}
            >
              {reportLoading ? "Считаем…" : "Показать"}
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <Alert
            severity="error"
            sx={{ mt: 2.5 }}
          >
            {error}
          </Alert>
        ) : null}
        {!loading && !points.length ? (
          <Alert
            severity="info"
            sx={{ mt: 2.5 }}
          >
            Нет доступных кафе для анализа.
          </Alert>
        ) : null}
        {!revisionLoading && selectedPoints.length > 0 && !revisions.length ? (
          <Alert
            severity="info"
            sx={{ mt: 2.5 }}
          >
            За последние 12 месяцев ревизии не найдены.
          </Alert>
        ) : null}

        <CalculationDetailDialog
          detail={calculationDetail}
          onClose={() => setCalculationDetail(null)}
        />

        <Box sx={{ mt: report || drill ? 3.5 : 0 }}>
          {drill && report?.rows?.length ? (
            <Drilldown
              report={report}
              drill={drill}
              series={series}
              seriesLoading={seriesLoading}
              loadSeries={loadSeries}
              hideCafeBreakdown
              prototypeStyle
              onClose={() => {
                setDrill(null);
                setSeries(null);
              }}
              onPointSelect={(pointId) => setDrill((current) => ({ ...current, pointId }))}
            />
          ) : report ? (
            <Stack spacing={1.5}>
              {!report.rows?.length ? (
                <Alert severity="info">По выбранным параметрам нет данных для отчёта.</Alert>
              ) : report.points.length === 1 ? (
                <SingleCafeReport
                  report={report}
                  scope={scope}
                  onPositionClick={(positionId) => openPosition(positionId, report.points[0].id)}
                  onCalculationClick={(row) =>
                    setCalculationDetail({ scope, row, point: report.points[0] })
                  }
                  hideInfoIcon
                  hideUnit
                  neutralValues
                />
              ) : (
                <MultiCafeReport
                  report={report}
                  onPositionClick={(positionId) => openPosition(positionId)}
                  onPointClick={openPoint}
                  onCalculationClick={(row, point) => setCalculationDetail({ scope, row, point })}
                  compact
                  hideInfoIcon
                  hideUnit
                  neutralValues
                />
              )}
            </Stack>
          ) : null}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
