const {Router} = require('express');
const router = Router();
const {checkAccess, addToBlackList} = require('../middleware/access_middleware');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require("path");
const {CLIENT_URL} = require("../config/config");
const private_key = fs.readFileSync(path.resolve(__dirname, '../config/private.pem'), 'utf8');
const public_key = fs.readFileSync(path.resolve(__dirname, '../config/public.pem'), 'utf8');

router.use(express.json());

const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, private_key, {
        algorithm: 'RS256',
        expiresIn: '15m'
    });
}

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, private_key, {
        algorithm: 'RS256',
        expiresIn: '1d'
    });
};


router.get('/auth/v1/authentication', async (req, res) => {
    const mes = req.session.mes || null;
    const er = req.session.er || null;
    req.session.mes = null;
    req.session.er = null;

    return res.render('authentication_page', {isAuthentication: true, mes, er });
});



router.post('/auth/v1/authenticate', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            req.session.er = 'Некорректные данные';
            return res.redirect('/auth/v1/authentication');
        }
        const user = await User.findOne({ username });
        if (!user) {
            req.session.er = `Пользователь ${username} не найден`;
            return res.redirect('/auth/v1/authentication');
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            req.session.er = 'Введен неверный пароль';
            return res.redirect('/auth/v1/authentication');
        }
        const access_token = generateAccessToken(user._id, user.role);
        const refresh_token = generateRefreshToken(user._id);
        const redirect_uri = `${CLIENT_URL}`;
        return res.redirect(
            `${redirect_uri}?access_token=${access_token}&refresh_token=${refresh_token}`
        );
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.post('/auth/v1/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            return res.status(401).json({ message: 'Токен обновления не предоставлен' });
        }
        let decoded;
        try {
            decoded = jwt.verify(refresh_token, public_key);
        } catch (e) {
            if (e.name === "TokenExpiredError") {
                return res.status(401).json({message: "Пользователь не авторизован"});
            } else if (e.name === "JsonWebTokenError") {
                return res.status(403).json({message: "Некорректный токен"});
            }
            console.log(e);
            return res.status(500).json({message: "Внутренняя ошибка сервера"});
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        const new_access_token = generateAccessToken(user._id, user.role);
        return res.status(200).json({ access_token: new_access_token });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});


router.post('/auth/v1/logout', checkAccess(['ADMIN', 'LIBRARIAN', 'READER']), async (req, res) => {
    try {

        const access_token = req.headers.authorization.split(' ')[1];
        const refresh_token = req.body.refresh_token;

        console.log("ЛОГАУТ:", access_token, refresh_token);

        if (access_token) {
            await addToBlackList(access_token, 'a');
        }
        if (refresh_token) {
            await addToBlackList(refresh_token, 'r');
        }

        return res.status(200).json({ message: 'Вы успешно вышли из системы' });
    } catch (error) {
        console.error('Ошибка при logout:', error);
        return res.status(500).json({ message: 'Ошибка при выходе из системы' });
    }
});


module.exports = router;