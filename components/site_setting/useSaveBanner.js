import { useState } from "react";
import { useBannerModalStore } from "./useBannerModalStore";

export default function useSaveBanner(showAlert) {
  const [click, setClick] = useState(false);
  const desktopDropzone = useBannerModalStore(state => state.desktopDropzone);
  const mobileDropzone = useBannerModalStore(state => state.mobileDropzone);
  const isInitD = useBannerModalStore(state => state.isInitD);
  const isInitM = useBannerModalStore(state => state.isInitM);
  const setIsInitD = useBannerModalStore(state => state.setIsInitD);
  const setIsInitM = useBannerModalStore(state => state.setIsInitM);

  const saveNew = async (banner) => {
    if (!click) {
      setClick(true);

      banner.this_ban.items = banner.this_ban.items.reduce((saveItems, item) => {
        item = { item_id: item.id };

        saveItems = [...saveItems, ...[item]];

        return saveItems;
      }, []);

      banner.this_ban.date_start = dayjs(banner.this_ban.date_start).format("YYYY-MM-DD");
      banner.this_ban.date_end = dayjs(banner.this_ban.date_end).format("YYYY-MM-DD");

      const data = banner.this_ban;

      const res = await getData("save_new", data);

      if (!res?.st) {
        showAlert(res.text, res.st);
      } else {
        if (desktopDropzone?.current?.files.length && mobileDropzone?.current?.files.length) {
          let save_img = false;
          let save_img_m = false;

          if (myDropzone["files"].length && isInitD === false) {
            setIsInitD(true);

            desktopDropzone?.current?.on("sending", (file, xhr, data) => {
              data.append("name", banner.this_ban.name);
              data.append("id", res.id);
              data.append("type", "full");
            });

            desktopDropzone?.current?.on("queuecomplete", (data) => {
              var check_img = false;

              myDropzone["files"].map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                showAlert("Ошибка при загрузке фотографии");
                return;
              }
              save_img = true;
              setIsInitD(false);
            });
          }

          if (myDropzone_m["files"].length && isInitM === false) {
            setIsInitM(true);

            mobileDropzone?.current?.on("sending", (file, xhr, data1) => {
              data1.append("name", banner.this_ban.name);
              data1.append("id", res.id);
              data1.append("type", "mobile");
            });

            mobileDropzone?.current?.on("queuecomplete", (data) => {
              var check_img = false;

              myDropzone_m["files"].map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                showAlert("Ошибка при загрузке фотографии");
                return;
              }
              save_img_m = true;
              setIsInitM(false);
            });
          }

          setTimeout(() => {
            if (save_img && save_img_m) {
              onClose(true);
            }
          }, 3000);

          desktopDropzone?.current?.processQueue();
          mobileDropzone?.current?.processQueue();
        } else if (desktopDropzone?.current?.files.length || mobileDropzone?.current?.files.length) {
          if (myDropzone["files"].length > 0) {
            if (myDropzone["files"].length > 0 && isInitD === false) {
              setIsInitD(true);

              desktopDropzone?.current?.on("sending", (file, xhr, data) => {
                data.append("name", banner.this_ban.name);
                data.append("id", res.id);
                data.append("type", "full");
              });

              desktopDropzone?.current?.on("queuecomplete", () => {
                let check_img = false;

                myDropzone["files"].map((item) => {
                  if (item["status"] == "error") {
                    check_img = true;
                  }
                });

                if (check_img) {
                  showAlert("Ошибка при загрузке фотографии");
                  return;
                }
                setTimeout(() => {
                  onClose(true);
                }, 1000);
                setIsInitD(false);
              });
            }

            desktopDropzone?.current?.processQueue();
          }

          if (myDropzone_m["files"].length > 0) {
            if (myDropzone_m["files"].length > 0 && isInitM === false) {
              setIsInitM(true);

              mobileDropzone?.current?.on("sending", (file, xhr, data1) => {
                data1.append("name", banner.this_ban.name);
                data1.append("id", res.id);
                data1.append("type", "mobile");
              });

              mobileDropzone?.current?.on("queuecomplete", (data) => {
                var check_img = false;

                myDropzone_m["files"].map((item, key) => {
                  if (item["status"] == "error") {
                    check_img = true;
                  }
                });

                if (check_img) {
                  showAlert("Ошибка при загрузке фотографии", "error");
                  return;
                }

                setTimeout(() => {
                  onClose(true);
                }, 1000);

                setIsInitM(false);
              });
            }

            mobileDropzone?.current?.processQueue();
          }
        } else {
          onClose(true);
        }
      }

      setTimeout(() => {
        setClick(false);
      }, 300);
    }
  };

  const saveEdit = async (banner) => {
    if (!click) {
      setClick(true);
      banner.this_ban.items = banner.this_ban.items.reduce((saveItems, item) => {
        item = { item_id: item.id };

        saveItems = [...saveItems, ...[item]];

        return saveItems;
      }, []);

      banner.this_ban.date_start = dayjs(banner.this_ban.date_start).format("YYYY-MM-DD");
      banner.this_ban.date_end = dayjs(banner.this_ban.date_end).format("YYYY-MM-DD");

      const data = banner.this_ban;

      const res = await getData("save_edit", data);

      if (!res.st) {
        showAlert(res.text, "error");
      } else {
        if (desktopDropzone?.current?.files.length > 0 || mobileDropzone?.current?.files.length > 0) {
          if (myDropzone["files"].length > 0) {
            if (myDropzone["files"].length > 0 && isInitD === false) {
              setIsInitD(true);

              desktopDropzone?.current?.on("sending", (file, xhr, data) => {
                data.append("name", banner.this_ban.name);
                data.append("id", res.id);
                data.append("type", "full");
              });

              desktopDropzone?.current?.on("queuecomplete", (data) => {
                var check_img = false;

                myDropzone["files"].map((item, key) => {
                  if (item["status"] == "error") {
                    check_img = true;
                  }
                });

                if (check_img) {
                  showAlert("Ошибка при загрузке фотографии")
                  return;
                } 
                  setTimeout(() => {
                    setClose(true);
                  }, 1000);
                  setIsInitD(false);
              });
            }

            desktopDropzone?.current?.processQueue();
          }

          if (myDropzone_m["files"].length > 0) {
            if (myDropzone_m["files"].length > 0 && isInitM === false) {
              setIsInitM(true);

              mobileDropzone?.current?.current?.on("sending", (file, xhr, data1) => {
                data1.append("name", banner.this_ban.name);
                data1.append("id", res.id);
                data1.append("type", "mobile");
              });

              mobileDropzone?.current?.on("queuecomplete", (data) => {
                var check_img = false;

                myDropzone_m["files"].map((item, key) => {
                  if (item["status"] == "error") {
                    check_img = true;
                  }
                });

                if (check_img) {
                  setState({
                    openAlert: true,
                    err_status: false,
                    err_text: "Ошибка при загрузке фотографии",
                  });

                  return;
                } else {
                  setTimeout(() => {
                    onClose(true);
                  }, 1000);
                }

                setIsInitM(false);
              });
            }

            mobileDropzone?.current?.processQueue();
          }
        } else {
          onClose(true);
        }
      }

      setTimeout(() => {
        setClick(false);
      }, 300);
    }
  };

  return {saveNew, saveEdit};
}
