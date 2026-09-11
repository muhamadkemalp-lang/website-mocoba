import { useState, useMemo, useEffect } from "react";
import {
    Search, X, ShoppingBag, CreditCard, DollarSign, Smartphone, Tag,
    CheckCircle, AlertCircle, RefreshCw, User, Trash2, Wifi, WifiOff, ChevronRight, ChevronLeft,
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
    const [isOrderPanelCollapsed, setIsOrderPanelCollapsed] = useState(false); // ← STATE UNTUK COLLAPSE

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
                jumlah: item.quantity,
                catatan: item.note || "",
            })),
            pelanggan: customerName,
            metode_pembayaran: paymentMethod,
            uang_tunai: paymentMethod === "cash" ? cashTendered : null,
            diskon: Math.round(discountAmount),
            total: Math.round(totalDue),
            kasir_id: cashierUser?.id || "unknown",
            struk: receiptToggle === "print",
        });

        setIsSubmittingOrder(false);

        if (result.success) {
            setLastOrderResult(result.data);
            setIsReceiptModalOpen(true);
            setCart([]);
            setCashTendered(null);
            setCustomDiscountVal("");
            setShowCustomDiscount(false);
            setActiveDiscountRule(MOCK_DISCOUNT_RULES[0]);
            setPaymentMethod("cash");
            setCustomerName("Pelanggan Umum");
            setIsOrderPanelCollapsed(false);
        } else {
            setCheckoutError(result.error?.message || "Terjadi kesalahan saat memproses pembayaran.");
        }
    };

    const handleReceiptModalClose = () => {
        setIsReceiptModalOpen(false);
    };

    const handleFetchProductsAgain = () => {
        loadProducts();
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* LEFT: Products Menu */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${
                isOrderPanelCollapsed ? 'mr-0' : 'mr-80'
            }`}>
                {/* Search & Categories */}
                <div className="sticky top-0 z-40 bg-white border-b border-slate-200 p-4 space-y-3">
                    {/* Search Box */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari nama produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Category Buttons */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 whitespace-nowrap transition-all ${
                                    selectedCategory === cat
                                        ? "bg-emerald-600 text-white shadow-md"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                {cat} {cat !== "Semua" && products.filter(p => p.kategori === cat).length > 0 ? `(${products.filter(p => p.kategori === cat).length})` : ""}
                            </button>
                        ))}
                    </div>

                    {/* API Status */}
                    {!isLiveApi && (
                        <div className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-xs font-medium">
                            <WifiOff className="w-4 h-4 shrink-0" />
                            <span>Mode offline - Data cached</span>
                            <button
                                onClick={handleFetchProductsAgain}
                                className="ml-auto px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs font-semibold transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                    {isLoadingApi ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-3">
                                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
                                <p className="text-slate-500 text-sm font-medium">Loading produk...</p>
                            </div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-3">
                                <Tag className="w-8 h-8 text-slate-400 mx-auto" />
                                <p className="text-slate-500 text-sm font-medium">Produk tidak ditemukan</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Order Panel (Collapsible) */}
            <aside className={`fixed right-0 top-16 transition-all duration-300 ${
                isOrderPanelCollapsed ? 'w-0 opacity-0 invisible' : 'w-80 opacity-100 visible'
            } h-[calc(100vh-4rem)] bg-white border-l border-slate-200 overflow-hidden flex flex-col shadow-lg`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-slate-900" />
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Pesanan Saat Ini</h2>
                            <p className="text-xs text-slate-500">{customerName} • {cart.length} item</p>
                        </div>
                    </div>

                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsOrderPanelCollapsed(!isOrderPanelCollapsed)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title={isOrderPanelCollapsed ? "Buka Panel" : "Tutup Panel"}
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Customer Name Edit */}
                <div className="p-3 border-b border-slate-200 shrink-0">
                    {isEditingCustomer ? (
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                            />
                            <button
                                onClick={() => setIsEditingCustomer(false)}
                                className="px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                            >
                                OK
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditingCustomer(true)}
                            className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-100 rounded-lg transition-colors text-xs"
                        >
                            <span className="text-slate-600">
                                <span className="font-semibold text-slate-900">{customerName}</span>
                                <span className="text-slate-500"> (Edit)</span>
                            </span>
                            <User className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {/* Cart Items */}
                    {cart.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs font-semibold text-slate-700">ITEM PESANAN</span>
                                <button
                                    onClick={handleClearCart}
                                    className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Kosongkan
                                </button>
                            </div>
                            {cart.map((item) => (
                                <CartItemRow
                                    key={item.product.id}
                                    item={item}
                                    onQuantityChange={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                    onNoteChange={handleUpdateNote}
                                />
                            ))}
                        </div>
                    )}

                    {/* Discount Section */}
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                        <span className="block text-xs font-semibold text-slate-700">💰 Diskon:</span>
                        {!showCustomDiscount && (
                            <div className="flex gap-1.5 flex-wrap">
                                {MOCK_DISCOUNT_RULES.map((rule) => {
                                    const isActive = activeDiscountRule.id === rule.id;
                                    return (
                                        <button
                                            key={rule.id}
                                            onClick={() => setActiveDiscountRule(rule)}
                                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                isActive ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {rule.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {/* Custom Discount Toggle */}
                        <button
                            onClick={() => {
                                setShowCustomDiscount(!showCustomDiscount);
                                if (!showCustomDiscount) setCustomDiscountVal("");
                            }}
                            className="w-full px-2 py-1.5 text-xs font-semibold border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                            {showCustomDiscount ? "× Tutup Diskon Custom" : "+ Diskon Custom"}
                        </button>
                        {showCustomDiscount && (
                            <div className="flex gap-1.5 items-center">
                                <select
                                    value={customDiscountType}
                                    onChange={(e) => setCustomDiscountType(e.target.value)}
                                    className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                                >
                                    <option value="percentage">%</option>
                                    <option value="fixed">Rp</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Nilai diskon..."
                                    value={customDiscountVal}
                                    onChange={(e) => setCustomDiscountVal(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <span className="block text-xs font-semibold text-slate-700">💳 Metode Bayar:</span>
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
                        <span className="block text-xs font-semibold text-slate-700">🖨️ Cetak Struk:</span>
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
                </div>

                {/* Summary & Buttons (Sticky Bottom) */}
                <div className="p-3 border-t border-slate-200 space-y-2.5 bg-white shrink-0">
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
            </aside>

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