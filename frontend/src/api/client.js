import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
})
api.interceptors.response.use(
  (r) => r.data,
  (e) => Promise.reject(new Error(e.response?.data?.message || e.message || 'Network error'))
)
export default api
