# Chat Server

* This is a chat api server, written in Typescript, using TypeORM to connect to the DB of choice (MySQL)
* At the moment it is used for dev, so the DB is raised along the server by docker-compose.

* When the server is raised - it will check if the dummy data is on the DB - and if not - will create dummy data to work with (if you don't want that - you will need to remove line 27 on src/index.ts: ```await (new DataFillerController()).createTables();```)

## 


