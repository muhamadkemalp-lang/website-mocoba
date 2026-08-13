import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertCircle,
    Package,
    TrendingUp,
    TrendingDown,
    History,
    Search,
} from "lucide-react";
import ingredientApi from "../../api/ingredient.api";
import inventoryApi from "../../api/inventory.api";

const emptyForm = {
    nama: "",
    kategori: "",
    satuan: "",
    stok: "",
    hargaSatuan: "",
    stokMinimum: 10,
};

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

export default function Inventory() {
    // ─── State ───────────────────────────────────────────
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal CRUD
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Modal Adjust Stok
    const [adjustTarget, setAdjustTarget] = useState(null);
    const [adjustForm, setAdjustForm] = useState({ qty: "", type: "in", note: "" });
    const [adjusting, setAdjusting] = useState(false);
    const [adjustError, setAdjustError] = useState("");

    // Modal Riwayat Stok
    const [logTarget, setLogTarget] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Hapus
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Pencarian
    const [search, setSearch] = useState("");

    // ─── Load ─────────────────────────────────────────────
    useEffect(() => {
        loadIngredients();
    }, []);

    async function loadIngredients() {
        setLoading(true);
        setError(null);
        try {
            const res = await ingredientApi.getAll();
            setIngredients(res.data || []);
        } catch (err) {
            setError("Gagal memuat data inventaris. Periksa koneksi ke server.");
        } finally {
            setLoading(false);
        }
    }

    // ─── Derived Data ─────────────────────────────────────
    const filtered = ingredients.filter((i) =>
        i.nama?.toLowerCase().includes(search.toLowerCase())
    );

    const totalItems = ingredients.length;
    const lowStockItems = ingredients.filter(
        (i) => Number(i.stok || 0) <= Number(i.stokMinimum || 10)
    );
    const totalValue = ingredients.reduce(
        (sum, i) => sum + Number(i.stok || 0) * Number(i.hargaSatuan || 0),
        0
    );

    function getStockStatus(item) {
        const stok = Number(item.stok || 0);
        const min = Number(item.stokMinimum || 10);
        if (stok === 0) return { label: "Habis", color: "bg-red-100 text-red-700" };
        if (stok <= min) return { label: "Menipis", color: "bg-amber-100 text-amber-700" };
        return { label: "Aman", color: "bg-emerald-100 text-emerald-700" };
    }

    // ─── CRUD ─────────────────────────────────────────────
    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm);
        setFormError("");
        setIsModalOpen(true);
    }

    function openEditModal(item) {
        setEditingId(item.id);
        setForm({
            nama: item.nama || "",
            kategori: item.kategori || "",
            satuan: item.satuan || "",
            stok: item.stok ?? "",
            hargaSatuan: item.hargaSatuan ?? "",
            stokMinimum: item.stokMinimum ?? 10,
        });
        setFormError("");
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        if (!form.nama.trim()) return setFormError("Nama bahan baku wajib diisi.");
        if (form.stok === "" || Number(form.stok) < 0)
            return setFormError("Stok tidak valid.");
        if (form.hargaSatuan !== "" && Number(form.hargaSatuan) < 0)
            return setFormError("Harga satuan tidak valid.");

        const payload = {
            nama: form.nama.trim(),
            kategori: form.kategori.trim(),
            satuan: form.satuan.trim(),
            stok: Number(form.stok),
            hargaSatuan: form.hargaSatuan === "" ? 0 : Number(form.hargaSatuan),
            stokMinimum: Number(form.stokMinimum || 10),
        };

        setSaving(true);
        try {
            if (editingId) {
                await ingredientApi.update(editingId, payload);
            } else {
                await ingredientApi.create(payload);
            }
            setIsModalOpen(false);
            loadIngredients();
        } catch (err) {
            setFormError(
                err.response?.data?.message || "Gagal menyimpan bahan baku."
            );
        } finally {
            setSaving(false);
        }
    }

    // ─── Delete ───────────────────────────────────────────
    async function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await ingredientApi.remove(deleteTarget.id);
            setDeleteTarget(null);
            loadIngredients();
        } catch (err) {
            setError("Gagal menghapus bahan baku.");
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    // ─── Adjust Stock ─────────────────────────────────────
    function openAdjustModal(item) {
        setAdjustTarget(item);
        setAdjustForm({ qty: "", type: "in", note: "" });
        setAdjustError("");
    }

    async function handleAdjust(e) {
        e.preventDefault();
        setAdjustError("");

        const qty = Number(adjustForm.qty);
        if (!qty || qty <= 0) return setAdjustError("Jumlah harus lebih dari 0.");

        setAdjusting(true);
        try {
            await inventoryApi.adjustStock(adjustTarget.id, {
                qty,
                type: adjustForm.type,
                note: adjustForm.note,
            });
            setAdjustTarget(null);
            loadIngredients();
        } catch (err) {
            setAdjustError(
                err.response?.data?.message || "Gagal menyesuaikan stok."
            );
        } finally {
            setAdjusting(false);
        }
    }

    // ─── Stock Logs ───────────────────────────────────────
    async function openLogModal(item) {
        setLogTarget(item);
        setLogsLoading(true);
        setLogs([]);
        try {
            const res = await inventoryApi.getStockLogs(item.id);
            setLogs(res.data || []);
        } catch (err) {
            setLogs([]);
        } finally {
            setLogsLoading(false);
        }
    }

    // ─── Render ───────────────────────────────────────────
    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 text-sm">
                Memuat inventaris...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        Inventaris Bahan Baku
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {totalItems} bahan terdaftar
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Bahan
                </button>
            </div>

            {/* ── Error Banner ── */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Low Stock Alert ── */}
            {lowStockItems.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <strong className="font-semibold">
                            ⚠️ {lowStockItems.length} bahan baku stok menipis / habis:
                        </strong>{" "}
                        {lowStockItems
                            .map(
                                (i) =>
                                    `${i.nama} (${i.stok || 0} ${i.satuan || ""})`
                            )
                            .join(", ")}
                    </div>
                </div>
            )}

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">
                            Total Bahan
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                            {totalItems}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">
                            Stok Menipis
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                            {lowStockItems.length}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">
                            Total Nilai Stok
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                            {formatRp(totalValue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Search ── */}
            <div className="relative max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari bahan..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
            </div>

            {/* ── Table ── */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">
                        {search
                            ? "Tidak ada bahan yang cocok"
                            : "Belum ada bahan baku"}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                        {search
                            ? "Coba kata kunci lain"
                            : 'Klik "Tambah Bahan" untuk mulai menambahkan.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-semibold">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-right">
                                        Stok
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Satuan
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-right">
                                        Harga Satuan
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-right">
                                        Total Nilai
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((item) => {
                                    const status = getStockStatus(item);
                                    const total =
                                        Number(item.stok || 0) *
                                        Number(item.hargaSatuan || 0);

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {item.nama}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {item.kategori || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-800 font-semibold tabular-nums">
                                                {item.stok ?? 0}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {item.satuan || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                                                {item.hargaSatuan
                                                    ? formatRp(item.hargaSatuan)
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                                                {total > 0
                                                    ? formatRp(total)
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAdjustModal(item)
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        title="Sesuaikan Stok"
                                                    >
                                                        {item.stok > 0 ? (
                                                            <TrendingDown className="w-4 h-4" />
                                                        ) : (
                                                            <TrendingUp className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openLogModal(item)
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                        title="Riwayat Stok"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteTarget(item)
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════ */}
            {/* MODAL: Tambah / Edit Bahan Baku                */}
            {/* ════════════════════════════════════════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900">
                                {editingId
                                    ? "Edit Bahan Baku"
                                    : "Tambah Bahan Baku"}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-5 space-y-4"
                        >
                            {formError && (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Nama Bahan
                                </label>
                                <input
                                    type="text"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nama: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Gula Pasir"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        value={form.kategori}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                kategori: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Bahan Minuman"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Satuan
                                    </label>
                                    <input
                                        type="text"
                                        value={form.satuan}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                satuan: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="kg, liter, pcs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Stok Saat Ini
                                    </label>
                                    <input
                                        type="number"
                                        value={form.stok}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                stok: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Harga Satuan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.hargaSatuan}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                hargaSatuan: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="12000"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Batas Stok Minimum
                                </label>
                                <input
                                    type="number"
                                    value={form.stokMinimum}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            stokMinimum: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="10"
                                    min="1"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Akan diperingatkan sebagai "menipis" jika
                                    stok ≤ batas ini.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
                                >
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════ */}
            {/* MODAL: Sesuaikan Stok                          */}
            {/* ════════════════════════════════════════════════ */}
            {adjustTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900">
                                Sesuaikan Stok
                            </h2>
                            <button
                                type="button"
                                onClick={() => setAdjustTarget(null)}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleAdjust}
                            className="p-5 space-y-4"
                        >
                            <p className="text-sm text-slate-600">
                                <strong>{adjustTarget.nama}</strong> — Stok
                                saat ini:{" "}
                                <span className="font-semibold">
                                    {adjustTarget.stok || 0}{" "}
                                    {adjustTarget.satuan || ""}
                                </span>
                            </p>

                            {adjustError && (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                                    {adjustError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Tipe Penyesuaian
                                </label>
                                <div className="flex gap-2">
                                    <label
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                                            adjustForm.type === "in"
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="adjustType"
                                            value="in"
                                            checked={
                                                adjustForm.type === "in"
                                            }
                                            onChange={(e) =>
                                                setAdjustForm({
                                                    ...adjustForm,
                                                    type: e.target.value,
                                                })
                                            }
                                            className="sr-only"
                                        />
                                        <TrendingUp className="w-4 h-4" />
                                        Tambah
                                    </label>
                                    <label
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                                            adjustForm.type === "out"
                                                ? "bg-red-50 border-red-300 text-red-700"
                                                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="adjustType"
                                            value="out"
                                            checked={
                                                adjustForm.type === "out"
                                            }
                                            onChange={(e) =>
                                                setAdjustForm({
                                                    ...adjustForm,
                                                    type: e.target.value,
                                                })
                                            }
                                            className="sr-only"
                                        />
                                        <TrendingDown className="w-4 h-4" />
                                        Kurangi
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Jumlah
                                </label>
                                <input
                                    type="number"
                                    value={adjustForm.qty}
                                    onChange={(e) =>
                                        setAdjustForm({
                                            ...adjustForm,
                                            qty: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="10"
                                    min="1"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Catatan (opsional)
                                </label>
                                <input
                                    type="text"
                                    value={adjustForm.note}
                                    onChange={(e) =>
                                        setAdjustForm({
                                            ...adjustForm,
                                            note: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Barang datang dari supplier"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAdjustTarget(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjusting}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
                                >
                                    {adjusting
                                        ? "Menyimpan..."
                                        : "Simpan Penyesuaian"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════ */}
            {/* MODAL: Riwayat Stok                            */}
            {/* ════════════════════════════════════════════════ */}
            {logTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <h2 className="font-bold text-slate-900">
                                Riwayat Stok — {logTarget.nama}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setLogTarget(null)}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            {logsLoading ? (
                                <p className="text-sm text-slate-500 text-center py-8">
                                    Memuat riwayat...
                                </p>
                            ) : logs.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">
                                    Belum ada riwayat perubahan stok.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        log.type === "in"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {log.type === "in" ? (
                                                        <>
                                                            <TrendingUp className="w-3 h-3" />+
                                                            {log.qty}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="w-3 h-3" />-
                                                            {log.qty}
                                                        </>
                                                    )}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {log.createdAt
                                                        ? new Date(
                                                              log.createdAt.seconds * 1000 ||
                                                                  log.createdAt
                                                          ).toLocaleString(
                                                              "id-ID"
                                                          )
                                                        : "-"}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {log.stokSebelum != null && (
                                                    <span>
                                                        {log.stokSebelum} →{" "}
                                                        {log.stokSesudah}{" "}
                                                        {logTarget.satuan ||
                                                            ""}
                                                    </span>
                                                )}
                                                {log.note && (
                                                    <span className="ml-2 text-slate-400">
                                                        • {log.note}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════ */}
            {/* MODAL: Konfirmasi Hapus                        */}
            {/* ════════════════════════════════════════════════ */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
                        <h2 className="font-bold text-slate-900 mb-1">
                            Hapus Bahan Baku?
                        </h2>
                        <p className="text-sm text-slate-500 mb-5">
                            Yakin ingin menghapus{" "}
                            <strong>{deleteTarget.nama}</strong>? Tindakan ini
                            tidak bisa dibatalkan.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60"
                            >
                                {deleting ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

