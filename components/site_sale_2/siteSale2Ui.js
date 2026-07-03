import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

const NAV_LINKS = [
  { href: "/site_sale_2/new", label: "Новый промокод", primary: true },
  { href: "/site_sale_2/stat", label: "Статистика" },
  { href: "/site_sale_2/stat_list", label: "Выписанные промокоды" },
  { href: "/site_sale_2/analitic_list", label: "Аналитика по выписанным промокодам" },
  { href: "/site_sale_2/repeat_orders", label: "Повторные заказы с промокода" },
];

export function SiteSale2Page({ children, title, subtitle }) {
  return (
    <Box
      sx={{
        mt: { xs: 9, sm: 10 },
        px: { xs: 2, sm: 3 },
        pb: 4,
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 700, fontSize: { xs: 24, sm: 32 } }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75 }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}

export function SiteSale2Nav() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        mb: 2.5,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 1.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        Разделы
      </Typography>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        sx={{ gap: 1 }}
      >
        {NAV_LINKS.map(({ href, label, primary }) => (
          <Link
            key={href}
            href={href}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant={primary ? "contained" : "outlined"}
              size="medium"
              sx={{
                fontWeight: 600,
                borderRadius: 1.5,
                ...(!primary && {
                  borderColor: "divider",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  },
                }),
              }}
            >
              {label}
            </Button>
          </Link>
        ))}
      </Stack>
    </Paper>
  );
}

export function SiteSale2Section({ title, subtitle, children, noPadding = false }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        mb: 2.5,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {title ? (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 700 }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      <Box sx={{ p: noPadding ? 0 : { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Paper>
  );
}

export function SiteSale2SearchBar({ children, onSearch }) {
  return (
    <SiteSale2Section
      title="Поиск промокодов"
      subtitle="Укажите город и/или название промокода"
    >
      <Grid
        container
        spacing={2}
        alignItems="flex-end"
      >
        {children}
        <Grid size={{ xs: 12, sm: 12, md: "auto" }}>
          <Button
            variant="contained"
            size="large"
            onClick={onSearch}
            sx={{ fontWeight: 700, minWidth: 140, width: { xs: "100%", md: "auto" } }}
          >
            Найти
          </Button>
        </Grid>
      </Grid>
    </SiteSale2Section>
  );
}

export function SiteSale2PromoTable({ rows, onDelete }) {
  if (!rows?.length) {
    return (
      <SiteSale2Section
        title="Результаты"
        noPadding
      >
        <Box
          sx={{
            py: 6,
            px: 2,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">Промокоды не найдены</Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5 }}
          >
            Измените параметры поиска и нажмите «Найти»
          </Typography>
        </Box>
      </SiteSale2Section>
    );
  }

  return (
    <SiteSale2Section
      title="Результаты"
      subtitle={`Найдено: ${rows.length}`}
      noPadding
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "grey.50",
                "& th": {
                  fontWeight: 700,
                  color: "text.secondary",
                  fontSize: 13,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 1.5,
                },
              }}
            >
              <TableCell>Промокод</TableCell>
              <TableCell>Город</TableCell>
              <TableCell align="right">Было кол-во</TableCell>
              <TableCell align="right">Ост. кол-во</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell
                align="center"
                width={56}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item, key) => (
              <TableRow
                key={key}
                hover
                sx={{
                  "&:last-child td": { borderBottom: 0 },
                  "& td": { py: 1.5 },
                }}
              >
                <TableCell>
                  <Link
                    href={"/site_sale_2/edit/" + item.id}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "primary.main",
                        "&:hover": { color: "primary.dark", textDecoration: "underline" },
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parseInt(item.city_id, 10) === 0 ? "Все города" : item.city_name}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{item.def_count}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: parseInt(item.count, 10) === 0 ? "error.main" : "text.primary",
                    }}
                  >
                    {item.count}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.date2}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={item.coment}
                  >
                    {item.coment}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    aria-label="Удалить промокод"
                    onClick={() => onDelete(item.id)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "error.main", bgcolor: "error.50" },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SiteSale2Section>
  );
}

export function SiteSale2DeleteDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
        }}
      >
        Удалить промокод?
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          Промокод будет удалён без возможности восстановления.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          sx={{ fontWeight: 700 }}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
