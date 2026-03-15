"use client";

import { memo } from "react";

function SmallFont({ children, size = "0.8rem" }) {
  return <div style={{ fontSize: size }}>{children}</div>;
}
export default memo(SmallFont);
