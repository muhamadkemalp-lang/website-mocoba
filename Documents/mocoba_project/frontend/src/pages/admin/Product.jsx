import { useEffect, useState, useMemo } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertCircle,
    CheckCircle,
    Package,
    Search,
    Image as ImageIcon,
    Upload,
} from "lucide-react";
import productApi from "../../api/product.api";
import categoryApi from "../../api/category.api";
import { ChefHat } from "lucide-react";
import RecipeModal from "../../components/cards/RecipeModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyForm = {
    nama: "",
    kategori: "",
    harga: "",
    stok: "",
    status: true,
    deskripsi: "",
};

const initialFilters = {
    search: "",
    kategori: "",
    status: "all",
};

export default function Product() {
    // ── Data ──
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Filter ──
    const [filters, setFilters] = useState(initialFilters);

    // ── Modal Form ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [recipeTarget, setRecipeTarget] = useState(null);

    // ── Delete ──
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // ── Toast ──
    const [toast, setToast] = useState(null);

    // ── ──

    useEffect(() => {
        loadAll();
    }, []);

    // Hapus toast otomatis setelah 3 detik
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    // ── Load data ──

    async function loadAll() {
        setLoading(true);
        setError(null);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productApi.getAll(),
                categoryApi.getAll(),
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            setError("Gagal memuat data. Cek koneksi ke server.");
        } finally {
            setLoading(false);
        }
    }

    function showToast(message, type = "success") {
        setToast({ message, type });
    }

    // ── Filtered products ──

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search by name
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((p) => p.nama?.toLowerCase().includes(q));
        }

        // Filter kategori
        if (filters.kategori) {
            result = result.filter((p) => p.kategori === filters.kategori);
        }

        // Filter status
        if (filters.status === "active") {
            result = result.filter((p) => p.status && p.stok > 0);
        } else if (filters.status === "inactive") {
            result = result.filter((p) => !p.status || p.stok <= 0);
        }

        return result;
    }, [products, filters]);

    // ── Modal handlers ──

    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview(null);
        setFormError("");
        setIsModalOpen(true);
    }

    function openEditModal(product) {
        setEditingId(product.id);
        setForm({
            nama: product.nama || "",
            kategori: product.kategori || "",
            harga: product.harga ?? "",
            stok: product.stok ?? "",
            status: product.status ?? true,
            deskripsi: product.deskripsi || "",
        });
        setImageFile(null);
        setImagePreview(product.image ? `${API_URL}/uploads/${product.image}` : null);
        setFormError("");
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setImageFile(null);
        setImagePreview(null);
    }

    function handleImageChange(e) {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            if (!editingId) setImagePreview(null);
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    function removeSelectedImage() {
        setImageFile(null);
        if (editingId) {
            // Keep existing image preview
            const product = products.find((p) => p.id === editingId);
            setImagePreview(product?.image ? `${API_URL}/uploads/${product.image}` : null);
        } else {
            setImagePreview(null);
        }
    }

    // ── Submit form ──

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        // Validasi
        if (!form.nama.trim()) return setFormError("Nama produk wajib diisi.");
        if (!form.kategori) return setFormError("Pilih kategori.");
        if (form.harga === "" || Number(form.harga) < 0) return setFormError("Harga tidak valid.");
        if (form.stok === "" || Number(form.stok) < 0) return setFormError("Stok tidak valid.");

        const payload = new FormData();
        payload.append("nama", form.nama.trim());
        payload.append("kategori", form.kategori);
        payload.append("harga", Number(form.harga));
        payload.append("stok", Number(form.stok));
        payload.append("status", form.status);
        payload.append("deskripsi", form.deskripsi.trim());

        if (imageFile) {
            payload.append("image", imageFile);
        }

        setSaving(true);
        try {
            if (editingId) {
                await productApi.update(editingId, payload);
                showToast("Produk berhasil diperbarui");
            } else {
                await productApi.create(payload);
                showToast("Produk berhasil ditambahkan");
            }
            setIsModalOpen(false);
            loadAll();
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal menyimpan produk.");
        } finally {
            setSaving(false);
        }
    }

    // ── Delete ──

    async function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await productApi.remove(deleteTarget.id);
            showToast("Produk berhasil dihapus");
            setDeleteTarget(null);
            loadAll();
        } catch (err) {
            setError("Gagal menghapus produk.");
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    // ── Helpers ──

    const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

    const getImageSrc = (product) => {
        if (product.image) return `${API_URL}/uploads/${product.image}`;
        return null;
    };

    const isAvailable = (product) => product.status && Number(product.stok) > 0;

    // ── Render ──

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 text-sm">Memuat produk...</div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* ── Toast ── */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all animate-slide-in ${
                        toast.type === "success"
                            ? "bg-emerald-600 text-white"
                            : "bg-red-600 text-white"
                    }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Kelola Menu</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {products.length} produk terdaftar
                        {filteredProducts.length !== products.length &&
                            ` (menampilkan ${filteredProducts.length})`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Menu
                </button>
            </div>

            {/* ── Error Banner ── */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Filter Bar ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Cari nama produk..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {/* Filter Kategori */}
                <select
                    value={filters.kategori}
                    onChange={(e) => setFilters({ ...filters, kategori: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.nama}>
                            {cat.nama}
                        </option>
                    ))}
                </select>

                {/* Filter Status */}
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                    <option value="all">Semua Status</option>
                    <option value="active">Tersedia</option>
                    <option value="inactive">Habis / Nonaktif</option>
                </select>

                {/* Reset Filter */}
                {(filters.search || filters.kategori || filters.status !== "all") && (
                    <button
                        type="button"
                        onClick={() => setFilters(initialFilters)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold px-2 py-1"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {/* ── Table / Empty State ── */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">
                        {products.length === 0
                            ? "Belum ada menu"
                            : "Tidak ada produk yang cocok dengan filter"}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                        {products.length === 0
                            ? 'Klik "Tambah Menu" untuk mulai menambahkan produk.'
                            : "Coba ubah kata kunci atau filter."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-semibold w-14">Gambar</th>
                                    <th className="px-4 py-3 font-semibold">Nama</th>
                                    <th className="px-4 py-3 font-semibold">Kategori</th>
                                    <th className="px-4 py-3 font-semibold">Harga</th>
                                    <th className="px-4 py-3 font-semibold">Stok</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => {
                                    const imgSrc = getImageSrc(product);
                                    const available = isAvailable(product);
                                    return (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            {/* Image */}
                                            <td className="px-4 py-3">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc}
                                                        alt={product.nama}
                                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <ImageIcon className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                            </td>
                                            {/* Nama */}
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">
                                                    {product.nama}
                                                </div>
                                                {product.deskripsi && (
                                                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">
                                                        {product.deskripsi}
                                                    </div>
                                                )}
                                            </td>
                                            {/* Kategori */}
                                            <td className="px-4 py-3 text-slate-600">
                                                {product.kategori || "-"}
                                            </td>
                                            {/* Harga */}
                                            <td className="px-4 py-3 text-slate-800 font-semibold tabular-nums">
                                                {formatRp(product.harga)}
                                            </td>
                                            {/* Stok */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`font-semibold tabular-nums ${
                                                        Number(product.stok) <= 5
                                                            ? "text-red-600"
                                                            : "text-slate-700"
                                                    }`}
                                                >
                                                    {product.stok ?? "-"}
                                                </span>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        available
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    {available ? "Tersedia" : "Habis"}
                                                </span>
                                            </td>
                                            {/* Aksi */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                            type="button"
                                                            onClick={() => setRecipeTarget(product)}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                                            title="Kelola Resep"
                                                        >
                                                            <ChefHat className="w-4 h-4" />
                                                        </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(product)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(product)}
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

                    {/* Footer info */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        Menampilkan {filteredProducts.length} dari {products.length} produk
                    </div>
                </div>
            )}

            {/* ── MODAL: Tambah / Edit ── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h2 className="font-bold text-slate-900">
                                {editingId ? "Edit Menu" : "Tambah Menu"}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Error */}
                            {formError && (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {formError}
                                </div>
                            )}

                            {/* Upload Gambar */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Gambar Produk (opsional)
                                </label>
                                <div className="flex items-center gap-3">
                                    {/* Preview */}
                                    {imagePreview ? (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeSelectedImage}
                                                className="absolute top-0.5 right-0.5 bg-slate-900/60 text-white rounded-full p-0.5 hover:bg-slate-900/80"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center shrink-0">
                                            <ImageIcon className="w-6 h-6 text-slate-300" />
                                        </div>
                                    )}

                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span>
                                                {imageFile
                                                    ? imageFile.name
                                                    : "Pilih gambar..."}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpg,image/jpeg,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Format: PNG, JPG, JPEG, WEBP. Maks 2MB.
                                </p>
                            </div>

                            {/* Nama */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Nama Produk <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({ ...form, nama: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Kopi Susu Gula Aren"
                                />
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.kategori}
                                    onChange={(e) =>
                                        setForm({ ...form, kategori: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.nama}>
                                            {cat.nama}
                                        </option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-[11px] text-amber-600 mt-1">
                                        Belum ada kategori. Tambah kategori dulu lewat halaman
                                        Kategori.
                                    </p>
                                )}
                            </div>

                            {/* Harga & Stok */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Harga (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.harga}
                                        onChange={(e) =>
                                            setForm({ ...form, harga: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="18000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Stok <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.stok}
                                        onChange={(e) =>
                                            setForm({ ...form, stok: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="50"
                                    />
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Deskripsi (opsional)
                                </label>
                                <textarea
                                    value={form.deskripsi}
                                    onChange={(e) =>
                                        setForm({ ...form, deskripsi: e.target.value })
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    placeholder="Deskripsi singkat tentang produk..."
                                />
                            </div>

                            {/* Status */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.status}
                                    onChange={(e) =>
                                        setForm({ ...form, status: e.target.checked })
                                    }
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-700">
                                    Aktif / tersedia dijual
                                </span>
                            </label>

                            {/* Tombol */}
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
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                                >
                                    {saving
                                        ? "Menyimpan..."
                                        : editingId
                                          ? "Simpan Perubahan"
                                          : "Tambah Produk"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: Konfirmasi Hapus ── */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">Hapus Menu</h2>
                                <p className="text-sm text-slate-500">
                                    Tindakan ini tidak bisa dibatalkan.
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-700 mb-5">
                            Yakin ingin menghapus{" "}
                            <strong className="text-slate-900">
                                {deleteTarget.nama}
                            </strong>
                            ?
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
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                            >
                                {deleting ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
                        {recipeTarget && (
                <RecipeModal
                    product={recipeTarget}
                    onClose={(saved) => {
                        setRecipeTarget(null);
                        if (saved) loadAll();
                    }}
                />
            )}
        </div>
    );
}
