import dayjs from "dayjs";

// Bootstrap registers older revisions later, so its timestamp is not their save time.
const mutationSources = new Set(["user", "flag", "image", "image_restore"]);
export function revisionSavedAt(row) {
  if (!mutationSources.has(row?.revision_source) || !row?.revision_saved_at) return null;
  return dayjs(row.revision_saved_at).isValid() ? row.revision_saved_at : null;
}

export function formatRevisionSavedAt(row) {
  const savedAt = revisionSavedAt(row);
  return savedAt ? dayjs(savedAt).format("DD.MM.YYYY HH:mm") : "Неизвестно";
}
