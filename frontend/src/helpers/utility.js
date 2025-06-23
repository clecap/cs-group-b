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

// Generate a random big-integer between [min, max)
function randomBigInt(min, max) {
  const range = max.minus(min).plus(1); // Size of the range [min, max]
  const byteLength = Math.ceil(range.bitLength() / 8); // Bytes needed
  let randomValue;
  do {
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes); // Cryptographically secure
    randomValue = bigInt.fromArray([...randomBytes], 256); // Convert bytes to bigInt
  } while (randomValue.lesser(min) || randomValue.greaterOrEquals(max));
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