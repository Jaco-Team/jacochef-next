"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";

export default function AdsPage() {
  const [connections, setConnections] = useState([]);
  const [moduleName, setModuleName] = useState("DEFAULT");
  const [access, setAccess] = useState([]);

  const { api_laravel } = useApi("ads");
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const getProviders = async () => {
    const data = {};
    try {
      const res = await api_laravel("connections", data);
      if (!res?.st) {
        throw new Error(res?.st || "Ошибка получения списка рекламных кабинетов");
      }
      setConnections(res.connections);
    } catch (e) {
      return showAlert(e?.message || "Ошибка");
    }
  };

  useEffect(() => {
    api_laravel("get_all")
      .then((res) => {
        if (!res?.st) {
          throw new Error(res?.st || "Ошибка получения списка рекламных кабинетов");
        }
        setModuleName(res.module_info.name);
        setConnections(res.connections);
        setAccess(res.access);
      })
      .catch((e) => {
        showAlert(e?.message || "Ошибка");
      });
  }, []);

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={false}
      >
        <CircularProgress />
      </Backdrop>
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />
      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <Typography variant="h6">Ads Integrations</Typography>
        </Grid>
        <Button
          variant="contained"
          onClick={getProviders}
        >
          Load Providers
        </Button>
        {connections?.map((p) => (
          <Grid
            size={4}
            key={p.key}
          >
            <Link
              href={`/ads/${p.key}`}
              style={{ textDecoration: "none" }}
            >
              <Card sx={{ cursor: "pointer" }}>
                <CardContent>
                  <Typography variant="h6">{p.name}</Typography>

                  <Chip
                    label={p.connected ? "Connected" : "Not Connected"}
                    color={p.connected ? "success" : "error"}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Link>
          </Grid>
        )) || <Typography variant="h6">Нет записей</Typography>}
      </Grid>
    </>
  );
}
