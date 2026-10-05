import { useEffect, useRef, useState } from "react";
import { TABLE_LAYOUT } from "./tableLayout";
import { LABELS } from "./tableLayout";


const STATUS_COLOR = {
  available: "#10b981", // hijau
  occupied: "#f59e0b",  // oranye
  reserved: "#6366f1",
};

export default function TableFloorPlan({
  tables = [],
  floor = 1,
  selectedId = null,
  onSelectTable,
  width = 720,
  height = 480,
})

 {
  const canvasRef = useRef(null);
  const [hoverId, setHoverId] = useState(null);

  const floorTables = tables.filter((t) => {
  if (t.lantai != null && Number(t.lantai) === Number(floor)) return true;
  const kode = (t.kode || "").toUpperCase();
  if (floor === 1) {
    return kode.startsWith("L1-") || (!kode.startsWith("L2-") && t.lantai == null);
  }
  return kode.startsWith("L2-");
});

function drawBackground(ctx, width, height, floor) {
  // dasar
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  // grid halus
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // border luar
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // garis pemisah zona (contoh lantai 1 — sesuaikan angka)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 6]);

  // vertikal: pisah kiri (meja kecil) vs kanan (meja besar)
  if (floor === 1) {
  ctx.beginPath();
  ctx.moveTo(200, 10);
  ctx.lineTo(200, height - 230);
  ctx.stroke();
// vertikal: Taman tengah - aviary
  ctx.beginPath();
  ctx.moveTo(500, 10);
  ctx.lineTo(500, height - 230);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(300, 250);
  ctx.lineTo(300, height + 50);
  ctx.stroke();

  // horizontal: zona depan / belakang
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.lineTo(width - 0, 250);
  ctx.stroke();
  } else {
    // vertikal line lantai 2
  ctx.beginPath();
  ctx.moveTo(400, 350);
  ctx.lineTo(400, height - 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(250, 100);
  ctx.lineTo(250, height - 230);
  ctx.stroke();
  //Horizontal line lantai 2
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.lineTo(width - 0, 250);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.lineTo(width - 470, 100);
  ctx.stroke();
  ctx.beginPath();

  ctx.moveTo(400, 350);
  ctx.lineTo(width - 0, 350);
  ctx.stroke();
  }
  ctx.setLineDash([]);

  (LABELS[floor] || []).forEach((lb) => {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(lb.text, lb.x, lb.y);
  });


  // label teks
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (floor === 1) {
    ctx.fillText("lorong parkir", 40, 16);
    ctx.fillText("Aviary", 580, 16);
    ctx.fillText("Taman Depan", 290, 16);
    ctx.fillText("Dekat kasir / pintu", 40, height - 28);
    ctx.fillText("Lantai 1", width - 70, height - 28);
  } else {
    ctx.fillText("Area DJ", 40, 160);
    ctx.fillText("Lantai 2", width - 70, height - 28);
  }
}
  // Posisi: pakai x,y dari DB atau auto-grid
 function layoutOf(table, index) {
  const kode = (table.kode || "").toUpperCase();
  const fixed = TABLE_LAYOUT[kode];

  if (fixed) {
    return {
      x: fixed.x,
      y: fixed.y,
      w: fixed.w,
      h: fixed.h,
      shape: fixed.shape || "square",
    };
  }

  // fallback grid
  const cols = 5;
  const gap = 16;
  const w = 56;
  const h = 56;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: 40 + col * (w + gap),
    y: 40 + row * (h + gap),
    w,
    h,
    shape: "square",
  };
}


  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, floor);

    floorTables.forEach((table, i) => {
      const { x, y, w, h, shape } = layoutOf(table, i);
      const status = table.status || "available";
      const isSelected = table.id === selectedId;
      const isHover = table.id === hoverId;

      ctx.fillStyle = STATUS_COLOR[status] || STATUS_COLOR.available;
      ctx.globalAlpha = isHover || isSelected ? 1 : 0.9;

      ctx.beginPath();
      if (shape === "round") {
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.roundRect(x, y, w, h, 10);
      }
      ctx.fill();

      if (isSelected) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0f172a";
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = table.kode || table.nama || `M${i + 1}`;
      ctx.fillText(label, x + w / 2, y + h / 2);
    });
  }, [floorTables, selectedId, hoverId, width, height, floor]);

  function hitTest(mx, my) {
    for (let i = 0; i < floorTables.length; i++) {
      const table = floorTables[i];
      const { x, y, w, h } = layoutOf(table, i);
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) return table;
    }
    return null;
  }

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 cursor-pointer"
      onClick={(e) => {
        const { x, y } = getPos(e);
        const table = hitTest(x, y);
        if (table && onSelectTable) onSelectTable(table);
      }}
      onMouseMove={(e) => {
        const { x, y } = getPos(e);
        const table = hitTest(x, y);
        setHoverId(table?.id || null);
      }}
      onMouseLeave={() => setHoverId(null)}
    />
  );
}