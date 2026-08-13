import api from "./axios";

// Checkout kasir. payload: { items: [{ productID, nama, qty, harga }], memberID?, metodeBayar }
export const checkout = (payload) =>
    api.post("/api/transactions/checkout", payload).then((res) => res.data);

// 100 transaksi terakhir (admin & kasir)
export const getAll = () =>
    api.get("/api/transactions").then((res) => res.data);

export const getById = (id) =>
    api.get(`/api/transactions/${id}`).then((res) => res.data);

export default { checkout, getAll, getById };