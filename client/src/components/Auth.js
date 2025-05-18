const AUTH_URL = process.env.AUTH_URL;


// Обновление access_token
const refreshToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token");

    if (!refresh_token) return null;

    const res = await fetch(`${AUTH_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
    });

    console.log("ОБНОВЛЯЕМ ТОКЕН");
    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    console.log("ТОКЕН ОБНОВЛЁН!!!");
    return data.access_token;
};

export const fetchWithAuth = async (url, options = {}, retry = true) => {
    let access_token = localStorage.getItem("access_token");
    if(!access_token)
    {
        const new_token = await refreshToken();
        if (!new_token) {
            await logout();

            return null;
        }
        localStorage.setItem("access_token", new_token);
        access_token = new_token;
    }
    const finalOptions = {
        ...options,
        headers: {
            ...(options?.headers || {}),
            Authorization: `Bearer ${access_token}`,
        },
    };
    const res = await fetch(url, finalOptions);
    if (res.status === 401 || res.status === 403) {
        if (retry) {
            const new_token = await refreshToken();
            if (!new_token) {
                await logout();
                return null;
            }
            return await fetchWithAuth(url, options, false);
        } else {
            await logout();
            return null;
        }
    }
    return res;
};

// Выход (logout)
export const logout = async () => {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    console.log("ЛОГАУТ");
    try {
        await fetch(`${AUTH_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({ refresh_token }),
        });
    } catch (e) {
        console.error("Ошибка при logout:", e);
    }

    console.log("ВЫХОДИМ");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/";
};

// Проверка аутентификации
export const isAuthenticated = () => !!localStorage.getItem("access_token");
