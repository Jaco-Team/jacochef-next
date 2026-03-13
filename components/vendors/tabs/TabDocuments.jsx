"use client";

import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { MyTextInput } from "@/ui/Forms";
import { useVendorDetails } from "../VendorDetailsContext";

const fileIcon = (filename) => {
  const extension = (filename || "").split(".").pop()?.toLowerCase();
  const IconComponent = extension === "pdf" ? PictureAsPdfIcon : InsertDriveFileOutlinedIcon;
  return (
    <IconComponent
      fontSize="large"
      sx={{
        color: extension === "pdf" ? "error.main" : "text.secondary",
      }}
    />
  );
};

const renderFilename = (decl) =>
  decl.filename?.split("/")?.pop() || decl.url?.split("/")?.pop() || "Декларация";

export default function TabDocuments() {
  const {
    filteredVendorDeclarations,
    documentsFilter,
    setDocumentsFilter,
    openDocModal,
    vendorItems,
    handleUnbindDeclaration,
    handleDeleteDeclaration,
    isDeclarationWorking,
  } = useVendorDetails();

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          Документы поставщика
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
        >
          <MyTextInput
            label="Поиск по названию"
            value={documentsFilter}
            func={(event) => setDocumentsFilter(event.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Button
            variant="contained"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={openDocModal}
            disabled={!vendorItems.length}
          >
            Добавить декларацию
          </Button>
        </Stack>
      </Stack>

      {filteredVendorDeclarations.length ? (
        <Stack spacing={2}>
          {filteredVendorDeclarations.map((decl) => (
            <Card
              key={decl.id}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ flex: 1 }}
                  >
                    {fileIcon(decl.filename || decl.url)}
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">{renderFilename(decl)}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {decl.item_name} · {decl.created_at || "Дата не указана"}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                  >
                    <Button
                      component="a"
                      href={decl.url}
                      target="_blank"
                      rel="noreferrer"
                      size="small"
                      startIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ textTransform: "none" }}
                    >
                      Открыть
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleUnbindDeclaration(decl.id)}
                      disabled={isDeclarationWorking}
                      sx={{ textTransform: "none" }}
                    >
                      Отвязать
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteDeclaration(decl.id)}
                      disabled={isDeclarationWorking}
                      sx={{ textTransform: "none" }}
                    >
                      Удалить
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
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
