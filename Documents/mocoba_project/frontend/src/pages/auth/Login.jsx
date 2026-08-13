import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const user = await login(email, password);
            console.log("Login berhasil:", user);

            // Arahkan ke halaman sesuai role masing-masing
            if (user.role === "admin") navigate("/admin/dashboard");
            else if (user.role === "kasir") navigate("/kasir");
            else navigate("/member");
        } catch (err) {
            setError(err.response?.data?.message || "Login gagal. Cek email/password Anda.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F7FAFC",
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    background: "#fff",
                    padding: "32px",
                    borderRadius: "14px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    width: "100%",
                    maxWidth: "360px",
                }}
            >
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px", color: "#1A202C" }}>
                    ☕ MOCOBA
                </h1>
                <p style={{ fontSize: "14px", color: "#718096", marginBottom: "24px" }}>Masuk ke akun Anda</p>

                {error && (
                    <div
                        style={{
                            background: "#FFF5F5",
                            color: "#C53030",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            marginBottom: "16px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <label style={{ fontSize: "13px", fontWeight: 500, color: "#4A5568" }}>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@mocoba.com"
                    style={inputStyle}
                />

                <label style={{ fontSize: "13px", fontWeight: 500, color: "#4A5568" }}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
                />

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: "11px",
                        background: submitting ? "#A0AEC0" : "#3182CE",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: submitting ? "not-allowed" : "pointer",
                    }}
                >
                    {submitting ? "Memproses..." : "Login"}
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginTop: "6px",
    marginBottom: "16px",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
};