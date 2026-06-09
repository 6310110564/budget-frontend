import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
  const api = useApi()

  const isLoggedIn = computed(() => !!token.value)

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    return data
  }

  async function register(name, email, password) {
    const data = await api.post('/api/auth/register', { name, email, password })
    token.value = data.token
    user.value = data.user
    return data
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      user.value = await api.get('/api/auth/me')
    } catch {
      token.value = null
      user.value = null
    }
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, token, isLoggedIn, login, register, fetchMe, logout }
})
