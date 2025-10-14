import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Rating,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Typography,
  Modal,
  Box,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
  CheckBoxOutlineBlank,
  LocalOffer,
  MonetizationOn,
  Notes,
  PlaylistAddCheck,
  StarBorder,
  TextFields,
  Title,
  ViewAgenda,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { useRouter } from "next/router";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MyAlert from "@/ui/MyAlert";

function FormElementCard({ children, ...props }) {
  return (
    <Paper
      {...props}
      sx={(theme) => ({
        marginBottom: theme.spacing(3),
        padding: theme.spacing(3),
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
        },
      })}
    >
      {children}
    </Paper>
  );
}

const PresetModal = ({ open, onClose, onSave }) => {
  const [newPreset, setNewPreset] = useState({
    label: "",
    param: "",
  });

  const [errors, setErrors] = useState({
    label: false,
    param: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPreset((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {
      label: !newPreset.label,
      param: !newPreset.param,
    };

    setErrors(newErrors);

    if (!newPreset.label || !newPreset.param) {
      return;
    }

    onSave(newPreset);
    handleClose();
  };

  const handleClose = () => {
    setNewPreset({ label: "", param: "" });
    setErrors({ label: false, param: false });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Создать новый пресет чекбокса</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Название чекбокса"
            size="small"
            name="label"
            value={newPreset.label}
            onChange={handleChange}
            error={errors.label}
            helperText={errors.label ? "Обязательное поле" : ""}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Параметр (ключ)"
            name="param"
            size="small"
            value={newPreset.param}
            onChange={handleChange}
            error={errors.param}
            helperText={
              errors.param ? "Обязательное поле" : "Латинские буквы, цифры и подчёркивания"
            }
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Сохранить пресет
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function FormBuilderDrag({
  formTitle,
  setFormTitle,
  formElements,
  handleDragEnd,
  editElement,
  deleteElement,
  renderElement,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 4,
        overflowY: "auto",
        bgcolor: "background.default",
      }}
    >
      <TextField
        fullWidth
        label="Название формы"
        variant="outlined"
        size="medium"
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        sx={{
          mb: 4,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="formElements">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {formElements.map((element, index) => (
                <Draggable
                  key={element.id}
                  draggableId={element.id}
                  index={index}
                >
                  {(provided) => (
                    <FormElementCard
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      elevation={2}
                      sx={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <IconButton
                          {...provided.dragHandleProps}
                          size="small"
                          sx={{
                            mr: 1,
                            color: "text.secondary",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          {element.type !== "discount" && <DragHandleIcon />}
                        </IconButton>

                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => editElement(element)}
                            sx={{
                              mr: 1,
                              color: "text.secondary",
                              display: element.type === "rating" ? "none" : "inline-flex",
                              "&:hover": {
                                color: "success.main",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deleteElement(element.id)}
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: "error.main",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {renderElement(element)}
                    </FormElementCard>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}

function FormBuilder() {
  const [formTitle, setFormTitle] = useState("Новая форма");
  const [formElements, setFormElements] = useState([]);
  const [editingElement, setEditingElement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTagModalOpen, setNewTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoad, setIsLoad] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [presets, setPresets] = useState([]);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [addElementModalOpen, setAddElementModalOpen] = useState(false);
  const [editingNestedElement, setEditingNestedElement] = useState(null);
  const router = useRouter();
  const openAddElementToBlockModal = () => setAddElementModalOpen(true);
  const closeAddElementToBlockModal = () => setAddElementModalOpen(false);

  const handleDragEndBlockElements = (result) => {
    if (!result.destination) return;

    const items = Array.from(editingElement.data.elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditingElement({
      ...editingElement,
      data: {
        ...editingElement.data,
        elements: items,
      },
    });
  };

  const removeElementFromBlock = (id) => {
    setEditingElement({
      ...editingElement,
      data: {
        ...editingElement.data,
        elements: editingElement.data.elements.filter((el) => el.id !== id),
      },
    });
  };

  const addElementToBlock = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      data: getDefaultElementData(type),
    };

    setEditingElement({
      ...editingElement,
      data: {
        ...editingElement.data,
        elements: [...editingElement.data.elements, newElement],
      },
    });

    closeAddElementToBlockModal();
  };

  const saveForm = () => {
    const data = {
      name: formTitle,
      form_data: formElements,
    };
    getData("save_form", data)
      .then((data) => {
        if (!data.st) {
          setErrStatus(data.st);
          setErrText(data.text);
          setOpenAlert(true);
        } else {
          router.push("/feedback_form");
        }
      })
      .finally(() => router.push("/feedback_form"));
  };

  const handleDragEndCheckbox = (result) => {
    if (!result.destination) return;

    const items = Array.from(editingElement.data.checkboxes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditingElement({
      ...editingElement,
      data: { ...editingElement.data, checkboxes: items },
    });
  };

  const handleDragEndCheckboxBlock = (result) => {
    if (!result.destination) return;

    const items = Array.from(editingNestedElement.data.checkboxes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditingNestedElement({
      ...editingNestedElement,
      data: { ...editingNestedElement.data, checkboxes: items },
    });
  };

  const openPresetModal = () => setPresetModalOpen(true);
  const closePresetModal = () => setPresetModalOpen(false);

  const savePreset = async (preset) => {
    getData("save_checkbox", preset).then((data) => {
      getData("get_all_new").then((data) => {
        setPresets(data.presets);
      });
    });
    closePresetModal();
  };

  const updateCheckbox = (index, field, value) => {
    const updated = [...editingElement.data.checkboxes];
    updated[index][field] = value;
    setEditingElement({ ...editingElement, data: { ...editingElement.data, checkboxes: updated } });
  };

  const updateCheckboxBlock = (index, field, value) => {
    const updated = [...editingNestedElement.data.checkboxes];
    updated[index][field] = value;
    setEditingNestedElement({
      ...editingNestedElement,
      data: { ...editingNestedElement.data, checkboxes: updated },
    });
  };

  const removeCheckbox = (id) => {
    setEditingElement({
      ...editingElement,
      data: {
        ...editingElement.data,
        checkboxes: editingElement.data.checkboxes.filter((c) => c.id !== id),
      },
    });
  };

  const removeCheckboxBlock = (id) => {
    setEditingNestedElement({
      ...editingNestedElement,
      data: {
        ...editingNestedElement.data,
        checkboxes: editingNestedElement.data.checkboxes.filter((c) => c.id !== id),
      },
    });
  };

  useEffect(() => {
    getData("get_all_new").then((data) => {
      setProducts(data.items);
      setAvailableTags(data.tags);
      setCategories(data.categories);
      setPresets(data.presets);
    });
  }, []);

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("feedback_form", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const addFormElement = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      data: getDefaultElementData(type),
    };

    if (type === "discount") {
      // Если добавляется discount, всегда помещаем в конец
      setFormElements([...formElements, newElement]);
    } else {
      // Если добавляется другой элемент, ищем существующий discount
      const discountElement = formElements.find((el) => el.type === "discount");

      if (discountElement) {
        // Если discount уже есть, добавляем перед ним
        const index = formElements.indexOf(discountElement);
        const newElements = [...formElements];
        newElements.splice(index, 0, newElement);
        setFormElements(newElements);
      } else {
        // Если discount нет, просто добавляем в конец
        setFormElements([...formElements, newElement]);
      }
    }
  };

  const availableDiscount = [10, 20];

  const getDefaultElementData = (type) => {
    switch (type) {
      case "rating":
        return { value: 0 };
      case "discount":
        return { value: 0, availableDiscount: [...availableDiscount] };
      case "input":
        return { title: "Текстовое поле", placeholder: "Введите текст" };
      case "textarea":
        return { title: "Многострочный текст", placeholder: "Введите многострочный текст" };
      case "heading":
        return { text: "Заголовок" };
      case "checkbox":
        return { label: "Чекбокс", param: "custom_param" };
      case "checkboxGroup":
        return {
          title: "Группа чекбоксов",
          checkboxes: [],
          conditions: {},
        };
      case "block":
        return {
          title: "Блок элементов",
          elements: [],
          condition: {
            type: "always",
            values: [],
          },
        };
      case "tagCloud":
        return { selectedTags: [], availableTags: [...availableTags] };
      default:
        return {};
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formElements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormElements(items);
  };

  const editElement = (element) => {
    setEditingElement(element);
    setModalOpen(true);
  };

  const saveElementChanges = (updatedData) => {
    setFormElements(
      formElements.map((el) => (el.id === editingElement.id ? { ...el, data: updatedData } : el)),
    );
    setModalOpen(false);
  };

  const deleteElement = (id) => {
    setFormElements(formElements.filter((el) => el.id !== id));
  };

  function pluralizeStars(count) {
    const pluralRules = new Intl.PluralRules("ru-RU");
    const pluralForm = pluralRules.select(count);

    const forms = {
      one: "звезда",
      few: "звезды",
      many: "звезд",
    };

    return `${count} ${forms[pluralForm]}`;
  }

  const addNewTag = () => {
    if (newTagName.trim()) {
      setAvailableTags([...availableTags, newTagName.trim()]);
      setNewTagName("");
      setNewTagModalOpen(false);
    }
  };

  const getConditionText = (condition) => {
    switch (condition.type) {
      case "products":
        return `Отображать если выбран товар: ${condition.values.join(", ")}`;
      case "categories":
        return `Отображать если выбрана категория: ${condition.values.join(", ")}`;
      case "orderType":
        return `Отображать если тип заказа: ${condition.values.join(", ")}`;
      default:
        return "Отображать всегда";
    }
  };

  const renderElement = (element) => {
    switch (element.type) {
      case "block":
        return (
          <div className="form-element">
            <Typography variant="h6">{element.data.title}</Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 2 }}
            >
              {getConditionText(element.data.condition)}
            </Typography>
            {element.data.elements.map((el) => (
              <div key={el.id}>{renderElement(el)}</div>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="form-element">
            <Typography variant="h6">Рейтинг</Typography>
            <Rating
              value={element.data.value}
              readOnly
            />
          </div>
        );
      case "discount":
        return (
          <div className="form-element">
            <Typography variant="h6">Выписать скидку</Typography>
            <ToggleButtonGroup
              value={element.data.value}
              exclusive
              size="small"
            >
              {element.data.availableDiscount.map((discount) => {
                return (
                  <ToggleButton
                    value="20"
                    style={{
                      backgroundColor:
                        parseInt(element.data.value) == discount ? "#dd1a32" : "#fff",
                    }}
                  >
                    <span
                      style={{
                        color: parseInt(element.data.value) == discount ? "#fff" : "#333",
                        padding: "0 20px",
                      }}
                    >
                      Скидка {discount}%
                    </span>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </div>
        );
      case "input":
        return (
          <div className="form-element">
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              placeholder={element.data.placeholder}
              disabled
              size="small"
            />
          </div>
        );
      case "textarea":
        return (
          <div className="form-element">
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              multiline
              size="small"
              rows={4}
              placeholder={element.data.placeholder}
              disabled
            />
          </div>
        );
      case "heading":
        return (
          <div className="form-element">
            <Typography variant="h4">{element.data.text}</Typography>
          </div>
        );
      case "checkbox":
        return (
          <div className="form-element">
            <FormControlLabel
              control={<Checkbox disabled />}
              label={element.data.label}
              size="small"
            />
            <Typography variant="caption">Параметр: {element.data.param}</Typography>
          </div>
        );
      case "checkboxGroup":
        return (
          <div className="form-element">
            <Typography variant="h6">{element.data.title}</Typography>
            {element.data.checkboxes.map((checkbox) => (
              <div
                key={checkbox.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <FormControlLabel
                  control={<Checkbox disabled />}
                  label={checkbox.label}
                />
                <Typography
                  variant="caption"
                  style={{ marginRight: "10px" }}
                >
                  Параметр: {checkbox.param}
                </Typography>
              </div>
            ))}
            <div style={{ margin: "10px 0", padding: "10px", border: "1px dashed #ccc" }}>
              <Typography
                variant="caption"
                style={{ marginRight: "10px" }}
              >
                Условия
              </Typography>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {element.data.conditions.stars
                  ? element.data.conditions.stars.map((tag) => (
                      <Chip
                        key={tag}
                        label={pluralizeStars(tag)}
                      />
                    ))
                  : null}
                {element.data.conditions.products
                  ? element.data.conditions.products.map((tag) => (
                      <Chip
                        key={tag}
                        label={`${tag}`}
                      />
                    ))
                  : null}
                {element.data.conditions.categories
                  ? element.data.conditions.categories.map((tag) => (
                      <Chip
                        key={tag}
                        label={`${tag}`}
                      />
                    ))
                  : null}
              </div>
            </div>
          </div>
        );
      case "tagCloud":
        return (
          <div className="form-element">
            <Typography variant="h6">Облако тегов</Typography>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {element.data.selectedTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditModal = () => {
    if (!editingElement) return null;

    switch (editingElement.type) {
      case "input":
      case "textarea":
        return (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Заголовок"
              size="small"
              value={editingElement.data.title}
              onChange={(e) =>
                setEditingElement({
                  ...editingElement,
                  data: { ...editingElement.data, title: e.target.value },
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Placeholder"
              size="small"
              value={editingElement.data.placeholder}
              onChange={(e) =>
                setEditingElement({
                  ...editingElement,
                  data: { ...editingElement.data, placeholder: e.target.value },
                })
              }
            />
          </Box>
        );
      case "heading":
        return (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Текст заголовка"
              value={editingElement.data.text}
              onChange={(e) =>
                setEditingElement({
                  ...editingElement,
                  data: { ...editingElement.data, text: e.target.value },
                })
              }
            />
          </Box>
        );
      case "checkbox":
        return (
          <Box sx={{ p: 3 }}>
            <PresetModal
              open={presetModalOpen}
              onClose={() => setPresetModalOpen(false)}
              onSave={savePreset}
            />
            <Autocomplete
              options={presets}
              size="small"
              getOptionLabel={(option) => option.label}
              value={selectedPreset}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Добавить из пресетов"
                />
              )}
              onChange={(_, selectedPreset) => {
                if (selectedPreset) {
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      label: selectedPreset.label,
                      param: selectedPreset.param,
                    },
                  });

                  setSelectedPreset(null);
                }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Текст чекбокса"
              size="small"
              disabled
              value={editingElement.data.label}
              onChange={(e) =>
                setEditingElement({
                  ...editingElement,
                  data: { ...editingElement.data, label: e.target.value },
                })
              }
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={openPresetModal}
              sx={{ mt: 2 }}
            >
              Создать новый пресет
            </Button>
          </Box>
        );
      case "checkboxGroup":
        return (
          <Box sx={{ p: 3 }}>
            <PresetModal
              open={presetModalOpen}
              onClose={() => setPresetModalOpen(false)}
              onSave={savePreset}
            />
            <TextField
              fullWidth
              label="Название группы"
              size="small"
              value={editingElement.data.title}
              onChange={(e) =>
                setEditingElement({
                  ...editingElement,
                  data: { ...editingElement.data, title: e.target.value },
                })
              }
              sx={{ mb: 3 }}
            />

            <Typography
              variant="h6"
              sx={{ mb: 2 }}
            >
              Чекбоксы в группе
            </Typography>
            <Autocomplete
              options={presets}
              size="small"
              getOptionLabel={(option) => option.label}
              value={selectedPreset}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Добавить чекбокс из пресетов"
                />
              )}
              onChange={(_, selectedPreset) => {
                if (selectedPreset) {
                  const newCheckbox = {
                    id: `preset-${selectedPreset.id}`,
                    label: selectedPreset.label,
                    param: selectedPreset.param,
                    presetId: selectedPreset.id,
                  };
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      checkboxes: [...editingElement.data.checkboxes, newCheckbox],
                    },
                  });
                  setSelectedPreset(null);
                }
              }}
              sx={{ mb: 3 }}
            />

            <DragDropContext onDragEnd={(result) => handleDragEndCheckbox(result)}>
              <Droppable droppableId="checkboxes">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {editingElement.data.checkboxes.map((checkbox, idx) => (
                      <Draggable
                        key={checkbox.id}
                        draggableId={checkbox.id}
                        index={idx}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 2,
                              p: 2,
                              border: "1px solid #eee",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              left: "auto !important",
                            }}
                          >
                            <div
                              {...provided.dragHandleProps}
                              style={{ marginRight: 8 }}
                            >
                              <DragHandleIcon />
                            </div>

                            <Box flexGrow={1}>
                              <TextField
                                fullWidth
                                size="small"
                                sx={{ mb: 0 }}
                                disabled
                                label="Текст чекбокса"
                                value={checkbox.label}
                                onChange={(e) => updateCheckbox(idx, "label", e.target.value)}
                              />
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() => removeCheckbox(checkbox.id)}
                              sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={openPresetModal}
              sx={{ mt: 2 }}
            >
              Создать новый пресет
            </Button>

            <Typography
              variant="h6"
              sx={{ mt: 4, mb: 2 }}
            >
              Условие
            </Typography>
            <Box sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 1 }}>
              <Autocomplete
                key={`stars-${JSON.stringify(editingElement.data.conditions)}`}
                size="small"
                options={[1, 2, 3, 4, 5]}
                multiple
                getOptionLabel={(option) => `${option} звезд`}
                value={editingElement.data.conditions.stars || []}
                onChange={(_, value) => {
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      conditions: {
                        stars: value || [],
                        products: [],
                        categories: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Количество звезд"
                  />
                )}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                key={`products-${JSON.stringify(editingElement.data.conditions)}`}
                size="small"
                options={products}
                multiple
                value={editingElement.data.conditions.products || []}
                onChange={(_, value) => {
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      conditions: {
                        products: value || [],
                        stars: [],
                        categories: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Товары"
                  />
                )}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                key={`categories-${JSON.stringify(editingElement.data.conditions)}`}
                size="small"
                options={categories}
                multiple
                value={editingElement.data.conditions.categories || []}
                onChange={(_, value) => {
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      conditions: {
                        categories: value || [],
                        products: [],
                        stars: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Категории"
                  />
                )}
              />
            </Box>
          </Box>
        );
      case "tagCloud":
        return (
          <Box sx={{ p: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={["Добавить новый", ...availableTags]}
              value={editingElement.data.selectedTags}
              onChange={(_, value) => {
                if (value.includes("Добавить новый")) {
                  setNewTagModalOpen(true);
                } else {
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      selectedTags: value.filter((v) => v !== "Добавить новый"),
                    },
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите теги"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Box>
        );
      case "block":
        return (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Название блока"
              size="small"
              value={editingElement.data.title}
              onChange={(e) =>
                setEditingElement({
                  ...editingElement,
                  data: { ...editingElement.data, title: e.target.value },
                })
              }
              sx={{ mb: 3 }}
            />

            <Typography
              variant="h6"
              sx={{ mb: 2 }}
            >
              Условие отображения
            </Typography>
            <Box sx={{ mb: 3, p: 2, border: "1px solid #eee", borderRadius: 1 }}>
              <Autocomplete
                options={["always", "products", "categories", "orderType"]}
                getOptionLabel={(option) => {
                  switch (option) {
                    case "always":
                      return "Всегда";
                    case "products":
                      return "При наличии товара";
                    case "categories":
                      return "При наличии категории";
                    case "orderType":
                      return "При типе заказа";
                    default:
                      return option;
                  }
                }}
                value={editingElement.data.condition.type}
                onChange={(_, value) => {
                  setEditingElement({
                    ...editingElement,
                    data: {
                      ...editingElement.data,
                      condition: {
                        type: value || "always",
                        values: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Условие отображения"
                  />
                )}
                sx={{ mb: 2 }}
              />

              {editingElement.data.condition.type === "products" && (
                <Autocomplete
                  multiple
                  options={products}
                  value={editingElement.data.condition.values}
                  onChange={(_, value) => {
                    setEditingElement({
                      ...editingElement,
                      data: {
                        ...editingElement.data,
                        condition: {
                          ...editingElement.data.condition,
                          values: value || [],
                        },
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Выберите товары"
                    />
                  )}
                />
              )}

              {editingElement.data.condition.type === "categories" && (
                <Autocomplete
                  multiple
                  options={categories}
                  value={editingElement.data.condition.values}
                  onChange={(_, value) => {
                    setEditingElement({
                      ...editingElement,
                      data: {
                        ...editingElement.data,
                        condition: {
                          ...editingElement.data.condition,
                          values: value || [],
                        },
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Выберите категории"
                    />
                  )}
                />
              )}

              {editingElement.data.condition.type === "orderType" && (
                <Autocomplete
                  multiple
                  options={["Доставка", "Самовывоз", "Зал"]}
                  getOptionLabel={(option) => {
                    switch (option) {
                      case "delivery":
                        return "Доставка";
                      case "pickup":
                        return "Самовывоз";
                      case "dinein":
                        return "Зал";
                      default:
                        return option;
                    }
                  }}
                  value={editingElement.data.condition.values}
                  onChange={(_, value) => {
                    setEditingElement({
                      ...editingElement,
                      data: {
                        ...editingElement.data,
                        condition: {
                          ...editingElement.data.condition,
                          values: value || [],
                        },
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Выберите тип заказа"
                    />
                  )}
                />
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mb: 2 }}
            >
              Элементы в блоке
            </Typography>
            <DragDropContext onDragEnd={handleDragEndBlockElements}>
              <Droppable droppableId="blockElements">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ mb: 3 }}
                  >
                    {editingElement.data.elements.map((element, index) => (
                      <Draggable
                        key={element.id}
                        draggableId={element.id}
                        index={index}
                      >
                        {(provided) => (
                          <FormElementCard
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            elevation={1}
                            sx={{
                              ...provided.draggableProps.style,
                              mb: 2,
                              p: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <IconButton
                                {...provided.dragHandleProps}
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                <DragHandleIcon />
                              </IconButton>
                              <Box sx={{ flexGrow: 1 }}>{renderElement(element)}</Box>
                              <IconButton
                                size="small"
                                onClick={() => removeElementFromBlock(element.id)}
                                sx={{ color: "error.main" }}
                              >
                                <DeleteIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => setEditingNestedElement(element)}
                                sx={{ color: "error.main" }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>
                          </FormElementCard>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openAddElementToBlockModal}
              sx={{ mb: 2 }}
            >
              Добавить элемент
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderNestedEditModal = (element) => {
    switch (element.type) {
      case "input":
      case "textarea":
        return (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Заголовок"
              size="small"
              value={element.data.title}
              onChange={(e) =>
                setEditingNestedElement({
                  ...element,
                  data: { ...element.data, title: e.target.value },
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Placeholder"
              size="small"
              value={element.data.placeholder}
              onChange={(e) =>
                setEditingNestedElement({
                  ...element,
                  data: { ...element.data, placeholder: e.target.value },
                })
              }
            />
          </Box>
        );
      case "heading":
        return (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Текст заголовка"
              value={element.data.text}
              onChange={(e) =>
                setEditingNestedElement({
                  ...element,
                  data: { ...element.data, text: e.target.value },
                })
              }
            />
          </Box>
        );
      case "checkbox":
        return (
          <Box sx={{ p: 3 }}>
            <PresetModal
              open={presetModalOpen}
              onClose={() => setPresetModalOpen(false)}
              onSave={savePreset}
            />
            <Autocomplete
              options={presets}
              size="small"
              getOptionLabel={(option) => option.label}
              value={selectedPreset}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Добавить из пресетов"
                />
              )}
              onChange={(_, selectedPreset) => {
                if (selectedPreset) {
                  setEditingNestedElement({
                    ...element,
                    data: {
                      ...element.data,
                      label: selectedPreset.label,
                      param: selectedPreset.param,
                    },
                  });

                  setSelectedPreset(null);
                }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Текст чекбокса"
              size="small"
              disabled
              value={element.data.label}
              onChange={(e) =>
                setEditingNestedElement({
                  ...element,
                  data: { ...element.data, label: e.target.value },
                })
              }
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={openPresetModal}
              sx={{ mt: 2 }}
            >
              Создать новый пресет
            </Button>
          </Box>
        );
      case "checkboxGroup":
        return (
          <Box sx={{ p: 3 }}>
            <PresetModal
              open={presetModalOpen}
              onClose={() => setPresetModalOpen(false)}
              onSave={savePreset}
            />
            <TextField
              fullWidth
              label="Название группы"
              size="small"
              value={element.data.title}
              onChange={(e) =>
                setEditingNestedElement({
                  ...element,
                  data: { ...element.data, title: e.target.value },
                })
              }
              sx={{ mb: 3 }}
            />

            <Typography
              variant="h6"
              sx={{ mb: 2 }}
            >
              Чекбоксы в группе
            </Typography>
            <Autocomplete
              options={presets}
              size="small"
              getOptionLabel={(option) => option.label}
              value={selectedPreset}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Добавить чекбокс из пресетов"
                />
              )}
              onChange={(_, selectedPreset) => {
                if (selectedPreset) {
                  const newCheckbox = {
                    id: `preset-${selectedPreset.id}`,
                    label: selectedPreset.label,
                    param: selectedPreset.param,
                    presetId: selectedPreset.id,
                  };
                  setEditingNestedElement({
                    ...element,
                    data: {
                      ...element.data,
                      checkboxes: [...element.data.checkboxes, newCheckbox],
                    },
                  });
                  setSelectedPreset(null);
                }
              }}
              sx={{ mb: 3 }}
            />

            <DragDropContext onDragEnd={(result) => handleDragEndCheckboxBlock(result)}>
              <Droppable droppableId="checkboxes">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {element.data.checkboxes.map((checkbox, idx) => (
                      <Draggable
                        key={checkbox.id}
                        draggableId={checkbox.id}
                        index={idx}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 2,
                              p: 2,
                              border: "1px solid #eee",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              left: "auto !important",
                            }}
                          >
                            <div
                              {...provided.dragHandleProps}
                              style={{ marginRight: 8 }}
                            >
                              <DragHandleIcon />
                            </div>

                            <Box flexGrow={1}>
                              <TextField
                                fullWidth
                                size="small"
                                sx={{ mb: 0 }}
                                disabled
                                label="Текст чекбокса"
                                value={checkbox.label}
                                onChange={(e) => updateCheckboxBlock(idx, "label", e.target.value)}
                              />
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() => removeCheckboxBlock(checkbox.id)}
                              sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={openPresetModal}
              sx={{ mt: 2 }}
            >
              Создать новый пресет
            </Button>

            <Typography
              variant="h6"
              sx={{ mt: 4, mb: 2 }}
            >
              Условие
            </Typography>
            <Box sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 1 }}>
              <Autocomplete
                key={`stars-${JSON.stringify(element.data.conditions)}`}
                size="small"
                options={[1, 2, 3, 4, 5]}
                multiple
                getOptionLabel={(option) => `${option} звезд`}
                value={element.data.conditions.stars || []}
                onChange={(_, value) => {
                  setEditingNestedElement({
                    ...element,
                    data: {
                      ...element.data,
                      conditions: {
                        stars: value || [],
                        products: [],
                        categories: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Количество звезд"
                  />
                )}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                key={`products-${JSON.stringify(element.data.conditions)}`}
                size="small"
                options={products}
                multiple
                value={element.data.conditions.products || []}
                onChange={(_, value) => {
                  setEditingNestedElement({
                    ...element,
                    data: {
                      ...element.data,
                      conditions: {
                        products: value || [],
                        stars: [],
                        categories: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Товары"
                  />
                )}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                key={`categories-${JSON.stringify(element.data.conditions)}`}
                size="small"
                options={categories}
                multiple
                value={element.data.conditions.categories || []}
                onChange={(_, value) => {
                  setEditingNestedElement({
                    ...element,
                    data: {
                      ...element.data,
                      conditions: {
                        categories: value || [],
                        products: [],
                        stars: [],
                      },
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Категории"
                  />
                )}
              />
            </Box>
          </Box>
        );
      case "tagCloud":
        return (
          <Box sx={{ p: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={["Добавить новый", ...availableTags]}
              value={element.data.selectedTags}
              onChange={(_, value) => {
                if (value.includes("Добавить новый")) {
                  setNewTagModalOpen(true);
                } else {
                  setEditingNestedElement({
                    ...element,
                    data: {
                      ...element.data,
                      selectedTags: value.filter((v) => v !== "Добавить новый"),
                    },
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите теги"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Box>
        );
    }
  };

  const saveNestedElementChanges = () => {
    setEditingElement({
      ...editingElement,
      data: {
        ...editingElement.data,
        elements: editingElement.data.elements.map((el) =>
          el.id === editingNestedElement.id ? editingNestedElement : el,
        ),
      },
    });
    setEditingNestedElement(null);
  };

  return (
    <Grid
      container
      spacing={3}
      mb={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <h1>Создание новой формы</h1>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <Button
          variant="contained"
          onClick={saveForm}
        >
          Создать форму
        </Button>
      </Grid>
      <Grid
        container
        spacing={2}
        mb={3}
        sx={{ height: "92vh" }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{ width: "100%", p: 2, height: "520px" }}
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
            }}
          >
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Typography variant="h6">Элементы формы</Typography>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
            }}
          >
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("rating")}
                startIcon={<StarBorder />}
                sx={{
                  height: 100,
                  bgcolor: "#FFF0F0",
                  color: "#D32F2F",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#FFE0E0" },
                  border: "1px solid #FFCDD2",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Рейтинг (5 звезд)
              </Button>
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("input")}
                startIcon={<TextFields />}
                sx={{
                  height: 100,
                  bgcolor: "#F0F7FF",
                  color: "#1976D2",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#E0F0FF" },
                  border: "1px solid #BBDEFB",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Текстовое поле
              </Button>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
            }}
          >
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("textarea")}
                startIcon={<Notes />}
                sx={{
                  height: 100,
                  bgcolor: "#F0FFF4",
                  color: "#2E7D32",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#E0F7E0" },
                  border: "1px solid #C8E6C9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Многострочный текст
              </Button>
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("heading")}
                startIcon={<Title />}
                sx={{
                  height: 100,
                  bgcolor: "#F5F0FF",
                  color: "#7B1FA2",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#EDE0FF" },
                  border: "1px solid #D1C4E9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Заголовок
              </Button>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
            }}
          >
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("checkbox")}
                startIcon={<CheckBoxOutlineBlank />}
                sx={{
                  height: 100,
                  bgcolor: "#FFF8E0",
                  color: "#FF8F00",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#FFF0C0" },
                  border: "1px solid #FFECB3",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Чекбокс
              </Button>
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("checkboxGroup")}
                startIcon={<PlaylistAddCheck />}
                sx={{
                  height: 100,
                  bgcolor: "#E0F7FA",
                  color: "#00838F",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#C0F0F5" },
                  border: "1px solid #B2EBF2",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Группа чекбоксов
              </Button>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            size={{
              xs: 12,
            }}
          >
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("tagCloud")}
                startIcon={<LocalOffer />}
                sx={{
                  height: 100,
                  bgcolor: "#FFEBEE",
                  color: "#C2185B",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#FFE0E8" },
                  border: "1px solid #F8BBD0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Облако тегов
              </Button>
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => addFormElement("block")}
                startIcon={<ViewAgenda />}
                sx={{
                  height: 100,
                  bgcolor: "#F5F5F5",
                  color: "#424242",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#EEEEEE" },
                  border: "1px solid #E0E0E0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Блок элементов
              </Button>
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                disabled={formElements.some((el) => el.type === "discount")}
                onClick={() => addFormElement("discount")}
                startIcon={<MonetizationOn />}
                sx={{
                  height: 100,
                  bgcolor: "#ef5555",
                  color: "#424242",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#EEEEEE" },
                  border: "1px solid #E0E0E0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                Скидка
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <FormBuilderDrag
          formElements={formElements}
          setFormTitle={setFormTitle}
          formTitle={formTitle}
          handleDragEnd={handleDragEnd}
          editElement={editElement}
          deleteElement={deleteElement}
          renderElement={renderElement}
        />

        <Modal
          open={!!editingNestedElement}
          onClose={() => setEditingNestedElement(null)}
          aria-labelledby="edit-nested-element-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 0,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{ p: 3, borderBottom: "1px solid #eee" }}
            >
              Редактирование элемента
            </Typography>

            {editingNestedElement && renderNestedEditModal(editingNestedElement)}

            <Box
              sx={{
                p: 3,
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setEditingNestedElement(null)}
                sx={{ mr: 2 }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={saveNestedElementChanges}
              >
                Сохранить
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal
          open={addElementModalOpen}
          onClose={closeAddElementToBlockModal}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3 }}
            >
              Добавить элемент в блок
            </Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("input")}
                  startIcon={<TextFields />}
                >
                  Текст
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("textarea")}
                  startIcon={<Notes />}
                >
                  Текст. область
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("checkbox")}
                  startIcon={<CheckBoxOutlineBlank />}
                >
                  Чекбокс
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("rating")}
                  startIcon={<StarBorder />}
                >
                  Рейтинг
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("heading")}
                  startIcon={<Title />}
                >
                  Заголовок
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("checkboxGroup")}
                  startIcon={<PlaylistAddCheck />}
                >
                  Группа чек-ов
                </Button>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addElementToBlock("tagCloud")}
                  startIcon={<LocalOffer />}
                >
                  Облако тэгов
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={closeAddElementToBlockModal}>Отмена</Button>
            </Box>
          </Box>
        </Modal>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="edit-element-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 0,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{ p: 3, borderBottom: "1px solid #eee" }}
            >
              Редактирование элемента
            </Typography>
            {renderEditModal()}
            <Box
              sx={{
                p: 3,
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setModalOpen(false)}
                sx={{ mr: 2 }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  saveElementChanges(editingElement.data);
                  setModalOpen(false);
                }}
              >
                Сохранить
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal
          open={newTagModalOpen}
          onClose={() => setNewTagModalOpen(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3 }}
            >
              Добавить новый тег
            </Typography>
            <TextField
              fullWidth
              label="Название тега"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => setNewTagModalOpen(false)}
                sx={{ mr: 2 }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={addNewTag}
              >
                Добавить
              </Button>
            </Box>
          </Box>
        </Modal>
      </Grid>
    </Grid>
  );
}

export default function Settings() {
  return <FormBuilder />;
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
