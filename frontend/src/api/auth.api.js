import api from "./axios";

// Login untuk admin, kasir, maupun member (role dibedakan lewat response user.role)
export const login = (email, password) =>
    api.post("/api/auth/login", { email, password }).then((res) => res.data);

// Pendaftaran mandiri -> selalu jadi role "member" (dipakai app member/pelanggan)
export const register = (nama, email, password) =>
    api.post("/api/auth/register", { nama, email, password }).then((res) => res.data);

// Ambil data user yang sedang login (butuh token)
export const getProfile = () =>
    api.get("/api/auth/profile").then((res) => res.data);

export default { login, register, getProfile };