'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { api_laravel } from '@/src/api_new';
import { Grid } from '@mui/material';

const DriversMap = ({ pointId = 0 }) => {
  const mapRef = useRef(null);
  const module = 'drive_map_stat_all';
  // const [moduleName, setModuleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [home, setHome] = useState([]);

  const renderPlacemarks = () => {
    const ymaps = window['ymaps'];
    if (!ymaps) return 'no ymaps';

    const objectManager = new ymaps.ObjectManager();
    //дом
    const myGeoObject = new ymaps.GeoObject(
      {
        geometry: {
          type: 'Point',
          coordinates: [home.latitude, home.longitude],
        },
      },
      {
        preset: 'islands#blackDotIcon',
        iconColor: 'black',
      }
    );

    if (!mapRef.current) {
      ymaps?.ready(() => {
        mapRef.current = new ymaps.Map(
          'map',
          {
            center: [home.latitude, home.longitude],
            zoom: 11,
          },
          {
            searchControlProvider: 'yandex#search',
          }
        );

        mapRef.current?.geoObjects.add(myGeoObject);
      });

    } else {
      // дом в центр
      mapRef.current.setCenter([home.latitude, home.longitude]);
      mapRef.current?.geoObjects.removeAll();
    }
    const pointsData = buildObjectManagerItems(home, orders, drivers);
    objectManager.add(pointsData);
    mapRef.current?.geoObjects.add(objectManager);
  };

  const buildObjectManagerItems = () => {
    const json = {
      type: 'FeatureCollection',
      features: [],
    };

    //дом
    json.features.push({
      type: 'Feature',
      id: 0,
      options: {
        preset: 'islands#blackDotIcon',
        iconColor: '#369',
      },
      geometry: {
        type: 'Point',
        coordinates: [home.latitude, home.longitude],
      },
    });

    orders.forEach(function (item) {
      json.features.push({
        type: 'Feature',
        id: item.id,
        options: {
          preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon',
          iconColor: item.point_color ? item.point_color : item.color,
        },
        properties: {
          iconCaption: item.point_text,
          //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
        },
        geometry: {
          type: 'Point',
          coordinates: [item.xy.latitude, item.xy.longitude],
        },
      });
    });

    drivers.forEach(function (driver) {
      driver.positions.forEach(function (pos, key) {
        const [lat, lon] = JSON.parse(pos['xy'], true);

        json.features.push({
          type: 'Feature',
          id: pos.id,
          options: {
            preset: 'islands#stretchyIcon',
            iconColor: driver.color,
          },
          properties: {
            iconContent: key,
          },
          geometry: {
            type: 'Point',
            coordinates: [lat, lon],
          },
        });
      });
    });

    return json;
  };

  const getData = (method, data = {}) => {
    setLoading(true);
    const res = api_laravel(module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setLoading(false);
      });
    return res;
  };

  const updateData = async (point_id) => {
    const data = {
      point_id,
    };

    const res = await getData('get_orders', data);
    setDrivers(res.drivers);
    setOrders(res.orders);
    setHome(res.home);
    renderPlacemarks();
  };

  useEffect(() => {
    const updateByPoint = async () => {
      await updateData(pointId);
    };
    updateByPoint();
  }, [pointId]);

  useEffect(() => {
    renderPlacemarks();
  }, [home, orders, drivers])

  return (
    <>
      {!mapRef.current && (
        <Script
          src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU"
        />
      )}
      <Backdrop open={loading} style={{ zIndex: 99 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={3} className="container_first_child">

        <Grid item xs={12} sm={12}>
          {drivers.map((item, key) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'row', gap: '1em', alignItems: 'center' }}>
              <div style={{ width: 50, height: 20, backgroundColor: item.color }}></div>
              <div>{item.driver_name}</div>
            </div>
          ))}
        </Grid>

        <Grid item xs={12} sm={12}>
          <div id="map" name="map" style={{ width: '100%', height: 700, maxHeight: '700px', paddingTop: 10 }} />
        </Grid>

      </Grid>
    </>
  );
};

export default DriversMap;
