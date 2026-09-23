import api from "./axios";

export const getAll = () =>
  api.get("/api/tables").then((res) => res.data);

export const getById = (id) =>
  api.get(`/api/tables/${id}`).then((res) => res.data);

export const create = (payload) =>
  api.post("/api/tables", payload).then((res) => res.data);

export const update = (id, payload) =>
  api.put(`/api/tables/${id}`, payload).then((res) => res.data);

export const setStatus = (id, status, sessionId = null) =>
  api
    .patch(`/api/tables/${id}/status`, { status, sessionId })
    .then((res) => res.data);

export const remove = (id) =>
  api.delete(`/api/tables/${id}`).then((res) => res.data);

export default { getAll, getById, create, update, setStatus, remove };