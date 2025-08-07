import { useState } from "react";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { usePagesStore } from "./usePagesStore";
import useSavePage from "../hooks/useSavePage";
import { Button } from "@mui/material";
import PageTextModal from "./PageTextModal";

export default function SiteSettingPages() {
  const submodule = "seo";
  // Settings state
  const cityId = useSiteSettingStore((state) => state.city_id);
  const createModal = useSiteSettingStore((state) => state.createModal);
  const closeModal = useSiteSettingStore((state) => state.closeModal);
  const setModalTitle = useSiteSettingStore((state) => state.setModalTitle);
  const showAlert = useSiteSettingStore((state) => state.showAlert);
  // Page text state
  const { getData, setModuleName, setPages } = usePagesStore.getState();
  const [item, itemName, moduleName] = usePagesStore((s) => [s.item, s.itemName, s.moduleName]);

  
  const { saveNew, saveEdit } = useSavePage(closeModal, showAlert, getData);
  const [modalPrefix, setModalPrefix] = useState(useSiteSettingStore.getState().modalTitle);
  
  const fetchCoreData = useCallback(async () => {
    const data = {
      submodule,
      city_id: cityId,
    };
    try {
      const res = await getData("get_page_text_data", data);
      setModuleName(res.submodule.name);
      setPages(res.pages);
    } catch (e) {
      showAlert(`Fetch error: ${e}`, false);
    }
  }, [cityId]);

  const openModal = async (action, title, id = 0) => {
    setModalPrefix(title);
    createModal(
      () => (
        <PageTextModal
          getData={getData}
          showAlert={showAlert}
          cityId={cityId}
          action={action}
          item={this.state.item}
          itemName={this.state.itemName}
        />
      ),
      modalPrefix,
      () => (
        <Button
          variant="contained"
          onClick={async () => (action === "newPage" ? await saveNew() : await saveEdit())}
        >
          {action === "newPage" ? "Добавить" : "Сохранить"}
        </Button>
      )
    );
  };

  useEffect(() => {
    fetchCoreData();
  }, [fetchCoreData]);

  // update banner name in modal title
  useEffect(
    () => setModalTitle(`${modalPrefix}${itemName ? `: ${itemName}` : ""}`),
    [modalPrefix, itemName]
  );

  return (
    <>
      <PageTextModal
        open={this.state.modalDialog}
        onClose={() => this.setState({ modalDialog: false, itemName: "" })}
        method={this.state.method}
        mark={this.state.mark}
        item={this.state.item}
        itemName={this.state.itemName}
        save={this.save.bind(this)}
        fullScreen={this.state.fullScreen}
      />

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
          sm={12}
        >
          <h1>{module_name}</h1>
        </Grid>

        <Grid
          item
          xs={12}
          sm={3}
        >
          <Button
            onClick={() => openModal("newPage", "Новая страница")}
            variant="contained"
          >
            Добавить
          </Button>
        </Grid>
      </Grid>

      <Grid
        container
        mt={3}
        spacing={3}
        mb={5}
      >
        <Grid
          item
          xs={12}
          sm={12}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "2%" }}>#</TableCell>
                  <TableCell style={{ width: "10%" }}>Название</TableCell>
                  <TableCell style={{ width: "8%" }}>Город</TableCell>
                  <TableCell style={{ width: "20%" }}>Заголовок (title)</TableCell>
                  <TableCell style={{ width: "45%" }}>Описание (description)</TableCell>
                  <TableCell style={{ width: "15%" }}>Последнее обновление</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.pages.map((item, key) => (
                  <TableRow
                    key={key}
                    hover
                    style={{ cursor: "pointer" }}
                    onClick={this.openModal.bind(
                      this,
                      "editPage",
                      "Редактирование страницы",
                      item.id
                    )}
                  >
                    <TableCell>{key + 1}</TableCell>
                    <TableCell style={{ color: "#ff1744", fontWeight: 700 }}>
                      {item.page_name}
                    </TableCell>
                    <TableCell>{item.city_name}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.date_time_update}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}
