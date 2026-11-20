import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import {
  JacoModal,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTypography,
} from "@/design-system/shared/ui";

export default function CafeReviewPhotoGallery({ photos, getPhoto, idPrefix, title = "Фото" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const photoIds = photos.map((photo) => photo.id).join(",");

  useEffect(() => {
    let cancelled = false;
    const objectUrls = new Set();
    const revokeAll = () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };

    setActivePhoto(null);
    setItems([]);

    if (!photos.length) {
      setLoading(false);
      return undefined;
    }

    const load = async () => {
      setLoading(true);
      const results = await Promise.all(
        photos.map(async (photo) => {
          try {
            const response = await getPhoto(photo.id);
            if (!(response instanceof Blob)) throw new Error("Некорректный ответ с фотографией");
            const url = URL.createObjectURL(response);
            if (cancelled) {
              URL.revokeObjectURL(url);
              return null;
            }
            objectUrls.add(url);
            return { ...photo, url, error: false };
          } catch {
            return { ...photo, url: "", error: true };
          }
        }),
      );

      if (cancelled) return;

      setItems(results.filter(Boolean));
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
      revokeAll();
    };
  }, [getPhoto, photoIds]);

  if (!photos.length) return null;

  return (
    <Box
      component="section"
      aria-labelledby={`${idPrefix}-photos-title`}
    >
      <Typography
        id={`${idPrefix}-photos-title`}
        sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong, mb: 1 }}
      >
        {title}
      </Typography>
      {loading ? (
        <Box
          role="status"
          aria-label="Загрузка фотографий"
          sx={{ minHeight: 100, display: "grid", placeItems: "center" }}
        >
          <CircularProgress
            size={28}
            sx={{ color: uiColors.primary }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {items.map((photo, index) =>
            photo.error ? (
              <Box
                key={photo.id}
                role="status"
                sx={{
                  aspectRatio: "4 / 3",
                  display: "grid",
                  placeItems: "center",
                  border: `1px dashed ${uiColors.border}`,
                  borderRadius: uiRadii.md,
                  color: uiColors.text,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <BrokenImageOutlinedIcon />
                  <Typography sx={uiTypography.compactLabel}>Фото недоступно</Typography>
                </Box>
              </Box>
            ) : (
              <Box
                key={photo.id}
                component="button"
                type="button"
                onClick={() => setActivePhoto(photo)}
                aria-label={`Открыть фото ${index + 1}`}
                sx={{
                  p: 0,
                  border: `1px solid ${uiColors.border}`,
                  borderRadius: uiRadii.md,
                  overflow: "hidden",
                  background: "none",
                  cursor: "pointer",
                  "&:focus-visible": { outline: `3px solid ${uiStateColors.focusRing}` },
                }}
              >
                <Box
                  component="img"
                  src={photo.url}
                  alt={`Фото к отзыву ${index + 1}`}
                  sx={{ display: "block", width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
                />
              </Box>
            ),
          )}
        </Box>
      )}

      <JacoModal
        open={Boolean(activePhoto)}
        onClose={() => setActivePhoto(null)}
        title="Фото к отзыву"
        maxWidth="md"
      >
        {activePhoto ? (
          <Box
            component="img"
            src={activePhoto.url}
            alt="Фото к отзыву в полном размере"
            sx={{
              display: "block",
              width: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
              borderRadius: uiRadii.md,
            }}
          />
        ) : null}
      </JacoModal>
    </Box>
  );
}
