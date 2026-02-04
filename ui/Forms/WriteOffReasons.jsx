import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function WriteOffReasons({ value, onChange, disabled, list }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const wrapperRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const uniqueTags = [...new Set(list.map((item) => item.tag))];
  const allUniqueNames = [...new Set(list.map((item) => item.name))];

  const filteredNames = allUniqueNames.filter((name) => {
    // Фильтр по поиску
    const searchMatch = searchTerm ? name.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    // Фильтр по тегам
    const tagMatch =
      selectedTags.length > 0
        ? list.some((item) => item.name === name && selectedTags.includes(item.tag))
        : true;

    return searchMatch && tagMatch;
  });

  const handleTextFieldClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Обработчик выбора элемента списка
  const handleItemClick = (name) => {
    // Добавляем в выбранные элементы
    if (!selectedItems.includes(name)) {
      setSelectedItems([...selectedItems, name]);
    }

    // Находим тег для этого имени
    const item = list.find((i) => i.name === name);
    if (item && !selectedTags.includes(item.tag)) {
      setSelectedTags([...selectedTags, item.tag]);
    }

    // Устанавливаем значение в текстовое поле
    onChange(name);
    setIsOpen(false);
  };

  // Удаление тега
  const handleDeleteTag = (tagToDelete) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToDelete));
  };

  // Обработчик поиска
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      ref={wrapperRef}
    >
      <TextField
        fullWidth
        placeholder="Причина списания"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSearchTerm(e.target.value);
        }}
        onClick={handleTextFieldClick}
        size="small"
        disabled={disabled}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            border: "1px solid #E5E5E5",
            color: "#BABABA",
            backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
            "&:hover": {
              backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E5E5",
              },
            },
            "& .MuiOutlinedInput-input": {
              borderRadius: "12px",
            },
            "&.Mui-focused": {
              color: "#666666",
              backgroundColor: "#FFFFFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E5E5",
                borderWidth: "2px",
              },
            },
            "&.Mui-disabled": {
              backgroundColor: "#F5F5F5",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0, 0, 0, 0.12)",
              },
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
            "&.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.38)",
              borderRadius: "12px",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            display: "none",
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {value ? (
                <IconButton
                  size="small"
                  onClick={() => onChange("")}
                  sx={{
                    color: "#A6A6A6",
                    borderRadius: "50%",
                    ml: 0.5,
                    width: 24,
                    height: 24,
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null}
              <IconButton
                edge="end"
                size="small"
                onClick={() => setIsOpen(!isOpen)}
              >
                <KeyboardArrowDownIcon
                  style={{ color: "#BABABA", rotate: isOpen ? "180deg" : "0deg" }}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {isOpen && !disabled && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: "12px",
            width: "100%",
            border: "1px solid #E5E5E5",
            boxShadow: "none",
            position: "absolute",
            zIndex: 10000,
            top: "44px",
            maxHeight: 400,
            overflow: "hidden",
          }}
        >
          <Box sx={{ borderRadius: "12px" }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: "4px",
                padding: "12px 16px",
                fontWeight: 400,
                color: "#666",
                fontSize: "14px",
                borderBottom: "1px solid #E5E5E5",
              }}
            >
              Теги
            </Typography>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1}
              sx={{ padding: "12px 16px" }}
            >
              {uniqueTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onClick={() => {
                    if (!selectedTags.includes(tag)) {
                      setSelectedTags([...selectedTags, tag]);
                    } else {
                      const selectedTags2 = [...selectedTags].filter((i) => i !== tag);
                      setSelectedTags(selectedTags2);
                    }
                  }}
                  variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #E5E5E5",
                    backgroundColor: selectedTags.includes(tag) ? "#e3e3e3" : "#F2F2F2",
                    color: selectedTags.includes(tag) ? "white" : "#666666",
                    padding: "8px 12px",
                    height: "32px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Блок списка */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: "4px",
                padding: "12px 16px",
                fontWeight: 400,
                color: "#666",
                fontSize: "14px",
                borderBottom: "1px solid #E5E5E5",
                borderTop: "1px solid #E5E5E5",
              }}
            >
              Список
            </Typography>
            <Box
              sx={{
                maxHeight: 200,
                overflowY: "auto",
                borderRadius: "12px",
                bgcolor: "background.paper",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#FFFFFF",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#E5E5E5",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "#E5E5E5",
                  },
                },
              }}
            >
              <List dense>
                {filteredNames.map((name, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      color: "#666666",
                      padding: "8px 16px",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#F2F2F2",
                      },
                    }}
                    onClick={() => handleItemClick(name)}
                  >
                    <ListItemText
                      primary={name}
                      sx={{
                        fontSize: "14px",
                        "& .MuiTypography-root": {
                          fontSize: "14px",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Paper>
      )}
    </div>
  );
}
