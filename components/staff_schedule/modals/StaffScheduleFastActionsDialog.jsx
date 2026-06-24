import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import Looks3Icon from "@mui/icons-material/Looks3";
import Looks4Icon from "@mui/icons-material/Looks4";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import {
  Avatar,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { isEnabled } from "../staffScheduleHelpers";

const FAST_TIME_WEEK_OPTIONS = [
  { type: 1, altType: 16, icon: LooksOneIcon, labelPart1: "С 1 числа", labelPart2: "С 16 числа" },
  { type: 2, altType: 17, icon: LooksTwoIcon, labelPart1: "С 2 числа", labelPart2: "С 17 числа" },
  { type: 3, altType: 18, icon: Looks3Icon, labelPart1: "С 3 числа", labelPart2: "С 18 числа" },
  { type: 4, altType: 19, icon: Looks4Icon, labelPart1: "С 4 числа", labelPart2: "С 19 числа" },
];

function ActionDialog({ open, onClose, title, children }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        {title}
        <IconButton
          aria-label="закрыть"
          onClick={onClose}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      {children}
    </Dialog>
  );
}

export default function StaffScheduleFastActionsDialog({
  state,
  access,
  selectedPart,
  onClose,
  onOpenTimeWeek,
  onOpenSmenaList,
  onOpenPointList,
  onSelectSmena,
  onSelectPoint,
  onSelectTimeWeekType,
}) {
  const user = state?.user;
  const title = user
    ? [user.full_app_name || user.app_name, user.user_name].filter(Boolean).join(" ")
    : "";

  if (state?.screen === "smena-list" && state?.open) {
    return (
      <ActionDialog
        open
        onClose={onClose}
        title={`Смена ${user?.user_name || ""}`}
      >
        <List sx={{ pt: 0 }}>
          {(user?.other_smens || []).map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => onSelectSmena(item.id)}
            >
              <ListItemAvatar>
                <Avatar>
                  <SyncAltIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.name} />
            </ListItemButton>
          ))}
        </List>
      </ActionDialog>
    );
  }

  if (state?.screen === "point-list" && state?.open) {
    return (
      <ActionDialog
        open
        onClose={onClose}
        title={`Смена точка ${user?.user_name || ""}`}
      >
        <List sx={{ pt: 0 }}>
          {(user?.other_points || []).map((item) => (
            <ListItemButton
              key={`${item.point_id}-${item.smena_id}`}
              onClick={() => onSelectPoint(item)}
            >
              <ListItemAvatar>
                <Avatar>
                  <HomeWorkIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.name} />
            </ListItemButton>
          ))}
        </List>
      </ActionDialog>
    );
  }

  if (state?.screen === "time-week" && state?.open) {
    const suffix = " 2/2 с 10 до 22 на две недели";

    return (
      <ActionDialog
        open
        onClose={onClose}
        title={title}
      >
        <List sx={{ pt: 0 }}>
          {FAST_TIME_WEEK_OPTIONS.map((item) => {
            const Icon = item.icon;
            const type = selectedPart === 0 ? item.type : item.altType;
            const label = `${selectedPart === 0 ? item.labelPart1 : item.labelPart2}${suffix}`;

            return (
              <ListItemButton
                key={type}
                onClick={() => onSelectTimeWeekType(type)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <Icon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          })}
        </List>
      </ActionDialog>
    );
  }

  if (!state?.open) {
    return null;
  }

  return (
    <ActionDialog
      open
      onClose={onClose}
      title={title}
    >
      <List sx={{ pt: 0 }}>
        {isEnabled(access?.fast_2_week_access) ? (
          <ListItemButton onClick={onOpenTimeWeek}>
            <ListItemAvatar>
              <Avatar>
                <AccessTimeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Сменить часы на 2 недели" />
          </ListItemButton>
        ) : null}

        {isEnabled(access?.fast_smena_access) ? (
          <ListItemButton onClick={onOpenSmenaList}>
            <ListItemAvatar>
              <Avatar>
                <SyncAltIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Сменить смену" />
          </ListItemButton>
        ) : null}

        {isEnabled(access?.fast_point_access) ? (
          <ListItemButton onClick={onOpenPointList}>
            <ListItemAvatar>
              <Avatar>
                <HomeWorkIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Сменить точку" />
          </ListItemButton>
        ) : null}
      </List>
    </ActionDialog>
  );
}
