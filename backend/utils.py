from Crypto.Util import number


def generate_blum(required_bits):
    while True:
        p = number.getPrime(required_bits // 2)
        if p % 4 != 3:
            continue

        q = number.getPrime(required_bits // 2)
        if q % 4 != 3 or p == q:
            continue

        result = p * q
        if result.bit_length() != required_bits:  # (does double the avg time)
            continue

        return result
