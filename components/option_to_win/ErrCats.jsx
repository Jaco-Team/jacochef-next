import React, { Component } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
} from "@mui/material";
import { MyCheckBox } from "@/ui/Forms";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

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
        map[item.parent_id]?.children.push(map[item.id]);
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
      return (
        <Box key={node.id}>
          {hasChildren ? (
            <Accordion
              sx={{
                padding: "4px",
                boxShadow: "none",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={
                  hasChildren ? <ExpandMoreIcon style={{ transform: "rotate(270deg)" }} /> : null
                }
                sx={{
                  flexDirection: "row-reverse",
                  pl: level * 2,
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    marginRight: "8px",
                    marginLeft: hasChildren ? "4px" : `${level * 18}px`,
                    "&.Mui-expanded": {
                      transform: "rotate(90deg)",
                    },
                  },
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center !important",
                    marginLeft: hasChildren ? "4px" : "20px",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={level < 2 ? 600 : 400}
                  sx={{
                    cursor: "pointer",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ml: hasChildren ? 0 : 2, // Отступ если нет детей
                  }}
                >
                  {node.name}
                </Typography>
                <Box
                  component="div"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.openNewModalCats(node.id, true);
                  }}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    backgroundColor: "transparent",
                    border: "none",
                    margin: 0,
                    padding: "8px",
                    cursor: "pointer",
                    borderRadius: "50%",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <AddIcon
                    fontSize="small"
                    style={{ color: "#a29999" }}
                  />
                </Box>
                <Switch
                  checked={parseInt(node.is_active) === 1}
                  onChange={() => this.props.changeActive(node)}
                  style={{ paddingRight: hasChildren ? "0" : `${level > 1 ? level + 8 : 10}px` }}
                />
                <Box
                  component="div"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.openModal(node.id);
                  }}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    backgroundColor: "transparent",
                    border: "none",
                    margin: 0,
                    padding: "8px",
                    cursor: "pointer",
                    borderRadius: "50%",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <EditIcon
                    fontSize="small"
                    style={{ color: "#a29999" }}
                  />
                </Box>
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
          ) : (
            <li
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingLeft: "40px",
                paddingTop: "10px",
                paddingBottom: "10px",
                paddingRight: "20px",
              }}
            >
              <Typography
                variant="body1"
                fontWeight={level < 2 ? 600 : 400}
                sx={{
                  cursor: "default",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  ml: level ? 3 : 0,
                }}
              >
                {node.name}
              </Typography>
              {level < 2 ? (
                <Box
                  component="div"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.openNewModalCats(node.id, true);
                  }}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    backgroundColor: "transparent",
                    border: "none",
                    margin: 0,
                    padding: "8px",
                    cursor: "pointer",
                    borderRadius: "50%",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <AddIcon
                    fontSize="small"
                    style={{ color: "#a29999" }}
                  />
                </Box>
              ) : null}
              <Switch
                checked={parseInt(node.is_active) === 1}
                onChange={() => this.props.changeActive(node)}
                style={{ paddingRight: hasChildren ? "0" : `${level > 1 ? level + 8 : 10}px` }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.openModal(node.id);
                }}
              >
                <EditIcon />
              </IconButton>
            </li>
          )}
        </Box>
      );
    });
  }

  render() {
    const { errCats = [], siteCats = [] } = this.props;
    const tree = this.buildTree(errCats);

    return (
      <div style={{ width: "50%" }}>
        <TableContainer>
          <Table size="small">
            <TableBody></TableBody>
          </Table>
        </TableContainer>
        {this.renderRows(tree, siteCats)}
      </div>
    );
  }
}
