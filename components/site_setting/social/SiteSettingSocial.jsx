"use client";

import { MySelect, MyTextInput } from "@/ui/Forms";
import { Button, Grid, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useSocialStore } from "./useSocialStore";
import { useSiteSettingStore } from "../useSiteSettingStore";
import useApi from "@/src/hooks/useApi";
import HistoryLog from "@/ui/history/HistoryLog";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export function SiteSettingSocial() {
  const submodule = "social";

  const { moduleName, dataInfo, history, setDataInfo, setModuleName, setHistory } = useSocialStore(
    (s) => ({
      moduleName: s.moduleName,
      dataInfo: s.dataInfo,
      history: s.history,
      setDataInfo: s.setDataInfo,
      setModuleName: s.setModuleName,
      setHistory: s.setHistory,
    }),
  );
  const setSocialState = useSocialStore.setState;

  const getData = async (method, data = {}) => {
    const { setIsLoad, module: parentModule } = useSiteSettingStore.getState();
    const { api_laravel } = useApi(parentModule);
    setIsLoad(true);
    try {
      // inject submodule type
      data.submodule = "social";
      const result = await api_laravel(method, data);
      return result;
    } catch (e) {
      throw e;
    } finally {
      setIsLoad(false);
    }
  };

  const [cityId, cities, access, setCityId] = useSiteSettingStore((state) => [
    state.city_id,
    state.cities,
    state.access,
    state.setCityId,
  ]);

  const canEdit = (key) => handleUserAccess(access).userCan("edit", key);

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
      setHistory(res?.history || []);
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
      rt: dataInfo.rt,
      file1: "",
    };
    // console.log('Saving: ', data);
    await getData("save_social_data", data);
    await updateData();
  };

  const changeData = (type, event) => {
    setSocialState((state) => ({
      ...state,
      dataInfo: { ...state.dataInfo, [type]: event.target?.value || "" },
    }));
  };

  const restoreData = (item) => {
    const { id } = item;
    setSocialState((state) => {
      console.log(state.history);
      const historyItem = state.history.find((item) => item.id === id);
      if (!historyItem) return state;

      let restoredData = { ...state.dataInfo };
      try {
        const diff = JSON.parse(historyItem.diff_json);
        Object.entries(diff).forEach(([key, value]) => {
          restoredData[key] = value.from || "";
        });
      } catch (e) {
        console.error("Error parsing diff JSON for restore", e);
      }
      return {
        ...state,
        dataInfo: restoredData,
      };
    });
  };

  useEffect(() => {
    updateData();
  }, [cityId]);

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        sx={{ pb: 3 }}
        size={{
          xs: 12,
        }}
      >
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
              xs: 12,
            }}
          >
            <Typography variant="h5">{moduleName}</Typography>
          </Grid>
          {!!dataInfo && (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Вконтакте"
                    disabled={!canEdit("social")}
                    value={dataInfo?.vk || ""}
                    func={(e) => changeData("vk", e)}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="RuTube"
                    disabled={!canEdit("social")}
                    value={dataInfo?.rt || ""}
                    func={(e) => changeData("rt", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Одноклассники"
                    value={dataInfo?.ok || ""}
                    disabled={!canEdit("social")}
                    func={(e) => changeData("ok", e)}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Телеграм"
                    value={dataInfo?.tg || ""}
                    disabled={!canEdit("social")}
                    func={(e) => changeData("tg", e)}
                  />
                </Grid>
                {/* <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Facebook"
                    value={dataInfo?.fb || ""}
                    disabled={!canEdit('social')}
                    func={(e) => changeData("fb", e)}
                  />
                </Grid> */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {canEdit("social") ? (
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
      {!!history?.length && (
        <Grid size={12}>
          <HistoryLog
            history={history}
            restoreFunc={restoreData}
            mt={3}
          />
        </Grid>
      )}
    </Grid>
  );
}
