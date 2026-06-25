import { MyAutocomplite2 } from "@/ui/Forms";

export default function V2Autocomplete({ options, data, onChange, func, ...props }) {
  return (
    <MyAutocomplite2
      unifiedPopup
      data={options ?? data}
      func={onChange ?? func}
      {...props}
    />
  );
}
