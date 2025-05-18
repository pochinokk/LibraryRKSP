const {Router} = require('express');
const router = Router();
const User = require('../models/User');
const Book = require('../models/Book');
const bcrypt = require("bcryptjs");
const express = require("express");
const checkAccess = require("../middleware/access_middleware");
const {Types, Schema} = require("mongoose");
router.use(express.json());

//Изменение пользователя
router.patch('/api/v1/users/:id',  checkAccess(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, phone, address, role } = req.body;
        console.log(`Админ изменяет пользователя "${id}"`);

        if (!id) {
            return res.status(400).json({ message: 'Не указан ID пользователя для изменения' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }


        const user = await User.findById(id).lean();
        if (username?.trim())
        {
            const check_username_user = await User.findOne({ username }).lean();
            if (check_username_user && !user._id.equals(check_username_user._id))
            {
                return res.status(400).json({message: 'Пользователь с таким именем уже существует'});
            }
        }

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'Изменять администраторов можно только в самой базе данных' });
        }

        // Формируем объект обновления
        const updates = {};
        if (username?.trim()) updates.username = username;
        if (password?.trim()) updates.password = bcrypt.hashSync(password, 8);
        if (full_name?.trim()) updates.full_name = full_name;
        if (phone !== undefined) {
            updates.phone = phone?.trim() || null;
        }
        if (address !== undefined) {
            updates.address = address?.trim() || null;
        }
        if (['ADMIN', 'LIBRARIAN', 'READER'].includes(role)) updates.role = role;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Нет данных для обновления' });
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        console.log(`Пользователь ${id} успешно изменён`);
        return res.json({ message: 'Успешно', user: updatedUser });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});


//Изменение читателя
router.patch('/api/v1/readers/:id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, phone, address} = req.body;
        console.log(`Админ или сотрудник изменяет читателя "${id}"`);

        if (!id) {
            return res.status(400).json({ message: 'Не указан ID читателя для изменения' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }


        const user = await User.findById(id);
        if (username?.trim())
        {
            const check_username_user = await User.findOne({ username });
            if (check_username_user && !user._id.equals(check_username_user._id))
            {
                return res.status(400).json({message: 'Пользователь с таким именем уже существует'});
            }
        }

        if (!user) {
            return res.status(404).json({ message: 'Читатель не найден' });
        }

        if (user.role !== 'READER') {
            return res.status(403).json({ message: 'Сотрудник может изменять только читателей' });
        }

        const updates = {};
        if (username?.trim()) updates.username = username;
        if (password?.trim()) updates.password = bcrypt.hashSync(password, 8);
        if (full_name?.trim()) updates.full_name = full_name;
        if (phone !== undefined) {
            updates.phone = phone?.trim() || null;
        }
        if (address !== undefined) {
            updates.address = address?.trim() || null;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Нет данных для обновления' });
        }

        const updatedReader = await User.findByIdAndUpdate(id, updates, { new: true });

        console.log(`Читатель ${id} успешно изменён`);
        return res.json({ message: 'Успешно', reader: updatedReader });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});







//Изменение книги
router.patch('/api/v1/books/:id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { reader_id, name, author, printing_year, language, end_date } = req.body;
        console.log(`Изменение книги "${id}"`);

        if (!id) {
            return res.status(400).json({ message: 'Не указан ID книги для изменения' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID книги' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Книга не найдена' });
        }

        const updates = {};

        if (reader_id?.trim()) {
            if (!Types.ObjectId.isValid(reader_id)) {
                return res.status(400).json({ message: 'Неверный формат ID читателя' });
            }

            const candidate = await User.findById(reader_id);
            if (!candidate) {
                return res.status(400).json({ message: 'Пользователь с таким ID не найден' });
            }
            if(candidate.role !== 'READER') {
                return res.status(403).json({ message: 'Нельзя прикреплять книгу к сотруднику или администратору' });
            }

            updates.reader_id = reader_id.trim();
        }
        else if (reader_id !== undefined){
            updates.reader_id = reader_id?.trim() || null;
        }
        if (name?.trim()) updates.name = name.trim();
        if (author?.trim()) updates.author = author.trim();

        if (printing_year !== undefined) {
            const year = parseInt(printing_year);
            if (!isNaN(year)) {
                if(year >= 0)
                {
                    updates.printing_year = year;
                }
                else{
                    return res.status(400).json({ message: 'Год печати должен быть больше или равен 0' });
                }
            } else if (printing_year === null || printing_year === '') {
                updates.printing_year = null;
            } else {
                return res.status(400).json({ message: 'Некорректный формат года печати. Ожидается число.' });
            }
        }

        if (language?.trim()) updates.language = language.trim();

        console.log(end_date);
        if (end_date !== undefined) {
            if (end_date === null || end_date === '') {
                updates.end_date = null;
            } else {
                const date = new Date(end_date);
                if (!isNaN(date.getTime())) {
                    updates.end_date = date;
                } else {
                    return res.status(400).json({ message: 'Некорректный формат даты конца выдачи книги. Ожидается дата.' });
                }
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Нет данных для обновления' });
        }

        const updatedBook = await Book.findByIdAndUpdate(id, updates, { new: true }).lean();

        let full_name = null;

        if (updatedBook.reader_id) {
            const reader = await User.findById(updatedBook.reader_id, 'full_name');
            if (reader) {
                full_name = reader.full_name;
            }
        }
        const bookWithFullName = {
            ...updatedBook,
            reader_full_name: full_name,
        };

        console.log(bookWithFullName);
        return res.json({ message: 'Успешно', book: bookWithFullName });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Открепление книги от читателя
router.patch('/api/v1/books/detach_reader_book/:id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Открепление от читателя книги "${id}"`);

        if (!id) {
            return res.status(400).json({ message: 'Не указан ID книги для открепления' });
        }


        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID книги' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Книга не найдена' });
        }

        const reader = await User.findById(book.reader_id);
        if (!reader) {
            return res.status(404).json({ message: 'Читатель не найден' });
        }


        if (reader.role !== 'READER') {
            return res.status(403).json({ message: 'Сотрудник может откреплять книги только читателей' });
        }

        const updatedBook = await Book.findByIdAndUpdate(id, { reader_id: null }, { new: true });

        console.log(`Книга ${id} успешно откреплена`);
        return res.json({ message: 'Успешно', book: updatedBook });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;