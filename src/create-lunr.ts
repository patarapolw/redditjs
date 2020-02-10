import fs from 'fs'

import Loki from 'lokijs'
import lunr from 'lunr'

;(async () => {
  const db = new Loki('emoji.loki')
  await new Promise(resolve => db.loadDatabase({}, resolve))
  const col = db.getCollection('emoji')

  const idx = lunr(function () {
    this.ref('$loki')
    this.field('symbol', { boost: 10 })
    this.field('codePoint')
    this.field('description', { boost: 5 })
    this.field('hint', { boost: 5 })
    this.field('alt', { boost: 5 })
    this.field('code', { boost: 3 })

    col.data.map((d) => {
      this.add(d)
    })
  })

  fs.writeFileSync('emoji.idx', JSON.stringify(idx))

  console.dir(idx.search('*fun*'), { depth: null })

  db.close()
})().catch(console.error)