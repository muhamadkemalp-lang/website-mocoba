import { useEffect, useState } from "react";
import { X, Plus, Trash2, AlertCircle, ChefHat } from "lucide-react";
import recipeApi from "../../api/recipe.api";
import ingredientApi from "../../api/ingredient.api";

export default function RecipeModal({ product, onClose }) {
    const [ingredients, setIngredients] = useState([]);
    const [items, setItems] = useState([]); // [{ ingredientID, qty }]
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product]);

    async function loadData() {
        setLoading(true);
        setError("");
        try {
            const ingredientsRes = await ingredientApi.getAll();
            setIngredients(ingredientsRes.data);

            try {
                const recipeRes = await recipeApi.getByProduct(product.id);
                setItems(recipeRes.data.ingredients.map((i) => ({ ingredientID: i.ingredientID, qty: i.qty })));
            } catch (err) {
                // 404 = belum ada resep, itu normal untuk produk baru
                setItems([]);
            }
        } catch (err) {
            setError("Gagal memuat data bahan baku.");
        } finally {
            setLoading(false);
        }
    }

    function addRow() {
        setItems([...items, { ingredientID: "", qty: "" }]);
    }

    function updateRow(index, field, value) {
        setItems(items.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    }

    function removeRow(index) {
        setItems(items.filter((_, i) => i !== index));
    }

    function findIngredientName(ingredientID) {
        const found = ingredients.find((ing) => ing.ingredientID === ingredientID);
        return found ? found.nama : null;
    }

    async function handleSave() {
        setError("");

        if (items.length === 0) {
            setError("Tambahkan minimal 1 bahan baku.");
            return;
        }
        for (const row of items) {
            if (!row.ingredientID) return setError("Semua baris harus pilih bahan baku.");
            if (!row.qty || Number(row.qty) <= 0) return setError("Semua baris harus isi jumlah yang valid.");
        }

        setSaving(true);
        try {
            await recipeApi.update(
                product.id,
                items.map((row) => ({ ingredientID: row.ingredientID, qty: Number(row.qty) }))
            );
            onClose(true); // true = berhasil disimpan, biar parent bisa refresh kalau perlu
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan resep.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-emerald-600" />
                        <div>
                            <h2 className="font-bold text-slate-900 leading-none">Resep: {product.nama}</h2>
                            <p className="text-xs text-slate-400 mt-1">Bahan baku yang dipotong otomatis tiap kali menu ini terjual</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => onClose(false)} className="text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-3 overflow-y-auto flex-1">
                    {loading ? (
                        <p className="text-sm text-slate-500 text-center py-6">Memuat data...</p>
                    ) : (
                        <>
                            {error && (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {ingredients.length === 0 && (
                                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                                    Belum ada bahan baku terdaftar. Tambahkan dulu lewat halaman Inventory.
                                </div>
                            )}

                            {items.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-6">
                                    Belum ada bahan baku di resep ini. Klik "Tambah Bahan" di bawah.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {items.map((row, index) => {
                                        const name = findIngredientName(row.ingredientID);
                                        return (
                                            <div key={index} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <select
                                                    value={row.ingredientID}
                                                    onChange={(e) => updateRow(index, "ingredientID", e.target.value)}
                                                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="">-- Pilih Bahan --</option>
                                                    {ingredients.map((ing) => (
                                                        <option key={ing.id} value={ing.ingredientID}>
                                                            {ing.nama} ({ing.ingredientID})
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="number"
                                                    value={row.qty}
                                                    onChange={(e) => updateRow(index, "qty", e.target.value)}
                                                    placeholder="Qty"
                                                    className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                                <span className="text-xs text-slate-400 w-10">
                                                    {name ? ingredients.find((i) => i.ingredientID === row.ingredientID)?.satuan : ""}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addRow}
                                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Bahan
                            </button>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 shrink-0 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onClose(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
                    >
                        {saving ? "Menyimpan..." : "Simpan Resep"}
                    </button>
                </div>
            </div>
        </div>
    );
}