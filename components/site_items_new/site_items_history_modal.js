import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  buildHistoryComparison,
  canViewHistoryField,
  compositionSections,
  compositionTotals,
  formatCompositionNumber,
  formatHistoryTimestamp,
  formatHistoryValue,
  getCompositionRowName,
  historySections,
  normalizeHistorySnapshots,
} from "./site_items_history_model";

const blockBackground = "#F3F3F3";
const blockBorder = "#E5E5E5";
const textPrimary = "#3C3B3B";
const textSecondary = "#5E5E5E";
const selectedBackground = "#FFF4CC";
const addedBackground = "#EAF6EC";
const removedBackground = "#FDEBEC";
const historySectionDescriptions = {
  main: "Наименование, категория и изображение",
  nutrition: "Вес, порция и пищевая ценность",
  description: "Тексты для карточки и списка",
  tags: "Теги и промо-маркеры",
  activity: "Публикация и продажи",
  composition: "Тайминги, заготовки и позиции",
};

function getRowBackground(status) {
  if (status === "added") {
    return addedBackground;
  }

  if (status === "changed") {
    return selectedBackground;
  }

  if (status === "removed") {
    return removedBackground;
  }

  return "#fff";
}

function HistoryField({ field, snapshot, changed }) {
  const value = formatHistoryValue(field, snapshot);

  if (field.type === "image") {
    const imageName = snapshot?.[field.key];

    return (
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper
          variant="outlined"
          sx={{
            height: "max-content",
            p: 1.5,
            borderColor: changed ? "#E3B341" : blockBorder,
            backgroundColor: changed ? selectedBackground : "#fff",
          }}
        >
          <Typography sx={{ mb: 1, color: textSecondary, fontSize: 12 }}>{field.label}</Typography>
          {imageName ? (
            <Box
              component="img"
              src={`https://mainimg.jacofood.ru/${imageName}_292x292.jpg`}
              alt={snapshot?.name || field.label}
              loading="lazy"
              sx={{
                display: "block",
                width: "100%",
                maxWidth: 240,
                maxHeight: 240,
                borderRadius: 2,
                objectFit: "contain",
              }}
            />
          ) : (
            <Typography sx={{ color: textSecondary }}>Изображение отсутствует</Typography>
          )}
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid size={{ xs: 12, sm: field.multiline ? 12 : 6, lg: field.multiline ? 12 : 4 }}>
      <Paper
        variant="outlined"
        sx={{
          height: "max-content",
          minHeight: field.multiline ? 90 : 66,
          p: 1.5,
          borderColor: changed ? "#E3B341" : blockBorder,
          backgroundColor: changed ? selectedBackground : "#fff",
        }}
      >
        <Typography sx={{ mb: 0.5, color: textSecondary, fontSize: 12 }}>{field.label}</Typography>
        <Typography
          sx={{
            color: textPrimary,
            fontSize: 14,
            fontWeight: changed ? 700 : 400,
            whiteSpace: field.multiline ? "pre-wrap" : "normal",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>
      </Paper>
    </Grid>
  );
}

function SnapshotSection({ section, snapshot, changedFields, access }) {
  const fields = section.fields.filter((field) => canViewHistoryField(access, field));

  if (!fields.length) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: blockBorder, borderRadius: 3, overflow: "hidden", boxShadow: "none" }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 2.5 },
          py: { xs: 1.75, md: 2 },
          borderBottom: `1px solid ${blockBorder}`,
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            color: "#DD1A32",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Версия карточки
        </Typography>
        <Typography sx={{ mt: 0.5, color: textPrimary, fontSize: 20, fontWeight: 700 }}>
          {section.title}
        </Typography>
        <Typography sx={{ mt: 0.75, color: textSecondary, fontSize: 14, lineHeight: "20px" }}>
          {historySectionDescriptions[section.id]}
        </Typography>
      </Box>
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.5 } }}>
        <Grid
          container
          spacing={2}
        >
          {fields.map((field) => (
            <HistoryField
              key={field.key}
              field={field}
              snapshot={snapshot}
              changed={changedFields.has(field.key)}
            />
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}

function CompositionTable({ title, rows, status, isFinal = false }) {
  if (!rows.length) {
    return status === "removed" ? null : (
      <Paper
        variant="outlined"
        sx={{ borderColor: blockBorder, borderRadius: 2 }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography sx={{ mt: 1, color: textSecondary, fontSize: 14 }}>Нет позиций</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: blockBorder, borderRadius: 2, overflow: "hidden" }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${blockBorder}` }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          {status === "removed" ? (
            <Chip
              size="small"
              label="Удалено"
              sx={{ backgroundColor: removedBackground }}
            />
          ) : null}
        </Stack>
      </Box>
      <TableContainer>
        <Table
          size="small"
          sx={{ minWidth: 760 }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Номенклатура</TableCell>
              <TableCell align="right">Брутто</TableCell>
              <TableCell align="right">% ХО</TableCell>
              <TableCell align="right">Нетто</TableCell>
              <TableCell align="right">% ГО</TableCell>
              <TableCell align="right">Выход</TableCell>
              {isFinal ? <TableCell align="center">Добавка</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.historyKey}
                sx={{
                  backgroundColor: getRowBackground(status || row.historyStatus),
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                <TableCell>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {getCompositionRowName(row)}
                  </Typography>
                  {row?.ei_name ? (
                    <Typography sx={{ color: textSecondary, fontSize: 12 }}>
                      {row.ei_name}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.brutto)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.pr_1)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.netto)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.pr_2)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.res)}</TableCell>
                {isFinal ? (
                  <TableCell align="center">
                    {row?.is_add === null || row?.is_add === undefined
                      ? "—"
                      : parseInt(row.is_add, 10)
                        ? "Да"
                        : "Нет"}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function HistoryComposition({ comparison, access }) {
  const visibleSections = compositionSections.filter((section) =>
    canViewHistoryField(access, section),
  );
  const visibleTotals = compositionTotals.filter((field) => canViewHistoryField(access, field));

  if (!visibleSections.length && !visibleTotals.length) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: blockBorder, borderRadius: 3, overflow: "hidden", boxShadow: "none" }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 2.5 },
          py: { xs: 1.75, md: 2 },
          borderBottom: `1px solid ${blockBorder}`,
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            color: "#DD1A32",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Версия карточки
        </Typography>
        <Typography sx={{ mt: 0.5, color: textPrimary, fontSize: 20, fontWeight: 700 }}>
          Состав
        </Typography>
        <Typography sx={{ mt: 0.75, color: textSecondary, fontSize: 14, lineHeight: "20px" }}>
          Тайминги, заготовки и позиции
        </Typography>
      </Box>
      <Stack
        spacing={2}
        sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.5 } }}
      >
        {visibleTotals.length ? (
          <Grid
            container
            spacing={1.5}
          >
            {visibleTotals.map((field) => (
              <HistoryField
                key={field.key}
                field={field}
                snapshot={comparison.current}
                changed={comparison.changedFields.has(field.key)}
              />
            ))}
          </Grid>
        ) : null}

        {visibleSections.map((section) => {
          const collection = comparison.collections[section.key];

          return (
            <Stack
              key={section.key}
              spacing={1.5}
            >
              <CompositionTable
                title={section.title}
                rows={collection.rows}
                isFinal={section.isFinal}
              />
              <CompositionTable
                title={`${section.title}: удаленные позиции`}
                rows={collection.removed}
                status="removed"
                isFinal={section.isFinal}
              />
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function SiteItemsHistoryModal({
  open,
  onClose,
  snapshots,
  tagsAll,
  itemName,
  fullScreen,
  access,
}) {
  const versions = useMemo(
    () => normalizeHistorySnapshots(snapshots, tagsAll),
    [snapshots, tagsAll],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("main");
  const navigationSections = useMemo(
    () => [
      ...historySections
        .filter((section) => section.fields.some((field) => canViewHistoryField(access, field)))
        .map((section) => ({
          id: section.id,
          title: section.title,
          description: historySectionDescriptions[section.id],
        })),
      ...(compositionSections.some((section) => canViewHistoryField(access, section))
        ? [
            {
              id: "composition",
              title: "Состав",
              description: historySectionDescriptions.composition,
            },
          ]
        : []),
    ],
    [access],
  );

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setActiveSection(navigationSections[0]?.id || "main");
    }
  }, [navigationSections, open, snapshots]);

  const comparison = useMemo(
    () => buildHistoryComparison(versions, selectedIndex),
    [versions, selectedIndex],
  );
  const currentSection = historySections.find((section) => section.id === activeSection);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      fullScreen={fullScreen}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: { xs: "100%", xl: 1380 },
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, md: 3 },
          overflow: "hidden",
          boxShadow: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.25, md: 1.5 },
          backgroundColor: blockBackground,
          borderBottom: `1px solid ${blockBorder}`,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: textSecondary,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {navigationSections.find((section) => section.id === activeSection)?.title || "История"}
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              color: textPrimary,
              fontSize: { xs: 20, md: 24 },
              lineHeight: { xs: "26px", md: "32px" },
              fontWeight: 700,
            }}
          >
            История версий{itemName ? `: ${itemName}` : ""}
          </Typography>
          <Typography sx={{ mt: 0.5, color: textSecondary, fontSize: 13 }}>
            Выберите дату, чтобы посмотреть полное состояние карточки.
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: "#9B9B9B" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 1.25, md: 2.5 },
          pt: { xs: 2, md: 2.5 },
          pb: { xs: 2, md: 2.5 },
          backgroundColor: "#FAFAFA",
        }}
      >
        {!versions.length || !comparison.current ? (
          <Alert severity="info">История изменений отсутствует.</Alert>
        ) : (
          <Stack spacing={2.5}>
            <Paper
              variant="outlined"
              sx={{
                borderColor: blockBorder,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "none",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 1.75, md: 2 },
                  borderBottom: `1px solid ${blockBorder}`,
                }}
              >
                <Typography sx={{ color: textPrimary, fontSize: 18, fontWeight: 700 }}>
                  Версии карточки
                </Typography>
                <Typography sx={{ mt: 0.5, color: textSecondary, fontSize: 14 }}>
                  Выберите дату редактирования для просмотра сохраненного состояния.
                </Typography>
              </Box>

              <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel id="site-item-history-version-label">Дата редактирования</InputLabel>
                  <Select
                    labelId="site-item-history-version-label"
                    value={selectedIndex}
                    label="Дата редактирования"
                    onChange={(event) => setSelectedIndex(Number(event.target.value))}
                  >
                    {versions.map((version, index) => (
                      <MenuItem
                        key={version?.id || index}
                        value={index}
                      >
                        {formatHistoryTimestamp(version.history_timestamp)}
                        {version?.user ? ` · ${version.user}` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer sx={{ display: { xs: "none", md: "block" }, maxHeight: 190 }}>
                <Table
                  stickyHeader
                  size="small"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 280 }}>Дата редактирования</TableCell>
                      <TableCell>Автор</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version, index) => (
                      <TableRow
                        key={version?.id || index}
                        hover
                        selected={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                        sx={{
                          cursor: "pointer",
                          "&.Mui-selected": { backgroundColor: selectedBackground },
                          "&.Mui-selected:hover": { backgroundColor: selectedBackground },
                        }}
                      >
                        <TableCell>{formatHistoryTimestamp(version.history_timestamp)}</TableCell>
                        <TableCell>{version?.user || "Неизвестно"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Typography sx={{ color: textSecondary, fontSize: 14 }}>
                Состояние на {formatHistoryTimestamp(comparison.current.history_timestamp)}
              </Typography>
              {comparison.previous ? (
                <>
                  <Chip
                    size="small"
                    label="Изменено"
                    sx={{ backgroundColor: selectedBackground }}
                  />
                  <Chip
                    size="small"
                    label="Добавлено"
                    sx={{ backgroundColor: addedBackground }}
                  />
                  <Chip
                    size="small"
                    label="Удалено"
                    sx={{ backgroundColor: removedBackground }}
                  />
                </>
              ) : (
                <Chip
                  size="small"
                  label="Нет предыдущей версии для сравнения"
                />
              )}
            </Stack>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 2,
                minHeight: { lg: 620 },
              }}
            >
              <Box
                sx={{
                  display: { xs: "flex", lg: "none" },
                  gap: 1,
                  overflowX: "auto",
                  pb: 0.5,
                }}
              >
                {navigationSections.map((section) => {
                  const active = activeSection === section.id;

                  return (
                    <Button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      sx={{
                        flexShrink: 0,
                        minHeight: 42,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        border: `1px solid ${active ? "#DD1A32" : blockBorder}`,
                        backgroundColor: active ? "#fff" : blockBackground,
                        color: active ? textPrimary : textSecondary,
                        textTransform: "none",
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {section.title}
                    </Button>
                  );
                })}
              </Box>

              <Paper
                sx={{
                  display: { xs: "none", lg: "block" },
                  width: 252,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  p: 1.5,
                  borderRadius: 3,
                  border: `1px solid ${blockBorder}`,
                  backgroundColor: blockBackground,
                  boxShadow: "none",
                  position: "sticky",
                  top: 0,
                }}
              >
                <Stack spacing={1}>
                  <Typography sx={{ color: textPrimary, fontSize: 18, fontWeight: 700 }}>
                    Разделы
                  </Typography>
                  {navigationSections.map((section) => {
                    const active = activeSection === section.id;

                    return (
                      <Button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        sx={{
                          width: "100%",
                          px: 1.5,
                          py: 1.25,
                          borderRadius: 2.5,
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                          textAlign: "left",
                          textTransform: "none",
                          border: `1px solid ${active ? "#DD1A32" : "transparent"}`,
                          backgroundColor: active ? "#fff" : "transparent",
                          color: active ? textPrimary : textSecondary,
                          "&:hover": {
                            backgroundColor: "#fff",
                            borderColor: active ? "#DD1A32" : blockBorder,
                          },
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                            {section.title}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.5,
                              color: active ? textSecondary : "#737373",
                              fontSize: 12,
                            }}
                          >
                            {section.description}
                          </Typography>
                        </Box>
                      </Button>
                    );
                  })}
                </Stack>
              </Paper>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                {activeSection === "composition" ? (
                  <HistoryComposition
                    comparison={comparison}
                    access={access}
                  />
                ) : currentSection ? (
                  <SnapshotSection
                    section={currentSection}
                    snapshot={comparison.current}
                    changedFields={comparison.changedFields}
                    access={access}
                  />
                ) : null}
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 1.5, md: 2.5 },
          py: 1.5,
          borderTop: `1px solid ${blockBorder}`,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            minHeight: 40,
            px: 2,
            border: `1px solid ${blockBorder}`,
            borderRadius: 1.5,
            color: textPrimary,
            textTransform: "none",
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}
