"use client";

import {
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MySelect,
  MyTextInput,
  TextEditor,
} from "@/ui/elements";
import { CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useBannerModalStore } from "./useBannerModalStore";
import Dropzone from "dropzone";
import dayjs from "dayjs";

const dropzoneOptions = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFiles: 1,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg",
  addRemoveLinks: true,
  dictDefaultMessage: "Перетащите файлы сюда для загрузки",
  url: "https://jacochef.ru/src/img/site_banners/upload_img_new.php",
};

export function BannerModal({ getData, showAlert, id, action }) {
  // banner list state
  const banner = useBannerModalStore((state) => state.banner);
  const promos = useBannerModalStore((state) => state.promos);
  const [isLoading, setIsLoading] = useBannerModalStore((state) => [
    state.isLoading,
    state.setIsLoading,
  ]);
  const setBanner = useBannerModalStore((state) => state.setBanner);
  const setBannerName = useBannerModalStore((state) => state.setBannerName);
  const setPromos = useBannerModalStore((state) => state.setPromos);

  const changeDateRange = useBannerModalStore((state) => state.changeDateRange);
  const changeThisBanField = useBannerModalStore((state) => state.changeThisBanField);
  const changeThisBanFieldBool = useBannerModalStore((state) => state.changeThisBanFieldBool);
  const changeAutoComplete = useBannerModalStore((state) => state.changeAutoComplete);
  const getNewBanner = useBannerModalStore((state) => state.getNewBanner);

  // dropZones
  const [dropZonesReady, setDropZonesReady] = useState(false);
  const desktopDropzoneContainerRef = useRef(null);
  const mobileDropzoneContainerRef = useRef(null);
  const dDropzone = useRef(null);
  const mDropzone = useRef(null);
  const setDesktopDropzone = useBannerModalStore((state) => state.setDesktopDropzone);
  const setMobileDropzone = useBannerModalStore((state) => state.setMobileDropzone);

  const fetchPromos = async () => {
    if (!banner) return;
    const data = {
      city_id: banner?.this_ban?.city_id,
    };
    const promosResponse = await getData("get_active_promo", data);
    setPromos(promosResponse.promos);
  };

  const updateBannerData = async () => {
    setIsLoading(true);
    switch (action) {
      case "bannerNew": {
        try {
          const bannerTemplate = await getData("get_all_for_new");
          bannerTemplate.this_ban = getNewBanner();
          setBanner(bannerTemplate);
          setTimeout(async () => {
            await fetchPromos(); // fetch after banner is set
          }, 0);
          break;
        } catch (e) {
          showAlert(e.message);
        } finally {
          setIsLoading(false);
        }
        break;
      }
      case "bannerEdit": {
        try {
          const data = {
            banner_id: id,
          };
          const bannerData = await getData("get_one_banner", data);
          setBanner(bannerData);
          setBannerName(bannerData.this_ban?.name);
          setPromos(bannerData.promos);
          break;
        } catch (e) {
          showAlert(e.message);
        } finally {
          setIsLoading(false);
        }
        break;
      }
      default: {
        showAlert("action not valid");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const preloadData = async () => {
      await updateBannerData();
      console.log("Data preloaded, setting dropzones");
      setDropZonesReady(true);
    };
    preloadData();
    return () => {
      setDropZonesReady(false);
    };
  }, []);

  useEffect(() => {
    if (!dropZonesReady) return;
    if (!desktopDropzoneContainerRef.current || !mobileDropzoneContainerRef.current) return;
    // if (Dropzone.instances?.length) {
    //   return;
    //   // console.log("found Dropzone instances, cleaning");
    //   // Dropzone.instances?.forEach((dz) => dz.destroy());
    //   // Dropzone.instances = [];
    // }
    console.log("creating new dropzones");
    dDropzone.current = new Dropzone(desktopDropzoneContainerRef.current, dropzoneOptions);
    setDesktopDropzone(dDropzone);
    mDropzone.current = new Dropzone(mobileDropzoneContainerRef.current, dropzoneOptions);
    setMobileDropzone(mDropzone);
    // showAlert("Dropzones created", true);

    return () => {
      dDropzone.current?.destroy();
      mDropzone.current?.destroy();
      setDesktopDropzone(null);
      setMobileDropzone(null);
      console.log("Dropzones destroyed");
    };
  }, [dropZonesReady]);

  useEffect(() => {
    if (!banner) {
      return;
    }
    const refreshPromosForCity = async () => {
      await fetchPromos();
    };
    refreshPromosForCity();
  }, [banner?.this_ban?.city_id]);

  return (
    <Grid
      container
      spacing={3}
    >
      {!!isLoading && (
        <Grid
          item
          xs={12}
          sm={6}
        >
          <CircularProgress color="inherit" />
        </Grid>
      )}

      {!isLoading && dropZonesReady && (
        <>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <MyTextInput
              label="Название банера (внутреннее)"
              value={banner?.this_ban?.name || ""}
              func={(e) => changeThisBanField("name", e)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <MyTextInput
              label="Заголовок"
              value={banner?.this_ban?.title || ""}
              func={(e) => changeThisBanField("title", e)}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
          >
            <MySelect
              is_none={false}
              label="Город"
              data={banner?.cities || []}
              value={banner?.this_ban?.city_id || ""}
              func={(e) => changeThisBanField("city_id", e)}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
          ></Grid>

          <Grid
            item
            xs={12}
            sm={6}
          >
            <MyDatePickerNew
              label="Дата старта"
              value={banner ? dayjs(banner?.this_ban?.date_start) : ""}
              func={(e) => changeDateRange("date_start", e)}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
          >
            <MyDatePickerNew
              label="Дата окончания"
              value={banner ? dayjs(banner?.this_ban?.date_end) : ""}
              func={(e) => changeDateRange("date_end", e)}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
          >
            <MyAutocomplite
              label="Позиции (вместо промика)"
              multiple={true}
              data={banner?.items || []}
              value={banner?.this_ban?.items || []}
              func={(...params) => changeAutoComplete("items", ...params)}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
          >
            <MyAutocomplite
              label="Промокод (вместо позиций)"
              multiple={false}
              data={promos || null}
              value={banner?.this_ban?.promo_id || null}
              func={(...params) => changeAutoComplete("promo_id", ...params)}
            />
          </Grid>

          <Grid
            item
            xs={6}
            sm={2}
          >
            <MyCheckBox
              label="Активность"
              value={!!+banner?.this_ban?.is_active}
              func={(e) => changeThisBanFieldBool("is_active", e)}
            />
          </Grid>
          <Grid
            item
            xs={6}
            sm={2}
          >
            <MyCheckBox
              label="Показывать в акциях"
              value={!!+banner?.this_ban?.is_active_actii}
              func={(e) => changeThisBanFieldBool("is_active_actii", e)}
            />
          </Grid>
          <Grid
            item
            xs={6}
            sm={2}
          >
            <MyCheckBox
              label="Показывать на главной"
              value={!!+banner?.this_ban?.is_active_home}
              func={(e) => changeThisBanFieldBool("is_active_home", e)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <MyTextInput
              label="Заголовок SEO"
              value={banner?.this_ban?.seo_title || ""}
              func={(e) => changeThisBanField("seo_title", e)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <TextField
              label="Описание SEO"
              value={banner?.this_ban?.seo_desc || ""}
              onChange={(e) => changeThisBanField("seo_desc", e)}
              multiline
              //rows={2}
              maxRows={10}
              variant="outlined"
              fullWidth
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
          >
            <Typography>Картинка на ПК разрешением 3700x1000 только JPG</Typography>

            {banner?.this_ban?.img?.length > 0 && (
              <div style={{ height: 400, display: "flex" }}>
                <img
                  style={{ width: "100%", height: "auto", alignSelf: "center", borderRadius: 20 }}
                  src={
                    "https://storage.yandexcloud.net/site-home-img/" +
                    banner?.this_ban?.img +
                    "_3700x1000.jpg?date_update=" +
                    banner?.this_ban?.date_update
                  }
                />
              </div>
            )}

            <div
              className="dropzone"
              id="for_img_edit"
              ref={desktopDropzoneContainerRef}
              style={{ width: "100%", minHeight: 150 }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
          >
            <Typography>
              Картинка мобильная соотношением 2:1 (например: 1000x500) только JPG
            </Typography>

            {banner?.this_ban?.img.length > 0 && (
              <div style={{ height: 400, display: "flex" }}>
                <img
                  style={{ width: "100%", height: "auto", alignSelf: "center", borderRadius: 40 }}
                  src={
                    "https://storage.yandexcloud.net/site-home-img/" +
                    banner?.this_ban?.img +
                    "_1000x500.jpg?date_update=" +
                    banner?.this_ban?.date_update
                  }
                />
              </div>
            )}

            <div
              className="dropzone"
              id="for_img_edit_"
              ref={mobileDropzoneContainerRef}
              style={{ width: "100%", minHeight: 150 }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
          >
            <TextEditor
              value={banner?.this_ban?.text || ""}
              func={(content) => changeThisBanField("text", null, content)}
              language="ru"
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}
