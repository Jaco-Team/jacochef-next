import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";

import theme, { font } from "../src/theme";

import "../styles/global.scss";
import "../styles/tender.scss";

const preview = {
  decorators: [
    (Story) => (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="ru"
          >
            <div className={font.className}>
              <Story />
            </div>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
    options: {
      storySort: {
        order: [
          "Chef Design System",
          ["Foundations", "Shared UI", ["Controls", "Forms", "Surfaces And Feedback", "Modals"]],
        ],
      },
    },
  },
};

export default preview;
