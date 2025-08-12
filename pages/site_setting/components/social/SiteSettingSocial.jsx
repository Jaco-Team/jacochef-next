import { MySelect, MyTextInput } from "@/ui/elements";
import { Backdrop, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { useSocialStore } from "./useSocialStore";

export function SiteSettingSocial() {
  const submodule = "social";

  const [isLoading, moduleName, dataInfo] = useSocialStore((state) => [
    state.isLoading,
    state.moduleName,
    state.dataInfo,
  ]);

  const { setDataInfo, setModuleName, getData } = useSocialStore.getState();

  const [cityId, cities, setCityId] = useSiteSettingStore((state) => [
    state.city_id,
    state.cities,
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
      style={{ position: "relative" }}
    >
      <Backdrop
        style={{ zIndex: 99, position: "absolute", inset: 0 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid
        item
        xs={12}
        sx={{ pb: 3 }}
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
          <Grid
            item
            style={{ display: "flex", justifyContent: "center", padding: "1em" }}
          >
            <Typography>Выберите город.</Typography>
          </Grid>
        </>
      )}
      {cityId >= 0 && (
        <>
          <Grid
            item
            xs={12}
            sx={{ pb: 3 }}
          >
            <Typography variant="h5">{moduleName}</Typography>
          </Grid>
          {!!dataInfo && (
            <Grid
              item
              xs={12}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Вконтакте"
                    value={dataInfo?.vk || ""}
                    func={(e) => changeData("vk", e)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Инстаграм"
                    value={dataInfo?.inst || ""}
                    func={(e) => changeData("inst", e)}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Одноклассники"
                    value={dataInfo?.ok || ""}
                    func={(e) => changeData("ok", e)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Телеграм"
                    value={dataInfo?.tg || ""}
                    func={(e) => changeData("tg", e)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Facebook"
                    value={dataInfo?.fb || ""}
                    func={(e) => changeData("fb", e)}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Button
                    variant="contained"
                    onClick={saveData}
                  >
                    Обновить данные
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
}
