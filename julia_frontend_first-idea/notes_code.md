# Components and Data

1. FFSDemo.vue -> main component, that contains the entire demonstrator
2. peggy.png -> png icon for Peggy
3. victor.png -> png icon for Victor
4. App.vue -> root component of the Vue application (made some changes)
5. main.js -> entry point of the Vue application (made some changes)

---

# Functions of the demonstrator

## Setup phase

- setting the number of values (k) and the modulus (n)
- generation of the secret values of Peggy
- calculation and display of the public values


## Interactive protocol

- Step-by-step visualization of the protocol process
- animated representation of Peggy and Victor
- thought bubbles showing what each party is “thinking”
- visual representation of the messages sent


## Verification

- display of the verification equations
- color coding of successful/failed verifications
- table with previous rounds
- calculation and display of the security probability


## Explanation

- detailed description of the protocol
- explanation of the individual steps
- information on the security of the protocol

---

# Mathematics summarized

## Basic principle

- in Feige-Fiat-Shamir protocol, “Peggy” (the prover) wants to prove to “Victor” (the verifier) that she knows the square roots of certain numbers without revealing these secret values

## Mathematical steps

### Setup 

- Peggy chooses secret numbers s_1, s_2, ..., s_k
- for each of these numbers, she calculates the public value v_i = s_i^2 mod n
- these public values are published
- n is a modulus (ideally the product of two large prime numbers)

### The proof (each round)

#### Step 1: Commitment

- Peggy chooses a random number r
- She calculates x = r^2 mod n
- She sends x to Victor

#### Step 2: Challenge

- Victor randomly chooses e ∈ {0, 1}
- If e=1, Victor also chooses j ∈ {1, 2, ..., k}
- He sends e (and j if necessary) to Peggy

#### Step 3: Answer

- If e=0: Peggy sends y = r
- If e=1: Peggy sends y = r-s_j mod n

#### Step 4: Verification

- If e=0: Victor checks whether y^2 mod n = x
- If e=1: Victor checks whether y^2 mod n = x-v_j mod n

## Simply explained

### Why does this work?

- If e=0 -> Victor checks whether (r)^2 mod n = r^2 mod n
- obviously always true
- If e=1 -> Victor checks whether (r-s_j)^2 mod n = r^2-v_j mod n
- Since v_j = s_j^2 mod n, this becomes (r-s_j)^2 mod n = r^2-s_j^2 mod n
- This is always mathematically correct

### Why is it safe?

- cheater could only pass one of the two challenges (e=0 or e=1), not both.
- in each round, a cheater has at most a 50% chance of passing
- after t successful rounds, the probability of Peggy cheating is at most (1/2)^t
- With 20 rounds, the probability of cheating would only be about 1 in 1 million

### Why is it “zero knowledge”?

- Victor learns nothing about the secret values s_i because:
    - At e=0, only r is sent (not connected to the secret values)
    - At e=1, r-s_j mod n is “masked” by the randomness of r
    - public values v_i do not reveal the secret s_i due to the difficulty of calculating square roots modulo n

### Modular arithmetic used

- Modulo operation (mod n): Returns the remainder when dividing by n -> Example: 17 mod 5 = 2 (because 17/5 = 3 remainder 2)
- Modular multiplication: (a - b) mod n -> Multiply normally and then calculate the remainder when dividing by n
- Modular exponentiation: a^b mod n -> implemented efficiently in the code using the “Square and Multiply” algorithm 