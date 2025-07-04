import axios from 'axios';
// Base URL targets Express proxy
const api = axios.create({ baseURL: 'http://localhost:3001/api/submissions', withCredentials: true });
export default api;