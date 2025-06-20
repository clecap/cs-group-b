
- Author: Konstantin Frunzek
## Starting point

- ubuntu server
- preinstalled docker
- preinstalled git
- (this is what you get when using the hetzner serveer with docker-ce as image)


## setup of the server 
- connect via ssh
- set root pw
	- passwd
- create user
	- useradd konstantin
- add user to group sudo, docker
	- usermod -a -G sudo,docker
- log in as this user
- test if docker is running
	- docker run hello-world
- create ssh-key
	- ssh-keygen
- add this ssh key to github
- test connection
	- ssh -T git@github.com
- clone the repo
- start docker compose
	- docker compose -f docker-compose-prod.yml up --build


## DNS

- created account on noip.com (already had one )
- next setup the dynamic update client
- #TODO
- i have done it in the past using this video
	- https://youtu.be/8xp4kkbsZi0
- apparently now it works a bit differen?
	- https://www.noip.com/download?page=linux
## SSL certificates
- #TODO talk that through with the group
- 

- lets encrypt
https://youtu.be/QtH0um4dRxA
- 