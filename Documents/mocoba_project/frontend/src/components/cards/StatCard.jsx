export default function StatCard({ label, value, icon, accent = "blue", trend }) {
    const accentMap = {
        blue: { bg: "#EBF8FF", text: "#3182CE" },
        green: { bg: "#F0FFF4", text: "#38A169" },
        orange: { bg: "#FFFAF0", text: "#DD6B20" },
        red: { bg: "#FFF5F5", text: "#E53E3E" },
    };
    const colors = accentMap[accent] || accentMap.blue;

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
            }}
        >
            <div
                style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: colors.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "13px", color: "#718096", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#1A202C" }}>{value}</div>
                {trend != null && (
                    <div style={{ fontSize: "12px", color: trend >= 0 ? "#38A169" : "#E53E3E", marginTop: "2px" }}>
                        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% dari kemarin
                    </div>
                )}
            </div>
        </div>
    );
}