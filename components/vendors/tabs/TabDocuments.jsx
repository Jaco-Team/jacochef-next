"use client";

import { useMemo, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import useSortTable from "@/src/hooks/useSortTable";
import { useConfirm } from "@/src/hooks/useConfirm";
import FileTypeIcon from "@/ui/FileTypeIcon";
import { MyTextInput } from "@/ui/Forms";
import { getDeclarationDisplayFilename } from "../declarationFileName";
import useVendorDocumentsView from "../useVendorDocumentsView";
import useVendorsStore from "../useVendorsStore";

const TABLE_COLUMNS = [
  { id: "filename_sort", label: "Файл" },
  { id: "item_name_sort", label: "Продукт" },
  { id: "type_sort", label: "Тип" },
  { id: "created_at_sort", label: "Дата" },
  { id: "size_sort", label: "Размер" },
  { id: "actions", label: "Действия", sortable: false, align: "right" },
];

const getFileExtension = (value) => {
  const extension = (value || "").split(".").pop()?.toLowerCase();
  return extension && extension !== value?.toLowerCase() ? extension : "";
};

const renderFilename = (decl) => getDeclarationDisplayFilename(decl);

const formatFileType = (decl) => {
  const extension = getFileExtension(decl.filename || decl.url);
  return extension ? extension.toUpperCase() : "Не указан";
};

const formatFileSize = (decl) => {
  if (typeof decl.filesize !== "number" || Number.isNaN(decl.filesize) || decl.filesize <= 0) {
    return "Не указан";
  }

  const units = ["Б", "КБ", "МБ", "ГБ"];
  let value = decl.filesize;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const fractionDigits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(fractionDigits)} ${units[unitIndex]}`;
};

const getSortTimestamp = (decl) => {
  const timestamp = Date.parse(decl.created_at || "");
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getSortSize = (decl) =>
  typeof decl.filesize === "number" && !Number.isNaN(decl.filesize) && decl.filesize > 0
    ? decl.filesize
    : null;

const downloadDeclarationFile = (decl) => {
  if (!decl?.url) {
    return;
  }

  const link = document.createElement("a");
  link.href = decl.url;
  link.download = renderFilename(decl);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fileLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1.25,
  maxWidth: "100%",
  color: "inherit",
  width: "auto",
  cursor: "pointer",
};

export default function TabDocuments({
  canEdit,
  canUpload,
  handleDeleteDeclaration,
  handleUnbindDeclaration,
  openDocModal,
}) {
  const { ConfirmDialog, withConfirm } = useConfirm();
  const [documentsFilter, setDocumentsFilter] = useState("");
  const { vendorDeclarations, vendorItems } = useVendorDocumentsView();
  const isLoading = useVendorsStore((state) => state.isLoading);
  const filteredVendorDeclarations = useMemo(() => {
    const normalizedFilter = documentsFilter.trim().toLowerCase();

    if (!normalizedFilter) {
      return vendorDeclarations;
    }

    return vendorDeclarations.filter((decl) => {
      const fileName = (decl.filename || decl.url || "").toLowerCase();
      const itemName = (decl.item_name || "").toLowerCase();

      return fileName.includes(normalizedFilter) || itemName.includes(normalizedFilter);
    });
  }, [documentsFilter, vendorDeclarations]);

  const sortableRows = useMemo(
    () =>
      filteredVendorDeclarations.map((decl) => ({
        ...decl,
        filename_sort: renderFilename(decl).toLowerCase(),
        item_name_sort: (decl.item_name || "").toLowerCase(),
        type_sort: formatFileType(decl).toLowerCase(),
        created_at_sort: getSortTimestamp(decl),
        size_sort: getSortSize(decl),
      })),
    [filteredVendorDeclarations],
  );

  const { handleSort, order, orderBy, sortedRows } = useSortTable(sortableRows, "created_at_sort");

  const handleOpenFile = (url) => {
    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Stack spacing={2}>
      <ConfirmDialog />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        // alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          Декларации поставщика
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
        >
          <MyTextInput
            label="Поиск по названию"
            value={documentsFilter}
            func={(event) => setDocumentsFilter(event.target.value)}
            sx={{ minWidth: 220 }}
          />
          {canUpload ? (
            <Button
              variant="contained"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={openDocModal}
              disabled={!vendorItems.length}
              sx={{ whiteSpace: "nowrap", minWidth: 160 }}
            >
              Добавить
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {filteredVendorDeclarations.length ? (
        <Card
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          <TableContainer sx={{ maxHeight: "60dvh" }}>
            <Table
              stickyHeader
              size="small"
            >
              <TableHead>
                <TableRow>
                  {TABLE_COLUMNS.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sortDirection={orderBy === column.id ? order : false}
                      sx={{
                        fontWeight: 700,
                        bgcolor: "background.paper",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column.sortable === false ? (
                        column.label
                      ) : (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : "asc"}
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map((decl) => (
                  <TableRow
                    key={decl.entry_id}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: 0 },
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <TableCell sx={{ minWidth: 260 }}>
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={fileLinkSx}
                        onClick={() => handleOpenFile(decl.url)}
                      >
                        <FileTypeIcon
                          extension={getFileExtension(decl.filename || decl.url)}
                          sx={{ fontSize: 30, flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, wordBreak: "break-word" }}
                        >
                          {renderFilename(decl)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 220 }}>{decl.item_name || "Не указан"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatFileType(decl)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {decl.created_at || "Не указана"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatFileSize(decl)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Скачать">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => downloadDeclarationFile(decl)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {canEdit ? (
                          <Tooltip title="Отвязать">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleUnbindDeclaration(decl.id, decl.item_id)}
                                disabled={isLoading}
                              >
                                <LinkOffIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}
                        {canUpload && canEdit ? (
                          <Tooltip title="Удалить">
                            <span>
                              <IconButton
                                size="small"
                                onClick={withConfirm(
                                  () => handleDeleteDeclaration(decl.id),
                                  "Удалить декларацию без возможности восстановления?",
                                )}
                                disabled={isLoading}
                                sx={{ color: "primary.main" }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          <CardContent>
            <Typography color="text.secondary">
              Декларации пока не добавлены. Загрузите файл через форму выше.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
