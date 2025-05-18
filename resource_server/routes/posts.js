const {Router} = require('express');
const router = Router();
const User = require('../models/User');
const Book = require('../models/Book');
const bcrypt = require("bcryptjs");
const express = require("express");
const checkAccess = require("../middleware/access_middleware");
const {Types} = require("mongoose");
router.use(express.json());


//Добавление пользователя
router.post('/api/v1/users', checkAccess(['ADMIN']), async (req, res) => {
    try {
        const { username, password, full_name, phone, address, role} = req.body;

        if(![ username, password, full_name, role ].every(el => el && el.trim()))
        {
            return res.status(400).json({ message: 'Информация некорректна'});
        }

        if (phone && !/^\+\d{11}$/.test(phone.trim())) {
            return res.status(400).json({ message: 'Телефон должен быть в формате +XXXXXXXXXXX (11 цифр)' });
        }

        if (!['ADMIN', 'LIBRARIAN', 'READER'].includes(role))
        {
            return res.status(400).json({ message: 'Роль может быть: ADMIN, LIBRARIAN или READER'});
        }
        const candidate = await User.findOne({username});
        if (candidate){
            return res.status(400).json({message: 'Пользователь с таким именем уже существует'});
        }
        const hashPassword = bcrypt.hashSync(password, 8);
        const user = new User({
            username,
            password: hashPassword,
            full_name,
            phone: phone?.trim() || null,
            address: address?.trim() || null,
            role
        });
        await user.save();
        return res.status(200).json({ message: 'Успешно', user });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});



//Добавление одной книги
router.post('/api/v1/books', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { reader_id, name, author, printing_year, language, end_date } = req.body;
        if(![ name, author, language ].every(el => el && el.trim())) //только для обязательных полей
        {
            return res.status(400).json({ message: 'Информация некорректна'});
        }
        if(reader_id && !Types.ObjectId.isValid(reader_id)) {
            return res.status(400).json({ message: 'Неверный формат ID читателя' });
        }

        if(reader_id)
        {
            const reader = await User.findById(reader_id);
            if(!reader)
            {
                return res.status(404).json({ message: 'Читателя с таким id нет'});
            }
            if(reader.role !== 'READER') {
                return res.status(403).json({ message: 'Нельзя прикреплять книгу к сотруднику или администратору' });
            }
        }

        let printingYearValue = null;
        if (printing_year !== undefined && printing_year !== null && printing_year !== '') {
            const year = parseInt(printing_year);
            const currentYear = new Date().getFullYear();

            if (isNaN(year)) {
                return res.status(400).json({ message: 'Некорректный формат года печати. Ожидается число.' });
            }
            if (year >= 0 || year <= currentYear) {
                printingYearValue = year;
            }
            else{
                return res.status(400).json({ message: 'Год печати должен быть больше или равен 0' });
            }
        }


        let endDateValue = null;
        if (end_date !== undefined && end_date !== null && end_date !== '') {
            const date = new Date(end_date);
            if (isNaN(date.getTime())) {
                return res.status(400).json({ message: 'Некорректный формат даты конца выдачи книги. Ожидается дата.'});
            }
            endDateValue = date;
        }


        const book = new Book({
            reader_id: reader_id?.trim() || null,
            name: name.trim(),
            author: author.trim(),
            printing_year: printingYearValue,
            language: language.trim(),
            end_date: endDateValue
        });

        await book.save();
        return res.status(201).json({ message: 'Успешно', book });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});
//Добавление списка книг
router.post('/api/v1/books/book_list', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const book_list = req.body;
        if (!Array.isArray(book_list) || book_list.length === 0) {
            return res.status(400).json({ message: 'Список книг некорректен или пуст' });
        }

        if (book_list.length > 10) {
            return res.status(400).json({ message: 'За один запрос можно добавлять максимум 10 книг' });
        }

        // Проверка всех книг
        const reader_cache = {};
        for (const book of book_list) {
            const { reader_id, name, author, language, printing_year, end_date } = book;

            if (![name, author, language].every(el => el && el.trim())) {
                return res.status(400).json({ message: 'Информация некорректна' });
            }

            // Проверка printing_year
            if (printing_year !== undefined && printing_year !== null && printing_year !== '') {
                const year = parseInt(printing_year);
                if (isNaN(year) || !isNaN(year) && year < 0) {
                    return res.status(400).json({ message: 'Некорректный формат года печати. Ожидается число.' });
                }
            }

            // Проверка end_date
            if (end_date !== undefined && end_date !== null && end_date !== '') {
                const date = new Date(end_date);
                if (isNaN(date.getTime())) {
                    return res.status(400).json({ message: 'Некорректный формат даты конца выдачи книги. Ожидается дата.'});
                }
            }

            if (reader_id) {
                if (!Types.ObjectId.isValid(reader_id)) {
                    return res.status(400).json({ message: 'Неверный формат ID читателя' });
                }

                if (!reader_cache[reader_id]) {
                    const reader = await User.findById(reader_id).select('role');
                    if (!reader) {
                        return res.status(404).json({ message: `Читателя с id ${reader_id} не существует` });
                    }
                    if(reader.role !== 'READER') {
                        return res.status(403).json({ message: 'Нельзя прикреплять книгу к сотруднику или администратору' });
                    }
                    reader_cache[reader_id] = reader.role;
                }
            }
        }

        // Создание книг
        const returning_books = [];
        for (const book of book_list) {
            const { reader_id, name, author, language, printing_year, end_date } = book;

            const new_book = new Book({
                reader_id: reader_id?.trim() || null,
                name: name.trim(),
                author: author.trim(),
                language: language.trim(),
                printing_year: printing_year !== undefined && printing_year !== null && printing_year !== ''
                    ? parseInt(printing_year)
                    : null,
                end_date: end_date ? new Date(end_date) : null
            });

            await new_book.save();

            const reader_role = reader_id ? reader_cache[reader_id] || null : null;

            returning_books.push({
                ...new_book.toObject(),
                reader_role,
            });
        }

        return res.status(201).json({ message: 'Успешно', book_list: returning_books });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});


//Добавление набора одинаковых книг
router.post('/api/v1/books/identical_books', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { number, book } = req.body;
        const { reader_id, name, author, printing_year, language, end_date } = book;

        if (!Number.isInteger(number) || number <= 0 || number > 10) {
            return res.status(400).json({
                message: 'Количество должно быть целым числом и быть в пределах от 1 до 10'
            });
        }

        if(![ name, author, language ].every(el => el && el.trim()))
        {
            return res.status(400).json({ message: 'Информация некорректна'});
        }

        // Валидация printing_year
        let printingYearValue = null;
        if (printing_year !== undefined && printing_year !== null && printing_year !== '') {
            const year = parseInt(printing_year);
            if (isNaN(year) || !isNaN(year) && year < 0) {
                return res.status(400).json({ message: 'Некорректный формат года печати. Ожидается число.' });
            }
            printingYearValue = year;
        }

        // Валидация end_date
        let endDateValue = null;
        if (end_date !== undefined && end_date !== null && end_date !== '') {
            const date = new Date(end_date);
            if (isNaN(date.getTime())) {
                return res.status(400).json({ message: 'Некорректный формат end_date. Ожидается дата.' });
            }
            endDateValue = date;
        }

        let reader_role = null;
        if (reader_id) {
            if(!Types.ObjectId.isValid(reader_id)) {
                return res.status(400).json({ message: 'Неверный формат ID читателя' });
            }
            const reader = await User.findById(reader_id).select('role');
            if(!reader)
            {
                return res.status(404).json({ message: 'Читателя с таким id нет'});
            }
            if(reader.role !== 'READER') {
                return res.status(403).json({ message: 'Нельзя прикреплять книгу к сотруднику или администратору' });
            }
            reader_role = reader.role;
        }

        let identical_books = [];
        for (let i = 0; i < number; i++)
        {
            const new_book = new Book({
                reader_id: reader_id?.trim() || null,
                name: name.trim(),
                author: author.trim(),
                language: language.trim(),
                printing_year: printingYearValue,
                end_date: endDateValue
            });
            await new_book.save();

            identical_books.push({
                ...new_book.toObject(),
                reader_role
            });
        }



        return res.status(201).json({ message: 'Успешно', identical_books});
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});
module.exports = router;