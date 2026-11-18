export const MODULE_TABS = [
  { id: "journal", label: "Журнал жалоб", mobileLabel: "Журнал" },
  { id: "registration", label: "Регистрация", mobileLabel: "Регистрация" },
  { id: "statistics", label: "Статистика", mobileLabel: "Статистика" },
  { id: "settings", label: "Варианты решения жалоб", mobileLabel: "Настройки" },
];

export const COMMAND_PERMISSIONS = [
  "send_to_cafe",
  "resolve",
  "cafe_decision",
  "cancel",
  "remove_error",
];

function granted(value) {
  return value === true || value === 1 || value === "1";
}

export function normalizePermissions(raw) {
  const tabs = raw?.tabs && typeof raw.tabs === "object" ? raw.tabs : {};
  const commands = raw?.commands && typeof raw.commands === "object" ? raw.commands : {};
  return {
    tabs: Object.fromEntries(MODULE_TABS.map((tab) => [tab.id, granted(tabs[tab.id])])),
    settings_edit: granted(raw?.settings_edit),
    commands: Object.fromEntries(COMMAND_PERMISSIONS.map((key) => [key, granted(commands[key])])),
    tel: granted(raw?.tel),
  };
}

export function availableTabs(permissions) {
  return MODULE_TABS.filter((tab) => permissions?.tabs?.[tab.id] === true);
}

export function resolveTab(current, tabs) {
  return tabs.some((tab) => tab.id === current) ? current : (tabs[0]?.id ?? null);
}

export function commandPermission(command, status) {
  if (command === "send_to_cafe" || command === "cancel") return command;
  if (command === "accept" || command === "return_to_cc") return "cafe_decision";
  if (command === "resolve") return status === "registered" ? "resolve" : "cafe_decision";
  return null;
}

export function allowedCommands(detail, permissions) {
  const commands = Array.isArray(detail?.available_commands) ? detail.available_commands : [];
  return commands.filter((command) => {
    const permission = commandPermission(command, detail?.status);
    return Boolean(permission && permissions?.commands?.[permission] === true);
  });
}

export function isRemovedError(error) {
  return Boolean(error?.removed_at);
}

export function canRemoveError(error, permissions) {
  return (
    permissions?.commands?.remove_error === true &&
    error?.can_remove === true &&
    !isRemovedError(error)
  );
}

export function orderForViewer(orderDetails, canSeePhone) {
  if (canSeePhone || !orderDetails?.order) return orderDetails;
  return { ...orderDetails, order: { ...orderDetails.order, number: "" } };
}
