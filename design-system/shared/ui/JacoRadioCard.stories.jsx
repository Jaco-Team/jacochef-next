import { useState } from "react";
import { Box, RadioGroup, Stack } from "@mui/material";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import JacoRadioCard from "./JacoRadioCard";

export default {
  title: "Chef Design System/Shared UI/Radio Card",
  component: JacoRadioCard,
};

const options = [
  { value: "sms", label: "SMS", description: "Сообщение на ваш номер", icon: <SmsOutlinedIcon /> },
  { value: "telegram", label: "Telegram", description: "Код в приложении Telegram", icon: <TelegramIcon /> },
  { value: "voice", label: "Звонок", description: "Продиктуем код по телефону", icon: <PhoneOutlinedIcon /> },
];

function Choices({ initialValue = "sms", disabled = false, narrow = false }) {
  const [value, setValue] = useState(initialValue);
  return (
    <Box sx={{ p: 3, width: narrow ? 327 : 420, maxWidth: "100%", boxSizing: "border-box" }}>
      <RadioGroup
        name="delivery-channel"
        aria-label="Получить код"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        sx={{ gap: 1 }}
      >
        {options.map((option) => (
          <JacoRadioCard
            key={option.value}
            {...option}
            checked={value === option.value}
            disabled={disabled}
            accentColor="#a30021"
            sx={{ borderRadius: "14px" }}
          />
        ))}
      </RadioGroup>
    </Box>
  );
}

export const Default = () => <Choices />;
export const Selected = () => <Choices initialValue="telegram" />;
export const Disabled = () => <Choices disabled />;
export const Narrow = () => <Choices initialValue="voice" narrow />;
export const SelectionStates = () => (
  <Stack spacing={2}>
    <Choices initialValue="sms" />
    <Choices initialValue="telegram" />
    <Choices initialValue="voice" />
  </Stack>
);
