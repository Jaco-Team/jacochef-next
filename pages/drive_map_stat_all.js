import React from 'react';

import Script from 'next/script';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect } from '@/ui/elements';

import queryString from 'query-string';

class DriveMapStatAll_ extends React.Component {
  map = null;

  constructor(props) {
    super(props);
        
    this.state = {
      module: 'drive_map_stat_all',
      module_name: '',
      is_load: false,
      
      points: [],
      point: '0',
      drivers: []
    };
  }
  
  async componentDidMount(){
    
    let data = await this.getData('get_all');
    
    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name
    })
    
    document.title = data.module_info.name;
    
    setTimeout( () => {
      //this.updateData();
    }, 100 )
  }
  
  getData = (method, data = {}) => {
    
    this.setState({
      is_load: true
    })
    
    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded'},
      body: queryString.stringify({
        method: method, 
        module: this.state.module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify( data )
      })
    }).then(res => res.json()).then(json => {
      
      if( json.st === false && json.type == 'redir' ){
        window.location.pathname = '/';
        return;
      }
      
      if( json.st === false && json.type == 'auth' ){
        window.location.pathname = '/auth';
        return;
      }
      
      setTimeout( () => {
        this.setState({
          is_load: false
        })
      }, 300 )
      
      return json;
    })
    .catch(err => { 
      console.log( err )
    });
  }
   
  changePoint(event){
    let data = event.target.value;
    
    this.setState({
      point: data
    })
    
    setTimeout( () => {
      this.updateData();
    }, 50 )
  }
  
  async updateData(){
    let data = {
      point_id: this.state.point,
    };
    
    let res = await this.getData('get_orders', data);
    
    this.getOrders(res.orders, res.home, res.drivers)

    this.setState({
      drivers: res.drivers
    })

    console.log( res.drivers )
  }
  
  getOrders(orders, home, drivers){
    let objectManager = new ymaps.ObjectManager();
    
    if( !this.map ){
      ymaps.ready(() => {
        this.map = new ymaps.Map('map', {
          center: [home.latitude, home.longitude],
          zoom: 11
        }, {
          searchControlProvider: 'yandex#search'
        })
        
        //дом
        let myGeoObject = new ymaps.GeoObject({
          geometry: {
            type: "Point",
            coordinates: [home.latitude, home.longitude]
          },
        }, {
          preset: 'islands#blackDotIcon', 
          iconColor: 'black'
        })

        this.map.geoObjects.add(myGeoObject);
        
        let json = {
          "type": "FeatureCollection",
          "features": []
        };
                
        orders.map( function(item){
        
          json.features.push({
            type: "Feature",
            id: item.id,
            options: {
              preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon', 
              iconColor: item.point_color ? item.point_color : item.color
            },
            properties: {
              iconCaption: item.point_text,
            },
            geometry: {
              type: "Point",
              coordinates: [item.xy.latitude, item.xy.longitude]
            },
          })
          
        } )
        
        objectManager.add(json);

        drivers.map( function(driver){
          driver.positions.map( function(pos, key){

            pos['xy'] = JSON.parse(pos['xy'], true);

            json.features.push({
              type: "Feature",
              id: pos.id,
              options: {
                preset: 'islands#stretchyIcon', 
                iconColor: driver.color,
              },
              properties: {
                iconContent: key
              },
              geometry: {
                type: "Point",
                coordinates: [pos['xy'][0], pos['xy'][1]],
              },
            })


          } )
        } )

        objectManager.add(json);

        this.map.geoObjects.add(objectManager);
      });
    }else{

      // дом в центре карты
      this.map.setCenter([home.latitude, home.longitude]);
      
      let json = {
        "type": "FeatureCollection",
        "features": []
      };
              
      //дом
      json.features.push({
        type: "Feature",
        id: 0,
        options: {
          preset: 'islands#blackDotIcon', 
          iconColor: 'black'
        },
        geometry: {
          type: "Point",
          coordinates: [home.latitude, home.longitude]
        },
      })
      
      
      orders.map( function(item){
        
        json.features.push({
          type: "Feature",
          id: item.id,
          options: {
            preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon', 
            iconColor: item.point_color ? item.point_color : item.color
          },
          properties: {
            iconCaption: item.point_text,
            //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
          },
          geometry: {
            type: "Point",
            coordinates: [item.xy.latitude, item.xy.longitude]
          },
        })
        
      } )
      
      objectManager.add(json);

      drivers.map( function(driver){
        driver.positions.map( function(pos, key){

          pos['xy'] = JSON.parse(pos['xy'], true);

          json.features.push({
            type: "Feature",
            id: pos.id,
            options: {
              preset: 'islands#stretchyIcon', 
              iconColor: driver.color,
            },
            properties: {
              iconContent: key
            },
            geometry: {
              type: "Point",
              coordinates: [pos['xy'][0], pos['xy'][1]],
            },
          })


        } )
      } )

      objectManager.add(json);

      this.map.geoObjects.removeAll()
      this.map.geoObjects.add(objectManager);
    }
  }

  render(){
    return (
      <>
        <Script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" />

        <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={6} sm={6}>
            <MySelect data={this.state.points} value={this.state.point} func={ this.changePoint.bind(this) } label='Точка' />
          </Grid>
          <Grid item xs={6} sm={6}>
            <Button variant="contained" onClick={this.updateData.bind(this)}>Обновить данные</Button>
          </Grid>
          
          <Grid item xs={12} sm={12}>
            { this.state.drivers.map( (item, key) =>
              <div key={key} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ width: 50, height: 20, backgroundColor: item.color }}></div>
                <div>{item.driver_name}</div>
              </div>
            ) }
          </Grid>       
          
          <Grid item xs={12} sm={12}>
            <div id="map" name="map" style={{ width: '100%', height: 700, paddingTop: 10 }} />
          </Grid>
        </Grid>
      </>
    )
  }
}

export default function DriveMapStatAll() {
  return <DriveMapStatAll_ />;
}
