"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { JacoButton, JacoDatePicker, JacoSelect, JacoSurface } from "@/design-system/shared/ui";
import { filterSx } from "../constants";
import { STATISTICS_SOURCES, orderSourceLabel } from "../errorsManagementViewModel.mjs";

export default function ComplaintStatisticsSection({ model }) {
  const {
    applyStatistics,
    cities,
    mobile,
    statistics,
    statisticsCafes,
    statisticsDraft,
    statisticsLoaded,
    updateStatistics,
  } = model;
  return (
    <Stack spacing={2}>
      <JacoSurface
        component="form"
        sx={filterSx}
        onSubmit={(event) => {
          event.preventDefault();
          applyStatistics();
        }}
      >
        <Grid
          container
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <JacoSelect
              label="Город"
              options={cities}
              value={statisticsDraft.cityId}
              multiple={false}
              allowNone={false}
              onChange={(event) => updateStatistics("cityId", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <JacoSelect
              label="Кафе"
              options={statisticsCafes}
              value={statisticsDraft.pointId}
              multiple={false}
              allowNone={false}
              onChange={(event) => updateStatistics("pointId", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <JacoSelect
              label="Источник заказа"
              options={STATISTICS_SOURCES}
              value={statisticsDraft.orderSource || ""}
              multiple={false}
              allowNone
              noneLabel="Все источники"
              onChange={(event) =>
                updateStatistics(
                  "orderSource",
                  event.target.value === "none" ? "" : event.target.value,
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <JacoDatePicker
              label="Дата от"
              value={statisticsDraft.dateFrom}
              onChange={(value) =>
                updateStatistics("dateFrom", value?.format?.("YYYY-MM-DD") || "")
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <JacoDatePicker
              label="Дата до"
              value={statisticsDraft.dateTo}
              onChange={(value) => updateStatistics("dateTo", value?.format?.("YYYY-MM-DD") || "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <JacoSelect
              label="Зарегистрировал"
              options={statistics?.employees || []}
              value={statisticsDraft.employeeId || ""}
              multiple={false}
              allowNone
              noneLabel="Все сотрудники"
              onChange={(event) =>
                updateStatistics(
                  "employeeId",
                  event.target.value === "none" ? "" : event.target.value,
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <JacoButton
              type="submit"
              fullWidth={mobile}
            >
              Применить
            </JacoButton>
          </Grid>
        </Grid>
      </JacoSurface>
      {!statisticsLoaded ? null : (
        <>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSurface
                variant="outlined"
                sx={{ p: 2.5 }}
              >
                <Typography color="text.secondary">Заказов с ошибками</Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  {statistics?.unique_orders ?? "—"}
                </Typography>
              </JacoSurface>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSurface
                variant="outlined"
                sx={{ p: 2.5 }}
              >
                <Typography color="text.secondary">Всего ошибок</Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  {statistics?.total_errors ?? "—"}
                </Typography>
              </JacoSurface>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSurface
                variant="outlined"
                sx={{ p: 2.5 }}
              >
                <Typography color="text.secondary">Выписано промокодов</Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  {statistics?.issued_promos ?? "—"}
                </Typography>
              </JacoSurface>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSurface
                variant="outlined"
                sx={{ p: 2.5 }}
              >
                <Typography color="text.secondary">Активировано промокодов</Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  {statistics?.activated_promos ?? "—"}
                </Typography>
              </JacoSurface>
            </Grid>
          </Grid>
          <JacoSurface
            variant="outlined"
            sx={{ p: { xs: 2, md: 2.5 } }}
          >
            <Typography
              fontWeight={700}
              mb={1.5}
            >
              По источнику заказа
            </Typography>
            {(statistics?.by_source || []).length === 0 ? (
              <Typography color="text.secondary">За выбранные фильтры данных нет.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Источник</TableCell>
                    <TableCell align="right">Заказов</TableCell>
                    <TableCell align="right">Ошибок</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(statistics?.by_source || []).map((row) => (
                    <TableRow key={row.source}>
                      <TableCell>{orderSourceLabel(row.source)}</TableCell>
                      <TableCell align="right">{row.unique_orders}</TableCell>
                      <TableCell align="right">{row.total_errors}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </JacoSurface>
          <JacoSurface
            variant="outlined"
            sx={{ p: { xs: 2, md: 2.5 } }}
          >
            <Typography
              fontWeight={700}
              mb={1.5}
            >
              Категории и типы ошибок
            </Typography>
            {(statistics?.categories || []).length === 0 ? (
              <Typography color="text.secondary">За выбранные фильтры данных нет.</Typography>
            ) : (
              (statistics?.categories || []).map((category) => (
                <Accordion
                  key={category.name}
                  disableGutters
                  elevation={0}
                  sx={{
                    borderTop: 1,
                    borderColor: "divider",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid
                      container
                      sx={{ width: "100%", alignItems: "center" }}
                    >
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography fontWeight={700}>{category.name}</Typography>
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Заказов: {category.unique_orders}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Ошибок: {category.total_errors}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {category.share}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Тип ошибки</TableCell>
                          <TableCell align="right">Заказов</TableCell>
                          <TableCell align="right">Ошибок</TableCell>
                          <TableCell align="right">Доля</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.types.map((type) => (
                          <TableRow key={type.name}>
                            <TableCell>{type.name}</TableCell>
                            <TableCell align="right">{type.unique_orders}</TableCell>
                            <TableCell align="right">{type.total_errors}</TableCell>
                            <TableCell align="right">{type.share}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </JacoSurface>
        </>
      )}
    </Stack>
  );
}
