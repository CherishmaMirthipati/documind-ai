import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
    baseURL: BASE_URL,
})

// Auto-attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => {
    const form = new URLSearchParams()
    form.append('username', data.username)
    form.append('password', data.password)
    return api.post('/auth/login', form)
}
export const getMe = () => api.get('/auth/me')

// PDFs
export const uploadPDF = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/upload', formData)
}
export const getPDFs = () => api.get('/api/pdfs')
export const deletePDF = (id) => api.delete(`/api/pdf/${id}`)

// Chat
export const askQuestion = (question, pdf_id) =>
    api.post('/api/ask', { question, pdf_id })
export const getChatHistory = (pdf_id) =>
    api.get(`/api/history/${pdf_id}`)