import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Download } from "@mui/icons-material";

import { MyDatePickerNewViews } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import DownloadButton from "@/ui/DownloadButton";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";

import DataTable from "./StatSaleDataTable";

// ---------- Таб Продажи ----------
class StatSale_Tab_Sale extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      point: [],

      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),

      data_sale_list: [],
    };
  }

  changePoints(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  get_data_sale = async (exp = false) => {
    const { point, date_start, date_end } = this.state;

    if (!point.length) {
      this.props.openAlert(false, "Необходимо выбрать кафе");

      return;
    }

    const data = {
      date_start,
      date_end,
      point,
    };

    if (exp) {
      const res = await this.props.getData("export_data_sale", data);
      if (!res?.st) {
        return this.props.openAlert(false, res?.text || "Ошибка экспорта");
      }
      this.setState({
        export_file_url: res.url,
      });
      return res.url;
    }

    const res = await this.props.getData("get_data_sale", data);
    if (res.st) {
      this.setState({
        data_sale_list: res.data_sale_list,
      });
    } else {
      this.props.openAlert(res.st, res.text);
    }
  };

  render() {
    const { activeTab, points, openGraphModal } = this.props;
    const { data_sale_list } = this.state;

    return (
      <Grid
        style={{ paddingTop: 0 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TabPanel
          value={activeTab}
          index={0}
          id="clients"
        >
          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <CityCafeAutocomplete2
                label="Кафе"
                withAll
                withAllSelected
                points={points}
                value={this.state.point}
                onChange={(value) => this.changePoints("point", null, value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNewViews
                label="Дата от"
                views={["month", "year"]}
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNewViews
                label="Дата до"
                views={["month", "year"]}
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                onClick={() => this.get_data_sale()}
              >
                Показать
              </Button>
              {this.props.canExport && data_sale_list && (
                <DownloadButton
                  variant="contained"
                  color="success"
                  button={true}
                  url={async () => await this.get_data_sale(true)}
                  sx={{ ml: { sm: 2, xs: 0 } }}
                >
                  <Download />
                </DownloadButton>
              )}
            </Grid>

            {data_sale_list && data_sale_list.columns && data_sale_list.columns.months.length ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                sx={{
                  mt: 3,
                  mb: 5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <DataTable
                  tableData={data_sale_list}
                  openGraphModal={openGraphModal}
                />
              </Grid>
            ) : null}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

export default StatSale_Tab_Sale;
