import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3182CE", "#38A169", "#ED8936", "#9F7AEA", "#E53E3E"];

// revenueByMethod: { cash: 500000, qris: 320000, debit: 150000 }
export default function RevenueByMethodChart({ revenueByMethod = {} }) {
    const data = Object.entries(revenueByMethod).map(([method, total]) => ({
        name: method.toUpperCase(),
        value: total,
    }));

    if (data.length === 0) {
        return (
            <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Arus Kas per Metode Bayar</h3>
                <p style={{ color: "#A0AEC0", fontSize: "14px" }}>Belum ada transaksi.</p>
            </div>
        );
    }

    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#1A202C" }}>
                Arus Kas per Metode Bayar
            </h3>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={2}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rp${Number(value).toLocaleString("id-ID")}`} />
                    <Legend verticalAlign="bottom" height={30} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
