import React from 'react';
import { Printer, CheckCircle2, X, Store, QrCode, Share2, ArrowRight } from 'lucide-react';

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

export default function ReceiptModal({
  isOpen,
  onClose,
  items,
  subtotal,
  discountAmount,
  total,
  paymentMethod,
  receiptToggle,
  cashierName,
  orderId
}) {
  if (!isOpen) return null;

  const orderNumber = orderId || `#${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Status Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Mode Struk:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold ${
            receiptToggle === 'print'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-200 text-slate-700'
          }`}>
            {receiptToggle === 'print' ? '🖨️ Cetak Struk' : '🚫 Tanpa Struk'}
          </span>
        </div>

        {/* Scrollable Receipt View */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-[#fdfdfc] text-slate-800 flex-1 border-x-8 border-slate-100 shadow-inner">
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white mb-2">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900">MOCOBA Coffee & Eatery</h4>
            <p className="text-[11px] text-slate-500">Jl. Raya Utama No. 123, Jakarta</p>
            <p className="text-[11px] text-slate-500">Tel: (021) 1234-5678</p>
          </div>

          <div className="py-3 border-b border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Pesanan:</span>
              <span className="font-bold">#{orderNumber.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Pembayaran:</span>
              <span className="font-semibold uppercase">{paymentMethod}</span>
            </div>
          </div>

          {/* Itemized List */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2.5">
            <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Item & Qty</span>
              <span>Harga</span>
            </div>
            {items.map((item) => (
              <div key={item.product.id} className="space-y-0.5">
                <div className="flex justify-between items-start font-medium text-slate-800">
                  <span className="pr-2">{item.quantity}x {item.product.nama}</span>
                  <span className="shrink-0">{formatRp((item.customPrice ?? item.product.harga) * item.quantity)}</span>
                </div>
                {item.note && (
                  <div className="text-[10px] text-amber-700 italic pl-3">
                    - Catatan: {item.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
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

          {/* Footer */}
          <div className="pt-4 text-center space-y-2">
            <div className="inline-block p-2 bg-white rounded border border-slate-200">
              <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
            </div>
            <p className="text-[10px] text-slate-400">Scan untuk struk digital & reward</p>
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mt-2">
              Terima kasih telah berbelanja!
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {receiptToggle === 'print' ? (
            <button
              onClick={() => {
                alert(`Mencetak struk untuk Pesanan #${orderNumber.slice(-8)}...`);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Ulang</span>
            </button>
          ) : (
            <button
              onClick={() => {
                alert(`Mengirim struk digital untuk Pesanan #${orderNumber.slice(-8)}...`);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Email Struk</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <span>Pesanan Baru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
