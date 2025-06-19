import api from './api'

export async function checkUserRegistered(username) {
  try {
    const res = await api.get(`/user/info?username=${username}`)

    if (typeof res.data === 'object' && res.data.username) {
      return { registered: true, user: res.data, message: null }
    } else {
      return { registered: false, user: null, message: res.data }
    }
  } catch (err) {
    return { registered: false, user: null, message: `Failed to load user, ${err.message}` }
  }
}
