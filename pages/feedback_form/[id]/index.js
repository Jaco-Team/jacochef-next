import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/router';
import {
  Checkbox, Chip, FormControlLabel, Rating, TextField, Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { api_laravel, api_laravel_local } from '@/src/api_new';

function FeedbackPage() {
  const router = useRouter();
  const { id } = router.query;

  const [isLoad, setIsLoad] = useState(false);
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState([]);
  const [rating, setRating] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    getData('get_form', { id }).then((data) => {
      document.title = data.item?.name;
      setTitle(data.item.name);
      setFormData(JSON.parse(data.item.form_data));
      setActive(data.item.active);
    });
  }, []);

  const changeActive = (e) => {
    setActive(e.target.checked);
    getData('set_active', {check: e.target.checked , id});
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel('feedback_form', method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'rating':
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Рейтинг</Typography>
            <Rating
              value={rating}
              size="large"
              sx={{ span: { fontSize: '2rem !important' } }}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </div>
        );
      case 'input':
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              placeholder={element.data.placeholder}
              size="small"
            />
          </div>
        );
      case 'textarea':
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              multiline
              size="small"
              rows={4}
              placeholder={element.data.placeholder}
            />
          </div>
        );
      case 'heading':
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h4">{element.data.text}</Typography>
          </div>
        );
      case 'checkbox':
        return (
          <div style={{ marginBottom: 10 }}>
            <FormControlLabel
              control={<Checkbox />}
              label={element.data.label}
              id={element.data.param}
              size="small"
            />
          </div>
        );
      case 'checkboxGroup':
        return (
          <div style={{ marginBottom: 10, display: element.data.conditions.stars.find((value) => value === rating) ? 'initial' : 'none' }}>
            <Typography variant="h6">{element.data.title}</Typography>
            {element.data.checkboxes.map((checkbox) => (
              <div key={checkbox.id} style={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox />}
                  label={checkbox.label}
                  id={checkbox.param}
                />
              </div>
            ))}
          </div>
        );
      case 'tagCloud':
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Облако тегов</Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {element.data.selectedTags.map((tag) => (
                <Chip key={tag} label={tag} onClick={() => toggleTag(tag)} color={selectedTags.includes(tag) ? "primary" : "default"} style={{ cursor: "pointer" }} />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Grid item xs={12} sm={12} container spacing={3} mb={3} className="container_first_child">
      <Backdrop style={{ zIndex: 99 }} open={isLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid item xs={12} sm={12}>
        <h1>{title}</h1>
      </Grid>
      <Grid item xs={12} sm={12} display="flex" flexDirection="column" alignItems="center">
        <div style={{
          width: 500, boxShadow: '0 2px 12px 0 rgba(0, 0, 0, .10)', padding: 20, borderRadius: 10,
        }}
        >
          {formData.map((element) => renderElement(element))}
          <Button variant="contained" style={{float: 'right'}}>Отправить</Button>
          <div style={{marginBottom: 10, float: 'right'}}>
            <FormControlLabel
              control={<Checkbox checked={active} onChange={changeActive} />}
              label={'Активность'}
              id={'active'}
              size="small"
            />
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default function SettingsId() {
  return <FeedbackPage/>;
}

export async function getServerSideProps({req, res, query}) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  };
}
