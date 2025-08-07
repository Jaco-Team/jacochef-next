import { MyTextInput } from "@/ui/elements";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSiteSettingStore } from "./useSiteSettingStore";

export function SiteSettingSocial() {
  const submodule = "social";
  const [moduleName, setModuleName] = useState("");
  const [dataInfo, setDataInfo] = useState(null);

  const cityId = useSiteSettingStore((state) => state.city_id);

  const getData = useSiteSettingStore((state) => state.getData);

  const updateData = async () => {
    if (cityId < 0) return;
    const data = {
      city_id: cityId,
      submodule,
    };
    try {
      const res = await getData("get_social_data", data);
      setDataInfo(res.links);
      setModuleName(res.submodule.name);
    } catch (e) {
      console.log(`Error getting socialnetworks data: ${e.message}`);
    } 
  };

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
    setDataInfo((info) => ({ ...info, [type]: event.target.value }));
  };

  useEffect(() => {
    const preloadData = async () => {
      await updateData();
    };
    preloadData();
  }, [cityId]);

  return (
    <>
      {cityId === -1 && (
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            style={{ display: "flex", justifyContent: "center", padding: "1em" }}
          >
            <Typography>Выберите город</Typography>
          </Grid>
        </Grid>
      )}
      {cityId >= 0 && (
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            sm={12}
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
        </Grid>
      )}
    </>
  );
}
