import React from "react";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Close } from "@mui/icons-material";

import { MyAutocomplite, MyTextInput, TextEditor } from "@/ui/Forms";
import HistoryLog from "@/ui/history/HistoryLog";
import { api_laravel, api_laravel_local } from "@/src/api_new";

const brandRed = "#DD1A32";
const blockBackground = "#F3F3F3";
const blockBorder = "#E5E5E5";
const textPrimary = "#3C3B3B";
const textSecondary = "#5E5E5E";
const selectedInstructionBackground = "#F3F3F3";
const newsPageSize = 5;
const journalFieldValueSx = {
  "& .MuiInputBase-input": {
    color: textPrimary,
    WebkitTextFillColor: textPrimary,
  },
  "& .MuiOutlinedInput-input": {
    color: textPrimary,
    WebkitTextFillColor: textPrimary,
    "&::placeholder": {
      color: "#BABABA",
      opacity: 1,
    },
  },
};
const journalAutocompleteFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    border: "1px solid #E5E5E5",
    color: textPrimary,
    backgroundColor: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#FFFFFF",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#E5E5E5",
      },
    },
    "&.Mui-focused": {
      color: textPrimary,
      backgroundColor: "#FFFFFF",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#E5E5E5",
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputBase-input": {
    color: textPrimary,
    WebkitTextFillColor: textPrimary,
    "&::placeholder": {
      color: "#BABABA",
      opacity: 1,
    },
  },
  "& .MuiInputLabel-root": {
    color: "#666666",
    backgroundColor: "#fff",
    paddingInline: "12px",
    borderRadius: "12px",
    "&.Mui-focused": {
      color: "#A6A6A6",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    display: "none",
  },
};

function getNewsTimestamp(item) {
  const date = item?.date || item?.date_create || "";
  const time = item?.time || item?.time_create || "";

  if (date && time) {
    return `${date} ${time}`;
  }

  return item?.date_time || date || time || "";
}

function safeOpen(link) {
  if (typeof window !== "undefined" && link) {
    window.open(link, "_blank", "noopener,noreferrer");
  }
}

function getHistoryType(type) {
  switch (parseInt(type)) {
    case 1:
      return "create";
    case 2:
      return "update";
    case 3:
      return "delete";
    default:
      return "update";
  }
}

function getHistoryAppsLabel(apps = []) {
  return [...apps]
    .sort((a, b) => parseInt(a?.id || 0) - parseInt(b?.id || 0))
    .map((item) => item?.name)
    .filter(Boolean)
    .join(", ");
}

function buildInstructionHistoryDiff(item, previousItem = null) {
  const itemType = parseInt(item?.type);
  const currentApps = getHistoryAppsLabel(item?.apps);
  const previousApps = getHistoryAppsLabel(previousItem?.apps);
  const currentName = item?.name || "";
  const previousName = previousItem?.name || "";
  const currentLink = item?.link || "";
  const previousLink = previousItem?.link || "";
  const diff = {};
  const appendDiff = (field, from, to) => {
    if (from !== to) {
      diff[field] = { from, to };
    }
  };

  if (itemType === 1) {
    appendDiff("Название", "", currentName);
    appendDiff("Ссылка", "", currentLink);
    appendDiff("Должности", "", currentApps);

    if (!Object.keys(diff).length) {
      diff["Изменения"] = { from: "", to: "Инструкция создана" };
    }

    return diff;
  }

  if (itemType === 3) {
    appendDiff("Название", currentName, "");
    appendDiff("Ссылка", currentLink, "");
    appendDiff("Должности", currentApps, "");

    if (!Object.keys(diff).length) {
      diff["Изменения"] = { from: "", to: "Инструкция удалена" };
    }

    return diff;
  }

  appendDiff("Название", previousName, currentName);
  appendDiff("Ссылка", previousLink, currentLink);
  appendDiff("Должности", previousApps, currentApps);

  if (!Object.keys(diff).length) {
    diff["Изменения"] = { from: "", to: "Инструкция обновлена" };
  }

  return diff;
}

function buildInstructionHistory(descHist = []) {
  const safeDescHist = Array.isArray(descHist) ? descHist : [];
  const groups = new Map();

  safeDescHist.forEach((item) => {
    const key = item?.desc_id;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  });

  const history = [];

  groups.forEach((items) => {
    const sortedItems = [...items].sort(
      (a, b) => parseInt(b?.hist_id || 0) - parseInt(a?.hist_id || 0),
    );

    sortedItems.forEach((item, index) => {
      const previousItem = sortedItems[index + 1] || null;

      history.push({
        id: item.hist_id,
        created_at: item.date_time_update,
        actor_name: item.user,
        event_type: getHistoryType(item.type),
        diff_json: JSON.stringify(buildInstructionHistoryDiff(item, previousItem)),
        meta_json: JSON.stringify({
          entity_type: "description",
          desc_id: item.desc_id,
        }),
      });
    });
  });

  return history.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime() || 0;
    const dateB = new Date(b.created_at).getTime() || 0;

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    return parseInt(b.id || 0) - parseInt(a.id || 0);
  });
}

function buildNewsHistoryDiff(item, previousItem = null) {
  const itemType = parseInt(item?.type);
  const currentText = item?.text || "";
  const previousText = previousItem?.text || "";
  const diff = {};

  if (itemType === 1) {
    if (currentText) {
      diff.text = { from: "", to: currentText };
    } else {
      diff["Изменения"] = { from: "", to: "Новость создана" };
    }

    return diff;
  }

  if (itemType === 3) {
    const deletedText = previousText || currentText;

    if (deletedText) {
      diff.text = { from: deletedText, to: "" };
    } else {
      diff["Изменения"] = { from: "", to: "Новость удалена" };
    }

    return diff;
  }

  if (currentText !== previousText) {
    diff.text = { from: previousText, to: currentText };
  } else {
    diff["Изменения"] = { from: "", to: "Новость обновлена" };
  }

  return diff;
}

function buildNewsHistory(newsHist = []) {
  const safeNewsHist = Array.isArray(newsHist) ? newsHist : [];
  const groups = new Map();

  safeNewsHist.forEach((item) => {
    const key = item?.news_id;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  });

  const history = [];

  groups.forEach((items) => {
    const sortedItems = [...items].sort(
      (a, b) => parseInt(b?.hist_id || 0) - parseInt(a?.hist_id || 0),
    );

    sortedItems.forEach((item, index) => {
      const previousItem = sortedItems[index + 1] || null;

      history.push({
        id: item.hist_id,
        created_at: item.date_time_update,
        actor_name: item.user,
        event_type: getHistoryType(item.type),
        diff_json: JSON.stringify(buildNewsHistoryDiff(item, previousItem)),
        meta_json: JSON.stringify({
          entity_type: "news",
          news_id: item.news_id,
        }),
      });
    });
  });

  return history.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime() || 0;
    const dateB = new Date(b.created_at).getTime() || 0;

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    return parseInt(b.id || 0) - parseInt(a.id || 0);
  });
}

function OutlineActionButton({ children, onClick, sx = {} }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        height: 40,
        px: 2,
        borderRadius: 1.5,
        borderColor: brandRed,
        color: brandRed,
        backgroundColor: "#fff",
        textTransform: "none",
        fontSize: 16,
        lineHeight: "20px",
        fontWeight: 400,
        whiteSpace: "nowrap",
        "&:hover": {
          borderColor: brandRed,
          backgroundColor: "#fff",
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

function InstructionListItem({ item, index, canEdit, onOpen, onEdit }) {
  return (
    <Box
      onClick={onOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: 52,
        px: 0.5,
        py: 0.5,
        borderBottom: `1px solid ${blockBorder}`,
        cursor: "pointer",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: "100%",
          minWidth: 0,
          px: 1.5,
          py: 0.75,
          mx: 0.5,
          mr: 1.5,
          borderRadius: 1.5,
          bgcolor: "transparent",
          transition: "background-color 0.15s ease",
          "&:hover": {
            bgcolor: selectedInstructionBackground,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: "20px",
            fontWeight: 500,
            color: textPrimary,
            whiteSpace: "nowrap",
          }}
        >
          {index + 1}.
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: "20px",
            fontWeight: 500,
            color: textPrimary,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </Typography>

        {canEdit ? (
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            size="small"
            sx={{
              ml: "auto",
              color: textSecondary,
              "&:hover": {
                bgcolor: "transparent",
                color: textPrimary,
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
}

function NewsCard({ item, canEdit, onEdit }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        borderBottom: `1px solid ${blockBorder}`,
        bgcolor: "#fff",
        pb: 1.5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pl: 1.5,
          minHeight: 40,
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: "20px",
            fontWeight: 400,
            color: textPrimary,
          }}
        >
          {item.user || "Обновление"}
        </Typography>

        {canEdit ? (
          <IconButton
            onClick={() => onEdit(item)}
            size="small"
            sx={{ color: textSecondary, width: 40, height: 40, borderRadius: 2 }}
          >
            <EditOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        ) : (
          <Box sx={{ width: 40, height: 40 }} />
        )}
      </Box>

      <Box
        sx={{
          px: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 400,
              color: textSecondary,
            }}
          >
            {getNewsTimestamp(item)}
          </Typography>
        </Box>

        <Typography
          component="div"
          sx={{
            fontSize: 16,
            lineHeight: "20px",
            color: textSecondary,
            wordBreak: "break-word",
            "& p": {
              mt: 0,
              mb: 1,
            },
            "& p:last-of-type": {
              mb: 0,
            },
          }}
          dangerouslySetInnerHTML={{ __html: item.text }}
        />
      </Box>
    </Paper>
  );
}

class JobDescriptions_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "job_descriptions",
      module_name: "",
      is_load: false,
      isMobile: false,
      selectedInstructionId: null,
      visibleNewsCount: newsPageSize,

      items: [],
      news: [],
      descHistory: [],
      newsHistory: [],
      modalDialog: false,
      modalDialogNew: false,
      modalDialogNews: false,
      modalDialogDeleteInstruction: false,
      modalDialogDeleteNews: false,

      itemsEdit: null,
      nameWork: "",

      itemsNew: null,
      chengeItemNew1: null,
      newText: "",
      newsEditItem: null,
      newsDeleteItem: null,
    };
  }

  async componentDidMount() {
    if (typeof window !== "undefined") {
      this.mobileMediaQuery = window.matchMedia("(max-width:767.95px)");
      this.handleViewportChange(this.mobileMediaQuery.matches);
      this.mobileMediaQuery.addEventListener("change", this.handleViewportChange);
    }

    const data = await this.getData("get_all");
    const firstItemId = data.items?.[0]?.id || null;

    this.setState({
      module_name: data.module_info.name,
      items: data.items,
      news: data.news,
      descHistory: buildInstructionHistory(data.desc_hist),
      newsHistory: buildNewsHistory(data.news_hist),
      visibleNewsCount: newsPageSize,
      selectedInstructionId: firstItemId,
      access: data.access,
    });

    document.title = data.module_info.name;
  }

  componentWillUnmount() {
    this.mobileMediaQuery?.removeEventListener("change", this.handleViewportChange);
  }

  handleViewportChange = (eventOrMatches) => {
    const isMobile = typeof eventOrMatches === "boolean" ? eventOrMatches : eventOrMatches.matches;

    this.setState((prevState) => (prevState.isMobile === isMobile ? null : { isMobile }));
  };

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return api_laravel_local(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });
  };

  async refreshPageData() {
    const data = await this.getData("get_all");

    this.setState((prevState) => ({
      items: data.items,
      news: data.news,
      descHistory: buildInstructionHistory(data.desc_hist),
      newsHistory: buildNewsHistory(data.news_hist),
      visibleNewsCount: Math.max(
        newsPageSize,
        Math.min(prevState.visibleNewsCount, data.news.length || newsPageSize),
      ),
      selectedInstructionId:
        data.items.find((item) => item.id === prevState.selectedInstructionId)?.id ||
        data.items?.[0]?.id ||
        null,
      access: data.access,
    }));
  }

  handleLoadMoreNews = () => {
    this.setState((prevState) => ({
      visibleNewsCount: prevState.visibleNewsCount + newsPageSize,
    }));
  };

  async saveEdit() {
    const { itemsEdit } = this.state;

    const res = await this.getData("save_edit", {
      work: itemsEdit.item,
    });

    if (res.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      modalDialog: false,
      modalDialogDeleteInstruction: false,
      itemsEdit: null,
      nameWork: "",
    });

    await this.refreshPageData();
  }

  async saveNew() {
    const { itemsNew } = this.state;

    const res = await this.getData("save_new", {
      work: itemsNew.item,
    });

    if (res.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      modalDialogNew: false,
      itemsNew: null,
    });

    await this.refreshPageData();
  }

  async saveNews() {
    const method = this.state.newsEditItem ? "update_news" : "save_new_news";
    const payload = this.state.newsEditItem
      ? {
          id: this.state.newsEditItem.id,
          text: this.state.newText,
        }
      : {
          text: this.state.newText,
        };

    const res = await this.getData(method, payload);

    if (res.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      modalDialogNews: false,
      newText: "",
      newsEditItem: null,
    });

    await this.refreshPageData();
  }

  async openWork(id) {
    const res = await this.getData("get_one", { id });

    this.setState({
      itemsEdit: res,
      modalDialog: true,
      nameWork: res.item.name,
    });
  }

  async deleteNews() {
    const newsId = this.state.newsDeleteItem?.id;

    if (!newsId) {
      return;
    }

    const res = await this.getData("delete_news", { id: newsId });

    if (res?.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      modalDialogDeleteNews: false,
      modalDialogNews: false,
      newsEditItem: null,
      newText: "",
      newsDeleteItem: null,
    });

    await this.refreshPageData();
  }

  async openNewWork() {
    const res = await this.getData("get_all_for_new");

    this.setState({
      itemsNew: res,
      modalDialogNew: true,
    });
  }

  openNews() {
    this.setState({
      modalDialogNews: true,
      newText: "",
      newsEditItem: null,
    });
  }

  openEditNews = (item) => {
    this.setState({
      modalDialogNews: true,
      newText: item?.text || "",
      newsEditItem: item,
    });
  };

  chengeItem(type, event) {
    const data = event.target.value;
    const item = this.state.itemsEdit;

    item.item[[type]] = data;

    this.setState({
      itemsEdit: item,
    });
  }

  chengeItemNew(type, event) {
    const data = event.target.value;
    const item = this.state.itemsNew;

    item.item[[type]] = data;

    this.setState({
      itemsNew: item,
    });
  }

  chengeItemNew1(type, event, data) {
    const item = this.state.itemsNew;

    item.item[[type]] = data.id;

    this.setState({
      itemsNew: item,
      chengeItemNew1: data,
    });
  }

  handleInstructionSelect(item) {
    this.setState({
      selectedInstructionId: item.id,
    });
  }

  handleInstructionOpen(item) {
    this.handleInstructionSelect(item);
    safeOpen(item.link);
  }

  handleInstructionEdit(item) {
    this.handleInstructionSelect(item);
    this.openWork(item.id);
  }

  closeEditModal = () => {
    this.setState({
      modalDialog: false,
      modalDialogDeleteInstruction: false,
      itemsEdit: null,
      nameWork: "",
    });
  };

  closeNewModal = () => {
    this.setState({
      modalDialogNew: false,
      itemsNew: null,
    });
  };

  closeNewsModal = () => {
    this.setState({
      modalDialogNews: false,
      newsEditItem: null,
      newText: "",
    });
  };

  openDeleteNewsConfirm = (item) => {
    this.setState({
      modalDialogDeleteNews: true,
      newsDeleteItem: item || this.state.newsEditItem,
    });
  };

  closeDeleteNewsConfirm = () => {
    this.setState({
      modalDialogDeleteNews: false,
      newsDeleteItem: null,
    });
  };

  openDeleteInstructionConfirm = () => {
    this.setState({
      modalDialogDeleteInstruction: true,
    });
  };

  closeDeleteInstructionConfirm = () => {
    this.setState({
      modalDialogDeleteInstruction: false,
    });
  };

  async deleteInstruction() {
    const id = this.state.itemsEdit?.item?.id;

    if (!id) {
      return;
    }

    const res = await this.getData("delete_descriptions", { id });

    if (res?.st === false) {
      alert(res.text);
      return;
    }

    this.setState({
      modalDialogDeleteInstruction: false,
      modalDialog: false,
      itemsEdit: null,
      nameWork: "",
    });

    await this.refreshPageData();
  }

  renderInstructionFormFields(mode) {
    const isEdit = mode === "edit";
    const formData = isEdit ? this.state.itemsEdit : this.state.itemsNew;

    if (!formData) {
      return null;
    }

    return (
      <Stack spacing={3}>
        <Box sx={{ pt: { xs: 0, sm: 2.5 } }}>
          <MyTextInput
            value={formData.item.name}
            func={
              isEdit ? this.chengeItem.bind(this, "name") : this.chengeItemNew.bind(this, "name")
            }
            label="Название"
            placeholder="Введите текст"
            customRI="journal"
            sx={journalFieldValueSx}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>

        <Box>
          <MyTextInput
            value={formData.item.link}
            func={
              isEdit ? this.chengeItem.bind(this, "link") : this.chengeItemNew.bind(this, "link")
            }
            label="Ссылка"
            placeholder="Укажите ссылку"
            customRI="journal"
            sx={journalFieldValueSx}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>

        <Box>
          <MyAutocomplite
            label="Должность"
            multiple={true}
            data={formData.apps}
            value={formData.item.app_id}
            placeholder="Выберите должность из списка"
            customRI="journal"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Должность"
                placeholder="Выберите должность из списка"
                sx={journalAutocompleteFieldSx}
              />
            )}
            func={(event, value) => {
              const stateKey = isEdit ? "itemsEdit" : "itemsNew";
              const nextData = this.state[stateKey];
              nextData.item.app_id = value;
              this.setState({ [stateKey]: nextData });
            }}
          />
        </Box>
      </Stack>
    );
  }

  renderInstructionFormActions(mode, mobile = false) {
    const isEdit = mode === "edit";

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          pt: mobile ? 0 : 5,
          mt: mobile ? 1.5 : 0,
        }}
      >
        <Box>
          {isEdit ? (
            <Button
              variant="outlined"
              onClick={this.openDeleteInstructionConfirm}
              sx={{
                height: 44,
                px: 2,
                borderRadius: 1.5,
                borderColor: brandRed,
                color: brandRed,
                backgroundColor: "#fff",
                textTransform: "none",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
                "&:hover": {
                  borderColor: brandRed,
                  backgroundColor: "#fff",
                },
              }}
            >
              Удалить
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            onClick={isEdit ? this.closeEditModal : this.closeNewModal}
            sx={{
              height: 44,
              px: 2,
              borderRadius: 1.5,
              borderColor: blockBorder,
              color: textSecondary,
              backgroundColor: "#fff",
              textTransform: "none",
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 400,
              "&:hover": {
                borderColor: blockBorder,
                backgroundColor: "#fff",
              },
            }}
          >
            Отменить
          </Button>
          <Button
            variant="contained"
            onClick={isEdit ? this.saveEdit.bind(this) : this.saveNew.bind(this)}
            sx={{
              height: 44,
              px: 2,
              borderRadius: 1.5,
              bgcolor: brandRed,
              boxShadow: "none",
              color: blockBackground,
              textTransform: "none",
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 500,
              "&:hover": {
                bgcolor: brandRed,
                boxShadow: "none",
              },
            }}
          >
            Сохранить
          </Button>
        </Box>
      </Box>
    );
  }

  renderMobileSheetShell({ open, onClose, title, children, bodySx = {} }) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            overflow: "hidden",
            backgroundColor: blockBackground,
            boxShadow: "none",
            minHeight: "82vh",
            maxHeight: "92vh",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.3)",
            },
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "#fff",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 0.5,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 4,
                borderRadius: 999,
                bgcolor: blockBorder,
              }}
            />
          </Box>
          <Box
            sx={{
              minHeight: 52,
              pl: 8,
              pr: 2,
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${blockBorder}`,
            }}
          >
            <Typography
              sx={{
                flex: 1,
                textAlign: "center",
                fontSize: 20,
                lineHeight: "26px",
                fontWeight: 400,
                color: textPrimary,
              }}
            >
              {title}
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                width: 48,
                height: 48,
                ml: 1,
                color: "#A6A6A6",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderRadius: "50%",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: blockBackground,
            p: 1.5,
            pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
            ...bodySx,
          }}
        >
          {children}
        </Box>
      </SwipeableDrawer>
    );
  }

  renderInstructionMobileSheet(mode) {
    const isEdit = mode === "edit";
    const open = isEdit ? this.state.modalDialog : this.state.modalDialogNew;
    const title = isEdit ? this.state.nameWork || "Новая инструкция" : "Новая инструкция";
    const onClose = isEdit ? this.closeEditModal : this.closeNewModal;

    return this.renderMobileSheetShell({
      open,
      onClose,
      title,
      children: (
        <Stack spacing={1.5}>
          {this.renderInstructionFormFields(mode)}
          {this.renderInstructionFormActions(mode, true)}
        </Stack>
      ),
    });
  }

  renderNewsActions(mode, mobile = false) {
    const isEdit = mode === "edit";

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          pt: mobile ? 0 : 0,
        }}
      >
        <Box>
          {isEdit ? (
            <Button
              variant="outlined"
              onClick={() => this.openDeleteNewsConfirm()}
              sx={{
                height: mobile ? 40 : 44,
                px: mobile ? 1.5 : 2,
                borderRadius: 1.5,
                borderColor: brandRed,
                color: brandRed,
                backgroundColor: "#fff",
                textTransform: "none",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
                "&:hover": {
                  borderColor: brandRed,
                  backgroundColor: "#fff",
                },
              }}
            >
              Удалить
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            onClick={this.closeNewsModal}
            sx={{
              height: mobile ? 40 : 44,
              px: mobile ? 1.5 : 2,
              borderRadius: 1.5,
              borderColor: blockBorder,
              color: textSecondary,
              backgroundColor: "#fff",
              textTransform: "none",
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 400,
              "&:hover": {
                borderColor: blockBorder,
                backgroundColor: "#fff",
              },
            }}
          >
            Отменить
          </Button>
          <Button
            variant="contained"
            onClick={this.saveNews.bind(this)}
            sx={{
              height: mobile ? 40 : 44,
              px: 2,
              borderRadius: 1.5,
              bgcolor: brandRed,
              boxShadow: "none",
              color: blockBackground,
              textTransform: "none",
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 500,
              "&:hover": {
                bgcolor: brandRed,
                boxShadow: "none",
              },
            }}
          >
            Сохранить
          </Button>
        </Box>
      </Box>
    );
  }

  renderNewsMobileSheet() {
    const isEdit = Boolean(this.state.newsEditItem);

    return this.renderMobileSheetShell({
      open: this.state.modalDialogNews,
      onClose: this.closeNewsModal,
      title: isEdit ? "Редактирование новости" : "Создание новости",
      children: (
        <Stack spacing={1.5}>
          <TextEditor
            value={this.state.newText}
            func={(text) => {
              this.setState({ newText: text });
            }}
            variant="newsDialogMobile"
          />
          {this.renderNewsActions(isEdit ? "edit" : "new", true)}
        </Stack>
      ),
    });
  }

  renderInstructionList(items, canEdit, mobile = false) {
    return (
      <Box>
        <Box sx={{ width: "100%" }}>
          {items.map((item, index) => (
            <InstructionListItem
              key={item.id}
              item={item}
              index={index}
              canEdit={canEdit}
              onOpen={() => this.handleInstructionOpen(item)}
              onEdit={() => this.handleInstructionEdit(item)}
            />
          ))}
        </Box>
      </Box>
    );
  }

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          sx={{ zIndex: 99 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {parseInt(this.state.access?.edit_description_access) == 0 ? null : this.state.isMobile ? (
          this.renderInstructionMobileSheet("edit")
        ) : (
          <Dialog
            open={this.state.modalDialog}
            maxWidth={false}
            onClose={this.closeEditModal}
            slotProps={{
              paper: {
                sx: {
                  width: "100%",
                  maxWidth: { xs: "calc(100vw - 20px)", sm: 800 },
                  borderRadius: 3,
                  m: { xs: 1.25, sm: 2 },
                  overflow: "hidden",
                  boxShadow: "none",
                },
              },
              backdrop: {
                sx: {
                  backgroundColor: "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            <DialogTitle
              sx={{
                minHeight: 48,
                px: 2,
                py: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: blockBackground,
                borderBottom: `1px solid ${blockBorder}`,
                color: textSecondary,
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
              }}
            >
              {this.state.nameWork || "Редактирование инструкции"}
              <IconButton
                onClick={this.closeEditModal}
                sx={{
                  width: 48,
                  height: 48,
                  mr: -1.5,
                  color: "#A6A6A6",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: "50%",
                  },
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent
              sx={{
                px: 2,
                pt: 2.5,
                pb: 0,
              }}
            >
              {this.renderInstructionFormFields("edit")}
            </DialogContent>
            <DialogActions
              sx={{
                px: 2,
                pb: 2,
                pt: 5,
              }}
            >
              {this.renderInstructionFormActions("edit")}
            </DialogActions>
          </Dialog>
        )}

        {!this.state.itemsNew ? null : this.state.isMobile ? (
          this.renderInstructionMobileSheet("new")
        ) : (
          <Dialog
            open={this.state.modalDialogNew}
            maxWidth={false}
            onClose={this.closeNewModal}
            slotProps={{
              paper: {
                sx: {
                  width: "100%",
                  maxWidth: { xs: "calc(100vw - 20px)", sm: 800 },
                  borderRadius: 3,
                  m: { xs: 1.25, sm: 2 },
                  overflow: "hidden",
                  boxShadow: "none",
                },
              },
              backdrop: {
                sx: {
                  backgroundColor: "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            <DialogTitle
              sx={{
                minHeight: 48,
                px: 2,
                py: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: blockBackground,
                borderBottom: `1px solid ${blockBorder}`,
                color: textSecondary,
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
              }}
            >
              Новая инструкция
              <IconButton
                onClick={this.closeNewModal}
                sx={{
                  width: 48,
                  height: 48,
                  mr: -1.5,
                  color: "#A6A6A6",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: "50%",
                  },
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent
              sx={{
                px: 2,
                pt: 2.5,
                pb: 0,
              }}
            >
              {this.renderInstructionFormFields("new")}
            </DialogContent>
            <DialogActions
              sx={{
                px: 2,
                pb: 2,
                pt: 5,
              }}
            >
              {this.renderInstructionFormActions("new")}
            </DialogActions>
          </Dialog>
        )}

        {this.state.isMobile ? (
          this.renderNewsMobileSheet()
        ) : (
          <Dialog
            open={this.state.modalDialogNews}
            maxWidth={false}
            onClose={this.closeNewsModal}
            slotProps={{
              paper: {
                sx: {
                  width: "100%",
                  maxWidth: { xs: "calc(100vw - 20px)", sm: 800 },
                  borderRadius: 3,
                  m: { xs: 1.25, sm: 2 },
                  overflow: "hidden",
                  boxShadow: "none",
                },
              },
              backdrop: {
                sx: {
                  backgroundColor: "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            <DialogTitle
              sx={{
                minHeight: 48,
                px: 2.5,
                py: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: blockBackground,
                borderBottom: `1px solid ${blockBorder}`,
                color: textSecondary,
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
              }}
            >
              {this.state.newsEditItem ? "Редактирование новости" : "Создание новости"}
              <IconButton
                onClick={this.closeNewsModal}
                sx={{
                  width: 48,
                  height: 48,
                  mr: -1.5,
                  color: "#A6A6A6",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: "50%",
                  },
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent
              sx={{
                px: 2.5,
                py: 2.5,
              }}
            >
              <Box
                sx={{
                  pt: 2,
                }}
              >
                <TextEditor
                  value={this.state.newText}
                  func={(text) => {
                    this.setState({ newText: text });
                  }}
                  variant="newsDialog"
                />
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                px: 2.5,
                pb: 2.5,
                pt: 0,
              }}
            >
              {this.renderNewsActions(this.state.newsEditItem ? "edit" : "new")}
            </DialogActions>
          </Dialog>
        )}

        <Dialog
          open={this.state.modalDialogDeleteInstruction}
          maxWidth={false}
          onClose={this.closeDeleteInstructionConfirm}
          slotProps={{
            paper: {
              sx: {
                width: "100%",
                maxWidth: { xs: "calc(100vw - 20px)", sm: 480 },
                borderRadius: 3,
                m: { xs: 1.25, sm: 2 },
                overflow: "hidden",
                boxShadow: "none",
              },
            },
            backdrop: {
              sx: {
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              minHeight: 48,
              px: 2.5,
              py: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: blockBackground,
              borderBottom: `1px solid ${blockBorder}`,
              color: textSecondary,
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 400,
            }}
          >
            Удалить инструкцию
            <IconButton
              onClick={this.closeDeleteInstructionConfirm}
              sx={{
                width: 48,
                height: 48,
                mr: -1.5,
                color: "#A6A6A6",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderRadius: "50%",
                },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              px: 2.5,
              pt: 2.5,
              pb: 0,
              marginTop: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: "20px",
                color: textSecondary,
              }}
            >
              {`Удалить инструкцию "${this.state.itemsEdit?.item?.name || ""}"? Действие нельзя отменить.`}
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              px: 2.5,
              pb: 2.5,
              pt: 4,
              gap: 1.5,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={this.closeDeleteInstructionConfirm}
              sx={{
                height: 44,
                px: 2,
                borderRadius: 1.5,
                borderColor: blockBorder,
                color: textSecondary,
                backgroundColor: "#fff",
                textTransform: "none",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
                "&:hover": {
                  borderColor: blockBorder,
                  backgroundColor: "#fff",
                },
              }}
            >
              Отменить
            </Button>
            <Button
              variant="contained"
              onClick={this.deleteInstruction.bind(this)}
              sx={{
                height: 44,
                px: 2,
                borderRadius: 1.5,
                bgcolor: brandRed,
                boxShadow: "none",
                color: blockBackground,
                textTransform: "none",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: brandRed,
                  boxShadow: "none",
                },
              }}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modalDialogDeleteNews}
          maxWidth={false}
          onClose={this.closeDeleteNewsConfirm}
          slotProps={{
            paper: {
              sx: {
                width: "100%",
                maxWidth: { xs: "calc(100vw - 20px)", sm: 480 },
                borderRadius: 3,
                m: { xs: 1.25, sm: 2 },
                overflow: "hidden",
                boxShadow: "none",
              },
            },
            backdrop: {
              sx: {
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              minHeight: 48,
              px: 2.5,
              py: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: blockBackground,
              borderBottom: `1px solid ${blockBorder}`,
              color: textSecondary,
              fontSize: 16,
              lineHeight: "20px",
              fontWeight: 400,
            }}
          >
            Удалить новость
            <IconButton
              onClick={this.closeDeleteNewsConfirm}
              sx={{
                width: 48,
                height: 48,
                mr: -1.5,
                color: "#A6A6A6",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderRadius: "50%",
                },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              px: 2.5,
              pt: 2.5,
              pb: 0,
              marginTop: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: "20px",
                color: textSecondary,
              }}
            >
              Удалить новость? Действие нельзя отменить.
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              px: 2.5,
              pb: 2.5,
              pt: 4,
              gap: 1.5,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={this.closeDeleteNewsConfirm}
              sx={{
                height: 44,
                px: 2,
                borderRadius: 1.5,
                borderColor: blockBorder,
                color: textSecondary,
                backgroundColor: "#fff",
                textTransform: "none",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 400,
                "&:hover": {
                  borderColor: blockBorder,
                  backgroundColor: "#fff",
                },
              }}
            >
              Отменить
            </Button>
            <Button
              variant="contained"
              onClick={() => this.deleteNews()}
              sx={{
                height: 44,
                px: 2,
                borderRadius: 1.5,
                bgcolor: brandRed,
                boxShadow: "none",
                color: blockBackground,
                textTransform: "none",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: brandRed,
                  boxShadow: "none",
                },
              }}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          className="container_first_child"
          sx={{
            px: { xs: 0, lg: 2.5 },
            pb: { xs: 0, lg: 3 },
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            style={{ marginBottom: 20 }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            container
            columnSpacing={{ xs: 0, lg: 2.5 }}
            sx={{ alignItems: "flex-start" }}
          >
            <Grid size={{ xs: 12, lg: 4.5 }}>
              <Box
                sx={{
                  px: { xs: 0, lg: 0 },
                  mx: { xs: -3, lg: 0 },
                  pb: { xs: 2, lg: 2 },
                }}
              >
                {parseInt(this.state.access?.edit_description_access) == 1 ? (
                  <OutlineActionButton
                    onClick={this.openNewWork.bind(this)}
                    sx={{ ml: { xs: 1.5, lg: 0 } }}
                  >
                    Добавить инструкцию
                  </OutlineActionButton>
                ) : null}

                <Box sx={{ mt: { xs: 1, lg: 2.5 }, px: { xs: 1.5, lg: 0 } }}>
                  <Box sx={{ display: { xs: "none", lg: "block" } }}>
                    {this.renderInstructionList(
                      this.state.items,
                      parseInt(this.state.access?.edit_description_access) == 1,
                      false,
                    )}
                  </Box>

                  <Box sx={{ display: { xs: "block", lg: "none" } }}>
                    <Box sx={{ mt: 1 }}>
                      {this.renderInstructionList(
                        this.state.items,
                        parseInt(this.state.access?.edit_description_access) == 1,
                        true,
                      )}
                    </Box>
                  </Box>
                </Box>

                {parseInt(this.state.access?.edit_description_access) == 1 &&
                this.state.descHistory.length > 0 ? (
                  <Box sx={{ mt: 3, px: { xs: 1.5, lg: 0 } }}>
                    <HistoryLog
                      history={this.state.descHistory}
                      title="История должностных инструкций"
                    />
                  </Box>
                ) : null}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 7.5 }}>
              <Box
                sx={{
                  bgcolor: blockBackground,
                  borderRadius: { xs: 0, lg: 3 },
                  mx: { xs: -3, lg: 0 },
                  px: { xs: 1.5, lg: 2 },
                  py: { xs: 2, lg: 2 },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: { xs: 2.5, lg: 2 } }}
                >
                  <Typography
                    sx={{
                      fontSize: 20,
                      lineHeight: "24px",
                      fontWeight: 400,
                      color: textPrimary,
                    }}
                  >
                    Новости
                  </Typography>

                  {parseInt(this.state.access?.edit_news_access) == 1 ? (
                    <OutlineActionButton
                      onClick={this.openNews.bind(this)}
                      sx={{ minWidth: { xs: 115, lg: "auto" }, px: { xs: 1.5, lg: 2 } }}
                    >
                      Добавить новость
                    </OutlineActionButton>
                  ) : null}
                </Stack>

                <Stack spacing={{ xs: 1.5, lg: 1.5 }}>
                  {this.state.news.length > 0 ? (
                    this.state.news.slice(0, this.state.visibleNewsCount).map((item, index) => (
                      <NewsCard
                        key={`${item.id || index}-news`}
                        item={item}
                        canEdit={parseInt(this.state.access?.edit_news_access) == 1}
                        onEdit={this.openEditNews}
                      />
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 16, lineHeight: "20px", color: textSecondary }}>
                      Пока нет новостей.
                    </Typography>
                  )}
                </Stack>

                {this.state.news.length > this.state.visibleNewsCount ? (
                  <Button
                    variant="text"
                    onClick={this.handleLoadMoreNews}
                    sx={{
                      mt: 2,
                      px: 0,
                      minWidth: 0,
                      textTransform: "none",
                      color: brandRed,
                      fontSize: 16,
                      lineHeight: "20px",
                      fontWeight: 400,
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                      "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Загрузить ещё
                  </Button>
                ) : null}

                {parseInt(this.state.access?.edit_news_access) == 1 &&
                this.state.newsHistory.length > 0 ? (
                  <Box sx={{ mt: 3 }}>
                    <HistoryLog
                      history={this.state.newsHistory}
                      title="История новостей"
                    />
                  </Box>
                ) : null}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }
}

export default function JobDescriptions() {
  return <JobDescriptions_ />;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
