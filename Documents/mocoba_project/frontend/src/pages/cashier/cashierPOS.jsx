import { useState, useMemo, useEffect } from "react";
import {
    Search, X, ShoppingBag, CreditCard, DollarSign, Smartphone, Tag,
    CheckCircle, AlertCircle, RefreshCw, User, Trash2, Wifi, WifiOff,
} from "lucide-react";
import { MOCK_DISCOUNT_RULES, fetchProductsFromAPI, submitOrderAPI } from "../../api/cashier.api";
import ProductCard from "../../components/cards/ProductCard";
import CartItemRow from "../../components/cards/CartItemRow";
import ReceiptModal from "../../components/cashier/ReceiptModal";

export default function CashierPOS({ cashierUser }) {
    // Products & API Connection State
    const [products, setProducts] = useState([]);
    const [isLiveApi, setIsLiveApi] = useState(false);
    const [isLoadingApi, setIsLoadingApi] = useState(true);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    const loadProducts = () => {
        setIsLoadingApi(true);
        fetchProductsFromAPI()
            .then((res) => {
                setProducts(res.products);
                setIsLiveApi(res.isLive);
            })
            .finally(() => setIsLoadingApi(false));
    };

    // HANYA SATU tempat fetch produk (sebelumnya dobel)
    useEffect(() => {
        loadProducts();
    }, []);

    // Kategori dihitung otomatis dari produk yang berhasil di-fetch
    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map((p) => p.kategori || "Umum")));
        return ["Semua", ...cats];
    }, [products]);

    // Inventory & Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");

    // Cart & Order State — mulai KOSONG (bukan lagi auto-isi MOCK_PRODUCTS[0])
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState("Pelanggan Umum");
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);

    // Discount State
    const [activeDiscountRule, setActiveDiscountRule] = useState(MOCK_DISCOUNT_RULES[0]);
    const [customDiscountType, setCustomDiscountType] = useState("percentage");
    const [customDiscountVal, setCustomDiscountVal] = useState("");
    const [showCustomDiscount, setShowCustomDiscount] = useState(false);

    // Payment & Receipt State — pakai value yang dikenal backend: cash/qris/debit
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cashTendered, setCashTendered] = useState(null);
    const [receiptToggle, setReceiptToggle] = useState("print");
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");
    const [lastOrderResult, setLastOrderResult] = useState(null);

    // 1. Filtered Products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory = selectedCategory === "Semua" || product.kategori === selectedCategory;
            const matchesSearch =
                searchQuery === "" || (product.nama || "").toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    // 2. Cart Helpers
    const handleAddToCart = (product) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += 1;
                return newCart;
            }
            return [...prevCart, { product, quantity: 1 }];
        });
        setCheckoutError("");
    };

    const handleUpdateQuantity = (productId, delta) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.product.id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter((item) => item !== null)
        );
    };

    const handleRemoveItem = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    const handleUpdateNote = (productId, note) => {
        setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, note } : item)));
    };

    const handleClearCart = () => {
        if (cart.length === 0 || window.confirm("Kosongkan pesanan saat ini?")) {
            setCart([]);
            setCheckoutError("");
        }
    };

    // 3. Totals & Discount Calculation — TANPA pajak (sistem kita tidak pakai tax otomatis)
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.customPrice ?? item.product.harga) * item.quantity, 0);
    }, [cart]);

    const discountAmount = useMemo(() => {
        if (subtotal === 0) return 0;

        if (showCustomDiscount && customDiscountVal) {
            const val = parseFloat(customDiscountVal) || 0;
            return customDiscountType === "percentage"
                ? Math.min(subtotal, (subtotal * val) / 100)
                : Math.min(subtotal, val);
        }

        if (activeDiscountRule.type === "percentage") {
            return (subtotal * activeDiscountRule.value) / 100;
        }
        return Math.min(subtotal, activeDiscountRule.value);
    }, [subtotal, activeDiscountRule, showCustomDiscount, customDiscountVal, customDiscountType]);

    const totalDue = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

    // 4. Complete Payment Handler — payload SESUAI skema backend /api/transactions/checkout
    const handleCompletePayment = async () => {
        if (cart.length === 0) {
            setCheckoutError("Keranjang masih kosong.");
            return;
        }
        if (paymentMethod === "cash" && cashTendered !== null && cashTendered < totalDue) {
            setCheckoutError(
                `Uang tunai (Rp${cashTendered.toLocaleString("id-ID")}) kurang dari Total (Rp${totalDue.toLocaleString("id-ID")}).`
            );
            return;
        }

        setCheckoutError("");
        setIsSubmittingOrder(true);

        const result = await submitOrderAPI({
            items: cart.map((item) => ({
                productID: item.product.id,
                nama: item.product.nama,
                harga: item.product.harga,
                qty: item.quantity,
            })),
            metodeBayar: paymentMethod,
            discountAmount: Math.round(discountAmount),
        });

        setIsSubmittingOrder(false);

        if (result.success) {
            setLastOrderResult(result);
            setIsReceiptModalOpen(true);
        } else {
            // Checkout gagal -> JANGAN tampilkan modal struk, tampilkan error-nya
            setCheckoutError(result.message || "Gagal menyimpan transaksi.");
        }
    };

    const handleReceiptModalClose = () => {
        setIsReceiptModalOpen(false);
        setCart([]);
        setCustomerName("Pelanggan Umum");
        setActiveDiscountRule(MOCK_DISCOUNT_RULES[0]);
        setShowCustomDiscount(false);
        setCustomDiscountVal("");
        setCashTendered(null);
        setLastOrderResult(null);
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row bg-slate-100 overflow-hidden min-h-[calc(100vh-61px)]">
            {/* LEFT AREA */}
            <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6 overflow-y-auto border-r border-slate-200/80">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama produk..."
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
                            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                {isEditingCustomer ? (
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        onBlur={() => setIsEditingCustomer(false)}
                                        onKeyDown={(e) => e.key === "Enter" && setIsEditingCustomer(false)}
                                        className="bg-slate-100 px-2 py-0.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="truncate max-w-[130px]">{customerName}</span>
                                )}
                            </div>
                            <button type="button" onClick={() => setIsEditingCustomer(!isEditingCustomer)} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold underline">
                                {isEditingCustomer ? "Selesai" : "Ganti"}
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs" title="Status koneksi ke backend">
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                {isLoadingApi ? (
                                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                                ) : isLiveApi ? (
                                    <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                                ) : (
                                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                                )}
                                <span className={isLiveApi ? "text-emerald-700" : "text-amber-700"}>
                                    {isLoadingApi ? "Menghubungkan..." : isLiveApi ? "Terhubung ke Server" : "Gagal Terhubung"}
                                </span>
                            </div>
                            <button type="button" onClick={loadProducts} className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors" title="Muat ulang produk">
                                <RefreshCw className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar mb-5 shrink-0">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        const count = cat === "Semua" ? products.length : products.filter((p) => p.kategori === cat).length;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                                    isSelected ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <span>{cat}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSelected ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-500"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    {filteredProducts.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                            <Search className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                            <h3 className="font-semibold text-slate-700 text-base">Produk Tidak Ditemukan</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                Tidak ada produk yang cocok dengan pencarian di kategori {selectedCategory}.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(""); setSelectedCategory("Semua"); }}
                                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-6">
                            {filteredProducts.map((product) => {
                                const cartItem = cart.find((item) => item.product.id === product.id);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        quantityInCart={cartItem ? cartItem.quantity : 0}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT AREA */}
            <div className="w-full lg:w-[400px] xl:w-[430px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-xl lg:shadow-none z-10 max-h-[calc(100vh-61px)]">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-white leading-none">Pesanan Saat Ini</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">{customerName} • {cart.length} item</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClearCart}
                        disabled={cart.length === 0}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kosongkan</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/60">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <ShoppingBag className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="font-semibold text-sm text-slate-600">Keranjang Kosong</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Pilih produk di sebelah kiri untuk mulai pesanan.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <CartItemRow
                                key={item.product.id}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onUpdateNote={handleUpdateNote}
                            />
                        ))
                    )}
                </div>

                <div className="p-4 bg-white border-t border-slate-200/80 space-y-3 shrink-0 shadow-lg">
                    {/* Discount */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Diskon:</span>
                            </span>
                            <button type="button" onClick={() => setShowCustomDiscount(!showCustomDiscount)} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold underline">
                                {showCustomDiscount ? "Pakai Preset" : "Diskon Custom"}
                            </button>
                        </div>

                        {showCustomDiscount ? (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                <select
                                    value={customDiscountType}
                                    onChange={(e) => setCustomDiscountType(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium text-slate-800"
                                >
                                    <option value="percentage">% Off</option>
                                    <option value="fixed">Rp Off</option>
                                </select>
                                <input
                                    type="number"
                                    value={customDiscountVal}
                                    onChange={(e) => setCustomDiscountVal(e.target.value)}
                                    placeholder={customDiscountType === "percentage" ? "contoh: 10" : "contoh: 5000"}
                                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                {MOCK_DISCOUNT_RULES.map((rule) => {
                                    const isActive = activeDiscountRule.id === rule.id && !showCustomDiscount;
                                    return (
                                        <button
                                            key={rule.id}
                                            type="button"
                                            onClick={() => { setActiveDiscountRule(rule); setShowCustomDiscount(false); }}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                                                isActive ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {rule.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <span className="block text-xs font-semibold text-slate-700">Metode Bayar:</span>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { id: "cash", label: "Tunai", icon: DollarSign },
                                { id: "qris", label: "QRIS", icon: Smartphone },
                                { id: "debit", label: "Debit/CC", icon: CreditCard },
                            ].map((method) => {
                                const Icon = method.icon;
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                            isSelected ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-[10px] font-semibold">{method.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === "cash" && (
                            <div className="pt-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                <span className="text-[11px] text-slate-500 font-medium shrink-0">Tunai:</span>
                                {[
                                    { label: "Pas", val: totalDue },
                                    { label: "20rb", val: 20000 },
                                    { label: "50rb", val: 50000 },
                                    { label: "100rb", val: 100000 },
                                ].map((bill) => (
                                    <button
                                        key={bill.label}
                                        type="button"
                                        onClick={() => setCashTendered(bill.val)}
                                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                                            cashTendered === bill.val ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                        }`}
                                    >
                                        {bill.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Receipt Toggle */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                        <span className="block text-xs font-semibold text-slate-700">Cetak Struk:</span>
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setReceiptToggle("print")}
                                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                    receiptToggle === "print" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <span className="text-base">🖨️</span>
                                <span>Cetak Struk</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReceiptToggle("no_print")}
                                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                    receiptToggle === "no_print" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <span className="text-base">🚫</span>
                                <span>Tanpa Struk</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-mono font-medium">Rp{subtotal.toLocaleString("id-ID")}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Diskon</span>
                                <span className="font-mono">-Rp{Math.round(discountAmount).toLocaleString("id-ID")}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-sm font-bold text-slate-900">
                            <span>Total</span>
                            <span className="text-lg font-mono text-emerald-700">Rp{totalDue.toLocaleString("id-ID")}</span>
                        </div>

                        {paymentMethod === "cash" && cashTendered !== null && cashTendered >= totalDue && (
                            <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                <span>Kembalian:</span>
                                <span className="font-mono">Rp{(cashTendered - totalDue).toLocaleString("id-ID")}</span>
                            </div>
                        )}
                    </div>

                    {checkoutError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-1.5 font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>{checkoutError}</span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleCompletePayment}
                        disabled={cart.length === 0 || isSubmittingOrder}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-between transition-all duration-150 group ${
                            cart.length === 0 || isSubmittingOrder
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30"
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            {isSubmittingOrder ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            <span>{isSubmittingOrder ? "Menyimpan..." : "Selesaikan Pembayaran"}</span>
                        </span>
                        <span className="font-mono bg-emerald-700/80 px-2.5 py-0.5 rounded-lg text-white">Rp{totalDue.toLocaleString("id-ID")}</span>
                    </button>
                </div>
            </div>

            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={handleReceiptModalClose}
                items={cart}
                subtotal={subtotal}
                discountAmount={discountAmount}
                total={totalDue}
                paymentMethod={paymentMethod}
                receiptToggle={receiptToggle}
                cashierName={cashierUser?.nama || "Kasir"}
                orderId={lastOrderResult?.orderId}
            />
        </div>
    );
}