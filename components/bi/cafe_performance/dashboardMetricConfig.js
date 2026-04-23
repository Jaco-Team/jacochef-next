"use client";

import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import { getSlaTone } from "./components/SlaProgressBar";

const formatSigned = (value, fractionDigits = 2) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";

  const abs = Math.abs(numeric);
  const fixed = abs
    .toFixed(fractionDigits)
    .replace(/\.00$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");

  if (numeric > 0) return `+${fixed}`;
  if (numeric < 0) return `-${fixed}`;
  return fixed;
};

const buildDelta = ({ value, inverse = false, suffix = "", fractionDigits = 2 }) => {
  if (value == null) return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  if (numeric === 0) {
    return {
      label: `0${suffix}`,
      tone: "neutral",
      direction: "flat",
    };
  }

  const improving = inverse ? numeric < 0 : numeric > 0;

  return {
    label: `${formatSigned(numeric, fractionDigits)}${suffix}`,
    tone: improving ? "success" : "danger",
    direction: numeric > 0 ? "up" : "down",
  };
};

const getMetricValueTone = (tone) => {
  if (tone === "success") return "success";
  if (tone === "warning") return "warning";
  if (tone === "danger") return "error";
  return "primary";
};

const METRIC_DETAILS = {
  sla_position: {
    title: "SLA позиции",
    caption: "Все категории",
    description:
      "Метрика показывает, какая доля всех позиций в выбранном срезе была приготовлена в пределах целевого норматива времени.",
    summaryNote:
      "Карточка отображает агрегированное значение `summary.sla_position`, которое приходит из сервиса уже рассчитанным для выбранных кафе и дат.",
    formula: [
      "Берём все позиции из заказов, попавших в текущий период и выбранные кафе.",
      "Для каждой позиции проверяем, уложилось ли её фактическое время приготовления в SLA.",
      "Делим число позиций в нормативе на общее число позиций и переводим результат в проценты.",
    ],
    drivers: [
      "Скорость кухни по самым массовым категориям.",
      "Перегрузка на пиковых часах и длинные очереди внутри смены.",
      "Любые задержки на этапах, где позиция дольше всего ждёт обработки.",
    ],
    interpretation: [
      "Чем выше процент, тем стабильнее кухня держит обещанное время по отдельным позициям.",
      "Резкое снижение обычно означает рост доли просроченных позиций даже при нормальном среднем времени.",
    ],
  },
  sla_order: {
    title: "SLA заказа",
    caption: "От создания до выдачи",
    description:
      "Метрика показывает, какой процент заказов был полностью выдан в пределах нормативного времени от создания до выдачи.",
    summaryNote:
      "В карточке используется серверное агрегированное поле `summary.sla_order` для текущего фильтра.",
    formula: [
      "Берём каждый заказ в выбранном периоде как одну единицу расчёта.",
      "Для заказа сравниваем фактическое время от создания до выдачи с целевым SLA заказа.",
      "Считаем долю заказов, которые уложились в норматив, и выводим её в процентах.",
    ],
    drivers: [
      "Общая синхронность кухни, сборки и выдачи по заказу целиком.",
      "Задержки на финальных этапах, даже если отдельные позиции были готовы вовремя.",
      "Сложные и крупные заказы, которые тянут вверх полное время цикла.",
    ],
    interpretation: [
      "Высокое значение означает, что клиент получает заказ в обещанный срок не по частям, а целиком.",
      "Если SLA позиции высокий, а SLA заказа ниже, проблема часто находится на сборке или выдаче.",
    ],
  },
  p50_position: {
    title: "P50 позиции",
    caption: "Медиана времени",
    description:
      "Это медианное время приготовления позиции: половина позиций готовится быстрее этого значения, а половина медленнее.",
    summaryNote:
      "Карточка читает готовый агрегат `summary.p50_position`; значение уже посчитано на сервере по текущему срезу.",
    formula: [
      "Собираем фактическое время приготовления по всем позициям в выбранном периоде.",
      "Сортируем эти значения от самых быстрых к самым долгим.",
      "Берём центральное значение распределения, то есть медиану P50.",
    ],
    drivers: [
      "Типичный темп работы кухни без влияния редких экстремальных выбросов.",
      "Смещение ассортимента в сторону более сложных или простых категорий.",
      "Стабильность процессов внутри смены и скорость прохождения базовых этапов.",
    ],
    interpretation: [
      "Ниже значение лучше: это означает, что типичная позиция готовится быстрее.",
      "P50 помогает понять обычный рабочий темп, когда среднее значение может искажаться редкими долгими случаями.",
    ],
  },
  complaints_per_100_orders: {
    title: "Обращения / 100",
    caption: "На 100 заказов",
    description:
      "Метрика показывает, сколько клиентских обращений приходится на каждые 100 заказов в текущем периоде.",
    summaryNote:
      "Здесь выводится агрегированное поле `summary.complaints_per_100_orders`, рассчитанное сервером на выбранный срез.",
    formula: [
      "Считаем все обращения, связанные с заказами в выбранном периоде.",
      "Делим число обращений на общее число заказов в этом же срезе.",
      "Умножаем результат на 100, чтобы получить нормированное значение на каждые сто заказов.",
    ],
    drivers: [
      "Просадки по качеству, комплектности, задержкам и клиентскому опыту.",
      "Небольшой объём заказов, при котором даже несколько обращений сильнее двигают показатель.",
      "Повторяющиеся сбои в конкретных категориях, сменах или точках.",
    ],
    interpretation: [
      "Ниже значение лучше: меньше обращений на одинаковый объём заказов.",
      "Метрика удобна для сравнения разных периодов и кафе, потому что она уже нормирована на 100 заказов.",
    ],
  },
};

export const buildDashboardMetricConfigs = ({ summary, formatters }) => ({
  sla_position: {
    ...METRIC_DETAILS.sla_position,
    value: formatters.percent(summary.sla_position),
    comparisonSource:
      summary.sla_position_diff != null
        ? "Цвет и динамика опираются на серверное поле `summary.sla_position_diff`."
        : "Сервис не передал поле сравнения, поэтому динамика для этой метрики недоступна.",
    card: {
      label: "SLA позиции",
      value: formatters.percent(summary.sla_position),
      caption: METRIC_DETAILS.sla_position.caption,
      icon: <PercentOutlinedIcon fontSize="small" />,
      delta: buildDelta({
        value: summary.sla_position_diff,
        suffix: "%",
        fractionDigits: 1,
      }),
    },
    valueTone: getMetricValueTone(getSlaTone(summary.sla_position)),
  },
  sla_order: {
    ...METRIC_DETAILS.sla_order,
    value: formatters.percent(summary.sla_order),
    comparisonSource:
      summary.sla_order_diff != null
        ? "Цвет и динамика опираются на серверное поле `summary.sla_order_diff`."
        : "Сервис не передал поле сравнения, поэтому динамика для этой метрики недоступна.",
    card: {
      label: "SLA заказа",
      value: formatters.percent(summary.sla_order),
      caption: METRIC_DETAILS.sla_order.caption,
      icon: <PercentOutlinedIcon fontSize="small" />,
      delta: buildDelta({
        value: summary.sla_order_diff,
        suffix: "%",
        fractionDigits: 1,
      }),
    },
    valueTone: getMetricValueTone(getSlaTone(summary.sla_order)),
  },
  p50_position: {
    ...METRIC_DETAILS.p50_position,
    value: formatters.duration(summary.p50_position),
    card: {
      label: "P50 позиции",
      value: formatters.duration(summary.p50_position),
      caption: METRIC_DETAILS.p50_position.caption,
      icon: <TimerOutlinedIcon fontSize="small" />,
      delta: buildDelta({
        value: summary.p50_position_diff,
        inverse: true,
        suffix: " сек",
        fractionDigits: 1,
      }),
    },
  },
  complaints_per_100_orders: {
    ...METRIC_DETAILS.complaints_per_100_orders,
    value: formatters.number(summary.complaints_per_100_orders),
    card: {
      label: "Обращения / 100",
      value: formatters.number(summary.complaints_per_100_orders),
      caption: METRIC_DETAILS.complaints_per_100_orders.caption,
      tone: "warning",
      icon: <FeedbackOutlinedIcon fontSize="small" />,
      delta: buildDelta({
        value: summary.complaints_per_100_orders_diff,
        inverse: true,
        fractionDigits: 1,
      }),
    },
  },
});
