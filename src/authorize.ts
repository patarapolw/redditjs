import qs from 'querystring'
import crypto from 'crypto'
import fs from 'fs'

import puppeteer from 'puppeteer'

import { setAuth } from './utils'
import secret from '../secret.json'
import axios from 'axios'

interface IAuthorizeParams {
  client_id: string
  redirect_uri: string
  duration: 'temporary' | 'permanent'
  /**
   * Scope Values: identity, edit, flair, history, modconfig, modflair, modlog, modposts, modwiki, mysubreddits, 
   * privatemessages, read, report, save, submit, subscribe, vote, wikiedit, wikiread.
   * 
   * Space-separated
   */
  scope: string
}

async function authorize (outputPath: string, params: Partial<IAuthorizeParams> = {}) {
  const browser = await puppeteer.launch({ headless: false })
  const page = (await browser.pages())[0]
  const state = crypto.randomBytes(64).toString('hex')
  console.log(`Using state: ${state}`)

  page.goto(`https://www.reddit.com/api/v1/authorize?${qs.stringify({
    ...Object.assign({
      client_id: secret.client_id,
      redirect_uri: secret.redirect_uri,
      duration: 'temporary',
      scope: 'read'
    }, params),
    response_type: 'code',
    state
  })}`)

  const code = await new Promise((resolve, reject) => {
    page.on('framenavigated', (evt) => {
      const url = evt.url()
      if (url.startsWith(secret.redirect_uri)) {
        const u = new URL(url)
        console.log(u.searchParams)
        const state0 = u.searchParams.get('state')
        const code = u.searchParams.get('code')
        state0 === state ? resolve(code) : reject(state0) 
      }
    })
  }) as string | null

  await page.close()
  await browser.close()

  const r = await axios.post('https://www.reddit.com/api/v1/access_token', qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: secret.redirect_uri
  }), {
    headers: {
      Authorization: `Basic ${
        Buffer.from(`${secret.client_id}:${secret.client_secret}`).toString('base64')
      }`
    }
  })

  fs.writeFileSync(outputPath, JSON.stringify(r.data, null, 2))

  setAuth()
}

authorize('token.json', {
  scope: 'identity read'
}).catch(console.error)