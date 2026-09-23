import React, { useState, useEffect } from "react";
import {
  Printer,
  CheckCircle2,
  X,
  Store,
  QrCode,
  Share2,
  ArrowRight,
} from "lucide-react";
import {
  isNativeAndroid,
  getSavedPrinterAddress,
  printReceipt,
} from "../../services/btPrinter.service";

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

export default function ReceiptModal({
  isOpen,
  onClose,
  items = [],
  subtotal,
  discountAmount,
  total,
  paymentMethod,
  receiptToggle,
  cashierName,
  orderId,
  tableName, // nama / kode meja dari CashierPOS
}) {
  const [hasPrinter, setHasPrinter] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const ready = isNativeAndroid() && !!getSavedPrinterAddress();
    setHasPrinter(ready);
    setPrintMessage("");
  }, [isOpen]);

  if (!isOpen) return null;

  const orderNumber = orderId || `#${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = async () => {
    if (!isNativeAndroid()) {
      setPrintMessage("Print Bluetooth hanya tersedia di APK Android.");
      return;
    }
    if (!getSavedPrinterAddress()) {
      setPrintMessage(
        "Printer belum dipilih. Pair di Bluetooth HP, lalu pilih printer di pengaturan kasir."
      );
      return;
    }

    setIsPrinting(true);
    setPrintMessage("Mengirim ke printer...");

    try {
      await printReceipt({
        orderId: String(orderNumber).slice(-8),
        cashierName: cashierName || "Kasir",
        paymentMethod: paymentMethod || "cash",
        tableName: tableName || null,
        items,
        subtotal,
        discountAmount,
        total,
      });
      setPrintMessage("Struk berhasil dikirim ke printer.");
      setTimeout(() => {
        setPrintMessage("");
        onClose();
      }, 1200);
    } catch (err) {
      setPrintMessage(err?.message || "Gagal mencetak struk.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pembayaran Berhasil!</h3>
              <p className="text-[11px] text-slate-400">Transaksi tercatat di sistem</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status printer */}
        <div
          className={`px-6 py-3 border-b flex items-center justify-between text-xs font-semibold ${
            hasPrinter
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : "bg-amber-50 text-amber-800 border-amber-100"
          }`}
        >
          <span>
            {hasPrinter
              ? "Printer Bluetooth siap"
              : isNativeAndroid()
                ? "Printer belum dipilih"
                : "Print BT hanya di APK"}
          </span>
          <span className="text-[10px] opacity-70">Iware C-58BT</span>
        </div>

        {/* Mode struk */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Mode Struk:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold ${
              receiptToggle === "print"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {receiptToggle === "print" ? "Cetak Struk" : "Tanpa Struk"}
          </span>
        </div>

        {/* Isi struk */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-[#fdfdfc] text-slate-800 flex-1 border-x-8 border-slate-100">
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white mb-2">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              MOCOBA Coffee & Eatery
            </h4>
            <p className="text-[11px] text-slate-500">Jl. Raya Utama No. 123, Jakarta</p>
          </div>

          <div className="py-3 border-b border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Pesanan:</span>
              <span className="font-bold">#{String(orderNumber).slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{cashierName || "-"}</span>
            </div>
            {tableName && (
              <div className="flex justify-between">
                <span>Meja:</span>
                <span className="font-semibold">{tableName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pembayaran:</span>
              <span className="font-semibold uppercase">{paymentMethod}</span>
            </div>
          </div>

          <div className="py-3 border-b border-dashed border-slate-300 space-y-2.5">
            <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Item & Qty</span>
              <span>Harga</span>
            </div>
            {items.map((item, idx) => (
              <div key={item.product?.id || idx} className="space-y-0.5">
                <div className="flex justify-between items-start font-medium text-slate-800">
                  <span className="pr-2">
                    {item.quantity}x {item.product?.nama || item.nama}
                  </span>
                  <span className="shrink-0">
                    {formatRp(
                      (item.customPrice ?? item.product?.harga ?? 0) *
                        (item.quantity || 1)
                    )}
                  </span>
                </div>
                {item.note && (
                  <div className="text-[10px] text-amber-700 italic pl-3">
                    - Catatan: {item.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatRp(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Diskon:</span>
                <span>-{formatRp(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL DIBAYAR:</span>
              <span>{formatRp(total)}</span>
            </div>
          </div>

          <div className="pt-4 text-center space-y-2">
            <div className="inline-block p-2 bg-white rounded border border-slate-200">
              <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
            </div>
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mt-2">
              Terima kasih telah berbelanja!
            </p>
          </div>
        </div>

        {printMessage && (
          <div
            className={`px-6 py-3 text-center text-xs font-semibold border-t ${
              printMessage.includes("berhasil")
                ? "bg-emerald-50 text-emerald-800"
                : "bg-amber-50 text-amber-900"
            }`}
          >
            {printMessage}
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {receiptToggle === "print" ? (
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                isPrinting
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? "Sedang Cetak..." : "Cetak Struk"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                alert(`Struk digital untuk #${String(orderNumber).slice(-8)}`)
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Email Struk</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isPrinting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <span>Pesanan Baru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}