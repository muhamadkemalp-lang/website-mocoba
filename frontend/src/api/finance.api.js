import api from "./axios";

// Ringkasan keuangan dalam rentang tanggal (ISO string). Kosongkan untuk default 30 hari terakhir.
export const getSummary = (start, end) =>
    api.get("/api/finance/summary", { params: { start, end } }).then((res) => res.data);

// Total pendapatan per hari, N hari terakhir -> untuk diagram batang harian
export const getDailySales = (days = 7) =>
    api.get("/api/finance/daily-sales", { params: { days } }).then((res) => res.data);

// Total pendapatan per bulan, N bulan terakhir -> untuk diagram batang/garis bulanan
export const getMonthlySales = (months = 12) =>
    api.get("/api/finance/monthly-sales", { params: { months } }).then((res) => res.data);

export default { getSummary, getDailySales, getMonthlySales };