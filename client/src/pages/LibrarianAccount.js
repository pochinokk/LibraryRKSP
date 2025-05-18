import React, { useState, useEffect } from "react";
import "../css/Account.css"
const API_URL = process.env.API_URL;
const MAX_BOOKS = 10;

const LibrarianAccount = () => {
    const [librarian, setLibrarian] = useState(null);
    const [readers, setReaders] = useState([]);
    const [error, setError] = useState("");
    const [editReader, setEditReader] = useState(null);
    const [books, setBooks] = useState([]);
    const [newBook, setNewBook] = useState({
        reader_id: "",
        name: "",
        author: "",
        printing_year: "",
        language: "",
        end_date: ""
    });
    const [editBook, setEditBook] = useState(null);
    const [showReadersTable, setShowReadersTable] = useState(true);
    const [showBooksTable, setShowBooksTable] = useState(true);

    const [readerId, setReaderId] = useState("");
    const [reader_books, setReaderBooks] = useState([]);
    const [showReaderBooksTable, setShowReaderBooksTable] = useState(false);


    const [number, setNumber] = useState(1);
    const [identical_book, setIdenticalBook] = useState({ name: "", author: "", language: "", printing_year: "", reader_id: "", end_date: "" });

    const [list_books, setListBooks] = useState([{ name: "", author: "", language: "", printing_year: "", reader_id: "", end_date: "" }]);
    const token = localStorage.getItem("access_token");
    useEffect(() => {
        if (error) {
            alert(`Ошибка: ${error}`);
        }
    }, [error]);


    useEffect(() => {
        const fetchLibrarian = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setError("Вы не авторизованы.");
                return;
            }

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
                    setLibrarian(data.user);
                } else {
                    setError(data.message || "Ошибка загрузки данных");
                }
            } catch (err) {
                setError("Ошибка соединения с сервером");
            }
        };

        fetchLibrarian();
    }, []);











    // Загрузка всех читателей
    useEffect(() => {
        const fetchReaders = async () => {
            try {
                const response = await fetch(`${API_URL}/readers`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    const cleanReaders = data.readers.map(reader => ({
                        ...reader,
                        password: null
                    }));
                    setReaders(cleanReaders);
                    setError("");
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Ошибка загрузки пользователей");
            }
        };
        fetchReaders();
    }, []);


    // Удаление пользователя
    const deleteReader = async (_id) => {
        if (!window.confirm(`Вы уверены, что хотите удалить ${_id}?`)) return;

        try {
            const response = await fetch(`${API_URL}/readers/${_id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ _id }),
            });
            const data = await response.json();
            if (response.ok) {
                setReaders(readers.filter(reader => reader._id !== _id));
                setBooks(prevBooks =>
                    prevBooks.map(book =>
                        book.reader_id === _id
                            ? { ...book, reader_id: null, reader_full_name: null }
                            : book
                    )
                );
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при удалении пользователя");
        }
    };

    // Обновление пользователя
    const updateReader = async (_id) => {
        try {
            const response = await fetch(`${API_URL}/readers/${_id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editReader),
            });
            const data = await response.json();
            if (response.ok) {
                const { password, ...updatedReader } = data.reader;
                setReaders(readers.map(reader => reader._id === updatedReader._id ? updatedReader : reader));
                setEditReader(null);
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
                const response = await fetch(`${API_URL}/reader_and_free_books`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setBooks(data.books);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Ошибка загрузки книг");
            }
        };
        fetchBooks();
    }, []);

    const addBook = async () => {
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
                setNewBook({ reader_id: "", name: "", author: "", printing_year: "", language: "", end_date: "" });
                setError("");
            } else {
                setError(data.message || "Ошибка при добавлении книги");
            }
        } catch (err) {
            setError("Ошибка при добавлении книги");
        }
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${API_URL}/reader_and_free_books`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setBooks(data.books);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Ошибка загрузки книг");
            }
        };
        fetchBooks();
    }, []);


    // Поиск книг читателя
    const findReaderBooks = async (_id) => {
        try {
            const response = await fetch(`${API_URL}/reader_books/${_id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                setReaderBooks(data.books);
                setShowReaderBooksTable(true);
                setError("");
            } else {
                setShowReaderBooksTable(false);
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при получении книг читателя");
        }
    };

    //Открепление книги от читателя
    const detachReaderBook = async (bookId) => {
        try {
            const response = await fetch(`${API_URL}/books/detach_reader_book/${bookId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                setReaderBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
                setBooks(prevBooks =>
                    prevBooks.map(book =>
                        book._id === data?.book?._id ? data.book : book
                    )
                );
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Ошибка при откреплении книги");
        }
    };


    //-----БЛОК ДОБАВЛЕНИЯ ОДИНАКОВЫХ КНИГ-----//
    const handleIdenticalBooksChange = (field, value) => {
        setIdenticalBook({ ...identical_book, [field]: value });
    };

    const addIdenticalBooks = async (e) => {
        try {
            e.preventDefault();
            // if (!identical_book.name.trim() || !identical_book.author.trim() || !identical_book.language.trim()) {
            //     return alert("Заполните все обязательные поля");
            // }

            const payload = {
                number,
                book: identical_book,
            };

            const response = await fetch(`${API_URL}/books/identical_books`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setBooks([...books, ...data.identical_books]);
                setIdenticalBook({ reader_id: "", name: "", author: "", printing_year: "", language: "", end_date: "" });
                setNumber(1);
                setError("");
            } else {
                localStorage.setItem("debug", data.message);
                setError(data.message || "Ошибка при добавлении книг");
            }
        } catch (err) {
            localStorage.setItem("debug", "здесь");
            setError("Ошибка при добавлении книг");
        }
    };

    //-----БЛОК ДОБАВЛЕНИЯ ОДИНАКОВЫХ КНИГ-----//










    //-----БЛОК ДОБАВЛЕНИЯ СПИСКА КНИГ-----//
    const handleBookListChange = (index, field, value) => {
        const updated = [...list_books];
        updated[index][field] = value;
        setListBooks(updated);
    };

    const addBookRow = () => {
        if (books.length < MAX_BOOKS) {
            setListBooks([...list_books, { name: "", author: "", language: "", printing_year: "", reader_id: "", end_date: "" }]);
        }
    };

    const removeRow = (index) => {
        const updated = [...list_books];
        updated.splice(index, 1);
        setListBooks(updated);
    };


    const addBookList = async (e) => {
        try{
            e.preventDefault();
            const cleaned = list_books.filter(book => Object.values(book).some(v => v.trim() !== ""));
            if (cleaned.length === 0) return alert("Добавьте хотя бы одну книгу");

            const response = await fetch(`${API_URL}/books/book_list`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleaned),
            });
            const data = await response.json();
            if (response.ok) {
                setBooks([...books, ...data.book_list]);
                setListBooks([
                    { reader_id: "", name: "", author: "", printing_year: "", language: "", end_date: "" },
                ]);
                setError("");
            } else {
                localStorage.setItem("debug", data.message);
                setError(data.message || "Ошибка при добавлении книг");
            }
        } catch (err) {
            localStorage.setItem("debug", "здесь");
            setError("Ошибка при добавлении книг");
        }
    };
    //-----БЛОК ДОБАВЛЕНИЯ СПИСКА КНИГ-----//





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

            {error && <p id="server_error">{error}</p>}


            <div>
                <h1 style={{marginBottom: '20px'}}>Личный кабинет сотрудника</h1>
                <h2>Мой профиль</h2>
                {librarian && (
                    <div className="profile">
                        <p><strong>Логин:</strong> {librarian.username}</p>
                        <p><strong>Полное имя:</strong> {librarian.full_name}</p>
                        <p><strong>Телефон:</strong> {librarian.phone}</p>
                        <p><strong>Адрес:</strong> {librarian.address}</p>
                        <p><strong>Роль:</strong> {librarian.role}</p>
                    </div>
                )}
            </div>
            {/* Таблица читателей */}
            <div>
                <div className={"table_title_and_button"}>
                    <h2>Список читателей</h2>
                    <button
                        className="brown_btn"
                        onClick={() => setShowReadersTable(!showReadersTable)}
                    >
                        {showReadersTable ? "Скрыть" : "Показать"}
                    </button>
                </div>

                {showReadersTable && (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ФИО</th>
                            <th>ID</th>
                            <th>Логин</th>
                            <th>Телефон</th>
                            <th>Адрес</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {readers.map(reader => (
                            <tr key={reader._id}>
                                <td><strong>{reader.full_name}</strong></td>
                                <td>{reader._id}</td>
                                <td>{reader.username}</td>
                                <td>{reader.phone}</td>
                                <td>{reader.address}</td>
                                <td>{reader.role}</td>
                                <td>


                                    <button className="green_btn" onClick={() => setEditReader(reader)}>Редактировать
                                    </button>
                                    <button className="red_btn" onClick={() => deleteReader(reader._id)}>Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>


            {editReader && (
                <div className="form">
                    <h2>Редактировать пользователя {editReader._id}</h2>
                    <div>
                        <input type="text" placeholder="Логин" value={editReader.username}
                               onChange={(e) => setEditReader({...editReader, username: e.target.value})}/>
                    </div>
                    <div>
                        <input type="password" placeholder="Новый пароль"
                               onChange={(e) => setEditReader({...editReader, password: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="ФИО" value={editReader.full_name}
                               onChange={(e) => setEditReader({...editReader, full_name: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="Телефон" value={editReader.phone}
                               onChange={(e) => setEditReader({...editReader, phone: e.target.value})}/>
                    </div>
                    <div>
                        <input type="text" placeholder="Адрес" value={editReader.address}
                               onChange={(e) => setEditReader({...editReader, address: e.target.value})}/>
                    </div>

                    <div>
                        <button className="green_btn" onClick={() => updateReader(editReader._id)}>Сохранить
                        </button>
                    </div>

                    <div>
                        <button className="red_btn" onClick={() => setEditReader(null)}>Отмена</button>
                    </div>

                </div>
            )}


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
                            <th>Название</th>
                            <th>ID</th>
                            <th>ФИО читателя</th>
                            <th>ID читателя</th>
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
                                <td><strong>{book.name}</strong></td>
                                <td>{book._id}</td>
                                <td><strong>{book.reader_full_name}</strong></td>
                                <td>{book.reader_id}</td>
                                <td>{book.author}</td>
                                <td>{book.printing_year}</td>
                                <td>{book.language}</td>
                                <td>{book.end_date ? new Date(book.end_date).toLocaleDateString('ru-RU') : ''}</td>
                                <td>
                                    <button className="green_btn" onClick={() => setEditBook(book)}>Редактировать
                                    </button>
                                    <button className="red_btn" onClick={() => deleteBook(book._id)}>Удалить
                                    </button>
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
                        <input type="number" min="0" placeholder="Год печати" value={editBook.printing_year}
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


            <div>

                <form className="form" onSubmit={(e) => {
                    e.preventDefault();
                    if (!readerId.trim()) {
                        setShowReaderBooksTable(false);
                        return;
                    }
                    findReaderBooks(readerId);  // Если ID введён, выполняем поиск
                    setShowReaderBooksTable(true);
                }}>
                    <h2>Найти все книги читателя</h2>
                    <input
                        type="text"
                        placeholder="ID читателя"
                        value={readerId}
                        onChange={(e) => setReaderId(e.target.value)}
                    />
                    <div>
                        <button type="submit" className="green_btn">Найти</button>
                    </div>

                </form>

                {showReaderBooksTable && (
                    <div >
                        <h2>Книги читателя {readerId}</h2>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Название</th>
                                <th>ID</th>
                                <th>ФИО читателя</th>
                                <th>ID читателя</th>
                                <th>Автор</th>
                                <th>Год печати</th>
                                <th>Язык</th>
                                <th>Дата конца выдачи</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reader_books.map(book => (
                                <tr key={book._id}>
                                    <td><strong>{book.name}</strong></td>
                                    <td>{book._id}</td>
                                    <td><strong>{book.reader_full_name}</strong></td>
                                    <td>{book.reader_id}</td>
                                    <td>{book.author}</td>
                                    <td>{book.printing_year}</td>
                                    <td>{book.language}</td>
                                    <td>{book.end_date ? new Date(book.end_date).toLocaleDateString('ru-RU') : ''}</td>
                                    <td>
                                        <button className="brown_btn"
                                                onClick={() => detachReaderBook(book._id)}>Открепить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                )
                }
            </div>


            <form className="form" onSubmit={addBook}>
                <h2>Добавить книгу</h2>

                <input type="text" placeholder="ID читателя" value={newBook.reader_id}
                       onChange={(e) => setNewBook({...newBook, reader_id: e.target.value})}/>

                <input type="text" placeholder="Название" required value={newBook.name}
                       onChange={(e) => setNewBook({...newBook, name: e.target.value})}/>

                <input type="text" placeholder="Автор" required value={newBook.author}
                       onChange={(e) => setNewBook({...newBook, author: e.target.value})}/>


                <input type="number" min="0" placeholder="Год печати" value={newBook.printing_year}
                       onChange={(e) => setNewBook({...newBook, printing_year: e.target.value})}/>

                <input type="text" placeholder="Язык" required value={newBook.language}
                       onChange={(e) => setNewBook({...newBook, language: e.target.value})}/>
                <label>
                    Дата конца выдачи:
                </label>
                <input type="date" placeholder="Дата конца выдачи" value={newBook.end_date}
                       onChange={(e) => setNewBook({...newBook, end_date: e.target.value})}/>

                <div>
                    <button type="submit" className="green_btn">Добавить</button>
                </div>


            </form>

            <form className="form" onSubmit={addIdenticalBooks}>
                <h2>Добавить одинаковые книги</h2>
                <h2>(максимум 10 штук за один раз)</h2>

                <input type="number" min="1" max="10" value={number}
                       onChange={(e) => setNumber(Number(e.target.value))}/>

                <input placeholder="ID читателя" value={identical_book.reader_id}
                       onChange={(e) => handleIdenticalBooksChange("reader_id", e.target.value)}/>


                <input required placeholder="Название" value={identical_book.name}
                       onChange={(e) => handleIdenticalBooksChange("name", e.target.value)}/>


                <input required placeholder="Автор" value={identical_book.author}
                       onChange={(e) => handleIdenticalBooksChange("author", e.target.value)}/>

                <input type="number" min="0" placeholder="Год печати" value={identical_book.printing_year}
                       onChange={(e) => handleIdenticalBooksChange("printing_year", e.target.value)}/>

                <input required placeholder="Язык" value={identical_book.language}
                       onChange={(e) => handleIdenticalBooksChange("language", e.target.value)}/>
                <label>
                    Дата конца выдачи:
                </label>
                <input type="date" placeholder="Дата конца выдачи" value={identical_book.end_date}
                       onChange={(e) => handleIdenticalBooksChange("end_date", e.target.value)}/>
                <div>
                    <button className={"green_btn"} type="submit">Добавить</button>
                </div>

            </form>

            <form className="book_list_form" onSubmit={addBookList}>
                <h2>Добавить список книг (максимум 10 штук за один раз)</h2>
                {list_books.map((book, i) => (
                    <div className={"list_book"} key={i} style={{}}>
                        <input placeholder="ID читателя" value={book.reader_id}
                               onChange={(e) => handleBookListChange(i, "reader_id", e.target.value)}/>
                        <input required placeholder="Название" value={book.name}
                               onChange={(e) => handleBookListChange(i, "name", e.target.value)}/>
                        <input required placeholder="Автор" value={book.author}
                               onChange={(e) => handleBookListChange(i, "author", e.target.value)}/>
                        <input type="number" min="0" placeholder="Год печати" value={book.printing_year}
                               onChange={(e) => handleBookListChange(i, "printing_year", e.target.value)}/>
                        <input required placeholder="Язык" value={book.language}
                               onChange={(e) => handleBookListChange(i, "language", e.target.value)}/>
                        <label>
                            Дата конца выдачи:
                            <input type="date" placeholder="Дата конца выдачи" value={book.end_date}
                                   onChange={(e) => handleBookListChange(i, "end_date", e.target.value)}/>
                        </label>

                        <button className={"red_btn"} type="button" onClick={() => removeRow(i)}>Удалить</button>
                    </div>
                ))}

                <button id="plus_button" className={"brown_btn"} type="button" onClick={addBookRow}
                        disabled={list_books.length >= MAX_BOOKS}>+
                </button>
                <button className={"green_btn"} type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default LibrarianAccount;
