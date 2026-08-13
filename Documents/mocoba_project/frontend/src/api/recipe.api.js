import api from "./axios";

// Ambil resep untuk 1 produk (404 kalau belum ada resepnya - ini normal, bukan error fatal)
export const getByProduct = (productID) =>
    api.get(`/api/recipes/${productID}`).then((res) => res.data);

// Buat resep baru. items: [{ ingredientID, qty }]
export const create = (productID, items) =>
    api.post("/api/recipes", { productID, items }).then((res) => res.data);

// Update/replace seluruh daftar bahan pada resep produk (otomatis buat baru kalau belum ada)
export const update = (productID, items) =>
    api.put(`/api/recipes/${productID}`, { items }).then((res) => res.data);

export const remove = (productID) =>
    api.delete(`/api/recipes/${productID}`).then((res) => res.data);

export default { getByProduct, create, update, remove };