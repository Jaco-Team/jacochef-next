import { TableCell, TableSortLabel } from "@mui/material";

export default function SkladSortableHeader({
  children,
  sortKey,
  sortBy,
  sortDirection,
  onSort,
  ...props
}) {
  return (
    <TableCell {...props}>
      <TableSortLabel
        active={sortBy === sortKey}
        direction={sortBy === sortKey ? sortDirection : "asc"}
        onClick={() => onSort(sortKey)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );
}
