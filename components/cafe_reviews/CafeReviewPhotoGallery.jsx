import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import { blockBorder, textSecondary } from "./shared";

export default function CafeReviewPhotoGallery({ photos, getPhoto, idPrefix }) {
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
        sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}
      >
        Фото
      </Typography>
      {loading ? (
        <Box
          role="status"
          aria-label="Загрузка фотографий"
          sx={{ minHeight: 100, display: "grid", placeItems: "center" }}
        >
          <CircularProgress size={28} />
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
                  border: `1px solid ${blockBorder}`,
                  borderRadius: "10px",
                  color: textSecondary,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <BrokenImageOutlinedIcon />
                  <Typography sx={{ fontSize: 12 }}>Фото недоступно</Typography>
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
                  border: `1px solid ${blockBorder}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "none",
                  cursor: "pointer",
                  "&:focus-visible": { outline: "3px solid", outlineColor: "primary.light" },
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

      <Dialog
        open={Boolean(activePhoto)}
        onClose={() => setActivePhoto(null)}
        maxWidth="md"
        fullWidth
        aria-labelledby={`${idPrefix}-photo-preview-title`}
      >
        <DialogTitle
          id={`${idPrefix}-photo-preview-title`}
          sx={{ pr: 7 }}
        >
          Фото к отзыву
          <IconButton
            onClick={() => setActivePhoto(null)}
            aria-label="Закрыть просмотр фото"
            sx={{ position: "absolute", right: 12, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {activePhoto ? (
            <Box
              component="img"
              src={activePhoto.url}
              alt="Фото к отзыву в полном размере"
              sx={{ display: "block", width: "100%", maxHeight: "75vh", objectFit: "contain" }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
