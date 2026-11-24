import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import EmployeePositionModal from "@/components/employees/EmployeePositionModal";

const meta = {
  title: "Chef Design System/Modules/Employees/Position Modal",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

const mockPosition = {
  id: 17,
  name: "Программист",
  short_name: "Программист",
  bonus: 1000,
  unit_id: 4,
  is_graph: 0,
  is_office: 1,
};

const mockUnits = [
  { id: 1, name: "Управление" },
  { id: 4, name: "УК" },
  { id: 7, name: "Производство" },
];

const mockMenu = [
  {
    parent: { id: 1, name: "Админка" },
    chaild: [
      {
        modul_id: 1,
        key_query: "home",
        name: "Главная",
        is_active: 1,
        features: [],
      },
      {
        modul_id: 2,
        key_query: "news",
        name: "Новости",
        is_active: 1,
        features: [
          {
            id: 201,
            name: "Создание и удаление новостей",
            category: "",
            category_name: "",
            allow_access: 1,
            allow_view: 0,
            allow_edit: 0,
            access: 1,
            view: 0,
            edit: 0,
          },
        ],
      },
    ],
  },
  {
    parent: { id: 2, name: "Управление кафе" },
    chaild: [
      {
        modul_id: 10,
        key_query: "job_descriptions",
        name: "Должностные инструкции",
        is_active: 1,
        features: [
          {
            id: 1001,
            name: "Создание / редактирование / удаление инструкций",
            category: "general",
            category_name: "Общие права",
            allow_access: 1,
            allow_view: 0,
            allow_edit: 0,
            access: 1,
            view: 0,
            edit: 0,
          },
          {
            id: 1002,
            name: "Видно все должностные инструкции",
            category: "",
            category_name: "",
            allow_access: 1,
            allow_view: 0,
            allow_edit: 0,
            access: 1,
            view: 0,
            edit: 0,
          },
          {
            id: 1003,
            name: "Просмотр истории изменений",
            category: "history",
            category_name: "История",
            allow_access: 0,
            allow_view: 1,
            allow_edit: 0,
            access: 0,
            view: 1,
            edit: 0,
          },
        ],
      },
      {
        modul_id: 11,
        key_query: "employees",
        name: "Сотрудники",
        is_active: 1,
        features: [
          {
            id: 1101,
            name: "Просмотр сотрудников",
            category: "staff",
            category_name: "Сотрудники",
            allow_access: 1,
            allow_view: 1,
            allow_edit: 0,
            access: 0,
            view: 0,
            edit: 0,
          },
          {
            id: 1102,
            name: "Редактирование карточки сотрудника",
            category: "staff",
            category_name: "Сотрудники",
            allow_access: 1,
            allow_view: 1,
            allow_edit: 1,
            access: 0,
            view: 0,
            edit: 0,
          },
        ],
      },
      {
        modul_id: 12,
        key_query: "staff_schedule",
        name: "График работы",
        is_active: 0,
        features: [],
      },
    ],
  },
  {
    parent: { id: 3, name: "Статистика продаж" },
    chaild: [
      {
        modul_id: 20,
        key_query: "stat_time_orders",
        name: "Время приготовления заказов",
        is_active: 1,
        features: [
          {
            id: 2001,
            name: "Доступ к отчёту",
            category: "",
            category_name: "",
            allow_access: 1,
            allow_view: 1,
            allow_edit: 0,
            access: 1,
            view: 1,
            edit: 0,
          },
        ],
      },
      {
        modul_id: 21,
        key_query: "sales_summary",
        name: "Сводный отчёт",
        is_active: 0,
        features: [
          {
            id: 2101,
            name: "Просмотр отчёта",
            category: "",
            category_name: "",
            allow_access: 1,
            allow_view: 1,
            allow_edit: 0,
            access: 0,
            view: 0,
            edit: 0,
          },
        ],
      },
    ],
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

export function DesktopLayout() {
  const [open, setOpen] = useState(true);

  const request = async (method, data = {}) => {
    if (method === "get_position") {
      return {
        st: true,
        position: clone(mockPosition),
        units: clone(mockUnits),
        full_menu: clone(mockMenu),
        history: [],
      };
    }

    if (method === "get_position_delete_info") {
      return { st: true, users: [] };
    }

    if (method === "save_position") {
      return { st: true, position: clone(data.position), text: "Mock: должность сохранена" };
    }

    return { st: true, text: "Mock: действие выполнено" };
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef2f7", p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: 700 }}
      >
        Должности
      </Typography>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
      >
        Открыть должность
      </Button>
      <EmployeePositionModal
        open={open}
        positionId={mockPosition.id}
        canEdit
        request={request}
        showAlert={() => {}}
        onClose={() => setOpen(false)}
        onSaved={() => {}}
      />
    </Box>
  );
}
