
# Sequence Diagram (iterative )





## Fiat Shamir

```mermaid
sequenceDiagram
        actor Trent
        actor Peggy
        actor Victor
        Note over Trent : for the beginnig, select one from the list (https://oeis.org/A016105) <br/>there should be some library for it
        Trent->>Trent : selects / constructs blum integer n<br/> n=p*q, p and q unknown to P,T
        Trent->>Peggy: Blum Int n
        Trent ->> Victor: Blum Int n
        Peggy ->> Peggy : picks k numbers s1, ...sk, coprime to n, as priv. keys 
        Peggy ->> Trent : public key t1,....tk with tj := sqrtm mod n as public keys 
        Note over Trent: keep a registy of the public keys of each prover
        Trent ->> Victor : publishes public key


        Peggy ->> Peggy : random coprime r
        Peggy ->> Victor : sends x (=sqrtm r mod n)
        Victor ->> Peggy : selects k bits c_i € (0,1)
        Peggy ->> Victor : sends y = r * s1^c1* s2^c2*...*sk^ck mod n )
        Victor ->> Victor : verifies the y <br/> y^2 needs equiv x*t1^c1*...tk^ck mod n
```


## Feige Fiat Shamir

```mermaid

sequenceDiagram
        actor Trent
        actor Peggy
        actor Victor
        Note over Trent : for the beginnig, select on from the list (https://oeis.org/A016105) <br/>there should be some library for it
        Trent->>Trent : selects / constructs blum integer n<br/> n=p*q, p and q unknown to P,T
        Trent->>Peggy: Blum Int n
        Trent ->> Victor: Blum Int n
        Peggy ->> Peggy : picks k numbers s1, ...sk, coprime to n, as priv. keys 
                Peggy ->> Trent : public key t1,....tk with tj := sqrtm mod n as public keys 
        Note over Trent: keep a registy of the public keys of each prover
        Trent ->> Victor : publishes public key


        Peggy ->> Peggy : random coprime r
        Peggy ->> Victor : sends x (=sqrtm r mod n)
        Victor ->> Peggy : selects k bits c_i € (0,1)
        Peggy ->> Victor : sends y = r * s1^c1* s2^c2*...*sk^ck mod n )
        Victor ->> Victor : verifies the y <br/> y^2 needs equiv x*t1^c1*...tk^ck mod n


```


link FS
https://www.mermaidchart.com/play#pako:eNqFUstOwzAQ_JVRTykKz2NFe6goEhIChBCnCilx3NRq7E1tBxohLnwPX8WX4DgJiUKBXOxYM7szs_s6YpTw0WRk-LbgivELEaU6kkuF5ouYJY0HzZUdPt7xNC2Hj4-iOrpXzzyczfyJSS7YxuAMOlIJSWSRTjlyLSQ3CPJwOz6P9fEMimJKSmwUvRjYNZc_C_ruE8yzQuLKlVbBND_YjgdAOGSjqY_tUL6MR9W3CWqJJgQjLwyW9hPqso5hqkYWgdlqK2EgKYFySjrSNVEOTYVKQCs8cy1WgkVWUA_zu6ImrFaP_ovTF5UY7BBMa1n6W1ZLuiHLQU5MHVXYxnQHxbnjOt-MpBQWMdk1WGTckOaLy9v7BR7B1lT9u-GAoZ6akHl25DhFlqAwHBmxTUw7hxLKWB5584NV6pQ3G9L2LLFyPnqdAx1Cmx8uGsMD7xlntqL45LJy7DR-vn8gOAlP93N99zY1Vnnfu8n7Mi4RVFKrJLRI1xbsH3n1_Jvwyia88umsyz12oZJKj7A7sLXj_jb1707BUo3evgCM8ihN

link FFS
https://www.mermaidchart.com/play#pako:eNqNk8GO0zAURX_lqqu2CklTCRYRrQRiwwbNYsRqVJQ4r6lJ8tzaTmcixIbv4av4El6ddKYq1YhsHDvP91xfv_yYKFPSJJs4OnTEij7pvLJ5-8AYn1x5Y3Fvif314h1VVX-9-FWfhpfVL8YTzJFGDWTYSpXfEQqqNLOuIjhqSHkYxtaaNnxstPOY7rzfuyxJDGkXG1slHxbpu3Txdob3hU3WUmgJbme6phQ5ONOedhY2t33A6AvPAf9mvT7bGKAOCZRh5213mhRN10Kzp0oMc4CAV_v5IcIeOZc4oOOazSPDG9xF9__qh1QyfDwpfRYSX5VAasaUblcFgVA1vGXYa1U71OCuLcg6uDRCHMeujsT73mo5tbjhCLmDTI8xauodbkkOYNH0aSQSsa_xqP0O_juyFdzB-hatKcFBqysarc5iD696tJKO3N3Zj30V7ohLhydMVwPRDszZy6ax9JJwvrAahZZBfdP48-s3posonf0HrcdKOHMJb6NSGZYbtZxLAnNXb1Q9Hvq2g2claWO91eRCi_ZDE6LfLMFEgpB_SB_xNPcBEdJ9lr5Mb8hy8vMvKBcTZg

only works for me, i believe, just to save it, might pick another editor later
