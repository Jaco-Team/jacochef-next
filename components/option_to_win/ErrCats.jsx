import React, { Component } from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { MyCheckBox } from "@/ui/Forms";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import Box from "@mui/material/Box";

export default class ErrCatsTable extends Component {
  parseSiteCats(csv) {
    if (!csv) return [];
    return csv
      .split(",")
      .map((x) => Number(x.trim()))
      .filter(Boolean);
  }

  buildTree(list) {
    const map = {};
    const roots = [];

    list.forEach((item) => (map[item.id] = { ...item, children: [] }));

    list.forEach((item) => {
      if (item.parent_id) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  }

  // Recursive renderer
  renderRows(nodes, siteCats, level = 0) {
    return nodes.map((node) => {
      const hasChildren = node?.children?.length > 0;

      const indent = level * 16;
      const levelBg = {
        0: "#fff",
        1: "#fafafa",
        2: "#f5f5f5",
        3: "#f0f0f0",
        4: "#ebebeb",
      };
      return (
        <Box
          key={node.id}
          sx={{ mb: 1 }}
        >
          <Accordion
            sx={{
              backgroundColor: levelBg[level],
              padding: "4px",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={hasChildren ? <ExpandMoreIcon /> : null}
              sx={{
                "& .MuiAccordionSummary-content": {
                  alignItems: "center !important",
                },
              }}
            >
              <Typography
                variant="body1"
                fontWeight={level < 2 ? 600 : 400}
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.openModal(node.id);
                }}
                sx={{
                  cursor: "pointer",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {node.name}
              </Typography>

              <MyCheckBox
                value={parseInt(node.is_active) === 1}
                func={() => this.props.changeActive(node)}
                sx={{ ml: 2 }}
              />
            </AccordionSummary>

            {hasChildren && (
              <AccordionDetails
                sx={{
                  p: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {this.renderRows(node.children, siteCats, level + 1)}
              </AccordionDetails>
            )}
          </Accordion>
        </Box>
      );
    });
  }

  render() {
    const { errCats = [], siteCats = [] } = this.props;
    const tree = this.buildTree(errCats);

    return (
      <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "91%" }}>Категория</TableCell>
                {/* <TableCell style={{ width: "35%" }}>Связанные категории сайта</TableCell> */}
                <TableCell>Активность</TableCell>
              </TableRow>
            </TableHead>

            <TableBody></TableBody>
          </Table>
        </TableContainer>
        {this.renderRows(tree, siteCats)}
      </>
    );
  }
}
