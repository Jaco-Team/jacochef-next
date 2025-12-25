"use client";

import { Grid, Typography, Button } from "@mui/material";
import SiteClientsOrdersBySourceTable from "./SiteClientsOrdersBySourceTable";
import SiteClientsOrdersByUtmTable from "./SiteClientsOrdersByUtmTable";
import SiteClientsTrafficBySourceTable from "./SiteClientsTrafficBySourceTable";
import SiteClientsTrafficSummaryTable from "./SiteClientsTrafficSummaryTable";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import { useSiteClientsStore } from "../useSiteClientsStore";
import dayjs from "dayjs";

export default function OrdersTraffic({ getData }) {
  const {
    update,
    cities,
    city_id_traffic,
    date_start_traffic,
    date_end_traffic,
    traffic_stats,
    traffic_sources,
    orders_by_source,
    orders_by_utm,
  } = useSiteClientsStore();
  return (
    <>
      <Grid
        container
        spacing={3}
        maxWidth="lg"
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Город"
            multiple={true}
            data={cities}
            value={city_id_traffic}
            func={(_, v) => update({ city_id_traffic: v })}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Дата от"
            customActions={true}
            value={dayjs(date_start_traffic)}
            func={(v) => update({ date_start_traffic: v })}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Дата до"
            customActions={true}
            value={dayjs(date_end_traffic)}
            func={(v) => update({ date_end_traffic: v })}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
        >
          <Button
            onClick={getData}
            variant="contained"
          >
            Показать
          </Button>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
      >
        {/* Визиты статистика */}
        {traffic_stats?.length > 0 && (
          <Grid
            mt={3}
            mb={5}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Typography variant="h4">Визиты все</Typography>
            <SiteClientsTrafficSummaryTable data={traffic_stats[0]} />
          </Grid>
        )}
        {/* Визиты статистика */}

        {/* Визиты по источнику */}
        {traffic_sources?.length > 0 && (
          <Grid
            mt={3}
            mb={5}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Typography variant="h4">Источники трафика</Typography>
            <SiteClientsTrafficBySourceTable rows={traffic_sources} />
          </Grid>
        )}
        {/* Визиты по источнику */}

        {/* Заказы по источнику */}
        {orders_by_source?.length > 0 && (
          <Grid
            mt={3}
            mb={5}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Typography variant="h4">Источники заказов</Typography>
            <SiteClientsOrdersBySourceTable rows={orders_by_source} />
          </Grid>
        )}
        {/* Заказы по источнику */}

        {/* Заказы по utm */}
        {orders_by_utm?.length > 0 && (
          <Grid
            mt={3}
            mb={5}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Typography variant="h4">Заказы по UTM</Typography>
            <SiteClientsOrdersByUtmTable rows={orders_by_utm} />
          </Grid>
        )}
        {/* Заказы по utm */}
      </Grid>
    </>
  );
}
