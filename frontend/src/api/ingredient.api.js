import api from "./axios";

// CRUD dasar bahan baku (nama, satuan, kategori, dll).
// Catatan: backend menyatukan modul ini dengan "inventory" di endpoint /api/inventory,
// karena stok & data bahan baku disimpan di collection Firestore yang sama.

export const getAll = () =>
    api.get("/api/inventory").then((res) => res.data);

export const getById = (id) =>
    api.get(`/api/inventory/${id}`).then((res) => res.data);

export const create = (data) =>
    api.post("/api/inventory", data).then((res) => res.data);

export const update = (id, data) =>
    api.put(`/api/inventory/${id}`, data).then((res) => res.data);

export const remove = (id) =>
    api.delete(`/api/inventory/${id}`).then((res) => res.data);

export default { getAll, getById, create, update, remove };