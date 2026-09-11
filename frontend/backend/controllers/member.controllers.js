const userService = require("../services/user.service");

// List semua member -- untuk admin lihat data pelanggan
exports.getAll = async (req, res, next) => {
    try {
        const data = await userService.findByRole("member");
        const safe = data.map(({ password, ...rest }) => rest);
        res.json({ success: true, data: safe });
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const data = await userService.findById(req.params.id);
        if (!data || data.role !== "member") {
            return res.status(404).json({ success: false, message: "Member tidak ditemukan." });
        }
        const { password, ...safe } = data;
        res.json({ success: true, data: safe });
    } catch (err) {
        next(err);
    }
};

// Tambah/kurangi poin member. Dipanggil otomatis dari transaction.service setelah checkout,
// atau manual oleh admin (misal: kompensasi, promo).
exports.adjustPoints = async (req, res, next) => {
    try {
        const { delta } = req.body;
        if (typeof delta !== "number") {
            return res.status(400).json({ success: false, message: "delta (number) wajib diisi." });
        }
        const data = await userService.adjustPoints(req.params.id, delta);
        if (!data) {
            return res.status(404).json({ success: false, message: "Member tidak ditemukan." });
        }
        res.json({ success: true, message: "Poin berhasil diperbarui.", data });
    } catch (err) {
        next(err);
    }
};
