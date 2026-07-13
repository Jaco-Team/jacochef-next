import { MyTextInput } from "@/ui/Forms";

export default function V2TextInput({ onChange, func, ...props }) {
  return (
    <MyTextInput
      func={onChange ?? func}
      {...props}
    />
  );
}
