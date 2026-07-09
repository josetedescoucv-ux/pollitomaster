import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const version = packageJson.version

if (!version) {
  console.error('package.json is missing a version field.')
  process.exit(1)
}

const tauriConfigPath = join(root, 'src-tauri', 'tauri.conf.json')
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf8'))
tauriConfig.version = version
writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`)

const cargoTomlPath = join(root, 'src-tauri', 'Cargo.toml')
const cargoToml = readFileSync(cargoTomlPath, 'utf8')
const updatedCargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${version}"`)
writeFileSync(cargoTomlPath, updatedCargoToml)

console.log(`Synced app version to ${version}`)
