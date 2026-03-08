const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'EULA.txt')
const dst = path.join(__dirname, '..', 'EULA-utf16le.txt')

try {
  const text = fs.readFileSync(src, { encoding: 'utf8' })
  // UTF-16LE with BOM
  const bom = Buffer.from([0xFF, 0xFE])
  const utf16 = Buffer.from(text, 'utf16le')
  fs.writeFileSync(dst, Buffer.concat([bom, utf16]))
  console.log('EULA converted to UTF-16LE:', dst)
} catch (e) {
  console.error('Failed to prepare EULA:', e)
  process.exit(1)
}
