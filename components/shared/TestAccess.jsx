"use client";

import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import { Close, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import TextFilter from "./TextFilter";

function TestAccess({ access, setAccess }) {
  // protect leaking to production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const [localAccess, setLocalAccess] = useState(access);

  const [nameFilter, setNameFilter] = useState("");

  const [modalOpened, setModalOpened] = useState(false);

  const canAccess = (key) => {
    const { userCan } = handleUserAccess(localAccess);
    return userCan("access", key);
  };
  const canView = (key) => {
    const { userCan } = handleUserAccess(localAccess);
    return userCan("view", key);
  };
  const canEdit = (key) => {
    const { userCan } = handleUserAccess(localAccess);
    return userCan("edit", key);
  };

  useEffect(() => setLocalAccess({ ...access }), [access]);

  return (
    <>
      <IconButton
        onClick={() => setModalOpened((prev) => !prev)}
        sx={{ position: "fixed", bottom: 16, right: 16, p: 2, zIndex: 11, background: "#44885545" }}
      >
        {modalOpened ? <Close /> : <Edit />}
      </IconButton>
      <Dialog
        open={modalOpened}
        onClose={() => setModalOpened(false)}
        maxWidth="md"
      >
        <DialogTitle sx={{ position: "relative" }}>
          <Typography>Access Override</Typography>
          <p>
            Измените значение параметра - увидите, как изменится результат проверок
            handleUserAccess.
          </p>
          <p>Нажмите Apply - применится к модулю.</p>
          <IconButton
            onClick={() => setModalOpened(false)}
            sx={{ position: "absolute", top: 1, right: 1, p: 1 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ maxHeight: "55dvh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Access Key
                    <TextFilter
                      value={nameFilter}
                      onChange={setNameFilter}
                    />
                  </TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>canAccess</TableCell>
                  <TableCell>canView</TableCell>
                  <TableCell>canEdit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!!localAccess &&
                  Object.entries(localAccess)
                    .filter(([key]) => key?.toLowerCase()?.includes(nameFilter?.toLowerCase()))
                    .map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>
                          <TextField
                            value={value}
                            type="number"
                            inputProps={{
                              min: 0,
                              max: 1,
                              autoComplete: "off",
                            }}
                            onChange={(e) =>
                              setLocalAccess({ ...localAccess, [key]: +e.target.value })
                            }
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "6px 10px", // custom padding
                                fontSize: "14px", // custom font size
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{<YesNo yes={canAccess(key)} />}</TableCell>
                        <TableCell>{<YesNo yes={canView(key)} />}</TableCell>
                        <TableCell>{<YesNo yes={canEdit(key)} />}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setAccess(localAccess);
                setModalOpened(false);
              }}
            >
              Apply
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

const YesNo = ({ yes }) => {
  return <span style={{ color: yes ? "green" : "red" }}>{yes ? "Yes" : "No"}</span>;
};

export default TestAccess;
