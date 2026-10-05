import { useEffect, useState, useMemo } from "react";
import { RefreshCw, Armchair, AlertCircle } from "lucide-react";
import tablesApi from "../../api/tables.api";
import TableFloorPlan from "../../components/tables/TableFloorPlan";

export default function TableSelect({ onSelectTable }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [floor, setFloor] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await tablesApi.getAll();
      setTables(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat meja.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (t.lantai != null && Number(t.lantai) === Number(floor)) return true;
      const kode = (t.kode || "").toUpperCase();
      if (floor === 1) {
        return (
          kode.startsWith("L1-") ||
          kode.startsWith("M") ||
          (!kode.startsWith("L2-") && t.lantai == null)
        );
      }
      if (floor === 2) return kode.startsWith("L2-");
      return false;
    });
  }, [tables, floor]);

  const handleSelect = (table) => {
    if (!table) return;
    setSelectedId(table.id);
    onSelectTable?.(table);
  };

  const handleClear = async (e, table) => {
    e.stopPropagation();
    if (!window.confirm(`Kosongkan ${table.nama}?`)) return;
    setBusyId(table.id);
    try {
      await tablesApi.setStatus(table.id, "available");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengosongkan meja.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-61px)]">
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-emerald-600" />
            Pilih Meja
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih lantai, lalu pilih meja untuk mulai order.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-60"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Perbarui
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Tab lantai */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFloor(1)}
            className={
              floor === 1
                ? "bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                : "bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
            }
          >
            Lantai 1
          </button>
          <button
            type="button"
            onClick={() => setFloor(2)}
            className={
              floor === 2
                ? "bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                : "bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
            }
          >
            Lantai 2
          </button>
        </div>

        {/* Denah canvas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3">
          <TableFloorPlan
            tables={tables}
            floor={floor}
            selectedId={selectedId}
            onSelectTable={handleSelect}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" /> Tersedia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" /> Terisi
          </span>
          <span className="text-slate-400">
            {filteredTables.length} meja di lantai {floor}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* List meja (cadangan / detail) */}
        {loading ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Memuat meja...
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm text-center">
            Belum ada meja di Lantai {floor}.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTables.map((table) => {
              const occupied = table.status === "occupied";
              const isSelected = selectedId === table.id;
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => handleSelect(table)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-slate-900 ring-2 ring-slate-900/20"
                      : occupied
                        ? "bg-amber-50 border-amber-300 hover:border-amber-500"
                        : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {table.nama}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {table.kode || "-"} · {table.kapasitas || "-"} org
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        occupied
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {occupied ? "Terisi" : "Tersedia"}
                    </span>
                  </div>

                  {occupied && (
                    <button
                      type="button"
                      disabled={busyId === table.id}
                      onClick={(e) => handleClear(e, table)}
                      className="mt-3 w-full py-1.5 text-[11px] font-semibold rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyId === table.id ? "..." : "Kosongkan Meja"}
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}