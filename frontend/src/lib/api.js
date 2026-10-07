import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// === Auth ===
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
}

// === Projects ===
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getAllAdmin: () => api.get('/projects/admin'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  toggleFeatured: (id) => api.patch(`/projects/${id}/toggle-featured`),
}

// === Uploads ===
export const uploadsAPI = {
  uploadImage: (formData, onProgress) => api.post('/uploads/project-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  }),
  uploadImages: (formData, onProgress) => api.post('/uploads/project-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  }),
  deleteImage: (filename) => api.delete(`/uploads/${filename}`),
}

// === Contact ===
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  markRead: (id) => api.patch(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
}

// === Settings & Sections CMS ===
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}

export default api
