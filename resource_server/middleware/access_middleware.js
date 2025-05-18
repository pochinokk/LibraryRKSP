const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RevokedAccessToken = require("../models/RevokedAccessToken");
const path = require('path');
const fs = require('fs');
const public_key = fs.readFileSync(path.resolve(__dirname, '../config/public.pem'), 'utf8');

function checkAccess(roles){
    return async function (req, res, next) {
        try {
            console.log('CHECK ACCESS')
            const authHeader = req.headers.authorization;
            console.log("authHeader", authHeader);
            if (!authHeader || !authHeader.startsWith('Bearer')) {
                return res.status(401).json({ message: 'Некорректный заголовок запроса'});
            }
            const access_token = authHeader.split(' ')[1];
            if (!access_token) {
                return res.status(403).json({message: "Отсутствует токен доступа. Возможно нужно обновить страницу"})
            }
            const isRevoked = await RevokedAccessToken.findOne({ access_token });
            if (isRevoked) {
                console.log(`Кто-то с токеном ${access_token} из black list пытался что-то сделать`);
                return res.status(403).json({ message: 'Токен был отозван' });
            }
            const {id, role: user_role} = jwt.verify(access_token, public_key);
            if (!roles.includes(user_role)) {
                return res.status(403).json({message: "У вас нет доступа"})
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({message: "Пользователя не существует"})
            }
            next();
        } catch (e) {
            if (e.name === "TokenExpiredError") {
                return res.status(403).json({message: "Пользователь не авторизован, возможно нужно обновить страницу"});
            } else if (e.name === "JsonWebTokenError") {
                return res.status(403).json({message: "Некорректный токен"});
            }
            console.log(e);
            return res.status(500).json({message: "Внутренняя ошибка сервера"});
        }
    }
}

module.exports = checkAccess;