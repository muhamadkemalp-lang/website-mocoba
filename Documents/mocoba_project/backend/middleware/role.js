// Batasi akses berdasarkan role. Contoh pemakaian:
// router.post("/", verifyToken, checkRole("admin"), controller.create);
function checkRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Belum login.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak punya akses untuk aksi ini.",
            });
        }

        next();
    };
}

module.exports = { checkRole };
