import fs from 'fs'

import yaml from 'js-yaml'
import cheerio from 'cheerio'
import escapeRegexp from 'escape-string-regexp'
import runes from 'runes'
import Loki from 'lokijs'

;(async () => {
  const db = new Loki('emoji.loki')
  await new Promise(resolve => db.loadDatabase({}, resolve))
  const col = db.getCollection('emoji')
  const symbols: string[] = col.data.map(d => d.symbol)

  const $ = cheerio.load('<body></body>')
  $.root().html(Object.values<string>(yaml.safeLoad(fs.readFileSync('output.yaml', 'utf8')))
    .join('\n\n'))
  $.root().html($.root().text())

  const emojiSorted = Object.entries(runes($.root().text().replace(new RegExp(`[${
    escapeRegexp('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')
  }\\s\\d\\w]`, 'g'), '')).reduce((acc, k) => {
    acc[k] ? acc[k]++ : (acc[k] = 1)
    return acc
  }, {} as Record<string, number>))
    .filter(([k, _]) => symbols.includes(k))

  const total = emojiSorted.map(([_, v]) => v).reduce((prev, c) => prev + c, 0)
  
  console.log('Emoji votes:', total)
  console.log('Number of emojis:', emojiSorted.length)

  emojiSorted.map(([emo, count]) => {
    col.updateWhere(d => d.symbol === emo, d => {
      d.frequency = count / total
      return d
    })
  })

  db.save(err => err ? console.error(err) : null)
  db.close(err => err ? console.error(err) : null)
})().catch(console.error)
