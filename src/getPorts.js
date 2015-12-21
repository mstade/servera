export default getPorts

import { lowerCase, each, range, seq } from 'funkis'

function getPorts(ports) {
  return (ports || 'random').split(',').reduce((parsed, p) => {
    for (let [ptn, build] of patterns) {
      let match = ptn.exec(p)
      if (match) {
        return parsed.concat(build(match))
      }
    }

    throw new TypeError(`invalid port ${p}`)
  }, [])
}

let patterns = new Map

patterns.set(/^(random|0)$/, _ => 0)
patterns.set(/^(\d+)-(\d+)$/, m => {
  let [min, max] = [m[1] | 0, m[2] | 0]
  return Array(max-min + 1).fill(min).map((_, i) => min + i)
})
patterns.set(/^\d+$/, ([port]) => [port | 0])