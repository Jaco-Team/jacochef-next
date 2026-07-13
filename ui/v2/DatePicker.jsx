import { MyDatePickerNew } from "@/ui/Forms";

export default function V2DatePicker({ onChange, func, ...props }) {
  return (
    <MyDatePickerNew
      func={onChange ?? func}
      {...props}
    />
  );
}
