import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { MyAutocomplite, MySelect, MyTextInput } from "@/ui/Forms";
import Grid from "@mui/material/Grid";
import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const ModalEditDriversFeedback = ({ open, onClose, save, item }) => {
  const types = [
    { id: 1, name: "Новое" },
    { id: 2, name: "В работе" },
    { id: 3, name: "Отклонено" },
    { id: 4, name: "Решено" },
  ];
  const [type, setType] = useState(types[0]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setType(types.find((it) => it.id === item.status_id));
    setComment(item.answer);
  }, []);

  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        Просмотор заявки от {item.user_name} на {item.date_time_create}
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", fontWeight: "bold" }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="body1"
              gutterBottom
            >
              <Box
                component="span"
                fontWeight="bold"
              >
                Кто создал:
              </Box>{" "}
              {item.user_name}
            </Typography>
            {item.status_id === 3 || item.status_id === 4 ? (
              <Typography
                variant="body1"
                gutterBottom
              >
                <Box
                  component="span"
                  fontWeight="bold"
                >
                  Кто закрыл:
                </Box>{" "}
                {item.user_answer}
              </Typography>
            ) : null}
            <Typography
              variant="body1"
              gutterBottom
            >
              <Box
                component="span"
                fontWeight="bold"
              >
                Тип обращения:
              </Box>{" "}
              {item.type}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
            >
              <Box
                component="span"
                fontWeight="bold"
              >
                Статус:
              </Box>{" "}
              {item.status}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
            >
              <Box
                component="span"
                fontWeight="bold"
              >
                Заголовок:
              </Box>{" "}
              {item.title}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
            >
              <Box
                component="span"
                fontWeight="bold"
              >
                Описание:
              </Box>{" "}
              {item.description}
            </Typography>
          </Box>
          <Grid
            item
            xs={4}
          >
            <MyAutocomplite
              data={types}
              disabled={item.status_id === 3 || item.status_id === 4}
              value={type}
              multiple={false}
              func={(event, data) => {
                setType(data);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            <MyTextInput
              value={comment}
              disabled={item.status_id === 3 || item.status_id === 4}
              func={(e) => setComment(e.target.value)}
              label="Комментарий"
              fullWidth
            />
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button
          onClick={() => save(item.id, type, comment)}
          disabled={item.status_id === 3 || item.status_id === 4}
        >
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
