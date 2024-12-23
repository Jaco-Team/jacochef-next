
import queryString from 'query-string';

export default function api(module = '', method = '', data = {}){

  return fetch('https://jacochef.ru/api/index_new.php', {
    method: 'POST',
    headers: {
      'Content-Type':'application/x-www-form-urlencoded'},
    body: queryString.stringify({
      method: method, 
      module: module,
      version: 2,
      login: localStorage.getItem('token'),
      data: JSON.stringify( data )
    })
  }).then(res => res.json()).then(json => {
    
    console.log(window.location.pathname);

    if( json.st === false && json.type == 'redir' && window.location.pathname != '/' ){
      window.location.pathname = '/';
      return;
    }
    
    if( json.st === false && json.type == 'auth' && window.location.pathname != '/auth' ){
      window.location.pathname = '/auth';
      return;
    }
    
    return json;
  })
  .catch(err => { 
      console.log( err )
  });
}