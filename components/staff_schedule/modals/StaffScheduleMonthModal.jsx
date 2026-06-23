import { Alert, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import { MyDatePickerGraph } from "@/ui/Forms";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

const TYPE_META = {
  0: { label: "Полная смена", color: "#98e38d" },
  1: { label: "Первая половина", color: "#3dcef2" },
  2: { label: "Вторая половина", color: "#1560bd" },
  3: { label: "Другое", color: "#926eae" },
};

function getTypeMeta(type) {
  return TYPE_META[type] || { label: "Смена", color: "#CBD5E1" };
}

export default function StaffScheduleMonthModal({ modal, onClose }) {
  const monthValue = modal.request?.date || "";
  const daysMap = new Map((modal.data?.days || []).map((item) => [item.date, item]));

  const renderWeekPickerDay = (pickerDay) => {
    const date = dayjs(pickerDay.day).format("YYYY-MM-DD");
    const dayItem = daysMap.get(date);
    const typeMeta = getTypeMeta(dayItem?.type);

    return (
      <PickersDay
        {...pickerDay}
        day={pickerDay.day}
        disabled
        sx={{
          backgroundColor: dayItem ? typeMeta.color : "#ffffff",
          color: dayItem ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
          fontWeight: dayItem ? 700 : 400,
          "&.Mui-disabled": {
            color: dayItem ? "#ffffff" : "rgba(0, 0, 0, 0.38)",
            backgroundColor: dayItem ? typeMeta.color : "#ffffff",
          },
        }}
      />
    );
  };

  return (
    <StaffScheduleResponsiveModal
      open={modal.open}
      onClose={onClose}
      title={modal.data?.title || "Месячные часы"}
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
              Загрузка месячных часов...
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

            {!modal.data.days.length ? (
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, p: 2.5 }}
              >
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Нет отмеченных смен за выбранный месяц.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.25}>
                {monthValue ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      "& .MuiPickersLayout-root": { minWidth: 0 },
                      "& .MuiDayCalendar-header": { px: 1 },
                      "& .MuiPickersDay-root": { borderRadius: 1.5 },
                    }}
                  >
                    <MyDatePickerGraph
                      year={monthValue}
                      renderWeekPickerDay={renderWeekPickerDay}
                    />
                  </Paper>
                ) : null}

                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, p: 2 }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {Object.entries(TYPE_META).map(([key, value]) => (
                      <Stack
                        key={key}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 1,
                            backgroundColor: value.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                          {value.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>

                {modal.data.days.map((item) => {
                  const typeMeta = getTypeMeta(item.type);

                  return (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        p: 2,
                        borderLeft: "6px solid",
                        borderLeftColor: typeMeta.color,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                            {item.dateLabel}
                          </Typography>
                          <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>
                            {item.timeLabel}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            alignSelf: { xs: "flex-start", sm: "center" },
                            fontSize: 12,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          {typeMeta.label}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
