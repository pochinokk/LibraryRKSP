const { faker } = require('@faker-js/faker');
const fs = require('fs');

function generateUsers(count) {
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push({
            username: faker.internet.username(),
            password: faker.internet.password(8),
            full_name: faker.person.fullName(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress()
        });
    }
    return users;
}
const data = generateUsers(10);
fs.writeFileSync('test_users.json', JSON.stringify(data, null, 2));
console.log('Создано 10 пользователей в test_users.json');



