import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import { IOrganizations } from "@/pages/api/organizations";
import { FetchError, apiPostJson } from "@/utils/fetchApiUtils";
import useToast from "@/components/notifications/notificationContext";

export interface AddOrgMenuProps {
  open: boolean;
  onClose: () => void;
}

const AddOrgMenu = ({ open, onClose }: AddOrgMenuProps) => {
  const [name, updateName] = useState<string>("");
  const { addToast } = useToast();

  async function handleSave() {
    const res = await apiPostJson<IOrganizations>("/api/organizations", {
      name,
    });
    if (res instanceof FetchError)
      addToast({
        message: `Fehler bei der Verbindung zum Server: ${res.error}`,
        severity: "error",
      });
    else {
      if (res.error)
        addToast({
          message: `Fehler beim Hinzufügen der Organisation: ${res.error}}`,
          severity: "error",
        });

      addToast({
        message: `${res.organization.name} hinzugefügt`,
        severity: "success",
      });
    }
    onClose();
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    updateName(e.currentTarget.value);
  }

  function handleCancel() {
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Neue Organisation hinzufügen</DialogTitle>
      <DialogContent>
        <TextField value={name} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave}>Hinzufügen</Button>
        <Button onClick={handleCancel}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrgMenu;
