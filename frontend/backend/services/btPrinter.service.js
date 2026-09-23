import { Capacitor } from "@capacitor/core";
import { BluetoothPrinter } from "@kduma-autoid/capacitor-bluetooth-printer";

const STORAGE_KEY = "mocoba_bt_printer_address";

export function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export function getSavedPrinterAddress() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function savePrinterAddress(address) {
  localStorage.setItem(STORAGE_KEY, address);
}

/** Daftar device yang ter-pair / terdeteksi */
export async function listPrinters() {
  if (!isNativeAndroid()) {
    throw new Error("Print Bluetooth hanya tersedia di APK Android.");
  }
  const result = await BluetoothPrinter.list();
  return result.devices || [];
}

/** Simpan printer default */
export async function selectPrinter(address) {
  savePrinterAddress(address);
  return address;
}

/**
 * Cetak teks struk (plugin ini menerima data print sesuai API-nya).
 * Cek docs plugin: print({ data }) atau connectAndPrint.
 */
export async function printRaw(textOrBase64) {
  if (!isNativeAndroid()) {
    throw new Error("Print Bluetooth hanya tersedia di APK Android.");
  }

  const address = getSavedPrinterAddress();
  if (!address) {
    throw new Error("Printer belum dipilih. Pair di Bluetooth HP, lalu pilih di Pengaturan.");
  }

  // Sesuaikan dengan API resmi plugin (lihat docs):
  // Opsi A: connect + print
  await BluetoothPrinter.connect({ address });
  await BluetoothPrinter.print({ data: textOrBase64 });
  try {
    await BluetoothPrinter.disconnect();
  } catch (_) {}

  return { success: true };
}

/** Bangun teks struk sederhana (58mm ~ 32 karakter) */
export function buildReceiptText({
  orderId,
  cashierName,
  paymentMethod,
  items,
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

  (items || []).forEach((item) => {
    const nama = item.product?.nama || item.nama || "Item";
    const qty = item.quantity ?? item.qty ?? 1;
    const harga = item.customPrice ?? item.product?.harga ?? item.harga ?? 0;
    const rowTotal = Number(harga) * Number(qty);
    out += `${nama}\n`;
    out += `  ${qty} x ${fmt(harga)} = ${fmt(rowTotal)}\n`;
    if (item.note) out += `  * ${item.note}\n`;
  });

  out += line + "\n";
  out += `Subtotal   ${fmt(subtotal)}\n`;
  if (discountAmount > 0) out += `Diskon    -${fmt(discountAmount)}\n`;
  out += `TOTAL      ${fmt(total)}\n`;
  out += line + "\n";
  out += "     Semoga berkah selalu\n\n\n";

  return out;
}

export async function printReceipt(receiptData) {
  const text = buildReceiptText(receiptData);
  return printRaw(text);
}