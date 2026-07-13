import { MySelect } from "@/ui/Forms";

export default function V2Select({ options, data, onChange, func, allowNone, is_none, ...props }) {
  return (
    <MySelect
      unifiedPopup
      data={options ?? data}
      func={onChange ?? func}
      is_none={allowNone ?? is_none}
      {...props}
    />
  );
}
