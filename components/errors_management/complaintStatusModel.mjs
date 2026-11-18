export const COMPLAINT_STATUSES = [
  { id: "registered", name: "Зарегистрирована", tone: "neutral", variant: "soft" },
  { id: "sent_to_cafe", name: "Отправлена в кафе", tone: "warning", variant: "filled" },
  { id: "accepted_by_cafe", name: "Принята кафе", tone: "warning", variant: "soft" },
  { id: "resolved", name: "Решена", tone: "success", variant: "soft" },
  { id: "cancelled", name: "Отменена", tone: "danger", variant: "outlined" },
];

const UNKNOWN_STATUS_APPEARANCE = { tone: "neutral", variant: "outlined" };

export function complaintStatusAppearance(status) {
  const definition = COMPLAINT_STATUSES.find((item) => item.id === status);
  return definition
    ? { tone: definition.tone, variant: definition.variant }
    : UNKNOWN_STATUS_APPEARANCE;
}

export function complaintStatusOptions() {
  return COMPLAINT_STATUSES.map(({ id, name }) => ({ id, name }));
}

export const REMOVED_ERRORS_LEGEND = "Есть снятые ошибки";
