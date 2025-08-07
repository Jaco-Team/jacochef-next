import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Grid, Backdrop, Box, CircularProgress } from "@mui/material";
import { MyAlert, MySelect } from "@/ui/elements";

import { SiteSettingSocial } from "@/components/site_setting/SiteSettingSocial";
import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";
import { SiteSettingBanners } from "@/components/site_setting/SiteSettingBanners";
import { SiteSettingModal } from "@/components/site_setting/SiteSettingModal";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function SiteSetting() {
  const loadData = async () => {
    const { getData, setCities, setModuleName, setData } = useSiteSettingStore.getState();
    const data = await getData("get_all");
    setData(data);
    setCities(data.cities);
    setModuleName(data.module_info.name);
    document.title = data.module_info.name;
  };

  const handleChangeCity = (event) => {
    const { changeCity } = useSiteSettingStore.getState();
    changeCity(event.target.value);
  };

  const { setOpenAlert, handleResize, closeModal } = useSiteSettingStore.getState();
  const {
    err_status,
    err_text,
    is_load,
    module_name,
    cities,
    city_id,
    modalDialog,
    modalContent,
    modalTitle,
    customModalActions,
    openAlert,
    fullScreen,
  } = useSiteSettingStore((s) => ({
    err_status: s.err_status,
    err_text: s.err_text,
    is_load: s.is_load,
    module_name: s.module_name,
    cities: s.cities,
    city_id: s.city_id,
    modalDialog: s.modalDialog,
    modalContent: s.modalContent,
    modalTitle: s.modalTitle,
    customModalActions: s.customModalActions,
    openAlert: s.openAlert,
    fullScreen: s.fullScreen,
  }));

  useEffect(() => {
    const preload = async () => await loadData();
    preload();
  }, []);

  return (
    <>
      <Backdrop
        open={is_load}
        style={{ zIndex: 99 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={err_status}
        text={err_text}
      />
      <SiteSettingModal
        open={modalDialog}
        title={modalTitle}
        fullScreen={fullScreen}
        fullWidth={true}
        closeModal={closeModal}
        customActions={
          typeof customModalActions === "function" ? customModalActions() : customModalActions
        }
      >
        {typeof modalContent === "function" ? modalContent() : modalContent}
      </SiteSettingModal>
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
          <h1>{module_name}</h1>
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
        >
          <MySelect
            data={cities}
            value={city_id || "-1"}
            func={handleChangeCity}
            label="Город"
            is_none={false}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
        >
          <SiteSettingSocial />
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
        >
          <SiteSettingBanners />
        </Grid>
      </Grid>
    </>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
