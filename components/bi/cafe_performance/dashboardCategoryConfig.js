"use client";

import { getSlaTone } from "./components/SlaProgressBar";

const SLA_TONE_COLOR = {
  success: "success.main",
  warning: "warning.dark",
  danger: "error.main",
  neutral: "text.secondary",
};

export function buildCategoryLegendMetric({ item, formatters }) {
  const slaTone = getSlaTone(item.sla);

  return {
    title: item.category_name || "Категория",
    caption: "Производительность категории",
    description:
      "Карточка категории объединяет скорость типичного приготовления, длинный хвост задержек и долю позиций, которые уложились в норматив.",
    summaryNote:
      "Значения приходят из блока `category_cards` для текущих фильтров и уже агрегированы сервисом по выбранной категории.",
    highlights: [
      {
        label: "P50",
        value: formatters.duration(item.p50),
      },
      {
        label: "P90",
        value: formatters.duration(item.p90),
      },
      {
        label: "SLA",
        value: formatters.percent(item.sla),
        toneColor: SLA_TONE_COLOR[slaTone] || SLA_TONE_COLOR.neutral,
      },
      {
        label: "Заказы",
        value: formatters.integer(item.sample_size),
      },
    ],
    formula: [
      "Берём все заказы, где в выбранном периоде была эта категория.",
      "P50 показывает медианное время: половина позиций готовится не дольше этого значения.",
      "P90 показывает тяжёлый хвост: 90% позиций укладываются в это время, а самые долгие 10% остаются выше.",
      "SLA показывает долю позиций категории, которые попали в норматив времени.",
    ],
    drivers: [
      "Сложность рецептур и количество операций внутри категории.",
      "Пиковая нагрузка, при которой именно эта категория накапливает очередь.",
      "Малый объём заказов: при небольшой выборке колебания заметнее.",
    ],
    interpretation: [
      "Ниже P50 и P90 лучше: категория проходит кухню быстрее и стабильнее.",
      "Выше SLA лучше: больше позиций категории укладываются в обещанный норматив.",
      "Если P50 нормальный, а P90 резко высокий, проблема чаще в редких, но длинных задержках.",
    ],
  };
}
