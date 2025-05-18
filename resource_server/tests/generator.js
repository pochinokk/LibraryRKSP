const { faker } = require('@faker-js/faker');
const fs = require('fs');

function generateBooks(count) {
    const books = [];

    for (let i = 0; i < count; i++) {
        books.push({
            name: faker.lorem.sentence(3),
            author: faker.person.fullName(),
            printing_year: faker.number.int(),
            language: faker.lorem.sentence(1),
            end_date: faker.date.past().toISOString(),
        });
    }
    return books;
}
const data = generateBooks(10);
fs.writeFileSync('test_books.json', JSON.stringify(data, null, 2));
console.log('Создано 10 книг в test_books.json');



