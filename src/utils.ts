import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://oauth.reddit.com'
})

export function setAuth () {
  api.defaults.headers.Authorization = `bearer ${require('../token.json').access_token}`
}
