import React from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import {
  formatConfigHistoryDate,
  formatConfigHistoryDateTime,
  getConfigHistoryFieldDiffs,
  getConfigHistoryFirstVersionSummary,
  getConfigHistorySourceLabel,
  normalizeConfigHistoryList,
} from "@/components/site_sale_2/employeePromoConfigHistory";

function TruncatedValue({ value, emphasize }) {
  const text = value == null || value === "" ? "—" : String(value);

  return (
    <Typography
      component="span"
      title={text}
      sx={{
        fontWeight: emphasize ? 700 : 400,
        color: emphasize ? "text.primary" : "text.secondary",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        wordBreak: "break-word",
      }}
    >
      {text}
    </Typography>
  );
}

function VersionBody({ entry, previous, catalogs }) {
  if (!previous) {
    const summary = getConfigHistoryFirstVersionSummary(entry, catalogs);

    return (
      <Box>
        <Typography
          sx={{
            color: "text.secondary",
            mb: summary.length ? 1 : 0,
          }}
        >
          Первая зафиксированная версия
        </Typography>
        {summary.map((row) => (
          <Typography
            key={row.label}
            variant="body2"
            sx={{ py: 0.25 }}
          >
            {row.label}: {row.value}
          </Typography>
        ))}
      </Box>
    );
  }

  const diffs = getConfigHistoryFieldDiffs(entry, previous, catalogs);

  if (!diffs.length) {
    return (
      <Typography
        sx={{
          color: "text.secondary",
        }}
      >
        Нет отличий от предыдущей версии
      </Typography>
    );
  }

  return (
    <Box>
      {diffs.map((diff) => (
        <Box
          key={diff.key}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 0.5,
            py: 0.35,
          }}
        >
          <Typography
            component="span"
            sx={{ fontWeight: 600, mr: 0.5 }}
          >
            {diff.label}:
          </Typography>
          <TruncatedValue value={diff.from} />
          <Typography
            component="span"
            sx={{
              color: "text.secondary",
            }}
          >
            →
          </Typography>
          <TruncatedValue
            value={diff.to}
            emphasize
          />
        </Box>
      ))}
    </Box>
  );
}

export function EmployeePromoConfigHistoryPanel({
  configHistory = [],
  cities = [],
  points = [],
  promo_action_list = [],
}) {
  const list = normalizeConfigHistoryList(configHistory);
  const [open, setOpen] = React.useState(false);
  const catalogs = { cities, points, promo_action_list };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Accordion
        expanded={open}
        onChange={(event, isExpanded) => setOpen(isExpanded)}
        disableGutters
        variant="outlined"
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: "grey.50",
            "& .MuiAccordionSummary-content": {
              my: 1,
              alignItems: "center",
              gap: 1,
            },
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>История изменений конфига</Typography>
          <Chip
            size="small"
            label={`Версий: ${list.length}`}
            sx={{ fontWeight: 700, ml: { xs: 0, sm: "auto" } }}
            onClick={(event) => event.stopPropagation()}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1.5 }}>
          {list.length === 0 ? (
            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              Пока нет истории изменений
            </Typography>
          ) : (
            list.map((entry, index) => {
              const previous = list[index + 1] || null;
              const effectiveDate = formatConfigHistoryDate(entry.effective_date);

              return (
                <Accordion
                  key={entry.id != null ? entry.id : `${entry.changed_at}-${index}`}
                  disableGutters
                  variant="outlined"
                  sx={{
                    mb: index === list.length - 1 ? 0 : 1,
                    borderRadius: "8px",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: "grey.50",
                      "& .MuiAccordionSummary-content": {
                        my: 1,
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 0.75,
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {formatConfigHistoryDateTime(entry.changed_at)}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={getConfigHistorySourceLabel(entry.source)}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={effectiveDate === "—" ? "с —" : `с ${effectiveDate}`}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <VersionBody
                      entry={entry}
                      previous={previous}
                      catalogs={catalogs}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
