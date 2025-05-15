

## the keys
- Peggy needs to prove to victor that she is actually peggy
- registration of key (storing it on the server) can be done so that the key is known to be associated with Peggy 
## lockboxes / use of the TTP to ensure that the data is bot altered later by Peggy 
- this is actually not necessary, as the commit of x (sqrtm of r) is already enough as a guarantee that Peggy is not changing the value afterwards 

## Loop

- This is how the original protocol works ( Fiat Shamir) published 1986
- Feige-Fiat-Shamir doesn't rely on multiple rounds (published 1988)
- the latter is the better one and the one that is easier to implement 
- I (Konstantin ) Think we should ideally cover both, but we can do the FFS first


[[Sequence(Github)]]

