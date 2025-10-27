import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export default function CompositionOfOrdersIconSort({ type }) {
  return type === "none" ? (
    false
  ) : type === "asc" ? (
    <ArrowDownward style={{ verticalAlign: "middle" }} />
  ) : (
    <ArrowUpward style={{ verticalAlign: "middle" }} />
  );
}
