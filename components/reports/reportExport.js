export function getVisibleExportColumns(columnOptions, isColumnVisible) {
  return columnOptions
    .filter((column) => {
      if (column.alwaysVisible) {
        return true;
      }

      return typeof isColumnVisible === "function" ? isColumnVisible(column.key) : true;
    })
    .map((column) => ({
      key: column.key,
      label: column.label,
    }));
}

export function mapExportRow(item, columns) {
  const total = item?.total || {};
  const row = {};

  columns.forEach(({ key }) => {
    if (key === "num") {
      row.num = item?.num ?? null;
      return;
    }

    if (key === "name") {
      row.name = item?.name ?? null;
      return;
    }

    row[key] = total?.[key] ?? null;
  });

  return row;
}

export function mapExportTotals(totals, columns) {
  if (!totals) {
    return null;
  }

  const row = {};

  columns.forEach(({ key }) => {
    if (key === "num") {
      row.num = null;
      return;
    }

    if (key === "name") {
      row.name = "Итого";
      return;
    }

    row[key] = totals?.[key] ?? null;
  });

  return row;
}

export function buildReportExportPayload({ filters, columnOptions, isColumnVisible, data }) {
  const columns = getVisibleExportColumns(columnOptions, isColumnVisible);
  const pointTables = (Array.isArray(data?.points) ? data.points : []).map((point) => ({
    title: point?.name || "Кафе",
    point_id: point?.id ?? null,
    point_name: point?.name ?? null,
    rows: (point?.items || []).map((item) => mapExportRow(item, columns)),
    totals: mapExportTotals(point?.totals || null, columns),
  }));

  const totalTable = {
    title: "Все выбранные кафе",
    point_id: null,
    point_name: null,
    rows: (data?.total?.items || []).map((item) => mapExportRow(item, columns)),
    totals: mapExportTotals(data?.total?.totals || null, columns),
  };

  return {
    dateStart: filters?.dateStart || null,
    dateEnd: filters?.dateEnd || null,
    points: Array.isArray(filters?.points) ? filters.points : [],
    columns,
    total: totalTable,
    points_tables: pointTables,
    tables: [totalTable, ...pointTables],
  };
}

export function downloadBlobFile(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
