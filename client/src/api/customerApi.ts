import axios from 'axios'

const customerApi = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default customerApi
