var request = require('supertest');
const typeorm = require("typeorm");
import { app } from "../../src/app";


const mockUser = {
    "id": 1,
    "userName": "rachelhanks",
    "firstName": "rachel",
    "lastName": "hanks",
    "userImage": "image-url-of-rachel-hanks"
}
const mockUserRoom = {
    room: 55,
    user: 1,
    lastVisit: '2020-12-22T13:31:49.000Z'
}

describe('Annonymous Endpoints', () => {

    it('health check', async () => {
        const res = await request(app)
            .get('/health')
            .send();
        expect(res.body.status).toEqual(200);
        expect(res.body.Message).toEqual('server is up');
    });

    it('fetch users', async () => {
        typeorm.getRepository = jest.fn().mockReturnValue({
            find: jest.fn().mockResolvedValue([mockUser])
        })

        const res = await request(app)
            .get('/users')
            .send();
        const users = res.body;
        expect(users.length).toEqual(1);
        expect(users[0].id).toEqual(mockUser.id);
        expect(users[0].userName).toEqual(mockUser.userName);
    });

    it('failed login user', async () => {
        typeorm.getRepository = jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(undefined)
        })

        const res = await request(app)
            .get(`/login/${mockUser.userName}`)
            .send();
        expect(res.body.status).toEqual(400);
        expect(res.body.error).toEqual(`No user exist with username ${mockUser.userName}`);
    });

    it('trying to reach authenticated endpoint', async () => {

        const res = await request(app)
            .get(`/chatrooms`)
            .send();
        expect(res.text).toEqual('You need to first login!');
    });

    it('login user', async () => {
        typeorm.getRepository = jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue([mockUser])
        })
        const res = await request(app)
            .get(`/login/${mockUser.userName}`)
            .send();
        expect(res.body.status).toEqual(200);
        expect(res.body.message).
            toEqual(`user ${mockUser.userName} logged in successfully`);
    });

});

