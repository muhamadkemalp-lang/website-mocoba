import api from "./axios";

// 4 angka utama: todaySales, todayOrders, totalProducts, lowStock
export const getSummary = () =>
    api.get("/api/dashboard/summary").then((res) => res.data);

// Daftar bahan baku dengan stok <= threshold (default 20 di backend)
export const getLowStock = (threshold) =>
    api.get("/api/dashboard/low-stock", { params: { threshold } }).then((res) => res.data);

// Produk terlaris, dihitung dari 100 order terakhir
export const getTopProducts = (limit) =>
    api.get("/api/dashboard/top-products", { params: { limit } }).then((res) => res.data);

// Order terbaru untuk ditampilkan di dashboard
export const getRecentOrders = (limit) =>
    api.get("/api/dashboard/recent-orders", { params: { limit } }).then((res) => res.data);

export default { getSummary, getLowStock, getTopProducts, getRecentOrders };