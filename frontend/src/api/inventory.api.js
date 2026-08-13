import api from "./axios";

// Operasi khusus STOK (bukan CRUD data bahan baku, lihat ingredient.api.js untuk itu)

// Daftar bahan baku dengan stok menipis (<= threshold, default 20 di backend)
export const getLowStock = (threshold) =>
    api.get("/api/inventory/low-stock", { params: { threshold } }).then((res) => res.data);

// Tambah/kurangi stok manual. type: "in" (barang datang) atau "out" (koreksi/rusak)
export const adjustStock = (id, { qty, type, note }) =>
    api.post(`/api/inventory/${id}/adjust`, { qty, type, note }).then((res) => res.data);

// Riwayat perubahan stok. ingredientId opsional (kosongkan untuk semua riwayat)
export const getStockLogs = (ingredientId) =>
    api.get("/api/inventory/logs", { params: { ingredientId } }).then((res) => res.data);

export default { getLowStock, adjustStock, getStockLogs };