import api from './api'
import bigInt from "big-integer";


export async function checkUserRegistered(username) {
  try {
    const res = await api.get(`/user/info?username=${username}`)

    if (typeof res.data === 'object' && res.data.username) {
      return { registered: true, user: res.data, message: null }
    } else {
      return { registered: false, user: null, message: res.data }
    }
  } catch (err) {
    return { registered: false, user: null, message: `Failed to load user, ${err.message}` }
  }
}

// GCD using big-integer objects
function gcd(a, b) {
  while (!b.equals(0)) {
    [a, b] = [b, a.mod(b)];
  }
  return a;
}

// Generate a random bigInt in [min, max) using crypto.getRandomValues
function randomBigInt(min, max) {
  const minBig = bigInt(min);
  const maxBig = bigInt(max);
  const range = maxBig.minus(minBig);
  const byteLength = Math.ceil((range.bitLength() + 1) / 8); // Estimate bytes needed
  let randomValue;
  do {
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes); // Cryptographically secure random bytes
    // Convert bytes to hex and then to bigInt
    const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    randomValue = bigInt(hex, 16);
    // Scale to range: min + (randomValue % range)
    randomValue = minBig.plus(randomValue.mod(range));
  } while (randomValue.geq(maxBig)); // Ensure within [min, max)
  return randomValue;
}


export function generateRandomCoprime(n) {
  let r;
  const two = bigInt(2);
  const nMinusOne = n.minus(1);
  do {
    r = randomBigInt(two, nMinusOne);
  } while (!gcd(r, n).equals(1));
  return r;
}

// Forge commitment for evil prover
export function forgeCommitment(y, publicKeys, challengeBits, n) {
  const nBig = bigInt(n);
  let product = bigInt(1);
  for (let i = 0; i < publicKeys.length; i++) {
    if (challengeBits[i].eq(1)) {
      product = product.multiply(bigInt(publicKeys[i])).mod(nBig);
    }
  }
  const inverse = product.modInv(nBig);
  return y.pow(2).multiply(inverse).mod(nBig);
}