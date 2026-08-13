import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// data: [{ nama: "Kopi Susu", qtyTerjual: 42 }, ...]
export default function TopProductsChart({ data = [] }) {
    if (data.length === 0) {
        return (
            <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Menu Terlaris</h3>
                <p style={{ color: "#A0AEC0", fontSize: "14px" }}>Belum ada data penjualan.</p>
            </div>
        );
    }

    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#1A202C" }}>Menu Terlaris</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
                    <YAxis
                        type="category"
                        dataKey="nama"
                        width={100}
                        tick={{ fontSize: 12, fill: "#4A5568" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip formatter={(value) => [`${value} terjual`, ""]} cursor={{ fill: "#F7FAFC" }} />
                    <Bar dataKey="qtyTerjual" fill="#38A169" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
