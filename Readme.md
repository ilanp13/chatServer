# Chat Server

* This is a chat api server, written in Typescript, using TypeORM to connect to the DB of choice (MySQL)
* At the moment it is used for dev, so the DB is raised along the server by docker-compose.

* When the server is raised - it will check if the dummy data is on the DB - and if not - will create dummy data to work with (if you don't want that - you will need to remove line 27 on src/index.ts: ```await (new DataFillerController()).createTables();```)

## Starting to work with the server
* Clone the repository and cd into it.
* run the commands (you need docker and docker-compose for it):
```bash
docker-compose build
docker-compose up
```
* Now you can start communicate with the server (the server listen on port 3000)
* list of api endpoints:
  * annonymous endpoints (you can view them without "login")
    * GET /users - will print all users
    * GET /users/:userId - will print specific user data
    * POST /users - will save a new user - with this params as body:
      ```json
      {
          username: string (unique),
          firstName: string,
          lastName: string,
          userImage: string (url of image)
          
      }
      ```
    * GET /login/:username - login with specific user's username
  * sessioned endpoint (must do login)
    * DELETE /users/:userId - delete a userId (for now, every user can delete every user)
    * GET /logout - log out a current logged in user
    * GET /categories - will return list of chat rooms categories (ABC ASC ordered), with each category holding 5 of its chat rooms (ordered by members count DESC). will show count of members, and if the user is a member or not.
    * GET /categories/:catId - return a category with all of its rooms, same order as before, same data as before.
    * GET /chatrooms - returns all chat rooms that the current user is member of them, ordered from the last updated room down. it shows unread messages count, as well as number of members
    * POST /chatrooms/:roomId/updateVisit - will update the lastVist parameter of the current user in the roomId. will only work if the current user is a member of that room.
    * POST /chatrooms/:roomId/join - adds a user to the given room, if user is not already a member.
    * DELETE /chatrooms/:roomId/leave - if user is member of the given room - will remove the user from the room's members.
    * GET /messages/:roomId/:offset? - will return messages of given room, only if the user is a member of that room. will return the last 50 messages, from the latest down, ordered DESC by createdAt value. if ```offset``` is given, will skip records by that value
    * GET /messages_new/:roomId/:offset? - this is another way to return messages of a room (if the user is a member). it will return the messages in 2 groups: 
      ```json
      {
          readMessages: 'array that holds the last 20 read messages in the room',
          unreadMessages: 'array that holds the first 20 unread messages in the room'
      }
      ```
      the above description is in case that ```offset``` is not given, or its value is 0.
      if the value is different, it depends:
      * ```offset > 0``` - will return only unread messages (20 of them) with the given offset. readMessages value will be null.
      * ```offset < 0``` - will return only read messages (20 of them) with the given offset (abs of it). unreadMessages value will be null.
    * POST /messages/:roomId - will save a new message into the room (only if the user is member of the room).
      its body should hold (but not must):
      ```json
      {
          messageText: string (holds the message text - optional),
          messageImage: string (holds an image url - optional)
      }
      ```
      can send both values, only one of them (or none. didn't bother with validating if at least one has value)
