import { SvgIcon } from "@mui/material";

const FILE_TYPE_STYLES = {
  doc: { color: "#2563EB", label: "DOC" },
  docx: { color: "#2563EB", label: "DOC" },
  pdf: { color: "#DC2626", label: "PDF" },
  png: { color: "#7C3AED", label: "PNG" },
  jpg: { color: "#EA580C", label: "JPG" },
  jpeg: { color: "#EA580C", label: "JPG" },
};

const getFileTypeMeta = (extension) =>
  FILE_TYPE_STYLES[extension] || { color: "#64748B", label: "FILE" };

export default function FileTypeIcon({ extension, ...props }) {
  const { color, label } = getFileTypeMeta((extension || "").toLowerCase());

  return (
    <SvgIcon
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M6 2.75h7.5L19.25 8.5V19A2.25 2.25 0 0 1 17 21.25H6A2.25 2.25 0 0 1 3.75 19V5A2.25 2.25 0 0 1 6 2.75Z"
        fill={color}
      />
      <path
        d="M13.5 2.75V7A1.5 1.5 0 0 0 15 8.5h4.25"
        fill="#fff"
        fillOpacity="0.26"
      />
      <path
        d="M7.5 15.75h8.5"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <text
        x="12"
        y="12.2"
        textAnchor="middle"
        fontSize="4.4"
        fontWeight="700"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        {label}
      </text>
    </SvgIcon>
  );
}
