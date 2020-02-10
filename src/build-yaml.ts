import fs from 'fs'

import yaml from 'js-yaml'
import cheerio from 'cheerio'
import escapeRegexp from 'escape-string-regexp'
import runes from 'runes'

const $ = cheerio.load('<body></body>')
$.root().html(Object.values<string>(yaml.safeLoad(fs.readFileSync('output.yaml', 'utf8')))
  .join('\n\n'))
$.root().html($.root().text())

const emojiSorted = Object.entries(runes($.root().text().replace(new RegExp(`[${
  escapeRegexp('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')
}\\s\\d\\w]`, 'g'), '')).reduce((acc, k) => {
  acc[k] ? acc[k]++ : (acc[k] = 1)
  return acc
}, {} as Record<string, number>)).sort(([_, v1], [__, v2]) => v2 - v1).map(([k, v]) => ({[k]: v}))

fs.writeFileSync('reports/emoji.yaml', yaml.safeDump(emojiSorted))
fs.writeFileSync('reports/emoji.md', emojiSorted.map(pair => {
  const k = Object.keys(pair)[0]
  const v = pair[k]
  return `- ${k} -- ${v}`
}).join('\n') + '\n')
