import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { api_laravel, api_laravel_local } from '@/src/api_new';

function FeedbackPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [formsActive, setFormsActive] = useState([]);
  const [formsNonActive, setFormsNonActive] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getData('get_all').then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setFormsActive(data.forms_active);
      setFormsNonActive(data.forms_nonactive);
    });
  }, []);
  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel('feedback_form', method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  return (
    <Grid item xs={12} sm={12} container spacing={3} mb={3} className="container_first_child">
      <Backdrop style={{ zIndex: 99 }} open={isLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid item xs={12} sm={6}>
        <h1>{module.name}</h1>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Button variant="contained" onClick={() => router.push('/feedback_form/new')}>Добавить новую форму</Button>
      </Grid>
      <Grid item xs={12} sm={12}>
        <h3>Активные формы</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Создатель</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formsActive.map((it, k) => (
              <TableRow style={{ cursor: 'pointer' }} hover key={it.name} onClick={() => router.push(`/feedback_form/${it.id}`)}>
                <TableCell>{k + 1}</TableCell>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.date}</TableCell>
                <TableCell>{it.user_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12} sm={12}>
        <h3>Не активные формы</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Создатель</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formsNonActive.map((it, k) => (
              <TableRow style={{ cursor: 'pointer' }} hover key={it.name} onClick={() => router.push(`/feedback_form/${it.id}`)}>
                <TableCell>{k + 1}</TableCell>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.date}</TableCell>
                <TableCell>{it.user_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <FeedbackPage />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  };
}
