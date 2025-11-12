"use client";

import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import TestAccess from "@/ui/TestAccess";
import { Backdrop, CircularProgress, Grid } from "@mui/material";
import useDDSStore from "./useDDSStore";
import { api_laravel } from "@/src/api_new";
import { useEffect } from "react";

export default function DDS() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const { setStateKey, is_load, module, module_name } = useDDSStore();
  const setState = useDDSStore.setState;

  const getBaseData = async () => {
    const data = await getData("get_all");
    if (!data) {
      showAlert("Ошибка получения данных");
      return;
    }

    setState({
      access: data.acces,
      points: data.points,
      point: data.points[0],
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      getTabIndex();
    }, 100);

    setTimeout(async () => {
      await getDataPoint();
    }, 200);
  };

  const getData = async (method, data = {}) => {
    setStateKey("is_load", true);

    const res = api_laravel(module, method, data)
      .then((result) => result.data)
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setTimeout(() => {
          setStateKey("is_load", false);
        }, 500);
      });

    return res;
  };

  useEffect(() => {
    getBaseData();
  }, []);

  return (
    <>
      <Backdrop
        style={{ zIndex: 999 }}
        open={is_load}
      >
        <CircularProgress />
      </Backdrop>

      {/* <TestAccess
        access={access}
        setAccess={(access) => setStateKey("acces", { ...acces })}
      /> */}

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <h1>{module_name}</h1>
        </Grid>
      </Grid>
    </>
  );
}
