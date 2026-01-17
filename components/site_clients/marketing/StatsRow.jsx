import { Add, Remove } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { memo } from "react";
import ShowOrdersButton from "./ShowOrdersButton";
import { formatRUR } from "@/src/helpers/utils/i18n";
import Link from "next/link";

export const COL_WIDTHS = {
  label: "auto",
  orders: 140,
  sum: 180,
  avg: 160,
};

export const ROW_INDENT = 24; // px per level

// config
export const utmStatsColumns = [
  { label: "Тип (utm_medium)", key: "medium" },
  { label: "Источник (utm_source)", key: "source" },
  { label: "Кампания (utm_campaign)", key: "campaign" },
  { label: "Ключевое слово (utm_term)", key: "term" },
  { label: "Контент (utm_content)", key: "content" },
  {
    key: "orders",
    label: "Заказов",
    format: (row) => row.orders ?? 0,
  },
  {
    key: "sum",
    label: "Сумма",
    format: (row) => row.sum ?? 0,
  },
  {
    key: "avg",
    label: "Средний чек",
    format: (row) => row.avg ?? 0,
  },
];

export const StatsRow = memo(function StatsRow({
  label,
  node,
  depth,
  path,
  expanded,
  toggle,
  onChannelClick, // optional
}) {
  const hasChildren = Object.keys(node._children).length > 0;
  const isOpen = !!expanded[path];

  const { orders, sum, order_ids } = node._stats;
  const avg = orders ? sum / orders : 0;

  const isClickable = typeof onChannelClick === "function";

  return (
    <>
      <TableRow>
        <TableCell sx={{ width: COL_WIDTHS.label }}>
          <Box
            sx={{
              pl: `${depth * ROW_INDENT}px`,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {hasChildren && (
              <IconButton
                size="small"
                onClick={() => toggle(path)}
              >
                {isOpen ? <Remove /> : <Add />}
              </IconButton>
            )}

            {isClickable ? (
              <Typography
                component="span"
                sx={{
                  cursor: "pointer",
                  color: "primary.main",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: "3px",
                  fontWeight: 500,
                }}
                onClick={() => onChannelClick(label)}
              >
                {label}
              </Typography>
            ) : (
              <Typography>{label}</Typography>
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ width: COL_WIDTHS.orders }}>
          <ShowOrdersButton
            orders={order_ids}
            modalTitle={`Все ${label}`}
          />
        </TableCell>

        <TableCell sx={{ width: COL_WIDTHS.sum }}>{formatRUR(sum)}</TableCell>

        <TableCell sx={{ width: COL_WIDTHS.avg }}>{formatRUR(avg)}</TableCell>
      </TableRow>

      {hasChildren && (
        <TableRow>
          <TableCell
            colSpan={4}
            sx={{ p: 0 }}
          >
            <Collapse
              in={isOpen}
              timeout="auto"
              unmountOnExit
            >
              <Table size="small">
                <TableBody>
                  {Object.entries(node._children).map(([key, child]) => {
                    const childPath = `${path}|${key}`;
                    return (
                      <StatsRow
                        key={childPath}
                        label={key}
                        node={child}
                        depth={depth + 1}
                        path={childPath}
                        expanded={expanded}
                        toggle={toggle}
                        // onChannelClick={onChannelClick}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
});
