import { useState } from "react";
import { useBannerModalStore } from "../banners/useBannerModalStore";
import { buildBannerDTO } from "../banners/bannerUtils";

export default function useSaveBanner(showAlert, getData, onClose) {
  const [click, setClick] = useState(false);
  const [isInitD, setIsInitD] = useState(false);
  const [isInitM, setIsInitM] = useState(false);

  const saveNew = async () => {
    const { desktopDropzone, mobileDropzone } = useBannerModalStore.getState();
    const banner = buildBannerDTO(useBannerModalStore.getState().banner);
    if (!banner) {
      showAlert("No banner data provided", "error");
      return;
    }
    if (!desktopDropzone || !mobileDropzone) {
      showAlert("Dropzones are not ready", "error");
      return;
    }

    const desktopFiles = desktopDropzone.getAcceptedFiles();
    const mobileFiles = mobileDropzone.getAcceptedFiles();

    if (!click) {
      setClick(true);
      const data = banner.this_ban;
      try {
        const res = await getData("save_new_banner", data);
        if (!res?.st) {
          showAlert(res.text);
          return;
        }
      } catch (error) {
        showAlert(`Error saving banner: ${error.message}`, "error");
      }
      
      if (desktopFiles?.length && mobileFiles?.length) {
        let save_img = false;
        let save_img_m = false;

        if (desktopFiles?.length && isInitD === false) {
          setIsInitD(true);

          desktopDropzone.on("sending", (file, xhr, data) => {
            data.append("name", banner.this_ban.name);
            data.append("id", res.id);
            data.append("type", "full");
          });

          desktopDropzone.on("queuecomplete", () => {
            let check_img = false;

            desktopFiles?.map((item) => {
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

        if (mobileFiles?.length && isInitM === false) {
          setIsInitM(true);

          mobileDropzone.on("sending", (file, xhr, data) => {
            data.append("name", banner.this_ban.name);
            data.append("id", res.id);
            data.append("type", "mobile");
          });

          mobileDropzone.on("queuecomplete", (data) => {
            let check_img = false;

            mobileFiles?.map((item, key) => {
              if (item["status"] == "error") {
                check_img = true;
              }
            });

            if (check_img) {
              showAlert("Ошибка при загрузке фотографии", "error");
              return;
            }
            save_img_m = true;
            setIsInitM(false);
          });
        }

        setTimeout(() => {
          if (save_img && save_img_m) {
            onClose();
          }
        }, 3000);
        desktopDropzone.processQueue();
        mobileDropzone.processQueue();
      } else if (desktopFiles?.length || mobileFiles?.length) {
        if (desktopFiles?.length > 0) {
          if (desktopFiles?.length > 0 && isInitD === false) {
            setIsInitD(true);
            desktopDropzone.on("sending", (file, xhr, data) => {
              data.append("name", banner.this_ban.name);
              data.append("id", res.id);
              data.append("type", "full");
            });

            desktopDropzone.on("queuecomplete", () => {
              let check_img = false;
              desktopFiles?.map((item) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                showAlert("Ошибка при загрузке фотографии");
                return;
              }
              setTimeout(() => {
                onClose();
              }, 3000);
              setIsInitD(false);
            });
          }
          desktopDropzone.processQueue();
        }

        if (mobileFiles?.length > 0) {
          if (isInitM === false) {
            setIsInitM(true);
            mobileDropzone.on("sending", (file, xhr, data) => {
              data.append("name", banner.this_ban.name);
              data.append("id", res.id);
              data.append("type", "mobile");
            });

            mobileDropzone.on("queuecomplete", (data) => {
              let check_img = false;

              mobileFiles?.map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                showAlert("Ошибка при загрузке фотографии", "error");
                return;
              }
              setTimeout(() => {
                onClose();
              }, 3000);
              setIsInitM(false);
            });
          }
          mobileDropzone.processQueue();
        }
      } else {
        setTimeout(() => {
          onClose();
        }, 300);
      }
      setTimeout(() => {
        setClick(false);
      }, 1000);
    }
  };

  const saveEdit = async () => {
    const { desktopDropzone, mobileDropzone } = useBannerModalStore.getState();
    const banner = buildBannerDTO(useBannerModalStore.getState().banner);
    if (!banner) {
      showAlert("No banner provided");
      return;
    }
    if (!desktopDropzone || !mobileDropzone) {
      showAlert("Dropzones refs are ampty");
      return;
    }

    if (!click) {
      setClick(true);
      const data = banner.this_ban;
      const res = await getData("save_edit_banner", data);
      if (!res.st) {
        showAlert(res.text);
        return;
      }
      if (
        desktopFiles?.length > 0 ||
        mobileFiles?.length > 0
      ) {
        if (desktopFiles?.length > 0) {
          if (isInitD === false) {
            setIsInitD(true);
            desktopDropzone.on("sending", (file, xhr, data) => {
              data.append("name", banner.this_ban.name);
              data.append("id", res.id);
              data.append("type", "full");
            });

            desktopDropzone.on("queuecomplete", (data) => {
              let check_img = false;
              desktopFiles?.map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });
              if (check_img) {
                showAlert("Ошибка при загрузке фотографии");
              }
              setTimeout(() => {
                onClose();
              }, 1000);
              setIsInitD(false);
            });
          }
          desktopDropzone.processQueue();
        }

        if (mobileFiles?.length > 0) {
          if (isInitM === false) {
            setIsInitM(true);
            mobileDropzone.on("sending", (file, xhr, data) => {
              data.append("name", banner.this_ban.name);
              data.append("id", res.id);
              data.append("type", "mobile");
            });

            mobileDropzone.on("queuecomplete", (data) => {
              let check_img = false;

              mobileFiles?.map((item) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                showAlert("Ошибка при загрузке фотографии");
              } else {
                setTimeout(() => {
                  onClose();
                }, 1000);
              }
              setIsInitM(false);
            });
          }
          mobileDropzone.processQueue();
        }
      } else {
        showAlert("No files to upload");
        onClose();
      }

      setTimeout(() => {
        setClick(false);
      }, 1000);
    }
  };

  return { saveNew, saveEdit };
}
