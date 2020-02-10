import fs from 'fs'

import yaml from 'js-yaml'

import DeepFind from './deepfind'
import { api, setAuth } from './utils'

;(async () => {
  setAuth()
  let after: string | undefined
  const output = {} as any

  for (const _ of Array.from({ length: 10 })) {
    let r = await api.get('/top', {
      params: {
        limit: '100',
        after
      }
    })
    new DeepFind(r.data).findKey('selftext_html').map((kv) => {
      if (kv.selftext_html) {
        console.log(kv)
        output[kv.name] = output[kv.selftext_html]
      }
    })

    after = r.data.after
  }

  fs.writeFileSync('output.yaml', yaml.safeDump(output))
})().catch(console.error)
