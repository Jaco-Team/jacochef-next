"use client";

import { useBannerModalStore } from "../banners/useBannerModalStore";
import { buildBannerDTO } from "../banners/bannerUtils";

export default function useSaveBanner(showAlert, getData, onClose) {
  const uploadFile = (dropzone, type, bannerId, bannerName) => {
    if (!dropzone.current || !dropzone.current?.getAcceptedFiles().length) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      dropzone.current?.on("sending", (file, xhr, formData) => {
        formData.append("name", bannerName);
        formData.append("id", bannerId);
        formData.append("type", type);
        formData.append("login", localStorage.getItem("token"));
      });

      dropzone.current?.on("error", (file, message) => {
        showAlert(`Failed to upload ${type} image: ${message}`);
        dropzone.current?.removeFile(file);
        resolve(false);
      });

      dropzone.current?.on("success", (file, response) => {
        resolve(response.data);
      });

      dropzone.current?.on("complete", (file) => {
        dropzone.current?.removeFile(file);
      });

      dropzone.current?.enable();
      dropzone.current?.processQueue();
    });
  };

  const saveBanner = async (isNew = true) => {
    const { desktopDropzone, mobileDropzone, banner } = useBannerModalStore.getState();
    const bannerDTO = buildBannerDTO(banner);

    if (!bannerDTO?.this_ban) {
      showAlert("Заполните все требуемые поля");
      return;
    }

    try {
      const method = isNew ? "save_new_banner" : "save_edit_banner";
      const res = await getData(method, bannerDTO.this_ban);

      if (!res?.st) {
        showAlert(res?.text || "Не удалось сохранить баннер");
        return;
      }

      const bannerId = res.id;
      const uploads = [];

      const desktopFiles = desktopDropzone.current?.getAcceptedFiles();
      const mobileFiles = mobileDropzone.current?.getAcceptedFiles();

      if (desktopFiles?.length) {
        uploads.push(uploadFile(desktopDropzone, "full", bannerId, bannerDTO.this_ban.name));
      }

      if (mobileFiles?.length) {
        uploads.push(uploadFile(mobileDropzone, "mobile", bannerId, bannerDTO.this_ban.name));
      }

      if (uploads.length) {
        const results = await Promise.all(uploads);
        if (results.some((res) => !res?.st)) {
          showAlert("Some images failed to upload");
          return;
        }
      }

      showAlert(
        `Баннер ${isNew ? "создан" : "обновлён"} успешно${
          uploads.length
            ? ` с ${uploads.length} изображени${uploads.length > 1 ? "ями" : "ем"}`
            : ""
        }`,
        true,
      );
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      showAlert(`Ошибка: ${error.message}`);
    }
  };

  return {
    saveNew: () => saveBanner(true),
    saveEdit: () => saveBanner(false),
  };
}
