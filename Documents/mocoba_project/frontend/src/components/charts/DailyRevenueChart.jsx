import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// data: [{ label: "25 Jul", total: 150000 }, ...]
export default function DailyRevenueChart({ data = [] }) {
    const formatRp = (val) => `Rp${(val / 1000).toFixed(0)}k`;

    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#1A202C" }}>
                Pendapatan 7 Hari Terakhir
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatRp} tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        formatter={(value) => [`Rp${Number(value).toLocaleString("id-ID")}`, "Pendapatan"]}
                        cursor={{ fill: "#F7FAFC" }}
                    />
                    <Bar dataKey="total" fill="#3182CE" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}