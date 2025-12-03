"use client";

import dynamic from "next/dynamic";

export * from "./MyAutocomplite";
export * from "./MyAutocomplite2";
export * from "./MyAutoCompleteWithAll";
export * from "./MySelect";
export * from "./MyTextInput";
export * from "./MyCheckBox";
export * from "./MyTimePicker";
export * from "./MyDatePicker";
export * from "./MyDatePickerNew";
export * from "./MyDateTimePickerNew";
export * from "./MyDatePickerNewViews";
export * from "./MyDatePickerGraph";
export * from "./TextEditor";
export * from "./TextEditor22";

export const MyWeekPicker = dynamic(() => import("./MyWeekPicker"), { ssr: false });

export const TextEditor = dynamic(() => import("./TextEditor"), { ssr: false });
