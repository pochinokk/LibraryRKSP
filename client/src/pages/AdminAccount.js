import React, { useState, useEffect } from "react";
import "../css/Account.css"
const API_URL = process.env.API_URL;

const AdminAccount = () => {
    const [users, setUsers] = useState([]);
    const [showUsersTable, setShowUsersTable] = useState(true);
    const [error, setError] = useState("");
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        full_name: "",
        phone: "",
        address: "",
    });
    const [editUser, setEditUser] = useState(null);

    const [books, setBooks] = useState([]);
    const [showBooksTable, setShowBooksTable] = useState(true);
    const [newBook, setNewBook] = useState({
        reader_id: "",
        name: "",
        author: "",
        printing_year: "",
        language: "",
        end_date: ""
    });
    const [editBook, setEditBook] = useState(null);

    const token = localStorage.getItem("access_token");
    useEffect(() => {
        if (error) {
            alert(`Ошибка: ${error}`);
        }
    }, [error]);
    // Загрузка всех пользователей
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/users`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    const cleanUsers = data.users.map(user => ({
                        ...user,
                        password: null
                    }));
                    setUsers(cleanUsers);
                    setError("");
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Ошибка загрузки пользователей");
            }
        };
        fetchUsers();
    }, []);

    // Добавление нового пользователя
    const addUser = async (event) => {
        event.preventDefault();
        const allowedRoles = ["ADMIN", "LIBRARIAN", "READER"];

        // Проверка допустимости роли
        if (!allowedRoles.includes(newUser.role)) {
            setError("Недопустимая роль. Выберите ADMIN, LIBRARIAN или READER.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (response.ok) {
                const { password, ...addedUser } = data.user;
                setUsers([...users, addedUser]);
                setNewUser({
                    username: "",
                    password: "",
                    full_name: "",
                    phone: "",
                    address: "",
                    role: "",
                });
                setError("");
            } else {
                setError(data.message || "Ошибка при добавлении пользователя");
            }
        } catch (err) {
            setError("Ошибка при добавлении пользователя");
        }
    };

    // Удаление пользователя
    const deleteUser = async (_id) => {
        if (!window.confirm(`Вы уверены, что хотите удалить ${_id}?`)) return;

        try {
            const response = await fetch(`${API_URL}/users/${_id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ _id }),
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(users.filter(user => user._id !== _id));
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при удалении пользователя");
        }
    };

    // Обновление пользователя
    const updateUser = async (_id) => {
        try {
            const response = await fetch(`${API_URL}/users/${_id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editUser),
            });
            const data = await response.json();
            if (response.ok) {
                const { password, ...updatedUser } = data.user;
                setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
                setEditUser(null);
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при обновлении данных");
        }
    };





    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${API_URL}/books`, {
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

    const addBook = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_URL}/books`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newBook),
            });
            const data = await response.json();
            if (response.ok) {
                setBooks([...books, data.book]);
                setNewBook({ reader_id: "", name: "", author: "", printing_year: "", language: "", end_date: ""});
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при добавлении книги");
        }
    };

    const deleteBook = async (id) => {
        if (!window.confirm(`Удалить книгу ${id}?`)) return;

        try {
            const response = await fetch(`${API_URL}/books/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                setBooks(books.filter(book => book._id !== id));
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при удалении книги");
        }
    };


    const updateBook = async (id) => {
        try {
            const response = await fetch(`${API_URL}/books/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editBook),
            });
            const data = await response.json();
            if (response.ok) {
                setBooks(books.map(book => book._id === data.book._id ? data.book : book));
                setEditBook(null);
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при обновлении книги");
        }
    };

    return (
        <div className="account">


            <h1>Админ панель</h1>
            {error && <p id="server_error">{error}</p>}

            {/* Форма добавления пользователя */}


            <form className="form" onSubmit={addUser}>
                <h2>Добавить нового пользователя</h2>
                <div>
                    <input type="text" placeholder="Логин" required value={newUser.username}
                           onChange={(e) => setNewUser({...newUser, username: e.target.value})}/>
                </div>

                <div>
                    <input type="password" placeholder="Пароль" required value={newUser.password}
                           onChange={(e) => setNewUser({...newUser, password: e.target.value})}/>
                </div>

                <div>
                    <input type="text" placeholder="ФИО" required value={newUser.full_name}
                           onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}/>
                </div>

                <div>
                    <input type="text" placeholder="Телефон" value={newUser.phone}
                           onChange={(e) => setNewUser({...newUser, phone: e.target.value})}/>
                </div>

                <div>
                    <input type="text" placeholder="Адрес" value={newUser.address}
                           onChange={(e) => setNewUser({...newUser, address: e.target.value})}/>
                </div>

                <select required
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                    <option value="">Выберите роль</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="LIBRARIAN">LIBRARIAN</option>
                    <option value="READER">READER</option>
                </select>

                <div>
                    <button type="submit" className="green_btn">Добавить</button>
                </div>


            </form>


            {/* Таблица пользователей */}

            <div>
                <div className={"table_title_and_button"}>
                    <h2>Список пользователей</h2>
                    <button
                        className="brown_btn"
                        onClick={() => setShowUsersTable(!showUsersTable)}
                    >
                        {showUsersTable ? "Скрыть" : "Показать"}
                    </button>
                </div>

                {showUsersTable && (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Логин</th>
                            <th>ФИО</th>
                            <th>Телефон</th>
                            <th>Адрес</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user._id}</td>
                                <td>{user.username}</td>
                                <td>{user.full_name}</td>
                                <td>{user.phone}</td>
                                <td>{user.address}</td>
                                <td>{user.role}</td>
                                <td>


                                    <button className="green_btn" onClick={() => setEditUser(user)}>Редактировать</button>
                                    <button className="red_btn" onClick={() => deleteUser(user._id)}>Удалить</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>




            {/* Форма редактирования пользователя */}
            {editUser && (
                <div className="form">
                    <h2>Редактировать пользователя {editUser._id}</h2>
                    <div>
                        <input type="text" placeholder="Логин" value={editUser.username}
                               onChange={(e) => setEditUser({...editUser, username: e.target.value})}/>
                    </div>
                    <div>
                        <input type="password" placeholder="Новый пароль"
                               onChange={(e) => setEditUser({...editUser, password: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="ФИО" value={editUser.full_name}
                               onChange={(e) => setEditUser({...editUser, full_name: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="Телефон" value={editUser.phone}
                               onChange={(e) => setEditUser({...editUser, phone: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="Адрес" value={editUser.address}
                               onChange={(e) => setEditUser({...editUser, address: e.target.value})}/>
                    </div>


                    <select
                        value={editUser.role}
                        onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    >
                        <option value="">Выберите роль</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="LIBRARIAN">LIBRARIAN</option>
                        <option value="READER">READER</option>
                    </select>
                    <div>
                        <button className="green_btn" onClick={() => updateUser(editUser._id)}>Сохранить</button>
                    </div>

                    <div>
                        <button className="red_btn" onClick={() => setEditUser(null)}>Отмена</button>
                    </div>

                </div>
            )}


            <form className="form" onSubmit={addBook}>
                <h2>Добавить книгу</h2>
                <input type="text" placeholder="ID читателя" value={newBook.reader_id}
                       onChange={(e) => setNewBook({...newBook, reader_id: e.target.value})}/>

                <input type="text" placeholder="Название" required value={newBook.name}
                       onChange={(e) => setNewBook({...newBook, name: e.target.value})}/>

                <input type="text" placeholder="Автор" required value={newBook.author}
                       onChange={(e) => setNewBook({...newBook, author: e.target.value})}/>


                <input type="number" placeholder="Год печати" value={newBook.printing_year}
                       onChange={(e) => setNewBook({...newBook, printing_year: e.target.value})}/>

                <input type="text" placeholder="Язык" required value={newBook.language}
                       onChange={(e) => setNewBook({...newBook, language: e.target.value})}/>

                <label>
                    Дата конца выдачи:
                </label>
                <input
                    type="date"
                    placeholder="Дата конца выдачи"
                    value={newBook.end_date ? newBook.end_date.slice(0, 10) : ""}
                    onChange={(e) => setNewBook({...newBook, end_date: e.target.value})}
                />

                <div>
                    <button type="submit" className="green_btn">Добавить</button>
                </div>

            </form>

            <div>
                <div className={"table_title_and_button"}>
                    <h2>Список книг</h2>
                    <button
                        className="brown_btn"
                        onClick={() => setShowBooksTable(!showBooksTable)}
                    >
                        {showBooksTable ? "Скрыть" : "Показать"}
                    </button>
                </div>
                {showBooksTable && (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>ID читателя</th>
                            <th>Название</th>
                            <th>Автор</th>
                            <th>Год печати</th>
                            <th>Язык</th>
                            <th>Дата конца выдачи</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {books.map(book => (
                            <tr key={book._id}>
                                <td>{book._id}</td>
                                <td>{book.reader_id}</td>
                                <td><strong>{book.name}</strong></td>
                                <td>{book.author}</td>
                                <td>{book.printing_year}</td>
                                <td>{book.language}</td>
                                <td>{book.end_date ? new Date(book.end_date).toLocaleDateString('ru-RU') : ''}</td>
                                <td>
                                    <button className="green_btn" onClick={() => setEditBook(book)}>Редактировать
                                    </button>
                                    <button className="red_btn" onClick={() => deleteBook(book._id)}>Удалить</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>


            {editBook && (
                <div className="form">
                    <h2>Редактировать книгу {editBook._id}</h2>
                    <div>
                        <input type="text" placeholder="ID читателя" value={editBook.reader_id}
                               onChange={(e) => setEditBook({...editBook, reader_id: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="Название" value={editBook.name}
                               onChange={(e) => setEditBook({...editBook, name: e.target.value})}/>
                    </div>

                    <div>
                        <input type="text" placeholder="Автор" value={editBook.author}
                               onChange={(e) => setEditBook({...editBook, author: e.target.value})}/>
                    </div>


                    <div>
                        <input type="number" placeholder="Год печати" value={editBook.printing_year}
                               onChange={(e) => setEditBook({...editBook, printing_year: e.target.value})}/>
                    </div>

                    <div>
                        <input type="text" placeholder="Язык" value={editBook.language}
                               onChange={(e) => setEditBook({...editBook, language: e.target.value})}/>
                    </div>

                    <label>
                        Дата конца выдачи:
                    </label>
                    <div>
                        <input
                            type="date"
                            placeholder="Дата конца выдачи"
                            value={editBook.end_date ? editBook.end_date.slice(0, 10) : ""}
                            onChange={(e) => setEditBook({...editBook, end_date: e.target.value})}
                        />
                    </div>

                    <div>
                        <button className="green_btn" onClick={() => updateBook(editBook._id)}>Сохранить</button>
                    </div>

                    <div>
                        <button className="red_btn" onClick={() => setEditBook(null)}>Отмена</button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AdminAccount;
