const { validationResult } = require("express-validator");

// Dipasang setelah aturan express-validator di route, sebelum controller.
// Contoh: router.post("/", [body("nama").notEmpty()], validate, controller.create)
function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Data tidak valid.",
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }

    next();
}

module.exports = validate;
