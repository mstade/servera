import { readFileSync as slurp } from 'fs'
import { resolve } from 'path'
import cliui from 'cliui'
import wsize from 'window-size'

let raw = slurp(resolve(__dirname, '../README.md'), 'utf8')
  .split(/^\n*#+\s*/gim)
  .reduce(function(usage, d) {
    var p = d.split(/\n/)

    if (p[0].match(/^usage$/i)) {
      return p.slice(1).join('\n').replace(/^```.*$/gim, '').trim()
    } else {
      return usage
    }
  })

export default function usage() {
  let wrap = Math.min(80, wsize.width || Infinity)

  var ui = cliui({
    width: wrap,
    wrap: !!wrap
  })

  ui.div(raw)

  console.error(ui.toString())
}