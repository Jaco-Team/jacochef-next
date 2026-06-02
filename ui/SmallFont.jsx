"use client";

import { memo } from "react";

function SmallFont({ children, ...props }) {
  const { style = { fontSize: "0.8rem" }, ...restProps } = props;
  return (
    <div
      style={style}
      {...restProps}
    >
      {children}
    </div>
  );
}
export default memo(SmallFont);
