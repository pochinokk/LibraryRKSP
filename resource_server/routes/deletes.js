const {Router} = require('express');
const router = Router();
const checkAccess = require('../middleware/access_middleware');
const express = require("express");
const User = require("../models/User");
const Book = require("../models/Book");
const {Types} = require("mongoose");
router.use(express.json());

//Удаление пользователя
router.delete('/api/v1/users/:id', checkAccess(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Админ удаляет пользователя "${ id }"`)

        if (!id) {
            return res.status(400).json({ message: 'Не введён ID для удаления' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        if(user.role === 'ADMIN') {
            return res.status(403).json({ message: 'Удалять администраторов можно только в самой базе данных' });
        }

        await User.deleteOne({ _id: id });
        await Book.updateMany({ reader_id: id }, { $set: { reader_id: null } });

        console.log(`Пользователь ${ id } успешно удален`);
        return res.json({ message: 'Успешно' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});


//Удаление читателя
router.delete('/api/v1/readers/:id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Админ или сотрудник удаляет читателя "${ id }"`)

        if (!id) {
            return res.status(400).json({ message: 'Не введён ID для удаления' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        if(user.role !== 'READER') {
            return res.status(403).json({ message: 'Сотрудник может удалять только читателей' });
        }

        await User.deleteOne({ _id: id });
        await Book.updateMany({ reader_id: id }, { $set: { reader_id: null } });

        console.log(`Читатель ${ id } успешно удалён`);
        return res.json({ message: 'Успешно' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});






//Удаление книги
router.delete('/api/v1/books/:id', checkAccess(['ADMIN', 'LIBRARIAN']), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Админ удаляет книгу "${ id }"`)

        if (!id) {
            return res.status(400).json({ message: 'Не введён ID для удаления' });
        }

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Книга не найдена' });
        }

        await Book.deleteOne({ _id: id });
        console.log("Книга удалена:", id);
        return res.json({ message: 'Успешно' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;