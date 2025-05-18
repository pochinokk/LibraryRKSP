const request = require('supertest');
const app = require('../index');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const path = require("path");
const private_key = fs.readFileSync(path.resolve(__dirname, '../config/private.pem'), 'utf8');

const admin_access_token = jwt.sign({ id:"673a453bb6fce1901a09d728", role:"ADMIN" }, private_key, {
    algorithm: 'RS256',
    expiresIn: '15m'
});

describe('Создание книг', () => {
    let createdBookIds = [];
    const books = JSON.parse(fs.readFileSync(path.join(__dirname, './test_books.json'), 'utf-8'));
    test('Создание книг из файла', async () => {
        for (const book of books) {
            const res = await request(app).post('/api/v1/books')
            .set("Authorization", `Bearer ${admin_access_token}`)
            .send(book);

            if (res.status === 201) {
                expect(res.body).toHaveProperty('book');
                createdBookIds.push(res.body.book._id);
                console.log("Книга успешно создана");
            } else {
                expect([400, 401]).toContain(res.status);
                expect(res.body).toHaveProperty('message');
                console.log(res.body.message);
            }
        }
        console.log(`Создано книг: ${createdBookIds.length}`);
    });
});