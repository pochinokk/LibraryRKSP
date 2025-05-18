const express = require('express');
const mongoose = require('mongoose');

const savesRoutes = require('./routes/posts');
const deletesRoutes = require('./routes/deletes');
const getsRoutes = require('./routes/gets');
const updateRoutes = require('./routes/patches');

//Маршруты
const PORT = process.env.PORT || 3002;


const app = express();


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


app.use(savesRoutes);
app.use(deletesRoutes);
app.use(getsRoutes);
app.use(updateRoutes);


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Ресурсный сервер работает' });
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