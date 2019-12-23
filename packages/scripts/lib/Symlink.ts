/* tslint:disable: no-implicit-dependencies */

import {putStrLn, TTY} from '@qio/console'
import {defaultRuntime, QIO} from '@qio/core'
import * as fs from '@qio/fs'
import * as p from 'path'

const FS = fs
const FSEnv = fs.env
const PATH_PACKAGES = p.resolve(__dirname, '../packages')
const PATH_NPM_IGNORE = '../../.npmignore'

const qSymLink = (path: string) => FS.symlink(PATH_NPM_IGNORE, path, 'file')
const qSymLinkForced = (path: string) => FS.remove(path).and(qSymLink(path))

interface INodeError {
  code: string
  message: string
  stack?: string
}
const isNodeError = (err: unknown): err is INodeError =>
  err instanceof Error && err.hasOwnProperty('code')

const program = FS.readdir(PATH_PACKAGES).chain(fileList =>
  QIO.par(
    fileList.map(F => {
      const path = p.resolve(__dirname, '../packages', F, '.npmignore')

      return qSymLink(path)
        .and(putStrLn('OK', path))
        .catch(err =>
          QIO.if(
            isNodeError(err) && err.code === 'EEXIST',
            putStrLn('EXISTS', path)
              .and(qSymLinkForced(path))
              .and(putStrLn('RETRY OK', path)),
            QIO.reject(err)
          )
        )
    })
  )
)

defaultRuntime().unsafeExecute(program.provide({fs: FSEnv, tty: TTY}))
