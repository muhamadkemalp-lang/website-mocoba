export const MOCK_DISCOUNT_RULES = [
  { id: 'disc-none', label: 'No Discount', type: 'percentage', value: 0 },
  { id: 'disc-emp', label: 'Employee (20% Off)', type: 'percentage', value: 20 },
  { id: 'disc-happy', label: 'Happy Hour (15% Off)', type: 'percentage', value: 15 },
  { id: 'disc-loyalty', label: 'Loyalty Reward ($5 Off)', type: 'fixed', value: 5 },
  { id: 'disc-10', label: 'Promo Code (10% Off)', type: 'percentage', value: 10 },
];

// --- BACKEND API CONNECTOR ---
// PENTING: nama variabel harus VITE_API_URL (sama seperti file api/*.js lainnya),
// dan isinya cuma origin server, contoh: http://localhost:3000 (TANPA /api di akhir)
const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

export async function fetchProductsFromAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products/available`, {
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`API returned status: ${res.status}`);

        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            return { products: data.data, isLive: true };
        }
        throw new Error("Data produk tidak valid dari API");
    } catch (err) {
        console.warn("Gagal ambil produk dari backend:", err);
        return { products: [], isLive: false };
    }
}

export async function loginCashierAPI(email, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
            // WAJIB: simpan token, kalau tidak semua request setelahnya (termasuk checkout) akan ditolak
            localStorage.setItem("mocoba_token", data.token);
            localStorage.setItem("mocoba_user", JSON.stringify(data.user));
            return { success: true, user: data.user };
        }

        return { success: false, message: data.message || "Email atau password salah." };
    } catch (err) {
        // TIDAK ada fallback ke data palsu -> kalau backend mati, tampilkan error asli ke user
        return { success: false, message: "Tidak bisa terhubung ke server. Cek koneksi/backend Anda." };
    }
}

// CATATAN: backend MOCOBA TIDAK mengizinkan pendaftaran mandiri sebagai kasir.
// /api/auth/register di backend kita SELALU membuat akun dengan role "member",
// bukan "kasir". Akun kasir HARUS dibuat oleh admin lewat POST /api/users.
// Jadi fungsi ini sebaiknya TIDAK dipakai untuk halaman CashierRegister —
// lihat catatan di bawah kode ini untuk solusinya.
export async function registerCashierAPI() {
    return {
        success: false,
        message: "Pendaftaran mandiri tidak tersedia. Hubungi admin untuk dibuatkan akun kasir.",
    };
}

export async function submitOrderAPI(orderData) {
    try {
        const token = localStorage.getItem("mocoba_token");

        if (!token) {
            return { success: false, message: "Sesi login berakhir, silakan login ulang." };
        }

        const res = await fetch(`${API_BASE_URL}/api/transactions/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        const resData = await res.json();

        if (res.ok && resData.success) {
            return { success: true, orderId: resData.data.id, pointsEarned: resData.data.pointsEarned };
        }

        return { success: false, message: resData.message };
    } catch (err) {
        return { success: false, message: "Gagal terhubung ke server." };
    }
}