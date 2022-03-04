import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000/api/';

let refresh =false;

axios.interceptors.response.use(res => res, async error => {
  console.log('render');
  if(error.response.status === 401 && !refresh) {
    console.log('render in if');
    refresh = true;
    const response = await axios.post('refresh', {}, {withCredentials: true});

    if (response.status === 200) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return axios(error.config);
    }
  }

  refresh = false;
  return error;
});