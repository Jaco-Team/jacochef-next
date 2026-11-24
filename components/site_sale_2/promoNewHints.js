import { Box, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export const PROMO_HINTS = {
  promo_name:
    "Код, который клиент вводит при заказе. Минимум 3 символа, если не включена генерация.",
  generate_new: "Система создаст случайный код заданной длины вместо ручного ввода.",
  promo_length: "Длина автоматически сгенерированного промокода в символах.",
  count_action: "Сколько раз можно применить один промокод (лимит активаций).",
  promo_count: "Сколько отдельных промокодов создать за одно сохранение.",
  for_new: "Только для клиентов без предыдущих заказов. Нельзя вместе с «1 раз на номер».",
  once_number: "Каждый номер телефона может использовать промокод только один раз.",
  for_registred: "Промокод доступен только зарегистрированным клиентам с личным кабинетом.",
  for_number: "Промокод работает только с указанным номером телефона.",
  for_number_text: "Введите номер — форматирование добавится автоматически.",
  promo_action: "Что получит клиент при успешном применении промокода.",
  type_sale: "Область действия скидки: конкретные товары, категории или всё меню.",
  sale_type: "Скидка в рублях или в процентах от стоимости.",
  promo_sale: "Размер скидки в выбранных единицах измерения.",
  promo_conditions: "Что должно быть в корзине, чтобы промокод можно было применить.",
  price_start: "Минимальная сумма корзины для применения промокода.",
  price_end: "Максимальная сумма корзины. Укажите 0, если верхнего предела нет.",
  date_promo: "Пресет срока действия или свои даты в полях ниже.",
  testDate: "Исключения: в эти даты промокод не действует, даже если попадает в общий период.",
  weekdays: "В какие дни недели промокод можно применить.",
  type_order: "Способ получения заказа: доставка, самовывоз, зал.",
  where_order: "Ограничение по городу или конкретному кафе.",
  where_promo: "Создать промокод, отправить на почту/SMS, выдать сертификат и т.д.",
  numberList: "Куда отправить: телефон, e-mail или список номеров через запятую.",
  delivery_phone: "Введите номер — форматирование добавится автоматически.",
  delivery_email: "Введите адрес электронной почты.",
  spamNameSMS: "Название SMS-рассылки в системе.",
  textSMS: "Текст SMS. Плейсхолдер --promo_name-- заменится на код промокода.",
  cert_text: "Текст описания на сертификате.",
  promo_prizw_vk:
    "Шаблон сообщения для бота ВК. Поддерживаются плейсхолдеры --promo--, --endDate-- и др.",
  auto_text: "Автоматически обновлять тексты описания и условий при изменении параметров.",
  promo_desc_true: "Текст после успешного применения. Отображается клиенту как «Промокод даёт: …»",
  promo_desc_false:
    "Текст, если промокод нельзя применить: не выполнены условия, неверная дата и т.д.",
};

export function HintIcon({ title }) {
  if (!title) {
    return null;
  }

  return (
    <Tooltip
      title={title}
      arrow
      placement="top"
    >
      <InfoOutlinedIcon
        sx={{
          fontSize: 18,
          color: "text.disabled",
          cursor: "help",
          ml: 0.5,
          flexShrink: 0,
        }}
      />
    </Tooltip>
  );
}

export function LabelWithHint({ text, hint, sx }) {
  return (
    <Box sx={{ mb: 1, ...sx }}>
      <Typography
        variant="subtitle2"
        sx={{ color: "text.primary", fontWeight: 600 }}
      >
        {text}
      </Typography>
      {hint ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mt: 0.375,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

export function FieldWithHint({ hint, children }) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {children}
      {hint ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mt: 0.75,
            px: 0.25,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}
