"use client";

import { Button, Grid, Paper, Tabs, Tab, Typography, Box } from "@mui/material";
import { UploadFile, Download } from "@mui/icons-material";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { MyDatePickerNew } from "@/ui/Forms";
import { formatDate, formatYMD } from "@/src/helpers/ui/formatDate";
import useDDSStore from "../useDDSStore";
import useDDSParserStore from "../useDDSParserStore";
import TabPanel from "@/ui/TabPanel/TabPanel";
import TransactionsTable from "./TransactionsTable";
import { useEffect, useState } from "react";
import ArticlesTable from "./ArticlesTable";
import ModalArticleTransactions from "../modals/ModalArticleTransactions";
import useApi from "@/src/hooks/useApi";
import ModalPrepareTransactions from "../modals/ModalPrepareTransactions";
import ModalEditTransaction from "../modals/ModalEditTransaction";

export default function TabList({ showAlert }) {
  const { points, point, date_start, date_end, module, statsRefreshToken, stats } = useDDSStore();
  const setState = useDDSStore.setState;

  const { parsedData, updateState } = useDDSParserStore();
  const [currentTab, setCurrentTab] = useState(0);

  const [prepareTransactionsModalOpen, setPrepareTransactionsModalOpen] = useState(false);

  // const { withConfirm, ConfirmDialog } = useConfirm();

  const { api_upload, api_laravel } = useApi(module);
  const uploadBankStatement = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setState({ is_load: true });
      const res = await api_upload("parser/parse", file);
      if (!res?.st) {
        showAlert("Ошибка загрузки файла");
        return;
      }
      showAlert("Файл успешно загружен", true);
      updateState({ sessionId: res.session_id });

      await fetchParsedTransactions();
      console.log(res);
    } catch (error) {
      showAlert(error.message);
      return;
    } finally {
      setState({ is_load: false });
    }
  };

  async function downloadExportFile() {
    try {
      setState({ is_load: true });
      const request = {
        date_start: formatYMD(date_start),
        date_end: formatYMD(date_end),
        points: point,
      };
      const res = await api_laravel("export_stats", request, { responseType: "blob" });
      if (!res) {
        throw new Error(`Error!`);
      }
      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dds_stats_${request.date_start}-${request.date_end}.xlsx`;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      showAlert(e.message || "Произошла ошибка");
    } finally {
      setState({ is_load: false });
    }
  }

  async function fetchParsedTransactions() {
    try {
      setState({ is_load: true });
      const {
        sessionId,
        setParsedData,
        updateState,
        currentPage,
        perPage,
        query,
        sortBy,
        sortDir,
      } = useDDSParserStore.getState();
      const request = {
        session_id: sessionId,
        page: currentPage + 1,
        perpage: perPage,
        q: query,
        sort_by: sortBy,
        sort_dir: sortDir,
      };
      const parsedData = await api_laravel("parser/get", request);
      if (!parsedData?.transactions?.length) {
        throw new Error("Нет транзакций для загрузки");
      }
      setParsedData(parsedData.transactions);
      updateState({ total: parsedData.total });
      setPrepareTransactionsModalOpen(true);
    } catch (error) {
      showAlert(error.message || "Ошибка");
      return;
    } finally {
      setState({ is_load: false });
    }
  }

  async function getPeriodData() {
    const request = {
      date_start: formatYMD(date_start),
      date_end: formatYMD(date_end),
      points: point,
    };
    const res = await api_laravel("get_stats", request);
    if (!res?.st) {
      showAlert("Ошибка получения статистики");
      return;
    }
    setState({
      stats: res?.stats ?? null,
    });
  }

  useEffect(() => {
    if (!statsRefreshToken) return;
    getPeriodData();
  }, [statsRefreshToken]);

  return (
    <>
      <ModalPrepareTransactions
        open={prepareTransactionsModalOpen}
        onClose={() => setPrepareTransactionsModalOpen(false)}
        showAlert={showAlert}
      />
      <Paper sx={{ p: 3 }}>
        {/* <ConfirmDialog /> */}
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 8 }}>
            <Grid
              container
              spacing={2}
            >
              <Grid size={12}>
                <CityCafeAutocomplete2
                  label="Кафе"
                  points={points}
                  value={point}
                  onChange={(v) => setState({ point: v })} // if no point set - get all unassigned id 0
                  withAll
                  withAllSelected
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <MyDatePickerNew
                  func={(v) => setState({ date_start: formatDate(v) })}
                  value={date_start}
                  label="Начало периода"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <MyDatePickerNew
                  func={(v) => setState({ date_end: formatDate(v) })}
                  value={date_end}
                  label="Конец периода"
                />
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={getPeriodData}
                >
                  Показать
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                Загрузка банка
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFile />}
                  sx={{ height: 40 }}
                >
                  Выбрать файл .txt
                  <input
                    type="file"
                    multiple={false}
                    accept=".txt"
                    hidden
                    onInput={(e) => uploadBankStatement(e)}
                  />
                </Button>
                {parsedData?.length > 0 && (
                  <Button
                    variant="text"
                    component="label"
                    color={"theme.success"}
                    sx={{ height: 40 }}
                    onClick={() => setPrepareTransactionsModalOpen(true)}
                  >
                    Продолжить
                  </Button>
                )}
              </Box>

              <Button
                variant="contained"
                startIcon={<Download />}
                fullWidth
                sx={{ height: 40 }}
                onClick={downloadExportFile}
              >
                Скачать отчёт
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Inner tabs */}
        <Paper sx={{ mt: 4, mb: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_, id) => setCurrentTab(+id || 0)}
            variant="scrollable"
            scrollButtons={false}
          >
            <Tab
              key={"key"}
              value={0}
              label="Статьи"
            />
            <Tab
              key={"list"}
              value={1}
              disabled={!stats}
              label="Весь список"
            />
          </Tabs>
        </Paper>

        <TabPanel
          key={"key"}
          value={currentTab}
          index={0}
          id={0}
        >
          <ArticlesTable showAlert={showAlert} />
        </TabPanel>

        <TabPanel
          key={"list"}
          value={currentTab}
          index={1}
          id={1}
        >
          <TransactionsTable showAlert={showAlert} />
        </TabPanel>
        <ModalArticleTransactions showAlert={showAlert} />
        <ModalEditTransaction showAlert={showAlert} />
      </Paper>
    </>
  );
}
