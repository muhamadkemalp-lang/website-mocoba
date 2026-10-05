import React, { useState, useEffect } from "react";
import { ChevronLeft, Radio, RadioOff, Wifi, WifiOff } from "lucide-react";
import {
  isNativeAndroid,
  listPrinters,
  savePrinterAddress,
  getSavedPrinterAddress,
  //testPrint,
} from "../services/btPrinter.service";


export default function PrinterSettings({ onBack }) {
  const [printers, setPrinters] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(
    getSavedPrinterAddress()
  );
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isNativeAndroid()) {
      setMessage("Pengaturan printer hanya tersedia di APK Android");
      return;
    }
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    setLoading(true);
    setMessage("");
    try {
      const devices = await listPrinters();
      setPrinters(devices);
      if (devices.length === 0) {
        setMessage("Tidak ada printer ditemukan. Pair Bluetooth di Settings HP.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address) => {
    setSelectedAddress(address);
    savePrinterAddress(address);
    setMessage("✅ Printer dipilih!");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleTest = async () => {
    if (!selectedAddress) {
      setMessage("Pilih printer terlebih dahulu");
      return;
    }

    setTestLoading(true);
    setMessage("Testing...");
    try {
      await testPrint();
      setMessage("✅ Test print berhasil!");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">Pengaturan Printer</h1>
          <p className="text-xs text-slate-400">Iware C-58BT Bluetooth</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Status */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              message.includes("✅")
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : message.includes("❌")
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {message}
          </div>
        )}

        {/* Scan Button */}
        <button
          onClick={loadPrinters}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
        >
          {loading ? "Scanning..." : "Scan Printer Bluetooth"}
        </button>

        {/* Printers List */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300 font-semibold">
            Printer Tersedia ({printers.length})
          </p>
          {printers.length > 0 ? (
            printers.map((printer) => (
              <button
                key={printer.address}
                onClick={() => handleSelect(printer.address)}
                className={`w-full p-3 rounded-lg border-2 transition text-left ${
                  selectedAddress === printer.address
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{printer.name}</p>
                    <p className="text-xs text-slate-400">{printer.address}</p>
                  </div>
                  {selectedAddress === printer.address ? (
                    <Radio className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <RadioOff className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 bg-slate-700/50 rounded-lg text-center text-sm text-slate-400">
              {loading ? "Scanning..." : "Tidak ada printer"}
            </div>
          )}
        </div>

        {/* Selected Printer Info */}
        {selectedAddress && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-xs text-slate-400">Printer Terpilih</p>
            <p className="text-sm font-semibold">{selectedAddress}</p>
          </div>
        )}

        {/* Test Print Button */}
        <button
          onClick={handleTest}
          disabled={!selectedAddress || testLoading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-semibold transition"
        >
          {testLoading ? "Testing..." : "Test Print"}
        </button>
      </div>
    </div>
  );
}