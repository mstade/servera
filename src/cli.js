#!/usr/bin/env node

import argv from 'yargs'
import usage from './usage'
import { version } from '../package.json'
import { is } from 'funkis'
import createServer from './api'

let opts = argv
  .version(version)
  .options(
    { 'help'    : { alias: 'h'                                     }
    , 'port'    : { alias: 'p', string: true, default: 'random'    }
    , 'address' : { alias: 'a', string: true                       }
    , 'dir'     : { default: true, boolean: true, alias: 'showDir' }
    , 'silent'  : { alias: 's', boolean: true                      }
    , 'open'    : { alias: 'o', string: true                       }
    , 'cache'   : { alias: 'c', default: 0                         }
    , 'proxy'   : { string: true                                   }
    , 'cors'    : { default: true, boolean: true                   }
    }
  )
  .argv

if (opts.help) {
  usage()
  process.exit()
} else {
  createServer(opts).listen()
}