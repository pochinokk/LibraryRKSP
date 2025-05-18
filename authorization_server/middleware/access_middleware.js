const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RevokedAccessToken = require("../models/RevokedAccessToken");
const RevokedRefreshToken = require("../models/RevokedRefreshToken");
const path = require('path');
const fs = require('fs');
const public_key = fs.readFileSync(path.resolve(__dirname, '../config/public.pem'), 'utf8');

async function addToBlackList(token, type) {
    try {

        const { exp } = jwt.verify(token, public_key);

        const delete_time = new Date((exp + 5 * 60) * 1000);

        if (type === 'a') {
            await RevokedAccessToken.create({ access_token: token, delete_time});
            console.log(`Access-токен ${token} добавлен в чёрный список`);
        } else {
            await RevokedRefreshToken.create({ refresh_token: token, delete_time });
            console.log(`Refresh-токен ${token} добавлен в чёрный список`);
        }
    } catch (e) {
        if (e.name !== "TokenExpiredError") {
            console.error("Ошибка при добавлении в чёрный список:", e);
        }
    }
}

async function cleanBlackLists() {
    try {
        const now = new Date();
        await RevokedAccessToken.deleteMany({delete_time: {$lt: now}});
        await RevokedRefreshToken.deleteMany({delete_time: {$lt: now}});
    } catch (e) {
        console.error("Ошибка при добавлении в чёрный список:", e);
    }
}

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
                return res.status(403).json({message: "Отсутствует токен доступа"})
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
                return res.status(401).json({message: "Пользователь не авторизован"});
            } else if (e.name === "JsonWebTokenError") {
                return res.status(403).json({message: "Некорректный токен"});
            }
            console.log(e);
            return res.status(500).json({message: "Внутренняя ошибка сервера"});
        }
    }
}

if (require.main === module) {
    cleanBlackLists();
    setInterval(cleanBlackLists, 10 * 60 * 1000);
}

module.exports = {checkAccess, addToBlackList};