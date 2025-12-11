import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import Button from "@mui/material/Button";
import MyAlert from "@/ui/MyAlert";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";

function LkPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [my, setMy] = useState({});
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [points, setPoints] = useState([]);
  const [cats, setCats] = useState([]);
  const [point, setPoint] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setPoints(data.points);
      setMy(data.my);
      if (data.flag) {
        setPoint(data.points[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (cats.length && search) {
      const filteredCats = cats.filter((category) => {
        if (category.items) {
          const filteredItems = category.items.filter((item) =>
            item.pf_name.toLowerCase().includes(search.toLowerCase()),
          );
          return filteredItems.length > 0;
        }
        return false;
      });

      setCats(filteredCats);
    } else {
      setCats(cats);
    }
  }, [search, cats]);

  useEffect(() => {
    if (point.id) {
      getData("get_this_stat_today", { point_id: point.id }).then((data) => {
        setCats(data.cat_pf);
      });
    }
  }, [point]);

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("ras_by_pf_mini", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const showAlert = (status, message) => {
    setErrStatus(status);
    setErrText(message);
    setOpenAlert(true);
  };

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
      sx={{
        mb: 3,
      }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <h1>{module.name}</h1>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyAutocomplite
          data={points}
          value={point}
          func={(event, data) => {
            setPoint(data);
          }}
          multiple={false}
          label="Точка"
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          label={"Поиск"}
          value={search}
          func={(event) => setSearch(event.target.value)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        {cats.length ? (
          <>
            {cats.map((item) => {
              return (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography style={{ fontWeight: "bold" }}>{item.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: "30%" }}>Наименование</TableCell>
                          <TableCell style={{ width: "40%" }}></TableCell>
                          <TableCell style={{ width: "30%" }}>Количество</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.items ? (
                          <>
                            {item.items.map((it) => {
                              return (
                                <TableRow hover>
                                  <TableCell>{it?.pf_name}</TableCell>
                                  <TableCell></TableCell>
                                  <TableCell>
                                    {it?.avg_count} - {it?.max_count} {it?.ed_izmer}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </>
                        ) : null}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </>
        ) : null}
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <LkPage />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
