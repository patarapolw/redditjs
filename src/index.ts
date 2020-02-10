import fs from 'fs'

import yaml from 'js-yaml'

import DeepFind from './deepfind'
import { api, setAuth } from './utils'

;(async () => {
  setAuth()
  let after: string | undefined
  const output = {} as any

  for (const _ of Array.from({ length: 50 })) {
    let r = await api.get('/top', {
      params: {
        limit: '100',
        after
      }
    })

    after = r.data.data.after

    await Promise.all(new DeepFind(r.data).findKey('name').map(async (kv) => {
      try {
        if (kv.name.startsWith('t3_')) {
          let r1 = await api.get(`/comments/${kv.name.substr(3)}`, {
            params: {
              limit: '100'
            }
          })

          for (const kv1 of new DeepFind(r1.data).findKey('body_html')) {
            if (kv1.body_html) {
              console.log(kv1.name)
              output[kv1.name] = kv1.body_html
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }))
  }

  fs.writeFileSync('output.yaml', yaml.safeDump(output, { skipInvalid: true }))
})().catch(console.error)
