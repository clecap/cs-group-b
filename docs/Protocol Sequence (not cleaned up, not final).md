
- authors :  Robert, Konstantin

# design choice

## Everything is reset after protocol ends


- Reason: 
	- keep it simple
### Via Timeout of the Websocket
- delete the peggys in the database
- peggies are unknown to vicotr again...
- ->need to let Frontend known
	- -> Frontend resets

# Before Sequence

- backend prepares a list of Blum integers...

# Sequence

- chose either peggy or victor
## Victor
- For now assume only one victor
	- Reason: 
		- keep it simple 
		- assure that 2 victors are not trying to communicate with the same peggy
		- Options for change
			- implement a multi victor scenario
			- implement a mechanism that prevents another user acting as victor...
				- button greyed out on the front end maybe

## Peggy Registration
- always new registration!!!
  - no "log in", "resume" ec...

### GET blum integer
- peggy request a Blum integer
- BE randomly draws one..
-
### peggys frontent keeps the blum int....

### peggy clicks registration
- sends the pubkey, used_id and the Blum int to the BE
- needs to know the associaiton between that number and peggy, so that it can sent ot victor later...




### Peggy waits for victor 
- idle screen
- waits for BE to connect websocket 



## Victor

- request the list of registred peggies
- new screen list of peggies
- victor selects one -> sends to BE

## Backend

- sends to victor
	- blum int, public key, id_peggy, (websocket_id?)

## Victor

- builds up websocket to controller
- requests controller ot build up websocket to peggy
	- needs some form of id for that
- change no longer waits for public keys( since he has them, when he selects the peggy)
- waits for commitment (x)
## Peggy 
- protocol starts
- chose random number
- compute the x
- sends x via websocket to websocket to victor
- waits for challenge bits

## Victor
- generates challenge bits
	- auto or manual
- sends via websocket to peggy
- waits for the y
- 


## Peggy
- receives the challenge bits
- computes responce (y)
- sends responce via websocket to victor
- Waits for status of verification

## Victor

- receive the y
- verification....
- sends via websocket status
- (peggy confirms she reiced the status)
- closes websocket..
	- also the one with peggy is closed that way

## Peggy
- gets the result..
- (ack to victor)
- display on the screen

### some form of logout/ cleanup
- removes all data saved in the database of peggy
- 
