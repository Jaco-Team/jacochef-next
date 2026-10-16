"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { JacoModal, JacoSurface } from "@/design-system/shared/ui";
import { historyChanges, historyTimestamp, historyValue } from "./catalogModel.mjs";

export default function CatalogHistory({ node, api, onClose, withLoading }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!node) return;
    setItems([]);
    setError("");
    withLoading(() => api.getSettingHistory({ id: node.id }))
      .then((response) => setItems((response?.data ?? response)?.history || []))
      .catch(() => setError("Не удалось загрузить историю изменений."));
  }, [api, node, withLoading]);
  return (
    <JacoModal
      open={Boolean(node)}
      onClose={onClose}
      title={`История: ${node?.name || ""}`}
      maxWidth="sm"
    >
      <Stack spacing={1.5}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {!error && items.length === 0 ? (
          <Typography color="text.secondary">Изменений пока нет.</Typography>
        ) : null}
        {items.map((item) => {
          const changes = historyChanges(item);
          return (
            <JacoSurface
              key={item.id}
              variant="outlined"
              sx={{ p: 1.5 }}
            >
              <Typography fontWeight={700}>
                {item.event_type === "create" ? "Создание" : "Изменение"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {item.actor_name || "Система"} · {historyTimestamp(item.created_at)}
              </Typography>
              {changes.length ? (
                <Stack
                  spacing={0.5}
                  sx={{ mt: 1 }}
                >
                  {changes.map((change) => (
                    <Typography
                      key={change.field}
                      variant="body2"
                    >
                      <Box
                        component="span"
                        sx={{ color: "text.secondary" }}
                      >
                        {change.label}:{" "}
                      </Box>
                      {historyValue(change.from, change.field)} →{" "}
                      {historyValue(change.to, change.field)}
                    </Typography>
                  ))}
                </Stack>
              ) : null}
            </JacoSurface>
          );
        })}
      </Stack>
    </JacoModal>
  );
}
