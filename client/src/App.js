import './App.css';
import React, {useEffect, useState} from "react";
import {BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, NavLink} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import PrivateRoute from "./components/PrivateRoute";
import { fetchWithAuth, isAuthenticated, logout } from "./components/Auth";
import AdminAccount from "./pages/AdminAccount";
import LibrarianAccount from "./pages/LibrarianAccount";
import ReaderAccount from "./pages/ReaderAccount";
const AUTH_URL = "http://localhost:3001/auth/v1";
const API_URL = "http://localhost:3002/api/v1";

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const [username, setUsername] = useState(null);
    const [role, setRole] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleAuth = async () => {

            const urlParams = new URLSearchParams(location.search);
            const url_access_token = urlParams.get("access_token");
            const url_refresh_token = urlParams.get("refresh_token");

            if (url_access_token && url_refresh_token) {
                // localStorage.setItem("location", location.search);
                // console.log("Получены токены из URL");
                localStorage.setItem("access_token", url_access_token);
                localStorage.setItem("refresh_token", url_refresh_token);
                navigate("/", { replace: true });
                return;
            }

            const access_token = localStorage.getItem("access_token");
            const refresh_token = localStorage.getItem("refresh_token");

            // console.log("access_token", access_token);
            // console.log("refresh_token", refresh_token);

            if (!access_token && !refresh_token) {
                console.log("Нет ни access_token, ни refresh_token");
                return;
            } else if (access_token && !refresh_token) {
                console.log("Нет refresh_token, access_token удаляется");
                localStorage.removeItem("access_token");
                return;
            }

            const res = await fetchWithAuth(`${API_URL}/current_user`, {
                method: "GET",
            });

            // localStorage.setItem("res", JSON.stringify(res));
            if (res && res.ok) {
                const data = await res.json();
                setUsername(data.user?.username);
                setRole(data.user?.role);
            } else {
                // localStorage.setItem("debug_message", "ЛОГАУТ В CURRENT_USER");
                // console.log("ЛОГАУТ В CURRENT_USER");
                await logout();
            }
        };

        handleAuth();
    }, [location, navigate]);


    // useEffect(() => {
    //     const fetchCurrentUser = async () => {
    //         const token = localStorage.getItem("access_token");
    //         if (!token) return;
    //
    //         try {
    //             const response = await fetch(`${API_URL}/current_user`, {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //
    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setUsername(data.user?.username);
    //                 setRole(data.user?.role);
    //             } else {
    //                 await logout(); // токен недействителен — выходим
    //             }
    //         } catch (e) {
    //             console.error("Ошибка при получении текущего пользователя:", e);
    //             await logout();
    //         }
    //     };
    //
    //     fetchCurrentUser();
    // }, []);



    const toggleMenu = () => {
        setIsOpen(prev => !prev);
    };

    const handleLogin = () => {
        window.location.href = `${AUTH_URL}/authentication`;
    };



    return (
        // <Router>
        <>
            {/*<nav>*/}
            {/*    <Link to="/">Главная</Link>*/}
            {/*    <Link to="/about">О нас</Link>*/}
            {/*    {role === "ADMIN" && <Link to="/admin">Админ панель</Link>}*/}
            {/*    {role === "LIBRARIAN" && <Link to="/librarian">Личный кабинет</Link>}*/}
            {/*    {role === "READER" && <Link to="/reader">Личный кабинет</Link>}*/}
            {/*    {isAuthenticated() ? (*/}
            {/*        <button onClick={logout}>Выйти</button>*/}
            {/*    ) : (*/}
            {/*        <Link to="/login">Войти</Link>*/}
            {/*    )}*/}
            {/*</nav>*/}


            <header>
                <Link to="/">
                    <img
                        className="header_logo"
                        src="/images/logo512.png"
                        alt="Логотип"
                        title="Логотип"
                        width="64"
                        height="64"
                    />
                </Link>
                <label className="header_name">Librarion</label>

                <ul className="header_links">
                    {/*<li><Link className="link" to="/">Главная</Link></li>*/}
                    {/*{role === "ADMIN" && <li><Link className="link" to="/admin">Личный кабинет</Link></li>}*/}
                    {/*{role === "LIBRARIAN" && <li><Link className="link" to="/librarian">Личный кабинет</Link></li>}*/}
                    {/*{role === "READER" && <li><Link className="link" to="/reader">Личный кабинет</Link></li>}*/}
                    {/*<li><Link className="link" to="/about">О нас</Link></li>*/}


                    <li>
                        <NavLink
                            to="/"
                            className={({isActive}) => isActive ? "current link" : "link"}
                        >
                            Главная
                        </NavLink>
                    </li>

                    {role === "ADMIN" && (
                        <li>
                            <NavLink
                                to="/admin"
                                className={({isActive}) => isActive ? "current link" : "link"}
                            >
                                Личный кабинет
                            </NavLink>
                        </li>
                    )}

                    {role === "LIBRARIAN" && (
                        <li>
                            <NavLink
                                to="/librarian"
                                className={({isActive}) => isActive ? "current link" : "link"}
                            >
                                Личный кабинет
                            </NavLink>
                        </li>
                    )}

                    {role === "READER" && (
                        <li>
                            <NavLink
                                to="/reader"
                                className={({isActive}) => isActive ? "current link" : "link"}
                            >
                                Личный кабинет
                            </NavLink>
                        </li>
                    )}

                    <li>
                        <NavLink
                            to="/about"
                            className={({isActive}) => isActive ? "current link" : "link"}
                        >
                            О нас
                        </NavLink>
                    </li>
                    {isAuthenticated() ? (
                        <li><a className="link" onClick={logout}>
                            Выйти
                        </a>
                        </li>

                    ) : (
                        <Link className="link" onClick={handleLogin}>Войти</Link>
                    )}

                    {isAuthenticated() && (
                        <li><a id="user_name">
                            {username}
                        </a>
                        </li>

                    )}
                </ul>

                <div className="burger-background"></div>
                <div className={`navbar ${isOpen ? "change" : ""}`}>
                    <div
                        className={`burger-menu ${isOpen ? "change" : ""}`}
                        onClick={toggleMenu}
                    >
                        <div className="line line-1"></div>
                        <div className="line line-2"></div>
                        <div className="line line-3"></div>
                    </div>

                    <ul className="nav-list">
                        <div className="space_for_x"></div>
                        {isAuthenticated() && (
                            <li id="burger_user_name">
                                <p>{username}</p>
                            </li>
                        )}
                        <li className="nav-item"><Link className="nav-link" to="/">Главная</Link></li>

                        {!isAuthenticated() && (
                            <li className="nav-item"><Link className="nav-link" onClick={handleLogin}>Войти</Link></li>
                        )}

                        {role === "ADMIN" && (
                            <li className="nav-item"><Link className="nav-link" to="/admin">Личный кабинет</Link></li>
                        )}
                        {role === "LIBRARIAN" && (
                            <li className="nav-item"><Link className="nav-link" to="/librarian">Личный кабинет</Link>
                            </li>
                        )}
                        {role === "READER" && (
                            <li className="nav-item"><Link className="nav-link" to="/reader">Личный кабинет</Link></li>
                        )}

                        <li className="nav-item"><Link className="nav-link" to="/about">О нас</Link></li>
                    </ul>
                </div>
            </header>


            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>

                {role === "ADMIN" && <Route path="/admin" element={<PrivateRoute element={<AdminAccount/>}/>}/>}
                {role === "LIBRARIAN" &&
                    <Route path="/librarian" element={<PrivateRoute element={<LibrarianAccount/>}/>}/>}
                {role === "READER" && <Route path="/reader" element={<PrivateRoute element={<ReaderAccount/>}/>}/>}
            </Routes>

            <footer className="footer_wrapper">
                <div className="box box1">
                    <u>О нас</u>
                    <p className="author_name">Автор: Иванов Д.О.</p>
                    <p>студент группы ИКБО-30-22</p>
                </div>
            </footer>
            {/*</Router>*/}
        </>
    );
}

export default App;
