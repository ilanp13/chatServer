import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { data } from "./data/dummy"
import { ChatCategory } from "./entity/ChatCategory";

createConnection().then(async connection => {

    // insert new users for test
    data.users.forEach(async user => {
        await connection.manager.save(connection.manager.create(User, user));
    })

    data.categories.forEach(async cat => {
        await connection.manager.save(connection.manager.create(ChatCategory, cat));
    })


})
