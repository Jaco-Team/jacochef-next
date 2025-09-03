"use client";

import { MyCheckBox, MySelect, MyTextInput } from "@/ui/elements";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useBannersStore } from "./useBannersStore";
import { useSiteSettingStore } from "../useSiteSettingStore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useBannerModalStore } from "./useBannerModalStore";
import { BannerModal } from "./BannerModal";
import useSaveBanner from "../hooks/useSaveBanner";

export function SiteSettingBanners(props) {
  const {} = props;
  const submodule = "banners";
  // Page state
  const [cityId, cities] = useSiteSettingStore((state) => [
    state.city_id,
    state.cities,
  ]);
  const { createModal, setCityId, closeModal, setModalTitle, showAlert } = useSiteSettingStore.getState();
  const [acces] = useSiteSettingStore((state) => [
    state.acces,
  ]);

  // banners list state
  const { getData, setActiveBanners, setNonActiveBanners, setModuleName } =
    useBannersStore.getState();
  const active = useBannersStore((state) => state.active);
  const non_active = useBannersStore((state) => state.non_active);
  const moduleName = useBannersStore((state) => state.moduleName);
  const setSort = useBannersStore((state) => state.setSort);

  const bannerName = useBannerModalStore((state) => state.bannerName);

  const [modalPrefix, setModalPrefix] = useState(useSiteSettingStore.getState().modalTitle);

  const { saveNew, saveEdit } = useSaveBanner(showAlert, getData, closeModal);

  const updateItemSort = async (item, event) => {
    if (item.sort === event.target.value) {
      return;
    }
    const newItem = {
      id: item.id,
      sort: event.target.value,
      is_show: item.is_active,
    };
    try {
      await getData("save_sort_banner", newItem);
      await fetchCoreData();
    } catch (e) {
      showAlert("Error saving banner sort");
    }
  };
  const updateItemActive = async (item, event) => {
    if (item.is_active === event.target.value) {
      return;
    }
    const newItem = {
      id: item.id,
      sort: item.sort,
      is_show: !!event.target.checked ? 1 : 0,
    };
    try {
      await getData("save_sort_banner", newItem);
      await fetchCoreData();
    } catch (e) {
      showAlert("Error saving banner active state");
    }
  };

  const fetchCoreData = useCallback(async () => {
    const data = {
      submodule,
      city_id: cityId,
    };
    try {
      const response = await getData("get_banners_data", data);
      setModuleName(response.submodule.name);
      setActiveBanners(response.banners.active);
      setNonActiveBanners(response.banners.non_active);
    } catch (e) {
      showAlert(`Fetch error: ${e.message}`);
    }
  }, [cityId]);

  const openModal = async (action, title, id = 0) => {
    setModalPrefix(title);
    createModal(
      () => (
        <BannerModal
          getData={getData}
          showAlert={showAlert}
          cityId={cityId}
          action={action}
          id={id}
        />
      ),
      modalPrefix,
      () => (
        <>
          {acces.banners_edit ? (
            <Button
              variant="contained"
              onClick={async () => (action === "bannerNew" ? await saveNew() : await saveEdit())}
            >
              Сохранить
            </Button>
          ) : null}
        </>
      )
    );
  };
  // update banner name in modal title
  useEffect(
    () => setModalTitle(`${modalPrefix}${bannerName ? `: ${bannerName}` : ""}`),
    [modalPrefix, bannerName]
  );

  useEffect(() => {
    fetchCoreData();
  }, [fetchCoreData]);

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        item
        xs={12}
        sm={12}
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column", // mobile = stacked
            sm: "row", // tablet+ = horizontal
          },
          gap: "1em",
          alignItems: "flex-start", // or 'center' based on your taste
          justifyContent: "space-between", // optional
        }}
      >
        <Typography variant="h5">{moduleName}</Typography>

        {acces.banners_edit ? (
          <Button
            onClick={() => openModal("bannerNew", "Новый баннер")}
            variant="contained"
          >
            Добавить новую категорию
          </Button>
        ) : null}
      </Grid>

      <Grid
        item
        xs={12}
        sm={12}
        sx={{ p: 3 }}
      >
        <MySelect
          data={cities}
          value={cityId}
          func={(e) => setCityId(e.target?.value)}
          label="Город"
          is_none={false}
        />
      </Grid>

      {/* таблица активных баннеров */}
      {active.length > 0 && (
        <Grid
          item
          xs={12}
          sm={12}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={8}>
                    <h2>Активные</h2>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ width: "5%" }}>#</TableCell>
                  <TableCell style={{ width: "20%" }}>Название</TableCell>
                  <TableCell style={{ width: "20%" }}>Ссылка</TableCell>
                  <TableCell style={{ width: "12%" }}>Сорт</TableCell>
                  <TableCell style={{ width: "12%" }}>Город</TableCell>
                  <TableCell style={{ width: "10%" }}>Дата старта</TableCell>
                  <TableCell style={{ width: "10%" }}>Дата окончания</TableCell>
                  <TableCell style={{ width: "10%" }}>Активен</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {active.map((item, key) => (
                  <TableRow
                    key={key}
                    hover
                  >
                    <TableCell>{key + 1}</TableCell>
                    <TableCell
                      onClick={async () =>
                        await openModal("bannerEdit", "Редактирование баннера", item.id)
                      }
                      style={{ fontWeight: 700, cursor: "pointer" }}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell>{item?.link}</TableCell>
                    <TableCell>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                      >
                        <MyTextInput
                          value={item.sort}
                          disabled={acces.banners_view && !acces.banners_edit}
                          func={(e) => setSort(item.id, e)}
                          onBlur={async (e) => await updateItemSort(item, e)}
                        />
                      </Grid>
                    </TableCell>
                    <TableCell>{item.city_name ?? "Все города"}</TableCell>
                    <TableCell>{item.date_start}</TableCell>
                    <TableCell>{item.date_end}</TableCell>
                    <TableCell>
                      <MyCheckBox
                        value={!!item.is_active}
                        disabled={acces.banners_view && !acces.banners_edit}
                        func={async (e) => await updateItemActive(item, e)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}

      {/* таблица законченные баннеров */}
      {non_active.length > 0 && (
        <Grid
          item
          xs={12}
          sm={12}
        >
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "bold" }}>Законченные</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ width: "100%", overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "5%" }}>#</TableCell>
                      <TableCell style={{ width: "25%" }}>Название</TableCell>
                      <TableCell style={{ width: "20%" }}>Город</TableCell>
                      <TableCell style={{ width: "25%" }}>Дата старта</TableCell>
                      <TableCell style={{ width: "25%" }}>Дата окончания</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {non_active.map((item, key) => (
                      <TableRow
                        key={key}
                        hover
                      >
                        <TableCell>{key + 1}</TableCell>
                        <TableCell
                          onClick={async () =>
                            await openModal("bannerEdit", "Редактирование баннера", item.id)
                          }
                          style={{ fontWeight: 700, cursor: "pointer" }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell>{item.city_name ?? "Все города"}</TableCell>
                        <TableCell>{item.date_start}</TableCell>
                        <TableCell>{item.date_end}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>
      )}
    </Grid>
  );
}
