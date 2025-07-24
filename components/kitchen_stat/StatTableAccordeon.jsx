import React from 'react';
import {
  Accordion,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
/**
 *
 * @param {*} props
 * @returns
 */
export default function StatTableAccordeon(props) {
    const {data, title = 'No title', tabletitles: tableTitles = {left:'Позиция', right: 'Количество'}, columnWidths = {left: '70%', right: '30%'}} = props;
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails style={{ overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
              <TableCell style={{ width: columnWidths.left }}>{tableTitles.left}</TableCell>
              <TableCell style={{ width: columnWidths.right }}>{tableTitles.right}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.map((item, key) => (
              <TableRow key={key} hover>
                <TableCell>{item?.name ?? item?.cat_name ?? "N/A"}</TableCell>
                <TableCell>{item?.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}
