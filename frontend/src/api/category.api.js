import api from "./axios";

export const getAll = () =>
    api.get("/api/categories").then((res) => res.data);

export const getById = (id) =>
    api.get(`/api/categories/${id}`).then((res) => res.data);

export const create = (data) =>
    api.post("/api/categories", data).then((res) => res.data);

export const update = (id, data) =>
    api.put(`/api/categories/${id}`, data).then((res) => res.data);

export const remove = (id) =>
    api.delete(`/api/categories/${id}`).then((res) => res.data);

export default { getAll, getById, create, update, remove };