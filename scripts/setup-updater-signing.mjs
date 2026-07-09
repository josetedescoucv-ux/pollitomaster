import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const keyDir = join(homedir(), '.tauri')
const privateKeyPath = join(keyDir, 'pollito-master.key')
const publicKeyPath = `${privateKeyPath}.pub`
const tauriConfigPath = join(root, 'src-tauri', 'tauri.conf.json')

mkdirSync(keyDir, { recursive: true })

const generate = spawnSync(
  'npx',
  ['tauri', 'signer', 'generate', '-w', privateKeyPath, '--force'],
  { cwd: root, stdio: 'inherit', shell: true },
)

if (generate.status !== 0) {
  console.error('Failed to generate updater signing keys.')
  process.exit(generate.status ?? 1)
}

if (!existsSync(publicKeyPath)) {
  console.error(`Expected public key file at ${publicKeyPath}`)
  process.exit(1)
}

const publicKey = readFileSync(publicKeyPath, 'utf8').trim()
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf8'))
tauriConfig.plugins ??= {}
tauriConfig.plugins.updater ??= {}
tauriConfig.plugins.updater.pubkey = publicKey
writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`)

console.log('')
console.log('Updater signing configured.')
console.log(`Private key: ${privateKeyPath}`)
console.log('Public key was written to src-tauri/tauri.conf.json')
console.log('')
console.log('For signed release builds, set these environment variables:')
console.log(`  TAURI_SIGNING_PRIVATE_KEY=<contents of ${privateKeyPath}>`)
console.log('  TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<password if you set one>')
