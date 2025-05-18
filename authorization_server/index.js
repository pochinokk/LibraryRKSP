const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const registrationRoutes = require('./routes/registration');
const authenticationRoutes = require('./routes/authentication');
const favicon = require('serve-favicon');
const path = require('path');


const PORT = process.env.PORT || 3001;

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(session({
    secret: 'really secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
}));

const cors = require("cors");


app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.urlencoded({extended: true}));


app.use(registrationRoutes);
app.use(authenticationRoutes);


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Авторизационный сервер работает' });
});

async function start() {
    try{

        await mongoose.connect(process.env.MONGODB_URI);

        if (require.main === module) {
            app.listen(PORT, () => {
                console.log('Server has been started on http://localhost:' + PORT);
            });
        }

    } catch (e) {
        console.log(e);
    }
}


start();


module.exports = app;
