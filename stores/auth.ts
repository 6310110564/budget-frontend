import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useCookie, navigateTo } from '#imports'
import { useApi } from '~/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
  const api = useApi()

  const isLoggedIn = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const data = await api.post('/v1/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    return data
  }

  async function register(name: string, email: string, password: string) {
    const data = await api.post('/v1/auth/register', { name, email, password })
    token.value = data.token
    user.value = data.user
    return data
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      user.value = await api.get('/v1/auth/me')
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
