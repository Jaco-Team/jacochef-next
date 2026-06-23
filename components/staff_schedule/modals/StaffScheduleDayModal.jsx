import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

function SectionCard({ title, children }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: 2 }}
    >
      <Typography
        variant="subtitle2"
        sx={{ mb: 1.5, fontWeight: 700 }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default function StaffScheduleDayModal({ modal, onClose }) {
  return (
    <StaffScheduleResponsiveModal
      open={modal.open}
      onClose={onClose}
      title={modal.data?.title || "Смена за день"}
      maxWidth="md"
    >
      <Stack spacing={2}>
        {modal.error ? <Alert severity="error">{modal.error}</Alert> : null}

        {modal.loading ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <CircularProgress
              size={28}
              sx={{ mb: 1.5 }}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Загрузка данных сотрудника...
            </Typography>
          </Box>
        ) : null}

        {!modal.loading && modal.data ? (
          <>
            {modal.data.subtitle ? (
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                {modal.data.subtitle}
              </Typography>
            ) : null}

            {modal.data.loadLabel || modal.data.bonusLabel ? (
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, p: 2 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  {modal.data.loadLabel ? (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                        Нагрузка
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                        {modal.data.loadLabel}
                      </Typography>
                    </Box>
                  ) : null}
                  {modal.data.bonusLabel ? (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                        Бонус
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                        {modal.data.bonusLabel}
                      </Typography>
                    </Box>
                  ) : null}
                </Stack>
              </Paper>
            ) : null}

            <SectionCard title="Часы">
              {!modal.data.hours.length ? (
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Нет отмеченных часов за выбранный день.
                </Typography>
              ) : (
                <List disablePadding>
                  {modal.data.hours.map((item, index) => (
                    <Box key={item.id}>
                      <ListItem
                        disableGutters
                        sx={{ py: 1 }}
                      >
                        <ListItemText
                          primary={item.label}
                          secondary={item.appName || null}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 13 }}
                        />
                      </ListItem>
                      {index < modal.data.hours.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                </List>
              )}
            </SectionCard>

            {modal.data.history.length ? (
              <SectionCard title="История">
                <Stack spacing={1.5}>
                  {modal.data.history.map((historyItem) => (
                    <Paper
                      key={historyItem.id}
                      variant="outlined"
                      sx={{ borderRadius: 2, p: 1.5 }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
                        {historyItem.title}
                      </Typography>
                      <Stack spacing={0.75}>
                        {historyItem.items.map((item) => (
                          <Typography
                            key={item.id}
                            sx={{
                              fontSize: 13,
                              color: item.appName ? "text.primary" : "text.secondary",
                            }}
                          >
                            {[item.label, item.appName].filter(Boolean).join(" · ")}
                          </Typography>
                        ))}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </SectionCard>
            ) : null}
          </>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
