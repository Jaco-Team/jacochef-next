import queryString from 'query-string';
import axios from 'axios';

export function api(module = '', method = '', data = {}, dop_type = {}) {
  //const urlApi_dev = 'http://127.0.0.1:8000/api/'+module+'/'+method;
  //const urlApi_dev = 'https://79.174.91.113/api/'+module+'/'+method;

  const urlApi_dev = 'https://jacochef.ru/api/index_new.php';

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,

    login: localStorage.getItem('token'),
    data: JSON.stringify(data),
  })

  return axios.post(urlApi_dev, this_data, dop_type)
    .then( (response) => {

      if( typeof response.data == 'string' ){
        return {
          st: false,
          text: response.data
        };
      }

     return response; // react
     //return response.data; // lara
    })
    .catch( (error) => {
      console.log(error?.response?.status);

      if( error?.response?.status == 401 ){
        window.location.pathname = '/auth';
      }

      if( error?.response?.status == 403 ){
        window.location.pathname = '/';
      }

    });
}

export function api_laravel(module = '', method = '', data = {}, dop_type = {}) {
  // const urlApi_dev = 'http://127.0.0.1:8000/api/'+module+'/'+method;
  //const urlApi_dev = 'https://79.174.91.113/api/'+module+'/'+method;
  // const urlApi_dev = 'https://apichef.jacochef.ru/api/'+module+'/'+method;
  const urlApi_dev = 'http://apitmp2.jacochef.ru:8000/api/'+module+'/'+method;
  

  //const urlApi_dev = 'https://jacochef.ru/api/index_new.php';

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,

    login: localStorage.getItem('token'),
    data: JSON.stringify(data),
  })

  return axios.post(urlApi_dev, this_data, dop_type)
    .then( (response) => {

      if( typeof response.data == 'string' ){
        return {
          st: false,
          text: response.data
        };
      }

      //return response;
      return response.data;
    })
    .catch( (error) => {
      console.log(error?.response?.status);

      if( error?.response?.status == 401 ){
        window.location = '/auth';
      }

      if( error?.response?.status == 403 ){
        window.location = '/';
      }

    });
}

export function api_laravel_local(module = '', method = '', data = {}, dop_type = {}) {
  const urlApi_dev = 'http://127.0.0.1:8000/api/'+module+'/'+method;
  //const urlApi_dev = 'https://79.174.91.113/api/'+module+'/'+method;
  //const urlApi_dev = 'https://apichef.jacochef.ru/api/'+module+'/'+method;

  //const urlApi_dev = 'https://jacochef.ru/api/index_new.php';

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,

    login: localStorage.getItem('token'),
    data: JSON.stringify(data),
  })

  return axios.post(urlApi_dev, this_data, dop_type)
    .then( (response) => {

      if( typeof response.data == 'string' ){
        return {
          st: false,
          text: response.data
        };
      }

      //return response;
      return response.data;
    })
    .catch( (error) => {
      console.log(error?.response?.status);

      if( error?.response?.status == 401 ){
        window.location = '/auth';
      }

      if( error?.response?.status == 403 ){
        window.location = '/';
      }

    });
}
