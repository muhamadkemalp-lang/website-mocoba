import { createContext, useState, useEffect } from "react";
import authApi from "../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("mocoba_user");
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("mocoba_token"));
    const [loading, setLoading] = useState(false);

    // Kalau ada token tersimpan, cek validitasnya ke server begitu app dibuka
    useEffect(() => {
        if (token && !user) {
            authApi
                .getProfile()
                .then((res) => {
                    setUser(res.data);
                    localStorage.setItem("mocoba_user", JSON.stringify(res.data));
                })
                .catch(() => {
                    logout();
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function login(email, password) {
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            setUser(res.user);
            setToken(res.token);
            localStorage.setItem("mocoba_token", res.token);
            localStorage.setItem("mocoba_user", JSON.stringify(res.user));
            return res.user;
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("mocoba_token");
        localStorage.removeItem("mocoba_user");
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}