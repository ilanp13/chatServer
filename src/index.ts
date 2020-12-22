import "reflect-metadata";
import { createConnection } from "typeorm";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { DataFillerController } from "./controller/DataFillerController";
import { app } from "./app"

const dbConfig = <MysqlConnectionOptions>{
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [
        __dirname + '/entity/*.ts'
    ]
}

createConnection(dbConfig).then(async connection => {
    // create express app

    await (new DataFillerController()).createTables();
    app.listen(3000);
    console.log("Express server has started on port 3000. Open http://localhost:3000/health");

}).catch(error => console.log(error));
