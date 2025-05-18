const request = require('supertest');
const auth = require('../index');
const api = require('../../resource_server/index');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require("path");
const private_key = fs.readFileSync(path.resolve(__dirname, '../config/private.pem'), 'utf8');


describe('Регистрация пользователей', () => {
    let createdUserIds = [];
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, './test_users.json'), 'utf-8'));

    test('Регистрация пользователей из файла', async () => {
        for (const user of users) {
            const res = await request(auth).post('/auth/v1/register').send(user);
            if (res.status === 201) {
                expect(res.body).toHaveProperty('id');
                createdUserIds.push(res.body.id);
                console.log("Пользователь успешно зарегистрирован");
            } else {
                console.log(res?.body?.message);
            }
        }
        console.log(`Создано пользователей: ${createdUserIds.length}`);
    });

});