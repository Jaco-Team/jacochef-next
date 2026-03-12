"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
} from "@mui/material";
import { MySelect } from "@/ui/Forms";
import useVendorsStore from "@/src/stores/useVendorsStore";

export default function ModalAddVendor() {
  const open = useVendorsStore((s) => s.modalOpen);
  const close = useVendorsStore((s) => s.closeModal);
  const addVendor = useVendorsStore((s) => s.addVendor);
  const cities = useVendorsStore((s) => s.cities());

  const [name, setName] = useState("");
  const [city, setCity] = useState(cities?.[1] || "");
  const [address, setAddress] = useState("");
  const [itemsCount, setItemsCount] = useState(0);
  const [active, setActive] = useState(true);

  function handleSave() {
    addVendor({ name, city, address, itemsCount: Number(itemsCount), active });
    setName("");
    setAddress("");
    setItemsCount(0);
  }

  return (
    <Dialog
      open={!!open}
      onClose={close}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add vendor</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          sx={{ mt: 1 }}
        >
          <TextField
            label="Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <MySelect
            label="City"
            data={cities.map((c) => ({ id: c, name: c }))}
            value={city}
            func={(e) => setCity(e.target.value)}
            is_none={false}
          />
          <TextField
            label="Address"
            size="small"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
          />
          <TextField
            label="Items count"
            size="small"
            type="number"
            value={itemsCount}
            onChange={(e) => setItemsCount(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
