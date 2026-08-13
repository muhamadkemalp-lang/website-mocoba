import axios from "axios";

// Sesuaikan dengan URL backend Anda.
// Di Vite, variabel env HARUS diawali VITE_ dan diakses lewat import.meta.env
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Sisipkan token JWT otomatis ke setiap request (kalau ada)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("mocoba_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Tangani token expired/invalid secara terpusat -> paksa logout & redirect ke login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("mocoba_token");
            localStorage.removeItem("mocoba_user");

            // Hindari redirect loop kalau memang sedang di halaman login
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;