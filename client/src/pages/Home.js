import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';
import '../css/header_style.css';
import '../css/footer_style.css';

const Home = () => {

    return (
        <div>
            <div className="home-poster">
                <div className="central_container">
                    <img className="logo" src="/images/logo512.png" alt="Логотип" width="200"/>
                    <h1>Librarion</h1>
                    <p className="signature_under_name">
                        Система управления данными для работников<br/> производства электронных устройств
                    </p>
                </div>
                <div className="overlay"></div>
            </div>

            <main>
                <p className="home_title">Интересная информация о производстве</p>
                <div className="main_wrapper">
                    <div className="cell cell_text">
                        <p className="text">
                            <strong>Иван Фёдоров</strong> <i>(около 1520–1583 гг.)</i> – первый книгопечатник, благодаря
                            которому в Русском государстве стало развиваться книгопечатание.
                        </p>
                    </div>

                    <div className="cell cell_text">
                        <p className="text">
                            В нашей библиотеке присутсвуют книги разных жанров: исторические, художественные, детективы,
                            детские. Присутствуют книги как отечественных, так и зарубежных авторов.
                        </p>

                    </div>

                    <div className="cell cell_text">
                        <p className="text">
                            Чтение книг приносит множество пользы как для ума, так и для души.
                            Оно развивает воображение, расширяет словарный запас и улучшает память.
                            Кроме того, чтение помогает лучше понимать окружающий мир и других людей, ведь через книги мы
                            погружаемся в различные культуры, эпохи и точки зрения. Это отличный способ расслабиться,
                            снизить стресс и отвлечься от повседневных забот. Регулярное чтение также тренирует концентрацию
                            и аналитическое мышление, делая нас более внимательными и восприимчивыми к информации.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
