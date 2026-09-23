import { Capacitor } from "@capacitor/core";

const STORAGE_KEY = "mocoba_bt_printer_address";

export function isNativeAndroid() {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

export function getSavedPrinterAddress() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function savePrinterAddress(address) {
  if (address) localStorage.setItem(STORAGE_KEY, address);
  else localStorage.removeItem(STORAGE_KEY);
}

export function buildReceiptText({
  orderId,
  cashierName,
  paymentMethod,
  items = [],
  subtotal,
  discountAmount,
  total,
  tableName,
}) {
  const line = "--------------------------------";
  const fmt = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

  let out = "";
  out += "      MOCOBA COFFEE\n";
  out += "   Terima kasih telah belanja\n";
  out += line + "\n";
  out += `No: ${String(orderId || "").slice(-8)}\n`;
  out += `Kasir: ${cashierName || "-"}\n`;
  if (tableName) out += `Meja: ${tableName}\n`;
  out += `Bayar: ${String(paymentMethod || "cash").toUpperCase()}\n`;
  out += `Waktu: ${new Date().toLocaleString("id-ID")}\n`;
  out += line + "\n";

  items.forEach((item) => {
    const nama = item.product?.nama || item.nama || "Item";
    const qty = item.quantity ?? item.qty ?? 1;
    const harga = item.customPrice ?? item.product?.harga ?? item.harga ?? 0;
    out += `${nama}\n`;
    out += `  ${qty} x ${fmt(harga)} = ${fmt(Number(harga) * Number(qty))}\n`;
    if (item.note) out += `  * ${item.note}\n`;
  });

  out += line + "\n";
  out += `Subtotal   ${fmt(subtotal)}\n`;
  if (Number(discountAmount) > 0) out += `Diskon    -${fmt(discountAmount)}\n`;
  out += `TOTAL      ${fmt(total)}\n`;
  out += line + "\n\n";

  return out;
}

/**
 * Print via Bluetooth (plugin nanti).
 * Sementara: di browser hanya log; di APK akan panggil plugin.
 */
export async function printReceipt(receiptData) {
  const text = buildReceiptText(receiptData);

  if (!isNativeAndroid()) {
    console.log("[btPrinter] Preview struk:\n", text);
    throw new Error("Print Bluetooth hanya tersedia di APK Android.");
  }

  const address = getSavedPrinterAddress();
  if (!address) {
    throw new Error("Printer belum dipilih. Pair Bluetooth lalu pilih printer di app.");
  }

  // TODO: setelah plugin terpasang, ganti blok ini:
  // await BluetoothPrinter.connect({ address });
  // await BluetoothPrinter.print({ data: text });
  // await BluetoothPrinter.disconnect();

  console.log("[btPrinter] Akan print ke", address, "\n", text);
  throw new Error(
    "Plugin printer belum terpasang. Install plugin Capacitor lalu build APK."
  );
}

export async function listPrinters() {
  if (!isNativeAndroid()) {
    throw new Error("Hanya tersedia di APK Android.");
  }
  // TODO: return (await BluetoothPrinter.list()).devices
  return [];
}