import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Grid, Backdrop, Box, CircularProgress, Tabs, Tab } from "@mui/material";
import { MyAlert, MySelect } from "@/ui/elements";

import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";
import { SiteSettingBanners } from "@/components/site_setting/banners/SiteSettingBanners";
import { SiteSettingModal } from "@/components/site_setting/SiteSettingModal";
import { SiteSettingPages } from "@/components/site_setting/seo/SiteSettingPages";
import { SiteSettingSocial } from "@/components/site_setting/social/SiteSettingSocial";

const subMap = {
  social: SiteSettingSocial,
  banners: SiteSettingBanners,
  seo: SiteSettingPages,
  category: SiteSettingSocial,
};

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
  const {
    getData,
    setCities,
    setModuleName,
    setData,
    setOpenAlert,
    closeModal,
    setCityId,
    setActiveTab,
  } = useSiteSettingStore.getState();
  const {
    subModules,
    activeTab,
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
    subModules: s.subModules,
    activeTab: s.activeTab,
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

  const [subList, setSubList] = useState([]);

  const loadData = async () => {
    const data = await getData("get_all");
    setData(data);
    setCities(data.cities);
    setModuleName(data.module_info.name);
    setSubList(subModules.filter((sub) => +data.access[sub.key] === 1));
    document.title = data.module_info.name;
  };
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
            func={(e) => setCityId(e.target?.value)}
            label="Город"
            is_none={false}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
        >
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            centered
            variant="fullWidth"
          >
            {subList.map((subm, i) => (
              <Tab
                key={subm.key}
                label={subm.title}
                {...a11yProps(i)}
              />
            ))}
          </Tabs>
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
        >
          {subList.map((subm, i) => {
            const MyComponent = subMap[subm.key];
            return (
            <TabPanel
              value={activeTab}
              index={i}
              id={subm.key}
              key={subm.key}
            >
              <MyComponent />
            </TabPanel>
          )})}
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
