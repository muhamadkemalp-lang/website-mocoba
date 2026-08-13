import api from "./axios";

// Semua produk/menu (untuk halaman kelola menu di admin)
export const getAll = () =>
    api.get("/api/products").then((res) => res.data);

// Hanya produk yang status: true (dipakai app kasir & member)
export const getAvailable = () =>
    api.get("/api/products/available").then((res) => res.data);

export const getById = (id) =>
    api.get(`/api/products/${id}`).then((res) => res.data);

// data: { nama, kategori, harga, stok, status, deskripsi }
// Kirim FormData (bukan object biasa) kalau menyertakan file gambar (field "image")
export const create = (data) => {
    const isFormData = data instanceof FormData;
    return api
        .post("/api/products", data, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {})
        .then((res) => res.data);
};

export const update = (id, data) => {
    const isFormData = data instanceof FormData;
    return api
        .put(`/api/products/${id}`, data, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {})
        .then((res) => res.data);
};

export const remove = (id) =>
    api.delete(`/api/products/${id}`).then((res) => res.data);

export default { getAll, getAvailable, getById, create, update, remove };