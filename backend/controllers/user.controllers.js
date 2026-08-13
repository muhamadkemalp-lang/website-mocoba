const bcrypt = require("bcryptjs");
const userService = require("../services/user.service");

// List semua staff (admin & kasir) -- hanya admin
exports.getStaff = async (req, res, next) => {
    try {
        const admins = await userService.findByRole("admin");
        const kasir = await userService.findByRole("kasir");
        res.json({ success: true, data: [...admins, ...kasir] });
    } catch (err) {
        next(err);
    }
};

// Admin membuat akun staff baru (admin atau kasir)
exports.createStaff = async (req, res, next) => {
    try {
        const { nama, email, password, role } = req.body;

        if (!nama || !email || !password || !["admin", "kasir"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "nama, email, password, dan role ('admin'/'kasir') wajib diisi.",
            });
        }

        const existing = await userService.findByEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, message: "Email sudah terdaftar." });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await userService.createUser({ nama, email, password: hashed, role });
        const { password: _, ...safeUser } = user;

        res.status(201).json({ success: true, message: "Akun staff berhasil dibuat.", data: safeUser });
    } catch (err) {
        next(err);
    }
};

exports.updateStaff = async (req, res, next) => {
    try {
        const { nama, email, role } = req.body;
        const data = await userService.updateUser(req.params.id, { nama, email, role });
        if (!data) {
            return res.status(404).json({ success: false, message: "Staff tidak ditemukan." });
        }
        const { password, ...safeUser } = data;
        res.json({ success: true, message: "Berhasil diperbarui.", data: safeUser });
    } catch (err) {
        next(err);
    }
};

exports.deleteStaff = async (req, res, next) => {
    try {
        const ok = await userService.deleteUser(req.params.id);
        if (!ok) {
            return res.status(404).json({ success: false, message: "Staff tidak ditemukan." });
        }
        res.json({ success: true, message: "Berhasil dihapus." });
    } catch (err) {
        next(err);
    }
};
