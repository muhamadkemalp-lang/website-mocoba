import api from "./axios";

// Laporan penjualan per produk dalam rentang tanggal (ISO string).
// Kosongkan start/end untuk default 30 hari terakhir (sesuai default di backend).
export const getSalesByProduct = (start, end) =>
    api.get("/api/reports/sales-by-product", { params: { start, end } }).then((res) => res.data);

export default { getSalesByProduct };