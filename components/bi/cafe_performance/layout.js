"use client";

// 8pt grid with a 4px half-step for dense dashboard UI.
// MUI spacing units: 0.5=4px, 1=8px, 1.5=12px, 2=16px, 3=24px, 4=32px.
export const CP_SPACE = {
  micro: 0.5,
  related: 1,
  compact: 1.5,
  component: 2,
  group: 3,
  section: 4,
};

export const CP_RADIUS = {
  control: 2,
  card: 3,
};

export const CP_PADDING = {
  card: 2,
  panel: { xs: 2, md: 3 },
};

export const CP_CHART_HEIGHT = {
  compact: 300,
  regular: 320,
  trend: 360,
};
