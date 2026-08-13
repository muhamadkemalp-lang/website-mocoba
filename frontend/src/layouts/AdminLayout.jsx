import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Boxes,
    Wallet,
    BarChart3,
    Users,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    { to: "/admin/finance", label: "Finance", icon: Wallet },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/members", label: "Members", icon: Users },
];

export default function AdminLayout() {
    const location = useLocation();

    // Simpan preferensi collapse ke localStorage, biar diingat pas reload halaman
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem("mocoba_sidebar_collapsed") === "true";
    });

    function toggleSidebar() {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("mocoba_sidebar_collapsed", String(next));
            return next;
        });
    }

    const sidebarWidth = collapsed ? "68px" : "230px";

    return (
        <div style={{ display: "flex" }}>
            <aside
                style={{
                    width: sidebarWidth,
                    background: "#222",
                    color: "#fff",
                    minHeight: "100vh",
                    padding: collapsed ? "20px 10px" : "20px",
                    transition: "width 0.2s ease, padding 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "space-between",
                        marginBottom: "10px",
                    }}
                >
                    {!collapsed && <h2 style={{ margin: 0 }}>MOCOBA</h2>}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
                        style={{
                            background: "#333",
                            border: "none",
                            color: "#fff",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
                    </button>
                </div>

                <hr style={{ borderColor: "#444", width: "100%" }} />

                <nav style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                title={collapsed ? item.label : undefined}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    color: isActive ? "#fff" : "#ccc",
                                    background: isActive ? "#3182CE" : "transparent",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    transition: "background 0.15s ease",
                                }}
                            >
                                <Icon size={18} style={{ flexShrink: 0 }} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <main
                style={{
                    flex: 1,
                    padding: "30px",
                    minWidth: 0, // penting supaya konten (misal chart) bisa menyusut/melebar dengan benar
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}   