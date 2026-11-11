import { Fragment, useEffect, useState } from "react";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  JacoBackdropLoader,
  JacoSurface,
  uiColors,
  uiTableColors,
  uiTypography,
} from "@/design-system/shared/ui";

import { formatSettingValue, getErrorText } from "./kitchenQueueUtils";

const stickyNameCell = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  minWidth: { xs: 150, md: 260 },
  maxWidth: { xs: 150, md: "none" },
  backgroundColor: uiColors.surface,
};

/** Сводка: параметр в строке, значения сети и всех кафе рядом. Значения, заданные для кафе, выделены. */
export default function OverviewTab({ api, showAlert }) {
  const [data, setData] = useState({ points: [], groups: [], rows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .getOverview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error) => {
        if (active) showAlert(getErrorText(error, "Не удалось загрузить сводку"), false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [api, showAlert]);

  const columnCount = data.points.length + 2;

  return (
    <>
      <JacoBackdropLoader open={loading} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "4px",
            backgroundColor: uiColors.primarySoft,
            border: `1px solid ${uiColors.primary}`,
          }}
        />
        <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>
          значение задано для кафе отдельно
        </Typography>
      </Box>

      <JacoSurface sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "70vh" }}>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ ...stickyNameCell, zIndex: 3, ...uiTypography.label, fontWeight: 500 }}
                >
                  Параметр
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ ...uiTypography.label, fontWeight: 500, minWidth: 90 }}
                >
                  Вся сеть
                </TableCell>
                {data.points.map((point) => (
                  <TableCell
                    key={point.id}
                    align="center"
                    sx={{ ...uiTypography.label, fontWeight: 500, minWidth: 120 }}
                  >
                    {point.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.groups.map((group) => {
                const rows = data.rows.filter((row) => row.group === group.id);
                if (rows.length === 0) return null;

                return (
                  <Fragment key={group.id}>
                    <TableRow>
                      <TableCell
                        colSpan={columnCount}
                        sx={{
                          ...uiTypography.sectionTitle,
                          fontSize: 14,
                          color: uiColors.textStrong,
                          backgroundColor: uiTableColors.shiftHeader,
                        }}
                      >
                        {group.name}
                      </TableCell>
                    </TableRow>
                    {rows.map((row) => (
                      <TableRow
                        key={row.key}
                        sx={{ "&:hover td": { backgroundColor: uiTableColors.rowHover } }}
                      >
                        <TableCell
                          sx={{
                            ...stickyNameCell,
                            ...uiTypography.label,
                            color: uiColors.textStrong,
                          }}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ ...uiTypography.label, color: uiColors.text }}
                        >
                          {formatSettingValue(row.type, row.all_value, row.unit)}
                        </TableCell>
                        {data.points.map((point) => {
                          const cell = (Array.isArray(row.values) ? row.values : []).find(
                            (value) => Number(value?.point_id) === point.id,
                          );
                          const isOwn = cell?.source === "db:point";

                          return (
                            <TableCell
                              key={point.id}
                              align="center"
                              sx={{
                                ...uiTypography.label,
                                color: isOwn ? uiColors.primary : uiColors.text,
                                fontWeight: isOwn ? 500 : 400,
                                backgroundColor: isOwn ? uiColors.primarySoft : "transparent",
                              }}
                            >
                              {formatSettingValue(row.type, cell?.value, row.unit)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </JacoSurface>
    </>
  );
}
