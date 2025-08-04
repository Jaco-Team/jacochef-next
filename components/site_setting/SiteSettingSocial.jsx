import { MyTextInput } from "@/ui/elements";
import { Backdrop, Button, CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { SiteSettingModal } from "./SiteSettingModal";
import { api_laravel } from "@/src/api_new";

export function SiteSettingSocial(props) {
  const { parentModule, cityId = 0 } = props;
  const submodule = "socialnetwork";
  const [moduleName, setModuleName] = useState("");
  const [dataInfo, setDataInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async (method, data = {}) => {
    setIsLoading(true);
    const res = api_laravel(parentModule, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });

    return res;
  };

  const updateData = async () => {
    if (cityId === 0) return;
    const data = {
      city_id: cityId,
      submodule,
    };

    const res = await getData("get_social_data", data);
    setDataInfo(res.links);
    setModuleName(res.submodule.name);
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
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid
        container
        spacing={3}
        className="container_first_child"
      >
        <Grid
          item
          xs={12}
          sm={12}
        >
          <h2>{moduleName}</h2>
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
    </>
  );
}
