import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export default function setup() {
  const serverRoot = fileURLToPath(new URL('..', import.meta.url))

  rmSync(`${serverRoot}/prisma/test.db`, { force: true })

  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit',
  })
}
