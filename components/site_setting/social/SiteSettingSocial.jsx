"use client";

import { MySelect, MyTextInput } from "@/components/shared/Forms";
import { Button, Grid, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useSocialStore } from "./useSocialStore";
import { useSiteSettingStore } from "../useSiteSettingStore";

export function SiteSettingSocial() {
  const submodule = "social";

  const [moduleName, dataInfo] = useSocialStore((state) => [
    state.moduleName,
    state.dataInfo,
  ]);

  const { setDataInfo, setModuleName, getData } = useSocialStore.getState();

  const [cityId, cities, acces, setCityId] = useSiteSettingStore((state) => [
    state.city_id,
    state.cities,
    state.acces,
    state.setCityId,
  ]);

  const updateData = useCallback(async () => {
    if (cityId < 0) {
      setDataInfo([]);
      return;
    }
    const data = {
      city_id: cityId,
      submodule,
    };
    try {
      const res = await getData("get_social_data", data);
      setDataInfo(res?.links || []);
      setModuleName(res?.submodule?.name || "");
    } catch (e) {
      console.log(`Error getting social networks data: ${e.message}`);
    }
  }, [cityId]);

  const saveData = async () => {
    const data = {
      submodule,
      city_id: cityId,
      vk: dataInfo.vk,
      inst: dataInfo.inst,
      ok: dataInfo.ok,
      tg: dataInfo.tg,
      fb: dataInfo.fb,
      file1: "",
    };
    await getData("save_social_data", data);
  };

  const changeData = (type, event) => {
    setDataInfo((info) => ({ ...info, [type]: event.target?.value || "" }));
  };

  useEffect(() => {
    updateData();
  }, [updateData]);

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        sx={{ pb: 3 }}
        size={{
          xs: 12
        }}>
        <MySelect
          data={cities.filter((city) => city.id !== -1)}
          value={cityId}
          func={(e) => setCityId(e.target?.value)}
          label="Город"
          is_none={false}
        />
      </Grid>
      {cityId === -1 && (
        <>
          <Grid style={{ display: "flex", justifyContent: "center", padding: "1em" }}>
            <Typography>Выберите город.</Typography>
          </Grid>
        </>
      )}
      {cityId >= 0 && (
        <>
          <Grid
            sx={{ pb: 3 }}
            size={{
              xs: 12
            }}>
            <Typography variant="h5">{moduleName}</Typography>
          </Grid>
          {!!dataInfo && (
            <Grid
              size={{
                xs: 12
              }}>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyTextInput
                    label="Вконтакте"
                    disabled={acces.social_view && !acces.social_edit}
                    value={dataInfo?.vk || ""}
                    func={(e) => changeData("vk", e)}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyTextInput
                    label="Инстаграм"
                    disabled={acces.social_view && !acces.social_edit}
                    value={dataInfo?.inst || ""}
                    func={(e) => changeData("inst", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyTextInput
                    label="Одноклассники"
                    value={dataInfo?.ok || ""}
                    disabled={acces.social_view && !acces.social_edit}
                    func={(e) => changeData("ok", e)}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyTextInput
                    label="Телеграм"
                    value={dataInfo?.tg || ""}
                    disabled={acces.social_view && !acces.social_edit}
                    func={(e) => changeData("tg", e)}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyTextInput
                    label="Facebook"
                    value={dataInfo?.fb || ""}
                    disabled={acces.social_view && !acces.social_edit}
                    func={(e) => changeData("fb", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  {acces.social_edit ? (
                    <Button
                      variant="contained"
                      onClick={saveData}
                    >
                      Обновить данные
                    </Button>
                  ) : null}
                </Grid>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
}
