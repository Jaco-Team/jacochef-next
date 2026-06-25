import { MyTimePicker } from "@/ui/Forms";

export default function V2TimePicker({ onChange, func, ...props }) {
  return (
    <MyTimePicker
      func={onChange ?? func}
      {...props}
    />
  );
}
