"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { MyAutocomplite, MyTextInput, MyCheckBox } from "@/ui/Forms";
import { ModalAccept } from "@/components/general/ModalAccept";

const splitCsv = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

const matchById = (csvOrArray, sourceList) => {
  if (Array.isArray(csvOrArray) && typeof csvOrArray[0] === "object") {
    return csvOrArray;
  }

  const ids = Array.isArray(csvOrArray)
    ? csvOrArray.map((x) => +x)
    : splitCsv(csvOrArray).map((x) => +x);

  return sourceList.filter((item) => ids.includes(item.id));
};

export default function CatsModal({
  open,
  onClose,
  save,
  remove,
  title,
  itemName,
  fullScreen,
  errCats = [],
  siteCats = [],
  solutions = [],
  allStages = [],
  item = null,
  canDelete = true,
  parentValue = {},
}) {
  const empty = {
    name: "",
    site_cats: [],
    is_active: 1,
    parent_id: null,

    id_win: [],
    stage_err_1: [],
    stage_err_2: [],
    stage_err_3: [],
    need_photo: 0,

    err_to_win: [],
    all_wins: [],
    all_stages: [],
    stages: [],
  };

  const [localItem, setLocalItem] = useState(empty);
  const [cat1, setCat1] = useState(0);
  const [cat2, setCat2] = useState(0);
  const [isCreate, setIsCreate] = useState(false);
  const [level, setLevel] = useState(0);

  const normalizeSiteCats = (input) => {
    if (!input) return [];

    // Если уже объекты — вернуть как есть (для отображения)
    if (Array.isArray(input) && input.length > 0 && typeof input[0] === "object") {
      return input;
    }

    // Иначе — обрабатываем как CSV/массив строк/чисел
    const ids = Array.isArray(input) ? input : splitCsv(input);
    return ids.map(String).filter((s) => s.trim() !== "");
  };

  const parentSiteCats = useMemo(() => {
    const parentCat = errCats.find((x) => x.id === cat1);
    if (!parentCat) return [];

    const normalized = normalizeSiteCats(parentCat.site_cats || []);
    if (!normalized.length) return [];

    if (typeof normalized[0] === "object") return normalized;

    return normalized.map((id) => siteCats.find((sc) => +sc.id === +id)).filter(Boolean);
  }, [cat1, errCats, siteCats]);

  const itemSiteCats = useMemo(() => {
    let sourceIds;

    if (isCreate && cat1 > 0) {
      // Берём ID из родителя
      const parentCat = errCats.find((x) => x.id === cat1);
      if (parentCat) {
        sourceIds = normalizeSiteCats(parentCat.site_cats || []);
        // Если normalize вернул объекты — извлекаем ID
        if (sourceIds.length > 0 && typeof sourceIds[0] === "object") {
          sourceIds = sourceIds.map((item) => String(item.id));
        }
      } else {
        sourceIds = [];
      }
    } else {
      sourceIds = normalizeSiteCats(localItem?.site_cats || []);
      if (sourceIds.length > 0 && typeof sourceIds[0] === "object") {
        sourceIds = sourceIds.map((item) => String(item.id));
      }
    }

    // Преобразуем ID в объекты для Autocomplete
    return sourceIds
      .map((id) => siteCats.find((sc) => String(sc.id) === String(id)))
      .filter(Boolean);
  }, [localItem?.site_cats, siteCats, isCreate, cat1, errCats]);

  useEffect(() => {
    if (!open) return;
    if (!item) {
      console.log("GOT NULL");
      setIsCreate(true);
      setCat1(0);
      setCat2(0);
      setLevel(1);
      return;
    }

    setIsCreate(!item.id);
    setLocalItem(item);

    const parent = errCats.find((x) => x.id === item?.parent_id);

    if (parentValue && item?.parent_id) {
      setCat1(item?.parent_id);
      setCat2(item.id);
      setLevel(2);
      setIsCreate(true);
      return;
    } else if (parentValue && item?.parent_id === null) {
      setCat1(item?.id);
      setCat2(0);
      setLevel(1);
      setIsCreate(true);
      return;
    }

    if (!parent) {
      setCat1(0);
      setCat2(0);
      setLevel(1);
      return;
    }

    if (parent.parent_id === null) {
      setCat1(parent.id);
      setCat2(0);
      setLevel(1);
      return;
    }

    setCat1(parent.parent_id);
    setCat2(parent.id);
    setLevel(2);
  }, [open, item, errCats]);

  const itemSolutions = useMemo(
    () => matchById(localItem.solutions, solutions) || [],
    [localItem, solutions],
  );

  const itemStagesByLevel = (level) => {
    const stageData = localItem[`stage_${level}`] || null;
    if (!stageData?.length) return [];
    return matchById(stageData, allStages) || [];
  };

  const topLevel = useMemo(
    () => [{ id: 0, name: "Главная" }, ...errCats?.filter((c) => c.parent_id === null)],
    [errCats],
  );

  const childCats = useMemo(
    () => (cat1 === 0 ? [] : errCats?.filter((c) => c.parent_id === cat1)),
    [cat1, errCats],
  );

  const finalParent = cat2 !== 0 ? cat2 : cat1 !== 0 ? cat1 : null;

  const update = (key, v) => setLocalItem((s) => ({ ...s, [key]: v }));

  const handleParent = (_, v) => {
    const id = v?.id ?? 0;
    setCat1(id);
    setCat2(0);

    if (id > 0 && isCreate) {
      const parentCat = errCats.find((x) => x.id === id);
      if (parentCat) {
        // Извлекаем ТОЛЬКО ID (как строки или числа)
        const rawIds = normalizeSiteCats(parentCat.site_cats || []); // это может быть [str, str] или [obj, obj]

        // Приводим к массиву ID (строки)
        let siteCatIds;
        if (rawIds.length > 0 && typeof rawIds[0] === "object") {
          siteCatIds = rawIds.map((item) => String(item.id));
        } else {
          siteCatIds = rawIds.map(String); // гарантируем строки
        }

        setLocalItem((prev) => ({ ...prev, site_cats: siteCatIds }));
      }
    }
  };

  const handleSub = (_, v) => {
    setCat2(v?.id ?? 0);
  };

  const handleSiteCatsChange = (event, data) => {
    const siteCatIds = data.map((item) => item.id);
    update("site_cats", siteCatIds);
  };

  const handleSave = () => {
    const saveData = {
      ...localItem,
      parent_id: finalParent,
      site_cats: Array.isArray(localItem.site_cats)
        ? localItem.site_cats.join(",")
        : localItem.site_cats,
    };

    save(saveData);
    handleClose();
  };

  const handleRemove = async () => {
    await remove(localItem.id);
    handleClose();
  };

  const handleClose = () => {
    setLocalItem(empty);
    setCat1(0);
    setCat2(0);
    onClose();
  };

  const parentVal = topLevel?.find((x) => x.id === cat1) || null;
  const subVal =
    cat2 === 0 ? { id: 0, name: "Главная" } : childCats?.find((x) => +x.id === +cat2) || null;
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
    >
      {openDelete && (
        <ModalAccept
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Удалить категорию?"
          save={() => {
            handleRemove();
            setOpenDelete(false);
          }}
        />
      )}
      <DialogTitle className="button">
        {title}
        {itemName ? `: ${itemName}` : null}

        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Grid
          container
          spacing={3}
          sx={{ p: 1 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Наименование"
              value={localItem.name || ""}
              func={(e) => update("name", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyAutocomplite
              label="Категории сайта"
              multiple
              data={siteCats || []}
              value={itemSiteCats}
              func={handleSiteCatsChange}
              disabled={
                (!isCreate && localItem.parent_id > 0) ||
                (isCreate && localItem.parent_id > 0) ||
                (parentValue && level === 1)
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MyAutocomplite
              label="Родительская категория"
              multiple={false}
              data={topLevel}
              value={parentVal ?? null}
              func={handleParent}
              disabled={!isCreate}
            />
          </Grid>

          {level === 2 && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <MyAutocomplite
                label="Подкатегория"
                multiple={false}
                data={[{ id: 0, name: "Главная" }, ...childCats]}
                value={subVal ?? null}
                func={handleSub}
              />
            </Grid>
          )}

          {cat2 !== 0 && (
            <>
              {/* Варианты решения */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <MyAutocomplite
                  label="Варианты решения"
                  multiple
                  data={solutions}
                  value={itemSolutions}
                  func={(_, v) => {
                    update("solutions", v);
                  }}
                />
              </Grid>

              {/* Этапы ошибки роллы */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyAutocomplite
                  label="Этапы ошибки роллы"
                  multiple
                  data={allStages}
                  value={itemStagesByLevel(1)}
                  func={(_, v) => update("stage_1", v)}
                />
              </Grid>

              {/* Этапы ошибки пицца */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyAutocomplite
                  label="Этапы ошибки пицца"
                  multiple
                  data={allStages}
                  value={itemStagesByLevel(2)}
                  func={(_, v) => update("stage_2", v)}
                />
              </Grid>

              {/* Этапы ошибки напитки / допы */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyAutocomplite
                  label="Этапы ошибки напитки / допы"
                  multiple
                  data={allStages}
                  value={itemStagesByLevel(3)}
                  func={(_, v) => update("stage_3", v)}
                />
              </Grid>

              {/* Картинка нужна */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyCheckBox
                  label="Картинка"
                  value={localItem.need_img === 1}
                  func={(e) => update("need_img", e.target.checked ? 1 : 0)}
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12, sm: 3 }}>
            <MyCheckBox
              label="Активность"
              value={localItem?.is_active === 1}
              func={(e) => update("is_active", e.target.checked ? 1 : 0)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions style={{ display: "flex", justifyContent: "space-between" }}>
        {canDelete && !isCreate ? (
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenDelete(true)}
          >
            Удалить
          </Button>
        ) : (
          <div></div>
        )}
        <Button
          color="primary"
          onClick={handleSave}
        >
          {isCreate ? "Добавить" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
