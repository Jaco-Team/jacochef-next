import { SvgIcon } from "@mui/material";

export default function ExcelIcon(props) {
  const bgFill = "#1D6F42";
  const iconFill = "#fff";
  const { bgColor = bgFill, iconColor = iconFill, ...rest } = props;
  return (
    <SvgIcon {...rest}>
      <path
        d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 
        2 0 0 0 2-2V8l-6-6h-4z"
        fill={bgColor}
      />
      <path
        d="M14 2v6h6"
        fill="#229e5a"
      />
      <path
        d="M9.6 13.4L8 11h-1l1.7 2.7L7 17h1l1.4-2.3L11 
        17h1l-1.7-2.7L12 11h-1l-1.4 2.4z"
        fill={iconColor}
      />
    </SvgIcon>
  );
}
