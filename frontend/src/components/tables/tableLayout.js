/**
 * Koordinat denah (pixel di canvas 720×520).
 * Sesuaikan angka x,y agar mirip sketsa client.
 * shape: "square" | "round" | "rect"
 */
export const TABLE_LAYOUT = {
  // ===== LANTAI 1 (contoh — geser angka sampai mirip foto) =====
  "L1-01": { x: 20,  y: 40,  w: 60, h: 45, shape: "square" },
  "L1-02": { x: 140, y: 40,  w: 60, h: 45, shape: "square" },
  "L1-03": { x: 140, y: 100,  w: 60, h:45, shape: "square" },
  "L1-04": { x: 20, y: 130,  w: 60, h: 45, shape: "square" },
  "L1-05": { x: 140, y: 160,  w: 60, h: 45, shape: "square" },
  "L1-06": { x: 310,  y: 40, w: 85, h: 50, shape: "square" },
  "L1-07": { x: 230, y: 40, w: 56, h: 56, shape: "square" },
  "L1-08": { x: 230, y: 100, w: 56, h: 56, shape: "square" },
  "L1-09": { x: 310, y: 120, w: 85, h: 50, shape: "square" },
  "L1-10": { x: 420, y: 50, w: 56, h: 56, shape: "square" },
  "L1-11": { x: 420,  y: 120, w: 56, h: 56, shape: "square" },
  "L1-12": { x: 350, y: 190, w: 56, h: 56, shape: "square" },
  "L1-13": { x: 440, y: 190, w: 56, h: 56, shape: "square" },
  "L1-14": { x: 540, y: 120, w: 120, h: 56, shape: "square" },
  "L1-15": { x: 360, y: 290, w: 56, h: 70, shape: "square" },
  "L1-16": { x: 360,  y: 400, w: 56, h: 70, shape: "square" },
  "L1-17": { x: 480, y: 400, w: 56, h: 70, shape: "square" },
  "L1-18": { x: 480, y: 290, w: 56, h: 70, shape: "square" },
  "L1-19": { x: 580, y: 290, w: 56, h: 70, shape: "rect" },
  "L1-20": { x: 580, y: 400, w: 56, h: 70, shape: "rect" },
  "L1-21": { x: 230, y: 160, w: 56, h: 60, shape: "rect" },

  // ===== LANTAI 2 =====
  "L2-01": { x: 80,  y: 40,  w: 100, h: 55, shape: "square" },
  "L2-02": { x: 300, y: 30,  w: 58, h: 50, shape: "square" },
  "L2-03": { x: 470, y: 40,  w: 58, h: 50, shape: "square" },
  "L2-04": { x: 260, y: 85,  w: 50, h: 50, shape: "round" },
  "L2-05": { x: 260, y: 140,  w: 50, h: 50, shape: "round" },
  "L2-06": { x: 260,  y: 195, w: 50, h: 50, shape: "round" },
  "L2-07": { x: 340, y: 85, w: 58, h: 50, shape: "square" },
  "L2-08": { x: 470, y: 100, w: 58, h: 70, shape: "square" },
  "L2-09": { x: 340, y: 140, w: 58, h: 50, shape: "rect" },
  "L2-10": { x: 470, y: 180, w: 58, h: 50, shape: "rect" },
  "L2-11": { x: 405,  y: 180, w: 56, h: 56, shape: "square" },
  "L2-12": { x: 340, y: 195, w: 58, h: 50, shape: "square" },
  "L2-13": { x: 50, y: 280, w: 60, h: 80, shape: "square" },
  "L2-14": { x: 50, y: 380, w: 80, h: 60, shape: "square" },
  "L2-15": { x: 180, y: 280, w: 56, h: 56, shape: "square" },
  "L2-16": { x: 180, y: 360, w: 80, h: 60, shape: "rect" },
  "L2-17": { x: 280, y: 360, w: 80, h: 60, shape: "rect" },
};
export const LABELS = {
  1: [
    { text: "gerbang depan", x: 100, y: 220 },
    { text: "kadang burung", x: 550, y: 40 },
    { text: "Kasir", x: 90, y: 300 },
    { text: "Tangga", x: 670, y: 100 },
  ],
  2: [
    { text: "Tangga Lantai 2", x: 40, y: 14 },
    { text: "Balkon", x: 400, y: 14 },
  ],
}

// di drawBackground:
