import React, { Component } from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { MyCheckBox } from "@/ui/Forms";

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
  renderRows(nodes, siteCats, level = 0, indexOffset = { i: 0 }) {
    return nodes.flatMap((node) => {
      const indent = (level + 1) * 16; // clearer depth: 0, 24, 48, 72 px...

      const row = (
        <TableRow
          key={node.id}
          hover
        >
          <TableCell>{++indexOffset.i}</TableCell>

          <TableCell
            onClick={() => this.props.openModal(node.id)}
            style={{
              fontWeight: level < 2 ? 600 : 400,
              cursor: "pointer",
              paddingLeft: indent,
              whiteSpace: "nowrap",
            }}
          >
            {node.name}
          </TableCell>
          {/* <TableCell>
            {this.parseSiteCats(node.site_cats)
              .map((id) => siteCats.find((x) => x.id === id)?.name)
              .filter(Boolean)
              .join(", ")}
          </TableCell> */}
          <TableCell>
            <MyCheckBox
              value={parseInt(node.is_active) === 1}
              func={() => this.props.changeActive(node)}
            />
          </TableCell>
        </TableRow>
      );

      return [
        row,
        node?.children?.length > 0
          ? this.renderRows(node.children, siteCats, level + 1, indexOffset)
          : null,
      ];
    });
  }

  render() {
    const { errCats = [], siteCats = [] } = this.props;
    const tree = this.buildTree(errCats);

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "50px" }}>#</TableCell>
              <TableCell style={{ width: "55%" }}>Категория</TableCell>
              {/* <TableCell style={{ width: "35%" }}>Связанные категории сайта</TableCell> */}
              <TableCell>Активность</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>{this.renderRows(tree, siteCats)}</TableBody>
        </Table>
      </TableContainer>
    );
  }
}
