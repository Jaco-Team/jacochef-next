import {
  MyAutocomplite2,
  MyDatePickerGraph,
  MyDatePickerNew,
  MySelect,
  MyTextInput,
  MyTimePicker,
} from "@/ui/Forms";

export function V2Select(props) {
  return (
    <MySelect
      unifiedPopup
      {...props}
    />
  );
}

export function V2Autocomplete(props) {
  return (
    <MyAutocomplite2
      unifiedPopup
      {...props}
    />
  );
}

export const V2TextInput = MyTextInput;
export const V2TimePicker = MyTimePicker;
export const V2DatePicker = MyDatePickerNew;
export const V2DatePickerGraph = MyDatePickerGraph;
