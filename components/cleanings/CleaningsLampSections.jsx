import { Box, Paper } from "@mui/material";
import CleaningsLampSummary from "./CleaningsLampSummary";
import CleaningsLampTable, { CleaningsInactiveLamp } from "./CleaningsLampTable";

export function fallbackLampGroups(lamps) {
  const predecessorById = new Map();
  lamps.forEach((lamp) => {
    if (lamp.replaced_by_lamp_id) predecessorById.set(String(lamp.replaced_by_lamp_id), lamp);
  });

  const grouped = new Set();
  const groups = [];
  lamps
    .filter((lamp) => Number(lamp.is_active) === 1)
    .forEach((active) => {
      const inactive = [];
      let previous = predecessorById.get(String(active.id));
      while (previous && !grouped.has(String(previous.id))) {
        inactive.push(previous);
        grouped.add(String(previous.id));
        previous = predecessorById.get(String(previous.id));
      }
      grouped.add(String(active.id));
      groups.push({ active, inactive });
    });

  lamps
    .filter((lamp) => !grouped.has(String(lamp.id)))
    .forEach((lamp) => {
      grouped.add(String(lamp.id));
      groups.push({ active: null, inactive: [lamp] });
    });

  return groups;
}

export default function CleaningsLampLifecycle({
  group,
  days,
  canEdit,
  onEditLamp,
  onHistory,
  onReplace,
  onEditActivity,
  onAddActivity,
}) {
  return (
    <Box sx={{ display: "grid", gap: 1.25, pb: 2 }}>
      {group.active ? (
        <Paper
          variant="outlined"
          sx={{ overflow: "hidden", borderRadius: "10px" }}
        >
          <CleaningsLampSummary
            lamp={group.active}
            canEdit={canEdit}
            onEdit={onEditLamp}
            onHistory={onHistory}
            onReplace={onReplace}
          />
          <CleaningsLampTable
            lamp={group.active}
            days={days}
            canEdit={canEdit}
            onEditActivity={onEditActivity}
            onAddActivity={onAddActivity}
          />
        </Paper>
      ) : null}

      {group.inactive.map((lamp) => (
        <CleaningsInactiveLamp
          key={lamp.id}
          lamp={lamp}
          days={days}
          onHistory={onHistory}
        />
      ))}
    </Box>
  );
}
