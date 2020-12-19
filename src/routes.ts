import { UserController } from "./controller/UserController";
import { CategoryController } from "./controller/CategoriesController";
import { ChatRoomController } from "./controller/ChatRoomsController";
import { MessagesController } from "./controller/MessagesController";

export const Routes = [
    {
        method: "get",
        route: "/users",
        controller: UserController,
        action: "all",
        annonymous: true
    },
    {
        method: "get",
        route: "/users/:userId",
        controller: UserController,
        action: "one",
        annonymous: true
    },
    {
        method: "post",
        route: "/users",
        controller: UserController,
        action: "save",
        annonymous: true
    },
    {
        method: "delete",
        route: "/users/:userId",
        controller: UserController,
        action: "remove"
    },
    {
        method: 'get',
        route: '/login/:username',
        controller: UserController,
        action: 'login',
        annonymous: true
    },
    {
        method: 'get',
        route: '/logout',
        controller: UserController,
        action: 'logout'
    },
    {
        method: 'get',
        route: '/categories',
        controller: CategoryController,
        action: 'all'
    },
    {
        method: 'get',
        route: '/categories/:catId',
        controller: CategoryController,
        action: 'roomsInCategory'
    },
    {
        method: 'get',
        route: '/chatrooms',
        controller: ChatRoomController,
        action: 'getUserChatRooms'
    },
    {
        method: 'post',
        route: '/chatrooms/:roomId/updateVisit',
        controller: ChatRoomController,
        action: 'updateUserLastVisit'
    },
    {
        method: 'post',
        route: '/chatrooms/:roomId/join',
        controller: ChatRoomController,
        action: 'addUserToRoom'
    },
    {
        method: 'delete',
        route: '/chatrooms/:roomId/leave',
        controller: ChatRoomController,
        action: 'removeUserFromRoom'
    },
    {
        method: 'get',
        route: '/messages/:roomId/:offset?',
        controller: MessagesController,
        action: 'getMessagesFromLast'
    },
    {
        method: 'get',
        route: '/messages_new/:roomId/:offset?',
        controller: MessagesController,
        action: 'getMessagesLastViewed'
    },
    {
        method: 'post',
        route: '/messages/:roomId',
        controller: MessagesController,
        action: 'sendNewMessage'
    }
];
