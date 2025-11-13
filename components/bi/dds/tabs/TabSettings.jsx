"use client";

import {
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { UploadFile, Add, Edit, Delete } from "@mui/icons-material";
import { useConfirm } from "@/src/hooks/useConfirm";

export default function TabSettings() {
  const rows = [
    {
      name: "Выручка от покупателей",
      group: "Операционные поступления",
      type: "Основная деятельность",
      op: "от покупателя",
      uses: 45,
      updated: "15.01.2024",
    },
    {
      name: "Закупка продуктов",
      group: "Операционные платежи",
      type: "Себестоимость",
      op: "поставщику",
      uses: 32,
      updated: "15.01.2024",
    },
    {
      name: "Аренда помещений",
      group: "Операционные платежи",
      type: "Постоянные расходы",
      op: "на расходы",
      uses: 12,
      updated: "15.01.2024",
    },
    {
      name: "Зарплата сотрудников",
      group: "Операционные платежи",
      type: "ФОТ",
      op: "на расходы",
      uses: 28,
      updated: "15.01.2024",
    },
    {
      name: "Возврат от поставщиков",
      group: "Операционные поступления",
      type: "Прочие доходы",
      op: "прочие поступления",
      uses: 3,
      updated: "16.01.2024",
    },
  ];

  const { withConfirm, ConfirmDialog } = useConfirm();

  return (
    <Paper sx={{ p: 3 }}>
      <ConfirmDialog />

      {/* Upload block */}
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Загрузка справочника статей
        </Typography>

        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid
            xs={12}
            md={8}
          >
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              sx={{ justifyContent: "flex-start", height: 40 }}
            >
              Выбрать файл
              <input
                type="file"
                hidden
                onChange={(e) => console.log(e.target.files)}
              />
            </Button>
          </Grid>

          <Grid
            xs={12}
            md="auto"
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ height: 40, whiteSpace: "nowrap" }}
            >
              Добавить статью
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reference table */}
      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Справочник статей ДДС
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Наименование</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Группа</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Тип показателя</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Вид операции</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Использований</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Обновлено</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r, i) => {
                const isIncome = r.group.includes("поступления");
                const color = isIncome ? "success.main" : "primary.main";

                return (
                  <TableRow
                    key={i}
                    hover
                  >
                    <TableCell>{r.name}</TableCell>
                    <TableCell sx={{ color }}>{r.group}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.op}</TableCell>
                    <TableCell>{r.uses}</TableCell>
                    <TableCell>{r.updated}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        sx={{ color: "text.secondary" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={withConfirm(
                          () => console.log(`DELETED ${r.name}`),
                          `Точно удалить ${r.name}?`,
                          3,
                        )}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Paper>
  );
}
