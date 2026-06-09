export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('token')

  const request = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(`${config.public.apiBase}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด')
    return data
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    del: (path) => request(path, { method: 'DELETE' })
  }
}
