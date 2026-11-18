import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

export const LK_SECTION = {
  overview: "lk-overview",
  schedule: "lk-schedule",
  documents: "lk-documents",
  promo: "lk-promo",
  profile: "lk-profile",
};

const HEALTH_EXPIRING = 2;
const HEALTH_BLOCKED = 3;

/**
 * Категории кабинета, в которых есть что показать. Порядок — как в меню.
 */
export function getLkSections(dashboard, { isOwn }) {
  const healthBook = dashboard?.health_book;
  const hasShifts = Boolean(dashboard?.shifts?.enabled);
  const hasAbsences = Boolean(dashboard?.absences?.items?.length);
  const hasHealthBook = Boolean(healthBook?.enabled);
  const hasDocuments = Boolean(
    dashboard?.documents?.job_descriptions?.length || dashboard?.documents?.cloth?.length,
  );
  const hasPromoCodes = Boolean(dashboard?.promos?.items?.length);
  const healthAttention = !hasHealthBook
    ? null
    : healthBook.status >= HEALTH_BLOCKED
      ? "danger"
      : healthBook.status >= HEALTH_EXPIRING
        ? "warning"
        : null;

  return [
    { id: LK_SECTION.overview, title: "Обзор", icon: GridViewOutlinedIcon, visible: true },
    {
      id: LK_SECTION.schedule,
      title: "График",
      icon: CalendarMonthOutlinedIcon,
      visible: hasShifts || hasAbsences,
    },
    {
      id: LK_SECTION.documents,
      title: "Документы и допуски",
      icon: DescriptionOutlinedIcon,
      visible: hasHealthBook || hasDocuments,
      attention: healthAttention,
    },
    {
      id: LK_SECTION.promo,
      title: "Промокоды",
      icon: LocalOfferOutlinedIcon,
      visible: hasPromoCodes,
    },
    {
      id: LK_SECTION.profile,
      title: isOwn ? "Профиль и вход" : "Профиль",
      icon: PersonOutlineOutlinedIcon,
      visible: true,
    },
  ].filter((section) => section.visible);
}
