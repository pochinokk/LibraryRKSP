const {Router} = require('express');
const router = Router();
const User = require('../models/User');
const bcrypt = require("bcryptjs");
const express = require("express");
const {check, validationResult} = require('express-validator');
router.use(express.json());


router.get('/auth/v1/registration', async (req, res) => {
    const mes = req.session.mes || null;
    const er = req.session.er || null;
    const valid_ers = req.session.valid_ers || null;
    req.session.mes = null;
    req.session.er = null;
    req.session.valid_ers = null;
    return res.render('registration_page', {isRegistration: true, mes, er, validationErrors: valid_ers});
});

router.post('/auth/v1/register',
    [
        check('username', "Логин не может быть пустым.")
            .notEmpty()
            .isLength({ max: 30 }).withMessage("Логин должен быть не длиннее 30 символов."),

        check('password', "Пароль должен быть от 4 до 30 символов.")
            .isLength({ min: 4, max: 30 }),

        check('full_name', "Имя пользователя не может быть пустым.")
            .notEmpty()
            .isLength({ max: 50 }).withMessage("Полное имя должно быть не длиннее 50 символов."),
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.valid_ers = errors.array().map(error => error.msg);
            return res.redirect('/auth/v1/registration');
        }
        const { username, password, full_name, phone, address} = req.body;
        console.log(phone, address)
        if(![ username, password, full_name ].every(el => el && el.trim()))
        {
            req.session.er = 'Информация некорректна';
            if (process.env.NODE_ENV === 'test') {
                return res.status(400).json({ message: 'Информация некорректна' });
            }
            return res.redirect('/auth/v1/registration');
        }
        if (phone && (typeof phone !== 'string' || !/^\+\d{11}$/.test(phone.trim()))) {
            return res.status(400).json({ message: 'Телефон должен быть в формате строки +XXXXXXXXXXX (11 цифр)' });
        }
        const candidate = await User.findOne({username});
        if (candidate){
            req.session.er = 'Пользователь с таким именем уже существует';
            if (process.env.NODE_ENV === 'test') {
                return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
            }
            return res.redirect('/auth/v1/registration');
        }
        const hashPassword = bcrypt.hashSync(password, 8);

        const user = new User({
            username,
            password: hashPassword,
            full_name,
            phone: phone?.trim() || null,
            address: address?.trim() || null,
            role: 'READER'
        });
        const newUser = await user.save();
        req.session.mes = 'Вы успешно зарегистрировались и теперь можете авторизоваться';
        if (process.env.NODE_ENV === 'test') {
            return res.status(201).json({ message: 'Вы успешно зарегистрировались и теперь можете авторизоваться', id: newUser._id });
        }
        return res.redirect('/auth/v1/authentication');
    } catch (e){
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;