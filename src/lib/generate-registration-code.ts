/**
 * Generate a registration code for the Wuzzy Nest Registry.
 *
 * Creates a random secret and its SHA2-512 hash. The secret is the
 * registration code given to the nest operator. The hash is stored
 * in the registry via Add-Registration-Code.
 *
 * Uses the Web Crypto API for browser compatibility.
 */
export async function generateRegistrationCode(secretLength: number = 32) {
  const secret = crypto.getRandomValues(new Uint8Array(secretLength))
  const secretHex = Array.from(secret)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const encoded = new TextEncoder().encode(secretHex)
  const hashBuffer = await crypto.subtle.digest('SHA-512', encoded)
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  console.log('')
  console.log(`Registration Code (give to nest operator):`)
  console.log(`  ${secretHex}`)
  console.log('')
  console.log(`Hash (store via Add-Registration-Code):`)
  console.log(`  ${hash}`)

  return { secret: secretHex, hash }
}
