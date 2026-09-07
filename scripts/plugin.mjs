/** Inspect the selected deployment; mutate only through explicit install/removal flags. */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageDirectory = join(root, 'packages', 'dsh-weather-tool')
const { name } = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'))
const [operation = 'inspect', ...flags] = process.argv.slice(2)
const mutation = operation === 'setup' && flags[0] === '--install'
  ? 'add'
  : operation === 'remove' && flags[0] === '--remove' ? 'remove' : undefined

function main() {
  if (!['setup', 'inspect', 'remove'].includes(operation)
      || flags.length > 1 || (flags.length === 1 && mutation === undefined)) {
    throw new Error('Usage: node scripts/plugin.mjs [inspect | setup [--install] | remove [--remove]]')
  }
  const { DSH_CHECKOUT: checkout, DSH_HOME: home, DSH_PROFILE: profile } = process.env
  const problems = []
  for (const [key, value] of Object.entries({ DSH_CHECKOUT: checkout, DSH_HOME: home })) {
    if (!value || !isAbsolute(value)) problems.push(`${key} must be an explicit absolute directory`)
    else if (!existsSync(value) || !statSync(value).isDirectory()) problems.push(`${key} directory does not exist: ${value}`)
  }
  if (!profile || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(profile)) {
    problems.push('DSH_PROFILE must be an explicit profile name without path separators')
  }
  const cli = checkout && isAbsolute(checkout) ? join(checkout, 'apps', 'cli', 'lib', 'bin.js') : undefined
  if (cli && (!existsSync(cli) || !statSync(cli).isFile())) problems.push(`Built CLI missing: ${cli}`)
  const profileDirectory = home && isAbsolute(home) && profile && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(profile)
    ? join(home, 'profiles', profile) : undefined
  console.log(JSON.stringify({
    operation: mutation ?? 'inspect', package: name, packageDirectory,
    checkout: checkout ?? null, home: home ?? null, profile: profile ?? null,
    cli: cli ?? null, profileDirectory: profileDirectory ?? null,
    profileExists: profileDirectory ? existsSync(profileDirectory) : false,
    problems,
  }, null, 2))
  if (!mutation) return
  if (problems.length) throw new Error(problems.join('\n'))
  const result = spawnSync(process.execPath, [cli, 'plugin', '--profile', profile, mutation,
    mutation === 'add' ? packageDirectory : name], { cwd: root, env: process.env, stdio: 'inherit' })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
