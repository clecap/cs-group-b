
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

## Updated Sequence Diagram
```mermaid
sequenceDiagram
    Peggy-->>Peggy:start
    BackendAPI->BackendAPI: prepares Blum integers
    Peggy->>+BackendAPI: start registration
    Peggy->>BackendAPI: request random Blum integers
    BackendAPI->>Peggy: sends random Blum integer
    Peggy->>Peggy: generates private and public key, insert a username
    Peggy->>BackendAPI: sends (public key, id/name/address, Blum integer)
    BackendAPI-->>-Peggy: finish registration
    Peggy->>+BackendAPI: starts login
    Peggy->>BackendAPI: sends log in username
    BackendAPI->>BackendAPI: checks usersname
    BackendAPI-->>-Peggy: finish login
    Peggy-->+BackendSocketController:waits for connection
    Peggy->>Peggy: idle
    Victor->>+BackendAPI: joins protocol
    Victor->>BackendAPI: requests list of registrated Peggys
    BackendAPI->>Victor: sends list
    Victor->>Victor: idle if no Peggy
    Victor->>BackendAPI: sends choice
    BackendAPI->>Victor: sends (public key, id/name/address, Blum integer) of chosen Peggy
    BackendAPI-->>-Victor: finish join
    Victor->>+BackendSocketController: starts socket connection
    Victor->>BackendSocketController: requets controller to build connection via Peggie's address
    BackendSocketController->>Peggy: inform, starts protocol
    Victor->>Victor: idle
    Peggy->>Peggy: computes or predict
    Peggy->>BackendSocketController: sends commitment (x)
    BackendSocketController->>Victor: sends commitment (x)
    Peggy->>Peggy: idle
    Victor->>Victor: generates challenge bits
    Victor->>BackendSocketController: sends challenge bits
    BackendSocketController->>Peggy: sends challenge bits
    Victor->>Victor: idle
    Peggy->>Peggy: computes response (y)
    Peggy->>BackendSocketController: sends response (y)
    BackendSocketController->>Victor: sends response (y)
    Peggy->>Peggy: idle
    Victor->>Victor: verifies
    Victor->>BackendSocketController: sends verfication status
    BackendSocketController->>Peggy: sends status
    Peggy->>BackendSocketController: acknowledge
    BackendSocketController->>Victor: acknowledge
    Victor->>BackendSocketController: requests to close connection to Peggy
    BackendSocketController->>Peggy: closes connection
    BackendSocketController-->>-Victor: connection closed
    BackendSocketController-->>-Peggy: connection closed
    Victor->>Victor: leaves
    Peggy->>Peggy: shows result
    Peggy->>BackendAPI: requests log-out
    BackendAPI->>BackendAPI: clean-up
    
```
link Sequence Diagram
https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqdVj2P2zAM_StCliZojNszBOi1S7cDCnS6RZFoRz1ZdCU5aVD0v5f-SmRLPieXxYbN9_j4SNH5uxIoYbVbOfhdgxHwTfHC8vLVMPq9QFFcsmy_b292znPruzfPXLyBkV9evmf72_2OVRYqbsGxZ12XTBkPBVgXsu33n0NAy8ksFMp5y71CMw4OY22j0VE0NxLLVIpQVi-aOXrgUphxoj66AAOkgyqorDrRDSMgq-qDVoK9wWVLaAckmbOaroaXMC-4S70eoeVTg3niUpJNbjtStImqIMKsV5Yro9zxHatiXx3TWCizJJCCSMGknpGVIUYcQby5Ntolw2PNkYrsKvYH0sV_ReMtag12d-aKdOdomUBjQMR19txK6j73TyU82qkDv5A6RV1EjwL1JDIxVuQDGcswv1kMskuamq6O6mohASYphoBGJ1M5M9iRvaOk4xJHVAIWUz4wVk1RxEq4UMKkZQN737PGvhl7o54N0-baF1HjprXG-LYFRCCuz5hHdqiVlgEbOyneFqDgk2N9qaNapszBtBgaqXI7KJ0Zi7BnyaETWFZ1sx1oPmnXSYpPnq6ERV1vsSyVL8F4tv6zWdI-bngKu3wmBo7bYhNHTvymAHago3Zvi4bZjLGL3s9DP2A89bxCWsFsfdk8ZH0MvNf4-ZTLtp_AqlzBgzYTKlei3fHNxPr6MatDyKI79NzgWYMs4F5bIsidJ7xZsnSuhaZVFJ5rj4m9NF9ki3fRmpnDhcstSNqyyGXodQCTyKjhGvgJXHJM3BHP7TTV2i_-y2k_yxnWfulzTAlNVldd2Ct5sfr3H_QOahM
