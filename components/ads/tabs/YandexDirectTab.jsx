"use client";

import { useMemo } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useAdsStore } from "../useAdsStore";
import { MyDatePickerNew } from "@/ui/Forms";

function formatDate(v) {
  if (!v) return null;
  const d = v?.$d instanceof Date ? v.$d : v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function YandexDirectTab({ api_laravel, showAlert }) {
  const date_start = useAdsStore((s) => s.date_start);
  const date_end = useAdsStore((s) => s.date_end);
  const stats = useAdsStore((s) => s.stats);

  const setDates = useAdsStore((s) => s.setDates);
  const setLoading = useAdsStore((s) => s.setLoading);
  const setStats = useAdsStore((s) => s.setStats);

  const canSubmit = useMemo(() => !!date_start && !!date_end, [date_start, date_end]);

  const getStats = async () => {
    setLoading(true);
    try {
      const res = await api_laravel("get_stats", {
        provider: "yandex_direct",
        from: date_start,
        to: date_end,
      });
      if (!res?.st) throw new Error(res?.message || "Ошибка получения статистики");
      setStats(res);
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
    >
      <Grid size={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Yandex Direct</Typography>

              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, md: 4 }}>
                  <MyDatePickerNew
                    func={(v) => setDates({ date_start: formatDate(v) })}
                    value={date_start}
                    label="Начало периода"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <MyDatePickerNew
                    func={(v) => setDates({ date_end: formatDate(v) })}
                    value={date_end}
                    label="Конец периода"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack
                    direction="row"
                    justifyContent={{ xs: "flex-start", md: "flex-end" }}
                    alignItems="center"
                    sx={{ height: "100%" }}
                  >
                    <Button
                      variant="contained"
                      disabled={!canSubmit}
                      onClick={getStats}
                    >
                      Получить статистику
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{ opacity: 0.7, mb: 1 }}
            >
              Raw response
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
                overflow: "auto",
                fontSize: 12,
              }}
            >
              {stats ? JSON.stringify(stats, null, 2) : "—"}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
