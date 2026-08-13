import { Plus, AlertCircle } from "lucide-react";

// Props:
// - product: { id, nama, harga, kategori, stok, status, deskripsi }
// - onAddToCart: (product) => void
// - quantityInCart: number
export default function ProductCard({ product, onAddToCart, quantityInCart }) {
    const inStock = product.status && product.stok > 0;

    return (
        <button
            type="button"
            onClick={() => inStock && onAddToCart(product)}
            disabled={!inStock}
            className={`group relative flex flex-col justify-between text-left bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm transition-all duration-150 ${
                inStock
                    ? "hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                    : "opacity-60 bg-slate-50 cursor-not-allowed border-dashed"
            }`}
        >
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 shrink-0">
                <div className="absolute inset-0" style={{ backgroundColor: "#64748b" }} />

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-sm text-[10px] font-medium text-white tracking-wide">
                    {product.kategori || "-"}
                </div>

                {quantityInCart > 0 && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-lg animate-bounce">
                        {quantityInCart}
                    </div>
                )}

                {!inStock && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
                        <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow uppercase tracking-wider">
                            <AlertCircle className="w-3.5 h-3.5" /> Stok Habis
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between w-full">
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {product.nama}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Stok: {product.stok ?? "-"}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between w-full">
                    <span className="font-bold text-base text-slate-900">
                        Rp{Number(product.harga || 0).toLocaleString("id-ID")}
                    </span>

                    <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            inStock
                                ? "bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white"
                                : "bg-slate-200 text-slate-400"
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </button>
    );
}