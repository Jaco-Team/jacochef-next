import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { V2Surface } from "@/ui/v2";

function ErrorTableCard({ title, children }) {
  return (
    <V2Surface sx={{ borderRadius: "12px", overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #ECECEC" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#3C3B3B" }}>{title}</Typography>
      </Box>
      <TableContainer>{children}</TableContainer>
    </V2Surface>
  );
}

export default function StaffScheduleErrorsSection({ errors, onOpenOrderError, onOpenCamError }) {
  const orderErrors = errors?.orders ?? [];
  const camErrors = errors?.cam ?? [];

  if (!orderErrors.length && !camErrors.length) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {orderErrors.length ? (
        <ErrorTableCard title="Ошибки заказов">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Номер заказа</TableCell>
                <TableCell>Дата заказа</TableCell>
                <TableCell>Ошибка</TableCell>
                <TableCell>Довоз</TableCell>
                <TableCell>Сумма ошибки</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orderErrors.map((item) => (
                <TableRow
                  key={`${item?.id}-${item?.row_id}`}
                  hover
                  onClick={() => onOpenOrderError?.(item)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: Number(item?.is_delete) === 1 ? "#FFE3E3" : "#FFFFFF",
                  }}
                >
                  <TableCell>{item?.order_id ?? "—"}</TableCell>
                  <TableCell>{item?.date_time_order ?? "—"}</TableCell>
                  <TableCell>{item?.err_name ?? "—"}</TableCell>
                  <TableCell align="center">
                    {Number(item?.new_order_id) > 0 ? (
                      <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: "#666666" }} />
                    ) : null}
                  </TableCell>
                  <TableCell>{item?.my_price ?? "—"}</TableCell>
                  <TableCell align="center">
                    {Number(item?.new_status) === 1 && Number(item?.is_edit) === 1 ? (
                      <InfoOutlinedIcon sx={{ fontSize: 18, color: "#666666" }} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ErrorTableCard>
      ) : null}

      {camErrors.length ? (
        <ErrorTableCard title="Ошибки камер">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Дата время совершения ошибки</TableCell>
                <TableCell>Ошибка</TableCell>
                <TableCell>Сумма ошибки</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {camErrors.map((item, index) => (
                <TableRow
                  key={item?.id || index}
                  hover
                  onClick={() => onOpenCamError?.(item)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: Number(item?.is_delete) === 1 ? "#FFE3E3" : "#FFFFFF",
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item?.date_time_fine ?? "—"}</TableCell>
                  <TableCell>{item?.fine_name ?? "—"}</TableCell>
                  <TableCell>{item?.price ?? "—"}</TableCell>
                  <TableCell align="center">
                    {Number(item?.is_edit) === 1 ? (
                      <InfoOutlinedIcon sx={{ fontSize: 18, color: "#666666" }} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ErrorTableCard>
      ) : null}
    </Stack>
  );
}
