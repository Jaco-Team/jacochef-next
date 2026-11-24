"use client";

import { JacoSelect } from "@/design-system/shared/ui";

export default function SkladCategorySelect({ data, is_none, func, ...props }) {
  return (
    <JacoSelect
      {...props}
      options={data}
      allowNone={is_none}
      onChange={func}
    />
  );
}
