import { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  JacoAlert,
  JacoButton,
  JacoIconButton,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTypography,
} from "@/design-system/shared/ui";
import LkCard from "./LkCard";
import { LkProfileDataCard, LkSignInCard } from "./LkProfileCard";
import { LK_SECTION } from "./lkSections";
import {
  formatDateRange,
  formatDayMonth,
  formatDayNumber,
  formatLongDate,
  formatShortDate,
  formatWeekday,
  pluralDays,
  todayYmd,
} from "./lkFormat";

const HEALTH_ACTIVE = 1;
const HEALTH_EXPIRING = 2;
const HEALTH_BLOCKED = 3;

const HEALTH_STATUS_VIEW = {
  [HEALTH_ACTIVE]: {
    Icon: CheckCircleOutlinedIcon,
    iconColor: uiColors.success,
    color: uiColors.textStrong,
    background: uiColors.surfaceMuted,
  },
  [HEALTH_EXPIRING]: {
    Icon: WarningAmberOutlinedIcon,
    iconColor: uiColors.warning,
    color: uiColors.textStrong,
    background: uiColors.warningSoft,
  },
  [HEALTH_BLOCKED]: {
    Icon: ErrorOutlinedIcon,
    iconColor: uiColors.danger,
    color: uiColors.danger,
    background: uiColors.dangerSoft,
  },
};

const rowSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  py: 1.25,
  "&:not(:last-of-type)": {
    borderBottom: `1px solid ${uiColors.borderLight}`,
  },
};

const primaryTextSx = { ...uiTypography.bodyMedium, color: uiColors.textStrong };
const secondaryTextSx = { ...uiTypography.label, color: uiColors.text };

const byHealthUrgency = (a, b) =>
  b.status - a.status || (a.days_left ?? -Infinity) - (b.days_left ?? -Infinity);

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value ?? ""));

function LkSection({ id, title, children }) {
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={`${id}-title`}
      sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Typography
        component="h2"
        id={`${id}-title`}
        sx={{ fontSize: 22, lineHeight: 1.2, fontWeight: 500, color: uiColors.textStrong }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function EmptyText({ children }) {
  return <Typography sx={secondaryTextSx}>{children}</Typography>;
}

function CollapsibleRows({ items, limit, getKey, renderItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = isExpanded ? items : items.slice(0, limit);

  return (
    <>
      <Box
        component="ul"
        sx={{ listStyle: "none", m: 0, p: 0 }}
      >
        {visibleItems.map((item) => (
          <Box
            component="li"
            key={getKey(item)}
            sx={rowSx}
          >
            {renderItem(item)}
          </Box>
        ))}
      </Box>
      {items.length > limit ? (
        <JacoButton
          tone="secondary"
          compact
          onClick={() => setIsExpanded((expanded) => !expanded)}
          sx={{ alignSelf: "flex-start", mt: "auto" }}
        >
          {isExpanded ? "Свернуть" : `Показать все (${items.length})`}
        </JacoButton>
      ) : null}
    </>
  );
}

function healthNoticeText(item) {
  if (!item.date_end) {
    return `${item.name}: срок не заполнен.`;
  }

  if (item.days_left < 0) {
    return `${item.name}: срок истёк ${formatLongDate(item.date_end)}, ${pluralDays(-item.days_left)} назад.`;
  }

  if (item.days_left === 0) {
    return `${item.name}: срок истекает сегодня.`;
  }

  return `${item.name} действует до ${formatLongDate(item.date_end)} — ещё ${pluralDays(item.days_left)}.`;
}

function HealthBookNotice({ healthBook, onOpen }) {
  const items = healthBook?.items ?? [];

  if (!healthBook?.enabled || healthBook.status < HEALTH_EXPIRING || !items.length) {
    return null;
  }

  const mostUrgent = [...items].sort(byHealthUrgency)[0];

  return (
    <JacoAlert
      severity={healthBook.status === HEALTH_BLOCKED ? "error" : "warning"}
      action={
        onOpen ? (
          <JacoButton
            tone="secondary"
            compact
            onClick={onOpen}
          >
            К допускам
          </JacoButton>
        ) : undefined
      }
    >
      <strong>Медкнижка: {String(healthBook.status_text ?? "").toLowerCase()}.</strong>{" "}
      {healthNoticeText(mostUrgent)}
    </JacoAlert>
  );
}

function ShiftsCard({ shifts }) {
  const items = shifts?.items ?? [];
  const today = todayYmd();

  return (
    <LkCard
      icon={<CalendarMonthOutlinedIcon fontSize="small" />}
      title="Ближайшие смены"
    >
      {items.length ? (
        <CollapsibleRows
          items={items}
          limit={4}
          getKey={(shift) => `${shift.date}-${shift.smena_id}`}
          renderItem={(shift) => {
            const isToday = shift.date === today;
            const intervals = shift.intervals ?? [];
            const timeText =
              intervals.length > 1
                ? intervals
                    .map((interval) => `${interval.time_start}–${interval.time_end}`)
                    .join(", ")
                : `${shift.time_start}–${shift.time_end}`;

            return (
              <>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1.1,
                    borderRadius: uiRadii.sm,
                    backgroundColor: isToday ? uiColors.primary : uiColors.surfaceMuted,
                    color: isToday ? "#FFFFFF" : uiColors.textStrong,
                  }}
                >
                  <Box
                    component="span"
                    sx={{ fontSize: 18, fontWeight: 700 }}
                  >
                    {formatDayNumber(shift.date)}
                  </Box>
                  <Box
                    component="span"
                    sx={{ fontSize: 11 }}
                  >
                    {formatWeekday(shift.date)}
                  </Box>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={primaryTextSx}>
                    {isToday ? `Сегодня · ${timeText}` : timeText}
                  </Typography>
                  <Typography sx={secondaryTextSx}>
                    {[formatDayMonth(shift.date), shift.point_name].filter(Boolean).join(" · ")}
                  </Typography>
                </Box>
              </>
            );
          }}
        />
      ) : (
        <EmptyText>На ближайшие две недели смен нет.</EmptyText>
      )}
    </LkCard>
  );
}

function HealthStatusBadge({ status, text }) {
  const view = HEALTH_STATUS_VIEW[status];

  if (!view || !text) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        minHeight: 26,
        px: 1.25,
        borderRadius: uiRadii.full,
        backgroundColor: view.background,
        color: view.color,
        ...uiTypography.compactLabel,
        fontWeight: 500,
      }}
    >
      <view.Icon sx={{ fontSize: 16, color: view.iconColor }} />
      {text}
    </Box>
  );
}

function HealthBookCard({ healthBook }) {
  const items = [...(healthBook?.items ?? [])].sort(byHealthUrgency);

  return (
    <LkCard
      icon={<MedicalServicesOutlinedIcon fontSize="small" />}
      title="Медкнижка"
      aside={
        <HealthStatusBadge
          status={healthBook?.status}
          text={healthBook?.status_text}
        />
      }
    >
      {items.length ? (
        <CollapsibleRows
          items={items}
          limit={4}
          getKey={(item) => item.type}
          renderItem={(item) => {
            const needsAttention = item.status >= HEALTH_EXPIRING;
            const view = HEALTH_STATUS_VIEW[item.status];
            const daysText =
              item.date_end && needsAttention
                ? item.days_left < 0
                  ? `просрочено на ${pluralDays(-item.days_left)}`
                  : `ещё ${pluralDays(item.days_left)}`
                : "";

            return (
              <>
                {needsAttention && view ? (
                  <view.Icon sx={{ fontSize: 20, flexShrink: 0, color: view.iconColor }} />
                ) : null}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography sx={primaryTextSx}>{item.name}</Typography>
                  {daysText ? (
                    <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
                      {daysText}
                    </Typography>
                  ) : null}
                </Box>
                <Typography
                  sx={{
                    ...uiTypography.label,
                    flexShrink: 0,
                    fontWeight: needsAttention ? 500 : 400,
                    color: needsAttention ? uiColors.textStrong : uiColors.text,
                  }}
                >
                  {item.date_end ? `до ${formatShortDate(item.date_end)}` : "не заполнено"}
                </Typography>
              </>
            );
          }}
        />
      ) : (
        <EmptyText>Данных по медкнижке нет.</EmptyText>
      )}
    </LkCard>
  );
}

function AbsencesCard({ absences }) {
  const items = absences?.items ?? [];

  return (
    <LkCard
      icon={<EventBusyOutlinedIcon fontSize="small" />}
      title="Отпуска и больничные"
    >
      <CollapsibleRows
        items={items}
        limit={3}
        getKey={(absence) => absence.id}
        renderItem={(absence) => (
          <>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={primaryTextSx}>{absence.type_name}</Typography>
              <Typography sx={secondaryTextSx}>
                {formatDateRange(absence.date_start, absence.date_end)}
              </Typography>
            </Box>
            {absence.days ? (
              <Typography sx={{ ...secondaryTextSx, flexShrink: 0 }}>
                {pluralDays(absence.days)}
              </Typography>
            ) : null}
          </>
        )}
      />
    </LkCard>
  );
}

function DocumentsSection({ title, children }) {
  return (
    <Box>
      <Typography sx={{ ...secondaryTextSx, mb: 0.5 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function DocumentsCard({ documents }) {
  const jobDescriptions = documents?.job_descriptions ?? [];
  const cloth = documents?.cloth ?? [];

  return (
    <LkCard
      icon={<DescriptionOutlinedIcon fontSize="small" />}
      title="Документы"
    >
      {jobDescriptions.length ? (
        <DocumentsSection title="Должностные инструкции">
          <Box
            component="ul"
            sx={{ listStyle: "none", m: 0, p: 0 }}
          >
            {jobDescriptions.map((description) => (
              <Box
                component="li"
                key={description.id}
                sx={rowSx}
              >
                {isHttpUrl(description.link) ? (
                  <Link
                    href={description.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      ...uiTypography.bodyMedium,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: uiColors.primary,
                    }}
                  >
                    {description.name}
                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                  </Link>
                ) : (
                  <Typography sx={primaryTextSx}>{description.name}</Typography>
                )}
              </Box>
            ))}
          </Box>
        </DocumentsSection>
      ) : null}

      {cloth.length ? (
        <DocumentsSection title="Выданная форма">
          <CollapsibleRows
            items={cloth}
            limit={4}
            getKey={(item) => item.cloth_id}
            renderItem={(item) => (
              <>
                <Typography sx={{ ...primaryTextSx, flexGrow: 1, minWidth: 0 }}>
                  {item.name}
                </Typography>
                {item.date_start ? (
                  <Typography sx={{ ...secondaryTextSx, flexShrink: 0 }}>
                    с {formatShortDate(item.date_start)}
                  </Typography>
                ) : null}
              </>
            )}
          />
        </DocumentsSection>
      ) : null}
    </LkCard>
  );
}

function promoValidityText(promo, { withTemplateText = true } = {}) {
  const day =
    promo.date_end === todayYmd()
      ? "сегодня"
      : promo.date_end
        ? `до ${formatShortDate(promo.date_end)}`
        : "";
  const hasTimes = Boolean(promo.time_start && promo.time_end);
  // Время не повторяем, если оно уже написано в тексте из шаблона.
  const timesInTemplateText =
    hasTimes &&
    withTemplateText &&
    [promo.description, promo.condition_text].some((text) => {
      const value = String(text ?? "");

      return value.includes(promo.time_start) && value.includes(promo.time_end);
    });
  const time =
    hasTimes && !timesInTemplateText ? `с ${promo.time_start} до ${promo.time_end}` : "";

  return day || time ? ["Действует", day, time].filter(Boolean).join(" ") : "";
}

function PromoCodeBadge({ children }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 22,
        px: 1,
        borderRadius: uiRadii.full,
        backgroundColor: uiColors.surfaceMuted,
        color: uiColors.textStrong,
        ...uiTypography.compactLabel,
        fontWeight: 500,
      }}
    >
      {children}
    </Box>
  );
}

function PromoCodeTile({ promo }) {
  const [isCopied, setIsCopied] = useState(false);
  const isUsed = Number(promo.uses_left) <= 0;
  const validity = promoValidityText(promo);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.lg,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          sx={{
            flexGrow: 1,
            minWidth: 0,
            fontSize: 22,
            lineHeight: 1.3,
            fontWeight: 700,
            letterSpacing: "2px",
            color: uiColors.textStrong,
            overflowWrap: "anywhere",
          }}
        >
          {promo.code}
        </Typography>
        <JacoIconButton
          aria-label={isCopied ? "Промокод скопирован" : "Скопировать промокод"}
          onClick={copyCode}
        >
          {isCopied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </JacoIconButton>
      </Box>
      {isUsed ? (
        <Box sx={{ display: "flex" }}>
          <PromoCodeBadge>Использован</PromoCodeBadge>
        </Box>
      ) : null}
      {promo.description ? (
        <Typography sx={{ ...uiTypography.body, color: uiColors.textStrong }}>
          {promo.description}
        </Typography>
      ) : null}
      {promo.condition_text ? (
        <Typography sx={secondaryTextSx}>{promo.condition_text}</Typography>
      ) : null}
      {validity ? <Typography sx={secondaryTextSx}>{validity}</Typography> : null}
    </Box>
  );
}

function PromoCodesGrid({ promoCodes }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          lg: promoCodes.length > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
        },
        gap: 3,
      }}
    >
      {promoCodes.map((promo) => (
        <PromoCodeTile
          key={promo.id}
          promo={promo}
        />
      ))}
    </Box>
  );
}

function ScheduleSection({ dashboard }) {
  const hasAbsences = Boolean(dashboard?.absences?.items?.length);

  return (
    <Grid
      container
      spacing={3}
    >
      {dashboard?.shifts?.enabled ? (
        <Grid size={{ xs: 12, lg: 6 }}>
          <ShiftsCard shifts={dashboard.shifts} />
        </Grid>
      ) : null}
      {hasAbsences ? (
        <Grid size={{ xs: 12, lg: 6 }}>
          <AbsencesCard absences={dashboard.absences} />
        </Grid>
      ) : null}
    </Grid>
  );
}

function DocumentsSectionCards({ dashboard }) {
  const documents = dashboard?.documents;
  const hasDocuments = Boolean(documents?.job_descriptions?.length || documents?.cloth?.length);

  return (
    <Grid
      container
      spacing={3}
    >
      {dashboard?.health_book?.enabled ? (
        <Grid size={{ xs: 12, lg: 6 }}>
          <HealthBookCard healthBook={dashboard.health_book} />
        </Grid>
      ) : null}
      {hasDocuments ? (
        <Grid size={{ xs: 12, lg: 6 }}>
          <DocumentsCard documents={documents} />
        </Grid>
      ) : null}
    </Grid>
  );
}

function ProfileSection({ dashboard, my, isOwn, onEditCode, onChangePassword }) {
  return (
    <Grid
      container
      spacing={3}
    >
      <Grid size={{ xs: 12, lg: isOwn ? 7 : 12 }}>
        <LkProfileDataCard
          my={my}
          workplace={dashboard?.workplace}
        />
      </Grid>
      {isOwn ? (
        <Grid size={{ xs: 12, lg: 5 }}>
          <LkSignInCard
            authCode={my?.auth_code}
            onEditCode={onEditCode}
            onChangePassword={onChangePassword}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}

function scheduleSummary(dashboard) {
  const shifts = dashboard?.shifts;

  if (shifts?.enabled) {
    const items = shifts.items ?? [];
    const today = todayYmd();
    const timeOf = (shift) => `${shift.time_start}–${shift.time_end}`;
    const todayShift = items.find((shift) => shift.date === today);
    const nextShift = items.find((shift) => shift.date > today);

    if (todayShift) {
      return {
        primary: `Сегодня ${timeOf(todayShift)}`,
        secondary: [
          todayShift.point_name,
          nextShift ? `следующая смена ${formatDayMonth(nextShift.date)}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      };
    }

    if (nextShift) {
      return {
        primary: `Смена ${formatDayMonth(nextShift.date)}`,
        secondary: [timeOf(nextShift), nextShift.point_name].filter(Boolean).join(" · "),
      };
    }

    return { primary: "Смен нет", secondary: "На ближайшие две недели" };
  }

  const lastAbsence = dashboard?.absences?.items?.[0];

  return lastAbsence
    ? {
        primary: lastAbsence.type_name,
        secondary: formatDateRange(lastAbsence.date_start, lastAbsence.date_end),
      }
    : null;
}

function documentsSummary(dashboard) {
  const healthBook = dashboard?.health_book;
  const instructionsCount = dashboard?.documents?.job_descriptions?.length ?? 0;
  const clothCount = dashboard?.documents?.cloth?.length ?? 0;
  const counts = [
    instructionsCount ? `Инструкции: ${instructionsCount}` : "",
    clothCount ? `Форма: ${clothCount}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  if (!healthBook?.enabled) {
    return { primary: "Инструкции и форма", secondary: counts };
  }

  const mostUrgent = [...(healthBook.items ?? [])].sort(byHealthUrgency)[0];

  if (healthBook.status < HEALTH_EXPIRING || !mostUrgent) {
    return { primary: "Медкнижка действует", secondary: counts };
  }

  return {
    primary: mostUrgent.date_end
      ? `${mostUrgent.name} до ${formatShortDate(mostUrgent.date_end)}`
      : `${mostUrgent.name}: срок не заполнен`,
    secondary: [healthBook.status_text, counts].filter(Boolean).join(" · "),
  };
}

function promoSummary(dashboard) {
  const promoCodes = dashboard?.promos?.items ?? [];
  const firstCode = promoCodes[0];

  if (!firstCode) {
    return null;
  }

  return {
    primary: firstCode.code,
    isCode: true,
    secondary: [
      promoValidityText(firstCode, { withTemplateText: false }),
      promoCodes.length > 1 ? `и ещё ${promoCodes.length - 1}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

function profileSummary(my, isOwn) {
  return {
    primary: my?.exp ? `Стаж ${my.exp}` : (my?.app_name ?? ""),
    secondary: isOwn ? "Личные данные, код доступа, пароль" : "Личные данные",
  };
}

function OverviewTile({ section, summary, onOpen }) {
  const Icon = section.icon;

  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      sx={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "pointer",
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.lg,
        backgroundColor: uiColors.surface,
        color: uiColors.textStrong,
        "&:hover": {
          backgroundColor: uiStateColors.hover,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: uiColors.text }}>
        {Icon ? <Icon fontSize="small" /> : null}
        <Box
          component="span"
          sx={{ ...uiTypography.label, flexGrow: 1 }}
        >
          {section.title}
        </Box>
        <ChevronRightIcon fontSize="small" />
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: 20,
          lineHeight: 1.3,
          fontWeight: summary.isCode ? 700 : 500,
          letterSpacing: summary.isCode ? "2px" : 0,
          overflowWrap: "anywhere",
        }}
      >
        {summary.primary}
      </Box>
      {summary.secondary ? (
        <Box
          component="span"
          sx={secondaryTextSx}
        >
          {summary.secondary}
        </Box>
      ) : null}
    </Box>
  );
}

function OverviewSection({ dashboard, sections, my, isOwn, onNavigate }) {
  const summaries = {
    [LK_SECTION.schedule]: scheduleSummary(dashboard),
    [LK_SECTION.documents]: documentsSummary(dashboard),
    [LK_SECTION.promo]: promoSummary(dashboard),
    [LK_SECTION.profile]: profileSummary(my, isOwn),
  };
  const tiles = sections.filter((section) => summaries[section.id]);

  return (
    <>
      <HealthBookNotice
        healthBook={dashboard?.health_book}
        onOpen={() => onNavigate(LK_SECTION.documents)}
      />
      <Grid
        container
        spacing={3}
      >
        {tiles.map((section) => (
          <Grid
            key={section.id}
            size={{ xs: 12, lg: 6 }}
          >
            <OverviewTile
              section={section}
              summary={summaries[section.id]}
              onOpen={() => onNavigate(section.id)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default function LkDashboard({
  dashboard,
  sections,
  activeSectionId,
  my,
  isOwn,
  onNavigate,
  onEditCode,
  onChangePassword,
}) {
  const section = sections.find((item) => item.id === activeSectionId) ?? sections[0];

  if (!section) {
    return null;
  }

  return (
    <LkSection
      id={section.id}
      title={section.title}
    >
      {section.id === LK_SECTION.overview ? (
        <OverviewSection
          dashboard={dashboard}
          sections={sections}
          my={my}
          isOwn={isOwn}
          onNavigate={onNavigate}
        />
      ) : null}
      {section.id === LK_SECTION.schedule ? <ScheduleSection dashboard={dashboard} /> : null}
      {section.id === LK_SECTION.documents ? (
        <>
          <HealthBookNotice healthBook={dashboard?.health_book} />
          <DocumentsSectionCards dashboard={dashboard} />
        </>
      ) : null}
      {section.id === LK_SECTION.promo ? (
        <PromoCodesGrid promoCodes={dashboard?.promos?.items ?? []} />
      ) : null}
      {section.id === LK_SECTION.profile ? (
        <ProfileSection
          dashboard={dashboard}
          my={my}
          isOwn={isOwn}
          onEditCode={onEditCode}
          onChangePassword={onChangePassword}
        />
      ) : null}
    </LkSection>
  );
}
