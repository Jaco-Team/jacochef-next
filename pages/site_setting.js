import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Grid, Backdrop, Box, CircularProgress, Tabs, Tab } from "@mui/material";

import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";
import { SiteSettingBanners } from "@/components/site_setting/banners/SiteSettingBanners";
import { SiteSettingModal } from "@/components/site_setting/SiteSettingModal";
import { SiteSettingPages } from "@/components/site_setting/seo/SiteSettingPages";
import { SiteSettingSocial } from "@/components/site_setting/social/SiteSettingSocial";
import { SiteSettingCategory } from "@/components/site_setting/category/SiteSettingCategory";
import MyAlert from "@/ui/MyAlert";
import TabPanel from "@/ui/TabPanel/TabPanel";
import a11yProps from "@/ui/TabPanel/a11yProps";

const subMap = {
  social: SiteSettingSocial,
  banners: SiteSettingBanners,
  seo: SiteSettingPages,
  category: SiteSettingCategory,
};

export default function SiteSetting() {
  const {
    getData,
    setCities,
    setModuleName,
    setData,
    setOpenAlert,
    closeModal,
    setActiveTab,
    setAccess,
  } = useSiteSettingStore.getState();
  const {
    subModules,
    activeTab,
    err_status,
    err_text,
    is_load,
    module_name,
    modalDialog,
    modalContent,
    modalTitle,
    customModalActions,
    openAlert,
    showAlert,
  } = useSiteSettingStore((s) => ({
    subModules: s.subModules,
    activeTab: s.activeTab,
    err_status: s.err_status,
    err_text: s.err_text,
    is_load: s.is_load,
    module_name: s.module_name,
    modalDialog: s.modalDialog,
    modalContent: s.modalContent,
    modalTitle: s.modalTitle,
    customModalActions: s.customModalActions,
    openAlert: s.openAlert,
    showAlert: s.showAlert,
  }));

  const [subList, setSubList] = useState([]);

  const loadData = async () => {
    try {
      const data = await getData("get_all");
      setData(data);
      setCities(data?.cities);
      setModuleName(data.module_info.name);
      setSubList(
        subModules.filter(
          (sub) => data.access[`${sub.key}_view`] === 1 || data.access[`${sub.key}_edit`] === 1,
        ),
      );
      setAccess(data.access);
      document.title = data.module_info.name;
    } catch (error) {
      showAlert(`Error loading data: ${error.message}`);
    }
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
        // fullScreen={fullScreen}
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
        <Grid size={12}>
          <h1>{module_name}</h1>
        </Grid>

        <Grid size={12}>
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
          size={12}
          sx={{ p: 3 }}
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
            );
          })}
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
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
