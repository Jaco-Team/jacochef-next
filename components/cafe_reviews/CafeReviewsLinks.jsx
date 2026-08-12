import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import { MySelect, MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import { EmptyState, formatDateTime, textSecondary } from "./shared";

const actionButtonSx = { minHeight: 40, borderRadius: "8px", textTransform: "none" };

function pointName(points, pointId) {
  return points.find((point) => String(point.id) === String(pointId))?.name || `Точка #${pointId}`;
}

export default function CafeReviewsLinks({
  links = [],
  points = [],
  canEdit,
  loading,
  onGenerate,
  onRevoke,
}) {
  const [pointId, setPointId] = useState("");
  const [zoneCode, setZoneCode] = useState("");
  const [zoneLabel, setZoneLabel] = useState("");
  const [uiVariant, setUiVariant] = useState("both");
  const [revokeTarget, setRevokeTarget] = useState(null);

  const pointOptions = useMemo(
    () => points.map((point) => ({ id: point.id, name: point.name })),
    [points],
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!pointId || !zoneCode.trim() || !canEdit) return;
    const created = await onGenerate({
      point_id: Number(pointId),
      zone_code: zoneCode.trim(),
      zone_label: zoneLabel.trim(),
      ui_variant: uiVariant,
    });
    if (created) {
      setZoneCode("");
      setZoneLabel("");
    }
  };

  const copy = async (value) => {
    if (value && navigator.clipboard) await navigator.clipboard.writeText(value);
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: "12px", mb: 2 }}
      >
        <Box
          component="form"
          onSubmit={submit}
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr 0.8fr auto" },
            alignItems: "end",
          }}
        >
          <MySelect
            label="Точка"
            data={pointOptions}
            value={pointId}
            func={(event) => setPointId(event.target.value)}
            is_none={false}
            disabled={!canEdit || loading}
          />
          <MyTextInput
            label="Код зоны"
            value={zoneCode}
            func={(event) => setZoneCode(event.target.value)}
            disabled={!canEdit || loading}
            inputProps={{ maxLength: 64, pattern: "[A-Za-z0-9_-]+" }}
          />
          <MyTextInput
            label="Название зоны"
            value={zoneLabel}
            func={(event) => setZoneLabel(event.target.value)}
            disabled={!canEdit || loading}
            inputProps={{ maxLength: 128 }}
          />
          <MySelect
            label="Вариант"
            data={[
              { id: "both", name: "Оба" },
              { id: "stars", name: "Звёзды" },
              { id: "emoji", name: "Эмоджи" },
            ]}
            value={uiVariant}
            func={(event) => setUiVariant(event.target.value)}
            is_none={false}
            disabled={!canEdit || loading}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<QrCode2OutlinedIcon />}
            disabled={!canEdit || loading || !pointId || !zoneCode.trim()}
            sx={actionButtonSx}
          >
            Создать QR
          </Button>
        </Box>
      </Paper>

      {links.length === 0 ? (
        <EmptyState>Активных QR-ссылок пока нет.</EmptyState>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: "12px" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Точка</TableCell>
                <TableCell>Зона</TableCell>
                <TableCell>Вариант</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell>Ссылки</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link) => (
                <TableRow
                  key={link.id}
                  hover
                >
                  <TableCell>{pointName(points, link.point_id)}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {link.zone_label || link.zone_code || "—"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: textSecondary }}
                    >
                      {link.zone_code || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={link.ui_variant || "both"}
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(link.created_at)}</TableCell>
                  <TableCell>
                    {(link.feedback_urls || []).map((url) => (
                      <Button
                        key={url}
                        size="small"
                        startIcon={<LinkOutlinedIcon />}
                        onClick={() => copy(url)}
                        sx={{ display: "block", textTransform: "none", textAlign: "left" }}
                      >
                        Скопировать {url.includes("/stars/") ? "звёзды" : "эмоджи"}
                      </Button>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setRevokeTarget(link)}
                      disabled={!canEdit || loading}
                      sx={actionButtonSx}
                    >
                      Отозвать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <MyModal
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Отозвать QR-ссылку"
        maxWidth="xs"
      >
        <DialogContent>
          Ссылка зоны «{revokeTarget?.zone_label || revokeTarget?.zone_code || "—"}» перестанет
          открывать форму. Историческая запись сохранится.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setRevokeTarget(null)}
            sx={actionButtonSx}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              const target = revokeTarget;
              setRevokeTarget(null);
              await onRevoke({ id: target.id, reason: "manual" });
            }}
            sx={actionButtonSx}
          >
            Отозвать
          </Button>
        </DialogActions>
      </MyModal>
    </>
  );
}
