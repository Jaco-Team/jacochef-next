import React from "react";
import Grid from "@mui/material/Grid";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyAlert, MySelect } from "@/ui/elements";

import { SiteSettingSocial } from "@/components/site_setting/SiteSettingSocial";
import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";
import { SiteSettingBanners } from "@/components/site_setting/SiteSettingBanners";
import { SiteSettingModal } from "@/components/site_setting/SiteSettingModal";

class SiteSetting_ extends React.Component {
  constructor(props) {
    super(props);
    // No local state, everything comes from the store
    this.store = useSiteSettingStore;
    this.state = this.store.getState();
  }

  componentDidMount() {
    // Subscribe to store updates
    this.unsubscribe = this.store.subscribe((state) => {
      this.setState(state);
    });

    // Initial data load
    this.loadData();
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  loadData = async () => {
    const { getData, setCities, setModuleName, setData } = this.store.getState();
    const data = await getData("get_all");
    setData(data);
    setCities(data.cities);
    setModuleName(data.module_info.name);
    document.title = data.module_info.name;
  };

  handleChangeCity = (event) => {
    const { changeCity } = this.store.getState();
    changeCity(event.target.value);
  };

  handleResize = () => {
    const { handleResize } = this.store.getState();
    handleResize();
  };

  render() {
    const {
      is_load,
      module_name,
      cities,
      city_id,
      openAlert,
      setOpenAlert,
      modalDialog,
      modalContent,
      modalTitle,
      fullScreen,
      closeModal,
      customModalActions
    } = this.state;
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
          status={useSiteSettingStore.getState().err_status}
          text={useSiteSettingStore.getState().err_text}
        />
        <SiteSettingModal
          open={modalDialog}
          title={modalTitle}
          fullScreen={fullScreen}
          fullWidth={true}
          closeModal={closeModal}
          customActions = {typeof customModalActions === 'function' ? customModalActions() : customModalActions}
        >
          {typeof modalContent === 'function' ? modalContent() : modalContent}
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
              value={city_id || '-1'}
              func={this.handleChangeCity}
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
}

export default function SiteSetting() {
  return <SiteSetting_ />;
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
