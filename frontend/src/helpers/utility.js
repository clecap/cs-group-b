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
  // bigInt.randBetween is inclusive, so use max.minus(1)
  return bigInt.randBetween(bigInt(min), bigInt(max).minus(1));
}

// Generate random coprime r (as a big-integer object)
export function generateRandomCoprime(n) {
  let r;
  const two = bigInt(2);
  const nMinusOne = n.minus(1);
  do {
    r = randomBigInt(two, nMinusOne);
  } while (!gcd(r, n).equals(1));
  return r; // returns a big-integer object
}
