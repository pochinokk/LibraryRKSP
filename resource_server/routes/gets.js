const {Router} = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Book = require('../models/Book');
const RevokedAccessToken = require('../models/RevokedAccessToken');
const RevokedRefreshToken = require('../models/RevokedRefreshToken');
const checkAccess = require('../middleware/access_middleware');
const express = require("express");
const {Types} = require("mongoose");
const fs = require('fs');
const path = require("path");
const public_key = fs.readFileSync(path.resolve(__dirname, '../config/public.pem'), 'utf8');
router.use(express.json());

//-------Пользователи-------//
//Получение текущего пользователя
router.get('/api/v1/current_user', async (req, res) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ message: 'Токен не предоставлен или неверный формат' });
        }
        const token = authHeader.split(' ')[1];
        console.log(`ПЕРЕД декодированием токен:${token}`);
        let decoded;
        try {
            decoded = jwt.verify(token, public_key);

        } catch (e) {
            console.log(e);
            return res.status(401).json({ message: 'Токен недействителен или истек' });
        }
        const { id } = decoded;
        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        console.log("ВСЁ ХОРОШО ")
        return res.status(200).json({ message: 'Успешно', user });
    } catch (error) {
        console.error('Ошибка получения текущего пользователя:', error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение пользователя по id
router.get('/api/v1/users/:id', checkAccess(['ADMIN']), async (req, res) => {
    try{
        console.log("Админ получает пользователя по id");
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Не указан ID пользователя' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }
        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ message: 'Такого пользователя нет' });
        }
        console.log(user);
        return res.status(200).json({ message: 'Успешно', user });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение пользователя по username
router.get('/api/v1/users/user_by_username/:username', checkAccess(['ADMIN']), async (req, res) => {
    try{
        console.log("Админ получает пользователя по username");
        const { username } = req.params;
        const user = await User.findOne({ username }).lean();
        if (!user) {
            return res.status(404).json({ message: 'Такого пользователя нет' });
        }
        console.log(user);
        return res.status(200).json({ message: 'Успешно', user });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение всех пользователей
router.get('/api/v1/users', checkAccess(['ADMIN']), async (req, res) => {
    try{
    console.log("Админ получает всех пользователей");
    const users = await User.find().lean();
    console.log(users);
    return res.status(200).json({ message: 'Успешно', users });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение всех читателей
router.get('/api/v1/readers', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try{
    console.log("Админ или сотрудник получает всех читателей");
    const readers = await User.find({role: 'READER'}).sort({ full_name: 1 }).lean();
    console.log(readers);
    return res.status(200).json({ message: 'Успешно', readers });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение всех работников библиотеки
router.get('/api/v1/librarians', checkAccess(['ADMIN']), async (req, res) => {
    try{
        console.log("Админ получает всех работников библиотеки");
        const librarians = await User.find({role: 'LIBRARIAN'}).lean();
        console.log(librarians);
        return res.status(200).json({ message: 'Успешно', librarians });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});





//-------КНИГИ-------//
//Получение книги по id
router.get('/api/v1/books/:id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try{
        console.log("Админ получает книгу");
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Не указан ID книги' });
        }

        const book = await Book.findById(id).lean();
        if (!book) {
            return res.status(404).json({ message: 'Такой книги нет' });
        }
        console.log(book);
        return res.status(200).json({ message: 'Успешно', book });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});
module.exports = router;

//Получение всех книг
router.get('/api/v1/books', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try{
        console.log("Админ получает все книги");
        const books = await Book.find().lean();
        console.log(books);
        return res.status(200).json({ message: 'Успешно', books });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение всех книг читателей и свободных книг
router.get('/api/v1/reader_and_free_books', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        // console.log("Админ или сотрудник получает все книги читателей и свободные книги");
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        const booksWithUsers = await Book.find().populate({
            path: 'reader_id',
            select: 'full_name role'
        }).sort({ name: 1 }).lean();


        // Оставляем только нужные книги
        const books = booksWithUsers
            .filter(book => {
                const role = book.reader_id?.role;
                console.log(role === "READER" || !role)
                return role === "READER" || !role;
            })
            .map(book => ({
                ...book,
                reader_full_name: book.reader_id?.full_name || null,
                reader_id: book.reader_id?._id || null,
            }));

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        console.log(booksWithUsers);
        return res.status(200).json({ message: 'Успешно', books });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});




//Получение всех книг пользователя
router.get('/api/v1/user_books/:user_id', checkAccess(['ADMIN']), async (req, res) => {
    try{
        console.log("Админ получает все книги определённого пользователя");
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: 'Не указан ID пользователя' });
        }

        if (!Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }

        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const books = await Book.find({reader_id: user_id}).lean();
        console.log(books);
        return res.status(200).json({ message: 'Успешно', books });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Получение всех книг читателя
router.get('/api/v1/reader_books/:reader_id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        console.log("Получение всех книг читателя");
        const { reader_id } = req.params;

        if (!reader_id) {
            return res.status(400).json({ message: 'Не указан ID читателя' });
        }

        if (!Types.ObjectId.isValid(reader_id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }

        const reader = await User.findById(reader_id);
        console.log("1");
        if (!reader) {
            return res.status(404).json({ message: 'Читатель не найден' });
        }
        console.log("2");
        if (reader.role !== 'READER') {
            return res.status(403).json({ message: 'Сотрудник может получать книги читателей или свободные книги' });
        }

        const books = await Book.find({ reader_id }).lean();
        const booksWithFullName = books.map(book => ({
            ...book,
            reader_full_name: reader.full_name,
        }));

        return res.status(200).json({ message: 'Успешно', books: booksWithFullName });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});



router.get('/api/v1/current_user_books', checkAccess(['ADMIN', 'LIBRARIAN', 'READER']), async (req, res) => {
    try {

        const token = req.headers.authorization.split(' ')[1];
        console.log(`ПЕРЕД декодированием токен:${token}`);
        let decoded;
        try {
            decoded = jwt.verify(token, public_key);

        } catch (e) {
            console.log(e);
            return res.status(401).json({ message: 'Токен недействителен или истек' });
        }
        const { id } = decoded;
        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        const books = await Book.find({reader_id: user._id}).lean();
        console.log(books);
        return res.status(200).json({ message: 'Успешно', books });
    } catch (error) {
        console.error('Ошибка получения текущего пользователя:', error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});






//-------ТОКЕНЫ-------//
//Получение всех отозванных токенов доступа
router.get('/api/v1/revoked_access_tokens', checkAccess(['ADMIN']), async (req, res) => {
    try{
        console.log("Админ получает все отозванные токены доступа");
        const revoked_access_tokens = await RevokedAccessToken.find().lean();
        console.log(revoked_access_tokens);
        return res.status(200).json({ message: 'Успешно', revoked_access_tokens });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

//Получение всех отозванных токенов обновления
router.get('/api/v1/revoked_refresh_tokens', checkAccess(['ADMIN']), async (req, res) => {
    try{
        console.log("Админ получает все отозванные токены обновления");
        const revoked_refresh_tokens = await RevokedRefreshToken.find().lean();
        console.log(revoked_refresh_tokens);
        return res.status(200).json({ message: 'Успешно', revoked_refresh_tokens });
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});



