const authService = require("../services/auth.service");
const userService = require("../services/user.service");

exports.register = async (req, res, next) => {
    try {
        const { nama, email, password } = req.body;
        if (!nama || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "nama, email, dan password wajib diisi.",
            });
        }

        const result = await authService.register({ nama, email, password, role: "member" });

        res.status(201).json({
            success: true,
            message: "Register berhasil.",
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email dan password wajib diisi.",
            });
        }

        const result = await authService.login({ email, password });

        res.json({
            success: true,
            message: "Login berhasil.",
            ...result,
        });
    } catch (err) {
        next(err);
    }
};

exports.profile = async (req, res, next) => {
    try {
        const user = await userService.findById(req.user.uid);
        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan." });
        }
        const { password, ...safeUser } = user;
        res.json({ success: true, data: safeUser });
    } catch (err) {
        next(err);
    }
};
