import React, { useState, useEffect } from "react";
import "../css/Account.css"
const API_URL = process.env.API_URL;

const ReaderAccount = () => {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [error, setError] = useState("");
    const token = localStorage.getItem("access_token");
    useEffect(() => {
        if (error) {
            alert(`Ошибка: ${error}`);
        }
    }, [error]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_URL}/current_user`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setUser(data.user);
                } else {
                    setError(data.message || "Ошибка загрузки данных");
                }
            } catch (err) {
                setError("Ошибка соединения с сервером");
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${API_URL}/current_user_books`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setBooks(data.books);
                    setError("");
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Ошибка загрузки книг");
            }
        };
        fetchBooks();
    }, []);

    return (
        <div className="account">
            <h1>Личный кабинет читателя</h1>
            {error && (
                <p id="server_error">{error}</p>
            )}
            <div>
                <h2>Мой профиль</h2>
                {user && (
                    <div className="profile">
                        <p><strong>Логин:</strong> {user.username}</p>
                        <p><strong>Полное имя:</strong> {user.full_name}</p>
                        <p><strong>Телефон:</strong> {user.phone}</p>
                        <p><strong>Адрес:</strong> {user.address}</p>
                        {/*<p><strong>Роль:</strong> {user.role}</p>*/}
                    </div>
                )}

            </div>

            <div>
                <h2>Мои книги</h2>
                <table className="table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Автор</th>
                        <th>Год печати</th>
                        <th>Язык</th>
                        <th>Дата конца выдачи</th>
                    </tr>
                    </thead>
                    <tbody>
                    {books.map(book => (
                        <tr key={book._id}>
                            <td>{book._id}</td>
                            <td>{book.name}</td>
                            <td>{book.author}</td>
                            <td>{book.printing_year}</td>
                            <td>{book.language}</td>
                            <td>{book.end_date ? new Date(book.end_date).toLocaleDateString('ru-RU') : ''}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
};

export default ReaderAccount;
