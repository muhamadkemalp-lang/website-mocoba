import { Capacitor } from "@capacitor/core";
import { BluetoothPrinter } from "@kduma-autoid/capacitor-bluetooth-printer";

const STORAGE_KEY = "mocoba_bt_printer_address";
const LINE_WIDTH = 32;

/**
 * Check if running on native Android
 */
export function isNativeAndroid() {
  try {
    return (
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
    );
  } catch {
    return false;
  }
}

/**
 * Get saved printer address from localStorage
 */
export function getSavedPrinterAddress() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

/**
 * Save printer address to localStorage
 */
export function savePrinterAddress(address) {
  if (address) {
    localStorage.setItem(STORAGE_KEY, address);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function formatRp(n) {
  return `Rp${Number(n || 0).toLocaleString("id-ID")}`;
}

function money(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

function padRight(str, len) {
  const s = String(str ?? "");
  if (s.length === len) return s;
  if (s.length > len) return s.slice(0, len);
  return s + " ".repeat(len - s.length);
}

function padLeft(str, len) {
  const s = String(str ?? "");
  if (s.length === len) return s;
  if (s.length > len) return s.slice(0, len);
  return " ".repeat(len - s.length) + s;
}

/** Nama (18) + spasi + qty(3) + spasi + harga(9) = 32 */
function lineItem(nama, qty, lineTotal) {
  const name = padRight(nama, 18);
  const q = padLeft(String(qty), 3);
  const h = padLeft(money(lineTotal), 9);
  return `${name} ${q} ${h}`;
}

function lineRow(label, valueStr) {
  const left = padRight(label, 14);
  const right = padLeft(valueStr, LINE_WIDTH - 14);
  return left + right;
}

/**
 * Build receipt text untuk printer 58mm (~32 karakter)
 */
export function buildReceiptText({
  orderId,
  cashierName,
  customerName,
  paymentMethod,
  items = [],
  subtotal,
  discountAmount,
  total,
  tableName,
}) {
  const line = "--------------------------------";

  const WIFI_1_SSID = "Mocoba CoffeeaBawah";
  const WIFI_1_PASS = "moketail";
  const WIFI_2_SSID = "Mocoba cofee1";
  const WIFI_2_PASS = "americano";
  const WIFI_3_SSID = "Mocoba cofee2";
  const WIFI_3_PASS = "gulaaren";

  let out = "";
  out += "\n";
  out += "     MOCOBA COFFEE\n";
  out += "   & EATERY JAKARTA\n";
  out += " Jl.winong,Sudimara Timur\n";
  out += line + "\n";
  out += `Order: #${String(orderId || "").slice(-8)}\n`;
  out += `Kasir: ${cashierName || "-"}\n`;
  out += `Pelanggan: ${customerName || "Pelanggan Umum"}\n`;
  if (tableName) out += `Meja: ${tableName}\n`;
  out += `Bayar: ${String(paymentMethod || "cash").toUpperCase()}\n`;
  out += `Waktu: ${new Date().toLocaleString("id-ID")}\n`;
  out += line + "\n";
  out += padRight("ITEM", 18) + " " + padLeft("QTY", 3) + " " + padLeft("HARGA", 9) + "\n";
  out += line + "\n";

  if (items.length > 0) {
    items.forEach((item) => {
      const nama =
        item.product?.nama || item.nama || item.name || "Item";
      const qty = Number(item.quantity ?? item.qty ?? 1);
      const harga = Number(
        item.customPrice ?? item.product?.harga ?? item.harga ?? 0
      );
      const itemTotal = harga * qty;

      out += lineItem(nama, qty, itemTotal) + "\n";
      if (item.note) {
        out += `  > ${String(item.note).slice(0, 28)}\n`;
      }
    });
    out += line + "\n";
  }

  out += lineRow("Subtotal", formatRp(subtotal)) + "\n";
  if (Number(discountAmount) > 0) {
    out += lineRow("Diskon", "-" + formatRp(discountAmount)) + "\n";
  }
  out += lineRow("TOTAL", formatRp(total)) + "\n";
  out += line + "\n";

  out += "WiFi Gratis\n";
  out += `1. ${WIFI_1_SSID}\n`;
  out += `   Pass: ${WIFI_1_PASS}\n`;
  out += `2. ${WIFI_2_SSID}\n`;
  out += `   Pass: ${WIFI_2_PASS}\n`;
  out += `3. ${WIFI_3_SSID}\n`;
  out += `   Pass: ${WIFI_3_PASS}\n`;
  out += line + "\n";
  out += "Terima kasih!\n";
  out += "IG @mocobacoffee\n";
  out += "\n\n\n";

  return out;
}

/**
 * List available Bluetooth printers
 */
export async function listPrinters() {
  if (!isNativeAndroid()) {
    throw new Error("Hanya tersedia di APK Android.");
  }
  try {
    const result = await BluetoothPrinter.list();
    return result.devices || [];
  } catch (error) {
    console.error("[BT Printer] List error:", error);
    throw new Error(`Gagal list printer: ${error.message}`);
  }
}

/**
 * Connect to printer
 */
export async function connectPrinter(address) {
  if (!isNativeAndroid()) {
    throw new Error("Hanya tersedia di APK Android.");
  }
  try {
    await BluetoothPrinter.connect({ address });
  } catch (error) {
    console.error("[BT Printer] Connect error:", error);
    throw new Error(`Gagal connect printer: ${error.message}`);
  }
}

/**
 * Disconnect from printer
 */
export async function disconnectPrinter() {
  if (!isNativeAndroid()) return;
  try {
    await BluetoothPrinter.disconnect();
  } catch (error) {
    console.error("[BT Printer] Disconnect error:", error);
  }
}

/**
 * Print receipt text to Bluetooth printer
 */
export async function printReceipt(receiptData) {
  const text = buildReceiptText(receiptData);

  if (Capacitor.getPlatform() !== "android") {
    console.log("[BT Printer] Preview struk:\n", text);
    throw new Error("Print Bluetooth hanya di APK Android.");
  }

  const address = getSavedPrinterAddress();
  if (!address) {
    throw new Error("Printer belum dipilih.");
  }

  try {
    await BluetoothPrinter.connect({ address });
    await BluetoothPrinter.print({ data: text });
    try {
      await BluetoothPrinter.disconnect();
    } catch (_) {}
    return { success: true };
  } catch (err) {
    console.error("[btPrinter]", err);
    throw new Error(err?.message || "Gagal mencetak.");
  }
}

/**
 * Printer test
 */
export async function testPrint() {
  if (!isNativeAndroid()) {
    throw new Error("Hanya tersedia di APK Android.");
  }

  return printReceipt({
    orderId: "TEST001",
    cashierName: "Test",
    customerName: "Pelanggan Umum",
    paymentMethod: "CASH",
    tableName: "Meja 1",
    items: [
      { product: { nama: "Kopi Arabika", harga: 25000 }, quantity: 1 },
      { product: { nama: "Croissant", harga: 30000 }, quantity: 2 },
    ],
    subtotal: 85000,
    discountAmount: 0,
    total: 85000,
  });
}