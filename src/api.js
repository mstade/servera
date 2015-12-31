export default createServer

import getPorts from './getPorts'
import { is, each, assert, partial as $ } from 'funkis'
import { accessSync as exists } from 'fs'
import createStaticServer from 'ecstatic'
import http from 'http'
import opener from 'opener'
import dns from 'dns'
import request from 'request'

import { hostname, networkInterfaces as ifconfig } from 'os'

function createServer(
  { root    = process.cwd()
  , port    = 'random'
  , address = '0.0.0.0'
  , showDir = true
  , silent  = false
  , open    = 'default'
  , cache   = 0
  , cors    = false
  , proxy
  }
) {
  assert($(exists, root), 'root path does not exist')

  let ports = getPorts(port)
  let serveFiles = createStaticServer(
    { root
    , cors
    , cache
    , showDir
    , gzip: false
    , handleError: !proxy
    }
  )

  let server = http.createServer((req, res) => {
    serveFiles(req, res, () => {
      if (proxy.match(/^http:/)) {
        req.pipe(request(proxy)).pipe(res)
      } else {
        req.url = proxy
        serveFiles(req, res)
      }
    })
  })

  server.on('error', ({ code }) => {
    if (code in { EACCES:true, EADDRINUSE:true }) {
      console.warn(`Port ${ports[0]} unavailable (${code})`)

      if (ports.length > 1) {
        ports.shift()
        let p = ports[0]
        console.warn(`Trying ${p? `port ${p}` : 'random port'}...`)
        listen(p)
      } else {
        console.error('No more ports to try, giving up!')
        process.exit(1)
      }
    }
  })

  server.on('listening', () => {
    let { address, port } = server.address()
    console.warn(`Serving at http://${address}:${port}`)

    if (proxy) {
      console.warn(`Proxying unmatched routes to ${proxy}`)
    }

    dns.reverse(address, (err, names) => {
      let host = names? names[0] : address
      names && names.map(name => console.warn(`Serving at http://${name}:${port}`))
      open && opener(`http://${host}:${port}`)
    })

  })

  let listen = $(server.listen.bind(server), $, address)

  server.listen = () => listen(ports[0])

  return server
}